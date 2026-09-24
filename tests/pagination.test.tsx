// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

import Pagination from "@/components/ui/pagination/Pagination";
import { usePagination } from "@/lib/use-pagination";

function List({
  count = 23,
  filter = "",
  initialPage = 1,
}: {
  count?: number;
  filter?: string;
  initialPage?: number;
}) {
  const pagination = usePagination(
    Array.from({ length: count }, (_, index) => index + 1),
    filter,
    10,
    initialPage,
  );
  return (
    <>
      <ul>
        {pagination.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <Pagination
        {...pagination}
        targetId="unused"
        onChange={pagination.setPage}
      />
    </>
  );
}
afterEach(cleanup);

test("el catálogo puede mostrar una única página con navegación deshabilitada", () => {
  const change = vi.fn();
  const view = render(
    <Pagination
      showSinglePage
      page={1}
      total={7}
      pageSize={12}
      targetId="unused"
      onChange={change}
    />,
  );
  expect(
    screen
      .getByRole("button", { name: "Página 1" })
      .getAttribute("aria-current"),
  ).toBe("page");
  expect(
    (
      screen.getByRole("button", {
        name: "Página anterior",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
  expect(
    (
      screen.getByRole("button", {
        name: "Página siguiente",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
  expect(screen.getByText("Mostrando 1–7 de 7")).toBeTruthy();
  view.rerender(
    <Pagination
      showSinglePage
      page={1}
      total={0}
      pageSize={12}
      targetId="unused"
      onChange={change}
    />,
  );
  expect(screen.queryByRole("navigation")).toBeNull();
});

test("pagina sin duplicados, reinicia con filtros y corrige una página vacía tras eliminar", () => {
  const view = render(<List />);
  expect(screen.getAllByRole("listitem")).toHaveLength(10);
  fireEvent.click(screen.getByRole("button", { name: "Página siguiente" }));
  expect(screen.getAllByRole("listitem")[0].textContent).toBe("11");
  fireEvent.click(screen.getByRole("button", { name: "Página siguiente" }));
  expect(screen.getAllByRole("listitem")).toHaveLength(3);
  expect(
    (
      screen.getByRole("button", {
        name: "Página siguiente",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
  view.rerender(<List count={20} />);
  expect(
    screen
      .getByRole("button", { name: "Página 2" })
      .getAttribute("aria-current"),
  ).toBe("page");
  view.rerender(<List count={20} filter="nuevo filtro" />);
  expect(screen.getAllByRole("listitem")[0].textContent).toBe("1");
  view.rerender(<List count={0} filter="sin resultados" />);
  expect(screen.queryByRole("navigation")).toBeNull();
});

test("abre la página de un registro enlazado y mantiene acotados los controles", () => {
  render(<List count={1000} initialPage={50} />);
  expect(screen.getAllByRole("listitem")[0].textContent).toBe("491");
  expect(screen.getAllByRole("button").length).toBeLessThanOrEqual(7);
});

test("permite impedir la navegación para conservar un borrador", () => {
  const change = vi.fn(() => false);
  render(
    <Pagination
      page={1}
      total={20}
      pageSize={10}
      targetId="unused"
      onChange={change}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Página siguiente" }));
  expect(change).toHaveBeenCalledWith(2);
  expect(
    screen
      .getByRole("button", { name: "Página 1" })
      .getAttribute("aria-current"),
  ).toBe("page");
});
