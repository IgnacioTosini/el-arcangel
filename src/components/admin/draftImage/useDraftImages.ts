'use client';
import { useEffect, useRef } from 'react';
import { ImageService, type UploadedImage } from '@/services/ImageService';
import type { ImageUploadFolder } from '@/lib/image-upload-folders';

export type DraftImageValue = UploadedImage & { file?: File };

export function useDraftImages(folder: ImageUploadFolder) {
    const files = useRef(new Map<string, File>());
    const resolved = useRef(new Map<string, UploadedImage>());
    const uploads = useRef(new Set<string>());
    useEffect(() => {
        const previews = files.current;
        return () => { for (const url of previews.keys()) URL.revokeObjectURL(url); };
    }, []);
    function track(image: DraftImageValue | null) {
        if (image?.file) files.current.set(image.url, image.file);
        else if (image?.public_id) uploads.current.add(image.public_id);
    }
    async function resolve(url: string, publicId: string): Promise<UploadedImage> {
        const file = files.current.get(url);
        if (!file) return { url, public_id: publicId };
        const previous = resolved.current.get(url);
        if (previous) return previous;
        const result = await ImageService.uploadImage(file, { folder });
        if (!result.success) throw new Error(result.error);
        uploads.current.add(result.public_id);
        resolved.current.set(url, result);
        return result;
    }
    function reset() {
        for (const url of files.current.keys()) URL.revokeObjectURL(url);
        files.current.clear(); resolved.current.clear();
    }
    return { track, resolve, uploads, reset };
}
