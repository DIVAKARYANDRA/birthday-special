/** Achievement admin API — wraps app.domains.achievements.router (Prompt 14). */
import { createResourceApi } from "./resource";

export interface AchievementDefinitionRead {
  id: string;
  name: string;
  description: string | null;
  target_value: number;
  reward_tier: string;
  is_active: boolean;
}

export interface AchievementDefinitionCreate {
  name: string;
  description?: string;
  target_value?: number;
  reward_tier?: string;
}

export interface AchievementDefinitionUpdate {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export const achievementsApi = createResourceApi<
  AchievementDefinitionRead,
  AchievementDefinitionCreate,
  AchievementDefinitionUpdate
>("/api/v1/admin/achievements", "deactivate");
