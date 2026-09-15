import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Resumen administrativo | El Arcángel' };
import AdminOverview from '@/components/admin/adminOverview/AdminOverview';

export default function AdminPage() { return <AdminOverview />; }
