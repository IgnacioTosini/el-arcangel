export function matchesProduct(
  product: { name: string; sku: string },
  query: string,
) {
  const normalize = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("es-AR");
  const text = normalize(`${product.name} ${product.sku}`);
  return normalize(query)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => text.includes(term));
}
