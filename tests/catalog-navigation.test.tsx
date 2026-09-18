// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import Catalog from '@/components/sections/catalog/Catalog';

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('next/navigation', () => ({ usePathname: () => '/catalogo', useSearchParams: () => new URLSearchParams('q=lavanda'), useRouter: () => ({ push }) }));
vi.mock('@/components/providers/ConsultationProvider', () => ({ useConsultation: () => ({ items: [], addItem: vi.fn() }) }));
vi.mock('@/lib/use-animation', () => ({ useAnimation: () => ({ current: null }) }));
afterEach(cleanup);

test('categoría, orden y limpiar resultados actualizan la URL sin navegar al servidor', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const history = vi.spyOn(window.history, 'pushState').mockImplementation(() => {});
    render(<Catalog products={[]} categories={[{ value: '', label: 'Todas' }, { value: 'aromas', label: 'Aromas' }]} />);
    fireEvent.click(screen.getByRole('radio', { name: 'Aromas' }));
    expect(history).toHaveBeenLastCalledWith(null, '', '/catalogo?q=lavanda&categoria=aromas');
    fireEvent.click(screen.getByRole('radio', { name: 'Precio: menor a mayor' }));
    expect(history.mock.calls.at(-1)?.[2]).toContain('q=lavanda&orden=');
    fireEvent.click(screen.getByRole('button', { name: 'Ver todos los productos' }));
    expect(history).toHaveBeenLastCalledWith(null, '', '/catalogo');
    expect(push).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
});
