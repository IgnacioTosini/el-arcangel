import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: { import: nextVitals.find(config => config.plugins?.import).plugins.import },
    rules: {
      "import/first": "error",
      "import/order": ["error", {
        groups: ["builtin", "external", "internal", "parent", "sibling", "index", "object", "type"],
        pathGroups: [{ pattern: "@/**", group: "internal" }],
        pathGroupsExcludedImportTypes: ["builtin", "type"],
        alphabetize: { order: "asc", caseInsensitive: true },
        "newlines-between": "always",
      }],
      "sort-imports": ["error", { ignoreDeclarationSort: true, ignoreCase: true }],
    },
  },
  { files: ["check-db.cjs"], rules: { "@typescript-eslint/no-require-imports": "off" } },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
