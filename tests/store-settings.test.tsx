// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, test, vi } from 'vitest';

import StoreSettings from '@/components/admin/storeSettings/StoreSettings';

const { save } = vi.hoisted(() => ({ save: vi.fn() }));
vi.mock('@/components/admin/AdminProvider', () => ({ useAdmin: () => ({ revision: 0 }) }));
vi.mock('@/components/providers/SiteSettingsProvider', () => ({ useSiteSettings: () => ({ settings: { name: 'Local', address: 'Anterior', whatsapp: '', instagram: '', hours: '', wholesaleText: '', wholesaleMinimum: '0', wholesaleMinimumUnits: 2 }, updateSettings: save }) }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

test('Guarda todos los campos juntos, conserva el borrador ante un error y permite cancelar', async () => {
    save.mockResolvedValueOnce('Error de conexión');
    const user = userEvent.setup();
    render(<StoreSettings />);
    const name = screen.getByLabelText('Nombre del comercio') as HTMLInputElement;
    const address = screen.getByLabelText('Dirección') as HTMLInputElement;
    await user.clear(name); await user.type(name, 'Nuevo local');
    await user.clear(address); await user.type(address, 'Nueva dirección');
    await user.tab();
    expect(save).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith(expect.objectContaining({ name: 'Nuevo local', address: 'Nueva dirección', wholesaleMinimum: '0', wholesaleMinimumUnits: '2' }));
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Error de conexión');
    expect(name.value).toBe('Nuevo local');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(name.value).toBe('Local');
    expect(address.value).toBe('Anterior');
    expect(save).toHaveBeenCalledTimes(1);
});
