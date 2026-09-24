"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";

import { ImageService } from "@/services/ImageService";

import {
  type AdminData,
  adminModels,
  type AdminRecord,
  type ModelName,
} from "./adminModels";

type AdminContextValue = {
  data: AdminData;
  save: (model: ModelName, record: AdminRecord) => Promise<string | null>;
  add: (model: ModelName, values: Partial<AdminRecord>) => Promise<string>;
  remove: (model: ModelName, id: string) => Promise<string | null>;
  reset: () => void;
  refreshData: () => Promise<void>;
  revision: number;
};
const AdminContext = createContext<AdminContextValue | null>(null);
const emptyData = Object.fromEntries(
  adminModels.map((model) => [model.name, []]),
) as unknown as AdminData;

export default function AdminProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(emptyData);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  async function refresh() {
    const response = await fetch("/api/admin/data", { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    setData(result);
    setLoaded(true);
    setError("");
  }
  useEffect(() => {
    let active = true;
    fetch("/api/admin/data", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        if (active) {
          setData(result);
          setLoaded(true);
        }
      })
      .catch((error) => {
        if (active) setError(error.message);
      });
    return () => {
      active = false;
    };
  }, []);
  async function mutation(
    method: string,
    model: ModelName,
    record: Partial<AdminRecord>,
  ): Promise<{ id: string }> {
    const operation = queue.current.then(async () => {
      const response = await fetch("/api/admin/data", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, record }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      await refresh();
      return result;
    });
    queue.current = operation.catch(() => {});
    return operation;
  }
  async function save(model: ModelName, record: AdminRecord) {
    try {
      await mutation("PATCH", model, record);
      toast.success("Cambios guardados", { toastId: "admin-save" });
      return null;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo guardar.";
      toast.error(message);
      return message;
    }
  }
  async function add(model: ModelName, values: Partial<AdminRecord>) {
    try {
      const result = await mutation("POST", model, values);
      return result.id;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear.");
      return "";
    }
  }
  async function remove(model: ModelName, id: string) {
    try {
      const images =
        model === "Product"
          ? data.ProductImage.filter(
              (image) =>
                image.productId === id &&
                String(image.url).startsWith("https://res.cloudinary.com/"),
            )
          : model === "Category"
            ? data.Category.filter(
                (category) =>
                  category.id === id &&
                  String(category.imageUrl).startsWith(
                    "https://res.cloudinary.com/",
                  ),
              )
            : [];
      await mutation("DELETE", model, { id });
      for (const image of images) {
        if (!image.publicId) continue;
        const result = await ImageService.deleteImage(String(image.publicId));
        if (!result.success)
          toast.warning(
            `Registro eliminado. Archivo pendiente de limpieza: ${result.error}`,
          );
      }
      toast.success("Registro eliminado");
      return null;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo eliminar.";
      toast.error(message);
      return message;
    }
  }
  function reset() {
    void refresh()
      .then(() => setRevision((value) => value + 1))
      .catch((error) => setError(error.message));
  }
  if (!loaded)
    return (
      <main style={{ padding: "3rem" }}>
        <p role="status">{error || "Cargando datos del panel…"}</p>
        {error && (
          <button type="button" onClick={reset}>
            Reintentar conexión
          </button>
        )}
      </main>
    );
  return (
    <AdminContext.Provider
      value={{ data, save, add, remove, reset, refreshData: refresh, revision }}
    >
      {children}
    </AdminContext.Provider>
  );
}
export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error("useAdmin requiere AdminProvider");
  return context;
}
