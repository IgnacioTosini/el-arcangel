import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin-session';
import AdminLogin from '@/components/admin/adminLogin/AdminLogin';

export const metadata: Metadata = { title: 'Ingresar | El Arcángel', robots: { index: false, follow: false } };

export default async function LoginPage() {
    if (await isAdminAuthenticated()) redirect('/admin');
    return <AdminLogin />;
}
