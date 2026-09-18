'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

import Pagination from '@/components/ui/pagination/Pagination';
import { usePagination } from '@/lib/use-pagination';

import { statusLabels } from '../adminOverview/AdminOverview';
import { useAdmin } from '../AdminProvider';
import CategoryEditor from '../categoryEditor/CategoryEditor';
import OrderCard from '../orderCard/OrderCard';
import ProductEditor from '../productEditor/ProductEditor';

import type { AdminRecord } from '../adminModels';

import './_adminManagement.scss';

export default function AdminManagement({ section }: { section: 'Product' | 'Category' | 'Order' }) {
    const params = useSearchParams();
    return <ManagementList key={`${section}-${params.toString()}`} section={section} />;
}

function ManagementList({ section }: { section: 'Product' | 'Category' | 'Order' }) {
    const { data, revision } = useAdmin();
    const params = useSearchParams();
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState(() => ['PENDING', 'COMPLETED', 'INQUIRY_ONLY', 'CANCELLED'].includes(params.get('estado') ?? '') ? params.get('estado')! : '');
    const [visibility, setVisibility] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [stock, setStock] = useState(() => ['available', 'empty', 'unknown'].includes(params.get('stock') ?? '') ? params.get('stock')! : '');
    const [price, setPrice] = useState(() => ['retail', 'wholesale'].includes(params.get('precio') ?? '') ? params.get('precio')! : '');
    const [accountId, setAccountId] = useState(() => params.get('cuenta') ?? '');
    const [draft, setDraft] = useState<AdminRecord | null>(null);
    const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim();
    const search = normalize(query);
    const matchesVisibility = (record: AdminRecord) => !visibility || Boolean(record.active) === (visibility === 'visible');
    const products = data.Product.filter(product => {
        const variants = data.ProductVariant.filter(variant => variant.productId === product.id);
        return normalize(`${product.name} ${product.slug} ${product.code ?? ''} ${variants.map(variant => variant.sku).join(' ')}`).includes(search)
            && matchesVisibility(product)
            && (!categoryId || String(product.categoryIds ?? '').split(',').includes(categoryId))
            && (!price || variants.some(variant => variant[price === 'retail' ? 'price' : 'wholesalePrice'] == null))
            && (!stock || variants.some(variant => stock === 'unknown' ? variant.stock == null : variant.stock != null && (stock === 'available' ? Number(variant.stock) > 0 : Number(variant.stock) === 0)));
    });
    const categories = [...data.Category].sort((a, b) => Number(a.sortOrder) - Number(b.sortOrder));
    const filteredCategories = categories.filter(category => normalize(String(category.name)).includes(search) && matchesVisibility(category));
    const hasFilters = Boolean(query || visibility || categoryId || stock || price);
    function clearFilters() { setQuery(''); setVisibility(''); setCategoryId(''); setStock(''); setPrice(''); }
    const orders = data.Order.filter(order => (!status || order.status === status) && (!accountId || order.wholesaleAccountId === accountId));
    const records = section === 'Product' ? products : section === 'Category' ? filteredCategories : orders;
    const targetIndex = records.findIndex(record => record.id === (params.get('registro') ?? params.get('padre')));
    const pagination = usePagination(records, JSON.stringify([section, query, status, visibility, categoryId, stock, price, accountId]), 10, targetIndex < 0 ? 1 : Math.floor(targetIndex / 10) + 1);
    function create() {
        setDraft({ id: `draft-${crypto.randomUUID()}`, name: '', slug: '', description: '', active: false, ...(section === 'Product' ? { featured: false, material: null, categoryIds: '' } : { sortOrder: data.Category.length, imageUrl: null, publicId: null }) });
        clearFilters();
        pagination.setPage(1);
    }
    return <div id="admin-results" className="adminManagementContent">
        <div className="adminSectionHeading"><h2>{section === 'Product' ? 'Productos y variantes' : section === 'Category' ? 'Categorías' : 'Consultas recibidas'}</h2><div className="adminManagementToolbar">
            {section !== 'Order' ? <button type="button" className="adminButton adminButtonPrimary" disabled={Boolean(draft)} onClick={create}>Agregar {section === 'Product' ? 'producto' : 'categoría'}</button> : <label>Estado <select value={status} onChange={event => setStatus(event.target.value)}><option value="">Todas</option>{['PENDING', 'COMPLETED', 'INQUIRY_ONLY', 'CANCELLED'].map(value => <option value={value} key={value}>{statusLabels[value]}</option>)}</select></label>}
        </div></div>
        {section === 'Order' && accountId && <div className="adminFilterSummary"><p className="adminMuted">Consultas de la cuenta seleccionada: {orders.length}</p><button className="adminButton" type="button" onClick={() => setAccountId('')}>Ver todas las cuentas</button></div>}
        {section !== 'Order' && <div className="adminFilters">
            <div className="adminFilterControls">
                <label className="adminFilterSearch">{section === 'Product' ? 'Buscar productos' : 'Buscar categorías'}<input type="search" placeholder={section === 'Product' ? 'Nombre, código o SKU' : 'Nombre de la categoría'} value={query} onChange={event => setQuery(event.target.value)} /></label>
                {section === 'Product' && <label>Categoría<select value={categoryId} onChange={event => setCategoryId(event.target.value)}><option value="">Todas las categorías</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>}
                <label>Visibilidad<select value={visibility} onChange={event => setVisibility(event.target.value)}><option value="">Todas</option><option value="visible">Visibles</option><option value="hidden">Ocultos</option></select></label>
                {section === 'Product' && <label>Stock<select value={stock} onChange={event => setStock(event.target.value)}><option value="">Todos</option><option value="available">Con stock</option><option value="empty">Agotado</option><option value="unknown">Sin definir</option></select></label>}
                {section === 'Product' && <label>Precios<select value={price} onChange={event => setPrice(event.target.value)}><option value="">Todos</option><option value="retail">Sin precio minorista</option><option value="wholesale">Sin precio mayorista</option></select></label>}
            </div>
            <div className="adminFilterSummary"><p className="adminMuted" role="status">{section === 'Product' ? `${products.length} de ${data.Product.length} productos` : `${filteredCategories.length} de ${data.Category.length} categorías`}</p>{hasFilters && <button type="button" className="adminButton" onClick={clearFilters}>Limpiar filtros</button>}</div>
            {section === 'Product' && stock && <p className="adminMuted">Se muestran productos con al menos una variante que cumple el filtro de stock.</p>}
        </div>}
        <div className="adminManagementList">
            {draft && section === 'Product' && <ProductEditor key={draft.id} product={draft} initiallyOpen onClose={() => setDraft(null)} />}
            {draft && section === 'Category' && <CategoryEditor key={draft.id} category={draft} initiallyOpen onClose={() => setDraft(null)} />}
            {section === 'Product' && pagination.items.map(product => <ProductEditor key={`${product.id}-${revision}`} product={product} initiallyOpen={product.id === params.get('registro') || product.id === params.get('padre')} />)}
            {section === 'Category' && pagination.items.map(category => <CategoryEditor key={`${category.id}-${revision}`} category={category} />)}
            {section === 'Order' && pagination.items.map(order => <OrderCard key={`${order.id}-${revision}`} order={order} />)}
            {((section === 'Product' && !products.length) || (section === 'Category' && !filteredCategories.length) || (section === 'Order' && !orders.length)) && <p className="adminMuted">{section !== 'Order' && hasFilters ? 'No se encontraron resultados. Probá cambiar o limpiar los filtros.' : 'No hay registros para mostrar.'}</p>}
        </div>
        <Pagination {...pagination} targetId="admin-results" onChange={page => {
            if (!document.dispatchEvent(new Event('admin:page-change', { cancelable: true }))) return false;
            pagination.setPage(page);
        }} />
    </div>;
}
