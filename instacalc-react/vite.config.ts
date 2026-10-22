import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// `base` is environment driven:
//   GitHub Pages project site -> VITE_BASE=/<repo>/
//   Custom domain (instacalc.in) -> VITE_BASE=/
const base = process.env.VITE_BASE ?? "/";

/**
 * Dev server port. Override with `PORT=xxxx npm run dev`.
 * Kept here (rather than on the CLI) so dev and preview share one source.
 */
const DEV_PORT = Number(process.env.PORT ?? 7000);

export default defineConfig(({ isSsrBuild }) => ({
  base,
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    assetsInlineLimit: 2048,
    reportCompressedSize: false,
    rollupOptions: isSsrBuild
      ? {
          output: {
            format: "esm",
            entryFileNames: "entry-server.js",
            chunkFileNames: "chunks/[name]-[hash].js",
          },
        }
      : {
          input: {
            main: fileURLToPath(new URL("./index.html", import.meta.url)),
          },
          output: {
            entryFileNames: "assets/[name]-[hash].js",
            chunkFileNames: "assets/[name]-[hash].js",
            assetFileNames: "assets/[name]-[hash][extname]",
            manualChunks(id) {
              if (id.includes("node_modules/chart.js")) return "chartjs";
              if (id.includes("node_modules")) return "vendor";
            },
          },
        },
  },
  server: { port: DEV_PORT },
  // `vite preview` reads this too, so PORT controls both servers.
  preview: { port: DEV_PORT + 1000 },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
}));
