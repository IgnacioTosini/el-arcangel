'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import Modal from '@/components/ui/modal/Modal';
import { useAdmin } from '../AdminProvider';
import type { AdminModel, AdminRecord } from '../adminModels';
import { statusLabels } from '../adminOverview/AdminOverview';
import { adminRecordHref } from '../adminNavigation';

type AdminEditorProps = { model: AdminModel; record: AdminRecord; onClose: () => void; onSaved: () => void };
const fieldLabels: Record<string, string> = { name: 'Nombre', slug: 'Slug', description: 'Descripción', imageUrl: 'Imagen', publicId: 'ID de imagen', sortOrder: 'Orden', active: 'Activo', material: 'Material', featured: 'Destacado', sku: 'SKU', aroma: 'Aroma', color: 'Color', size: 'Tamaño', presentation: 'Presentación', price: 'Precio', compareAtPrice: 'Precio anterior', stock: 'Stock', productId: 'Producto', url: 'URL de imagen', alt: 'Texto alternativo', purchaseType: 'Tipo de compra', expiresAt: 'Vencimiento', quantity: 'Cantidad', cartId: 'Carrito', variantId: 'Variante', customerName: 'Cliente', customerPhone: 'Teléfono', businessName: 'Negocio', customerNote: 'Comentario del cliente', adminNote: 'Nota interna', status: 'Estado', estimatedTotal: 'Total estimado', finalTotal: 'Total final', completedAt: 'Fecha de venta', productName: 'Producto histórico', variantName: 'Variante histórica', unitPrice: 'Precio unitario histórico', orderId: 'Pedido' };

export default function AdminEditor({ model, record, onClose, onSaved }: AdminEditorProps) {
    const { data, save } = useAdmin();
    const [draft, setDraft] = useState<AdminRecord>({ ...record });
    const [error, setError] = useState('');

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        for (const field of model.fields) {
            const value = draft[field.name];
            if (field.required && (value === '' || value === null || value === undefined)) { setError(`Completá ${fieldLabels[field.name] ?? field.name}.`); return; }
            if (field.unique && value !== null && data[model.name].some(item => item.id !== draft.id && item[field.name] === value)) { setError(`${fieldLabels[field.name] ?? field.name} ya existe.`); return; }
        }
        if (model.name === 'CartItem' && data.CartItem.some(item => item.id !== draft.id && item.cartId === draft.cartId && item.variantId === draft.variantId)) { setError('La variante ya está en este carrito.'); return; }
        const next = model.name === 'Order' ? { ...draft, completedAt: draft.status === 'COMPLETED' ? draft.completedAt || new Date().toISOString() : null } : draft;
        const failure = await save(model.name, next);
        if (failure) { setError(failure); return; }
        onSaved();
        onClose();
    }

    return <Modal title={`Editar ${model.label.toLowerCase()}`} onClose={onClose}>
        <form className="adminEditor" onSubmit={submit}>
            <p className="adminMuted">{record.id}</p>
            <details><summary>Datos del sistema</summary><dl>{model.fields.filter(field => field.readonly).map(field => <div key={field.name}><dt>{field.name}</dt><dd style={{ overflowWrap: 'anywhere' }}>{String(record[field.name] ?? '—')}</dd></div>)}</dl></details>
            {model.fields.filter(field => !field.readonly).map(field => {
                const id = `edit-${field.name}`;
                const value = draft[field.name];
                const setValue = (value: AdminRecord[string]) => setDraft(current => ({ ...current, [field.name]: value }));
                return <div className="adminField" key={field.name}>
                    <label htmlFor={id}>{fieldLabels[field.name] ?? field.name}{!field.required ? ' (opcional)' : ''}</label>
                    {field.type === 'Boolean' ? <input id={id} type="checkbox" checked={Boolean(value)} onChange={event => setValue(event.target.checked)} />
                        : field.options || field.relation ? <select id={id} required={field.required} value={String(value ?? '')} onChange={event => setValue(event.target.value || null)}>
                            {!field.required && <option value="">Sin asignar</option>}
                            {field.options ? field.options.map(option => <option key={option} value={option}>{statusLabels[option] ?? option}</option>) : data[field.relation!].map(item => <option key={item.id} value={item.id}>{String(item.name ?? item.customerName ?? item.sku ?? item.id)}</option>)}
                        </select>
                        : ['description','customerNote','adminNote'].includes(field.name) ? <textarea id={id} required={field.required} rows={3} value={String(value ?? '')} onChange={event => setValue(event.target.value || (field.required ? '' : null))} />
                        : <input id={id} required={field.required} type={['Int','Decimal'].includes(field.type) ? 'number' : field.type === 'DateTime' ? 'datetime-local' : 'text'} min={field.name === 'quantity' ? 1 : ['Int','Decimal'].includes(field.type) ? 0 : undefined} step={field.type === 'Decimal' ? '0.01' : field.type === 'Int' ? '1' : undefined} value={field.type === 'DateTime' && value ? String(value).slice(0,16) : String(value ?? '')} onChange={event => setValue(event.target.value === '' ? field.required ? '' : null : ['Int','Decimal'].includes(field.type) ? Number(event.target.value) : field.type === 'DateTime' ? new Date(`${event.target.value}Z`).toISOString() : event.target.value)} />}
                    {field.type === 'DateTime' && <small>Hora UTC</small>}
                    {field.relation && value && <Link href={adminRecordHref(field.relation, String(value))} onClick={onClose}>Ver registro relacionado →</Link>}
                </div>;
            })}
            {model.name === 'Product' && <fieldset className="adminField"><legend>Categorías</legend>{data.Category.map(category => <label key={category.id}><input type="checkbox" checked={String(draft.categoryIds ?? '').split(',').includes(category.id)} onChange={event => {
                const ids = String(draft.categoryIds ?? '').split(',').filter(Boolean);
                setDraft(current => ({ ...current, categoryIds: (event.target.checked ? [...ids, category.id] : ids.filter(id => id !== category.id)).join(',') }));
            }} /> {category.name}</label>)}</fieldset>}
            <p role="alert" className="adminError">{error}</p>
            <div className="adminEditorActions"><button type="button" className="adminButton" onClick={onClose}>Cancelar</button><button type="submit" className="adminButton adminButtonPrimary">Guardar cambios</button></div>
        </form>
    </Modal>;
}
