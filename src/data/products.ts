import type { ProductCardData } from '@/components/cards/productCard/ProductCard';

// Datos de demostración compartidos entre la portada y el catálogo.
export const featuredProducts: ProductCardData[] = [
    { id: 'demo-sahumerios', name: 'Sahumerios clásicos', category: 'Sahumerios y aromas', imageUrl: '/categories/sahumerios-y-aromas.webp', href: '/catalogo/sahumerios-clasicos', price: 2500, priceFrom: true, availability: 'available' },
    { id: 'demo-set', name: 'Set sahumerios con soporte', category: 'Sahumerios y aromas', imageUrl: '/products/set-sahumerios.webp', href: '/catalogo/set-sahumerios-con-soporte', price: 6500, availability: 'available' },
    { id: 'demo-portasahumerios', name: 'Portasahumerios de madera', category: 'Portasahumerios', imageUrl: '/categories/portasahumerios.webp', href: '/catalogo/portasahumerios-de-madera', price: 3500, priceFrom: true, availability: 'available' },
    { id: 'demo-quemador', name: 'Quemador para conos', category: 'Portasahumerios', imageUrl: '/products/quemador-conos.webp', href: '/catalogo/quemador-para-conos', price: 14500, availability: 'available' },
];

export const catalogCategories = [
    { value: '', label: 'Todas' },
    { value: 'sahumerios-y-aromas', label: 'Sahumerios y aromas' },
    { value: 'portasahumerios', label: 'Portasahumerios' },
    { value: 'imagenes-religiosas', label: 'Imágenes religiosas' },
    { value: 'budas-y-figuras', label: 'Budas y figuras' },
    { value: 'regaleria', label: 'Regalería' },
];

export type CatalogProduct = ProductCardData & { variants?: { id: string; name: string; sku: string; price: number | null; compareAtPrice?: number | null; stock: number | null }[]; description?: string; featured?: boolean; categorySlugs?: string[]; sku: string; categorySlug: string; createdAt: string };

export const catalogProducts: CatalogProduct[] = [
    { id: 'demo-regalo', name: 'Set decorativo para regalo', category: 'Regalería', categorySlug: 'regaleria', sku: 'REG-001', imageUrl: '/categories/regaleria.webp', href: '/catalogo/set-decorativo-para-regalo', price: 24000, availability: 'available', createdAt: '2026-09-13' },
    { id: 'demo-buda', name: 'Buda decorativo', category: 'Budas y figuras', categorySlug: 'budas-y-figuras', sku: 'BUD-001', imageUrl: '/categories/budas-y-figuras.webp', href: '/catalogo/buda-decorativo', price: null, availability: 'inquiry', createdAt: '2026-09-12' },
    { id: 'demo-arcangel', name: 'Figura de San Miguel Arcángel', category: 'Imágenes religiosas', categorySlug: 'imagenes-religiosas', sku: 'IMG-001', imageUrl: '/categories/imagenes-religiosas.webp', href: '/catalogo/san-miguel-arcangel', price: null, availability: 'inquiry', createdAt: '2026-09-11' },
    ...featuredProducts.map((product, index) => ({
        ...product,
        sku: `DEST-00${index + 1}`,
        categorySlug: product.category === 'Portasahumerios' ? 'portasahumerios' : 'sahumerios-y-aromas',
        createdAt: `2026-09-0${index + 1}`,
    })),
];
