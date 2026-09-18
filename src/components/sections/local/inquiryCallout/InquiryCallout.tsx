import Link from 'next/link';

import './_inquiryCallout.scss';

export default function InquiryCallout() {
    return (
        <section className="inquiryCalloutContent" aria-labelledby="inquiryCalloutTitle">
            <h2 id="inquiryCalloutTitle" className="inquiryCalloutTitle">¿Querés consultar precios?</h2>
            <p className="inquiryCalloutDescription">
                Armá tu lista desde el catálogo y enviala: te respondemos con precios y disponibilidad.
            </p>
            <div className="inquiryCalloutButtons">
                <Link href="/catalogo" className="inquiryCalloutButton">Explorar catálogo</Link>
                <Link href="/mi-consulta" className="inquiryCalloutButton inquiryCalloutButtonSecondary">Mi consulta</Link>
            </div>
        </section>
    );
}
