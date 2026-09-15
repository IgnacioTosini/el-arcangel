'use client';

import { useId, useState } from 'react';
import type { AdminRecord } from '../adminModels';
import { slugify } from '@/lib/slug';
import './_categorySelect.scss';

export default function CategorySelect({ categories, value, onChange }: { categories: AdminRecord[]; value: string[]; onChange: (ids: string[]) => void }) {
    const id = useId();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const selected = categories.filter(category => value.includes(category.id));
    const matches = categories.filter(category => slugify(String(category.name)).includes(slugify(query)));
    return <div className="categorySelect">
        <span id={`${id}-label`}>Categorías</span>
        <button type="button" className="adminButton categorySelectTrigger" aria-labelledby={`${id}-label ${id}-value`} aria-expanded={open} aria-controls={`${id}-options`} onClick={() => setOpen(!open)}>
            <span id={`${id}-value`}>{selected.length ? `${selected.length} seleccionada${selected.length === 1 ? '' : 's'} · ${selected.slice(0, 2).map(category => category.name).join(', ')}${selected.length > 2 ? '…' : ''}` : 'Seleccionar categorías'}</span><span aria-hidden="true">▾</span>
        </button>
        {open && <div id={`${id}-options`} className="categorySelectPanel" onKeyDown={event => { if (event.key === 'Escape') { setOpen(false); document.getElementById(`${id}-value`)?.closest('button')?.focus(); } }}>
            <label htmlFor={`${id}-search`}>Buscar categoría</label>
            <input id={`${id}-search`} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar por nombre…" />
            <div className="categorySelectOptions">{matches.map(category => <label key={category.id}>
                <input type="checkbox" checked={value.includes(category.id)} onChange={event => onChange(event.target.checked ? [...value, category.id] : value.filter(item => item !== category.id))} />{category.name}
            </label>)}{!matches.length && <p>No hay categorías que coincidan.</p>}</div>
            <button type="button" className="adminButton" onClick={() => setOpen(false)}>Listo</button>
        </div>}
    </div>;
}
