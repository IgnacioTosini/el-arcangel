import { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";

import { customerDetailsError } from "@/lib/customer-validation";
import { prisma } from "@/lib/prisma";
import { readWholesaleSession, wholesaleCookie } from "@/lib/wholesale-auth";
class MinimumOrderError extends Error {}
export async function POST(req: NextRequest) {
  if (req.headers.get("origin") !== req.nextUrl.origin)
    return Response.json({ error: "Origen no permitido." }, { status: 403 });
  try {
    const body = await req.json();
    const account = await readWholesaleSession(
      req.cookies.get(wholesaleCookie)?.value,
    );
    const purchaseType =
      account?.status === "APPROVED" ? "WHOLESALE" : "RETAIL";
    if (body.purchaseType !== purchaseType)
      return Response.json(
        {
          error:
            "Tu modalidad de compra cambió. Recargá la consulta. Los precios mayoristas requieren una cuenta aprobada.",
        },
        { status: 403 },
      );
    const customer = body.customer;
    if (
      !customer ||
      typeof customer.name !== "string" ||
      typeof customer.phone !== "string" ||
      customerDetailsError(customer)
    )
      return Response.json(
        { error: "Completá tu nombre y un teléfono de contacto válido." },
        { status: 400 },
      );
    if (
      typeof customer.business !== "string" ||
      customer.business.length > 160 ||
      typeof customer.comment !== "string" ||
      customer.comment.length > 2000 ||
      !["RETAIL", "WHOLESALE"].includes(body.purchaseType) ||
      typeof body.idempotencyKey !== "string" ||
      !/^[0-9a-f-]{36}$/.test(body.idempotencyKey)
    )
      throw new Error();
    if (
      !Array.isArray(body.items) ||
      !body.items.length ||
      body.items.length > 100 ||
      body.items.some(
        (item: { variantId: unknown; quantity: unknown }) =>
          typeof item.variantId !== "string" ||
          !Number.isSafeInteger(item.quantity) ||
          Number(item.quantity) < 1 ||
          Number(item.quantity) > 999,
      )
    )
      throw new Error();
    const items = body.items as {
      variantId: string;
      quantity: number;
    }[];
    if (new Set(items.map((i) => i.variantId)).size !== items.length)
      throw new Error();
    const order = await prisma.$transaction(async (tx) => {
      if (
        purchaseType === "WHOLESALE" &&
        !(await tx.wholesaleAccount.findFirst({
          where: { id: account!.id, status: "APPROVED" },
        }))
      )
        throw new Error("Cuenta sin aprobación");
      const existing = await tx.order.findUnique({
        where: { idempotencyKey: body.idempotencyKey },
        select: { number: true },
      });
      if (existing) return existing;
      const variants = await tx.productVariant.findMany({
        where: {
          id: { in: items.map((i) => i.variantId) },
          active: true,
          product: { active: true },
        },
        include: { product: true },
      });
      if (
        variants.length !== items.length ||
        variants.some((v) => v.stock === 0)
      )
        throw new Error();
      const settings =
        purchaseType === "WHOLESALE"
          ? await tx.siteSettings.findUnique({ where: { id: "store" } })
          : null;
      if (
        purchaseType === "WHOLESALE" &&
        items.reduce((sum, item) => sum + item.quantity, 0) <
          (settings?.wholesaleMinimumUnits ?? 2)
      )
        throw new MinimumOrderError(
          `El pedido mayorista requiere al menos ${settings?.wholesaleMinimumUnits ?? 2} unidades en total.`,
        );
      let total = new Prisma.Decimal(0);
      let incomplete = false;
      const lines = items.map((item) => {
        const variant = variants.find((v) => v.id === item.variantId)!;
        const price =
          purchaseType === "WHOLESALE" ? variant.wholesalePrice : variant.price;
        if (variant.stock !== null && item.quantity > variant.stock)
          throw new Error("Stock insuficiente");
        if (price === null) incomplete = true;
        else total = total.add(price.mul(item.quantity));
        return {
          quantity: item.quantity,
          variantId: variant.id,
          productName: variant.product.name,
          variantName: variant.name,
          sku: variant.sku,
          unitPrice: price,
        };
      });
      if (settings && total.lessThan(settings.wholesaleMinimum))
        throw new MinimumOrderError(
          "El pedido no alcanza el importe m\u00ednimo mayorista de $ " +
            settings.wholesaleMinimum.toFixed(2) +
            ". Los productos sin precio no suman para alcanzar el m\u00ednimo.",
        );
      return tx.order.create({
        data: {
          wholesaleAccountId: purchaseType === "WHOLESALE" ? account!.id : null,
          idempotencyKey: body.idempotencyKey,
          customerName: customer.name.trim(),
          customerPhone: customer.phone.trim(),
          businessName: purchaseType === "WHOLESALE" ? account!.business : null,
          customerNote: customer.comment.trim() || null,
          purchaseType,
          estimatedTotal: incomplete ? null : total,
          items: { create: lines },
        },
        select: { number: true },
      });
    });
    return Response.json(order);
  } catch (error) {
    if (error instanceof MinimumOrderError)
      return Response.json({ error: error.message }, { status: 400 });
    return Response.json(
      {
        error:
          "No se pudo enviar. Revisá tus datos y la disponibilidad de los productos antes de reintentar.",
      },
      { status: 400 },
    );
  }
}
