import type { ModelName } from './adminModels';

export const adminSections: { name: ModelName; slug: string; label: string }[] = [
    { name: 'Product', slug: 'productos', label: 'Productos' },
    { name: 'Category', slug: 'categorias', label: 'Categorías' },
    { name: 'Order', slug: 'pedidos', label: 'Consultas' },
];

export function adminRecordHref(name: ModelName, id: string) {
    const base = name === 'ProductVariant' ? '/admin/productos?vista=variantes&' : name === 'ProductImage' ? '/admin/productos?vista=imagenes&' : name === 'OrderItem' ? '/admin/pedidos?vista=articulos&' : `/admin/${adminSections.find(section => section.name === name)?.slug ?? 'productos'}?`;
    return `${base}registro=${encodeURIComponent(id)}`;
}
