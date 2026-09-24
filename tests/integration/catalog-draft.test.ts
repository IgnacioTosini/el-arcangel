import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

import { test } from "vitest";

import { integrationContext } from "./helpers";

import type { AdminData } from "@/components/admin/adminModels";

const { db, origin, cookie } = await integrationContext();
const owned: { products: string[]; categories: string[] } = {
  products: [],
  categories: [],
};
async function save(body: unknown, status = 200) {
  const response = await fetch(`${origin}/api/admin/catalog`, {
    method: "POST",
    headers: {
      Cookie: cookie,
      Origin: origin,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  assert.equal(response.status, status, JSON.stringify(result));
  return result as AdminData & { id: string };
}
async function snapshot(id: string) {
  const response = await fetch(`${origin}/api/admin/data`, {
    headers: { Cookie: cookie },
  });
  const data: AdminData = await response.json();
  const product = data.Product.find((item) => item.id === id);
  assert.ok(product);
  return {
    model: "Product",
    record: product,
    variants: data.ProductVariant.filter((item) => item.productId === id),
    images: data.ProductImage.filter((item) => item.productId === id),
  };
}
test("Guardado conjunto y rollback del borrador", async () => {
  const suffix = randomUUID();
  try {
    assert.equal(
      (await fetch(`${origin}/api/admin/catalog`, { method: "POST" })).status,
      401,
    );
    const category = await save({
      model: "Category",
      record: {
        id: `draft-${randomUUID()}`,
        name: `Categoría ${suffix}`,
        slug: "",
        active: true,
        sortOrder: 0,
      },
    });
    owned.categories.push(category.id);
    assert.equal(
      (await db.category.findUniqueOrThrow({ where: { id: category.id } }))
        .slug,
      `categoria-${suffix}`,
    );
    const payload = {
      model: "Product",
      record: {
        id: `draft-${randomUUID()}`,
        name: `Producto ${suffix}`,
        slug: "",
        description: "Descripción",
        active: true,
        categoryIds: category.id,
      },
      variants: [
        {
          id: `draft-${randomUUID()}`,
          name: "Única",
          sku: `TEST-${suffix}`,
          price: 123,
          active: true,
          stock: 5,
        },
      ],
      images: [
        {
          id: `draft-${randomUUID()}`,
          url: "/image-placeholder.svg",
          publicId: `test-${suffix}`,
          sortOrder: 0,
        },
      ],
    };
    await save(
      { ...payload, record: { ...payload.record, categoryIds: "" } },
      400,
    );
    const created = await save(payload);
    owned.products.push(created.id);
    const before = await snapshot(created.id);
    assert.equal(before.variants.length, 1);
    assert.equal(before.images.length, 1);
    assert.equal(before.record.categoryIds, category.id);
    await save(
      { ...before, record: { ...before.record, categoryIds: "" } },
      400,
    );
    const categoryRecord = await db.category.findUniqueOrThrow({
      where: { id: category.id },
    });
    await save(
      { model: "Category", record: { ...categoryRecord, active: false } },
      400,
    );
    const invalid = structuredClone(before);
    invalid.record.name = "No se debe guardar";
    invalid.variants[0].price = -1;
    await save(invalid, 400);
    assert.equal((await snapshot(created.id)).record.name, before.record.name);
    const edited = structuredClone(before);
    edited.record.name = "Nombre actualizado";
    edited.record.active = false;
    edited.record.categoryIds = "";
    edited.variants[0].price = 456;
    edited.images = [];
    await save(edited);
    const after = await snapshot(created.id);
    assert.equal(after.record.name, "Nombre actualizado");
    assert.equal(after.record.active, false);
    assert.equal(after.variants[0].price, 456);
    assert.equal(after.images.length, 0);
    await save(before, 409);
    const duplicate = structuredClone(payload);
    duplicate.record.slug = `otro-${suffix}`;
    await save(duplicate, 400);
    assert.equal(
      await db.product.count({ where: { slug: `otro-${suffix}` } }),
      0,
    );
    const automatic = await snapshot(created.id);
    automatic.variants.push({
      id: `draft-${randomUUID()}`,
      name: "Automatic SKU",
      sku: "",
      active: true,
    });
    await save(automatic);
    const generated = await snapshot(created.id);
    const autoVariant = generated.variants.find(
      (item) => item.name === "Automatic SKU",
    )!;
    assert.match(String(autoVariant.sku), /^ARC-[0-9]{6,}$/);
    const stableSku = autoVariant.sku;
    autoVariant.name = "Renamed";
    autoVariant.sku = "";
    await save(generated);
    assert.equal(
      (await snapshot(created.id)).variants.find(
        (item) => item.id === autoVariant.id,
      )?.sku,
      stableSku,
    );
  } finally {
    await db.product.deleteMany({ where: { id: { in: owned.products } } });
    await db.category.deleteMany({ where: { id: { in: owned.categories } } });
    await db.$disconnect();
  }
});
