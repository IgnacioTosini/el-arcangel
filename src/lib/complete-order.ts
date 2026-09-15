import type { Prisma } from '@prisma/client';
import { AdminValidationError } from './admin-database';

export async function applyOrderStatus(tx: Prisma.TransactionClient, id: string, data: Record<string, unknown>) {
    const order = await tx.order.findUniqueOrThrow({ where: { id }, include: { items: true } });
    delete data.completedAt;
    if (order.status === 'COMPLETED') {
        if (data.status && data.status !== 'COMPLETED') throw new AdminValidationError('La venta ya está completada. El stock descontado no se revierte cambiando el estado.');
        return;
    }
    if (data.status !== 'COMPLETED') return;
    if (!order.items.length) throw new AdminValidationError('No se puede completar una consulta sin artículos.');
    for (const item of order.items) {
        if (!item.variantId) throw new AdminValidationError(`La variante de “${item.productName}” fue eliminada. No se puede descontar su stock.`);
        const variant = await tx.productVariant.findUniqueOrThrow({ where: { id: item.variantId } });
        if (variant.stock === null) throw new AdminValidationError(`Cargá el stock de “${item.productName} | ${item.variantName}” antes de completar la venta. Su disponibilidad está sin confirmar.`);
        const updated = await tx.productVariant.updateMany({
            where: { id: variant.id, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
        });
        if (!updated.count) throw new AdminValidationError(`Stock insuficiente para “${item.productName} | ${item.variantName}”. Revisá las existencias antes de completar la venta.`);
    }
    data.completedAt = new Date();
}
