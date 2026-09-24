// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";

import { openWhatsApp } from "@/lib/open-whatsapp";
afterEach(() => vi.restoreAllMocks());

test("Abre una pestaña antes de guardar y la dirige a WhatsApp después", async () => {
  const tab = {
    opener: window,
    closed: false,
    location: { replace: vi.fn() },
    close: vi.fn(),
  };
  const open = vi
    .spyOn(window, "open")
    .mockReturnValue(tab as unknown as Window);
  const save = vi.fn(async () => {
    expect(open).toHaveBeenCalledWith("about:blank", "_blank");
    expect(tab.location.replace).not.toHaveBeenCalled();
  });
  await openWhatsApp("5491112345678", "Hola mundo", save);
  expect(tab.opener).toBeNull();
  expect(tab.location.replace).toHaveBeenCalledWith(
    "https://wa.me/5491112345678?text=Hola%20mundo",
  );
});

test("No guarda si el navegador bloquea la pestaña y la cierra si falla el guardado", async () => {
  const open = vi.spyOn(window, "open").mockReturnValue(null);
  const save = vi.fn();
  await expect(openWhatsApp("12345678", "Hola", save)).rejects.toThrow(
    "ventanas emergentes",
  );
  expect(save).not.toHaveBeenCalled();
  const tab = {
    opener: window,
    location: { replace: vi.fn() },
    close: vi.fn(),
  };
  open.mockReturnValue(tab as unknown as Window);
  await expect(
    openWhatsApp("12345678", "Hola", async () => {
      throw new Error("Stock");
    }),
  ).rejects.toThrow("Stock");
  expect(tab.close).toHaveBeenCalled();
  expect(tab.location.replace).not.toHaveBeenCalled();
});
