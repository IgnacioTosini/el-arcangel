// @vitest-environment jsdom
import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';

import { useAnimation } from '@/lib/use-animation';

const { revert, add, animate } = vi.hoisted(() => ({ revert: vi.fn(), add: vi.fn(), animate: vi.fn() }));
vi.mock('@/lib/gsap', () => ({ gsap: { matchMedia: () => ({ add, revert }) } }));

function Fixture({ revision = 0 }: { revision?: number }) {
    const ref = useAnimation(animate, revision);
    return <div ref={ref}>Contenido accesible</div>;
}
afterEach(cleanup);

test('delimita la animación al componente y limpia la instancia al actualizar o desmontar', async () => {
    vi.stubGlobal('matchMedia', vi.fn());
    const view = render(<Fixture />);
    await waitFor(() => expect(add).toHaveBeenCalledOnce());
    expect(add).toHaveBeenCalledWith('(prefers-reduced-motion: no-preference)', expect.any(Function), view.container.firstChild);
    view.rerender(<Fixture revision={1} />);
    await waitFor(() => expect(add).toHaveBeenCalledTimes(2));
    expect(revert).toHaveBeenCalledOnce();
    view.unmount();
    expect(revert).toHaveBeenCalledTimes(2);
});

test('sin soporte de animación el contenido sigue disponible', () => {
    vi.stubGlobal('matchMedia', undefined);
    const view = render(<Fixture />);
    expect(view.container.textContent).toBe('Contenido accesible');
    expect(add).not.toHaveBeenCalled();
});
