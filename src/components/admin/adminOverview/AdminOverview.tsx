'use client';

import Link from 'next/link';

import { adminSections } from '../adminNavigation';
import { useAdmin } from '../AdminProvider';

export const statusLabels: Record<string, string> = { PENDING: 'Pendiente', COMPLETED: 'Venta realizada', INQUIRY_ONLY: 'Solo consulta', CANCELLED: 'Cancelado', RETAIL: 'Minorista', WHOLESALE: 'Mayorista' };

export default function AdminOverview({ pendingAccounts }: { pendingAccounts: number }) {
    const { data } = useAdmin();
    const pending = data.Order.filter(order => order.status === 'PENDING').length;
    const stats = [
        { title: 'Productos activos', value: `${data.Product.filter(product => product.active).length} de ${data.Product.length}`, href: '/admin/productos' },
        { title: 'Categorías', value: data.Category.length, href: '/admin/categorias' },
    ];
    const tasks = [
        { title: 'Consultas pendientes', value: pending, href: '/admin/pedidos?estado=PENDING' },
        { title: 'Mayoristas pendientes de aprobación', value: pendingAccounts, href: '/admin/mayoristas' },
        { title: 'Variantes agotadas', value: data.ProductVariant.filter(variant => variant.stock === 0).length, href: '/admin/productos?stock=empty' },
        { title: 'Variantes con stock sin definir', value: data.ProductVariant.filter(variant => variant.stock == null).length, href: '/admin/productos?stock=unknown' },
        { title: 'Variantes sin precio minorista', value: data.ProductVariant.filter(variant => variant.price == null).length, href: '/admin/productos?precio=retail' },
        { title: 'Variantes sin precio mayorista', value: data.ProductVariant.filter(variant => variant.wholesalePrice == null).length, href: '/admin/productos?precio=wholesale' },
    ];
    return <>
        <h2>Resumen</h2>
        <div className="adminStats">{stats.map(stat => <Link className="adminStat" key={stat.title} href={stat.href}><span>{stat.title}</span><strong>{stat.value}</strong></Link>)}</div>
        <h2>Pendientes para revisar</h2>
        <div className="adminStats">{tasks.map(task => <Link className="adminStat" key={task.title} href={task.href}><span>{task.title}</span><strong>{task.value}</strong></Link>)}</div>
        <div className="adminSectionHeading"><h2>Últimas consultas</h2><Link href="/admin/pedidos">Ver todas ({pending} pendientes)</Link></div>
        <ul className="adminRecent">{[...data.Order].sort((a,b) => Number(b.number) - Number(a.number)).slice(0,4).map(order => <li key={order.id}><Link href={`/admin/pedidos?registro=${order.id}`}><strong>{order.customerName}</strong><span>CONS-{String(order.number).padStart(4,'0')}</span><span className="adminBadge">{statusLabels[String(order.status)]}</span><span className="adminRecentType">{statusLabels[String(order.purchaseType)]}</span></Link></li>)}</ul>
        <div className="adminSectionHeading"><h2>Administrar</h2></div>
        <div className="adminModelGrid">{adminSections.map(model => <Link key={model.name} href={`/admin/${model.slug}`}><strong>{model.label}</strong><span>{data[model.name].length} registros</span></Link>)}</div>
    </>;
}
