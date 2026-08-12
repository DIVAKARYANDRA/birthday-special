# modules/media/

Media management screen — Prompt 14, Part 6. Maps to the unified backend
`app.domains.media` domain (MediaAsset, Prompt 10), which covers images,
videos, audio, documents, and animations as one entity type rather than
per-type tables.

This folder is new as of Prompt 14 (not part of Prompt 7's original
scaffold) and supersedes the earlier `photos/`, `albums/`, and `videos/`
placeholder folders for actual implementation purposes — those remain as
originally scaffolded (still placeholders) since the backend never grew
separate domains for them; MediaAsset's `media_type` field distinguishes
image/video/audio/document/animation instead. A future prompt could
either repurpose those folders for MediaAsset-adjacent concerns (e.g.
`albums/` for a future Album/AlbumItem grouping feature, per
docs/03-data-architecture.md, Section 3) or remove them — that decision
is deliberately left open rather than made here.
