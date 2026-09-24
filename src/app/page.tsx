import About from "@/components/sections/about/About";
import Categories from "@/components/sections/categories/Categories";
import Featured from "@/components/sections/featured/Featured";
import Hero from "@/components/sections/hero/Hero";
import Wholesale from "@/components/sections/wholesale/Wholesale";
import { readCustomerCatalog } from "@/lib/customer-catalog";
import { readHomeContent } from "@/lib/home-content";
import { prisma } from "@/lib/prisma";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "El Arcángel | Santería y regalería",
  "Sahumerios, aromas, imágenes religiosas, budas y regalos. Explorá el catálogo de El Arcángel y consultá precios por mayor y menor.",
  "/",
);
export const dynamic = "force-dynamic";

export default async function Home() {
  const { products, categories, purchaseType } = await readCustomerCatalog();
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "store" },
  });
  const content = readHomeContent(settings?.homeContent);
  return (
    <div>
      <Hero content={content} />
      <Categories title={content.categoriesTitle} categories={categories} />
      <Featured
        title={content.featuredTitle}
        buttonLabel={content.featuredButton}
        purchaseType={purchaseType}
        products={products.filter((p) => p.featured)}
      />
      <Wholesale content={content} />
      <About content={content} instagramUrl={settings?.instagram} />
    </div>
  );
}
