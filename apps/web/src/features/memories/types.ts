/**
 * Mirrors app.domains.memories.schemas.MemorySummary (Prompt 11) field
 * for field, so a future real API integration is a type-compatible
 * drop-in — see data.ts's scope note.
 */
export interface MemorySummary {
  id: string;
  title: string;
  description: string | null;
  memory_date: string | null;
  approximate_date_label: string | null;
  category: string;
  importance: string;
  is_featured: boolean;
  display_order: number;
  status: string;
  /** Not part of the backend schema — a local-only field for this
   * placeholder data giving each demo card a distinct accent emoji,
   * since no real MediaAsset/photo is available to preview yet. */
  previewEmoji: string;
}
