import type { Metadata } from 'next';
import { getWholesaleAccount } from '@/lib/wholesale-auth';
import WholesaleAccount from '@/components/sections/wholesaleAccount/WholesaleAccount';
export const metadata: Metadata = { title: 'Cuenta mayorista | El Arcángel', robots: { index: false, follow: false } };
export default async function Page() { return <main className='accountPage'><WholesaleAccount account={await getWholesaleAccount()} /></main>; }
