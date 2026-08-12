/** UnlockCondition admin API — wraps app.domains.unlocks.router (Prompt 14). */
import { createResourceApi } from "./resource";

export interface UnlockConditionRead {
  id: string;
  name: string;
  condition_type: string;
  target_type: string | null;
  target_id: string | null;
  is_active: boolean;
  display_order: number;
}

export interface UnlockConditionCreate {
  name: string;
  condition_type: string;
  target_type?: string;
  target_id?: string;
  trigger_config?: Record<string, unknown>;
}

export interface UnlockConditionUpdate {
  name?: string;
  is_active?: boolean;
}

export const unlocksApi = createResourceApi<UnlockConditionRead, UnlockConditionCreate, UnlockConditionUpdate>(
  "/api/v1/admin/unlocks",
  "deactivate",
);
