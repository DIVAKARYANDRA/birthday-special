/**
 * Generic Admin Content API resource client factory.
 *
 * Every one of Part 4's 7 admin routers (media, memories, timeline,
 * letters, quotes, achievements, unlocks) follows the identical
 * list/get/create/update shape (Prompt 14's routers, mirroring
 * docs/02-design-system.md, Section 15's "one repeated pattern"
 * philosophy already applied on the backend — this is that same
 * philosophy applied to the frontend API layer, avoiding 7
 * near-identical hand-written modules).
 *
 * The "remove" action's endpoint NAME varies by domain: content
 * types with a Draft/Scheduled/Published/Archived lifecycle
 * (media, memories, timeline, letters, quotes) expose POST
 * .../{id}/archive; achievements and unlocks — which use a simpler
 * is_active boolean instead of that four-state lifecycle (see
 * app.domains.achievements.models / app.domains.unlocks.models) —
 * expose POST .../{id}/deactivate instead. `removeAction` lets each
 * domain's API module specify which one its backend router actually
 * exposes, defaulting to "archive" since that's the majority case.
 *
 * A domain whose router deviates further from this shape (e.g. `letters`'
 * extra `/secret-messages` sub-resource) still uses this factory for its
 * primary resource and adds its own extra functions alongside it (see
 * src/api/lettersApi.ts).
 */
import { apiRequest } from "./client";

export function createResourceApi<TRead, TCreate, TUpdate>(
  basePath: string,
  removeAction: "archive" | "deactivate" = "archive",
) {
  return {
    list: (query?: Record<string, string | number | boolean | undefined>) =>
      apiRequest<TRead[]>(basePath, { query }),

    get: (id: string) => apiRequest<TRead>(`${basePath}/${id}`),

    create: (payload: TCreate) => apiRequest<TRead>(basePath, { method: "POST", body: payload }),

    update: (id: string, payload: TUpdate) =>
      apiRequest<TRead>(`${basePath}/${id}`, { method: "PATCH", body: payload }),

    archive: (id: string) => apiRequest<TRead>(`${basePath}/${id}/${removeAction}`, { method: "POST" }),
  };
}
