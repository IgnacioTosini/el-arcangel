// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import WholesaleAccounts from '@/components/admin/wholesaleAccounts/WholesaleAccounts';
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
const accounts = [
    { id: 'a', name: 'María', email: 'maria@example.com', phone: '2235551111', business: 'Local', status: 'PENDING', createdAt: '2026-09-17T12:00:00Z', orderCount: 2 },
    { id: 'b', name: 'Pedro', email: 'pedro@example.com', phone: '2235552222', business: 'Bazar', status: 'APPROVED', createdAt: '2026-09-17T12:00:00Z', orderCount: 0 },
];
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
test('filtra cuentas por estado y nombre y enlaza su historial', () => {
    render(<WholesaleAccounts accounts={accounts} />);
    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Ver consultas (2)' }).getAttribute('href')).toBe('/admin/pedidos?cuenta=a');
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
    expect(screen.getAllByRole('article')).toHaveLength(2);
    fireEvent.change(screen.getByLabelText('Buscar cuentas'), { target: { value: 'maria' } });
    expect(screen.getAllByRole('article')).toHaveLength(1);
});
test('cambiar el estado requiere confirmar y cancelar no envía cambios', async () => {
    const request = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    vi.stubGlobal('fetch', request);
    render(<WholesaleAccounts accounts={accounts} />);
    fireEvent.change(screen.getByLabelText('Estado de María'), { target: { value: 'APPROVED' } });
    expect(request).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(request).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Estado de María'), { target: { value: 'APPROVED' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar cambio' }));
    await waitFor(() => expect(request).toHaveBeenCalledOnce());
    expect(JSON.parse(request.mock.calls[0][1].body)).toEqual({ id: 'a', status: 'APPROVED' });
});
