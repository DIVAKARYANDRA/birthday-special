/**
 * Generic admin resource screen — list table + minimal create form +
 * archive action.
 *
 * Per Prompt 14, Part 6: "Focus on structure and data flow. Polish can
 * come later." Rather than hand-writing 7 near-identical
 * list/table/form screens (one per Part 6 management screen), this
 * single component is configured per-domain (see each domain's screen
 * under src/modules/) — the same avoid-duplication reasoning already
 * applied on the backend via src/api/resource.ts's factory, extended
 * here to the presentation layer. A future polish pass (Design System
 * integration, per docs/02-design-system.md) will likely replace this
 * generic table with domain-specific, richer UI per screen — this
 * component is explicitly a foundation, not the final admin UX.
 *
 * Uses React Query (per docs/05-frontend-architecture.md, Section 8) for
 * data fetching/caching/invalidation — never a raw useEffect+fetch.
 */
import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/api/client";

export interface FieldConfig {
  name: string;
  label: string;
  type?: "text" | "textarea" | "date";
  required?: boolean;
}

export interface ColumnConfig<T> {
  key: keyof T;
  label: string;
}

interface ResourceApi<TRead, TCreate> {
  list: (query?: Record<string, string | number | boolean | undefined>) => Promise<TRead[]>;
  create: (payload: TCreate) => Promise<TRead>;
  archive: (id: string) => Promise<TRead>;
}

interface ResourceListPageProps<TRead extends { id: string; status?: string }, TCreate> {
  title: string;
  queryKey: string;
  api: ResourceApi<TRead, TCreate>;
  columns: ColumnConfig<TRead>[];
  createFields: FieldConfig[];
  /** Label for the row-removal action. Content-lifecycle domains
   * (media, memories, timeline, letters, quotes) call this "Archive";
   * is_active-toggle domains (achievements, unlocks — see
   * src/api/resource.ts's removeAction parameter) should pass
   * "Deactivate" instead, matching what the underlying API call
   * actually does. Defaults to "Archive". */
  removeLabel?: string;
}

export function ResourceListPage<TRead extends { id: string; status?: string }, TCreate extends Record<string, unknown>>({
  title,
  queryKey,
  api,
  columns,
  createFields,
  removeLabel = "Archive",
}: ResourceListPageProps<TRead, TCreate>) {
  const queryClient = useQueryClient();
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const listQuery = useQuery({
    queryKey: [queryKey],
    queryFn: () => api.list(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: TCreate) => api.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      setFormValues({});
      setShowForm(false);
      setFormError(null);
    },
    onError: (err) => setFormError(err instanceof ApiError ? err.message : "Failed to create."),
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => api.archive(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKey] }),
  });

  function handleCreateSubmit(event: FormEvent) {
    event.preventDefault();
    createMutation.mutate(formValues as unknown as TCreate);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "1.5rem" }}>{title}</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          style={{ padding: "0.5rem 1rem", borderRadius: "0.4rem", border: "none", background: "#4b2e83", color: "#fff", cursor: "pointer" }}
        >
          {showForm ? "Cancel" : `New ${title.replace(/s$/, "")}`}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateSubmit} style={{ background: "#fff", padding: "1.5rem", borderRadius: "0.75rem", marginBottom: "1.5rem", border: "1px solid #e5e0ee" }}>
          {createFields.map((field) => (
            <label key={field.name} style={{ display: "block", marginBottom: "0.75rem" }}>
              <span style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.25rem" }}>{field.label}</span>
              {field.type === "textarea" ? (
                <textarea
                  required={field.required}
                  value={formValues[field.name] ?? ""}
                  onChange={(e) => setFormValues((v) => ({ ...v, [field.name]: e.target.value }))}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "0.4rem", border: "1px solid #ccc", minHeight: 80 }}
                />
              ) : (
                <input
                  type={field.type === "date" ? "date" : "text"}
                  required={field.required}
                  value={formValues[field.name] ?? ""}
                  onChange={(e) => setFormValues((v) => ({ ...v, [field.name]: e.target.value }))}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "0.4rem", border: "1px solid #ccc" }}
                />
              )}
            </label>
          ))}
          {formError && <p style={{ color: "#b3261e", fontSize: "0.85rem" }}>{formError}</p>}
          <button
            type="submit"
            disabled={createMutation.isPending}
            style={{ padding: "0.5rem 1rem", borderRadius: "0.4rem", border: "none", background: "#4b2e83", color: "#fff", cursor: "pointer" }}
          >
            {createMutation.isPending ? "Saving..." : "Save"}
          </button>
        </form>
      )}

      {listQuery.isLoading && <p>Loading...</p>}
      {listQuery.isError && (
        <p style={{ color: "#b3261e" }}>
          {listQuery.error instanceof ApiError ? listQuery.error.message : "Failed to load."}
        </p>
      )}

      {listQuery.data && (
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "0.75rem", overflow: "hidden" }}>
          <thead>
            <tr style={{ textAlign: "left", background: "#f0edf5" }}>
              {columns.map((col) => (
                <th key={String(col.key)} style={{ padding: "0.6rem 1rem", fontSize: "0.85rem" }}>
                  {col.label}
                </th>
              ))}
              <th style={{ padding: "0.6rem 1rem" }} />
            </tr>
          </thead>
          <tbody>
            {listQuery.data.map((row) => (
              <tr key={row.id} style={{ borderTop: "1px solid #f0edf5" }}>
                {columns.map((col) => (
                  <td key={String(col.key)} style={{ padding: "0.6rem 1rem", fontSize: "0.9rem" }}>
                    {String(row[col.key] ?? "")}
                  </td>
                ))}
                <td style={{ padding: "0.6rem 1rem", textAlign: "right" }}>
                  {row.status !== "archived" && (
                    <button
                      onClick={() => archiveMutation.mutate(row.id)}
                      style={{ background: "none", border: "1px solid #ccc", borderRadius: "0.4rem", padding: "0.3rem 0.6rem", cursor: "pointer", fontSize: "0.8rem" }}
                    >
                      {removeLabel}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
