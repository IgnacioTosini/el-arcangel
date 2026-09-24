export const defaultHomeContent = {
  footerDescription: "Santería y regalería. Venta por mayor y menor.",
  heroImageUrl: "/brand/local-ilustrativo.webp",
  heroImagePublicId: "",
  heroImageAlt:
    "Representación ilustrativa de una santería y regalería El Arcángel",
  heroTitle: "Encontrá ese detalle especial",
  heroSubtitle: "Santería y regalería. Venta por mayor y menor.",
  heroCatalogButton: "Explorar catálogo",
  heroWholesaleButton: "Consultar por mayor",
  categoriesTitle: "Categorías",
  featuredTitle: "Selección destacada",
  featuredButton: "Ver todo",
  wholesaleTitle: "¿Comprás para tu negocio?",
  wholesaleDescription:
    "Armá una lista con los productos y las cantidades que necesitás y consultanos las condiciones mayoristas. Te respondemos con precios y disponibilidad.",
  wholesaleButton: "Armar consulta mayorista",
  aboutTitle: "El Arcángel",
  aboutDescription: [
    "Santería y regalería con venta por mayor y menor: sahumerios, portasahumerios, imágenes religiosas, budas y figuras decorativas.",
    "Recorré el catálogo, armá tu lista y envianos la consulta.",
  ].join(" "),
  aboutButton: "Seguinos en Instagram",
};
export type HomeContent = typeof defaultHomeContent;

export function readHomeContent(value: unknown): HomeContent {
  const result = { ...defaultHomeContent };
  if (!value || typeof value !== "object" || Array.isArray(value))
    return result;
  for (const key of Object.keys(result) as (keyof HomeContent)[]) {
    const text = (value as Record<string, unknown>)[key];
    if (typeof text === "string" && text.trim()) result[key] = text;
  }
  return result;
}

export function validateHomeContent(value: unknown): HomeContent {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Contenido inválido");
  const result = { ...defaultHomeContent };
  for (const key of Object.keys(result) as (keyof HomeContent)[]) {
    const text = (value as Record<string, unknown>)[key];
    if (
      key === "heroImageUrl" ||
      key === "heroImagePublicId" ||
      key === "heroImageAlt"
    ) {
      if (text === undefined) continue;
      if (typeof text !== "string" || text.length > 2000)
        throw new Error("Imagen inválida");
      if (
        key === "heroImageUrl" &&
        text !== defaultHomeContent.heroImageUrl &&
        !text.startsWith("https://res.cloudinary.com/")
      )
        throw new Error("Imagen inválida");
      if (key === "heroImageAlt" && !text.trim())
        throw new Error("Completá la descripción de la imagen");
      result[key] = text.trim();
      continue;
    }
    const limit = key.endsWith("Description")
      ? 2000
      : key.endsWith("Button")
        ? 80
        : 200;
    if (typeof text !== "string" || !text.trim() || text.trim().length > limit)
      throw new Error(
        "Revisá los textos del inicio: no pueden quedar vacíos ni superar el largo permitido.",
      );
    result[key] = text.trim();
  }
  return result;
}
