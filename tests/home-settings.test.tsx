// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomeSettings from '@/components/admin/homeSettings/HomeSettings';
import Footer from '@/components/layout/footer/Footer';
import { defaultHomeContent } from '@/lib/home-content';

const { save, remove, upload } = vi.hoisted(() => ({ save: vi.fn(), remove: vi.fn(), upload: vi.fn() }));
vi.mock('@/services/ImageService', () => ({ ImageService: { deleteImage: remove, uploadImage: upload } }));
vi.mock('@/components/providers/SiteSettingsProvider', () => ({ useSiteSettings: () => ({ settings: { name: 'El Arcángel', address: 'Alberti 6062', hours: 'Lunes a viernes de 8 a 18', whatsapp: '5492233422597', instagram: 'https://www.instagram.com/elarcangelelarcangel/', homeContent: { ...defaultHomeContent, heroImageUrl: 'https://res.cloudinary.com/demo/old.jpg', heroImagePublicId: 'home/old' } }, updateSettings: save }) }));
vi.mock('@/components/admin/draftImage/DraftImage', () => ({ default: ({ onChange }: { onChange: (image: { url: string; public_id: string; file: File }) => void }) => <button onClick={() => onChange({ url: 'blob:preview', public_id: '', file: new File(['photo'], 'photo.jpg', { type: 'image/jpeg' }) })}>Subir foto de prueba</button> }));

beforeEach(() => {
    URL.revokeObjectURL = vi.fn();
    upload.mockResolvedValue({ success: true, url: 'https://res.cloudinary.com/demo/new.jpg', public_id: 'home/new' });
});
afterEach(() => { cleanup(); vi.resetAllMocks(); });

test('La imagen y los textos se guardan juntos; la anterior solo se elimina después del éxito', async () => {
    save.mockResolvedValueOnce('Error al guardar').mockResolvedValueOnce(null);
    remove.mockResolvedValue({ success: true });
    const user = userEvent.setup();
    render(<HomeSettings />);
    await user.click(screen.getByText('Subir foto de prueba'));
    const title = screen.getByLabelText('Portada · Título');
    await user.clear(title); await user.type(title, 'Nuevo título');
    expect(save).not.toHaveBeenCalled();
    expect(upload).not.toHaveBeenCalled();
    await user.click(screen.getByText('Guardar cambios'));
    expect(remove).not.toHaveBeenCalled();
    expect(save).toHaveBeenCalledWith({ homeContent: expect.objectContaining({ heroTitle: 'Nuevo título', heroImagePublicId: 'home/new' }) });
    await user.click(screen.getByText('Guardar cambios'));
    expect(remove).toHaveBeenCalledWith('home/old');
    expect(remove).not.toHaveBeenCalledWith('home/new');
    expect(upload).toHaveBeenCalledOnce();
});

test('Cancelar una imagen local no sube ni elimina archivos de Cloudinary', async () => {
    remove.mockResolvedValue({ success: true });
    const user = userEvent.setup();
    render(<HomeSettings />);
    await user.click(screen.getByText('Subir foto de prueba'));
    await user.click(screen.getByText('Cancelar'));
    expect(save).not.toHaveBeenCalled();
    expect(upload).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
});

test('El footer muestra la configuración del local y sus enlaces reales', () => {
    render(<Footer />);
    expect(screen.getByText('Alberti 6062')).toBeTruthy();
    expect(screen.getByText('Lunes a viernes de 8 a 18')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'WhatsApp +5492233422597' }).getAttribute('href')).toBe('https://wa.me/5492233422597');
    expect(screen.getByRole('link', { name: 'Instagram' }).getAttribute('href')).toBe('https://www.instagram.com/elarcangelelarcangel/');
});
