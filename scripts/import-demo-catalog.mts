import "dotenv/config";
import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { PrismaClient } from "@prisma/client";

import { catalogCategories, catalogProducts } from "../src/data/products.ts";

const db = new PrismaClient();
const dryRun = process.argv.includes("--dry-run");
const journalPath = resolve(".local/import-demo-catalog.json");
type Upload = { url: string; public_id: string };
const descriptions: Record<string, string> = {
  "demo-regalo":
    "Un set decorativo para regalar un momento especial, con una presentación cálida y cuidada.",
  "demo-buda":
    "Una figura de Buda para acompañar tus espacios de descanso y decoración.",
  "demo-arcangel":
    "Figura de San Miguel Arcángel con alas y detalles dorados para tu espacio de devoción.",
  "demo-sahumerios":
    "Sahumerios clásicos para perfumar tus ambientes y acompañar tus momentos de calma. Consultanos por los aromas disponibles.",
  "demo-set":
    "Un conjunto de sahumerios con soporte, ideal para regalar o disfrutar en casa.",
  "demo-portasahumerios":
    "Un soporte de madera de tonos cálidos para acompañar tus sahumerios y decorar tus espacios.",
  "demo-quemador":
    "Quemador para conos de líneas simples y acabado oscuro, ideal para un rincón especial de tu hogar.",
};

async function main() {
  if (
    !["localhost", "127.0.0.1", "[::1]"].includes(
      new URL(process.env.DATABASE_URL ?? "").hostname,
    )
  )
    throw new Error("El importador requiere la base local del proyecto.");
  const [existingCategories, existingProducts] = await Promise.all([
    db.category.findMany({ select: { id: true, name: true, slug: true } }),
    db.product.findMany({ select: { id: true, name: true, slug: true } }),
  ]);
  const categories = catalogCategories.filter((item) => item.value);
  const missingCategories = categories.filter(
    (item) =>
      !existingCategories.some((existing) => existing.slug === item.value),
  );
  const missingProducts = catalogProducts.filter(
    (item) =>
      !existingProducts.some(
        (existing) => existing.slug === item.href.split("/").pop(),
      ),
  );
  console.log(
    "Existentes:",
    JSON.stringify({
      categories: existingCategories,
      products: existingProducts,
    }),
  );
  console.log(
    "Por importar:",
    JSON.stringify({
      categories: missingCategories.map((item) => item.label),
      products: missingProducts.map((item) => item.name),
    }),
  );
  const conflicts = await db.productVariant.findMany({
    where: { sku: { in: missingProducts.map((item) => item.sku) } },
    select: { sku: true },
  });
  if (conflicts.length)
    throw new Error(
      `Hay códigos en uso: ${conflicts.map((item) => item.sku).join(", ")}. No se modificó ningún registro.`,
    );
  if (dryRun || (!missingCategories.length && !missingProducts.length)) return;

  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud || !apiKey || !apiSecret)
    throw new Error("Falta configurar Cloudinary.");
  let uploads: Record<string, Upload> = {};
  try {
    uploads = JSON.parse(await readFile(journalPath, "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  const namespace = `${process.env.CLOUDINARY_CLOUD_NAME}:${process.env.CLOUDINARY_UPLOAD_FOLDER}`;
  async function upload(
    path: string,
    folder: "categorias" | "productos",
  ): Promise<Upload> {
    const bytes = await readFile(resolve("public", path.replace(/^\//, "")));
    const key = createHash("sha256")
      .update(namespace)
      .update(folder)
      .update(path)
      .update(bytes)
      .digest("hex");
    if (uploads[key]) {
      const response = await fetch(uploads[key].url, {
        method: "HEAD",
        signal: AbortSignal.timeout(15000),
      });
      if (response.ok) return uploads[key];
    }
    const form = new FormData();
    form.append(
      "file",
      new File([bytes], path.split("/").pop()!, { type: "image/webp" }),
    );
    const targetFolder = `${(process.env.CLOUDINARY_UPLOAD_FOLDER ?? "demo-store").replace(/\/+$/, "")}/${folder}`;
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = createHash("sha1")
      .update(`folder=${targetFolder}&timestamp=${timestamp}${apiSecret}`)
      .digest("hex");
    form.append("folder", targetFolder);
    form.append("timestamp", String(timestamp));
    form.append("api_key", apiKey!);
    form.append("signature", signature);
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloud}/image/upload`,
      { method: "POST", body: form, signal: AbortSignal.timeout(90000) },
    );
    const result = await response.json();
    if (
      !response.ok ||
      typeof result.public_id !== "string" ||
      typeof result.secure_url !== "string" ||
      !result.secure_url.startsWith("https://res.cloudinary.com/")
    )
      throw new Error(
        `No se pudo subir ${path}: ${result.error?.message ?? "respuesta inválida"}`,
      );
    uploads[key] = { url: result.secure_url, public_id: result.public_id };
    // Conserva las cargas para poder reintentar sin duplicar archivos.
    await mkdir(resolve(".local"), { recursive: true });
    await writeFile(`${journalPath}.tmp`, JSON.stringify(uploads, null, 2));
    await rename(`${journalPath}.tmp`, journalPath);
    console.log(`Imagen subida: ${folder}/${path.split("/").pop()}`);
    return uploads[key];
  }
  const categoryImages = new Map<string, Upload>();
  const productImages = new Map<string, Upload>();
  for (const category of missingCategories)
    categoryImages.set(
      category.value,
      await upload(`/categories/${category.value}.webp`, "categorias"),
    );
  for (const product of missingProducts)
    productImages.set(product.id, await upload(product.imageUrl, "productos"));

  const created = await db.$transaction(
    async (tx) => {
      const result = { categories: 0, products: 0, variants: 0, images: 0 };
      const categoryIds = new Map(
        existingCategories.map((item) => [item.slug, item.id]),
      );
      for (const category of missingCategories) {
        const image = categoryImages.get(category.value)!;
        const existing = await tx.category.findUnique({
          where: { slug: category.value },
        });
        const saved =
          existing ??
          (await tx.category.create({
            data: {
              name: category.label,
              slug: category.value,
              sortOrder: categories.findIndex(
                (item) => item.value === category.value,
              ),
              active: true,
              imageUrl: image.url,
              publicId: image.public_id,
            },
          }));
        categoryIds.set(category.value, saved.id);
        if (!existing) result.categories++;
      }
      for (const product of missingProducts) {
        const slug = product.href.split("/").pop()!;
        if (await tx.product.findUnique({ where: { slug } })) continue;
        const image = productImages.get(product.id)!;
        await tx.product.create({
          data: {
            name: product.name,
            slug,
            description: descriptions[product.id] ?? product.name,
            active: true,
            featured:
              product.id.startsWith("demo-") &&
              [
                "demo-sahumerios",
                "demo-set",
                "demo-portasahumerios",
                "demo-quemador",
              ].includes(product.id),
            createdAt: new Date(product.createdAt),
            categories: {
              connect: { id: categoryIds.get(product.categorySlug)! },
            },
            variants: {
              create: {
                name: "Única",
                sku: product.sku,
                price: product.price,
                stock:
                  product.availability === "inquiry"
                    ? null
                    : product.availability === "unavailable"
                      ? 0
                      : 12,
                active: true,
              },
            },
            images: {
              create: {
                url: image.url,
                publicId: image.public_id,
                alt: product.name,
                sortOrder: 0,
              },
            },
          },
        });
        result.products++;
        result.variants++;
        result.images++;
      }
      return result;
    },
    { timeout: 30000 },
  );
  console.log("Importación confirmada:", JSON.stringify(created));
  const urls = [...categoryImages.values(), ...productImages.values()].map(
    (item) => item.url,
  );
  for (const url of urls) {
    const response = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(15000),
    });
    if (
      !response.ok ||
      !response.headers.get("content-type")?.startsWith("image/")
    )
      throw new Error(
        "Los registros se guardaron, pero una imagen requiere verificar su disponibilidad.",
      );
  }
  console.log(`Verificadas ${urls.length} imágenes de Cloudinary.`);
}

try {
  await main();
} catch (error) {
  console.error(
    error instanceof Error
      ? error.message
      : "No se pudo completar la importación.",
  );
  process.exitCode = 1;
} finally {
  await db.$disconnect();
}
