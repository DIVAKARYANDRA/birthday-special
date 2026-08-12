/** Unlock Condition management screen — Prompt 14, Part 6. The
 * admin-preview /evaluate endpoint (app.domains.unlocks.router) and the
 * composite AND/OR sub-condition builder (docs/04-backend-architecture.md,
 * Section 8) are not yet surfaced in this foundation screen's UI — both
 * are structurally supported by the backend already (Prompt 13) and are
 * candidates for a future polish pass, per Part 6's "structure over
 * polish" scope. */
import { unlocksApi } from "@/api/unlocksApi";
import type { UnlockConditionCreate, UnlockConditionRead } from "@/api/unlocksApi";
import { ResourceListPage } from "@/components/admin/ResourceListPage";

export default function UnlocksListPage() {
  return (
    <ResourceListPage<UnlockConditionRead, UnlockConditionCreate>
      title="Unlock Conditions"
      queryKey="unlock-conditions"
      api={unlocksApi}
      columns={[
        { key: "name", label: "Name" },
        { key: "condition_type", label: "Type" },
        { key: "target_type", label: "Target" },
        { key: "is_active", label: "Active" },
      ]}
      removeLabel="Deactivate"
      createFields={[
        { name: "name", label: "Name", required: true },
        { name: "condition_type", label: "Condition Type (immediate/time_based/password/achievement_earned/composite)", required: true },
        { name: "target_type", label: "Target Type (memory/letter/secret_message/timeline)" },
        { name: "target_id", label: "Target ID" },
      ]}
    />
  );
}
