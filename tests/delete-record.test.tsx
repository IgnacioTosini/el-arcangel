// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import DeleteRecordButton from '@/components/admin/DeleteRecordButton';

const originalShow = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal');
const originalClose = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'close');
beforeEach(() => {
    // jsdom no implementa el diálogo nativo; simulamos solo su apertura y cierre.
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value: function (this: HTMLDialogElement) { this.open = true; } });
    Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value: function (this: HTMLDialogElement) { this.open = false; } });
});
afterEach(() => {
    cleanup();
    for (const [name, descriptor] of [['showModal', originalShow], ['close', originalClose]] as const) {
        if (descriptor) Object.defineProperty(HTMLDialogElement.prototype, name, descriptor);
        else Reflect.deleteProperty(HTMLDialogElement.prototype, name);
    }
});

test('Cancelar recibe el foco y cierra sin eliminar; el foco vuelve al botón', async () => {
    const user = userEvent.setup();
    const remove = vi.fn();
    render(<DeleteRecordButton label="Eliminar producto" recordName="Buda decorativo" onDelete={remove} />);
    const trigger = screen.getByRole('button', { name: 'Eliminar producto: Buda decorativo' });
    await user.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Eliminar producto' })).toBeTruthy();
    expect(screen.getByText('Buda decorativo')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Cancelar' }));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(remove).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(trigger);
});

test('La confirmación evita duplicados y no se cierra mientras elimina', async () => {
    const user = userEvent.setup();
    let finish!: (value: null) => void;
    const remove = vi.fn(() => new Promise<null>(resolve => { finish = resolve; }));
    render(<DeleteRecordButton label="Eliminar producto" recordName="Buda" onDelete={remove} />);
    await user.click(screen.getByRole('button', { name: 'Eliminar producto: Buda' }));
    await user.click(screen.getByRole('button', { name: 'Sí, eliminar' }));
    expect((screen.getByRole('button', { name: 'Cancelar' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: 'Cerrar ventana' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { bubbles: true, cancelable: true }));
    await user.click(screen.getByRole('button', { name: 'Eliminando…' }));
    expect(remove).toHaveBeenCalledOnce();
    expect(screen.getByRole('dialog')).toBeTruthy();
    finish(null);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
});

test('Un error mantiene la confirmación abierta y permite reintentar', async () => {
    const user = userEvent.setup();
    const remove = vi.fn().mockResolvedValueOnce('No se pudo eliminar.').mockResolvedValueOnce(null);
    render(<DeleteRecordButton label="Eliminar categoría" recordName="Regalería" onDelete={remove} />);
    await user.click(screen.getByRole('button', { name: 'Eliminar categoría: Regalería' }));
    await user.click(screen.getByRole('button', { name: 'Sí, eliminar' }));
    expect((await screen.findByRole('alert')).textContent).toBe('No se pudo eliminar.');
    await user.click(screen.getByRole('button', { name: 'Sí, eliminar' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(remove).toHaveBeenCalledTimes(2);
});
