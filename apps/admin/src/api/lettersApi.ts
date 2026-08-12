/** Letters admin API — wraps app.domains.letters.router (Prompt 14). */
import { apiRequest } from "./client";
import { createResourceApi } from "./resource";

export interface LetterRead {
  id: string;
  title: string;
  body: string;
  written_date: string | null;
  status: string;
  unlock_condition_id: string | null;
}

export interface LetterCreate {
  title: string;
  body: string;
  written_date?: string;
  unlock_condition_id?: string;
  media_asset_id?: string;
}

export interface LetterUpdate {
  title?: string;
  body?: string;
  status?: string;
}

export const lettersApi = {
  ...createResourceApi<LetterRead, LetterCreate, LetterUpdate>("/api/v1/admin/letters"),
  // Extra sub-resource beyond the standard shape — see
  // app.domains.letters.router's SecretMessage routes.
  listSecretMessages: () => apiRequest<unknown[]>("/api/v1/admin/letters/secret-messages"),
};
