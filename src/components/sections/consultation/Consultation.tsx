'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

import { useConsultation } from '@/components/providers/ConsultationProvider';
import { customerDetailsError } from '@/lib/customer-validation';
import { useAnimation } from '@/lib/use-animation';

import { animateConsultation } from './consultation.animation';
import ConsultationItem from './consultationItem/ConsultationItem';
import { buildMessage, type CustomerDetails, formatAmount, getEstimate } from './consultationUtils';
import CustomerForm from './customerForm/CustomerForm';
import MessagePreview from './messagePreview/MessagePreview';

import type { CatalogProduct } from '@/data/products';

import './_consultation.scss';

export default function Consultation({ products: catalogProducts, purchaseType = 'RETAIL', account, wholesaleMinimum = 0, wholesaleMinimumUnits = 2 }: { products: CatalogProduct[]; purchaseType?: 'RETAIL' | 'WHOLESALE'; account?: { name: string; business: string; phone?: string } | null; wholesaleMinimum?: number; wholesaleMinimumUnits?: number }) {
    const animationRef = useAnimation<HTMLDivElement>(animateConsultation);
    const { items, updateQuantity, removeItem, clearItems } = useConsultation();
    const router = useRouter();
    const submission = useRef({ fingerprint: '', key: '' });
    const [customer, setCustomer] = useState<CustomerDetails>({ name: account?.name ?? '', phone: account?.phone ?? '', business: account?.business ?? '', comment: '' });
    const lines = items.flatMap((item) => {
        const product = catalogProducts.find(product => product.variants?.some(v => v.id === item.id));
        const variant = product?.variants?.find(v => v.id === item.id);
        return product && variant ? [{ product: { ...product, id: variant.id, variantId: variant.id, stock: variant.stock, name: `${product.name} | ${variant.name}`, sku: variant.sku, price: variant.price, priceFrom: false }, quantity: item.quantity }] : [];
    });
    const unavailableItems = items.filter(item => !lines.some(line => line.product.variantId === item.id));
    const insufficientStock = lines.some(line => line.product.stock != null && line.quantity > line.product.stock);
    const estimate = getEstimate(lines);
    const remaining = Math.max(0, Math.round((wholesaleMinimum - estimate.amount) * 100) / 100);
    const units = lines.reduce((sum, line) => sum + line.quantity, 0);
    const missingUnits = Math.max(0, wholesaleMinimumUnits - units);
    const minimumBlocked = purchaseType === 'WHOLESALE' && (remaining > 0 || missingUnits > 0);
    const message = buildMessage(lines, purchaseType, customer);
    const blockedReason = unavailableItems.length ? 'Hay artículos que ya no están disponibles. Quitalos de tu consulta para continuar.' : insufficientStock ? 'El stock cambió: reducí las cantidades que superan lo disponible o quitá los artículos agotados para continuar.' : minimumBlocked ? 'Tu consulta todavía no alcanza los mínimos mayoristas indicados arriba.' : customerDetailsError(customer);
    async function submitInquiry() {
        const error = customerDetailsError(customer);
        if (error) throw new Error(error);
        if (unavailableItems.length || insufficientStock || minimumBlocked) throw new Error('Revisá los artículos y las cantidades de tu consulta antes de enviarla.');
        const payload = { customer, purchaseType, items: lines.map(line => ({ variantId: line.product.variantId, quantity: line.quantity })) };
        const fingerprint = JSON.stringify(payload);
        if (submission.current.fingerprint !== fingerprint) submission.current = { fingerprint, key: crypto.randomUUID() };
        const response = await fetch('/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, idempotencyKey: submission.current.key }) });
        const result = await response.json();
        if (!response.ok) { router.refresh(); throw new Error(result.error); }
        return `Consulta CONS-${String(result.number).padStart(4, '0')} enviada al local.`;
    }
    return (
        <div ref={animationRef} className="consultationContent">
            <header className="consultationHeader">
                <h1>Mi consulta</h1>
                <p>Esta lista no es una compra: la enviás y te respondemos con precios finales y disponibilidad.</p>
            </header>
            <div className="consultationAccountBar">
                <p>{purchaseType === 'WHOLESALE' ? 'Consulta mayorista · precios de tu cuenta aprobada' : 'Consulta minorista'}</p>
                <Link href="/mayoristas/cuenta" className="consultationButton consultationAccountLink">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="12" cy="8" r="3.5" /><path d="M5 21v-2a7 7 0 0 1 14 0v2" /></svg>
                    {purchaseType === 'WHOLESALE' ? 'Mi cuenta mayorista' : 'Acceso mayorista'}
                    <span aria-hidden="true">→</span>
                </Link>
            </div>
            {items.length ? <>
                <ul className="consultationItems">
                    {lines.map((line) => <li key={line.product.id}><ConsultationItem {...line} onQuantityChange={(quantity) => updateQuantity(line.product.id, quantity, line.product.stock)} onRemove={() => removeItem(line.product.id)} /></li>)}
                </ul>
                {unavailableItems.length > 0 && <section className="consultationUnavailable" aria-label="Artículos guardados para revisar">
                    <h2>Artículos para revisar</h2>
                    <p>Estos artículos siguen en tu lista, pero su variante ya no aparece en el catálogo actual. Buscalos en el catálogo para volver a elegirlos o quitalos antes de enviar la consulta.</p>
                    <ul>{unavailableItems.map(item => <li key={item.id}>
                        <div><h3>{item.name}</h3><p>Cantidad guardada: {item.quantity} · Variante no disponible</p></div>
                        <button type="button" className="consultationButton" onClick={() => removeItem(item.id)} aria-label={`Quitar ${item.name}`}>Quitar</button>
                    </li>)}</ul>
                    <Link href="/catalogo" className="consultationButton">Revisar catálogo</Link>
                </section>}
                <div className="consultationSummary">
                    <p aria-live="polite">{unavailableItems.length ? 'Subtotal del catálogo actual (excluye artículos para revisar): ' : estimate.incomplete ? 'Subtotal de artículos con precio (faltan importes por confirmar): ' : 'Estimado (precios a confirmar): '}<strong>{formatAmount(estimate.amount)}</strong></p>
                    <button type="button" onClick={clearItems}>Vaciar consulta</button>
                </div>
                    {purchaseType === 'WHOLESALE' && wholesaleMinimum > 0 && <p role="status" className='consultationWarning'>Mínimo mayorista: <strong>{formatAmount(wholesaleMinimum)}</strong>. {remaining > 0 ? `Te faltan ${formatAmount(remaining)} para enviar tu consulta.` : 'Tu pedido alcanza el mínimo.'} {estimate.incomplete && 'Los artículos sin precio no suman para alcanzar el mínimo.'}</p>}
                {purchaseType === 'WHOLESALE' && <p role="status" className="consultationWarning">Mínimo mayorista: <strong>{wholesaleMinimumUnits} unidades</strong> en total. {missingUnits > 0 ? `Te ${missingUnits === 1 ? 'falta 1 unidad' : `faltan ${missingUnits} unidades`} para enviar tu consulta.` : 'Tu pedido alcanza la cantidad mínima.'}</p>}
                <div className="consultationColumns">
                    <CustomerForm value={customer} wholesale={purchaseType === 'WHOLESALE'} onChange={setCustomer} />
                    <MessagePreview message={message} onSubmit={submitInquiry} blocked={Boolean(blockedReason)} blockedReason={blockedReason ?? undefined} />
                </div>
            </> : <section className="consultationEmpty">
                <h2>Tu consulta está vacía</h2>
                <p>Elegí productos del catálogo para armar tu lista.</p>
                <Link href="/catalogo" className="consultationButton consultationButtonPrimary">Explorar catálogo</Link>
            </section>}
        </div>
    );
}
