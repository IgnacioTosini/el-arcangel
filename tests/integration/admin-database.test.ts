import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

import { test } from 'vitest';

import { integrationContext } from './helpers';

import type { AdminData } from '@/components/admin/adminModels';


const { db, origin, cookie } = await integrationContext();
const ids: Record<string, string> = {};
async function request(method: string, model?: string, record?: unknown, expected = 200) {
    const response = await fetch(`${origin}/api/admin/data`, { method, headers: { Cookie: cookie, Origin: origin, 'Content-Type': 'application/json' }, ...(method !== 'GET' ? { body: JSON.stringify({ model, record }) } : {}) });
    const result = await response.json();
    assert.equal(response.status, expected, JSON.stringify(result));
    return result as AdminData & { id: string };
}
test('ABM, consultas e integridad de los datos', async () => {
    const suffix = randomUUID();
    try {
        assert.equal((await fetch(`${origin}/api/admin/data`)).status, 401);
        ids.category = (await request('POST', 'Category', { name: 'Prueba temporal', slug: `test-${suffix}`, active: true })).id;
        ids.product = (await request('POST', 'Product', { name: 'Producto temporal', slug: `test-${suffix}`, description: 'Descripción de prueba', active: true, featured: true, categoryIds: ids.category })).id;
        await request('PATCH', 'Product', { id: ids.product, categoryIds: ids.category });
        await request('PATCH', 'Product', { id: ids.product, categoryIds: '' }, 400);
        await request('PATCH', 'Category', { id: ids.category, active: false }, 400);
        await request('DELETE', 'Category', { id: ids.category }, 400);
        ids.variant = (await request('POST', 'ProductVariant', { productId: ids.product, name: 'Variante temporal', sku: '', price: 1234.50, stock: 3, active: true })).id;
        const sku = (await db.productVariant.findUniqueOrThrow({ where: { id: ids.variant } })).sku;
        assert.match(sku, /^ARC-[0-9]{6,}$/);
        await request('PATCH', 'ProductVariant', { id: ids.variant, sku: '', name: 'Renamed' });
        assert.equal((await db.productVariant.findUniqueOrThrow({ where: { id: ids.variant } })).sku, sku);
        ids.image = (await request('POST', 'ProductImage', { productId: ids.product, url: '/image-placeholder.svg', publicId: `test-${suffix}`, sortOrder: 0 })).id;
        const secondImage = await request('POST', 'ProductImage', { productId: ids.product, url: '/image-placeholder.svg', publicId: `second-${suffix}`, sortOrder: 1 });
        await request('PATCH', 'ProductImage', { id: secondImage.id, primary: true });
        assert.equal((await db.productImage.findUniqueOrThrow({ where: { id: secondImage.id } })).sortOrder, 0);
        assert.equal((await db.productImage.findUniqueOrThrow({ where: { id: ids.image } })).sortOrder, 1);
        const badOrigin = await fetch(`${origin}/api/admin/data`, { method: 'PATCH', headers: { Cookie: cookie, Origin: 'https://example.invalid', 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'Product', record: { id: ids.product, name: 'No guardar' } }) });
        assert.equal(badOrigin.status, 403);
        const settingsResponse = await fetch(`${origin}/api/settings`, { method: 'PATCH', headers: { Cookie: cookie, Origin: origin, 'Content-Type': 'application/json' }, body: '{}' });
        assert.equal(settingsResponse.status, 200);
        assert.ok((await db.siteSettings.findUniqueOrThrow({ where: { id: 'store' } })).name);
        const invalidSettings = await fetch(`${origin}/api/settings`, { method: 'PATCH', headers: { Cookie: cookie, Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ whatsapp: 'invalido' }) });
        assert.equal(invalidSettings.status, 400);
        await request('PATCH', 'ProductVariant', { id: ids.variant, price: -1 }, 400);
        await request('POST', 'Category', { name: 'Duplicada', slug: `test-${suffix}` }, 400);
        await request('PATCH', 'ProductVariant', { id: ids.variant, price: 4321.25 });
        const data = await request('GET');
        assert.equal(data.ProductVariant.find(v => v.id === ids.variant)?.price, 4321.25);
        assert.equal(data.Product.find(p => p.id === ids.product)?.categoryIds, ids.category);
        assert.equal(data.ProductImage.find(i => i.id === ids.image)?.productId, ids.product);
        for (const path of ['/', '/catalogo', `/catalogo/test-${suffix}`, '/mi-consulta']) {
            const response = await fetch(origin + path);
            assert.equal(response.status, 200, path);
            const html = await response.text();
            if (path !== '/mi-consulta') assert.ok(html.includes('Producto temporal'), path);
        }
        const inquiryKey = randomUUID();
        const inquiry = { idempotencyKey: inquiryKey, customer: { name: 'Prueba de integracion', phone: '1155550000', business: '', comment: '' }, purchaseType: 'RETAIL', items: [{ variantId: ids.variant, quantity: 2 }], estimatedTotal: 1 };
        async function sendInquiry() {
            const response = await fetch(`${origin}/api/inquiries`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(inquiry) });
            assert.equal(response.status, 200);
            return response.json();
        }
        const tooMany = await fetch(`${origin}/api/inquiries`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ ...inquiry, idempotencyKey: randomUUID(), items: [{ variantId: ids.variant, quantity: 4 }] }) });
        assert.equal(tooMany.status, 400);
        const first = await sendInquiry();
        const second = await sendInquiry();
        assert.equal(first.number, second.number);
        const savedOrder = await db.order.findUniqueOrThrow({ where: { idempotencyKey: inquiryKey }, include: { items: true } });
        ids.order = savedOrder.id;
        assert.equal(savedOrder.estimatedTotal?.toNumber(), 8642.50);
        assert.equal(savedOrder.items[0].unitPrice?.toNumber(), 4321.25);
        await db.productVariant.update({ where: { id: ids.variant }, data: { stock: 1 } });
        await request('PATCH', 'Order', { id: ids.order, status: 'COMPLETED' }, 400);
        assert.equal((await db.order.findUniqueOrThrow({ where: { id: ids.order } })).status, 'PENDING');
        assert.equal((await db.productVariant.findUniqueOrThrow({ where: { id: ids.variant } })).stock, 1);
        await db.productVariant.update({ where: { id: ids.variant }, data: { stock: 3 } });
        await request('PATCH', 'Order', { id: ids.order, status: 'COMPLETED', finalTotal: 8000 });
        assert.ok((await db.order.findUniqueOrThrow({ where: { id: ids.order } })).completedAt);
        assert.equal((await db.productVariant.findUniqueOrThrow({ where: { id: ids.variant } })).stock, 1);
        await request('PATCH', 'Order', { id: ids.order, status: 'COMPLETED' });
        assert.equal((await db.productVariant.findUniqueOrThrow({ where: { id: ids.variant } })).stock, 1);
        await request('PATCH', 'Order', { id: ids.order, status: 'PENDING' }, 400);
        await request('DELETE', 'Order', { id: ids.order }, 400);
        await request('PATCH', 'Product', { id: ids.product, active: false });
        assert.equal((await fetch(`${origin}/catalogo/test-${suffix}`)).status, 404);
        await request('DELETE', 'ProductImage', { id: ids.image });
        await request('DELETE', 'ProductVariant', { id: ids.variant });
        await request('DELETE', 'Product', { id: ids.product });
        await request('DELETE', 'Category', { id: ids.category });
    } finally {
        // Only remove records created by this run, never user records.
        if (ids.order) await db.order.deleteMany({ where: { id: ids.order } });
        if (ids.product) await db.product.deleteMany({ where: { id: ids.product } });
        if (ids.category) await db.category.deleteMany({ where: { id: ids.category } });
        await db.$disconnect();
    }
});
