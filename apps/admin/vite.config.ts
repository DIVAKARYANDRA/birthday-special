import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Vite configuration for the Admin Dashboard application.
// Deliberately separate from apps/web's config (docs/05-frontend-architecture.md,
// Section 3) — the two apps are independently built and deployed even though
// they share design tokens and generated types.
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
    port: 5174,
  },
});
