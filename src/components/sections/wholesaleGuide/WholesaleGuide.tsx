'use client';

import { useSiteSettings } from '@/components/providers/SiteSettingsProvider';
import StepCard, { type StepCardProps } from '@/components/cards/stepCard/StepCard';
import ActionBanner from '@/components/sections/actionBanner/ActionBanner';
import Faq from '@/components/sections/faq/Faq';
import './_wholesaleGuide.scss';

const steps: StepCardProps[] = [
    { number: 1, title: 'Elegí los productos', description: 'Recorré el catálogo y agregá a tu consulta cada artículo con la cantidad que necesitás.' },
    { number: 2, title: 'Activá el modo por mayor', description: 'En “Mi consulta” cambiá a Por mayor: el mensaje incluye tu negocio y las cantidades.' },
    { number: 3, title: 'Enviá la consulta', description: 'Te respondemos con precios mayoristas vigentes, mínimos y disponibilidad real.' },
];

const questions = [
    { question: '¿Hay un mínimo de compra?', answer: 'Cada producto tiene su propio mínimo por bulto. Lo confirmamos al responder tu consulta.' },
    { question: '¿Hacen envíos?', answer: 'Las condiciones de entrega se acuerdan por consulta según la zona y el volumen.' },
    { question: '¿Puedo comprar por unidad?', answer: 'Sí. Trabajamos venta por mayor y por menor; usá el modo Por menor en tu consulta.' },
];

export default function WholesaleGuide() {
    const { settings } = useSiteSettings();
    return (
        <div className="wholesaleGuideContent">
            <header className="wholesaleGuideHeader">
                <h1 className="wholesaleGuideTitle">Venta por mayor</h1>
                <p className="wholesaleGuideDescription">
                    {settings.wholesaleText}
                </p>
            </header>
            <ol className="wholesaleGuideSteps" aria-label="Cómo hacer una consulta mayorista">
                {steps.map((step) => <li key={step.number}><StepCard {...step} /></li>)}
            </ol>
            <ActionBanner
                title="Armá tu pedido mayorista"
                description="Los precios y mínimos que ves en el catálogo son de referencia y se confirman por consulta."
                primaryAction={{ label: 'Explorar catálogo', href: '/catalogo' }}
                secondaryAction={{ label: 'Ver mi consulta', href: '/mi-consulta' }}
            />
            <Faq items={questions} />
        </div>
    );
}
