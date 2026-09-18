'use client';
import Link from 'next/link';

import StepCard, { type StepCardProps } from '@/components/cards/stepCard/StepCard';
import { useSiteSettings } from '@/components/providers/SiteSettingsProvider';
import ActionBanner from '@/components/sections/actionBanner/ActionBanner';
import Faq from '@/components/sections/faq/Faq';
import { useAnimation } from '@/lib/use-animation';

import { animateWholesaleGuide } from './wholesaleGuide.animation';

import './_wholesaleGuide.scss';

const steps: StepCardProps[] = [
    { number: 1, title: 'Solicitá tu cuenta', description: 'Registrá los datos de tu negocio. El local revisará tu solicitud para habilitar el acceso mayorista.' },
    { number: 2, title: 'Elegí los productos', description: 'Ingresá con tu cuenta aprobada para ver precios mayoristas y agregar productos a tu consulta.' },
    { number: 3, title: 'Enviá la consulta', description: 'Te respondemos con precios mayoristas vigentes, mínimos y disponibilidad real.' },
];

const questions = [
    { question: '¿Hay un mínimo de compra?', answer: 'Los pedidos mayoristas requieren una cantidad mínima de unidades en total, que verás en Mi consulta. Si hay un importe mínimo mayorista vigente, lo verás en Mi consulta junto con el importe que te falta para alcanzarlo. Se calcula con tus precios mayoristas; los artículos sin precio no suman para el mínimo.' },
    { question: '¿Hacen envíos?', answer: 'Las condiciones de entrega se acuerdan por consulta según la zona y el volumen.' },
    { question: '¿Puedo comprar por unidad?', answer: 'Sí. Para comprar por menor no necesitás una cuenta. Si tenés una sesión mayorista abierta, cerrala para consultar los precios minoristas.' },
];

export default function WholesaleGuide() {
    const animationRef = useAnimation<HTMLDivElement>(animateWholesaleGuide);
    const { settings } = useSiteSettings();
    return (
        <div ref={animationRef} className="wholesaleGuideContent">
            <header className="wholesaleGuideHeader">
                <h1 className="wholesaleGuideTitle">Venta por mayor</h1>
                <p className="wholesaleGuideDescription">
                    {settings.wholesaleText}
                </p>
                <Link href="/mayoristas/cuenta" className="wholesaleGuideAccount">Ingresar o solicitar cuenta mayorista →</Link>
            </header>
            <ol className="wholesaleGuideSteps" aria-label="Cómo hacer una consulta mayorista">
                {steps.map((step) => <li key={step.number}><StepCard {...step} /></li>)}
            </ol>
            <ActionBanner
                title="Armá tu pedido mayorista"
                description="Con tu cuenta aprobada, el catálogo muestra tus precios mayoristas. La disponibilidad se confirma al responder tu consulta."
                primaryAction={{ label: 'Explorar catálogo', href: '/catalogo' }}
                secondaryAction={{ label: 'Ver mi consulta', href: '/mi-consulta' }}
            />
            <Faq items={questions} />
        </div>
    );
}
