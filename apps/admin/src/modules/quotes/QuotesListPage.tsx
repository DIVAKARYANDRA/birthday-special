/** Quote management screen — Prompt 14, Part 6. */
import { quotesApi } from "@/api/quotesApi";
import type { QuoteCreate, QuoteRead } from "@/api/quotesApi";
import { ResourceListPage } from "@/components/admin/ResourceListPage";

export default function QuotesListPage() {
  return (
    <ResourceListPage<QuoteRead, QuoteCreate>
      title="Quotes"
      queryKey="quotes"
      api={quotesApi}
      columns={[
        { key: "text", label: "Text" },
        { key: "category", label: "Category" },
        { key: "context_tag", label: "Context" },
        { key: "display_priority", label: "Priority" },
        { key: "status", label: "Status" },
      ]}
      createFields={[
        { name: "text", label: "Text", type: "textarea", required: true },
        { name: "author", label: "Author" },
        { name: "category", label: "Category (romantic/encouragement/milestone/playful/general)" },
        { name: "context_tag", label: "Context Tag" },
      ]}
    />
  );
}
