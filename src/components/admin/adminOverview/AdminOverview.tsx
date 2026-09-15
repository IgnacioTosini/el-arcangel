'use client';

import Link from 'next/link';
import { useAdmin } from '../AdminProvider';
import { adminSections } from '../adminNavigation';
import { formatAmount } from '@/components/sections/consultation/consultationUtils';

export const statusLabels: Record<string, string> = { PENDING: 'Pendiente', COMPLETED: 'Venta realizada', INQUIRY_ONLY: 'Solo consulta', CANCELLED: 'Cancelado', RETAIL: 'Minorista', WHOLESALE: 'Mayorista' };

export default function AdminOverview() {
    const { data } = useAdmin();
    const pending = data.Order.filter(order => order.status === 'PENDING').length;
    const prices = data.ProductVariant.flatMap(variant => typeof variant.price === 'number' ? [variant.price] : []);
    const stats = [
        { title: 'Productos activos', value: `${data.Product.filter(product => product.active).length} de ${data.Product.length}`, href: '/admin/productos' },
        { title: 'Categorías', value: data.Category.length, href: '/admin/categorias' },
        { title: 'Variantes sin stock', value: data.ProductVariant.filter(variant => variant.stock === 0).length, href: '/admin/productos?vista=variantes' },
        { title: 'Disponibilidad a confirmar', value: data.ProductVariant.filter(variant => variant.stock === null).length, href: '/admin/productos?vista=variantes' },
    ];
    return <>
        <h2>Resumen</h2>
        <div className="adminStats">{stats.map(stat => <Link className="adminStat" key={stat.title} href={stat.href}><span>{stat.title}</span><strong>{stat.value}</strong></Link>)}</div>
        <div className="adminSectionHeading"><h2>Últimas consultas</h2><Link href="/admin/pedidos">Ver todas ({pending} pendientes)</Link></div>
        <ul className="adminRecent">{[...data.Order].sort((a,b) => Number(b.number) - Number(a.number)).slice(0,4).map(order => <li key={order.id}><Link href={`/admin/pedidos?registro=${order.id}`}><strong>{order.customerName}</strong><span>CONS-{String(order.number).padStart(4,'0')}</span><span className="adminBadge">{statusLabels[String(order.status)]}</span><span className="adminRecentType">{statusLabels[String(order.purchaseType)]}</span></Link></li>)}</ul>
        <h2>Precios de referencia</h2><p className="adminMuted">{prices.length ? `El precio más bajo es ${formatAmount(Math.min(...prices))}.` : 'No hay precios cargados.'}</p>
        <div className="adminSectionHeading"><h2>Administrar</h2></div>
        <div className="adminModelGrid">{adminSections.map(model => <Link key={model.name} href={`/admin/${model.slug}`}><strong>{model.label}</strong><span>{data[model.name].length} registros</span></Link>)}</div>
    </>;
}
