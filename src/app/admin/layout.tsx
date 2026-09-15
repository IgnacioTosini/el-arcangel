import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import AdminProvider from '@/components/admin/AdminProvider';
import AdminShell from '@/components/admin/AdminShell';
import { isAdminAuthenticated } from '@/lib/admin-session';
import { redirect } from 'next/navigation';

export const metadata: Metadata = { title: 'Administración | El Arcángel', robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: ReactNode }) {
    if (!(await isAdminAuthenticated())) redirect('/login');
    return <AdminProvider><AdminShell>{children}</AdminShell></AdminProvider>;
}
