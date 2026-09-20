import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

// HOST — voices-fe consumes the design_system remote and exposes nothing.
// Every primitive and token comes over Module Federation from
// voices-design-system on :5301 (`design_system/theme`); this app holds
// only screens and the API client. The remote's URL and the backend's URL
// are the two things a deploy changes, both from the environment at build.
const DESIGN_SYSTEM_URL = process.env.DESIGN_SYSTEM_URL ?? "http://localhost:5301";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    federation({
      name: "voices",
      remotes: {
        design_system: `${DESIGN_SYSTEM_URL}/assets/remoteEntry.js`,
      },
      shared: {
        react: { singleton: true, requiredVersion: "^19.0.0" },
        "react-dom": { singleton: true, requiredVersion: "^19.0.0" },
      },
    }),
  ],
  server: { port: 5300, host: true, strictPort: true },
  preview: { port: 5300, strictPort: true },
  build: {
    target: "esnext",
    modulePreload: false,
    sourcemap: mode !== "production",
    minify: mode === "production" ? "esbuild" : false,
    cssCodeSplit: false,
  },
}));
