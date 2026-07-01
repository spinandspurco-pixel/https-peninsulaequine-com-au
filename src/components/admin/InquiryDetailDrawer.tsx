import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import {
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  Paperclip,
  ExternalLink,
  User,
  Briefcase,
  Tag,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { INQUIRY_STATUSES, statusLabel, type InquiryStatus } from "@/lib/inquiryStatus";

interface FullInquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  preferred_contact: string | null;
  services: string[] | null;
  preferred_service: string | null;
  horse_name: string | null;
  horse_breed: string | null;
  horse_age: string | null;
  experience_level: string | null;
  project_vision: string | null;
  project_details: string | null;
  budget_range: string | null;
  preferred_start: string | null;
  attachment_urls: string[] | null;
  attachments: AttachmentMeta[] | null;
  lead_tier: string | null;
  lead_tags: string[] | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface AttachmentMeta {
  path: string;
  name?: string | null;
  size?: number | null;
  mime?: string | null;
  uploaded_at?: string | null;
}

interface Attachment {
  raw: string;
  name: string;
  size: number | null;
  mime: string | null;
  uploaded_at: string | null;
  url: string | null;
}

interface NoteRow {
  id: string;
  body: string;
  author_email: string | null;
  author_id: string;
  created_at: string;
}

interface ActivityRow {
  id: string;
  event_type: string;
  actor_email: string | null;
  from_value: string | null;
  to_value: string | null;
  detail: string | null;
  created_at: string;
}

interface Props {
  inquiryId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged?: () => void;
}

export function InquiryDetailDrawer({ inquiryId, open, onOpenChange, onChanged }: Props) {
  const { user } = useAuth();
  const [inquiry, setInquiry] = useState<FullInquiry | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [noteBody, setNoteBody] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  const loadAll = useCallback(async () => {
    if (!inquiryId) return;
    setLoading(true);
    const [{ data: inq, error: inqErr }, { data: noteRows }, { data: actRows }] = await Promise.all([
      supabase
        .from("inquiries")
        .select(
          "id,name,email,phone,preferred_contact,services,preferred_service,horse_name,horse_breed,horse_age,experience_level,project_vision,project_details,budget_range,preferred_start,attachment_urls,lead_tier,lead_tags,status,created_at,updated_at"
        )
        .eq("id", inquiryId)
        .maybeSingle(),
      supabase
        .from("inquiry_notes")
        .select("id,body,author_email,author_id,created_at")
        .eq("inquiry_id", inquiryId)
        .order("created_at", { ascending: false }),
      supabase
        .from("inquiry_activity")
        .select("id,event_type,actor_email,from_value,to_value,detail,created_at")
        .eq("inquiry_id", inquiryId)
        .order("created_at", { ascending: false }),
    ]);
    setLoading(false);
    if (inqErr || !inq) {
      toast.error("Couldn't load inquiry.");
      return;
    }
    setInquiry(inq as FullInquiry);
    setNotes((noteRows ?? []) as NoteRow[]);
    setActivity((actRows ?? []) as ActivityRow[]);

    const urls = (inq.attachment_urls ?? []) as string[];
    if (urls.length === 0) {
      setAttachments([]);
      return;
    }
    const resolved = await Promise.all(
      urls.map(async (raw): Promise<Attachment> => {
        const name = raw.split("/").pop() ?? raw;
        if (/^https?:\/\//i.test(raw)) return { raw, name, url: raw };
        const path = raw.replace(/^inquiry-attachments\//, "");
        const { data: signed } = await supabase.storage
          .from("inquiry-attachments")
          .createSignedUrl(path, 60 * 60);
        return { raw, name, url: signed?.signedUrl ?? null };
      })
    );
    setAttachments(resolved);
  }, [inquiryId]);

  useEffect(() => {
    if (!open || !inquiryId) return;
    setInquiry(null);
    setAttachments([]);
    setNotes([]);
    setActivity([]);
    setNoteBody("");
    loadAll();
  }, [open, inquiryId, loadAll]);

  const changeStatus = async (next: string) => {
    if (!inquiry || next === inquiry.status) return;
    setSavingStatus(true);
    const { error } = await supabase
      .from("inquiries")
      .update({ status: next, updated_at: new Date().toISOString() })
      .eq("id", inquiry.id);
    setSavingStatus(false);
    if (error) {
      toast.error("Couldn't update status.");
      return;
    }
    toast.success(`Status → ${statusLabel(next as InquiryStatus)}`);
    await loadAll();
    onChanged?.();
  };

  const addNote = async () => {
    const body = noteBody.trim();
    if (!body || !inquiry || !user) return;
    setSavingNote(true);
    const { error } = await supabase.from("inquiry_notes").insert({
      inquiry_id: inquiry.id,
      author_id: user.id,
      author_email: user.email ?? null,
      body,
    });
    setSavingNote(false);
    if (error) {
      toast.error("Couldn't save note.");
      return;
    }
    setNoteBody("");
    await loadAll();
    onChanged?.();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl overflow-y-auto bg-background border-l border-border/30 p-0"
      >
        <div className="absolute inset-0 engineering-grid pointer-events-none opacity-30" />

        <div className="relative p-10">
          <SheetHeader className="space-y-6 mb-10">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-[0.35em] text-accent/70">
                Inquiry · Detail
              </span>
              {loading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground/40" />}
            </div>

            {inquiry ? (
              <>
                <SheetTitle className="font-serif text-3xl font-light tracking-wide text-foreground/95 leading-tight">
                  {inquiry.name}
                </SheetTitle>
                <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/40">
                  <span>{format(new Date(inquiry.created_at), "d MMM yyyy")}</span>
                  <span className="w-4 h-px bg-muted-foreground/20" />
                  <span>{format(new Date(inquiry.created_at), "HH:mm")}</span>
                </div>
              </>
            ) : (
              <SheetTitle className="font-serif text-2xl font-light text-foreground/40">
                Loading…
              </SheetTitle>
            )}
          </SheetHeader>

          {inquiry && (
            <div className="space-y-10">
              {/* Status control */}
              <Section label="Status" index="00">
                <div className="flex items-center gap-4">
                  <select
                    value={inquiry.status}
                    onChange={(e) => changeStatus(e.target.value)}
                    disabled={savingStatus}
                    className="bg-transparent border-b border-accent/30 px-2 py-1 text-foreground/85 font-mono text-[11px] uppercase tracking-[0.25em] focus:outline-none focus:border-accent disabled:opacity-50"
                  >
                    {INQUIRY_STATUSES.map((s) => (
                      <option key={s} value={s} className="bg-background text-foreground">
                        {statusLabel(s)}
                      </option>
                    ))}
                  </select>
                  {savingStatus && (
                    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground/40" />
                  )}
                </div>
              </Section>

              {/* Contact */}
              <Section label="Contact" index="01">
                <SpecRow icon={Mail} label="Email">
                  <a
                    href={`mailto:${inquiry.email}`}
                    className="text-foreground/80 hover:text-accent/80 transition-colors"
                  >
                    {inquiry.email}
                  </a>
                </SpecRow>
                {inquiry.phone && (
                  <SpecRow icon={Phone} label="Phone">
                    <a
                      href={`tel:${inquiry.phone}`}
                      className="text-foreground/80 hover:text-accent/80 transition-colors"
                    >
                      {inquiry.phone}
                    </a>
                  </SpecRow>
                )}
                {inquiry.preferred_contact && (
                  <SpecRow icon={MessageSquare} label="Preferred">
                    <span className="text-foreground/70">{inquiry.preferred_contact}</span>
                  </SpecRow>
                )}
              </Section>

              {/* Project */}
              <Section label="Project" index="02">
                {inquiry.preferred_start && (
                  <SpecRow icon={Calendar} label="Start">
                    <span className="text-foreground/70">{inquiry.preferred_start}</span>
                  </SpecRow>
                )}
                {inquiry.budget_range && (
                  <SpecRow icon={Briefcase} label="Budget">
                    <span className="text-foreground/70">{inquiry.budget_range}</span>
                  </SpecRow>
                )}
                {inquiry.services && inquiry.services.length > 0 && (
                  <SpecRow icon={Tag} label="Services">
                    <div className="flex flex-wrap gap-1.5">
                      {inquiry.services.map((s) => (
                        <span
                          key={s}
                          className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/60 px-2 py-0.5 border border-border/30"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </SpecRow>
                )}
              </Section>

              {(inquiry.project_vision || inquiry.project_details) && (
                <Section label="Vision" index="03">
                  {inquiry.project_vision && (
                    <div className="pl-1">
                      <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/40 mb-3">
                        Project vision
                      </p>
                      <p className="text-[13px] leading-relaxed font-light text-foreground/80 whitespace-pre-wrap">
                        {inquiry.project_vision}
                      </p>
                    </div>
                  )}
                  {inquiry.project_details && (
                    <div className="pl-1 pt-2">
                      <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/40 mb-3">
                        Additional details
                      </p>
                      <p className="text-[13px] leading-relaxed font-light text-foreground/70 whitespace-pre-wrap">
                        {inquiry.project_details}
                      </p>
                    </div>
                  )}
                </Section>
              )}

              {(inquiry.horse_name || inquiry.horse_breed || inquiry.experience_level) && (
                <Section label="Equine" index="04">
                  {inquiry.horse_name && (
                    <SpecRow icon={User} label="Horse">
                      <span className="text-foreground/70">{inquiry.horse_name}</span>
                    </SpecRow>
                  )}
                  {inquiry.horse_breed && (
                    <SpecRow icon={Tag} label="Breed">
                      <span className="text-foreground/70">
                        {inquiry.horse_breed}
                        {inquiry.horse_age ? ` · ${inquiry.horse_age}` : ""}
                      </span>
                    </SpecRow>
                  )}
                  {inquiry.experience_level && (
                    <SpecRow icon={User} label="Experience">
                      <span className="text-foreground/70">{inquiry.experience_level}</span>
                    </SpecRow>
                  )}
                </Section>
              )}

              {/* Attachments */}
              <Section label="Files" index="05">
                {!inquiry.attachment_urls || inquiry.attachment_urls.length === 0 ? (
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground/30 pl-1">
                    No files attached
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {attachments.map((att) => (
                      <li key={att.raw}>
                        {att.url ? (
                          <a
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-3 py-2 border-t border-border/[0.08] hover:border-accent/40 transition-colors"
                          >
                            <Paperclip className="h-3 w-3 text-muted-foreground/40 group-hover:text-accent/70 transition-colors" />
                            <span className="flex-1 text-[12px] font-light text-foreground/70 group-hover:text-foreground/95 transition-colors truncate">
                              {att.name}
                            </span>
                            <ExternalLink className="h-3 w-3 text-muted-foreground/30 group-hover:text-accent/70 transition-colors" />
                          </a>
                        ) : (
                          <div className="flex items-center gap-3 py-2 border-t border-border/[0.08]">
                            <Paperclip className="h-3 w-3 text-muted-foreground/30" />
                            <span className="flex-1 text-[12px] font-light text-muted-foreground/40 truncate">
                              {att.name}
                            </span>
                            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/30">
                              Unavailable
                            </span>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              {/* Internal Notes */}
              <Section label="Internal Notes" index="06">
                <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/35 mb-2">
                  Staff-only · never visible to the client
                </p>
                <div className="space-y-3">
                  <textarea
                    value={noteBody}
                    onChange={(e) => setNoteBody(e.target.value)}
                    placeholder="Add a note for the team…"
                    rows={3}
                    className="w-full bg-transparent border border-border/30 px-3 py-2 text-[13px] font-light text-foreground/85 placeholder:text-muted-foreground/30 focus:outline-none focus:border-accent/60 resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={addNote}
                      disabled={!noteBody.trim() || savingNote}
                      className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent/80 hover:text-accent disabled:text-muted-foreground/25 transition-colors"
                    >
                      {savingNote ? "Saving…" : "Add note"}
                    </button>
                  </div>
                </div>
                <ul className="mt-6 space-y-5">
                  {notes.length === 0 && (
                    <li className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground/30">
                      No internal notes yet
                    </li>
                  )}
                  {notes.map((n) => (
                    <li key={n.id} className="border-t border-border/[0.08] pt-3">
                      <div className="flex items-baseline justify-between mb-1.5">
                        <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-foreground/55">
                          {n.author_email ?? "staff"}
                        </span>
                        <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground/40">
                          {format(new Date(n.created_at), "d MMM yyyy · HH:mm")}
                        </span>
                      </div>
                      <p className="text-[13px] leading-relaxed font-light text-foreground/80 whitespace-pre-wrap">
                        {n.body}
                      </p>
                    </li>
                  ))}
                </ul>
              </Section>

              {/* Activity timeline */}
              <Section label="Activity" index="07">
                {activity.length === 0 ? (
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground/30">
                    No activity recorded
                  </p>
                ) : (
                  <ol className="space-y-3">
                    {activity.map((a) => (
                      <li
                        key={a.id}
                        className="grid grid-cols-[140px_1fr] gap-3 border-t border-border/[0.08] pt-3"
                      >
                        <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/45">
                          {format(new Date(a.created_at), "d MMM · HH:mm")}
                        </span>
                        <div className="text-[12px] font-light text-foreground/75">
                          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent/75 mr-2">
                            {a.event_type.replace("_", " ")}
                          </span>
                          {a.event_type === "status_changed" && (
                            <span>
                              {statusLabel((a.from_value ?? "") as InquiryStatus)} →{" "}
                              {statusLabel((a.to_value ?? "") as InquiryStatus)}
                            </span>
                          )}
                          {a.event_type === "note_added" && a.detail && (
                            <span className="text-foreground/55">"{a.detail}"</span>
                          )}
                          {a.event_type === "created" && (
                            <span className="text-foreground/55">Inquiry submitted</span>
                          )}
                          {a.actor_email && (
                            <span className="ml-2 text-muted-foreground/45">· {a.actor_email}</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </Section>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Section({
  label,
  index,
  children,
}: {
  label: string;
  index: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative">
      <div className="flex items-baseline gap-3 mb-5">
        <span className="font-mono text-[9px] tracking-[0.25em] text-accent/60">{index}</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.35em] text-foreground/70">
          {label}
        </span>
        <span className="flex-1 h-px bg-gradient-to-r from-border/40 to-transparent" />
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function SpecRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[auto_90px_1fr] items-start gap-3 text-[12px]">
      <Icon className="h-3 w-3 mt-1 text-muted-foreground/40" />
      <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/40 pt-1">
        {label}
      </span>
      <div className="font-light">{children}</div>
    </div>
  );
}
