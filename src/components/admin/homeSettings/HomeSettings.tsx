'use client';
import { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { ImageService, type UploadedImage } from '@/services/ImageService';
import DraftImage from '../draftImage/DraftImage';
import { useSiteSettings } from '@/components/providers/SiteSettingsProvider';
import { defaultHomeContent, readHomeContent, validateHomeContent } from '@/lib/home-content';
import InlineFields from '../inlineFields/InlineFields';
import '../storeSettings/_storeSettings.scss';

export default function HomeSettings() {
    const { settings, updateSettings } = useSiteSettings();
    const content = readHomeContent(settings.homeContent);
    const [image, setImage] = useState<UploadedImage | null | undefined>(undefined);
    const [uploading, setUploading] = useState(false);
    const uploads = useRef(new Set<string>());
    async function cleanup(ids: string[]) {
        for (const id of ids) {
            const result = await ImageService.deleteImage(id);
            if (!result.success) toast.warning('Los cambios se conservaron, pero no se pudo limpiar una imagen anterior.');
            else uploads.current.delete(id);
        }
    }
    return <section className="storeSettingsContent">
        <h2>Contenido del inicio</h2>
        <p className="adminMuted">Editá los textos y botones de la página principal. Se publican juntos al presionar Guardar cambios. Los productos y las categorías se administran desde sus propias secciones.</p>
        <div className="storeSettingsForm"><InlineFields saveTogether disabled={uploading} extraDirty={image !== undefined} onCancel={() => { setImage(undefined); void cleanup([...uploads.current]); }} record={{ id: 'home', ...content }} fields={[
            { name: 'heroImageAlt', label: 'Descripción de la imagen (accesibilidad)', full: true },
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
            { name: 'footerDescription', label: 'Footer · Descripción del comercio', type: 'textarea', full: true },
        ]} onSave={async record => {
            const next = validateHomeContent({ ...record, ...(image !== undefined ? { heroImageUrl: image?.url ?? defaultHomeContent.heroImageUrl, heroImagePublicId: image?.public_id ?? '' } : {}) });
            const error = await updateSettings({ homeContent: next });
            if (error) return error;
            uploads.current.delete(next.heroImagePublicId);
            setImage(undefined);
            await cleanup([...new Set([...uploads.current, ...(content.heroImagePublicId && content.heroImagePublicId !== next.heroImagePublicId ? [content.heroImagePublicId] : [])])]);
            return null;
        }}>
            <h3>Imagen principal</h3>
            <p className="adminMuted">La imagen inicial es una representación del local creada con IA. Podés reemplazarla por una foto real. Quitarla restaura la ilustración inicial.</p>
            <DraftImage folder="home" url={image === undefined ? content.heroImageUrl : image?.url ?? defaultHomeContent.heroImageUrl} onBusy={setUploading} onChange={next => { if (next) uploads.current.add(next.public_id); setImage(next); }} />
        </InlineFields></div>
    </section>;
}
