import { beforeEach, expect, test, vi } from 'vitest';
import { commitImageChange } from '@/services/imageCommit';
import { ImageService } from '@/services/ImageService';

vi.mock('@/services/ImageService', () => ({ ImageService: { deleteImage: vi.fn() } }));
const deleteImage = vi.mocked(ImageService.deleteImage);
beforeEach(() => deleteImage.mockReset().mockResolvedValue({ success: true }));

test('No borra si la asociación falla o rechaza', async () => {
    await expect(commitImageChange(() => 'Validación fallida', 'old', 'new')).rejects.toThrow();
    await expect(commitImageChange(async () => { throw new Error('Falló el guardado'); }, 'old', 'new')).rejects.toThrow();
    expect(deleteImage).not.toHaveBeenCalled();
});

test('Espera confirmación de guardado antes de borrar', async () => {
    let confirm!: () => void;
    const saved = new Promise<void>(resolve => { confirm = resolve; });
    const operation = commitImageChange(async () => { await saved; return null; }, 'old', 'new');
    expect(deleteImage).not.toHaveBeenCalled();
    confirm();
    await expect(operation).resolves.toBeNull();
    expect(deleteImage).toHaveBeenCalledExactlyOnceWith('old');
});

test('No borra imágenes nuevas ni IDs iguales; comunica fallo de limpieza', async () => {
    await commitImageChange(() => null, null, 'new');
    await commitImageChange(() => null, 'same', 'same');
    expect(deleteImage).not.toHaveBeenCalled();
    deleteImage.mockResolvedValue({ success: false, error: 'Sin conexión' });
    await expect(commitImageChange(() => null, 'old', 'new')).resolves.toBe('Sin conexión');
    expect(deleteImage).toHaveBeenCalledTimes(1);
});
