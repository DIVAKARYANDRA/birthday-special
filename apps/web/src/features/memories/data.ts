/**
 * ================================================================
 * SCOPE NOTE — placeholder data, read before extending this file.
 * ================================================================
 * No Public Experience API exists yet (Prompt 13's `memories` domain has
 * only an ADMIN-authenticated API, per Prompt 14 — apps/web must never
 * call it, per the strict admin/visitor separation maintained since
 * Prompt 4). This module exports static demo content, shaped exactly
 * like the backend's `MemorySummary` schema (see types.ts), so that:
 *
 *   1. MemoryCard/MemoriesScene can be built and visually validated now,
 *      against realistic data shapes, rather than against nothing; and
 *   2. the moment a future prompt implements a real Public Experience
 *      API + React Query hook, this file is deleted wholesale and
 *      replaced by that hook — no component in features/memories/ or
 *      scenes/memories/ needs to change shape-wise, only its data
 *      SOURCE changes.
 *
 * This is content placeholder data for demonstrating the UI, not real
 * personal content — per docs/06-engineering-foundation.md's synthetic-
 * data-only discipline for anything that isn't production.
 * ================================================================
 */
import type { MemorySummary } from "./types";

export const DEMO_MEMORIES: MemorySummary[] = [
  {
    id: "demo-1",
    title: "The Day We Met",
    description: "A rainy afternoon, a shared umbrella, and the start of everything.",
    memory_date: "2019-04-12",
    approximate_date_label: null,
    category: "timeline_milestone",
    importance: "core_milestone",
    is_featured: true,
    display_order: 0,
    status: "published",
    previewEmoji: "☔",
  },
  {
    id: "demo-2",
    title: "Our First Trip",
    description: "Getting lost in a new city together, and loving every wrong turn.",
    memory_date: null,
    approximate_date_label: "Summer 2020",
    category: "trip",
    importance: "notable",
    is_featured: false,
    display_order: 1,
    status: "published",
    previewEmoji: "🧳",
  },
  {
    id: "demo-3",
    title: "That Ridiculous Inside Joke",
    description: "You still bring this up at the worst possible moments.",
    memory_date: null,
    approximate_date_label: "sometime in 2021",
    category: "random_sweet_moment",
    importance: "small_moment",
    is_featured: false,
    display_order: 2,
    status: "published",
    previewEmoji: "😂",
  },
  {
    id: "demo-4",
    title: "One Year Together",
    description: "A quiet dinner, a big promise, and a lot of happy tears.",
    memory_date: "2020-04-12",
    approximate_date_label: null,
    category: "anniversary",
    importance: "core_milestone",
    is_featured: true,
    display_order: 3,
    status: "published",
    previewEmoji: "🥂",
  },
];
