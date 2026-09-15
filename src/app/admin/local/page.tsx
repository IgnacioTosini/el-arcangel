import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Datos del local | El Arcángel' };
import StoreSettings from '@/components/admin/storeSettings/StoreSettings';
export default function StoreSettingsPage() { return <StoreSettings />; }
