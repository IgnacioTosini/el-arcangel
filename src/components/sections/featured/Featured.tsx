"use client";

import Link from "next/link";

import ProductCard, {
  type ProductCardData,
} from "@/components/cards/productCard/ProductCard";
import { useConsultation } from "@/components/providers/ConsultationProvider";
import { defaultHomeContent } from "@/lib/home-content";
import { useAnimation } from "@/lib/use-animation";

import { animateFeatured } from "./featured.animation";

import "./_featured.scss";

export default function Featured({
  products: featuredProducts,
  purchaseType = "RETAIL",
  title = defaultHomeContent.featuredTitle,
  buttonLabel = defaultHomeContent.featuredButton,
}: {
  products: ProductCardData[];
  purchaseType?: "RETAIL" | "WHOLESALE";
  title?: string;
  buttonLabel?: string;
}) {
  const animationRef = useAnimation<HTMLElement>(animateFeatured);
  const { addItem } = useConsultation();

  function handleAdd(product: ProductCardData) {
    if (product.defaultVariantId)
      addItem({
        id: product.defaultVariantId,
        name: product.name,
        stock: product.stock,
      });
  }

  return (
    <section
      ref={animationRef}
      className="featuredContent"
      aria-labelledby="featuredTitle"
    >
      <div className="featuredHeader">
        <h2 id="featuredTitle" className="featuredTitle">
          {title}
        </h2>
        <Link href="/catalogo" className="featuredLink">
          {buttonLabel} <span aria-hidden="true">→</span>
        </Link>
      </div>
      <p className="featuredDescription">
        {purchaseType === "WHOLESALE"
          ? "Precios mayoristas · cuenta aprobada"
          : "Precios minoristas"}
      </p>
      <ul className="featuredGrid">
        {featuredProducts.map((product) => (
          <li key={product.id} className="featuredItem">
            <ProductCard product={product} onAdd={handleAdd} />
          </li>
        ))}
      </ul>
    </section>
  );
}
