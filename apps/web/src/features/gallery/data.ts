/**
 * SCOPE NOTE: same placeholder-data pattern as
 * features/memories/data.ts and features/timeline/data.ts. No public
 * MediaAsset delivery path exists yet (Cloudinary integration itself is
 * unimplemented per Prompt 10's own exclusions, and the admin API from
 * Prompt 14 is not visitor-callable) — these are solid-color placeholder
 * "photos" with an emoji and caption, positioned/rotated to demonstrate
 * the floating-polaroid layout, not real images. Replacing this file
 * with a real MediaAsset-backed hook is the entire integration step once
 * both Cloudinary and a Public Experience API exist.
 */
import type { GalleryPhoto } from "./types";

export const DEMO_PHOTOS: GalleryPhoto[] = [
  { id: "p1", alt_text: "A rainy first meeting", placeholderColor: "#6b3f6e", placeholderEmoji: "☔", caption: "Where it all began", rotationDeg: -6 },
  { id: "p2", alt_text: "Coffee date", placeholderColor: "#4b2e83", placeholderEmoji: "☕", caption: "Three hours felt like ten minutes", rotationDeg: 4 },
  { id: "p3", alt_text: "Getting lost on a trip", placeholderColor: "#8e6ac4", placeholderEmoji: "🧳", caption: "Best wrong turn ever", rotationDeg: -3 },
  { id: "p4", alt_text: "Movie night", placeholderColor: "#3a2456", placeholderEmoji: "🍿", caption: "You always fall asleep first", rotationDeg: 7 },
  { id: "p5", alt_text: "First anniversary dinner", placeholderColor: "#5c3a72", placeholderEmoji: "🥂", caption: "One year down, forever to go", rotationDeg: -5 },
  { id: "p6", alt_text: "A silly inside joke moment", placeholderColor: "#d8a7e0", placeholderEmoji: "😂", caption: "You know exactly which one", rotationDeg: 2 },
];
