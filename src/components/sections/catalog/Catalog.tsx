"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import ProductCard, {
  type ProductCardData,
} from "@/components/cards/productCard/ProductCard";
import { useConsultation } from "@/components/providers/ConsultationProvider";
import Modal from "@/components/ui/modal/Modal";
import Pagination from "@/components/ui/pagination/Pagination";
import ProductSearch from "@/components/ui/productSearch/ProductSearch";
import { useAnimation } from "@/lib/use-animation";

import { animateCatalog } from "./catalog.animation";
import CatalogFilters from "./catalogFilters/CatalogFilters";
import {
  type CatalogFiltersValue,
  filterProducts,
  parseFilters,
} from "./catalogFilters/filterUtils";

import type { CatalogProduct } from "@/data/products";

import "./_catalog.scss";

export default function Catalog({
  products: catalogProducts,
  categories,
  purchaseType = "RETAIL",
}: {
  products: CatalogProduct[];
  categories: { value: string; label: string }[];
  purchaseType?: "RETAIL" | "WHOLESALE";
}) {
  const animationRef = useAnimation<HTMLDivElement>(animateCatalog);
  const params = useSearchParams();
  const pathname = usePathname();
  const { addItem } = useConsultation();
  const filters = parseFilters(params.get("categoria"), params.get("orden"));
  const query = params.get("q") ?? "";
  const products = filterProducts(catalogProducts, filters, query);
  const pageSize = 12;
  const requestedPage = Number(params.get("pagina") ?? 1);
  const page = Math.min(
    Math.max(1, Number.isSafeInteger(requestedPage) ? requestedPage : 1),
    Math.max(1, Math.ceil(products.length / pageSize)),
  );
  const pagedProducts = products.slice((page - 1) * pageSize, page * pageSize);
  const [draft, setDraft] = useState<CatalogFiltersValue | null>(null);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 701px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setDraft(null);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  function updateFilters(value: CatalogFiltersValue) {
    const next = new URLSearchParams(params.toString());
    next.delete("pagina");
    if (value.category) next.set("categoria", value.category);
    else next.delete("categoria");
    if (value.sort !== "newest") next.set("orden", value.sort);
    else next.delete("orden");
    window.history.pushState(
      null,
      "",
      `${pathname}${next.size ? `?${next}` : ""}${window.location.hash}`,
    );
  }

  function handleAdd(product: ProductCardData) {
    if (product.defaultVariantId)
      addItem({
        id: product.defaultVariantId,
        name: product.name,
        stock: product.stock,
      });
  }

  return (
    <div id="catalog-results" ref={animationRef} className="catalogContent">
      <header className="catalogHeader">
        <h1>Catálogo</h1>
        <p>
          {purchaseType === "WHOLESALE"
            ? "Precios mayoristas · cuenta aprobada"
            : "Precios minoristas"}
        </p>
        <p role="status">
          {products.length} {products.length === 1 ? "producto" : "productos"}
          {query ? ` para “${query}”` : ""}.
        </p>
      </header>
      <ProductSearch live preserveFilters />
      <div className="catalogDesktopFilters">
        <CatalogFilters
          categories={categories}
          value={filters}
          onChange={updateFilters}
        />
      </div>
      <button
        className="catalogMobileFilters catalogButton"
        type="button"
        aria-haspopup="dialog"
        onClick={() => setDraft(filters)}
      >
        Filtrar y ordenar
        {filters.category || filters.sort !== "newest" ? " · Activos" : ""}
      </button>
      {draft && (
        <Modal title="Filtrar y ordenar" onClose={() => setDraft(null)}>
          <CatalogFilters
            categories={categories}
            value={draft}
            onChange={setDraft}
          />
          <div className="catalogModalActions">
            <button
              className="catalogButton"
              type="button"
              onClick={() => setDraft({ category: "", sort: "newest" })}
            >
              Restablecer
            </button>
            <button
              className="catalogButton catalogButtonPrimary"
              type="button"
              onClick={() => {
                updateFilters(draft);
                setDraft(null);
              }}
            >
              Aplicar filtros
            </button>
          </div>
        </Modal>
      )}
      {products.length ? (
        <ul className="catalogGrid">
          {pagedProducts.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} onAdd={handleAdd} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="catalogEmpty">
          <h2>No encontramos productos</h2>
          <p>Probá con otra búsqueda o quitá los filtros.</p>
          <button
            className="catalogButton"
            type="button"
            onClick={() => window.history.pushState(null, "", pathname)}
          >
            Ver todos los productos
          </button>
        </div>
      )}
      <Pagination
        showSinglePage
        page={page}
        total={products.length}
        pageSize={pageSize}
        targetId="catalog-results"
        onChange={(nextPage) => {
          const next = new URLSearchParams(params.toString());
          if (nextPage === 1) next.delete("pagina");
          else next.set("pagina", String(nextPage));
          window.history.pushState(
            null,
            "",
            `${pathname}${next.size ? `?${next}` : ""}`,
          );
        }}
      />
    </div>
  );
}
