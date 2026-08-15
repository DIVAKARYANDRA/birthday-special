/** MediaAsset admin API. */

import { apiRequest } from "./client";
import { createResourceApi } from "./resource";

export interface MediaAssetRead {
  id: string;
  media_type: string;
  external_reference: string;
  storage_provider: string;
  original_filename: string | null;
  mime_type: string | null;
  alt_text: string | null;
  file_size_bytes: number | null;
  width_px: number | null;
  height_px: number | null;
  duration_seconds: number | null;
  status: string;
  display_order: number;
  is_visible: boolean;
  usage: string | null;
  is_featured: boolean;
  created_at: string;
}

export interface MediaAssetCreate {
  media_type: string;
  external_reference: string;
  storage_provider?: string;
  original_filename?: string;
  usage?: string;
  alt_text?: string;
  display_order?: number;
}

export interface MediaAssetUpdate {
  alt_text?: string;
  display_order?: number;
  is_visible?: boolean;
  usage?: string;
  is_featured?: boolean;
  status?: string;
}

const resourceApi = createResourceApi<
  MediaAssetRead,
  MediaAssetCreate,
  MediaAssetUpdate
>("/api/v1/admin/media");

export const mediaApi = {
  ...resourceApi,

  upload: (
    file: File,
    mediaType: string,
    altText?: string,
    displayOrder = 0,
  ) => {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("media_type", mediaType);
    formData.append("display_order", String(displayOrder));

    if (altText) {
      formData.append("alt_text", altText);
    }

    return apiRequest<MediaAssetRead>(
      "/api/v1/admin/media/upload",
      {
        method: "POST",
        body: formData,
      },
    );
  },
};