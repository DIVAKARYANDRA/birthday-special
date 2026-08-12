/**
 * Mirrors app.domains.media.schemas.MediaAssetRead (Prompt 10) at the
 * fields relevant to gallery display — see data.ts's scope note.
 */
export interface GalleryPhoto {
  id: string;
  alt_text: string | null;
  /** Not part of the backend schema — a local-only stand-in for a real
   * Cloudinary-delivered image URL, per data.ts's scope note. A solid
   * color + emoji rather than a real photo, since none exists. */
  placeholderColor: string;
  placeholderEmoji: string;
  caption: string;
  rotationDeg: number;
}
