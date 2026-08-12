/**
 * Application entry point.
 *
 * Per docs/05-frontend-architecture.md, Section 1/6: providers mounted
 * here at the root. React Query is intentionally NOT mounted in this
 * prompt — nothing in apps/web performs a real network fetch yet (every
 * scene's data comes from local placeholder modules, per each feature's
 * own data.ts scope note), so adding a QueryClientProvider now would be
 * unused scaffolding rather than a genuine requirement; it belongs in
 * the prompt that actually wires a Public Experience API.
 */
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "../theme/index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
