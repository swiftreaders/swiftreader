import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: ["next/core-web-vitals", "next/typescript"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off", // Disable unused variables warning
      "@next/next/no-async-client-component": "off", // Disable warning for async client components
      "@typescript-eslint/no-explicit-any": "off" // Disable warning for any types
    },
  }),
];

export default eslintConfig;