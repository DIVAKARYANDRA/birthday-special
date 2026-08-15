import { apiRequest } from "./client";

export interface MusicTrackRead {
  id: string;
  media_asset_id: string;
  title: string;
  mood: string | null;
  default_volume: number;
  loop: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MusicTrackCreate {
  media_asset_id: string;
  title: string;
  mood?: string;
  default_volume?: number;
  loop?: boolean;
}

export interface MusicTrackUpdate {
  title?: string;
  mood?: string;
  default_volume?: number;
  loop?: boolean;
}

export const musicApi = {
  list: () =>
    apiRequest<MusicTrackRead[]>(
      "/api/v1/admin/music",
    ),

  get: (id: string) =>
    apiRequest<MusicTrackRead>(
      `/api/v1/admin/music/${id}`,
    ),

  create: (payload: MusicTrackCreate) =>
    apiRequest<MusicTrackRead>(
      "/api/v1/admin/music",
      {
        method: "POST",
        body: payload,
      },
    ),

  update: (id: string, payload: MusicTrackUpdate) =>
    apiRequest<MusicTrackRead>(
      `/api/v1/admin/music/${id}`,
      {
        method: "PATCH",
        body: payload,
      },
    ),

  activate: (id: string) =>
    apiRequest<MusicTrackRead>(
      `/api/v1/admin/music/${id}/activate`,
      {
        method: "POST",
      },
    ),

  deactivate: (id: string) =>
    apiRequest<MusicTrackRead>(
      `/api/v1/admin/music/${id}/deactivate`,
      {
        method: "POST",
      },
    ),
};