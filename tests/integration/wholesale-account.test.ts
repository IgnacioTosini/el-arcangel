import 'dotenv/config';
import { randomUUID } from 'node:crypto';

import { NextRequest } from 'next/server';
import { expect, test, vi } from 'vitest';

import { DELETE as deleteAccount, PATCH } from '@/app/api/admin/wholesale/route';
import { DELETE, POST } from '@/app/api/wholesale/account/route';
import { prisma } from '@/lib/prisma';
import { createWholesaleSession, readWholesaleSession } from '@/lib/wholesale-auth';

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
        expect((await readWholesaleSession(token))?.phone).toBe(registration.phone);
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

test('Eliminar requiere administrador y mismo origen, revoca sesiones y conserva consultas', async () => {
    if (!['localhost', '127.0.0.1', '[::1]'].includes(new URL(process.env.DATABASE_URL ?? '').hostname)) throw new Error('Se requiere base local.');
    const email = `delete-${randomUUID()}@example.com`;
    const account = await prisma.wholesaleAccount.create({ data: { name: 'Prueba', business: 'Negocio', phone: '2235551234', email, passwordHash: 'unused', status: 'APPROVED' } });
    let orderId: string | undefined;
    try {
        const token = await createWholesaleSession(account.id);
        const order = await prisma.order.create({ data: { wholesaleAccountId: account.id, idempotencyKey: randomUUID(), customerName: 'Prueba', customerPhone: '2235551234', purchaseType: 'WHOLESALE' } });
        orderId = order.id;
        auth.allowed = false;
        expect((await deleteAccount(request('/api/admin/wholesale', 'DELETE', { id: account.id }))).status).toBe(401);
        auth.allowed = true;
        expect((await deleteAccount(new NextRequest(origin + '/api/admin/wholesale', { method: 'DELETE', headers: { Origin: 'https://other.example' }, body: JSON.stringify({ id: account.id }) }))).status).toBe(403);
        expect((await deleteAccount(request('/api/admin/wholesale', 'DELETE', { id: '' }))).status).toBe(400);
        expect((await deleteAccount(request('/api/admin/wholesale', 'DELETE', { id: account.id }))).status).toBe(200);
        expect(await prisma.wholesaleAccount.findUnique({ where: { id: account.id } })).toBeNull();
        expect(await readWholesaleSession(token)).toBeNull();
        expect(await prisma.wholesaleSession.count({ where: { accountId: account.id } })).toBe(0);
        expect(await prisma.order.findUnique({ where: { id: order.id } })).toMatchObject({ wholesaleAccountId: null, customerName: 'Prueba', purchaseType: 'WHOLESALE' });
    } finally {
        if (orderId) await prisma.order.deleteMany({ where: { id: orderId } });
        await prisma.wholesaleAccount.deleteMany({ where: { id: account.id } });
        auth.allowed = false;
        await prisma.$disconnect();
    }
});
