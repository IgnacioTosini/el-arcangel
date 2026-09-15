import { ImageService } from './ImageService';

// Primero se confirma la asociación; recién entonces se elimina el archivo anterior.
export async function commitImageChange(commit: () => string | null | void | Promise<string | null | void>, previousId?: string | null, nextId?: string) {
    const error = await commit();
    if (error) throw new Error(error);
    if (!previousId || previousId === nextId) return null;
    const result = await ImageService.deleteImage(previousId);
    return result.success ? null : result.error;
}
