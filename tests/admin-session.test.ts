import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { createAdminSessionToken, verifyAdminPassword, verifyAdminSessionToken } from '@/lib/admin-session';

beforeEach(() => {
    vi.stubEnv('ADMIN_PASSWORD', 'test-password-only');
    vi.stubEnv('ADMIN_SESSION_SECRET', '');
    vi.useFakeTimers();
    vi.setSystemTime(1000000);
});
afterEach(() => vi.useRealTimers());

test('Contraseña exacta, sesión válida y expiración', async () => {
    expect(verifyAdminPassword('test-password-only')).toBe(true);
    expect(verifyAdminPassword('incorrecta')).toBe(false);
    const token = await createAdminSessionToken();
    expect(await verifyAdminSessionToken(token)).toBe(true);
    vi.advanceTimersByTime(86400000);
    expect(await verifyAdminSessionToken(token)).toBe(false);
});

test('Cambiar la contraseña invalida las sesiones anteriores', async () => {
    const token = await createAdminSessionToken();
    vi.stubEnv('ADMIN_PASSWORD', 'changed-password');
    expect(await verifyAdminSessionToken(token)).toBe(false);
});

test('Sin configuración y con tokens malformados se deniega acceso', async () => {
    vi.stubEnv('ADMIN_PASSWORD', '');
    expect(verifyAdminPassword('')).toBe(false);
    await expect(createAdminSessionToken()).rejects.toThrow();
    vi.stubEnv('ADMIN_PASSWORD', 'test-password-only');
    for (const token of [undefined, '', '1000001.invalid', '1.abc.extra', 'NaN.abc']) expect(await verifyAdminSessionToken(token)).toBe(false);
    const token = await createAdminSessionToken();
    expect(await verifyAdminSessionToken(token.replace(/\..+$/, `.${'a'.repeat(43)}`))).toBe(false);
});
