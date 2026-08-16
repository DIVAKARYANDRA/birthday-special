import { apiRequest } from "./client";


export interface MemoryRead {
  id: string;
  title: string;
  description: string | null;
  story: string | null;
  memory_date: string | null;
  category: string;
  status: string;
  is_featured: boolean;
}


export interface MemoryCreate {
  title: string;
  description?: string;
  story?: string;
  memory_date?: string;
  category: string;
}


export interface MemoryMediaItemCreate {
  media_asset_id: string;
  display_order?: number;
  caption?: string;
}


export const memoriesApi = {

  list: () =>
    apiRequest<MemoryRead[]>(
      "/api/v1/admin/memories",
    ),


  create: (
    payload: MemoryCreate,
  ) =>
    apiRequest<MemoryRead>(
      "/api/v1/admin/memories",
      {
        method: "POST",
        body: payload,
      },
    ),


  attachMediaItem: (
    memoryId: string,
    payload: MemoryMediaItemCreate,
  ) =>
    apiRequest<MemoryRead>(
      `/api/v1/admin/memories/${memoryId}/media-items`,
      {
        method: "POST",
        body: payload,
      },
    ),

};