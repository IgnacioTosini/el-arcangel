import { type CatalogProduct } from "@/data/products";
import { matchesProduct } from "@/lib/product-search";

export const sortOptions = [
  { value: "newest", label: "Más nuevos" },
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
  { value: "name", label: "Nombre (A-Z)" },
] as const;

export type CatalogFiltersValue = {
  category: string;
  sort: (typeof sortOptions)[number]["value"];
};

export function parseFilters(
  category: string | null,
  sort: string | null,
): CatalogFiltersValue {
  return {
    category: category ?? "",
    sort: sortOptions.find((item) => item.value === sort)?.value ?? "newest",
  };
}

export function filterProducts(
  products: CatalogProduct[],
  filters: CatalogFiltersValue,
  query: string,
) {
  return products
    .filter(
      (product) =>
        (!filters.category ||
          (product.categorySlugs ?? [product.categorySlug]).includes(
            filters.category,
          )) &&
        matchesProduct(product, query),
    )
    .sort((a, b) => {
      if (filters.sort === "name") return a.name.localeCompare(b.name, "es");
      if (filters.sort === "newest")
        return b.createdAt.localeCompare(a.createdAt);
      if (a.price === null) return b.price === null ? 0 : 1;
      if (b.price === null) return -1;
      return filters.sort === "price-asc"
        ? a.price - b.price
        : b.price - a.price;
    });
}
