import Link from 'next/link';

export default function ProductNotFound() {
    return (
        <main className="not-found-page">
            <div>
                <h1>Producto no encontrado</h1>
                <p>Este producto no está disponible en el catálogo.</p>
                <Link href="/catalogo">Volver al catálogo</Link>
            </div>
        </main>
    );
}
