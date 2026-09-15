import type { Metadata } from 'next';
import { cache } from 'react';
import { pageMetadata } from '@/lib/seo';
import { notFound } from 'next/navigation';
import { readCatalog } from '@/lib/catalog-database';
export const dynamic = 'force-dynamic';
import ProductDetail from '@/components/sections/productDetail/ProductDetail';

type ProductPageProps = { params: Promise<{ slug: string }> };

const findProduct = cache(async (slug: string) => {
    return (await readCatalog()).products.find(product => product.href === `/catalogo/${slug}`);
});

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
    const product = await findProduct((await params).slug);
    if (!product) notFound();
    const description = product.description?.replace(/\s+/g, ' ').trim().slice(0, 160) || `Consultá por ${product.name} en El Arcángel. Venta por mayor y menor.`;
    return pageMetadata(`${product.name} | El Arcángel`, description, product.href, product.imageUrl);
}

export default async function ProductPage({ params }: ProductPageProps) {
    const product = await findProduct((await params).slug);
    if (!product) notFound();
    return <main><ProductDetail key={product.id} product={product} /></main>;
}
