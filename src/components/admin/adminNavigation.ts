import type { ModelName } from "./adminModels";

export const adminSections: { name: ModelName; slug: string; label: string }[] =
  [
    { name: "Product", slug: "productos", label: "Productos" },
    { name: "Category", slug: "categorias", label: "Categorías" },
    { name: "Order", slug: "pedidos", label: "Consultas" },
  ];
