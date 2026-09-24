import "dotenv/config";
import { randomUUID } from "node:crypto";

import { NextRequest } from "next/server";
import { expect, test, vi } from "vitest";

import { POST } from "@/app/api/inquiries/route";
import { PATCH } from "@/app/api/settings/route";
import { readCatalog } from "@/lib/catalog-database";
import { prisma } from "@/lib/prisma";
import { createWholesaleSession, wholesaleCookie } from "@/lib/wholesale-auth";
vi.mock("@/lib/admin-session", () => ({
  isAdminAuthenticated: async () => true,
}));

test("Solo las cuentas aprobadas consultan con precios mayoristas del servidor", async () => {
  if (
    !["localhost", "127.0.0.1", "[::1]"].includes(
      new URL(process.env.DATABASE_URL ?? "").hostname,
    )
  )
    throw new Error("Se requiere base local.");
  const key = randomUUID();
  let productId: string | undefined;
  let accountId: string | undefined;
  const keys: string[] = [];
  const previousSettings = await prisma.siteSettings.findUnique({
    where: { id: "store" },
  });
  try {
    for (const value of ["-1", "1.234", "abc", "10000000000"]) {
      const response = await PATCH(
        new NextRequest("http://localhost:3000/api/settings", {
          method: "PATCH",
          headers: {
            Origin: "http://localhost:3000",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ wholesaleMinimum: value }),
        }),
      );
      expect(response.status).toBe(400);
    }
    const saved = await PATCH(
      new NextRequest("http://localhost:3000/api/settings", {
        method: "PATCH",
        headers: {
          Origin: "http://localhost:3000",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ wholesaleMinimum: "120.01" }),
      }),
    );
    expect(saved.status).toBe(200);
    expect(
      (
        await prisma.siteSettings.findUniqueOrThrow({ where: { id: "store" } })
      ).wholesaleMinimum.toNumber(),
    ).toBe(120.01);
    await prisma.siteSettings.upsert({
      where: { id: "store" },
      create: { id: "store", wholesaleMinimum: 0 },
      update: { wholesaleMinimum: 0 },
    });
    const product = await prisma.product.create({
      data: {
        name: "Wholesale test",
        slug: key,
        description: "Test",
        variants: {
          create: {
            name: "Standard",
            sku: key,
            stock: 10,
            price: 100,
            compareAtPrice: 120,
            wholesalePrice: 60,
            wholesaleCompareAtPrice: 80,
          },
        },
      },
      include: { variants: true },
    });
    productId = product.id;
    const variantId = product.variants[0].id;
    const account = await prisma.wholesaleAccount.create({
      data: {
        name: "Test",
        business: "Business",
        phone: "1155550000",
        email: `${key}@example.com`,
        passwordHash: "unused",
      },
    });
    accountId = account.id;
    const token = await createWholesaleSession(account.id);
    async function submit(purchaseType: string, authenticated = true) {
      const idempotencyKey = randomUUID();
      keys.push(idempotencyKey);
      return POST(
        new NextRequest("http://localhost:3000/api/inquiries", {
          method: "POST",
          headers: {
            Origin: "http://localhost:3000",
            "Content-Type": "application/json",
            ...(authenticated ? { Cookie: `${wholesaleCookie}=${token}` } : {}),
          },
          body: JSON.stringify({
            purchaseType,
            idempotencyKey,
            customer: {
              name: "Test",
              phone: "1155550000",
              business: "Forged business",
              comment: "",
            },
            items: [{ variantId, quantity: 2, price: 1 }],
          }),
        }),
      );
    }
    expect((await submit("WHOLESALE", false)).status).toBe(403);
    expect((await submit("WHOLESALE")).status).toBe(403);
    expect((await submit("RETAIL", false)).status).toBe(200);
    await prisma.wholesaleAccount.update({
      where: { id: account.id },
      data: { status: "APPROVED" },
    });
    const retail = (await readCatalog()).products.find(
      (p) => p.id === productId,
    )!;
    const wholesale = (await readCatalog("WHOLESALE")).products.find(
      (p) => p.id === productId,
    )!;
    expect(retail.price).toBe(100);
    expect(wholesale.price).toBe(60);
    expect(wholesale.compareAtPrice).toBe(80);
    expect(JSON.stringify(retail)).not.toContain("wholesale");
    expect((await submit("RETAIL")).status).toBe(403);
    expect((await submit("WHOLESALE")).status).toBe(200);
    const order = await prisma.order.findUniqueOrThrow({
      where: { idempotencyKey: keys.at(-1)! },
      include: { items: true },
    });
    expect(order.wholesaleAccountId).toBe(account.id);
    expect(order.businessName).toBe("Business");
    expect(order.estimatedTotal?.toNumber()).toBe(120);
    expect(order.items[0].unitPrice?.toNumber()).toBe(60);
    expect(
      (
        await prisma.productVariant.findUniqueOrThrow({
          where: { id: variantId },
        })
      ).stock,
    ).toBe(10);
    await prisma.siteSettings.update({
      where: { id: "store" },
      data: { wholesaleMinimumUnits: 3 },
    });
    expect((await submit("WHOLESALE")).status).toBe(400);
    expect((await submit("RETAIL", false)).status).toBe(200);
    await prisma.siteSettings.update({
      where: { id: "store" },
      data: { wholesaleMinimumUnits: 2 },
    });
    expect((await submit("WHOLESALE")).status).toBe(200);
    await prisma.siteSettings.update({
      where: { id: "store" },
      data: { wholesaleMinimum: 120.01 },
    });
    const below = await submit("WHOLESALE");
    expect(below.status).toBe(400);
    expect((await below.json()).error).toContain("120.01");
    expect(
      await prisma.order.findUnique({
        where: { idempotencyKey: keys.at(-1)! },
      }),
    ).toBeNull();
    expect((await submit("RETAIL", false)).status).toBe(200);
    await prisma.siteSettings.update({
      where: { id: "store" },
      data: { wholesaleMinimum: 120 },
    });
    expect((await submit("WHOLESALE")).status).toBe(200);
    await prisma.productVariant.update({
      where: { id: variantId },
      data: { wholesalePrice: null },
    });
    expect(
      (await readCatalog("WHOLESALE")).products.find((p) => p.id === productId)!
        .price,
    ).toBeNull();
    expect((await submit("WHOLESALE")).status).toBe(400);
    await prisma.siteSettings.update({
      where: { id: "store" },
      data: { wholesaleMinimum: 0 },
    });
    expect((await submit("WHOLESALE")).status).toBe(200);
    expect(
      (
        await prisma.order.findUniqueOrThrow({
          where: { idempotencyKey: keys.at(-1)! },
        })
      ).estimatedTotal,
    ).toBeNull();
    await prisma.wholesaleAccount.update({
      where: { id: account.id },
      data: { status: "REJECTED" },
    });
    expect((await submit("WHOLESALE")).status).toBe(403);
  } finally {
    if (previousSettings)
      await prisma.siteSettings.update({
        where: { id: "store" },
        data: {
          wholesaleMinimum: previousSettings.wholesaleMinimum,
          wholesaleMinimumUnits: previousSettings.wholesaleMinimumUnits,
        },
      });
    else await prisma.siteSettings.deleteMany({ where: { id: "store" } });
    await prisma.order.deleteMany({ where: { idempotencyKey: { in: keys } } });
    if (productId) await prisma.product.delete({ where: { id: productId } });
    if (accountId)
      await prisma.wholesaleAccount.delete({ where: { id: accountId } });
    await prisma.$disconnect();
  }
});
