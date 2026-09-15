'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { useConsultation } from '@/components/providers/ConsultationProvider';
import type { CatalogProduct } from '@/data/products';
import ConsultationItem from './consultationItem/ConsultationItem';
import CustomerForm from './customerForm/CustomerForm';
import MessagePreview from './messagePreview/MessagePreview';
import { buildMessage, formatAmount, getEstimate, type CustomerDetails } from './consultationUtils';
import './_consultation.scss';

export default function Consultation({ products: catalogProducts }: { products: CatalogProduct[] }) {
    const { items, purchaseType, setPurchaseType, updateQuantity, removeItem, clearItems } = useConsultation();
    const submission = useRef({ fingerprint: '', key: '' });
    const [customer, setCustomer] = useState<CustomerDetails>({ name: '', phone: '', business: '', comment: '' });
    const lines = items.flatMap((item) => {
        const product = catalogProducts.find(product => product.variants?.some(v => v.id === item.id));
        const variant = product?.variants?.find(v => v.id === item.id);
        return product && variant ? [{ product: { ...product, id: variant.id, variantId: variant.id, stock: variant.stock, name: `${product.name} | ${variant.name}`, sku: variant.sku, price: variant.price, priceFrom: false }, quantity: item.quantity }] : [];
    });
    const estimate = getEstimate(lines);
    const message = buildMessage(lines, purchaseType, customer);
    async function submitInquiry() {
        const payload = { customer, purchaseType, items: lines.map(line => ({ variantId: line.product.variantId, quantity: line.quantity })) };
        const fingerprint = JSON.stringify(payload);
        if (submission.current.fingerprint !== fingerprint) submission.current = { fingerprint, key: crypto.randomUUID() };
        const response = await fetch('/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, idempotencyKey: submission.current.key }) });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        return `Consulta CONS-${String(result.number).padStart(4, '0')} enviada al local.`;
    }
    return (
        <div className="consultationContent">
            <header className="consultationHeader">
                <h1>Mi consulta</h1>
                <p>Esta lista no es una compra: la enviás y te respondemos con precios finales y disponibilidad.</p>
            </header>
            <fieldset className="consultationMode">
                <legend>Tipo de compra</legend>
                {(['RETAIL', 'WHOLESALE'] as const).map((type) => (
                    <label key={type}><input type="radio" name="purchaseType" checked={purchaseType === type} onChange={() => setPurchaseType(type)} /><span>{type === 'RETAIL' ? 'Por menor' : 'Por mayor'}</span></label>
                ))}
            </fieldset>
            {lines.length ? <>
                <ul className="consultationItems">
                    {lines.map((line) => <li key={line.product.id}><ConsultationItem {...line} onQuantityChange={(quantity) => updateQuantity(line.product.id, quantity, line.product.stock)} onRemove={() => removeItem(line.product.id)} /></li>)}
                </ul>
                <div className="consultationSummary">
                    <p aria-live="polite">{estimate.incomplete ? 'Subtotal de artículos con precio (faltan importes por confirmar): ' : 'Estimado (precios a confirmar): '}<strong>{formatAmount(estimate.amount)}</strong></p>
                    <button type="button" onClick={clearItems}>Vaciar consulta</button>
                </div>
                <div className="consultationColumns">
                    <CustomerForm value={customer} wholesale={purchaseType === 'WHOLESALE'} onChange={setCustomer} />
                    <MessagePreview message={message} onSubmit={submitInquiry} />
                </div>
            </> : <section className="consultationEmpty">
                <h2>Tu consulta está vacía</h2>
                <p>Elegí productos del catálogo para armar tu lista.</p>
                <Link href="/catalogo" className="consultationButton consultationButtonPrimary">Explorar catálogo</Link>
            </section>}
        </div>
    );
}
