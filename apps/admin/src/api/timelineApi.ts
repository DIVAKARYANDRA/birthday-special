/** Timeline admin API — wraps app.domains.timeline.router (Prompt 14). */
import { createResourceApi } from "./resource";

export interface TimelineRead {
  id: string;
  title: string;
  description: string | null;
  presentation_style: string;
  status: string;
  is_featured: boolean;
  display_order: number;
}

export interface TimelineCreate {
  title: string;
  description?: string;
  presentation_style?: string;
}

export interface TimelineUpdate {
  title?: string;
  description?: string;
  status?: string;
}

export const timelineApi = createResourceApi<TimelineRead, TimelineCreate, TimelineUpdate>(
  "/api/v1/admin/timeline",
);
