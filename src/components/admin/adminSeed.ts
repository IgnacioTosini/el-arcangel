import { catalogCategories, catalogProducts } from '@/data/products';
import { adminModels, type AdminData, type AdminRecord, type ModelName } from './adminModels';

const timestamp = '2026-09-13T12:00:00.000Z';

export function createAdminSeed(): AdminData {
    const data = Object.fromEntries(adminModels.map(model => [model.name, []])) as unknown as AdminData;
    function add(model: ModelName, values: AdminRecord) {
        const defaults = Object.fromEntries(adminModels.find(item => item.name === model)!.fields.map(field => [field.name,
            !field.required ? null : field.options ? field.options[0] : field.type === 'Boolean' ? true : ['Int', 'Decimal'].includes(field.type) ? 0 : field.type === 'DateTime' ? timestamp : '',
        ]));
        data[model].push({ ...defaults, ...values });
    }
    catalogCategories.filter(category => category.value).forEach((category, index) => add('Category', { id: `category-${category.value}`, name: category.label, slug: category.value, sortOrder: index, active: true, imageUrl: `/categories/${category.value}.webp` }));
    catalogProducts.forEach((product, index) => {
        add('Product', { id: product.id, name: product.name, slug: product.href.split('/').pop()!, description: `Producto de demostración: ${product.name}.`, active: true, featured: index >= 3, categoryIds: `category-${product.categorySlug}` });
        add('ProductVariant', { id: `variant-${product.id}`, productId: product.id, sku: product.sku, name: 'Única', price: product.price, stock: product.price === null ? null : index === 3 ? 0 : 12, active: true });
        add('ProductImage', { id: `image-${product.id}`, productId: product.id, url: product.imageUrl, publicId: `demo/${product.id}`, alt: product.name });
    });
    ['Mariana Duarte', 'Rubén Ferreyra', 'Lucía Benítez', 'Sergio Ibarra'].forEach((name, index) => {
        const product = catalogProducts[index];
        const status = ['PENDING', 'COMPLETED', 'INQUIRY_ONLY', 'CANCELLED'][index];
        add('Order', { id: `order-${index + 1}`, number: index + 1, idempotencyKey: `demo-order-${index + 1}`, customerName: name, customerPhone: 'Sin teléfono real · demo', purchaseType: index % 2 ? 'WHOLESALE' : 'RETAIL', businessName: index % 2 ? 'Comercio de ejemplo' : null, status, estimatedTotal: product.price === null ? null : product.price * 2, finalTotal: status === 'COMPLETED' ? 15000 : null, completedAt: status === 'COMPLETED' ? timestamp : null });
        add('OrderItem', { id: `order-item-${index + 1}`, orderId: `order-${index + 1}`, variantId: `variant-${product.id}`, productName: product.name, variantName: 'Única', sku: product.sku, quantity: 2, unitPrice: product.price });
    });
    add('Cart', { id: 'cart-demo-1', sessionTokenHash: 'demo-no-es-un-token-real', purchaseType: 'RETAIL', expiresAt: '2026-10-13T12:00:00.000Z' });
    add('CartItem', { id: 'cart-item-demo-1', cartId: 'cart-demo-1', variantId: `variant-${catalogProducts[0].id}`, quantity: 2 });
    return data;
}
