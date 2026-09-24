import { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";

import { adminModels, type AdminRecord } from "@/components/admin/adminModels";
import {
  adminDelegate,
  AdminValidationError,
  readAdminData,
  writableFields,
} from "@/lib/admin-database";
import { isAdminAuthenticated } from "@/lib/admin-session";
import {
  requireCategoryCanBeRemoved,
  requirePublishedProductCategory,
} from "@/lib/catalog-categories";
import { applyOrderStatus } from "@/lib/complete-order";
import { prisma } from "@/lib/prisma";
import { resolveVariantSku } from "@/lib/variant-sku";
export async function GET() {
  if (!(await isAdminAuthenticated()))
    return Response.json(
      { error: "La sesión venció. Volvé a ingresar." },
      { status: 401 },
    );
  try {
    return Response.json(await readAdminData(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json(
      { error: "No se pudo conectar con la base de datos." },
      { status: 503 },
    );
  }
}
async function mutate(req: NextRequest) {
  if (!(await isAdminAuthenticated()))
    return Response.json(
      { error: "La sesión venció. Volvé a ingresar." },
      { status: 401 },
    );
  if (req.headers.get("origin") !== req.nextUrl.origin)
    return Response.json({ error: "Origen no permitido." }, { status: 403 });
  try {
    const body = await req.json();
    const model = adminModels.find((item) => item.name === body.model);
    if (
      !model ||
      ![
        "Product",
        "Category",
        "ProductVariant",
        "ProductImage",
        "Order",
      ].includes(model.name)
    )
      return Response.json({ error: "Modelo no permitido." }, { status: 400 });
    return await prisma.$transaction(
      async (tx) => {
        const delegate = adminDelegate(model.name, tx);
        if (
          req.method !== "POST" &&
          (typeof body.record?.id !== "string" || !body.record.id)
        )
          return Response.json(
            { error: "Falta el registro." },
            { status: 400 },
          );
        let id = body.record?.id;
        if (req.method === "DELETE") {
          if (model.name === "Order")
            return Response.json(
              { error: "Las consultas se conservan como historial." },
              { status: 400 },
            );
          if (model.name === "Category")
            await requireCategoryCanBeRemoved(tx, id);
          await delegate.delete({ where: { id } });
        } else {
          if (!body.record || typeof body.record !== "object")
            return Response.json(
              { error: "Datos inválidos." },
              { status: 400 },
            );
          if (model.name === "ProductVariant") {
            const previous =
              req.method === "POST"
                ? null
                : await tx.productVariant.findUniqueOrThrow({ where: { id } });
            body.record.sku = await resolveVariantSku(
              tx,
              body.record.sku,
              previous?.sku,
            );
          }
          const data = writableFields(model.name, body.record as AdminRecord);
          if (model.name === "Order" && req.method !== "POST")
            await applyOrderStatus(tx, id, data);
          if (
            model.name === "Category" &&
            req.method !== "POST" &&
            data.active === false
          )
            await requireCategoryCanBeRemoved(tx, id);
          if (req.method === "POST") {
            if (model.name === "Order")
              return Response.json(
                { error: "Las consultas se crean desde el sitio." },
                { status: 400 },
              );
            if (model.name === "Product" && data.categories)
              data.categories = {
                connect: (
                  data.categories as {
                    set: {
                      id: string;
                    }[];
                  }
                ).set,
              };
            id = (await delegate.create({ data })).id;
          } else if (
            model.name === "ProductImage" &&
            body.record.primary === true
          ) {
            {
              const image = await tx.productImage.findUniqueOrThrow({
                where: { id },
              });
              const siblings = await tx.productImage.findMany({
                where: { productId: image.productId, id: { not: id } },
                orderBy: { sortOrder: "asc" },
              });
              for (const [sortOrder, entry] of [image, ...siblings].entries())
                await tx.productImage.update({
                  where: { id: entry.id },
                  data: { sortOrder },
                });
            }
          } else await delegate.update({ where: { id }, data });
        }
        if (model.name === "Product" && req.method !== "DELETE")
          await requirePublishedProductCategory(tx, id);
        return Response.json({ id });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2034"
    )
      return Response.json(
        {
          error:
            "Los datos cambiaron mientras confirmabas, posiblemente por otra venta. No se guardó esta operación. Revisá el stock actual antes de reintentar.",
        },
        { status: 409 },
      );
    if (error instanceof AdminValidationError)
      return Response.json({ error: error.message }, { status: 400 });
    if (error instanceof Prisma.PrismaClientKnownRequestError)
      return Response.json(
        {
          error:
            error.code === "P2002"
              ? "Ese código o slug ya está en uso."
              : error.code === "P2025"
                ? "El registro ya no existe."
                : "No se pudo guardar. Revisá los datos relacionados.",
        },
        { status: 400 },
      );
    return Response.json(
      {
        error:
          error instanceof Error &&
          !(error instanceof Prisma.PrismaClientInitializationError)
            ? "No se pudo guardar. Revisá los campos y la conexión."
            : "La base de datos no está disponible.",
      },
      { status: 400 },
    );
  }
}
export const POST = mutate;
export const PATCH = mutate;
export const DELETE = mutate;
