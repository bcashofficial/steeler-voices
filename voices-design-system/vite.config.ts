import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

// PURE REMOTE — this build exposes the theme barrel as a Module Federation
// remote and consumes nothing. Being single-role avoids the shared-scope
// init conflict @originjs/vite-plugin-federation hits when an app is both
// host and remote. voices-fe declares this remote and imports like:
//
//   import { PulseBar, tokens } from "design_system/theme";
//
// House rule: no heavyweight runtime deps (chart libraries, editors) live
// here — they drag CJS transitive packages across the MF boundary. Charts
// live with their consumer. This remote stays ESM-only.
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    federation({
      name: "design_system",
      filename: "remoteEntry.js",
      exposes: {
        "./theme": "./src/theme/index.ts",
      },
      shared: {
        react: { singleton: true, requiredVersion: "^19.0.0" },
        "react-dom": { singleton: true, requiredVersion: "^19.0.0" },
      },
    }),
  ],
  server: { port: 5301, host: true, cors: true },
  preview: { port: 5301, cors: true },
  build: {
    outDir: "dist",
    sourcemap: mode !== "production",
    modulePreload: false,
    target: "esnext",
    minify: mode === "production" ? "esbuild" : false,
    cssCodeSplit: false,
  },
}));
