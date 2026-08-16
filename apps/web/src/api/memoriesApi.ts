import { apiRequest } from "./client";


export interface MemoryImage {
  id: string;
  url: string;
  caption: string | null;
}


export interface MemoryRead {
  id: string;
  title: string;
  description: string | null;
  story: string | null;
  memory_date: string | null;
  approximate_date_label: string | null;
  location: string | null;
  category: string;
  importance: string;
  is_featured: boolean;
  images: MemoryImage[];
}


export async function getMemories(): Promise<MemoryRead[]> {
  return apiRequest<MemoryRead[]>(
    "/api/v1/experience/memories",
  );
}