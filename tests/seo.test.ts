import { expect, test, vi } from 'vitest';

test('Las URLs SEO usan el dominio configurado y la imagen del producto', async () => {
    vi.stubEnv('SITE_URL', 'https://el-arcangel-test.vercel.app');
    vi.resetModules();
    const { pageMetadata } = await import('@/lib/seo');
    const result = pageMetadata('Producto | El Arcángel', 'Descripción', '/catalogo/producto', 'https://res.cloudinary.com/demo/image.jpg');
    expect(result.alternates?.canonical).toBe('https://el-arcangel-test.vercel.app/catalogo/producto');
    expect(result.openGraph?.images).toEqual([{ url: 'https://res.cloudinary.com/demo/image.jpg', alt: 'Producto | El Arcángel' }]);
});

test('En desarrollo conserva la imagen del icono sin inventar una URL canónica', async () => {
    vi.stubEnv('SITE_URL', '');
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', '');
    vi.stubEnv('VERCEL_URL', '');
    vi.resetModules();
    const { pageMetadata } = await import('@/lib/seo');
    const result = pageMetadata('Inicio', 'Descripción', '/');
    expect(result.alternates).toBeUndefined();
    expect(result.openGraph?.images).toEqual([{ url: '/brand/arcangel-social.jpg', alt: 'Inicio', width: 1200, height: 630, type: 'image/jpeg' }]);
});

test('En Vercel utiliza el dominio público aunque SITE_URL todavía no esté definido', async () => {
    vi.stubEnv('SITE_URL', '');
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'arcangel-test.vercel.app');
    vi.resetModules();
    const { pageMetadata } = await import('@/lib/seo');
    const result = pageMetadata('Inicio', 'Descripción', '/');
    expect(result.openGraph?.images).toEqual([{ url: 'https://arcangel-test.vercel.app/brand/arcangel-social.jpg', alt: 'Inicio', width: 1200, height: 630, type: 'image/jpeg' }]);
    expect(result.twitter?.images).toEqual(['https://arcangel-test.vercel.app/brand/arcangel-social.jpg']);
});
