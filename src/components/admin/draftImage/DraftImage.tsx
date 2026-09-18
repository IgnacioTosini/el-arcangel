'use client';

import Image from 'next/image';
import { useId, useRef } from 'react';
import { toast } from 'react-toastify';
import type { DraftImageValue } from './useDraftImages';
import type { ImageUploadFolder } from '@/lib/image-upload-folders';
import { IMAGE_MIME_TYPES, validateImageFile } from '@/lib/image-upload-validation';
import './_draftImage.scss';

export default function DraftImage({ url, onChange, onBusy }: {
    url?: string | null; folder: ImageUploadFolder; onChange: (image: DraftImageValue | null) => void; onBusy: (busy: boolean) => void;
}) {
    const id = useId();
    const lock = useRef(false);
    return <div className="imageUploadContent">
        {url && <Image src={url} alt="Imagen del borrador" width={120} height={120} />}
        <div><label htmlFor={id}>{url ? 'Reemplazar imagen' : 'Subir imagen'}</label>
            <input id={id} type="file" accept={IMAGE_MIME_TYPES.join(',')} onChange={async event => {
                const file = event.target.files?.[0]; event.target.value = '';
                if (!file || lock.current) return;
                lock.current = true; onBusy(true);
                try {
                    const error = validateImageFile(file);
                    if (error) throw new Error(error);
                    onChange({ url: URL.createObjectURL(file), public_id: '', file });
                } catch (error) { toast.error(error instanceof Error ? error.message : 'No se pudo subir la imagen.'); }
                finally { lock.current = false; onBusy(false); }
            }} />
            <small>Vista previa local. La imagen se sube y publica al guardar los cambios.</small>
            {url && <button type="button" className="adminDelete" onClick={() => onChange(null)}>Quitar del borrador</button>}
        </div>
    </div>;
}
