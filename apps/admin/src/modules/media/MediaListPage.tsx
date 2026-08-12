/** Media management screen — Prompt 14, Part 6. Configures the generic
 * ResourceListPage against app.domains.media.router's admin API. */
import { mediaApi } from "@/api/mediaApi";
import type { MediaAssetCreate, MediaAssetRead } from "@/api/mediaApi";
import { ResourceListPage } from "@/components/admin/ResourceListPage";

export default function MediaListPage() {
  return (
    <ResourceListPage<MediaAssetRead, MediaAssetCreate>
      title="Media"
      queryKey="media"
      api={mediaApi}
      columns={[
        { key: "media_type", label: "Type" },
        { key: "original_filename", label: "Filename" },
        { key: "status", label: "Status" },
        { key: "is_featured", label: "Featured" },
      ]}
      createFields={[
        { name: "media_type", label: "Media Type (image/video/audio/document/animation)", required: true },
        { name: "external_reference", label: "External Reference", required: true },
        { name: "original_filename", label: "Original Filename" },
        { name: "alt_text", label: "Alt Text" },
      ]}
    />
  );
}
