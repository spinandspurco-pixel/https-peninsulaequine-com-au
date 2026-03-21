/**
 * CRM Pipeline stages — the backbone of the lead lifecycle.
 */

export const PIPELINE_STAGES = [
  { key: "new", label: "New Enquiry", shortLabel: "New" },
  { key: "qualified", label: "Qualified Lead", shortLabel: "Qualified" },
  { key: "scope_review", label: "Site / Scope Review", shortLabel: "Scope" },
  { key: "quote_in_progress", label: "Quote in Progress", shortLabel: "Quoting" },
  { key: "quote_sent", label: "Quote Sent", shortLabel: "Sent" },
  { key: "follow_up", label: "Follow-Up Due", shortLabel: "Follow-Up" },
  { key: "won", label: "Won / Accepted", shortLabel: "Won" },
  { key: "live_project", label: "Live Project", shortLabel: "Live" },
  { key: "closed", label: "Closed / Lost", shortLabel: "Closed" },
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number]["key"];

export const TEAM_MEMBERS = [
  { id: "ciro", name: "Ciro" },
  { id: "jordynn", name: "Jordynn" },
  { id: "sander", name: "Sander" },
  { id: "glenn", name: "Glenn" },
  { id: "admin", name: "Admin" },
] as const;

export const PROJECT_TYPES = [
  "Arena Construction",
  "Round Pen",
  "Fencing",
  "Full Facility",
  "Infrastructure",
  "Renovation",
  "GroundLock Install",
  "Other",
] as const;

export interface CRMRecord {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  email: string;
  phone: string | null;
  services: string[];
  preferred_service: string | null;
  project_details: string | null;
  project_vision: string | null;
  budget_range: string | null;
  preferred_start: string | null;
  preferred_contact: string | null;
  horse_name: string | null;
  horse_breed: string | null;
  horse_age: string | null;
  experience_level: string | null;
  status: string;
  notes: string | null;
  lead_tier: string | null;
  lead_tags: string[] | null;
  attachment_urls: string[] | null;
  deal_value: number | null;
  probability: number | null;
  expected_value: number | null;
  deal_stage: string | null;
  last_contact_at: string | null;
  next_follow_up_at: string | null;
  follow_up_stage: string;
  follow_up_status: string;
}
