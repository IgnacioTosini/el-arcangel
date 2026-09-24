import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  checkPassword,
  createWholesaleSession,
  getWholesaleAccount,
  hashPassword,
  sessionDuration,
  tokenHash,
  wholesaleCookie,
} from "@/lib/wholesale-auth";

export async function GET() {
  return NextResponse.json(await getWholesaleAccount(), {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(req: NextRequest) {
  if (req.headers.get("origin") !== req.nextUrl.origin)
    return NextResponse.json(
      { error: "Origen no permitido." },
      { status: 403 },
    );
  try {
    const data = await req.json();
    if (
      typeof data.email !== "string" ||
      data.email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()) ||
      typeof data.password !== "string" ||
      data.password.length < 8 ||
      data.password.length > 128
    )
      return NextResponse.json(
        {
          error:
            "Ingresá un email válido y una contraseña de 8 a 128 caracteres.",
        },
        { status: 400 },
      );
    const email = data.email.trim().toLowerCase();
    if (data.action === "register") {
      if (
        data.password !== data.confirmPassword ||
        typeof data.name !== "string" ||
        !data.name.trim() ||
        data.name.length > 120 ||
        typeof data.business !== "string" ||
        !data.business.trim() ||
        data.business.length > 160 ||
        typeof data.phone !== "string" ||
        !/^[+\d ()-]{8,30}$/.test(data.phone) ||
        data.phone.replace(/\D/g, "").length < 8
      )
        return NextResponse.json(
          {
            error:
              "Revisá el nombre, negocio, teléfono y confirmación de contraseña.",
          },
          { status: 400 },
        );
      await prisma.wholesaleAccount.create({
        data: {
          email,
          name: data.name.trim(),
          business: data.business.trim(),
          phone: data.phone.trim(),
          passwordHash: await hashPassword(data.password),
        },
      });
      return NextResponse.json(
        {
          message:
            "Solicitud recibida. Podés ingresar para consultar el estado de aprobación.",
        },
        { status: 201 },
      );
    }
    if (data.action !== "login")
      return NextResponse.json({ error: "Acción inválida." }, { status: 400 });
    const account = await prisma.wholesaleAccount.findUnique({
      where: { email },
    });
    if (account?.lockedUntil && account.lockedUntil > new Date())
      return NextResponse.json(
        { error: "Demasiados intentos. Intentá nuevamente en 15 minutos." },
        { status: 429 },
      );
    if (
      !account ||
      !(await checkPassword(data.password, account.passwordHash))
    ) {
      if (account)
        await prisma.wholesaleAccount.update({
          where: { id: account.id },
          data: {
            failedLogins: { increment: 1 },
            lockedUntil:
              account.failedLogins >= 4
                ? new Date(Date.now() + 15 * 60 * 1000)
                : null,
          },
        });
      return NextResponse.json(
        { error: "Email o contraseña incorrectos." },
        { status: 401 },
      );
    }
    await prisma.wholesaleAccount.update({
      where: { id: account.id },
      data: { failedLogins: 0, lockedUntil: null },
    });
    const response = NextResponse.json({ ok: true });
    response.cookies.set(
      wholesaleCookie,
      await createWholesaleSession(account.id),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: sessionDuration,
      },
    );
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
            ? "Ya existe una solicitud con ese email. Ingresá con tu contraseña."
            : "No pudimos completar la operación. Intentá nuevamente.",
      },
      { status: 400 },
    );
  }
}
export async function DELETE(req: NextRequest) {
  if (req.headers.get("origin") !== req.nextUrl.origin)
    return NextResponse.json(
      { error: "Origen no permitido." },
      { status: 403 },
    );
  const token = req.cookies.get(wholesaleCookie)?.value;
  if (token)
    await prisma.wholesaleSession.deleteMany({
      where: { tokenHash: tokenHash(token) },
    });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(wholesaleCookie, "", { maxAge: 0, path: "/" });
  return response;
}
