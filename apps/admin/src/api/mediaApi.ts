/** MediaAsset admin API — wraps app.domains.media.router (Prompt 14). */
import { createResourceApi } from "./resource";

export interface MediaAssetRead {
  id: string;
  media_type: string;
  external_reference: string;
  original_filename: string | null;
  alt_text: string | null;
  status: string;
  display_order: number;
  is_visible: boolean;
  is_featured: boolean;
  created_at: string;
}

export interface MediaAssetCreate {
  media_type: string;
  external_reference: string;
  storage_provider?: string;
  original_filename?: string;
  alt_text?: string;
  display_order?: number;
}

export interface MediaAssetUpdate {
  alt_text?: string;
  display_order?: number;
  is_visible?: boolean;
  is_featured?: boolean;
  status?: string;
}

export const mediaApi = createResourceApi<MediaAssetRead, MediaAssetCreate, MediaAssetUpdate>(
  "/api/v1/admin/media",
);
