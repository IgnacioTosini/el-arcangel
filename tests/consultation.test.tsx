// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConsultationProvider from '@/components/providers/ConsultationProvider';
import Featured from '@/components/sections/featured/Featured';
import ProductPurchase from '@/components/sections/productDetail/productPurchase/ProductPurchase';
import Consultation from '@/components/sections/consultation/Consultation';
import type { CatalogProduct } from '@/data/products';
import { openWhatsApp } from '@/lib/open-whatsapp';

vi.mock('@/components/ui/consultationToast/ConsultationToast', () => ({ notifyConsultationAdded: vi.fn() }));
vi.mock('@/components/providers/SiteSettingsProvider', () => ({ useSiteSettings: () => ({ settings: { whatsapp: '5491112345678', instagram: '' } }) }));
vi.mock('@/lib/open-whatsapp', () => ({ openWhatsApp: vi.fn(async (_phone, _message, beforeOpen) => beforeOpen()) }));

afterEach(() => { cleanup(); localStorage.clear(); });

const product: CatalogProduct = {
    id: 'product-1', defaultVariantId: 'variant-1', name: 'Set sahumerios',
    category: 'Aromas', categorySlug: 'aromas', sku: 'DEST-002', createdAt: '2026-09-14',
    imageUrl: '/products/set-sahumerios.webp', href: '/catalogo/set-sahumerios',
    price: 6500, availability: 'available', stock: 12,
    variants: [
        { id: 'variant-1', name: 'Natural', sku: 'DEST-002', price: 6500, stock: 12 },
        { id: 'variant-2', name: 'Lavanda', sku: 'DEST-003', price: 7000, stock: 12 },
    ],
};

test('El mínimo de unidades se exige aunque no haya importe mínimo', async () => {
    localStorage.setItem('el-arcangel:consultation:v1', JSON.stringify({ items: [{ id: 'variant-1', name: product.name, quantity: 1 }] }));
    const user = userEvent.setup();
    render(<ConsultationProvider><Consultation products={[product]} purchaseType="WHOLESALE" wholesaleMinimumUnits={3} /></ConsultationProvider>);
    const button = await screen.findByRole('button', { name: 'Continuar por WhatsApp' }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(screen.getByText(/Te faltan 2 unidades/)).toBeTruthy();
    const quantity = screen.getByRole('spinbutton', { name: 'Cantidad de Set sahumerios | Natural' });
    await user.clear(quantity);
    await user.type(quantity, '3');
    await user.tab();
    expect(button.disabled).toBe(false);
});

function setup() {
    render(<ConsultationProvider>
        <Featured products={[product]} />
        <ProductPurchase product={product} />
        <Consultation products={[product]} />
    </ConsultationProvider>);
    return userEvent.setup();
}

test('Una lista recuperada con stock reducido bloquea el envío hasta corregir la cantidad', async () => {
    localStorage.setItem('el-arcangel:consultation:v1', JSON.stringify({ items: [{ id: 'variant-1', name: product.name, quantity: 5 }] }));
    const user = userEvent.setup();
    render(<ConsultationProvider><Consultation products={[{ ...product, variants: [{ ...product.variants![0], stock: 2 }] }]} /></ConsultationProvider>);
    const button = await screen.findByRole('button', { name: 'Continuar por WhatsApp' }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(screen.getByRole('alert').textContent).toContain('El stock cambió');
    const quantity = screen.getByRole('spinbutton', { name: 'Cantidad de Set sahumerios | Natural' });
    await user.clear(quantity); await user.type(quantity, '2'); await user.tab();
    expect(button.disabled).toBe(false);
});

test('Una lista mixta conserva los artículos válidos y avisa que el subtotal excluye los faltantes', async () => {
    localStorage.setItem('el-arcangel:consultation:v1', JSON.stringify({ items: [{ id: 'variant-1', name: product.name, quantity: 1 }, { id: 'deleted', name: 'Artículo anterior', quantity: 4 }] }));
    const user = userEvent.setup();
    render(<ConsultationProvider><Consultation products={[product]} /></ConsultationProvider>);
    expect(await screen.findByRole('heading', { name: 'Set sahumerios | Natural' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Artículo anterior' })).toBeTruthy();
    expect(screen.getByText(/excluye artículos para revisar/)).toBeTruthy();
    const button = screen.getByRole('button', { name: 'Continuar por WhatsApp' }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    await user.click(screen.getByRole('button', { name: 'Quitar Artículo anterior' }));
    expect(button.disabled).toBe(false);
    expect(screen.getByRole('heading', { name: 'Set sahumerios | Natural' })).toBeTruthy();
});

test('Muestra los artículos guardados que ya no encuentra en el catálogo sin ocultar la lista', async () => {
    localStorage.setItem('el-arcangel:consultation:v1', JSON.stringify({ items: [{ id: 'old-variant', name: 'Producto guardado', quantity: 5 }] }));
    const user = userEvent.setup();
    render(<ConsultationProvider><Consultation products={[product]} /></ConsultationProvider>);
    expect(await screen.findByRole('heading', { name: 'Producto guardado' })).toBeTruthy();
    expect(screen.getByText(/Cantidad guardada: 5/)).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Tu consulta está vacía' })).toBeNull();
    expect((screen.getByRole('button', { name: 'Continuar por WhatsApp' }) as HTMLButtonElement).disabled).toBe(true);
    await user.click(screen.getByRole('button', { name: 'Quitar Producto guardado' }));
    expect(screen.getByRole('heading', { name: 'Tu consulta está vacía' })).toBeTruthy();
});

test('El mínimo mayorista bloquea el envío hasta alcanzar el importe exacto', async () => {
    localStorage.setItem('el-arcangel:consultation:v1', JSON.stringify({ items: [{ id: 'variant-1', name: product.name, quantity: 1 }] }));
    const user = userEvent.setup();
    render(<ConsultationProvider><Consultation products={[product]} purchaseType="WHOLESALE" wholesaleMinimum={13000} /></ConsultationProvider>);
    const button = await screen.findByRole('button', { name: 'Continuar por WhatsApp' }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(screen.getAllByText(/Te falta/)).toHaveLength(2);
    const quantity = screen.getByRole('spinbutton', { name: 'Cantidad de Set sahumerios | Natural' });
    await user.clear(quantity);
    await user.type(quantity, '2');
    await user.tab();
    expect(button.disabled).toBe(false);
    expect(screen.getByText(/Tu pedido alcanza el mínimo/)).toBeTruthy();
});

test('El stock limita las tarjetas, la ficha y la edición de la consulta', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Agregar Set sahumerios a mi consulta' }));
    const input = screen.getByRole('spinbutton', { name: 'Cantidad' }) as HTMLInputElement;
    expect(input.max).toBe('11');
    await user.clear(input);
    await user.type(input, '12');
    await user.click(screen.getByRole('button', { name: 'Agregar a mi consulta' }));
    const cartInput = screen.getByRole('spinbutton', { name: 'Cantidad de Set sahumerios | Natural' }) as HTMLInputElement;
    expect(cartInput.value).toBe('1');
    await user.clear(input);
    await user.type(input, '11');
    await user.click(screen.getByRole('button', { name: 'Agregar a mi consulta' }));
    expect(cartInput.value).toBe('12');
    expect((screen.getByRole('button', { name: 'Agregar Set sahumerios a mi consulta' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: 'Agregar a mi consulta' }) as HTMLButtonElement).disabled).toBe(true);
    await user.clear(cartInput);
    await user.type(cartInput, '13');
    await user.tab();
    expect(Number(cartInput.value)).toBeLessThanOrEqual(12);
});

test('La tarjeta y la ficha suman la misma variante en una fila editable y eliminable', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Agregar Set sahumerios a mi consulta' }));
    await user.clear(screen.getByRole('spinbutton', { name: 'Cantidad' }));
    await user.type(screen.getByRole('spinbutton', { name: 'Cantidad' }), '3');
    await user.click(screen.getByRole('button', { name: 'Agregar a mi consulta' }));
    expect(screen.getAllByRole('heading', { name: 'Set sahumerios | Natural' })).toHaveLength(1);
    const quantity = screen.getByRole('spinbutton', { name: 'Cantidad de Set sahumerios | Natural' });
    expect((quantity as HTMLInputElement).value).toBe('4');
    await user.clear(quantity);
    await user.type(quantity, '7');
    await user.tab();
    await user.click(screen.getByRole('button', { name: 'Agregar a mi consulta' }));
    expect((quantity as HTMLInputElement).value).toBe('10');
    await user.click(screen.getByRole('button', { name: 'Quitar Set sahumerios | Natural' }));
    expect(screen.getByRole('heading', { name: 'Tu consulta está vacía' })).toBeTruthy();
});

test('Las variantes distintas del mismo producto conservan sus propias cantidades', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Agregar Set sahumerios a mi consulta' }));
    await user.selectOptions(screen.getByRole('combobox', { name: 'Variante' }), 'variant-2');
    await user.click(screen.getByRole('button', { name: 'Agregar a mi consulta' }));
    expect(screen.getByRole('heading', { name: 'Set sahumerios | Natural' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Set sahumerios | Lavanda' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Quitar Set sahumerios | Natural' }));
    expect((screen.getByRole('spinbutton', { name: 'Cantidad de Set sahumerios | Lavanda' }) as HTMLInputElement).value).toBe('1');
});

test('Recupera productos al recargar, y conserva el vaciado', async () => {
    let user = setup();
    await user.click(screen.getByRole('button', { name: 'Agregar Set sahumerios a mi consulta' }));
    cleanup();
    user = setup();
    expect(screen.getByRole('heading', { name: 'Set sahumerios | Natural' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Vaciar consulta' }));
    cleanup();
    setup();
    expect(screen.getByRole('heading', { name: 'Tu consulta está vacía' })).toBeTruthy();
});

test('Un almacenamiento corrupto no impide agregar productos', async () => {
    localStorage.setItem('el-arcangel:consultation:v1', '{invalid');
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Agregar Set sahumerios a mi consulta' }));
    expect(screen.getByRole('heading', { name: 'Set sahumerios | Natural' })).toBeTruthy();
});

test('Solo abre WhatsApp y vacía la lista después de guardar; un error permite reintentar', async () => {
    const fetchMock = vi.fn()
        .mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'No se pudo guardar' }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ number: 23 }) });
    vi.stubGlobal('fetch', fetchMock);
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Agregar Set sahumerios a mi consulta' }));
    await user.click(screen.getByRole('button', { name: 'Continuar por WhatsApp' }));
    expect(await screen.findByText('No se pudo guardar')).toBeTruthy();
    expect(openWhatsApp).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('heading', { name: 'Set sahumerios | Natural' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Continuar por WhatsApp' }));
    await waitFor(() => expect(openWhatsApp).toHaveBeenCalledWith('5491112345678', expect.stringContaining('Set sahumerios | Natural'), expect.any(Function)));
    expect(screen.getByRole('heading', { name: 'Tu consulta está vacía' })).toBeTruthy();
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).idempotencyKey).toBe(JSON.parse(fetchMock.mock.calls[1][1].body).idempotencyKey);
    cleanup();
    setup();
    expect(screen.getByRole('heading', { name: 'Tu consulta está vacía' })).toBeTruthy();
});
