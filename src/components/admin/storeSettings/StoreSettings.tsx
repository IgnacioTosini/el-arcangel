'use client';

import { useSiteSettings } from '@/components/providers/SiteSettingsProvider';
import InlineFields from '../inlineFields/InlineFields';
import { useAdmin } from '../AdminProvider';
import './_storeSettings.scss';

export default function StoreSettings() {
    const { settings, updateSettings } = useSiteSettings();
    const { revision } = useAdmin();
    return <section className="storeSettingsContent"><h2>Datos del local</h2><p className="adminMuted">Los campos vacíos están pendientes de confirmar. Los cambios se guardan en la base de datos al salir del campo. Un WhatsApp válido habilita el botón en Mi consulta.</p>
        <div className="storeSettingsForm"><InlineFields key={revision} record={{ id:'store',...settings }} fields={[
            { name:'name',label:'Nombre del comercio' },{ name:'whatsapp',label:'WhatsApp (con código de país, sin +)',optional:true,placeholder:'Ej: 5491155551234' },
            { name:'instagram',label:'Instagram',optional:true },{ name:'address',label:'Dirección',optional:true,placeholder:'Sin confirmar' },{ name:'hours',label:'Horarios de atención',optional:true,full:true,placeholder:'Sin confirmar' },
            { name:'wholesaleText',label:'Texto para mayoristas',type:'textarea',full:true },
        ]} onSave={record => updateSettings(Object.fromEntries(Object.entries(record).filter(([key]) => key !== 'id').map(([key, value]) => [key, String(value ?? '')])))} /></div>
    </section>;
}
