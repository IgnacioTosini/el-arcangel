import { readCatalog } from '@/lib/catalog-database';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata('El Arcángel | Santería y regalería', 'Sahumerios, aromas, imágenes religiosas, budas y regalos. Explorá el catálogo de El Arcángel y consultá precios por mayor y menor.', '/');
export const dynamic = 'force-dynamic';
import Hero from "@/components/sections/hero/Hero";
import Categories from "@/components/sections/categories/Categories";
import Featured from "@/components/sections/featured/Featured";
import Wholesale from "@/components/sections/wholesale/Wholesale";
import About from "@/components/sections/about/About";

export default async function Home() {
  const { products, categories } = await readCatalog();
  return (
    <div>
        <Hero />
        <Categories categories={categories} />
        <Featured products={products.filter(p => p.featured)} />
        <Wholesale />
        <About instagramUrl="https://www.instagram.com/elarcangelelarcangel/" />
    </div>
  );
}
