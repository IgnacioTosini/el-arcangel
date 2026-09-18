import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import AdminManagement from '@/components/admin/adminManagement/AdminManagement';
import { adminSections } from '@/components/admin/adminNavigation';

import type { Metadata } from 'next';

export function generateStaticParams() { return adminSections.map(model => ({ model: model.slug })); }

export default async function AdminModelPage({ params }: { params: Promise<{ model: string }> }) {
    const { model: slug } = await params;
    const model = adminSections.find(item => item.slug === slug);
    if (!model) notFound();
    if (model.name !== 'Product' && model.name !== 'Category' && model.name !== 'Order') notFound();
    return <Suspense fallback={<p>Cargando registros…</p>}><AdminManagement key={model.name} section={model.name} /></Suspense>;
}

export async function generateMetadata({ params }: { params: Promise<{ model: string }> }): Promise<Metadata> {
    const { model } = await params;
    const section = adminSections.find(item => item.slug === model);
    return { title: `${section?.label ?? 'Administración'} | El Arcángel`, robots: { index: false, follow: false } };
}
