// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import AdminManagement from '@/components/admin/adminManagement/AdminManagement';

const location = vi.hoisted(() => ({ search: '' }));
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams(location.search) }));
vi.mock('@/components/admin/AdminProvider', () => ({ useAdmin: () => ({ revision: 0, data: {
    Product: [
        { id: 'p1', name: 'Sahumerios clásicos', active: true, categoryIds: 'c1' },
        { id: 'p2', name: 'Buda', active: false, categoryIds: 'c2' },
    ],
    ProductVariant: [
        { id: 'v1', productId: 'p1', sku: 'ARO-001', stock: 3, price: 100, wholesalePrice: 80 },
        { id: 'v2', productId: 'p1', sku: 'ARO-002', stock: 0, price: 0, wholesalePrice: null },
        { id: 'v3', productId: 'p2', sku: 'BUD-001', stock: null, price: null, wholesalePrice: 50 },
    ],
    Category: [
        { id: 'c1', name: 'Aromas', active: true, sortOrder: 0 },
        { id: 'c2', name: 'Decoración', active: false, sortOrder: 1 },
    ], Order: [],
} }) }));
vi.mock('@/components/admin/productEditor/ProductEditor', () => ({ default: ({ product }: { product: { name: string } }) => <article>{product.name}</article> }));
vi.mock('@/components/admin/categoryEditor/CategoryEditor', () => ({ default: ({ category }: { category: { name: string } }) => <article>{category.name}</article> }));
vi.mock('@/components/admin/orderCard/OrderCard', () => ({ default: () => null }));
vi.mock('@/components/admin/adminOverview/AdminOverview', () => ({ statusLabels: {} }));
afterEach(() => { cleanup(); location.search = ''; });

test('combina búsqueda por SKU, categoría y visibilidad y permite limpiar sin resultados', () => {
    render(<AdminManagement section="Product" />);
    fireEvent.change(screen.getByLabelText('Buscar productos'), { target: { value: ' aro-002 ' } });
    fireEvent.change(screen.getByLabelText('Categoría'), { target: { value: 'c1' } });
    expect(screen.getByRole('status').textContent).toBe('1 de 2 productos');
    fireEvent.change(screen.getByLabelText('Visibilidad'), { target: { value: 'hidden' } });
    expect(screen.getByText(/No se encontraron resultados/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
    expect(screen.getAllByRole('article')).toHaveLength(2);
    fireEvent.change(screen.getByLabelText('Buscar productos'), { target: { value: ' CLASICOS ' } });
    expect(screen.getByRole('article').textContent).toBe('Sahumerios clásicos');
});

test('stock distingue cero de desconocido y encuentra cualquier variante del producto', () => {
    render(<AdminManagement section="Product" />);
    for (const value of ['available', 'empty']) {
        fireEvent.change(screen.getByLabelText('Stock'), { target: { value } });
        expect(screen.getByRole('article').textContent).toBe('Sahumerios clásicos');
    }
    fireEvent.change(screen.getByLabelText('Stock'), { target: { value: 'unknown' } });
    expect(screen.getByRole('article').textContent).toBe('Buda');
});

test('categorías combina nombre sin tildes y visibilidad y restaura la lista', () => {
    render(<AdminManagement section="Category" />);
    fireEvent.change(screen.getByLabelText('Buscar categorías'), { target: { value: 'decoracion' } });
    fireEvent.change(screen.getByLabelText('Visibilidad'), { target: { value: 'hidden' } });
    expect(screen.getByRole('article').textContent).toBe('Decoración');
    expect(screen.getByRole('status').textContent).toBe('1 de 2 categorías');
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(screen.queryByLabelText('Stock')).toBeNull();
});

test('los enlaces del resumen aplican filtros y cambian al navegar entre pendientes', () => {
    location.search = 'stock=empty';
    const view = render(<AdminManagement section="Product" />);
    expect(screen.getByRole('article').textContent).toBe('Sahumerios clásicos');
    location.search = 'precio=retail';
    view.rerender(<AdminManagement section="Product" />);
    expect(screen.getByRole('article').textContent).toBe('Buda');
    location.search = 'precio=wholesale';
    view.rerender(<AdminManagement section="Product" />);
    expect(screen.getByRole('article').textContent).toBe('Sahumerios clásicos');
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
    expect(screen.getAllByRole('article')).toHaveLength(2);
});
