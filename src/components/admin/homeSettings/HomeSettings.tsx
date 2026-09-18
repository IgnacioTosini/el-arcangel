'use client';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { ImageService } from '@/services/ImageService';
import { useDraftImages, type DraftImageValue } from '../draftImage/useDraftImages';
import DraftImage from '../draftImage/DraftImage';
import { useSiteSettings } from '@/components/providers/SiteSettingsProvider';
import { defaultHomeContent, readHomeContent, validateHomeContent } from '@/lib/home-content';
import InlineFields from '../inlineFields/InlineFields';
import '../storeSettings/_storeSettings.scss';

export default function HomeSettings() {
    const { settings, updateSettings } = useSiteSettings();
    const content = readHomeContent(settings.homeContent);
    const [image, setImage] = useState<DraftImageValue | null | undefined>(undefined);
    const [uploading, setUploading] = useState(false);
    const { uploads, track, resolve, reset } = useDraftImages('home');
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
        <div className="storeSettingsForm"><InlineFields saveTogether disabled={uploading} extraDirty={image !== undefined} onCancel={() => { setImage(undefined); reset(); void cleanup([...uploads.current]); }} record={{ id: 'home', ...content }} fields={[
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
            validateHomeContent(record);
            const uploaded = image ? await resolve(image.url, image.public_id) : image;
            const next = validateHomeContent({ ...record, ...(uploaded !== undefined ? { heroImageUrl: uploaded?.url ?? defaultHomeContent.heroImageUrl, heroImagePublicId: uploaded?.public_id ?? '' } : {}) });
            const error = await updateSettings({ homeContent: next });
            if (error) return error;
            uploads.current.delete(next.heroImagePublicId);
            setImage(undefined);
            reset();
            await cleanup([...new Set([...uploads.current, ...(content.heroImagePublicId && content.heroImagePublicId !== next.heroImagePublicId ? [content.heroImagePublicId] : [])])]);
            return null;
        }}>
            <h3>Imagen principal</h3>
            <p className="adminMuted">La imagen inicial es una representación del local creada con IA. Podés reemplazarla por una foto real. Quitarla restaura la ilustración inicial.</p>
            <DraftImage folder="home" url={image === undefined ? content.heroImageUrl : image?.url ?? defaultHomeContent.heroImageUrl} onBusy={setUploading} onChange={next => { track(next); setImage(next); }} />
        </InlineFields></div>
    </section>;
}
