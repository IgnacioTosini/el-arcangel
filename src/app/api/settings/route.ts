import { NextRequest } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-session";
import { validateHomeContent } from "@/lib/home-content";
import { prisma } from "@/lib/prisma";
export async function GET() {
  try {
    return Response.json(
      await prisma.siteSettings.findUnique({ where: { id: "store" } }),
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { error: "No se pudo cargar la configuración." },
      { status: 503 },
    );
  }
}
export async function PATCH(req: NextRequest) {
  if (!(await isAdminAuthenticated()))
    return Response.json({ error: "No autorizado." }, { status: 401 });
  if (req.headers.get("origin") !== req.nextUrl.origin)
    return Response.json({ error: "Origen no permitido." }, { status: 403 });
  try {
    const body = await req.json();
    const data: Record<string, string> = {};
    const units =
      body.wholesaleMinimumUnits === undefined
        ? undefined
        : Number(body.wholesaleMinimumUnits);
    if (
      units !== undefined &&
      (!["string", "number"].includes(typeof body.wholesaleMinimumUnits) ||
        !Number.isSafeInteger(units) ||
        units < 2 ||
        units > 99900)
    )
      throw new Error();
    if ("wholesaleMinimum" in body) {
      const value = body.wholesaleMinimum;
      if (typeof value !== "string" || !/^\d{1,10}(\.\d{1,2})?$/.test(value))
        throw new Error();
      data.wholesaleMinimum = value;
    }
    for (const key of [
      "name",
      "whatsapp",
      "instagram",
      "address",
      "hours",
      "wholesaleText",
    ]) {
      if (!(key in body)) continue;
      if (body[key] !== null && typeof body[key] !== "string")
        throw new Error();
      data[key] = (body[key] ?? "").trim();
    }
    if ("name" in data && !data.name) throw new Error();
    if (data.whatsapp && !/^\d{8,15}$/.test(data.whatsapp)) throw new Error();
    if (data.instagram) {
      const url = new URL(data.instagram);
      if (
        url.protocol !== "https:" ||
        !["instagram.com", "www.instagram.com"].includes(url.hostname)
      )
        throw new Error();
    }
    const update = {
      ...data,
      ...(units === undefined ? {} : { wholesaleMinimumUnits: units }),
      ...("homeContent" in body
        ? { homeContent: validateHomeContent(body.homeContent) }
        : {}),
    };
    return Response.json(
      await prisma.siteSettings.upsert({
        where: { id: "store" },
        create: { id: "store", ...update },
        update,
      }),
    );
  } catch {
    return Response.json(
      {
        error:
          "No se pudo guardar la configuración. Revisá los campos y la conexión.",
      },
      { status: 400 },
    );
  }
}
