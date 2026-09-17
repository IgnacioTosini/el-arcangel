'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import './_wholesaleAccounts.scss';
type Account = { id: string; name: string; email: string; phone: string; business: string; status: string; createdAt: string; orderCount: number };
const statuses = { PENDING: 'Pendiente', APPROVED: 'Activa · Aprobada', REJECTED: 'Inactiva · Rechazada' };
export default function WholesaleAccounts({ accounts }: { accounts: Account[] }) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);
    const [filter, setFilter] = useState('PENDING');
    const [query, setQuery] = useState('');
    const [change, setChange] = useState<{ account: Account; status: string } | null>(null);
    async function update(id: string, status: string) {
        if (busy) return;
        setBusy(true);
        try {
            const response = await fetch('/api/admin/wholesale', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error);
            toast.success('Estado de la cuenta actualizado.'); setChange(null); router.refresh();
        } catch (error) { toast.error(error instanceof Error ? error.message : 'No se pudo actualizar.'); }
        finally { setBusy(false); }
    }
    const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    const shown = accounts.filter(account => (!filter || account.status === filter) && normalize(`${account.name} ${account.business} ${account.email} ${account.phone}`).includes(normalize(query)));
    return <section className="wholesaleAccounts">
        <h1>Cuentas mayoristas</h1>
        <p className="adminMuted">Revisá los datos antes de aprobar. El cliente puede consultar el estado iniciando sesión; no se envían emails automáticos.</p>
        <p className="adminMuted">Solo las cuentas activas y aprobadas acceden a precios mayoristas. Las pendientes y rechazadas no tienen ese acceso.</p>
        <div className="adminStats">{Object.entries(statuses).map(([status, label]) => <button type="button" className="adminStat" key={status} aria-pressed={filter === status} onClick={() => setFilter(status)}><span>{label}</span><strong>{accounts.filter(account => account.status === status).length}</strong></button>)}</div>
        <div className="wholesaleFilters">
            <label>Buscar cuentas<input type="search" placeholder="Nombre, negocio, email o teléfono" value={query} onChange={event => setQuery(event.target.value)} /></label>
            <label>Estado <select value={filter} onChange={event => setFilter(event.target.value)} className="adminButton"><option value="">Todas</option><option value="PENDING">Pendientes</option><option value="APPROVED">Activas · Aprobadas</option><option value="REJECTED">Inactivas · Rechazadas</option></select></label>
            {(query || filter) && <button type="button" className="adminButton" onClick={() => { setQuery(''); setFilter(''); }}>Limpiar filtros</button>}
        </div>
        <p className="adminMuted" role="status">{shown.length} de {accounts.length} cuentas</p>
        {shown.map(account => <article key={account.id}>
            <div className="wholesaleAccountHeading"><h2>{account.name}</h2><span className={`wholesaleStatus wholesaleStatus${account.status}`}>{statuses[account.status as keyof typeof statuses]}</span></div>
            <p>{account.business}</p><p><a href={`mailto:${account.email}`}>{account.email}</a> · <a href={`tel:${account.phone}`}>{account.phone}</a></p>
            <p className="adminMuted">Registrada el {new Intl.DateTimeFormat('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date(account.createdAt))}</p>
            <div className="wholesaleAccountActions"><Link className="adminButton" href={`/admin/pedidos?cuenta=${encodeURIComponent(account.id)}`}>Ver consultas ({account.orderCount})</Link>
            <label>Estado de {account.name} <select className="adminButton" disabled={busy} value={change?.account.id === account.id ? change.status : account.status} onChange={event => setChange(event.target.value === account.status ? null : { account, status: event.target.value })}><option value="PENDING">Pendiente</option><option value="APPROVED">Activa · Aprobada</option><option value="REJECTED">Inactiva · Rechazada</option></select></label></div>
            {change?.account.id === account.id && <div className="wholesaleConfirmation"><p>{change.status === 'APPROVED' ? 'Esta cuenta tendrá acceso a los precios y pedidos mayoristas.' : 'Esta cuenta no tendrá acceso mayorista. Sus consultas anteriores se conservarán.'}</p><button className="adminButton adminButtonPrimary" type="button" disabled={busy} onClick={() => void update(account.id, change.status)}>{busy ? 'Guardando…' : 'Confirmar cambio'}</button><button className="adminButton" type="button" disabled={busy} onClick={() => setChange(null)}>Cancelar</button></div>}
        </article>)}
        {!shown.length && <p className="adminMuted">No hay solicitudes con este estado.</p>}
    </section>;
}
