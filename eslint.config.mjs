import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";
import js from "@eslint/js";
import nxEslintPlugin from "@nx/eslint-plugin";
import * as mdx from "eslint-plugin-mdx";
import preferJsr from "@prefer-jsr/eslint-plugin-prefer-jsr";
import json from "@eslint/json";

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
  recommendedConfig: js.configs.recommended,
});

export default [
  {
    ignores: ["**/dist"],
  },
  { plugins: { "@nx": nxEslintPlugin } },
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    rules: {
      "@nx/enforce-module-boundaries": [
        "error",
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: "*",
              onlyDependOnLibsWithTags: ["*"],
            },
          ],
        },
      ],
    },
  },
  ...compat
    .config({
      extends: ["plugin:@nx/typescript"],
    })
    .map((config) => ({
      ...config,
      files: ["**/*.ts", "**/*.tsx", "**/*.cts", "**/*.mts"],
      rules: {
        ...config.rules,
      },
    })),
  ...compat
    .config({
      extends: ["plugin:@nx/javascript"],
    })
    .map((config) => ({
      ...config,
      files: ["**/*.js", "**/*.jsx", "**/*.cjs", "**/*.mjs"],
      rules: {
        ...config.rules,
      },
    })),
  {
    ...mdx.flat,
    name: "eslint-mdx",
    files: ["**/*.md ", "**/*.mdx"],
    processor: mdx.createRemarkProcessor({
      lintCodeBlocks: true,
    }),
    rules: {
      ...mdx.flat.rules,
      "mdx/remark": "error",
    },
  },
  {
    files: ["**/*.json"],
    // Override or add rules here
    rules: {},
    languageOptions: {
      parser: await import("jsonc-eslint-parser"),
    },
  },
  {
    files: ["package.json"],
    language: "json/json",
    plugins: {
      "@prefer-jsr": preferJsr,
      json,
    },
    rules: {
      "@prefer-jsr/prefer-jsr": "error",
    },
  },
  {
    ignores: ["**/.docusaurus/"],
  },
];
