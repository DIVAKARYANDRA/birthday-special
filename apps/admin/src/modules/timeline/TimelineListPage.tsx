/** Timeline management screen — Prompt 14, Part 6. */
import { timelineApi } from "@/api/timelineApi";
import type { TimelineCreate, TimelineRead } from "@/api/timelineApi";
import { ResourceListPage } from "@/components/admin/ResourceListPage";

export default function TimelineListPage() {
  return (
    <ResourceListPage<TimelineRead, TimelineCreate>
      title="Timelines"
      queryKey="timelines"
      api={timelineApi}
      columns={[
        { key: "title", label: "Title" },
        { key: "presentation_style", label: "Presentation" },
        { key: "status", label: "Status" },
        { key: "is_featured", label: "Featured" },
      ]}
      createFields={[
        { name: "title", label: "Title", required: true },
        { name: "description", label: "Description", type: "textarea" },
        { name: "presentation_style", label: "Presentation Style (story_book/train_journey/memory_garden/world_map)" },
      ]}
    />
  );
}
