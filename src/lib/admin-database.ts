import {
  type AdminData,
  adminModels,
  type AdminRecord,
  type ModelName,
} from "@/components/admin/adminModels";

import { prisma } from "./prisma";

import type { Prisma } from "@prisma/client";
export class AdminValidationError extends Error {}
// Adapta relaciones, importes Decimal y fechas al formato de los formularios.
export async function readAdminData(): Promise<AdminData> {
  const [Category, products, variants, ProductImage, orders, items] =
    await Promise.all([
      prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.product.findMany({
        include: { categories: { select: { id: true } } },
      }),
      prisma.productVariant.findMany(),
      prisma.productImage.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.order.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.orderItem.findMany(),
    ]);
  const ProductVariant = variants.map((row) => ({
    ...row,
    price: row.price?.toNumber() ?? null,
    compareAtPrice: row.compareAtPrice?.toNumber() ?? null,
    wholesalePrice: row.wholesalePrice?.toNumber() ?? null,
    wholesaleCompareAtPrice: row.wholesaleCompareAtPrice?.toNumber() ?? null,
  }));
  const Order = orders.map((row) => ({
    ...row,
    estimatedTotal: row.estimatedTotal?.toNumber() ?? null,
    finalTotal: row.finalTotal?.toNumber() ?? null,
  }));
  const OrderItem = items.map((row) => ({
    ...row,
    unitPrice: row.unitPrice?.toNumber() ?? null,
  }));
  const Product = products.map(({ categories, ...product }) => ({
    ...product,
    categoryIds: categories.map((category) => category.id).join(","),
  }));
  return JSON.parse(
    JSON.stringify({
      Category,
      Product,
      ProductVariant,
      ProductImage,
      Order,
      OrderItem,
      Cart: [],
      CartItem: [],
    }),
  ) as AdminData;
}
// PATCH solo modifica los campos presentes; nunca acepta IDs o fechas del sistema.
export function writableFields(model: ModelName, record: AdminRecord) {
  const fields = adminModels.find((item) => item.name === model)!.fields;
  const result: Record<string, unknown> = {};
  for (const field of fields) {
    if (field.readonly || !(field.name in record)) continue;
    const value = record[field.name];
    if (value === null && !field.required) {
      result[field.name] = null;
      continue;
    }
    if (field.type === "Boolean" && typeof value !== "boolean")
      throw new AdminValidationError("Campo booleano inválido.");
    if (["Int", "Decimal"].includes(field.type)) {
      if (typeof value !== "number")
        throw new AdminValidationError("Número inválido.");
      const number = value;
      if (
        !Number.isFinite(number) ||
        number < 0 ||
        (field.type === "Int" && !Number.isSafeInteger(number))
      )
        throw new AdminValidationError("Importe o cantidad inválidos.");
      if (field.name === "quantity" && number < 1)
        throw new AdminValidationError("La cantidad mínima es 1.");
      result[field.name] = number;
      continue;
    }
    if (
      field.type === "String" &&
      (typeof value !== "string" || (field.required && !value.trim()))
    )
      throw new AdminValidationError(`Completá ${field.name}.`);
    if (
      field.name === "slug" &&
      (typeof value !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value))
    )
      throw new AdminValidationError("Slug inválido.");
    if (field.options && !field.options.includes(String(value)))
      throw new AdminValidationError("Opción inválida.");
    if (field.type === "DateTime") {
      const date = new Date(String(value));
      if (!Number.isFinite(date.getTime()))
        throw new AdminValidationError("Fecha inválida.");
      result[field.name] = date;
      continue;
    }
    result[field.name] = value;
  }
  if (model === "Product" && "categoryIds" in record)
    result.categories = {
      set: String(record.categoryIds ?? "")
        .split(",")
        .filter(Boolean)
        .map((id) => ({ id })),
    };
  if (model === "Order" && result.status)
    result.completedAt =
      result.status === "COMPLETED" ? result.completedAt || new Date() : null;
  return result;
}
type Delegate = {
  create(args: { data: unknown }): Promise<{
    id: string;
  }>;
  update(args: {
    where: {
      id: string;
    };
    data: unknown;
  }): Promise<unknown>;
  delete(args: {
    where: {
      id: string;
    };
  }): Promise<unknown>;
};
export function adminDelegate(
  model: ModelName,
  db: Prisma.TransactionClient = prisma,
): Delegate {
  const delegates = {
    Category: db.category,
    Product: db.product,
    ProductVariant: db.productVariant,
    ProductImage: db.productImage,
    Order: db.order,
  };
  if (!(model in delegates))
    throw new AdminValidationError("Operación no disponible para este modelo.");
  return delegates[model as keyof typeof delegates] as unknown as Delegate;
}
