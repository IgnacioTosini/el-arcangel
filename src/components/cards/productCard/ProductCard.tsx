'use client';

import Image from 'next/image';
import ProductPrice from '@/components/ui/productPrice/ProductPrice';
import Link from 'next/link';
import { useConsultation } from '@/components/providers/ConsultationProvider';
import './_productCard.scss';

export type ProductCardData = {
    id: string;
    defaultVariantId?: string;
    defaultVariantName?: string;
    stock?: number | null;
    name: string;
    category: string;
    imageUrl: string;
    href: string;
    price: number | null;
    compareAtPrice?: number | null;
    priceFrom?: boolean;
    variants?: { id: string; name: string; sku: string; price: number | null; compareAtPrice?: number | null; stock: number | null }[];
    availability: 'available' | 'unavailable' | 'inquiry';
};

type ProductCardProps = {
    product: ProductCardData;
    onAdd: (product: ProductCardData) => void;
};

const availabilityLabels = {
    available: 'Disponible',
    unavailable: 'Agotado',
    inquiry: 'Consultar disponibilidad',
};

export default function ProductCard({ product: source, onAdd }: ProductCardProps) {
    const variant = source.variants?.find(item => item.id === source.defaultVariantId);
    const product: ProductCardData = variant ? { ...source, price: variant.price, compareAtPrice: variant.compareAtPrice, stock: variant.stock, defaultVariantName: variant.name, priceFrom: false, availability: variant.stock === 0 ? 'unavailable' : variant.stock == null ? 'inquiry' : 'available' } : source;
    const { items } = useConsultation();
    const inCart = items.find(item => item.id === product.defaultVariantId)?.quantity ?? 0;
    const atLimit = inCart >= Math.min(999, product.stock ?? 999);
    return (
        <article className="productCardContent">
            <Link href={product.href} className="productCardPicture" aria-label={`Ver ${product.name}`}>
                <Image
                    src={product.imageUrl}
                    alt={product.name}
                    className="productCardImage"
                    width={640}
                    height={800}
                    sizes="(max-width: 480px) calc(100vw - 32px), (max-width: 1000px) 50vw, (max-width: 1280px) 25vw, 296px"
                />
            </Link>
            <div className="productCardInner">
                <p className="productCardCategory">{product.category}</p>
                <h3 className="productCardTitle"><Link href={product.href}>{product.name}</Link></h3>
                <p className="productCardPrice">
                    <ProductPrice price={product.price} compareAtPrice={product.compareAtPrice} priceFrom={product.priceFrom} />
                </p>
                <span className={`productCardAvailability productCardAvailability${product.availability}`}>
                    {availabilityLabels[product.availability]}
                </span>
                <p className="productCardCategory">{product.defaultVariantName ? `${product.defaultVariantName}: ` : ''}{product.stock == null ? 'Stock a confirmar' : `${product.stock} disponibles`}{inCart > 0 ? ` | ${inCart} en tu consulta` : ''}</p>
                <div className="productCardButtons">
                    <Link href={product.href} className="productCardButton">Ver detalle</Link>
                    <button
                        type="button"
                        className="productCardButton productCardButtonPrimary"
                        disabled={product.availability === 'unavailable' || !product.defaultVariantId || atLimit}
                        aria-label={`Agregar ${product.name} a mi consulta`}
                        onClick={() => onAdd(product)}
                    >
                        {atLimit && inCart > 0 ? 'Límite alcanzado' : 'Agregar'}
                    </button>
                </div>
            </div>
        </article>
    );
}
