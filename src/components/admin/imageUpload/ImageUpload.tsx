'use client';

import Image from 'next/image';
import { useId, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { ImageService, type UploadedImage } from '@/services/ImageService';
import { commitImageChange } from '@/services/imageCommit';
import type { ImageUploadFolder } from '@/lib/image-upload-folders';
import { IMAGE_MIME_TYPES } from '@/lib/image-upload-validation';
import './_imageUpload.scss';

type ImageUploadProps = {
    folder: ImageUploadFolder;
    url?: string | null;
    publicId?: string | null;
    onUploaded: (image: UploadedImage) => string | null | Promise<string | null>;
    onRemove?: () => string | null | void | Promise<string | null | void>;
};

export default function ImageUpload({ folder, url, publicId, onUploaded, onRemove }: ImageUploadProps) {
    const id = useId();
    const lock = useRef(false);
    const [busy, setBusy] = useState(false);
    const [pending, setPending] = useState<UploadedImage | null>(null);
    const [confirmRemove, setConfirmRemove] = useState(false);
    const [cleanupId, setCleanupId] = useState<string | null>(null);
    const displayedUrl = pending?.url ?? url;
    const preview = displayedUrl && (/^\/(?!\/)/.test(displayedUrl) || displayedUrl.startsWith('https://res.cloudinary.com/'));
    const remoteId = url?.startsWith('https://res.cloudinary.com/') ? publicId : null;

    async function run(action: () => Promise<void>) {
        if (lock.current) return;
        lock.current = true; setBusy(true);
        try { await action(); } catch (error) { toast.error(error instanceof Error ? error.message : 'No se pudo completar la operación.'); }
        finally { lock.current = false; setBusy(false); }
    }

    return <div className="imageUploadContent" aria-busy={busy}>
        {preview && <Image src={displayedUrl} alt={pending ? 'Vista previa pendiente de confirmar' : 'Imagen cargada'} width={120} height={120} />}
        <div><label htmlFor={id}>{url ? 'Reemplazar imagen' : 'Subir imagen'}</label>
            <input id={id} type="file" accept={IMAGE_MIME_TYPES.join(',')} disabled={busy || Boolean(pending) || Boolean(cleanupId)} onChange={event => {
                const file = event.target.files?.[0]; event.target.value = '';
                if (!file) return;
                void run(async () => {
                    const result = await ImageService.uploadImage(file, { folder });
                    if (!result.success) throw new Error(result.error);
                    setPending(result);
                    toast.info('Imagen subida. Revisala y confirmá para aplicar el cambio.');
                });
            }} />
            <small>JPG, PNG o WebP · hasta 10 MB</small>
            {pending && <div>
                <button type="button" className="adminButton adminButtonPrimary" disabled={busy} onClick={() => void run(async () => {
                    const warning = await commitImageChange(() => onUploaded(pending), remoteId, pending.public_id);
                    setPending(null);
                    if (warning) { setCleanupId(remoteId ?? null); toast.warning(`Cambio confirmado. No se pudo borrar la imagen anterior: ${warning}`); }
                    else toast.success('Imagen confirmada.');
                })}>Confirmar imagen</button>
                <button type="button" className="adminButton" disabled={busy} onClick={() => void run(async () => {
                    const result = await ImageService.deleteImage(pending.public_id);
                    if (!result.success) throw new Error(result.error);
                    setPending(null); toast.info('Cambio cancelado. La imagen anterior se conserva.');
                })}>Cancelar</button>
            </div>}
            {url && onRemove && !pending && !confirmRemove && <button type="button" className="adminDelete" disabled={busy} onClick={() => setConfirmRemove(true)}>Quitar imagen</button>}
            {confirmRemove && onRemove && <div>
                <p>¿Confirmás quitar esta imagen{remoteId ? ' y eliminarla de Cloudinary' : ''}?</p>
                <button type="button" className="adminButton" disabled={busy} onClick={() => void run(async () => {
                    const warning = await commitImageChange(onRemove, remoteId);
                    setConfirmRemove(false);
                    if (warning) { setCleanupId(remoteId ?? null); toast.warning(`Imagen desvinculada. No se pudo borrar el archivo: ${warning}`); }
                    else toast.success('Imagen eliminada.');
                })}>Confirmar eliminación</button>
                <button type="button" className="adminButton" disabled={busy} onClick={() => setConfirmRemove(false)}>Cancelar</button>
            </div>}
            {cleanupId && <button type="button" className="adminButton" disabled={busy} onClick={() => void run(async () => {
                const result = await ImageService.deleteImage(cleanupId);
                if (!result.success) throw new Error(result.error);
                setCleanupId(null); toast.success('Archivo anterior eliminado.');
            })}>Reintentar limpieza</button>}
            {busy && <p role="status">Procesando imagen…</p>}
        </div>
    </div>;
}
