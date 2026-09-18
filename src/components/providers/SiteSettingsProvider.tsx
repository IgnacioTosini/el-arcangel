'use client';

import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { defaultHomeContent } from '@/lib/home-content';

export const defaultSiteSettings = { homeContent: defaultHomeContent, wholesaleMinimumUnits: 2, wholesaleMinimum: '0', name:'El Arcángel', whatsapp:'', instagram:'https://www.instagram.com/elarcangelelarcangel/', address:'', hours:'', wholesaleText:'Venta por mayor y menor. Las condiciones mayoristas (cantidades, precios y entregas) se confirman por consulta.' };
type SiteSettings = typeof defaultSiteSettings;
const SiteSettingsContext = createContext<{ settings: SiteSettings; updateSettings: (settings: Partial<SiteSettings>) => Promise<string | null>; resetSettings: () => void } | null>(null);

export default function SiteSettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState(defaultSiteSettings);
    async function refresh() {
        const response = await fetch('/api/settings', { cache: 'no-store' });
        if (!response.ok) throw new Error('No se pudo cargar la configuración del local.');
        const result = await response.json();
        if (result) setSettings(result);
    }
    useEffect(() => {
        let active = true;
        fetch('/api/settings', { cache: 'no-store' }).then(async response => {
            if (!response.ok) throw new Error('No se pudo cargar la configuración.');
            const result = await response.json();
            if (active && result) setSettings(result);
        }).catch(error => { if (active) toast.error(error.message); });
        return () => { active = false; };
    }, []);
    async function updateSettings(patch: Partial<SiteSettings>) {
        try {
            const response = await fetch('/api/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error);
            setSettings(result); toast.success('Datos del local guardados'); return null;
        } catch (error) { const message = error instanceof Error ? error.message : 'No se pudo guardar.'; toast.error(message); return message; }
    }
    return <SiteSettingsContext.Provider value={{ settings, updateSettings, resetSettings: () => { void refresh().catch(error => toast.error(error.message)); } }}>{children}</SiteSettingsContext.Provider>;
}
export function useSiteSettings() {
    const context = useContext(SiteSettingsContext);
    if (!context) throw new Error('useSiteSettings requiere SiteSettingsProvider');
    return context;
}
