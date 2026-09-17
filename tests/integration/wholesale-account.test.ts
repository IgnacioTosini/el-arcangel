import 'dotenv/config';
import { expect, test, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { POST, DELETE } from '@/app/api/wholesale/account/route';
import { PATCH } from '@/app/api/admin/wholesale/route';
import { readWholesaleSession } from '@/lib/wholesale-auth';

const { auth } = vi.hoisted(() => ({ auth: { allowed: false } }));
vi.mock('@/lib/admin-session', () => ({ isAdminAuthenticated: async () => auth.allowed }));
const origin = 'http://localhost:3000';
function request(path: string, method: string, body?: unknown, cookie?: string) {
    return new NextRequest(origin + path, { method, headers: { Origin: origin, 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
}
test('Solicitud, login, aprobación administrativa, revocación y cierre de sesión', async () => {
    if (!['localhost', '127.0.0.1', '[::1]'].includes(new URL(process.env.DATABASE_URL ?? '').hostname)) throw new Error('Se requiere base local.');
    const email = `test-${randomUUID()}@example.com`;
    const registration = { action: 'register', name: 'Prueba', business: 'Negocio', phone: '+5491155550000', email, password: 'password-test-123', confirmPassword: 'password-test-123', status: 'APPROVED' };
    try {
        expect((await POST(request('/api/wholesale/account', 'POST', { ...registration, confirmPassword: 'wrong' }))).status).toBe(400);
        expect((await POST(request('/api/wholesale/account', 'POST', registration))).status).toBe(201);
        const account = await prisma.wholesaleAccount.findUniqueOrThrow({ where: { email } });
        expect(account.status).toBe('PENDING');
        expect(account.passwordHash).not.toContain(registration.password);
        expect((await POST(request('/api/wholesale/account', 'POST', registration))).status).toBe(400);
        expect((await POST(request('/api/wholesale/account', 'POST', { action: 'login', email, password: 'incorrect-password' }))).status).toBe(401);
        const login = await POST(request('/api/wholesale/account', 'POST', { action: 'login', email, password: registration.password }));
        expect(login.status).toBe(200);
        const cookie = login.headers.get('set-cookie')!.split(';')[0];
        expect(login.headers.get('set-cookie')).toContain('HttpOnly');
        const token = cookie.split('=')[1];
        expect((await readWholesaleSession(token))?.status).toBe('PENDING');
        expect(await readWholesaleSession('a'.repeat(64))).toBeNull();
        const change = { id: account.id, status: 'APPROVED' };
        expect((await PATCH(request('/api/admin/wholesale', 'PATCH', change))).status).toBe(401);
        auth.allowed = true;
        expect((await PATCH(request('/api/admin/wholesale', 'PATCH', change))).status).toBe(200);
        expect((await readWholesaleSession(token))?.status).toBe('APPROVED');
        expect((await PATCH(request('/api/admin/wholesale', 'PATCH', { ...change, status: 'REJECTED' }))).status).toBe(200);
        expect((await readWholesaleSession(token))?.status).toBe('REJECTED');
        expect((await DELETE(request('/api/wholesale/account', 'DELETE', undefined, cookie))).status).toBe(200);
        expect(await readWholesaleSession(token)).toBeNull();
    } finally {
        await prisma.wholesaleAccount.deleteMany({ where: { email } });
        await prisma.$disconnect();
        auth.allowed = false;
    }
});
