import { redirect } from 'next/navigation';

import AdminLogin from '@/components/admin/adminLogin/AdminLogin';
import { isAdminAuthenticated } from '@/lib/admin-session';

import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Ingresar | El Arcángel', robots: { index: false, follow: false } };

export default async function LoginPage() {
    if (await isAdminAuthenticated()) redirect('/admin');
    return <AdminLogin />;
}
