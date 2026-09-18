import { prisma } from '@/lib/prisma';
import { siteUrl } from '@/lib/seo';

import type { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    if (!siteUrl) return [];
    const products = await prisma.product.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } });
    return [
        ...['/', '/catalogo', '/mayoristas', '/contacto'].map(path => ({ url: new URL(path, siteUrl).href })),
        ...products.map(product => ({ url: `${siteUrl}/catalogo/${product.slug}`, lastModified: product.updatedAt })),
    ];
}
