import type { Prisma } from '@prisma/client';
import { AdminValidationError } from './admin-database';

export async function requirePublishedProductCategory(tx: Prisma.TransactionClient, id: string) {
    const invalid = await tx.product.findFirst({
        where: { id, active: true, categories: { none: { active: true } } },
        select: { id: true },
    });
    if (invalid) throw new AdminValidationError('Para publicar el producto, asignale al menos una categoría activa. También podés guardarlo oculto.');
}

export async function requireCategoryCanBeRemoved(tx: Prisma.TransactionClient, id: string) {
    const affected = await tx.product.findFirst({
        where: { active: true, AND: [
            { categories: { some: { id } } },
            { categories: { none: { active: true, id: { not: id } } } },
        ] },
        select: { name: true },
    });
    if (affected) throw new AdminValidationError(`No podés eliminar ni desactivar esta categoría: “${affected.name}” quedaría visible sin categoría activa. Asignale otra categoría activa u ocultá el producto primero.`);
}
