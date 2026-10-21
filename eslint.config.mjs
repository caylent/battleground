import { defineConfig, globalIgnores } from "eslint/config";
import nextConfig from "eslint-config-next";
import prettierConfig from "eslint-config-prettier/flat";

export default defineConfig([
  ...nextConfig,
  prettierConfig,
  {
    settings: {
      next: {
        rootDir: "./src",
      },
    },
    rules: {
      "react/jsx-curly-brace-presence": ["error", "never"],
      "@next/next/no-img-element": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
      "react-hooks/purity": "off",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
