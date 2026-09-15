import { readCatalog } from '@/lib/catalog-database';
export const dynamic = 'force-dynamic';
import { pageMetadata } from '@/lib/seo';
import { Suspense } from 'react';
import Catalog from '@/components/sections/catalog/Catalog';

export const metadata = pageMetadata('Catálogo | El Arcángel', 'Explorá productos de santería y regalería. Filtrá por categoría y armá tu consulta.', '/catalogo');

export default async function CatalogPage() {
    const { products, categories } = await readCatalog();
    return <main><Suspense fallback={<p role="status">Cargando catálogo…</p>}><Catalog products={products} categories={[{ value: '', label: 'Todas' }, ...categories.map(c => ({ value: c.slug, label: c.name }))]} /></Suspense></main>;
}
