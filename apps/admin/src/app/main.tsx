/**
 * Admin Dashboard entry point.
 *
 * Per docs/05-frontend-architecture.md, Section 1/8: QueryClientProvider
 * is mounted here at the app root — every management screen's
 * useQuery/useMutation calls (src/components/admin/ResourceListPage.tsx)
 * rely on this being present above them in the tree.
 *
 * See apps/web/src/app/main.tsx for the equivalent User Website file;
 * this app is built and deployed entirely independently
 * (docs/05-frontend-architecture.md, Section 3).
 */
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "./App";
import "../theme/index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
