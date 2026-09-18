import { defineConfig, globalIgnores } from "eslint/config";
import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import react from "@eslint-react/eslint-plugin";
import reactHooks from "eslint-plugin-react-hooks";
import { importX } from "eslint-plugin-import-x";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import globals from "globals";
import tseslint from "typescript-eslint";

const codeFiles = ["**/*.{js,mjs,cjs,ts,tsx,mts,cts}"];
const reactFiles = ["**/*.{jsx,tsx}"];

export default defineConfig([
  globalIgnores([
    ".next/**", "out/**", "coverage/**", "playwright-report/**",
    "test-results/**", "next-env.d.ts",
  ]),
  {
    files: codeFiles,
    extends: [js.configs.recommended, importX.flatConfigs.recommended],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    settings: {
      "import-x/resolver-next": [
        createTypeScriptImportResolver({ project: "./tsconfig.json", alwaysTryTypes: true }),
      ],
    },
  },
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    extends: [tseslint.configs.recommended, importX.flatConfigs.typescript],
  },
  {
    files: reactFiles,
    extends: [react.configs.recommended, reactHooks.configs.flat.recommended],
    plugins: { "@next/next": nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
]);
