import { afterAll, expect, test } from 'vitest';
import { randomUUID } from 'node:crypto';
import { integrationContext } from './helpers';

const { db, origin, cookie } = await integrationContext();
const products: string[] = [];
const orders: string[] = [];

async function fixture(stocks: (number | null)[], quantity = 1) {
    const suffix = randomUUID();
    const product = await db.product.create({ data: {
        name: 'Prueba de stock', slug: `stock-${suffix}`, description: 'Prueba temporal', active: false,
        variants: { create: stocks.map((stock, index) => ({ name: `Variante ${index}`, sku: `STOCK-${suffix}-${index}`, stock })) },
    }, include: { variants: true } });
    products.push(product.id);
    async function order() {
        const created = await db.order.create({ data: {
            idempotencyKey: randomUUID(), customerName: 'Prueba', customerPhone: '1155550000',
            items: { create: product.variants.map(variant => ({ variantId: variant.id, productName: product.name, variantName: variant.name, sku: variant.sku, quantity })) },
        } });
        orders.push(created.id);
        return created.id;
    }
    return { variants: product.variants, order };
}

async function complete(id: string) {
    const response = await fetch(`${origin}/api/admin/data`, { method: 'PATCH', headers: {
        Cookie: cookie, Origin: origin, 'Content-Type': 'application/json',
    }, body: JSON.stringify({ model: 'Order', record: { id, status: 'COMPLETED' } }) });
    return { status: response.status, body: await response.json() };
}

afterAll(async () => {
    await db.order.deleteMany({ where: { id: { in: orders } } });
    await db.product.deleteMany({ where: { id: { in: products } } });
    await db.$disconnect();
});

test('Stock sin definir impide el cierre y conserva todas las existencias', async () => {
    const { variants, order } = await fixture([5, null]);
    const id = await order();
    const result = await complete(id);
    expect(result.status).toBe(400);
    expect(result.body.error).toContain('Cargá el stock');
    for (const variant of variants) expect((await db.productVariant.findUniqueOrThrow({ where: { id: variant.id } })).stock).toBe(variant.stock);
    expect((await db.order.findUniqueOrThrow({ where: { id } })).completedAt).toBeNull();
});

test('Una segunda consulta no se completa cuando la primera agotó el stock', async () => {
    const { variants, order } = await fixture([2], 2);
    const first = await order();
    const second = await order();
    expect((await complete(first)).status).toBe(200);
    expect((await complete(second)).body.error).toContain('Stock insuficiente');
    expect((await db.order.findUniqueOrThrow({ where: { id: second } })).status).toBe('PENDING');
    expect((await db.productVariant.findUniqueOrThrow({ where: { id: variants[0].id } })).stock).toBe(0);
});

test('Dos confirmaciones concurrentes no pueden consumir las mismas existencias', async () => {
    const { variants, order } = await fixture([1]);
    const first = await order();
    const second = await order();
    const results = await Promise.all([complete(first), complete(second)]);
    expect(results.filter(result => result.status === 200)).toHaveLength(1);
    expect(results.filter(result => [400, 409].includes(result.status))).toHaveLength(1);
    expect(await db.order.count({ where: { id: { in: [first, second] }, status: 'COMPLETED' } })).toBe(1);
    expect((await db.productVariant.findUniqueOrThrow({ where: { id: variants[0].id } })).stock).toBe(0);
});
