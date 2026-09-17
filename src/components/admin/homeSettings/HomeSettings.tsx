'use client';
import { useSiteSettings } from '@/components/providers/SiteSettingsProvider';
import { readHomeContent, validateHomeContent } from '@/lib/home-content';
import InlineFields from '../inlineFields/InlineFields';
import '../storeSettings/_storeSettings.scss';

export default function HomeSettings() {
    const { settings, updateSettings } = useSiteSettings();
    return <section className="storeSettingsContent">
        <h2>Contenido del inicio</h2>
        <p className="adminMuted">Editá los textos y botones de la página principal. Se publican juntos al presionar Guardar cambios. Los productos y las categorías se administran desde sus propias secciones.</p>
        <div className="storeSettingsForm"><InlineFields saveTogether record={{ id: 'home', ...readHomeContent(settings.homeContent) }} fields={[
            { name: 'heroTitle', label: 'Portada · Título', full: true },
            { name: 'heroSubtitle', label: 'Portada · Subtítulo', full: true },
            { name: 'heroCatalogButton', label: 'Portada · Botón del catálogo' },
            { name: 'heroWholesaleButton', label: 'Portada · Botón mayorista' },
            { name: 'categoriesTitle', label: 'Categorías · Título', full: true },
            { name: 'featuredTitle', label: 'Destacados · Título' },
            { name: 'featuredButton', label: 'Destacados · Botón' },
            { name: 'wholesaleTitle', label: 'Mayoristas · Título', full: true },
            { name: 'wholesaleDescription', label: 'Mayoristas · Descripción', type: 'textarea', full: true },
            { name: 'wholesaleButton', label: 'Mayoristas · Botón', full: true },
            { name: 'aboutTitle', label: 'Sobre el local · Título', full: true },
            { name: 'aboutDescription', label: 'Sobre el local · Descripción', type: 'textarea', full: true },
            { name: 'aboutButton', label: 'Sobre el local · Botón de Instagram', full: true },
        ]} onSave={record => updateSettings({ homeContent: validateHomeContent(record) })} /></div>
    </section>;
}
