'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import ProductCard, { type ProductCardData } from '@/components/cards/productCard/ProductCard';
import { useConsultation } from '@/components/providers/ConsultationProvider';
import ProductSearch from '@/components/ui/productSearch/ProductSearch';
import Modal from '@/components/ui/modal/Modal';
import type { CatalogProduct } from '@/data/products';
import CatalogFilters from './catalogFilters/CatalogFilters';
import { filterProducts, parseFilters, type CatalogFiltersValue } from './catalogFilters/filterUtils';
import './_catalog.scss';

export default function Catalog({ products: catalogProducts, categories, purchaseType = 'RETAIL' }: { products: CatalogProduct[]; categories: { value: string; label: string }[]; purchaseType?: 'RETAIL' | 'WHOLESALE' }) {
    const params = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const { addItem } = useConsultation();
    const filters = parseFilters(params.get('categoria'), params.get('orden'));
    const query = params.get('q') ?? '';
    const products = filterProducts(catalogProducts, filters, query);
    const [draft, setDraft] = useState<CatalogFiltersValue | null>(null);

    useEffect(() => {
        const desktop = window.matchMedia('(min-width: 701px)');
        const closeOnDesktop = () => { if (desktop.matches) setDraft(null); };
        desktop.addEventListener('change', closeOnDesktop);
        return () => desktop.removeEventListener('change', closeOnDesktop);
    }, []);

    function updateFilters(value: CatalogFiltersValue) {
        const next = new URLSearchParams(params.toString());
        if (value.category) next.set('categoria', value.category); else next.delete('categoria');
        if (value.sort !== 'newest') next.set('orden', value.sort); else next.delete('orden');
        router.push(`${pathname}${next.size ? `?${next}` : ''}`, { scroll: false });
    }

    function handleAdd(product: ProductCardData) {
        if (product.defaultVariantId) addItem({ id: product.defaultVariantId, name: product.name, stock: product.stock });
    }

    return (
        <div className="catalogContent">
            <header className="catalogHeader">
                <h1>Catálogo</h1>
                <p>{purchaseType === 'WHOLESALE' ? 'Precios mayoristas · cuenta aprobada' : 'Precios minoristas'}</p>
                <p role="status">{products.length} {products.length === 1 ? 'producto' : 'productos'}{query ? ` para “${query}”` : ''}.</p>
            </header>
            <ProductSearch live preserveFilters />
            <div className="catalogDesktopFilters"><CatalogFilters categories={categories} value={filters} onChange={updateFilters} /></div>
            <button className="catalogMobileFilters catalogButton" type="button" aria-haspopup="dialog" onClick={() => setDraft(filters)}>
                Filtrar y ordenar{filters.category || filters.sort !== 'newest' ? ' · Activos' : ''}
            </button>
            {draft && (
                <Modal title="Filtrar y ordenar" onClose={() => setDraft(null)}>
                    <CatalogFilters categories={categories} value={draft} onChange={setDraft} />
                    <div className="catalogModalActions">
                        <button className="catalogButton" type="button" onClick={() => setDraft({ category: '', sort: 'newest' })}>Restablecer</button>
                        <button className="catalogButton catalogButtonPrimary" type="button" onClick={() => { updateFilters(draft); setDraft(null); }}>Aplicar filtros</button>
                    </div>
                </Modal>
            )}
            {products.length ? (
                <ul className="catalogGrid">
                    {products.map((product) => <li key={product.id}><ProductCard product={product} onAdd={handleAdd} /></li>)}
                </ul>
            ) : (
                <div className="catalogEmpty">
                    <h2>No encontramos productos</h2>
                    <p>Probá con otra búsqueda o quitá los filtros.</p>
                    <button className="catalogButton" type="button" onClick={() => router.push('/catalogo', { scroll: false })}>Ver todos los productos</button>
                </div>
            )}
        </div>
    );
}

