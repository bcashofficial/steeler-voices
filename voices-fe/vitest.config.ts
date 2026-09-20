import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Tests render the real primitives: the federated import resolves to the
// design system's source next door, the same mapping tsconfig uses.
const designSystem = fileURLToPath(new URL("../voices-design-system/src/theme/index.ts", import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "design_system/theme": designSystem } },
  test: {
    environment: "jsdom",
    environmentOptions: { jsdom: { url: "http://localhost/" } },
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
});
