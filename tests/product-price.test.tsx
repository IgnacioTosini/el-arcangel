// @vitest-environment jsdom
import { afterEach, expect, test } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import ProductPrice from '@/components/ui/productPrice/ProductPrice';

afterEach(cleanup);
test('Muestra el precio anterior tachado solo cuando hay una rebaja', () => {
    const { rerender, container } = render(<ProductPrice price={20} compareAtPrice={30} />);
    expect(screen.getByLabelText(/Precio anterior/).tagName).toBe('DEL');
    for (const previous of [20, 10, null]) {
        rerender(<ProductPrice price={20} compareAtPrice={previous} />);
        expect(container.querySelector('del')).toBeNull();
    }
    rerender(<ProductPrice price={null} compareAtPrice={30} />);
    expect(container.querySelector('del')).toBeNull();
    expect(screen.getByText('Consultar precio')).toBeTruthy();
});
