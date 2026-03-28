import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

const eslintConfig = tseslint.config(
  { ignores: [".next/**", "out/**", "node_modules/**"] },
  ...tseslint.configs.recommended,
  {
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
);

export default eslintConfig;
