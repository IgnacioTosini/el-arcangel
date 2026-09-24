// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";

import ProductSearch from "@/components/ui/productSearch/ProductSearch";
import { matchesProduct } from "@/lib/product-search";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/catalogo",
  useSearchParams: () => new URLSearchParams("categoria=aromas"),
}));
afterEach(cleanup);

test("El modo en tiempo real actualiza la URL conservando filtros sin navegar ni pedir sugerencias", () => {
  const replace = vi
    .spyOn(window.history, "replaceState")
    .mockImplementation(() => {});
  const fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  render(<ProductSearch live preserveFilters />);
  const input = screen.getByRole("searchbox");
  fireEvent.change(input, { target: { value: "lavanda" } });
  expect(replace).toHaveBeenLastCalledWith(
    null,
    "",
    "/catalogo?categoria=aromas&q=lavanda",
  );
  fireEvent.change(input, { target: { value: " " } });
  expect(push).not.toHaveBeenCalled();
  expect(fetchMock).not.toHaveBeenCalled();
});

test("Coincide por nombre, fragmentos y SKU sin distinguir tildes ni mayúsculas", () => {
  const product = { name: "Sahumerios clásicos", sku: "ARC-000123" };
  expect(matchesProduct(product, "CLASICOS")).toBe(true);
  expect(matchesProduct(product, "sahu 0123")).toBe(true);
  expect(matchesProduct(product, "buda")).toBe(false);
});

test("Las sugerencias permiten abrir una ficha con el teclado", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async () => [
          {
            id: "1",
            name: "Quemador",
            href: "/catalogo/quemador",
            imageUrl: "/image-placeholder.svg",
          },
        ],
      }),
  );
  const user = userEvent.setup();
  render(<ProductSearch />);
  await user.type(screen.getByRole("combobox"), "que");
  expect(await screen.findByRole("option", { name: "Quemador" })).toBeTruthy();
  await user.keyboard("{ArrowDown}{Enter}");
  expect(push).toHaveBeenCalledWith("/catalogo/quemador");
});

test("Ver todos conserva la categoría y Escape cierra las sugerencias", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => [] }),
  );
  const user = userEvent.setup();
  render(<ProductSearch preserveFilters />);
  await user.type(screen.getByRole("combobox"), "xyz");
  expect(await screen.findByText("No encontramos coincidencias.")).toBeTruthy();
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("listbox")).toBeNull();
  await user.keyboard("{Enter}");
  expect(push).toHaveBeenCalledWith("/catalogo?categoria=aromas&q=xyz");
});
