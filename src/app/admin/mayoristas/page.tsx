import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { isAdminAuthenticated } from '@/lib/admin-session';
import { redirect } from 'next/navigation';
import WholesaleAccounts from '@/components/admin/wholesaleAccounts/WholesaleAccounts';
export const metadata: Metadata = { title: 'Cuentas mayoristas | El Arcángel' };
export default async function Page() {
    if (!await isAdminAuthenticated()) redirect('/login');
    const accounts = await prisma.wholesaleAccount.findMany({ orderBy: { createdAt: 'desc' }, select: { id: true, name: true, email: true, phone: true, business: true, status: true } });
    return <WholesaleAccounts accounts={accounts} />;
}
