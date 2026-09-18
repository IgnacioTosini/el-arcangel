import 'dotenv/config';
import { NextRequest } from 'next/server';
import { expect, test, vi } from 'vitest';

import { PATCH } from '@/app/api/settings/route';
import { defaultHomeContent, readHomeContent } from '@/lib/home-content';
import { prisma } from '@/lib/prisma';
vi.mock('@/lib/admin-session', () => ({ isAdminAuthenticated: async () => true }));

test('Publica los textos juntos, conserva datos del local y rechaza una edición inválida', async () => {
    if (!['localhost', '127.0.0.1', '[::1]'].includes(new URL(process.env.DATABASE_URL ?? '').hostname)) throw new Error('Requiere base local');
    const previous = await prisma.siteSettings.findUnique({ where: { id: 'store' } });
    const content = { ...defaultHomeContent, heroTitle: 'Inicio de prueba', aboutDescription: 'Descripción de prueba' };
    const request = (homeContent: unknown) => new NextRequest('http://localhost:3000/api/settings', { method: 'PATCH', headers: { Origin: 'http://localhost:3000', 'Content-Type': 'application/json' }, body: JSON.stringify({ homeContent }) });
    try {
        expect((await PATCH(request(content))).status).toBe(200);
        const saved = await prisma.siteSettings.findUniqueOrThrow({ where: { id: 'store' } });
        expect(readHomeContent(saved.homeContent)).toEqual(content);
        if (previous) expect(saved.whatsapp).toBe(previous.whatsapp);
        expect((await PATCH(request({ ...content, heroTitle: '' }))).status).toBe(400);
        expect(readHomeContent((await prisma.siteSettings.findUniqueOrThrow({ where: { id: 'store' } })).homeContent)).toEqual(content);
    } finally {
        if (previous) await prisma.siteSettings.update({ where: { id: 'store' }, data: { homeContent: previous.homeContent! } });
        else await prisma.siteSettings.deleteMany({ where: { id: 'store' } });
        await prisma.$disconnect();
    }
});
