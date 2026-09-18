import axios from 'axios';
import { beforeEach, expect, test, vi } from 'vitest';

import { isImageUploadFolder } from '@/lib/image-upload-folders';
import { validateImageFile } from '@/lib/image-upload-validation';
import { ImageService } from '@/services/ImageService';

vi.mock('axios', () => ({ default: { post: vi.fn(), delete: vi.fn(), isAxiosError: vi.fn(() => false) } }));
beforeEach(() => vi.mocked(axios.post).mockReset());

test('Carpetas, formatos, tamaño vacío y límite', () => {
    expect(isImageUploadFolder('../productos')).toBe(false);
    expect(isImageUploadFolder('categorias')).toBe(true);
    expect(validateImageFile({ type: 'image/svg+xml', size: 100 })).toBeTruthy();
    expect(validateImageFile({ type: 'image/png', size: 0 })).toBeTruthy();
    expect(validateImageFile({ type: 'image/png', size: 11 * 1024 * 1024 })).toBeTruthy();
    expect(validateImageFile({ type: 'image/webp', size: 100 })).toBeNull();
});

function canvasEnvironment({ blobSize = 50, nullBlob = false, context = true } = {}) {
    const canvas = { width: 0, height: 0, getContext: () => context ? { drawImage: vi.fn() } : null, toBlob: (callback: (blob: Blob | null) => void) => callback(nullBlob ? null : new Blob(['a'.repeat(blobSize)], { type: 'image/webp' })) };
    vi.stubGlobal('Image', class { naturalWidth = 4000; naturalHeight = 2000; async decode() {} });
    vi.stubGlobal('document', { createElement: () => canvas });
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    return { canvas, revoke };
}

test('Optimización proporcional y liberación del object URL', async () => {
    const { canvas, revoke } = canvasEnvironment();
    const result = await ImageService.optimizeImage(new File(['a'.repeat(100)], 'foto.jpg', { type: 'image/jpeg' }));
    expect(result.name).toBe('foto.webp');
    expect([canvas.width, canvas.height]).toEqual([1920, 960]);
    expect(revoke).toHaveBeenCalledExactlyOnceWith('blob:test');
});

test('Conserva original si la conversión pesa más', async () => {
    canvasEnvironment({ blobSize: 200 });
    const file = new File(['a'.repeat(100)], 'foto.png', { type: 'image/png' });
    expect(await ImageService.optimizeImage(file)).toBe(file);
});

test.each([{ nullBlob: true }, { context: false }])('Rechaza canvas inválido y libera el recurso: %j', async options => {
    const { revoke } = canvasEnvironment(options);
    await expect(ImageService.optimizeImage(new File(['a'], 'foto.png', { type: 'image/png' }))).rejects.toThrow();
    expect(revoke).toHaveBeenCalledOnce();
});

test('Valida respuestas del servidor', async () => {
    canvasEnvironment();
    const file = new File(['a'.repeat(100)], 'foto.png', { type: 'image/png' });
    const good = { success: true, url: 'https://res.cloudinary.com/demo/image/upload/a.webp', public_id: 'demo/productos/a' };
    vi.mocked(axios.post).mockResolvedValueOnce({ data: good }).mockResolvedValueOnce({ data: { success: true } });
    expect(await ImageService.uploadImage(file, { folder: 'productos' })).toEqual(good);
    expect((await ImageService.uploadImage(file, { folder: 'productos' })).success).toBe(false);
});
