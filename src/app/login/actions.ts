'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_DURATION_SECONDS, createAdminSessionToken, verifyAdminPassword } from '@/lib/admin-session';

export async function loginAdmin(_previous: { error: string }, form: FormData): Promise<{ error: string }> {
    if (!process.env.ADMIN_PASSWORD) return { error: 'El acceso administrativo todavía no está configurado.' };
    const password = form.get('password');
    if (typeof password !== 'string' || password.length > 1024 || !verifyAdminPassword(password)) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { error: 'La contraseña no es correcta. Intentá nuevamente.' };
    }
    (await cookies()).set(ADMIN_SESSION_COOKIE, await createAdminSessionToken(), {
        httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: ADMIN_SESSION_DURATION_SECONDS,
    });
    redirect('/admin');
}

export async function logoutAdmin() {
    (await cookies()).delete(ADMIN_SESSION_COOKIE);
    redirect('/login');
}
