import { readCatalog } from '@/lib/catalog-database';
export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import Consultation from '@/components/sections/consultation/Consultation';

export const metadata: Metadata = { title: 'Mi consulta | El Arcángel', robots: { index: false, follow: true }, description: 'Armá tu consulta por mayor o por menor y consultanos precios y disponibilidad.' };

export default async function ConsultationPage() {
    const { products } = await readCatalog();
    return <main><Consultation products={products} /></main>;
}
