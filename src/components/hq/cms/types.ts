/**
 * Field schema for the unified HQ CMS CRUD tab.
 *
 * Each tab declares a list of fields; CmsCrudTab renders the list view,
 * the create/edit dialog, and validation around them. Storage is delegated
 * to a Supabase table whose row shape is `TRow`.
 */
import { z } from "zod";

export type CmsFieldType =
  | "text"
  | "textarea"
  | "url"
  | "number"
  | "date"
  | "switch"
  | "lines"; // newline-separated -> string[]

export interface CmsField<TRow> {
  key: keyof TRow & string;
  label: string;
  type: CmsFieldType;
  placeholder?: string;
  required?: boolean;
  help?: string;
  /** Hide from list summary; only show in form. Default: true (form only). */
  inForm?: boolean;
  /** Show in the list row summary. */
  inList?: boolean;
}

export interface CmsTabConfig<TRow extends { id: string }, TInsert extends Record<string, unknown>> {
  /** Supabase table name (must match types). */
  table: string;
  /** Human label for the tab and "New X" / "Edit X" headings. */
  entityLabel: string; // e.g. "Service"
  entityPlural: string; // e.g. "Services"
  /** Column used in list display as the headline. */
  titleField: keyof TRow & string;
  /** Column used for secondary line in list display. */
  subtitleField?: keyof TRow & string;
  /** Boolean column used as the active toggle. May be `active` or `is_active`. */
  activeField: keyof TRow & string;
  /** Optional integer column used for ordering. */
  sortField?: keyof TRow & string;
  /** Default sort direction in the list. */
  listOrder?: { column: keyof TRow & string; ascending?: boolean };
  /** Fields rendered in the create/edit form, in order. */
  fields: CmsField<TRow>[];
  /** Defaults applied when creating a new row. */
  defaults: Partial<TInsert>;
  /** Zod schema applied to the form payload before insert/update. */
  schema: z.ZodTypeAny;
  /** Convert form state → insert/update payload (e.g. trim, null empties). */
  toPayload: (form: Partial<TRow>) => Record<string, unknown>;
}
