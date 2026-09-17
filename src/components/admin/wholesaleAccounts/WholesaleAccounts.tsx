'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import './_wholesaleAccounts.scss';
type Account = { id: string; name: string; email: string; phone: string; business: string; status: string };
export default function WholesaleAccounts({ accounts }: { accounts: Account[] }) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);
    const [filter, setFilter] = useState('PENDING');
    async function update(id: string, status: string) {
        if (busy) return;
        setBusy(true);
        try {
            const response = await fetch('/api/admin/wholesale', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error);
            toast.success('Estado de la cuenta actualizado.'); router.refresh();
        } catch (error) { toast.error(error instanceof Error ? error.message : 'No se pudo actualizar.'); }
        finally { setBusy(false); }
    }
    const shown = accounts.filter(account => !filter || account.status === filter);
    return <section className="wholesaleAccounts">
        <h1>Cuentas mayoristas</h1>
        <p className="adminMuted">Revisá los datos antes de aprobar. El cliente puede consultar el estado iniciando sesión; no se envían emails automáticos.</p>
        <label>Estado <select value={filter} onChange={event => setFilter(event.target.value)} className="adminButton"><option value="">Todas</option><option value="PENDING">Pendientes</option><option value="APPROVED">Aprobadas</option><option value="REJECTED">Rechazadas</option></select></label>
        {shown.map(account => <article key={account.id}>
            <h2>{account.name}</h2><p>{account.business}</p><p>{account.email} · {account.phone}</p>
            <label>Estado de {account.name} <select className="adminButton" disabled={busy} value={account.status} onChange={event => void update(account.id, event.target.value)}><option value="PENDING">Pendiente</option><option value="APPROVED">Aprobada</option><option value="REJECTED">Rechazada</option></select></label>
        </article>)}
        {!shown.length && <p className="adminMuted">No hay solicitudes con este estado.</p>}
    </section>;
}
