/** Achievement management screen — Prompt 14, Part 6. Progress
 * visibility (per-visitor) is exposed by the backend
 * (GET /admin/achievements/progress/{visitor_session_id}) but not yet
 * surfaced in this foundation screen — a future polish pass. */
import { achievementsApi } from "@/api/achievementsApi";
import type { AchievementDefinitionCreate, AchievementDefinitionRead } from "@/api/achievementsApi";
import { ResourceListPage } from "@/components/admin/ResourceListPage";

export default function AchievementsListPage() {
  return (
    <ResourceListPage<AchievementDefinitionRead, AchievementDefinitionCreate>
      title="Achievements"
      queryKey="achievements"
      api={achievementsApi}
      columns={[
        { key: "name", label: "Name" },
        { key: "target_value", label: "Target" },
        { key: "reward_tier", label: "Reward Tier" },
        { key: "is_active", label: "Active" },
      ]}
      removeLabel="Deactivate"
      createFields={[
        { name: "name", label: "Name", required: true },
        { name: "description", label: "Description", type: "textarea" },
        { name: "target_value", label: "Target Value" },
        { name: "reward_tier", label: "Reward Tier (standard/milestone/legendary)" },
      ]}
    />
  );
}
