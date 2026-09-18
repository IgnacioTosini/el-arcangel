// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import WholesaleAccount from '@/components/sections/wholesaleAccount/WholesaleAccount';

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock('@/components/providers/SiteSettingsProvider', () => ({ useSiteSettings: () => ({ settings: { whatsapp: '5492235551234' } }) }));
afterEach(cleanup);

test('WhatsApp conserva los datos enviados aunque el formulario se deshabilite mientras espera', async () => {
    let finish!: (response: unknown) => void;
    const request = vi.fn<(url: string, options: RequestInit) => Promise<unknown>>(() => new Promise(resolve => { finish = resolve; }));
    vi.stubGlobal('fetch', request);
    render(<WholesaleAccount account={null} />);
    fireEvent.click(screen.getByRole('button', { name: 'Solicitar cuenta mayorista' }));
    for (const [label, value] of [
        ['Nombre y apellido', 'María Pérez'], ['Negocio o emprendimiento', 'Mi negocio'],
        ['Teléfono con código de país', '+5492235551234'], ['Email', 'maria@example.com'],
        ['Contraseña', 'password123'], ['Repetir contraseña', 'password123'],
    ]) fireEvent.change(screen.getByLabelText(label), { target: { value } });
    fireEvent.submit(screen.getByRole('button', { name: 'Enviar solicitud' }).closest('form')!);
    expect((screen.getByLabelText('Nombre y apellido').closest('fieldset') as HTMLFieldSetElement).disabled).toBe(true);
    expect(screen.queryByRole('link', { name: 'Avisar al local por WhatsApp' })).toBeNull();
    await act(async () => finish({ ok: true, json: async () => ({ message: 'Solicitud recibida.' }) }));
    const link = screen.getByRole('link', { name: 'Avisar al local por WhatsApp' });
    const message = new URL(link.getAttribute('href')!).searchParams.get('text');
    expect(message).toContain('María Pérez');
    expect(message).toContain('Mi negocio');
    expect(message).toContain('maria@example.com');
    expect(message).not.toContain('null');
    expect(JSON.parse(String(request.mock.calls[0][1].body)).name).toBe('María Pérez');
});
