'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { sortProductImages } from '@/lib/product-images';
import { slugify } from '@/lib/slug';
import { ImageService } from '@/services/ImageService';

import { useAdmin } from '../AdminProvider';
import CategorySelect from '../categorySelect/CategorySelect';
import DraftFields from '../draftFields/DraftFields';
import DraftImage from '../draftImage/DraftImage';
import { useDraftImages } from '../draftImage/useDraftImages';

import type { AdminRecord } from '../adminModels';

import './_catalogForm.scss';


type Props = { model: 'Product' | 'Category'; initial: AdminRecord; onClose: () => void };

export default function CatalogForm({ model, initial, onClose }: Props) {
    const { data, refreshData } = useAdmin();
    const [draft, setDraft] = useState(initial);
    const [variants, setVariants] = useState(() => data.ProductVariant.filter(item => item.productId === initial.id).sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0)));
    const [images, setImages] = useState(() => sortProductImages(data.ProductImage.filter(item => item.productId === initial.id)));
    const [automaticSlug, setAutomaticSlug] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [confirmCancel, setConfirmCancel] = useState(false);
    const [baseline] = useState(() => JSON.stringify({ draft: initial, variants, images }));
    const { uploads, track, resolve } = useDraftImages(model === 'Product' ? 'productos' : 'categorias');
    const isNew = initial.id.startsWith('draft-');
    const dirty = isNew || baseline !== JSON.stringify({ draft, variants, images });
    const product = model === 'Product';

    useEffect(() => {
        if (!dirty) return;
        const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
        const guardNavigation = (event: MouseEvent) => {
            const link = event.target instanceof Element ? event.target.closest('a') : null;
            if (!link || link.target === '_blank' || event.ctrlKey || event.metaKey || event.shiftKey) return;
            if (new URL(link.href).origin === location.origin && link.href !== location.href) {
                event.preventDefault(); event.stopPropagation();
                toast.info('Guardá o cancelá el borrador antes de cambiar de sección.', { toastId: 'catalog-draft' });
            }
        };
        window.addEventListener('beforeunload', warn);
        const guardPage = (event: Event) => { event.preventDefault(); toast.info('Guardá o cancelá el borrador antes de cambiar de página.'); };
        document.addEventListener('admin:page-change', guardPage);
        document.addEventListener('click', guardNavigation, true);
        return () => { window.removeEventListener('beforeunload', warn); document.removeEventListener('click', guardNavigation, true); document.removeEventListener('admin:page-change', guardPage); };
    }, [dirty]);

    function change(name: string, value: AdminRecord[string]) {
        if (name === 'slug') setAutomaticSlug(false);
        setDraft(current => ({ ...current, [name]: value, ...(name === 'name' && automaticSlug ? { slug: slugify(String(value)) } : {}) }));
    }

    async function cleanup(ids: string[]) {
        for (const id of new Set(ids)) {
            const result = await ImageService.deleteImage(id);
            if (!result.success) toast.warning(`El archivo quedó pendiente de limpieza: ${result.error}`);
        }
    }

    async function cancel() {
        setBusy(true);
        await cleanup([...uploads.current]);
        onClose();
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (busy) return;
        if (product && draft.active && !data.Category.some(category => category.active === true && String(draft.categoryIds ?? '').split(',').includes(category.id))) {
            setError('Para publicar el producto, seleccioná al menos una categoría activa o desactivá “Visible en el sitio”.');
            return;
        }
        setBusy(true); setError('');
        try {
            const savedImages = [];
            for (const image of images) {
                const uploaded = await resolve(String(image.url), String(image.publicId ?? ''));
                savedImages.push({ ...image, url: uploaded.url, publicId: uploaded.public_id });
            }
            let record = draft;
            if (!product && draft.imageUrl) {
                const uploaded = await resolve(String(draft.imageUrl), String(draft.publicId ?? ''));
                record = { ...draft, imageUrl: uploaded.url, publicId: uploaded.public_id };
            }
            const response = await fetch('/api/admin/catalog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model, record, variants, images: savedImages }) });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error);
            const used = new Set(product ? savedImages.map(image => String(image.publicId)) : [String(record.publicId ?? '')]);
            await cleanup([...result.cleanup, ...[...uploads.current].filter(id => !used.has(id))]);
            uploads.current.clear();
            try { await refreshData(); } catch { toast.warning('Guardado correctamente. Actualizá el panel para ver los datos nuevos.'); }
            toast.success(draft.active ? 'Cambios guardados y aplicados al sitio.' : 'Guardado. El registro está oculto en el sitio.');
            onClose();
        } catch (failure) { setError(failure instanceof Error ? failure.message : 'No se pudo guardar.'); }
        finally { setBusy(false); }
    }

    return <form className="catalogForm" onSubmit={submit}>
        <fieldset disabled={busy} className="catalogFormFields">
            <p className="catalogFormNotice" role="status">{dirty ? 'Borrador sin guardar.' : 'Sin cambios pendientes.'} Los cambios se aplican al sitio cuando presionás Guardar cambios. Si desactivás “Visible en el sitio”, el registro queda oculto al guardar.</p>
            <DraftFields record={draft} onChange={change} fields={[
                { name: 'name', label: 'Nombre' }, { name: 'slug', label: 'Dirección web (slug)' },
                ...(product ? [{ name: 'material', label: 'Material (opcional)', optional: true }] : [{ name: 'sortOrder', label: 'Orden', type: 'number' as const }]),
                { name: 'description', label: 'Descripción', type: 'textarea', full: true, optional: !product },
                { name: 'active', label: 'Visible en el sitio', type: 'checkbox' },
                ...(product ? [{ name: 'featured', label: 'Destacado en la portada', type: 'checkbox' as const }] : []),
            ]} />
            {product ? <>
                <CategorySelect categories={data.Category} value={String(draft.categoryIds ?? '').split(',').filter(Boolean)} onChange={ids => change('categoryIds', ids.join(','))} />
                <p className="adminMuted">Los productos visibles necesitan al menos una categoría activa. Los borradores ocultos pueden guardarse sin categoría.</p>
                <div className="adminSectionHeading"><h3>Variantes</h3><button type="button" className="adminButton" onClick={() => setVariants(current => [...current, { id: `draft-${crypto.randomUUID()}`, name: 'Única', sku: '', active: true, sortOrder: current.length, price: null, compareAtPrice: null, stock: null }])}>Agregar variante</button></div>
                {variants.map(variant => <section className="catalogFormCard" key={variant.id} aria-label={`Variante ${variant.name}`}>
                    <p className="adminMuted">Incluí en el nombre lo que el cliente debe distinguir al elegir: por ejemplo, Dorado · 25 cm o Lavanda · Caja de 12. Si no hay opciones, usá Única.</p>
                    <DraftFields record={variant} onChange={(name, value) => setVariants(current => current.map(item => item.id === variant.id ? { ...item, [name]: value } : item))} fields={[
                        { name: 'name', label: 'Nombre de la variante', placeholder: 'Ej.: Dorado · 25 cm' }, { name: 'sku', label: 'Código (SKU)', optional: true, placeholder: 'Automático al guardar' },
                        { name: 'stock', label: 'Stock (vacío = a confirmar)', type: 'number', optional: true },
                        { name: 'price', label: 'Precio minorista actual ($)', type: 'number', step: '.01', optional: true },
                        { name: 'compareAtPrice', label: 'Precio minorista anterior ($)', type: 'number', step: '.01', optional: true },
                        { name: 'wholesalePrice', label: 'Precio mayorista actual ($)', type: 'number', step: '.01', optional: true },
                        { name: 'wholesaleCompareAtPrice', label: 'Precio mayorista anterior ($)', type: 'number', step: '.01', optional: true },
                        { name: 'active', label: 'Variante a la venta', type: 'checkbox' },
                    ]} />
                    <p className="adminMuted">Podés escribir un SKU propio. Si lo dejás vacío, se genera al guardar; si la variante ya tiene uno, se conserva.</p>
                    <button type="button" className="adminDelete" onClick={() => setVariants(current => current.filter(item => item.id !== variant.id))}>Quitar variante del borrador</button>
                </section>)}
                {!variants.length && <p className="adminMuted">Agregá una variante para que el producto se pueda consultar.</p>}
                <h3>Imágenes</h3>
                <DraftImage folder="productos" onBusy={setBusy} onChange={image => {
                    if (!image) return; track(image);
                    setImages(current => [...current, { id: `draft-${crypto.randomUUID()}`, url: image.url, publicId: image.public_id, alt: draft.name, sortOrder: current.length }]);
                }} />
                {images.map((image, index) => <section className="catalogFormCard" key={image.id}>
                    {index === 0 ? <span className="adminBadge">Imagen principal</span> : <button type="button" className="adminButton" onClick={() => setImages(current => [image, ...current.filter(item => item.id !== image.id)])}>Usar como principal</button>}
                    <DraftImage folder="productos" url={String(image.url)} onBusy={setBusy} onChange={uploaded => {
                        track(uploaded);
                        setImages(current => uploaded ? current.map(item => item.id === image.id ? { ...item, url: uploaded.url, publicId: uploaded.public_id } : item) : current.filter(item => item.id !== image.id));
                    }} />
                    <DraftFields record={image} fields={[{ name: 'alt', label: 'Texto alternativo', optional: true }]} onChange={(name, value) => setImages(current => current.map(item => item.id === image.id ? { ...item, [name]: value } : item))} />
                </section>)}
            </> : <DraftImage folder="categorias" url={draft.imageUrl ? String(draft.imageUrl) : null} onBusy={setBusy} onChange={image => {
                track(image); setDraft(current => ({ ...current, imageUrl: image?.url ?? null, publicId: image?.public_id ?? null }));
            }} />}
            {error && <p className="adminError" role="alert">{error}</p>}
            <div className="catalogFormActions">
                <span>{busy ? 'Procesando…' : dirty ? 'Cambios pendientes' : 'Todo guardado'}</span>
                <button type="button" className="adminButton" onClick={() => dirty ? setConfirmCancel(true) : onClose()}>Cancelar</button>
                <button type="submit" className="adminButton adminButtonPrimary" disabled={!dirty}>Guardar cambios</button>
            </div>
            {confirmCancel && <div className="catalogFormNotice"><p>¿Descartar los cambios sin guardar? Lo publicado se mantiene.</p><button type="button" className="adminButton" onClick={() => void cancel()}>Descartar cambios</button><button type="button" className="adminButton" onClick={() => setConfirmCancel(false)}>Seguir editando</button></div>}
        </fieldset>
    </form>;
}
