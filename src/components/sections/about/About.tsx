import './_about.scss';

type AboutProps = {
    instagramUrl?: string;
};

export default function About({ instagramUrl }: AboutProps) {
    return (
        <section className="aboutContent" aria-labelledby="aboutTitle">
            <h2 id="aboutTitle" className="aboutTitle">El Arcángel</h2>
            <p className="aboutDescription">
                Santería y regalería con venta por mayor y menor: sahumerios, portasahumerios,
                imágenes religiosas, budas y figuras decorativas. Recorré el catálogo, armá tu
                lista y envianos la consulta.
            </p>
            {instagramUrl && (
                <a href={instagramUrl} className="aboutInstagram" target="_blank" rel="noopener noreferrer">
                    Seguinos en Instagram
                </a>
            )}
        </section>
    );
}
