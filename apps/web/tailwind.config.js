/** @type {import('tailwindcss').Config} */
// Tailwind is configured to read color, spacing, radius, and typography
// values from CSS custom properties rather than hardcoded values, per
// docs/05-frontend-architecture.md (Section 5) and docs/02-design-system.md
// (Section 16). The actual token values (design tokens themselves) are not
// hardcoded here — they are resolved at runtime by the Theme Engine from
// admin-authored Theme data, and consumed here only as CSS variable
// references. Concrete token wiring is implementation work for a future
// prompt once packages/ui-kit's token layer is built out.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Placeholder semantic references — resolved to CSS variables
        // once packages/ui-kit's token layer is implemented.
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        glow: "var(--color-glow)",
      },
      fontFamily: {
        display: "var(--font-display)",
        body: "var(--font-body)",
        handwritten: "var(--font-handwritten)",
        game: "var(--font-game)",
      },
      borderRadius: {
        token: "var(--radius-md)",
      },
    },
  },
  plugins: [],
};
