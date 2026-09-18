'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import Navbar from './navbar/Navbar';
import Footer from './footer/Footer';
import RefreshOnReturn from './RefreshOnReturn';

export default function SiteFrame({ children, hasWholesaleSession = false }: { children: ReactNode; hasWholesaleSession?: boolean }) {
    const pathname = usePathname();
    if (pathname === '/login' || pathname === '/admin' || pathname.startsWith('/admin/')) return <>{children}</>;
    return <><RefreshOnReturn /><Navbar hasWholesaleSession={hasWholesaleSession} />{children}<Footer /></>;
}
