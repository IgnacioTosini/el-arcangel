'use client';

import { useSiteSettings } from '@/components/providers/SiteSettingsProvider';

import { useAdmin } from '../AdminProvider';
import InlineFields from '../inlineFields/InlineFields';

import './_storeSettings.scss';

export default function StoreSettings() {
    const { settings, updateSettings } = useSiteSettings();
    const { revision } = useAdmin();
    return <section className="storeSettingsContent"><h2>Datos del local</h2><p className="adminMuted">Estos datos se muestran en el footer y en El local. Los campos vacíos no se muestran en el footer. Todos los cambios se aplican al presionar Guardar cambios. Un WhatsApp válido habilita el botón en Mi consulta.</p>
        <div className="storeSettingsForm"><InlineFields saveTogether key={revision} record={{ id:'store', ...Object.fromEntries(Object.entries(settings).filter(([key]) => key !== 'homeContent')) }} fields={[
            { name:'name',label:'Nombre del comercio' },{ name:'whatsapp',label:'WhatsApp (con código de país, sin +)',optional:true,placeholder:'Ej: 5491155551234' },
            { name:'instagram',label:'Instagram',optional:true },{ name:'address',label:'Dirección',optional:true,placeholder:'Sin confirmar' },{ name:'hours',label:'Horarios de atención',optional:true,full:true,placeholder:'Sin confirmar' },
            { name:'wholesaleText',label:'Texto para mayoristas',type:'textarea',full:true },
            { name:'wholesaleMinimum',label:'Importe mínimo mayorista ($) · 0 desactiva el mínimo',type:'number',step:'0.01',full:true },
            { name:'wholesaleMinimumUnits',label:'Unidades mínimas por pedido mayorista · al menos 2',type:'number',full:true },
        ]} onSave={record => updateSettings(Object.fromEntries(Object.entries(record).filter(([key]) => key !== 'id' && key !== 'homeContent').map(([key, value]) => [key, String(value ?? '')])))} /></div>
    </section>;
}
