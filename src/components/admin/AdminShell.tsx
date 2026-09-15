'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import AdminNavbar from './adminNavbar/AdminNavbar';


import './_admin.scss';
import { logoutAdmin } from '@/app/login/actions';

export default function AdminShell({ children }: { children: ReactNode }) {


    return (
        <div className="adminContent">
            <header className="adminTopbar"><Link href="/admin" className="adminBrand">EL ARCÁNGEL <span>Administración</span></Link><Link href="/">Ver el sitio ↗</Link><form action={logoutAdmin}><button type="submit" className="adminButton">Cerrar sesión</button></form></header>
            <div className="adminInner">
                <div className="adminIntro"><div><h1>Panel administrativo</h1><p>Productos y categorías se aplican al sitio al presionar Guardar cambios. Podés cancelar para descartar el borrador.</p></div></div>
                <div className="adminLayout"><AdminNavbar /><main className="adminMain">{children}</main></div>
            </div>
        </div>
    );
}
