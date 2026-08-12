/**
 * Mirrors app.domains.timeline.schemas.TimelineChapterRead/TimelineEntryRead
 * (Prompt 12) field for field — see data.ts's scope note (same pattern
 * as features/memories/types.ts).
 */
export interface TimelineStationData {
  id: string;
  title: string;
  memoryTitle: string;
  emoji: string;
}

export interface TimelineChapterData {
  id: string;
  title: string;
  stations: TimelineStationData[];
}
