import { Suspense } from "react";

import Catalog from "@/components/sections/catalog/Catalog";
import { readCustomerCatalog } from "@/lib/customer-catalog";
import { pageMetadata } from "@/lib/seo";
export const dynamic = "force-dynamic";

export const metadata = pageMetadata(
  "Catálogo | El Arcángel",
  "Explorá productos de santería y regalería. Filtrá por categoría y armá tu consulta.",
  "/catalogo",
);

export default async function CatalogPage() {
  const { products, categories, purchaseType } = await readCustomerCatalog();
  return (
    <main>
      <Suspense fallback={<p role="status">Cargando catálogo…</p>}>
        <Catalog
          purchaseType={purchaseType}
          products={products}
          categories={[
            { value: "", label: "Todas" },
            ...categories.map((c) => ({ value: c.slug, label: c.name })),
          ]}
        />
      </Suspense>
    </main>
  );
}
