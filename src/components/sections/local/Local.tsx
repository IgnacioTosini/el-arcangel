'use client';
import { useAnimation } from '@/lib/use-animation';
import { animateLocal } from './local.animation';

import { useSiteSettings } from '@/components/providers/SiteSettingsProvider';
import InquiryCallout from './inquiryCallout/InquiryCallout';
import './_local.scss';

export default function Local() {
    const animationRef = useAnimation<HTMLElement>(animateLocal);
    const { settings } = useSiteSettings();
    return (
        <section ref={animationRef} className="localContent" aria-labelledby="localTitle">
            <h1 id="localTitle" className="localTitle">El local</h1>
            <p className="localDescription">
                {settings.name} es una santería y regalería con venta por mayor y menor: sahumerios,
                portasahumerios, imágenes religiosas, budas y figuras decorativas.
            </p>
            <dl className="localDetails">
                <div className="localDetail">
                    <dt>Instagram</dt>
                    <dd>
                        {settings.instagram ? <a href={settings.instagram} target="_blank" rel="noopener noreferrer">Instagram</a> : 'A confirmar con el comercio.'}
                    </dd>
                </div>
                <div className="localDetail">
                    <dt>Dirección</dt>
                    <dd>{settings.address || 'A confirmar con el comercio.'}</dd>
                </div>
                <div className="localDetail">
                    <dt>Horarios</dt>
                    <dd>{settings.hours || 'A confirmar con el comercio.'}</dd>
                </div>
                <div className="localDetail">
                    <dt>WhatsApp</dt>
                    <dd>{settings.whatsapp ? <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noopener noreferrer">+{settings.whatsapp}</a> : 'A confirmar con el comercio.'}</dd>
                </div>
            </dl>
            <InquiryCallout />
        </section>
    );
}
