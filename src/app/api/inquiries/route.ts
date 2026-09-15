import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
export async function POST(req: NextRequest) {
    if (req.headers.get('origin') !== req.nextUrl.origin)
        return Response.json({ error: 'Origen no permitido.' }, { status: 403 });
    try {
        const body = await req.json();
        const customer = body.customer;
        if (!customer || typeof customer.name !== 'string' || !customer.name.trim() || customer.name.length > 120 || typeof customer.phone !== 'string' || !/^[+\d ()-]{8,30}$/.test(customer.phone) || customer.phone.replace(/\D/g, '').length < 8)
            return Response.json({ error: 'Completá tu nombre y un teléfono de contacto válido.' }, { status: 400 });
        if (typeof customer.business !== 'string' || customer.business.length > 160 || typeof customer.comment !== 'string' || customer.comment.length > 2000 || !['RETAIL', 'WHOLESALE'].includes(body.purchaseType) || typeof body.idempotencyKey !== 'string' || !/^[0-9a-f-]{36}$/.test(body.idempotencyKey))
            throw new Error();
        if (!Array.isArray(body.items) || !body.items.length || body.items.length > 100 || body.items.some((item: {
            variantId: unknown;
            quantity: unknown;
        }) => typeof item.variantId !== 'string' || !Number.isSafeInteger(item.quantity) || Number(item.quantity) < 1 || Number(item.quantity) > 999))
            throw new Error();
        const items = body.items as {
            variantId: string;
            quantity: number;
        }[];
        if (new Set(items.map(i => i.variantId)).size !== items.length)
            throw new Error();
        const order = await prisma.$transaction(async (tx) => {
            const existing = await tx.order.findUnique({ where: { idempotencyKey: body.idempotencyKey }, select: { number: true } });
            if (existing)
                return existing;
            const variants = await tx.productVariant.findMany({ where: { id: { in: items.map(i => i.variantId) }, active: true, product: { active: true } }, include: { product: true } });
            if (variants.length !== items.length || variants.some(v => v.stock === 0))
                throw new Error();
            let total = new Prisma.Decimal(0);
            let incomplete = false;
            const lines = items.map(item => {
                const variant = variants.find(v => v.id === item.variantId)!;
                if (variant.stock !== null && item.quantity > variant.stock) throw new Error('Stock insuficiente');
                if (variant.price === null)
                    incomplete = true;
                else
                    total = total.add(variant.price.mul(item.quantity));
                return { quantity: item.quantity, variantId: variant.id, productName: variant.product.name, variantName: variant.name, sku: variant.sku, unitPrice: variant.price };
            });
            return tx.order.create({ data: { idempotencyKey: body.idempotencyKey, customerName: customer.name.trim(), customerPhone: customer.phone.trim(), businessName: body.purchaseType === 'WHOLESALE' ? customer.business.trim() || null : null, customerNote: customer.comment.trim() || null, purchaseType: body.purchaseType, estimatedTotal: incomplete ? null : total, items: { create: lines } }, select: { number: true } });
        });
        return Response.json(order);
    }
    catch {
        return Response.json({ error: 'No se pudo enviar. Revisá tus datos y la disponibilidad de los productos antes de reintentar.' }, { status: 400 });
    }
}
