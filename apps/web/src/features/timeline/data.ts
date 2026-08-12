/**
 * SCOPE NOTE: same placeholder-data pattern as
 * features/memories/data.ts — no Public Experience API exists yet for
 * app.domains.timeline (Prompt 12), so this is static demo content
 * shaped like TimelineChapterRead/TimelineEntryRead, replaceable
 * wholesale once that API exists. Not real personal content.
 */
import type { TimelineChapterData } from "./types";

export const DEMO_CHAPTERS: TimelineChapterData[] = [
  {
    id: "chapter-1",
    title: "How We Met",
    stations: [
      { id: "s1", title: "First Hello", memoryTitle: "The Day We Met", emoji: "☔" },
      { id: "s2", title: "First Date", memoryTitle: "Coffee That Turned Into Hours", emoji: "☕" },
    ],
  },
  {
    id: "chapter-2",
    title: "Growing Together",
    stations: [
      { id: "s3", title: "Our First Trip", memoryTitle: "Getting Lost Together", emoji: "🧳" },
      { id: "s4", title: "Moving In", memoryTitle: "Two Toothbrushes, One Cup", emoji: "🏡" },
    ],
  },
  {
    id: "chapter-3",
    title: "Milestones",
    stations: [{ id: "s5", title: "One Year", memoryTitle: "One Year Together", emoji: "🥂" }],
  },
];
