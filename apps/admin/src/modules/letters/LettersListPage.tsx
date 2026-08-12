/** Letter management screen — Prompt 14, Part 6. Secret Message
 * management is a distinct sub-resource on the same backend router
 * (app.domains.letters.router) — deferred from this screen's scope, a
 * candidate for its own screen in a future polish pass. */
import { lettersApi } from "@/api/lettersApi";
import type { LetterCreate, LetterRead } from "@/api/lettersApi";
import { ResourceListPage } from "@/components/admin/ResourceListPage";

export default function LettersListPage() {
  return (
    <ResourceListPage<LetterRead, LetterCreate>
      title="Letters"
      queryKey="letters"
      api={lettersApi}
      columns={[
        { key: "title", label: "Title" },
        { key: "written_date", label: "Written" },
        { key: "status", label: "Status" },
        { key: "unlock_condition_id", label: "Unlock Condition" },
      ]}
      createFields={[
        { name: "title", label: "Title", required: true },
        { name: "body", label: "Body", type: "textarea", required: true },
        { name: "written_date", label: "Written Date", type: "date" },
      ]}
    />
  );
}
