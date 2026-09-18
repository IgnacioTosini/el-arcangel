import { redirect } from 'next/navigation';

import WholesaleAccounts from '@/components/admin/wholesaleAccounts/WholesaleAccounts';
import { isAdminAuthenticated } from '@/lib/admin-session';
import { prisma } from '@/lib/prisma';

import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Cuentas mayoristas | El Arcángel' };
export default async function Page() {
    if (!await isAdminAuthenticated()) redirect('/login');
    const accounts = await prisma.wholesaleAccount.findMany({ orderBy: { createdAt: 'desc' }, select: { id: true, name: true, email: true, phone: true, business: true, status: true, createdAt: true, _count: { select: { orders: true } } } });
    return <WholesaleAccounts accounts={accounts.map(({ createdAt, _count, ...account }) => ({ ...account, createdAt: createdAt.toISOString(), orderCount: _count.orders }))} />;
}
