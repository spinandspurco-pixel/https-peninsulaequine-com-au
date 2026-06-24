import { z } from "zod";
import type { Tables } from "@/integrations/supabase/types";
import type { CmsTabConfig } from "./types";

type ManagedService = Tables<"managed_services">;
type ManagedEvent = Tables<"managed_events">;
type ManagedTestimonial = Tables<"managed_testimonials">;
type CmsGalleryItem = Tables<"cms_gallery_items">;

const nullable = (v: unknown) => {
  if (v === null || v === undefined) return null;
  if (typeof v === "string") {
    const t = v.trim();
    return t === "" ? null : t;
  }
  return v;
};

/* ── Services ─────────────────────────────────────────────── */

export const servicesConfig: CmsTabConfig<ManagedService, Record<string, unknown>> = {
  table: "managed_services",
  entityLabel: "Service",
  entityPlural: "Services",
  titleField: "title",
  subtitleField: "short_description",
  activeField: "active",
  sortField: "sort_order",
  listOrder: { column: "sort_order", ascending: true },
  defaults: { features: [], icon: "arena" },
  schema: z.object({
    title: z.string().trim().min(2, "Title is required"),
    slug: z.string().trim().min(2, "Slug is required").regex(/^[a-z0-9-]+$/, "lowercase, numbers, hyphens only"),
  }).passthrough(),
  fields: [
    { key: "title", label: "Title", type: "text", required: true },
    { key: "slug", label: "Slug", type: "text", required: true, placeholder: "arena-construction" },
    { key: "category", label: "Category", type: "text", placeholder: "Arenas, Stables, Groundworks…" },
    { key: "short_description", label: "Short description", type: "text", inList: true },
    { key: "summary", label: "Summary", type: "textarea" },
    { key: "body", label: "Body", type: "textarea" },
    { key: "features", label: "Features", type: "lines", help: "One per line" },
    { key: "starting_price", label: "Starting price", type: "text", placeholder: "From $25,000" },
    { key: "image_url", label: "Image URL", type: "url" },
    { key: "icon", label: "Icon key", type: "text", placeholder: "arena" },
    { key: "cta_label", label: "CTA label", type: "text", placeholder: "Request assessment" },
    { key: "cta_url", label: "CTA URL", type: "url", placeholder: "/contact" },
    { key: "sort_order", label: "Sort order", type: "number" },
  ],
  toPayload: (f) => ({
    title: String(f.title ?? "").trim(),
    slug: String(f.slug ?? "").trim(),
    category: nullable(f.category),
    short_description: nullable(f.short_description),
    description: nullable((f as { description?: string }).description),
    summary: nullable(f.summary),
    body: nullable(f.body),
    features: Array.isArray(f.features) ? f.features : [],
    starting_price: nullable(f.starting_price),
    image_url: nullable(f.image_url),
    icon: nullable(f.icon) ?? "arena",
    cta_label: nullable(f.cta_label),
    cta_url: nullable(f.cta_url),
    sort_order: typeof f.sort_order === "number" ? f.sort_order : 0,
    active: f.active ?? true,
  }),
};

/* ── Events ───────────────────────────────────────────────── */

export const eventsConfig: CmsTabConfig<ManagedEvent, Record<string, unknown>> = {
  table: "managed_events",
  entityLabel: "Event",
  entityPlural: "Events",
  titleField: "title",
  subtitleField: "location",
  activeField: "active",
  sortField: "sort_order",
  listOrder: { column: "event_date", ascending: true },
  defaults: {},
  schema: z.object({
    title: z.string().trim().min(2, "Title is required"),
    event_date: z.string().min(1, "Event date is required"),
  }).passthrough(),
  fields: [
    { key: "title", label: "Title", type: "text", required: true },
    { key: "event_date", label: "Event date", type: "date", required: true, inList: true },
    { key: "location", label: "Location", type: "text" },
    { key: "summary", label: "Summary", type: "textarea" },
    { key: "body", label: "Body", type: "textarea" },
    { key: "description", label: "Short description", type: "text" },
    { key: "capacity", label: "Capacity", type: "number" },
    { key: "price", label: "Price", type: "text", placeholder: "$450 incl. GST" },
    { key: "trainer", label: "Trainer", type: "text" },
    { key: "image_url", label: "Image URL", type: "url" },
    { key: "cta_label", label: "CTA label", type: "text", placeholder: "RSVP" },
    { key: "cta_url", label: "CTA URL", type: "url" },
    { key: "sort_order", label: "Sort order", type: "number" },
  ],
  toPayload: (f) => ({
    title: String(f.title ?? "").trim(),
    event_date: f.event_date,
    location: nullable(f.location),
    summary: nullable(f.summary),
    body: nullable(f.body),
    description: nullable(f.description),
    capacity: typeof f.capacity === "number" ? f.capacity : null,
    price: nullable(f.price),
    trainer: nullable(f.trainer),
    image_url: nullable(f.image_url),
    cta_label: nullable(f.cta_label),
    cta_url: nullable(f.cta_url),
    sort_order: typeof f.sort_order === "number" ? f.sort_order : 0,
    active: f.active ?? true,
  }),
};

/* ── Testimonials ─────────────────────────────────────────── */

export const testimonialsConfig: CmsTabConfig<ManagedTestimonial, Record<string, unknown>> = {
  table: "managed_testimonials",
  entityLabel: "Testimonial",
  entityPlural: "Testimonials",
  titleField: "client_name",
  subtitleField: "quote",
  activeField: "active",
  sortField: "sort_order",
  listOrder: { column: "sort_order", ascending: true },
  defaults: { rating: 5 },
  schema: z.object({
    client_name: z.string().trim().min(2, "Client name is required"),
    quote: z.string().trim().min(8, "Quote is required (8+ chars)"),
  }).passthrough(),
  fields: [
    { key: "client_name", label: "Client name", type: "text", required: true },
    { key: "client_context", label: "Client context", type: "text", placeholder: "Owner · Main Ridge", inList: true },
    { key: "client_role", label: "Legacy role (optional)", type: "text", help: "Kept for back-compat with older display logic." },
    { key: "quote", label: "Quote", type: "textarea", required: true },
    { key: "rating", label: "Rating (1–5)", type: "number" },
    { key: "trainer", label: "Trainer", type: "text" },
    { key: "media_type", label: "Media type", type: "text", placeholder: "image / video" },
    { key: "media_url", label: "Media URL", type: "url" },
    { key: "service_tags", label: "Service tags", type: "lines", help: "One per line" },
    { key: "sort_order", label: "Sort order", type: "number" },
  ],
  toPayload: (f) => ({
    client_name: String(f.client_name ?? "").trim(),
    client_context: nullable(f.client_context),
    client_role: nullable(f.client_role),
    quote: String(f.quote ?? "").trim(),
    rating: typeof f.rating === "number" ? f.rating : 5,
    trainer: nullable(f.trainer),
    media_type: nullable(f.media_type),
    media_url: nullable(f.media_url),
    service_tags: Array.isArray(f.service_tags) ? f.service_tags : [],
    sort_order: typeof f.sort_order === "number" ? f.sort_order : 0,
    active: f.active ?? true,
  }),
};

/* ── Gallery (cms_gallery_items) ──────────────────────────── */

export const galleryConfig: CmsTabConfig<CmsGalleryItem, Record<string, unknown>> = {
  table: "cms_gallery_items",
  entityLabel: "Gallery item",
  entityPlural: "Gallery items",
  titleField: "title",
  subtitleField: "caption",
  activeField: "is_active",
  sortField: "sort_order",
  listOrder: { column: "sort_order", ascending: true },
  defaults: {},
  schema: z.object({
    title: z.string().trim().min(2, "Title is required"),
    image_url: z.string().trim().url("Image URL must be a valid URL"),
  }).passthrough(),
  fields: [
    { key: "title", label: "Title", type: "text", required: true },
    { key: "slug", label: "Slug", type: "text", placeholder: "main-ridge-pavilion" },
    { key: "image_url", label: "Image URL", type: "url", required: true },
    { key: "alt_text", label: "Alt text", type: "text", help: "Accessibility description" },
    { key: "caption", label: "Caption", type: "textarea" },
    { key: "project", label: "Project", type: "text", inList: true },
    { key: "location", label: "Location", type: "text" },
    { key: "category", label: "Category", type: "text", placeholder: "Arenas, Stables, Field notes…", inList: true },
    { key: "sort_order", label: "Sort order", type: "number" },
  ],
  toPayload: (f) => ({
    title: String(f.title ?? "").trim(),
    slug: nullable(f.slug),
    image_url: String(f.image_url ?? "").trim(),
    alt_text: nullable(f.alt_text),
    caption: nullable(f.caption),
    project: nullable(f.project),
    location: nullable(f.location),
    category: nullable(f.category),
    sort_order: typeof f.sort_order === "number" ? f.sort_order : 0,
    is_active: f.is_active ?? true,
  }),
};
