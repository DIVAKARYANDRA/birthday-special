/** Memory management screen — Prompt 14, Part 6. */
import { memoriesApi } from "@/api/memoriesApi";
import type { MemoryCreate, MemoryRead } from "@/api/memoriesApi";
import { ResourceListPage } from "@/components/admin/ResourceListPage";

export default function MemoriesListPage() {
  return (
    <ResourceListPage<MemoryRead, MemoryCreate>
      title="Memories"
      queryKey="memories"
      api={memoriesApi}
      columns={[
        { key: "title", label: "Title" },
        { key: "category", label: "Category" },
        { key: "memory_date", label: "Date" },
        { key: "status", label: "Status" },
        { key: "is_featured", label: "Featured" },
      ]}
      createFields={[
        { name: "title", label: "Title", required: true },
        { name: "description", label: "Description", type: "textarea" },
        { name: "story", label: "Story", type: "textarea" },
        { name: "memory_date", label: "Date", type: "date" },
        { name: "category", label: "Category (timeline_milestone/special_moment/trip/anniversary/random_sweet_moment)", required: true },
      ]}
    />
  );
}
