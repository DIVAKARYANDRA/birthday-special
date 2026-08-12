/** Memory admin API — wraps app.domains.memories.router (Prompt 14). */
import { createResourceApi } from "./resource";

export interface MemoryRead {
  id: string;
  title: string;
  description: string | null;
  memory_date: string | null;
  category: string;
  importance: string;
  status: string;
  is_featured: boolean;
  display_order: number;
}

export interface MemoryCreate {
  title: string;
  description?: string;
  story?: string;
  memory_date?: string;
  category: string;
  importance?: string;
}

export interface MemoryUpdate {
  title?: string;
  description?: string;
  status?: string;
  is_featured?: boolean;
}

export const memoriesApi = createResourceApi<MemoryRead, MemoryCreate, MemoryUpdate>(
  "/api/v1/admin/memories",
);
