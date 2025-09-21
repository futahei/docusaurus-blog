import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import eslintConfigPrettier from "eslint-config-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";

export default [
  // 共通（JS/TS）設定
  {
    ignores: [
      "**/node_modules/**",
      "**/build/**", // Docusaurus の出力
      "**/.docusaurus/**", // Docusaurus の中間生成物
      "**/dist/**",
      "**/coverage/**",
    ],
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "unused-imports": unusedImports,
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      // --- 未使用importの自動削除 ---
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],

      // --- import順の自動整列（グルーピング含む）---
      "simple-import-sort/imports": [
        "warn",
        {
          groups: [
            ["^react"],
            ["^@?\\w"],
            ["^(@site|@theme|@docusaurus)(/.*)?$"],
            ["^\\u0000"],
            [
              "^\\.\\.(?!/?$)",
              "^\\.\\./?$",
              "^\\./(?=.*/)(?!/?$)",
              "^\\.(?!/?$)",
              "^\\./?$",
            ],
            ["^.+\\.s?css$"],
          ],
        },
      ],
      "simple-import-sort/exports": "warn",
    },
  },

  // Prettier互換（フォーマット系のESLintルールを無効化）
  eslintConfigPrettier,
];
