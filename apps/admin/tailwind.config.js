/** @type {import('tailwindcss').Config} */
// Shares the same token-reference approach as apps/web (see that app's
// tailwind.config.js and docs/02-design-system.md, Section 15) — the Admin
// Dashboard uses the SAME semantic tokens as the User Website (same brand),
// but its component layer applies them with more restraint (fewer particles,
// less ambient animation) per the design system's admin guidance.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
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
      },
      borderRadius: {
        token: "var(--radius-md)",
      },
    },
  },
  plugins: [],
};
