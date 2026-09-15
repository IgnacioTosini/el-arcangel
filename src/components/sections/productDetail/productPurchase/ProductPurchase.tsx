'use client';

import Link from 'next/link';
import ProductPrice from '@/components/ui/productPrice/ProductPrice';
import { useId, useState, type FormEvent } from 'react';
import { useConsultation } from '@/components/providers/ConsultationProvider';
import type { CatalogProduct } from '@/data/products';
import './_productPurchase.scss';

export default function ProductPurchase({ product }: { product: CatalogProduct }) {
    const id = useId();
    const [variantId, setVariantId] = useState(product.defaultVariantId ?? product.variants?.[0]?.id ?? '');
    const variant = product.variants?.find(v => v.id === variantId);
    const unavailable = !variant || variant.stock === 0;
    const [quantity, setQuantity] = useState('1');
    const { addItem, items } = useConsultation();

    const inCart = items.find(item => item.id === variant?.id)?.quantity ?? 0;
    const remaining = Math.max(0, Math.min(999, variant?.stock ?? 999) - inCart);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const amount = Number(quantity);
        if (!Number.isSafeInteger(amount) || amount < 1 || amount > remaining || unavailable) return;
        addItem({ id: variant!.id, name: product.name, stock: variant!.stock }, amount);
    }

    return (
        <div className="productPurchaseContent">
            <form className="productPurchaseForm" onSubmit={handleSubmit}>
                {product.variants && <label>Variante<select value={variantId} onChange={event => { setVariantId(event.target.value); setQuantity('1'); }}>{product.variants.map(v => <option key={v.id} value={v.id}>{v.name}{v.stock === 0 ? ' | Agotada' : ''}</option>)}</select></label>}
                {variant && <p><ProductPrice price={variant.price} compareAtPrice={variant.compareAtPrice} /></p>}
                <p>{variant?.stock == null ? 'Stock a confirmar' : `${variant.stock} disponibles`}{inCart > 0 ? ` | ${inCart} en tu consulta` : ''}</p>
                <label htmlFor={id}>Cantidad</label>
                <input id={id} type="number" min={1} max={remaining} step={1} required value={quantity} onChange={(event) => setQuantity(event.target.value)} disabled={unavailable || remaining === 0} />
                <button type="submit" className="productPurchaseButton" disabled={unavailable || remaining === 0}>Agregar a mi consulta</button>
                <Link href="/mi-consulta" className="productPurchaseButton productPurchaseButtonSecondary">Ver mi consulta</Link>
            </form>
        </div>
    );
}
