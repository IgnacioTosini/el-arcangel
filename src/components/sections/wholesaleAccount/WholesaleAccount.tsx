'use client';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSiteSettings } from '@/components/providers/SiteSettingsProvider';
import { whatsappLink } from '@/lib/whatsapp-link';
import './_wholesaleAccount.scss';

type Account = { name: string; business: string; status: 'PENDING' | 'APPROVED' | 'REJECTED' };
export default function WholesaleAccount({ account }: { account: Account | null }) {
    const router = useRouter();
    const { settings } = useSiteSettings();
    const [request, setRequest] = useState<{ name: string; business: string; email: string } | null>(null);
    const [register, setRegister] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (busy) return;
        const form = event.currentTarget;
        const values = new FormData(form);
        setBusy(true); setError(''); setNotice('');
        try {
            const response = await fetch('/api/wholesale/account', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...Object.fromEntries(values), action: register ? 'register' : 'login' }) });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            if (register) { setRequest({ name: String(values.get('name')), business: String(values.get('business')), email: String(values.get('email')) }); setNotice(data.message); setRegister(false); form.reset(); }
            else router.refresh();
        } catch (error) { setError(error instanceof Error ? error.message : 'No se pudo ingresar.'); }
        finally { setBusy(false); }
    }
    async function logout() {
        setBusy(true); setError('');
        try { const response = await fetch('/api/wholesale/account', { method: 'DELETE' }); if (!response.ok) throw new Error(); router.refresh(); }
        catch { setError('No se pudo cerrar la sesión.'); }
        finally { setBusy(false); }
    }
    return <section className="wholesaleAccount">
        <p className="wholesaleAccountEyebrow">EL ARCÁNGEL · MAYORISTAS</p>
        <h1>{account ? `Hola, ${account.name}` : register ? 'Solicitá tu cuenta mayorista' : 'Ingresá a tu cuenta mayorista'}</h1>
        {account ? <>
            <p>{account.business}</p>
            <p role="status">{account.status === 'APPROVED' ? 'Tu cuenta está aprobada. Ya podés ver los precios mayoristas en el catálogo y armar tu consulta.' : account.status === 'PENDING' ? 'Tu solicitud está pendiente de revisión por el local.' : 'Tu solicitud no fue aprobada. Contactá al local si necesitás revisar tus datos.'}</p>
            <button disabled={busy} onClick={logout}>Cerrar sesión</button>
        </> : <>
            <p>{register ? 'Completá tus datos y los de tu negocio. El local revisará tu solicitud; podés volver a ingresar para consultar su estado.' : 'Este acceso es exclusivo para mayoristas. Para consultar por menor no necesitás una cuenta.'}</p>
            {notice && <p role="status">{notice}</p>}
            {request && whatsappLink(settings.whatsapp, '') && <p>Tu solicitud ya está registrada. <a href={whatsappLink(settings.whatsapp, `Hola, soy ${request.name}, del negocio ${request.business}. Registré una solicitud mayorista con el email ${request.email}. Quisiera consultar su aprobación.`)!} target="_blank" rel="noopener noreferrer">Avisar al local por WhatsApp</a>. Se abrirá un mensaje para que lo envíes.</p>}
            <form onSubmit={submit}><fieldset disabled={busy}>
                {register && <>
                    <label>Nombre y apellido<input name="name" autoComplete="name" required maxLength={120} /></label>
                    <label>Negocio o emprendimiento<input name="business" autoComplete="organization" required maxLength={160} /></label>
                    <label>Teléfono con código de país<input name="phone" type="tel" autoComplete="tel" required maxLength={30} placeholder="Ej.: +54 9 11 1234 5678" /></label>
                </>}
                <label>Email<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
                <label>Contraseña<input name="password" type="password" autoComplete={register ? 'new-password' : 'current-password'} required minLength={8} maxLength={128} /></label>
                {register && <label>Repetir contraseña<input name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} maxLength={128} /></label>}
                <button type="submit">{busy ? 'Procesando…' : register ? 'Enviar solicitud' : 'Ingresar'}</button>
            </fieldset></form>
            <button className="wholesaleAccountSwitch" disabled={busy} onClick={() => { setRegister(!register); setError(''); }}>{register ? 'Ya tengo una cuenta' : 'Solicitar cuenta mayorista'}</button>
        </>}
        {error && <p role="alert">{error}</p>}
    </section>;
}
