import { expect, test } from "vitest";

import {
  defaultHomeContent,
  readHomeContent,
  validateHomeContent,
} from "@/lib/home-content";

test("Conserva los textos actuales hasta que se publique contenido", () => {
  expect(readHomeContent({})).toEqual(defaultHomeContent);
  expect(readHomeContent(null)).toEqual(defaultHomeContent);
  expect(readHomeContent({ heroTitle: "Nuevo título" }).heroTitle).toBe(
    "Nuevo título",
  );
});

test("Valida todos los textos y limita el largo de los botones", () => {
  expect(
    validateHomeContent({ ...defaultHomeContent, heroTitle: " Nuevo título " })
      .heroTitle,
  ).toBe("Nuevo título");
  expect(() =>
    validateHomeContent({ ...defaultHomeContent, heroTitle: " " }),
  ).toThrow();
  expect(() =>
    validateHomeContent({
      ...defaultHomeContent,
      heroCatalogButton: "x".repeat(81),
    }),
  ).toThrow();
});
