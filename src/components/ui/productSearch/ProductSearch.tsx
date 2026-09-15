'use client';

import { Suspense, useEffect, useId, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import './_productSearch.scss';

type Suggestion = { id: string; name: string; href: string; imageUrl: string };
type Props = { onNavigate?: () => void; preserveFilters?: boolean; live?: boolean };

function SearchInput({ initial, onNavigate, preserveFilters }: Props & { initial: string }) {
    const id = useId();
    const router = useRouter();
    const params = useSearchParams();
    const [query, setQuery] = useState(initial);
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(-1);
    const [result, setResult] = useState<{ query: string; items: Suggestion[]; error?: boolean }>();
    const trimmed = query.trim();
    const ready = result?.query === trimmed;
    const items = ready ? result.items : [];
    const visible = open && trimmed.length >= 2;
    useEffect(() => {
        if (trimmed.length < 2 || !open) return;
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal });
                if (!response.ok) throw new Error();
                const items: Suggestion[] = await response.json();
                if (!controller.signal.aborted) setResult({ query: trimmed, items });
            } catch { if (!controller.signal.aborted) setResult({ query: trimmed, items: [], error: true }); }
        }, 250);
        return () => { clearTimeout(timer); controller.abort(); };
    }, [trimmed, open]);
    function navigate(href?: string) {
        const next = preserveFilters ? new URLSearchParams(params.toString()) : new URLSearchParams();
        if (trimmed) next.set('q', trimmed); else next.delete('q');
        setOpen(false); onNavigate?.();
        router.push(href ?? `/catalogo${next.size ? `?${next}` : ''}`);
    }
    return <form className="productSearch" role="search" aria-label="Buscar productos" onSubmit={event => { event.preventDefault(); navigate(visible && selected >= 0 ? items[selected]?.href : undefined); }} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
        <div className="productSearchField">
            <input type="search" name="q" maxLength={100} role="combobox" aria-label="Buscar por nombre o código" aria-autocomplete="list" aria-expanded={visible} aria-controls={visible ? id : undefined} aria-activedescendant={visible && selected >= 0 ? `${id}-${selected}` : undefined} placeholder="Buscar por nombre o código…" value={query} onFocus={() => setOpen(true)} onChange={event => { setQuery(event.target.value); setSelected(-1); setOpen(true); }} onKeyDown={event => {
                if (event.key === 'Escape') { event.stopPropagation(); setOpen(false); setSelected(-1); }
                if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setOpen(true); setSelected(current => event.key === 'ArrowDown' ? Math.min(current + 1, items.length - 1) : Math.max(-1, current - 1)); }
            }} />
            <button type="submit" aria-label="Ver resultados de búsqueda">Buscar</button>
        </div>
        {visible && <div className="productSearchDropdown">
            <ul id={id} role="listbox" aria-label="Productos sugeridos">
                {items.map((item, index) => <li key={item.id} id={`${id}-${index}`} role="option" aria-selected={selected === index} onMouseDown={event => event.preventDefault()} onClick={() => navigate(item.href)}>
                    <Image src={item.imageUrl} alt="" width={40} height={48} /><span>{item.name}</span>
                </li>)}
            </ul>
            {!ready ? <p role="status">Buscando…</p> : !items.length && <p role="status">{result.error ? 'No pudimos cargar sugerencias. Probá ver los resultados.' : 'No encontramos coincidencias.'}</p>}
            <button type="button" className="productSearchAll" onClick={() => navigate()}>Ver todos los resultados →</button>
        </div>}
    </form>;
}

function SearchWithUrl(props: Props) {
    const params = useSearchParams();
    const pathname = usePathname();
    const query = pathname === '/catalogo' ? params.get('q') ?? '' : '';
    if (props.live) return <form className="productSearch" role="search" aria-label="Filtrar catálogo" onSubmit={event => event.preventDefault()}>
        <div className="productSearchField">
            <input type="search" name="q" maxLength={100} aria-label="Filtrar por nombre o código" placeholder="Filtrar por nombre o código…" value={query} onChange={event => {
                const next = new URLSearchParams(params.toString());
                if (event.target.value) next.set('q', event.target.value); else next.delete('q');
                window.history.replaceState(null, '', `${pathname}${next.size ? `?${next}` : ''}${window.location.hash}`);
            }} />
        </div>
    </form>;
    return <SearchInput key={pathname} initial="" {...props} />;
}

export default function ProductSearch(props: Props) {
    return <Suspense fallback={<div className="productSearchField"><input aria-label="Cargando buscador" placeholder="Buscar productos…" disabled /></div>}><SearchWithUrl {...props} /></Suspense>;
}
