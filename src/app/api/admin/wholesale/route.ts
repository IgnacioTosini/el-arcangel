import { NextRequest } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-session';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest) {
    if (!await isAdminAuthenticated()) return Response.json({ error: 'Ingresá al administrador.' }, { status: 401 });
    if (req.headers.get('origin') !== req.nextUrl.origin) return Response.json({ error: 'Origen no permitido.' }, { status: 403 });
    try {
        const { id, status } = await req.json();
        if (typeof id !== 'string' || !['PENDING', 'APPROVED', 'REJECTED'].includes(status)) return Response.json({ error: 'Datos inválidos.' }, { status: 400 });
        await prisma.wholesaleAccount.update({ where: { id }, data: { status } });
        return Response.json({ ok: true });
    } catch { return Response.json({ error: 'No se pudo cambiar el estado.' }, { status: 400 }); }
}
