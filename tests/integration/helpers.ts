import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

import { createAdminSessionToken } from '@/lib/admin-session';

export async function integrationContext() {
    const origin = process.env.TEST_BASE_URL ?? 'http://localhost:3000';
    const localHosts = ['localhost', '127.0.0.1', '[::1]'];
    if (!localHosts.includes(new URL(origin).hostname) || !localHosts.includes(new URL(process.env.DATABASE_URL ?? '').hostname)) {
        throw new Error('Estas pruebas requieren un servidor y una base locales.');
    }
    const cookie = `admin-session=${await createAdminSessionToken()}`;
    try {
        const response = await fetch(`${origin}/api/admin/data`, { headers: { Cookie: cookie }, signal: AbortSignal.timeout(15000) });
        if (!response.ok) throw new Error();
    } catch {
        throw new Error('Iniciá Next.js y PostgreSQL con la misma configuración antes de ejecutar las pruebas de integración.');
    }
    return { db: new PrismaClient(), origin, cookie };
}
