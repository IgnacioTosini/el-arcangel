import { type CatalogProduct } from '@/data/products';

export const sortOptions = [
    { value: 'newest', label: 'Más nuevos' },
    { value: 'price-asc', label: 'Precio: menor a mayor' },
    { value: 'price-desc', label: 'Precio: mayor a menor' },
    { value: 'name', label: 'Nombre (A-Z)' },
] as const;

export type CatalogFiltersValue = {
    category: string;
    sort: typeof sortOptions[number]['value'];
};

export function parseFilters(category: string | null, sort: string | null): CatalogFiltersValue {
    return {
        category: category ?? '',
        sort: sortOptions.find((item) => item.value === sort)?.value ?? 'newest',
    };
}

function normalize(value: string) {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es-AR');
}

export function filterProducts(products: CatalogProduct[], filters: CatalogFiltersValue, query: string) {
    const terms = normalize(query.trim()).split(/\s+/).filter(Boolean);
    return products.filter((product) => (
        (!filters.category || (product.categorySlugs ?? [product.categorySlug]).includes(filters.category))
        && terms.every((term) => normalize(`${product.name} ${product.sku}`).includes(term))
    )).sort((a, b) => {
        if (filters.sort === 'name') return a.name.localeCompare(b.name, 'es');
        if (filters.sort === 'newest') return b.createdAt.localeCompare(a.createdAt);
        if (a.price === null) return b.price === null ? 0 : 1;
        if (b.price === null) return -1;
        return filters.sort === 'price-asc' ? a.price - b.price : b.price - a.price;
    });
}
