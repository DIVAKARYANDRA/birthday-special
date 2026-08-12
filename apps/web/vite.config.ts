import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Vite configuration for the User Website application.
// Per docs/05-frontend-architecture.md (Section 16), route/scene-based
// code splitting is a core performance requirement — Vite's default
// dynamic-import-based chunking handles this once scenes/games are
// implemented as lazy-loaded modules; no special config is needed here
// beyond the standard React plugin and path aliases.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@journey/ui-kit": path.resolve(__dirname, "../../packages/ui-kit/src"),
      "@journey/types": path.resolve(__dirname, "../../packages/types/src"),
    },
  },
  server: {
    port: 5173,
  },
});
