import "dotenv/config";
import { randomUUID } from "node:crypto";

import { expect, test } from "vitest";

import { readAdminData, writableFields } from "@/lib/admin-database";
import { readCatalog } from "@/lib/catalog-database";
import { prisma } from "@/lib/prisma";

test("Precios mayoristas independientes, opcionales y privados", async () => {
  if (
    !["localhost", "127.0.0.1", "[::1]"].includes(
      new URL(process.env.DATABASE_URL ?? "").hostname,
    )
  )
    throw new Error("Esta prueba requiere PostgreSQL local.");
  const key = randomUUID();
  let id: string | undefined;
  try {
    const product = await prisma.product.create({
      data: {
        name: "Prueba precios",
        slug: `test-prices-${key}`,
        description: "Prueba temporal",
        variants: {
          create: {
            name: "Única",
            sku: key,
            price: 100,
            compareAtPrice: 120,
            stock: 10,
          },
        },
      },
      include: { variants: true },
    });
    id = product.id;
    const variant = product.variants[0];
    expect(variant.wholesalePrice).toBeNull();
    const fields = writableFields("ProductVariant", {
      id: variant.id,
      wholesalePrice: 70.5,
      wholesaleCompareAtPrice: 90,
    });
    await prisma.productVariant.update({
      where: { id: variant.id },
      data: fields,
    });
    const admin = (await readAdminData()).ProductVariant.find(
      (item) => item.id === variant.id,
    )!;
    expect(admin.price).toBe(100);
    expect(admin.compareAtPrice).toBe(120);
    expect(admin.wholesalePrice).toBe(70.5);
    expect(admin.wholesaleCompareAtPrice).toBe(90);
    const publicProduct = (await readCatalog()).products.find(
      (item) => item.id === id,
    )!;
    expect(JSON.stringify(publicProduct)).not.toContain("wholesale");
    expect(publicProduct.price).toBe(100);
    expect(() =>
      writableFields("ProductVariant", { id: variant.id, wholesalePrice: -1 }),
    ).toThrow();
    await prisma.productVariant.update({
      where: { id: variant.id },
      data: writableFields("ProductVariant", {
        id: variant.id,
        wholesalePrice: null,
        wholesaleCompareAtPrice: null,
      }),
    });
    expect(
      (
        await prisma.productVariant.findUniqueOrThrow({
          where: { id: variant.id },
        })
      ).wholesalePrice,
    ).toBeNull();
  } finally {
    if (id) await prisma.product.delete({ where: { id } });
    await prisma.$disconnect();
  }
});
