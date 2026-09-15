'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { AdminRecord } from '../adminModels';
import { useAdmin } from '../AdminProvider';
import ProductEditor from '../productEditor/ProductEditor';
import CategoryEditor from '../categoryEditor/CategoryEditor';
import OrderCard from '../orderCard/OrderCard';
import { statusLabels } from '../adminOverview/AdminOverview';
import './_adminManagement.scss';

export default function AdminManagement({ section }: { section:'Product' | 'Category' | 'Order' }) {
    const { data, revision } = useAdmin();
    const params = useSearchParams();
    const [query,setQuery] = useState('');
    const [status,setStatus] = useState('');
    const [draft,setDraft] = useState<AdminRecord | null>(null);
    const search = query.toLocaleLowerCase('es');
    const products = data.Product.filter(product => `${product.name} ${product.slug} ${data.ProductVariant.filter(variant => variant.productId === product.id).map(variant => variant.sku).join(' ')}`.toLocaleLowerCase('es').includes(search));
    const orders = data.Order.filter(order => !status || order.status === status);
    function create() {
        setDraft({ id: `draft-${crypto.randomUUID()}`, name: '', slug: '', description: '', active: false, ...(section === 'Product' ? { featured: false, material: null, categoryIds: '' } : { sortOrder: data.Category.length, imageUrl: null, publicId: null }) });
        setQuery('');
    }
    return <div className="adminManagementContent">
        <div className="adminSectionHeading"><h2>{section === 'Product' ? 'Productos y variantes' : section === 'Category' ? 'Categorías' : 'Consultas recibidas'}</h2><div className="adminManagementToolbar">
            {section === 'Product' && <input aria-label="Buscar productos por nombre o código" type="search" placeholder="Buscar por nombre o código" value={query} onChange={event => setQuery(event.target.value)} />}
            {section !== 'Order' ? <button type="button" className="adminButton adminButtonPrimary" disabled={Boolean(draft)} onClick={create}>Agregar {section === 'Product' ? 'producto' : 'categoría'}</button> : <label>Estado <select value={status} onChange={event => setStatus(event.target.value)}><option value="">Todas</option>{['PENDING','COMPLETED','INQUIRY_ONLY','CANCELLED'].map(value => <option value={value} key={value}>{statusLabels[value]}</option>)}</select></label>}
        </div></div>
        <div className="adminManagementList">
            {draft && section === 'Product' && <ProductEditor key={draft.id} product={draft} initiallyOpen onClose={() => setDraft(null)} />}
            {draft && section === 'Category' && <CategoryEditor key={draft.id} category={draft} initiallyOpen onClose={() => setDraft(null)} />}
            {section === 'Product' && products.map(product => <ProductEditor key={`${product.id}-${revision}`} product={product} initiallyOpen={product.id === params.get('registro') || product.id === params.get('padre')} />)}
            {section === 'Category' && [...data.Category].sort((a,b) => Number(a.sortOrder)-Number(b.sortOrder)).map(category => <CategoryEditor key={`${category.id}-${revision}`} category={category} />)}
            {section === 'Order' && orders.map(order => <OrderCard key={`${order.id}-${revision}`} order={order} />)}
            {((section === 'Product' && !products.length) || (section === 'Category' && !data.Category.length) || (section === 'Order' && !orders.length)) && <p className="adminMuted">No hay registros para mostrar.</p>}
        </div>
    </div>;
}
