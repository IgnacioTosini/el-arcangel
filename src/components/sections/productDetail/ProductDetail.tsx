import Link from 'next/link';
import ProductPrice from '@/components/ui/productPrice/ProductPrice';
import type { CatalogProduct } from '@/data/products';
import ProductGallery from './productGallery/ProductGallery';
import ProductPurchase from './productPurchase/ProductPurchase';
import './_productDetail.scss';

export default function ProductDetail({ product, purchaseType = 'RETAIL' }: { product: CatalogProduct; purchaseType?: 'RETAIL' | 'WHOLESALE' }) {

    const availability = { available: 'Disponible', unavailable: 'Agotado', inquiry: 'Consultar disponibilidad' };
    return (
        <div className="productDetailContent">
            <nav className="productDetailBreadcrumbs" aria-label="Ruta de navegación">
                <ol>
                    <li><Link href="/">Inicio</Link></li>
                    <li><Link href={`/catalogo?categoria=${product.categorySlug}`}>{product.category}</Link></li>
                    <li aria-current="page">{product.name}</li>
                </ol>
            </nav>
            <div className="productDetailGrid">
                <ProductGallery imageUrl={product.imageUrl} name={product.name} />
                <section className="productDetailInfo" aria-labelledby="productDetailTitle">
                    <p className="productDetailCategory">{product.category}</p>
                    <h1 id="productDetailTitle">{product.name}</h1>
                    <p>{purchaseType === 'WHOLESALE' ? 'Precios mayoristas' : 'Precios minoristas'}</p>
                    <p className="productDetailPrice"><ProductPrice price={product.price} compareAtPrice={product.compareAtPrice} priceFrom={product.priceFrom} /></p>
                    <span className="productDetailAvailability">{availability[product.availability]}</span>
                    <p className="productDetailDescription">{product.description ?? `Conocé ${product.name}. Consultanos por sus características y disponibilidad.`}</p>
                    <ProductPurchase product={product} />
                    <div className="productDetailNote">
                        <p>Código: {product.sku}</p>
                        <p>Precios y disponibilidad a confirmar al responder tu consulta.</p>
                        <Link href="/mayoristas">¿Comprás para tu negocio? Conocé la venta por mayor →</Link>
                    </div>
                </section>
            </div>
        </div>
    );
}
