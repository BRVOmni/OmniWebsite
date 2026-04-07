import tseslint from "typescript-eslint";
import jsxA11y from "eslint-plugin-jsx-a11y";
import nextPlugin from "@next/eslint-plugin-next";

const eslintConfig = [
  {
    ignores: ["node_modules", ".next", "out", "old-static"],
  },
  ...tseslint.configs.recommended,
  jsxA11y.flatConfigs.recommended,
  nextPlugin.flatConfig.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
];

export default eslintConfig;
