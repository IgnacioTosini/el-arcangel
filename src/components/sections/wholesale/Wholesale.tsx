import Link from 'next/link';
import './_wholesale.scss';

export default function Wholesale() {
    return (
        <section className="wholesaleContent" aria-labelledby="wholesaleTitle">
            <div className="wholesaleInner">
                <h2 id="wholesaleTitle" className="wholesaleTitle">¿Comprás para tu negocio?</h2>
                <p className="wholesaleDescription">
                    Armá una lista con los productos y las cantidades que necesitás y consultanos
                    las condiciones mayoristas. Te respondemos con precios y disponibilidad.
                </p>
                <Link href="/mayoristas" className="wholesaleButton">Armar consulta mayorista</Link>
            </div>
        </section>
    );
}
