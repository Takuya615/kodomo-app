import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Vendored shadcn/ui + feature screens + client hooks: relax rules that conflict with upstream patterns
  {
    files: [
      "components/ui/**/*.{ts,tsx}",
      "hooks/usePersistFn.ts",
      "hooks/useMobile.tsx",
      "hooks/useStamp.ts",
      "hooks/useAdminAuth.ts",
      "features/**/*.{ts,tsx}",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "@next/next/no-img-element": "off",
    },
  },
]);

export default eslintConfig;
