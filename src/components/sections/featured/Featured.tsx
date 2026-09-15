'use client';

import Link from 'next/link';
import ProductCard, { type ProductCardData } from '@/components/cards/productCard/ProductCard';
import { useConsultation } from '@/components/providers/ConsultationProvider';
import './_featured.scss';




export default function Featured({ products: featuredProducts }: { products: ProductCardData[] }) {
    const { addItem } = useConsultation();

    function handleAdd(product: ProductCardData) {
        if (product.defaultVariantId) addItem({ id: product.defaultVariantId, name: product.name, stock: product.stock });
    }

    return (
        <section className="featuredContent" aria-labelledby="featuredTitle">
            <div className="featuredHeader">
                <h2 id="featuredTitle" className="featuredTitle">Selección destacada</h2>
                <Link href="/catalogo" className="featuredLink">Ver todo <span aria-hidden="true">→</span></Link>
            </div>
            <ul className="featuredGrid">
                {featuredProducts.map((product) => (
                    <li key={product.id} className="featuredItem">
                        <ProductCard product={product} onAdd={handleAdd} />
                    </li>
                ))}
            </ul>

        </section>
    );
}

