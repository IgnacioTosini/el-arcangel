import { AdminValidationError } from "./admin-database";

import type { Prisma } from "@prisma/client";

export async function resolveVariantSku(
  tx: Prisma.TransactionClient,
  value: unknown,
  previous?: string,
  reserved: Set<string> = new Set(),
) {
  if (value !== undefined && value !== null && typeof value !== "string")
    throw new AdminValidationError("El SKU debe ser un texto.");
  const manual = typeof value === "string" ? value.trim() : "";
  if (manual) return manual;
  if (previous) return previous;
  for (;;) {
    const [row] = await tx.$queryRaw<
      { number: bigint }[]
    >`SELECT nextval('variant_sku_seq') AS number`;
    const sku = `ARC-${String(row.number).padStart(6, "0")}`;
    if (
      !reserved.has(sku) &&
      !(await tx.productVariant.findUnique({
        where: { sku },
        select: { id: true },
      }))
    )
      return sku;
  }
}
