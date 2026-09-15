'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { loginAdmin } from '@/app/login/actions';
import './_adminLogin.scss';

export default function AdminLogin() {
    const [state, action, pending] = useActionState(loginAdmin, { error: '' });
    const [visible, setVisible] = useState(false);
    return <main className="adminLoginContent">
        <Link href="/" className="adminLoginBrand">EL ARCÁNGEL</Link>
        <section className="adminLoginCard" aria-labelledby="adminLoginTitle">
            <div className="adminLoginMark" aria-hidden="true">✧</div>
            <p className="adminLoginEyebrow">ESPACIO ADMINISTRATIVO</p>
            <h1 id="adminLoginTitle">Bienvenido de nuevo</h1>
            <p className="adminLoginDescription">Ingresá para administrar tus productos, categorías y consultas.</p>
            <form action={action}>
                <label htmlFor="adminPassword">Contraseña</label>
                <div className="adminLoginPassword">
                    <input id="adminPassword" name="password" type={visible ? 'text' : 'password'} autoComplete="current-password" required maxLength={1024} placeholder="Ingresá tu contraseña" aria-invalid={Boolean(state.error)} aria-describedby={state.error ? 'adminLoginError' : undefined} />
                    <button type="button" onClick={() => setVisible(!visible)} aria-pressed={visible} aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{visible ? 'Ocultar' : 'Mostrar'}</button>
                </div>
                <p id="adminLoginError" className="adminLoginError" role="alert">{state.error}</p>
                <button className="adminLoginSubmit" type="submit" disabled={pending}>{pending ? 'Ingresando…' : 'Ingresar al panel →'}</button>
            </form>
            <p className="adminLoginFootnote">Acceso exclusivo para la administración del local.</p>
        </section>
        <Link href="/" className="adminLoginBack">← Volver al sitio</Link>
    </main>;
}
