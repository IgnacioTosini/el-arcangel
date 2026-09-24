// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

import Catalog from "@/components/sections/catalog/Catalog";

import type { CatalogProduct } from "@/data/products";

const { push, location } = vi.hoisted(() => ({
  push: vi.fn(),
  location: { search: "q=lavanda" },
}));
vi.mock("next/navigation", () => ({
  usePathname: () => "/catalogo",
  useSearchParams: () => new URLSearchParams(location.search),
  useRouter: () => ({ push }),
}));
vi.mock("@/components/providers/ConsultationProvider", () => ({
  useConsultation: () => ({ items: [], addItem: vi.fn() }),
}));
vi.mock("@/lib/use-animation", () => ({
  useAnimation: () => ({ current: null }),
}));
afterEach(() => {
  cleanup();
  location.search = "q=lavanda";
});

test("categoría, orden y limpiar resultados actualizan la URL sin navegar al servidor", () => {
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  const fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  const history = vi
    .spyOn(window.history, "pushState")
    .mockImplementation(() => {});
  render(
    <Catalog
      products={[]}
      categories={[
        { value: "", label: "Todas" },
        { value: "aromas", label: "Aromas" },
      ]}
    />,
  );
  fireEvent.click(screen.getByRole("radio", { name: "Aromas" }));
  expect(history).toHaveBeenLastCalledWith(
    null,
    "",
    "/catalogo?q=lavanda&categoria=aromas",
  );
  fireEvent.click(screen.getByRole("radio", { name: "Precio: menor a mayor" }));
  expect(history.mock.calls.at(-1)?.[2]).toContain("q=lavanda&orden=");
  fireEvent.click(
    screen.getByRole("button", { name: "Ver todos los productos" }),
  );
  expect(history).toHaveBeenLastCalledWith(null, "", "/catalogo");
  expect(push).not.toHaveBeenCalled();
  expect(fetchMock).not.toHaveBeenCalled();
});

test("el catálogo pagina de a 12 conservando filtros y reinicia al cambiar categoría", () => {
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  vi.spyOn(document, "getElementById").mockReturnValue(null);
  const history = vi
    .spyOn(window.history, "pushState")
    .mockImplementation(() => {});
  const products: CatalogProduct[] = Array.from({ length: 13 }, (_, index) => ({
    id: String(index),
    name: `Lavanda ${index}`,
    sku: String(index),
    category: "Aromas",
    categorySlug: "aromas",
    createdAt: "2026-01-01",
    imageUrl: "/image-placeholder.svg",
    href: "/catalogo/lavanda",
    price: 10,
    availability: "available",
  }));
  const props = {
    products,
    categories: [
      { value: "", label: "Todas" },
      { value: "aromas", label: "Aromas" },
    ],
  };
  const view = render(<Catalog {...props} />);
  expect(screen.getAllByRole("article")).toHaveLength(12);
  fireEvent.click(screen.getByRole("button", { name: "Página siguiente" }));
  expect(history).toHaveBeenLastCalledWith(
    null,
    "",
    "/catalogo?q=lavanda&pagina=2",
  );
  location.search = "q=lavanda&pagina=2";
  view.rerender(<Catalog {...props} />);
  expect(screen.getAllByRole("article")).toHaveLength(1);
  fireEvent.click(screen.getByRole("radio", { name: "Aromas" }));
  expect(history).toHaveBeenLastCalledWith(
    null,
    "",
    "/catalogo?q=lavanda&categoria=aromas",
  );
  expect(push).not.toHaveBeenCalled();
});
