/** Quote admin API — wraps app.domains.quotes.router (Prompt 14). */
import { createResourceApi } from "./resource";

export interface QuoteRead {
  id: string;
  text: string;
  author: string | null;
  category: string;
  context_tag: string | null;
  display_priority: number;
  status: string;
}

export interface QuoteCreate {
  text: string;
  author?: string;
  category?: string;
  context_tag?: string;
  display_priority?: number;
}

export interface QuoteUpdate {
  text?: string;
  status?: string;
  display_priority?: number;
}

export const quotesApi = createResourceApi<QuoteRead, QuoteCreate, QuoteUpdate>("/api/v1/admin/quotes");
