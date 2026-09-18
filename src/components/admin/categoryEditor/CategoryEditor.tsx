'use client';

import { useState } from 'react';

import { useAdmin } from '../AdminProvider';
import CatalogForm from '../catalogForm/CatalogForm';
import DeleteRecordButton from '../DeleteRecordButton';

import type { AdminRecord } from '../adminModels';

import './_categoryEditor.scss';

export default function CategoryEditor({ category, initiallyOpen = false, onClose }: { category: AdminRecord; initiallyOpen?: boolean; onClose?: () => void }) {
    const { data, remove } = useAdmin();
    const [open, setOpen] = useState(initiallyOpen);
    const isNew = category.id.startsWith('draft-');
    const count = data.Product.filter(product => String(product.categoryIds ?? '').split(',').includes(category.id)).length;
    return <article className="categoryEditorContent" aria-label={String(category.name || 'Nueva categoría')}>
        <div className="adminSectionHeading"><div><h3>{isNew ? 'Nueva categoría' : category.name}</h3><p className="adminMuted">{isNew ? 'Todavía no se guardó' : `${count} productos · ${category.active ? 'Visible en el sitio' : 'Oculta en el sitio'}`}</p></div>{!open && <div className="adminRecordActions"><button type="button" className="adminButton" onClick={() => setOpen(true)}>Editar</button><DeleteRecordButton label="Eliminar categoría" recordName={String(category.name)} description="Los productos se conservarán, pero dejarán de pertenecer a esta categoría." onDelete={() => remove('Category', category.id)} /></div>}</div>
        {open && <CatalogForm model="Category" initial={category} onClose={() => { setOpen(false); onClose?.(); }} />}
    </article>;
}
