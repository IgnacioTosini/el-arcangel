import { prisma } from "./prisma";

import type { CatalogProduct } from "@/data/products";
export async function readCatalog(
  purchaseType: "RETAIL" | "WHOLESALE" = "RETAIL",
) {
  const [rows, categories] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      include: {
        categories: { where: { active: true } },
        images: { orderBy: { sortOrder: "asc" } },
        variants: { where: { active: true }, orderBy: { sortOrder: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);
  const products: CatalogProduct[] = rows.map((row) => {
    // Only serialize the authorized price tier; never send both tiers to the browser.
    row.variants = row.variants.map((v) => ({
      ...v,
      price: purchaseType === "WHOLESALE" ? v.wholesalePrice : v.price,
      compareAtPrice:
        purchaseType === "WHOLESALE"
          ? v.wholesaleCompareAtPrice
          : v.compareAtPrice,
    }));
    const available = row.variants.filter((v) => v.stock !== 0);
    const candidates = available.length ? available : row.variants;
    const priced = candidates
      .filter((v) => v.price !== null)
      .sort((a, b) => a.price!.comparedTo(b.price!));
    const priceVariant = priced[0] ?? candidates[0];
    const defaultVariant = available.length ? priceVariant : undefined;
    return {
      stock: defaultVariant?.stock ?? (defaultVariant ? null : 0),
      defaultVariantName: defaultVariant?.name,
      defaultVariantId: defaultVariant?.id,
      variants: row.variants.map((v) => ({
        id: v.id,
        name: v.name,
        sku: v.sku,
        price: v.price?.toNumber() ?? null,
        compareAtPrice: v.compareAtPrice?.toNumber() ?? null,
        stock: v.stock,
      })),
      id: row.id,
      name: row.name,
      description: row.description,
      featured: row.featured,
      category: row.categories.map((c) => c.name).join(", ") || "Sin categoría",
      categorySlug: row.categories[0]?.slug ?? "",
      categorySlugs: row.categories.map((c) => c.slug),
      sku: row.variants.map((v) => v.sku).join(" / "),
      createdAt: row.createdAt.toISOString(),
      href: `/catalogo/${row.slug}`,
      imageUrl: row.images[0]?.url || "/image-placeholder.svg",
      price: priceVariant?.price?.toNumber() ?? null,
      compareAtPrice: priceVariant?.compareAtPrice?.toNumber() ?? null,
      priceFrom: row.variants.length > 1,
      availability: row.variants.some((v) => v.stock !== null && v.stock > 0)
        ? "available"
        : row.variants.some((v) => v.stock === null)
          ? "inquiry"
          : "unavailable",
    };
  });
  return {
    products,
    categories: categories.map((c) => ({
      name: c.name,
      slug: c.slug,
      imageUrl: c.imageUrl || "/image-placeholder.svg",
    })),
  };
}
