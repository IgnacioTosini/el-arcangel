'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAdmin } from '../AdminProvider';
import { adminModels, type ModelName } from '../adminModels';
import AdminEditor from '../adminEditor/AdminEditor';
import { statusLabels } from '../adminOverview/AdminOverview';
import { adminRecordHref } from '../adminNavigation';

const columns: Record<ModelName, string[]> = {
    Category: ['name','slug','active'], Product: ['name','slug','active','featured'], ProductVariant: ['sku','name','productId','price','stock'], ProductImage: ['alt','url','productId'], Cart: ['id','purchaseType','expiresAt'], CartItem: ['cartId','variantId','quantity'], Order: ['number','customerName','status','purchaseType','estimatedTotal'], OrderItem: ['orderId','productName','quantity','unitPrice'],
};
const headings: Record<string,string> = { name:'Nombre', slug:'Slug', active:'Activo', featured:'Destacado', sku:'SKU', productId:'Producto', price:'Precio', stock:'Stock', alt:'Descripción', url:'Imagen', id:'ID', purchaseType:'Tipo de compra', expiresAt:'Vencimiento', cartId:'Carrito', variantId:'Variante', quantity:'Cantidad', number:'Número', customerName:'Cliente', status:'Estado', estimatedTotal:'Estimado', orderId:'Pedido', productName:'Producto histórico', unitPrice:'Precio unitario' };

export default function AdminModelView({ name: section }: { name: ModelName }) {
    const params = useSearchParams();
    const view = params.get('vista');
    const name = section === 'Product' && view === 'variantes' ? 'ProductVariant' : section === 'Product' && view === 'imagenes' ? 'ProductImage' : section === 'Order' && view === 'articulos' ? 'OrderItem' : section;
    const model = adminModels.find(item => item.name === name)!;
    const { data } = useAdmin();
    const [query, setQuery] = useState('');
    const [editId, setEditId] = useState<string | null>(null);
    const [notice, setNotice] = useState('');
    const selectedId = params.get('registro');
    const parentId = params.get('padre');
    const rows = data[name].filter(record => (!parentId || record[name === 'OrderItem' ? 'orderId' : 'productId'] === parentId) && (!selectedId || record.id === selectedId) && Object.values(record).some(value => String(value ?? '').toLocaleLowerCase('es').includes(query.toLocaleLowerCase('es'))));
    const record = data[name].find(item => item.id === editId);

    return <>
        {(section === 'Product' || section === 'Order') && <nav className="adminSubnav" aria-label="Opciones de la sección">
            <Link href={section === 'Product' ? '/admin/productos' : '/admin/pedidos'}>{section === 'Product' ? 'Productos' : 'Consultas'}</Link>
            {section === 'Product' && <><Link href="/admin/productos?vista=variantes">Variantes y stock</Link><Link href="/admin/productos?vista=imagenes">Imágenes</Link></>}
        </nav>}
        <div className="adminSectionHeading"><div><h2>{name === 'Order' ? 'Consultas' : model.label}</h2><p className="adminMuted">{rows.length} registros{parentId ? ' relacionados' : ''}</p></div><label className="adminSearch">Buscar registros<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Nombre, código o ID…" /></label></div>
        {(selectedId || parentId) && <p><Link href={section === 'Product' ? `/admin/productos${view ? `?vista=${view}` : ''}` : '/admin/pedidos'}>Volver al listado</Link></p>}
        <div className="adminTableWrap"><table className="adminTable"><caption className="adminVisuallyHidden">Registros de {model.label}</caption><thead><tr>{columns[name].map(column => <th key={column} scope="col">{headings[column]}</th>)}<th scope="col">Acciones</th></tr></thead><tbody>
            {rows.map(row => <tr key={row.id}>{columns[name].map(column => {
                const field = model.fields.find(field => field.name === column);
                const value = row[column];
                const target = field?.relation ? adminModels.find(item => item.name === field.relation) : null;
                return <td key={column}>{target && value ? <Link href={adminRecordHref(target.name, String(value))}>{String(data[target.name].find(item => item.id === value)?.name ?? value)}</Link> : typeof value === 'boolean' ? <span className="adminBadge">{value ? 'Sí' : 'No'}</span> : value === null ? 'A confirmar' : statusLabels[String(value)] ?? String(value)}</td>;
            })}<td><button type="button" className="adminButton" onClick={() => { setEditId(row.id); setNotice(''); }} aria-label={`Editar ${row.name ?? row.customerName ?? row.id}`}>Editar</button>
                {name === 'Product' && <div><Link href={`/admin/productos?vista=variantes&padre=${encodeURIComponent(row.id)}`}>Variantes</Link> · <Link href={`/admin/productos?vista=imagenes&padre=${encodeURIComponent(row.id)}`}>Imágenes</Link></div>}
                {name === 'Order' && <div><Link href={`/admin/pedidos?vista=articulos&padre=${encodeURIComponent(row.id)}`}>Ver artículos</Link></div>}
            </td></tr>)}
            {!rows.length && <tr><td colSpan={columns[name].length + 1}>No hay registros que coincidan con la búsqueda.</td></tr>}
        </tbody></table></div>
        {record && <AdminEditor key={record.id} model={model} record={record} onClose={() => setEditId(null)} onSaved={() => setNotice('Cambios guardados en la demostración.')} />}
        <p role="status">{notice}</p>
    </>;
}
