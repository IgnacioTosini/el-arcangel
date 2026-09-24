// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import CatalogForm from "@/components/admin/catalogForm/CatalogForm";
import { ImageService } from "@/services/ImageService";

import type { AdminRecord } from "@/components/admin/adminModels";

const { refreshData } = vi.hoisted(() => ({ refreshData: vi.fn() }));
vi.mock("@/components/admin/AdminProvider", () => ({
  useAdmin: () => ({
    refreshData,
    data: {
      Category: [
        { id: "category-1", name: "Imágenes religiosas" },
        { id: "category-2", name: "Sahumerios" },
      ],
      ProductVariant: [],
      ProductImage: [],
    },
  }),
}));
vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), warning: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const initial: AdminRecord = {
  id: "draft-test",
  name: "",
  slug: "",
  description: "",
  sortOrder: 0,
  active: false,
  imageUrl: null,
  publicId: null,
};
beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
  refreshData.mockResolvedValue(undefined);
});
afterEach(cleanup);

test("Escribir genera el slug; salir del campo no guarda y Cancelar descarta", async () => {
  const user = userEvent.setup();
  const onClose = vi.fn();
  render(<CatalogForm model="Category" initial={initial} onClose={onClose} />);
  await user.type(screen.getByLabelText("Nombre"), "Imágenes Religiosas");
  await user.tab();
  expect(
    (screen.getByLabelText("Dirección web (slug)") as HTMLInputElement).value,
  ).toBe("imagenes-religiosas");
  expect(fetch).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Cancelar" }));
  await user.click(screen.getByRole("button", { name: "Descartar cambios" }));
  expect(onClose).toHaveBeenCalledOnce();
  expect(fetch).not.toHaveBeenCalled();
});

test("Guardar envía el borrador y espera la confirmación antes de cerrar", async () => {
  const user = userEvent.setup();
  const onClose = vi.fn();
  let confirm!: (value: Response) => void;
  vi.mocked(fetch).mockReturnValue(
    new Promise((resolve) => {
      confirm = resolve;
    }),
  );
  render(<CatalogForm model="Category" initial={initial} onClose={onClose} />);
  await user.type(screen.getByLabelText("Nombre"), "Nueva categoría");
  await user.click(screen.getByLabelText("Visible en el sitio"));
  await user.click(screen.getByRole("button", { name: "Guardar cambios" }));
  expect(fetch).toHaveBeenCalledTimes(1);
  const [url, options] = vi.mocked(fetch).mock.calls[0];
  expect(url).toBe("/api/admin/catalog");
  expect(JSON.parse(String(options?.body)).record).toMatchObject({
    name: "Nueva categoría",
    slug: "nueva-categoria",
    active: true,
  });
  expect(onClose).not.toHaveBeenCalled();
  confirm(
    new Response(JSON.stringify({ id: "saved", cleanup: [] }), { status: 200 }),
  );
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  expect(refreshData).toHaveBeenCalledOnce();
});

test("Un error conserva los cambios para corregirlos y reintentar", async () => {
  const user = userEvent.setup();
  const onClose = vi.fn();
  vi.mocked(fetch).mockResolvedValue(
    new Response(JSON.stringify({ error: "Ese slug ya está en uso." }), {
      status: 400,
    }),
  );
  render(<CatalogForm model="Category" initial={initial} onClose={onClose} />);
  await user.type(screen.getByLabelText("Nombre"), "Regalos");
  await user.click(screen.getByRole("button", { name: "Guardar cambios" }));
  expect((await screen.findByRole("alert")).textContent).toContain(
    "Ese slug ya está en uso.",
  );
  expect((screen.getByLabelText("Nombre") as HTMLInputElement).value).toBe(
    "Regalos",
  );
  expect(onClose).not.toHaveBeenCalled();
});

test("Editar un producto y seleccionar categorías mantiene los cambios en el borrador", async () => {
  const user = userEvent.setup();
  render(
    <CatalogForm
      model="Product"
      initial={{
        ...initial,
        id: "existing-product",
        name: "Producto",
        slug: "producto",
        description: "Descripción",
        categoryIds: "",
        active: true,
      }}
      onClose={vi.fn()}
    />,
  );
  await user.clear(screen.getByLabelText("Nombre"));
  await user.type(screen.getByLabelText("Nombre"), "Buda decorativo");
  await user.click(
    screen.getByRole("button", { name: /Seleccionar categorías/ }),
  );
  await user.type(screen.getByLabelText("Buscar categoría"), "imagenes");
  expect(screen.queryByLabelText("Sahumerios")).toBeNull();
  await user.click(screen.getByLabelText("Imágenes religiosas"));
  await user.click(screen.getByRole("button", { name: "Listo" }));
  expect(screen.getByRole("button", { name: /1 seleccionada/ })).toBeTruthy();
  expect(
    (screen.getByLabelText("Dirección web (slug)") as HTMLInputElement).value,
  ).toBe("buda-decorativo");
  expect(fetch).not.toHaveBeenCalled();
});

test("seleccionar una imagen no la sube hasta guardar y un reintento reutiliza la subida", async () => {
  URL.createObjectURL = vi.fn(() => "blob:category-preview");
  URL.revokeObjectURL = vi.fn();
  const upload = vi
    .spyOn(ImageService, "uploadImage")
    .mockResolvedValue({
      success: true,
      url: "https://res.cloudinary.com/demo/new.jpg",
      public_id: "categories/new",
    });
  const remove = vi
    .spyOn(ImageService, "deleteImage")
    .mockResolvedValue({ success: true });
  vi.mocked(fetch)
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Error de guardado" }), {
        status: 400,
      }),
    )
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify({ id: "saved", cleanup: ["categories/old"] }),
        { status: 200 },
      ),
    );
  const user = userEvent.setup();
  render(
    <CatalogForm
      model="Category"
      initial={{
        ...initial,
        name: "Aromas",
        slug: "aromas",
        imageUrl: "https://res.cloudinary.com/demo/old.jpg",
        publicId: "categories/old",
      }}
      onClose={vi.fn()}
    />,
  );
  await user.upload(
    screen.getByLabelText("Reemplazar imagen"),
    new File(["image"], "photo.jpg", { type: "image/jpeg" }),
  );
  expect(upload).not.toHaveBeenCalled();
  expect(fetch).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Guardar cambios" }));
  expect(await screen.findByRole("alert")).toBeTruthy();
  expect(upload).toHaveBeenCalledOnce();
  expect(remove).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Guardar cambios" }));
  await waitFor(() => expect(remove).toHaveBeenCalledWith("categories/old"));
  expect(upload).toHaveBeenCalledOnce();
  expect(
    JSON.parse(String(vi.mocked(fetch).mock.calls[1][1]?.body)).record.imageUrl,
  ).toBe("https://res.cloudinary.com/demo/new.jpg");
  upload.mockRestore();
  remove.mockRestore();
});
