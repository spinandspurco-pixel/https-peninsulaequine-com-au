import { supabase } from "@/integrations/supabase/client";
import { addBusinessDays, setHours, setMinutes, isWeekend, addDays, getHours } from "date-fns";

/* ------------------------------------------------------------------ */
/*  Business-hour send window logic                                    */
/* ------------------------------------------------------------------ */

const SEND_START_HOUR = 9;
const SEND_START_MIN = 30;
const SEND_END_HOUR = 16;
const SEND_END_MIN = 30;

/**
 * Adjust a date to fall within the next valid business send window.
 * Mon–Fri, 9:30am–4:30pm.
 */
function toNextSendWindow(date: Date): Date {
  let d = new Date(date);

  // Move past weekends
  while (isWeekend(d)) {
    d = addDays(d, 1);
    d = setHours(setMinutes(d, SEND_START_MIN), SEND_START_HOUR);
  }

  const hour = getHours(d);
  // If before send window, move to start
  if (hour < SEND_START_HOUR || (hour === SEND_START_HOUR && d.getMinutes() < SEND_START_MIN)) {
    d = setHours(setMinutes(d, SEND_START_MIN), SEND_START_HOUR);
  }
  // If after send window, move to next business day
  if (hour > SEND_END_HOUR || (hour === SEND_END_HOUR && d.getMinutes() > SEND_END_MIN)) {
    d = addDays(d, 1);
    d = setHours(setMinutes(d, SEND_START_MIN), SEND_START_HOUR);
    while (isWeekend(d)) {
      d = addDays(d, 1);
    }
  }

  return d;
}

/* ------------------------------------------------------------------ */
/*  Template definitions                                               */
/* ------------------------------------------------------------------ */

interface ScheduleStep {
  step: number;
  businessDays: number;
  channel: "email" | "sms";
  template: string;
}

const QUOTE_SEQUENCE: ScheduleStep[] = [
  { step: 1, businessDays: 3, channel: "email", template: "soft_check_in" },
  { step: 2, businessDays: 7, channel: "email", template: "value_reframe" },
  { step: 3, businessDays: 10, channel: "sms", template: "decision_prompt" },
  { step: 4, businessDays: 14, channel: "email", template: "close_loop" },
];

const LEAD_SEQUENCE: ScheduleStep[] = [
  { step: 1, businessDays: 2, channel: "email", template: "scope_check_in" },
  { step: 2, businessDays: 5, channel: "email", template: "invitation_to_proceed" },
];

/* ------------------------------------------------------------------ */
/*  Fetch templates for message body                                   */
/* ------------------------------------------------------------------ */

async function fetchTemplate(templateKey: string): Promise<{ subject: string | null; body: string }> {
  const { data } = await supabase
    .from("message_templates")
    .select("subject, body")
    .eq("template_key", templateKey)
    .eq("active", true)
    .single();
  return data || { subject: null, body: "" };
}

function interpolate(text: string, vars: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || "");
}

/* ------------------------------------------------------------------ */
/*  Schedule a quote follow-up sequence                                */
/* ------------------------------------------------------------------ */

export async function scheduleQuoteFollowUps(opts: {
  quoteId: string;
  clientName: string;
  clientEmail: string | null;
  clientPhone?: string | null;
  projectRef?: string | null;
  sentDate?: Date;
}) {
  const baseDate = opts.sentDate || new Date();
  const hasMobile = !!opts.clientPhone;

  const rows = [];
  for (const step of QUOTE_SEQUENCE) {
    const tpl = await fetchTemplate(step.template);
    // If no mobile, force email
    const channel = step.channel === "sms" && !hasMobile ? "email" : step.channel;
    const scheduledAt = toNextSendWindow(addBusinessDays(baseDate, step.businessDays));
    const vars = {
      client_name: opts.clientName,
      project_ref: opts.projectRef || "your project",
    };

    rows.push({
      entity_type: "quote",
      entity_id: opts.quoteId,
      step_number: step.step,
      channel,
      template_type: step.template,
      scheduled_at: scheduledAt.toISOString(),
      original_scheduled_at: scheduledAt.toISOString(),
      status: "scheduled",
      automation_mode: "assisted",
      client_name: opts.clientName,
      client_email: opts.clientEmail,
      client_phone: opts.clientPhone || null,
      subject_line: tpl.subject ? interpolate(tpl.subject, vars) : null,
      message_body: interpolate(tpl.body, vars),
    });
  }

  const { error } = await supabase.from("scheduled_messages").insert(rows);
  if (error) {
    console.error("Failed to schedule quote follow-ups:", error);
    return false;
  }
  return true;
}

/* ------------------------------------------------------------------ */
/*  Schedule a lead follow-up sequence                                 */
/* ------------------------------------------------------------------ */

export async function scheduleLeadFollowUps(opts: {
  inquiryId: string;
  clientName: string;
  clientEmail: string | null;
  clientPhone?: string | null;
  qualifiedDate?: Date;
}) {
  const baseDate = opts.qualifiedDate || new Date();

  const rows = [];
  for (const step of LEAD_SEQUENCE) {
    const tpl = await fetchTemplate(step.template);
    const scheduledAt = toNextSendWindow(addBusinessDays(baseDate, step.businessDays));
    const vars = { client_name: opts.clientName };

    rows.push({
      entity_type: "lead",
      entity_id: opts.inquiryId,
      step_number: step.step,
      channel: step.channel,
      template_type: step.template,
      scheduled_at: scheduledAt.toISOString(),
      original_scheduled_at: scheduledAt.toISOString(),
      status: "scheduled",
      automation_mode: "assisted",
      client_name: opts.clientName,
      client_email: opts.clientEmail,
      client_phone: opts.clientPhone || null,
      subject_line: tpl.subject ? interpolate(tpl.subject, vars) : null,
      message_body: interpolate(tpl.body, vars),
    });
  }

  const { error } = await supabase.from("scheduled_messages").insert(rows);
  if (error) {
    console.error("Failed to schedule lead follow-ups:", error);
    return false;
  }
  return true;
}

/* ------------------------------------------------------------------ */
/*  Cancel remaining messages for an entity                            */
/* ------------------------------------------------------------------ */

export async function cancelScheduledMessages(entityType: string, entityId: string) {
  const { error } = await supabase
    .from("scheduled_messages")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .in("status", ["scheduled", "due_soon", "ready", "overdue"]);
  if (error) console.error("Failed to cancel messages:", error);
}

/* ------------------------------------------------------------------ */
/*  Pause remaining messages for an entity                             */
/* ------------------------------------------------------------------ */

export async function pauseScheduledMessages(entityType: string, entityId: string) {
  const { error } = await supabase
    .from("scheduled_messages")
    .update({ status: "paused", paused_at: new Date().toISOString() })
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .in("status", ["scheduled", "due_soon", "ready", "overdue"]);
  if (error) console.error("Failed to pause messages:", error);
}

/* ------------------------------------------------------------------ */
/*  Switch from lead to quote sequence                                 */
/* ------------------------------------------------------------------ */

export async function switchToQuoteSequence(opts: {
  inquiryId: string;
  quoteId: string;
  clientName: string;
  clientEmail: string | null;
  clientPhone?: string | null;
  projectRef?: string | null;
}) {
  // Cancel lead nurture
  await cancelScheduledMessages("lead", opts.inquiryId);
  // Schedule quote follow-ups
  await scheduleQuoteFollowUps({
    quoteId: opts.quoteId,
    clientName: opts.clientName,
    clientEmail: opts.clientEmail,
    clientPhone: opts.clientPhone,
    projectRef: opts.projectRef,
  });
}
