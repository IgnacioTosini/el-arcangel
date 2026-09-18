import { redirect } from 'next/navigation';

import AdminOverview from '@/components/admin/adminOverview/AdminOverview';
import { isAdminAuthenticated } from '@/lib/admin-session';
import { prisma } from '@/lib/prisma';

import type { Metadata } from 'next';


export const metadata: Metadata = { title: 'Resumen administrativo | El Arcángel' };

export default async function AdminPage() {
    if (!await isAdminAuthenticated()) redirect('/login');
    const pendingAccounts = await prisma.wholesaleAccount.count({ where: { status: 'PENDING' } });
    return <AdminOverview pendingAccounts={pendingAccounts} />;
}
