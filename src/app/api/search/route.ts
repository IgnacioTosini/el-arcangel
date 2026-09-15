import { readCatalog } from '@/lib/catalog-database';
import { matchesProduct } from '@/lib/product-search';

export async function GET(request: Request) {
    const query = new URL(request.url).searchParams.get('q')?.trim().slice(0, 100) ?? '';
    if (query.length < 2) return Response.json([]);
    try {
        const { products } = await readCatalog();
        return Response.json(products.filter(product => matchesProduct(product, query)).slice(0, 5).map(({ id, name, imageUrl, href }) => ({ id, name, imageUrl, href })));
    } catch {
        return Response.json({ error: 'No se pudieron cargar las sugerencias.' }, { status: 503 });
    }
}
