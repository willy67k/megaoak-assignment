import js from "@eslint/js";
import vue from "eslint-plugin-vue";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import vueParser from "vue-eslint-parser";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default [
  // JS 基本規則
  js.configs.recommended,

  // Vue + TS
  {
    files: ["**/*.vue", "**/*.ts", "**/*.js"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      vue,
      "@typescript-eslint": tseslint,
    },
    rules: {
      /* ---------- Vue ---------- */
      "vue/multi-word-component-names": "off",

      /* ---------- TypeScript ---------- */
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/explicit-function-return-type": "off",

      /* ---------- JS ---------- */
      "no-unused-vars": "warn",
      "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
      "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    },
    ignores: ["node_modules", "dist"],
  },

  // ⭐ 關鍵：放最後，關掉所有 format 規則
  prettier,
];
