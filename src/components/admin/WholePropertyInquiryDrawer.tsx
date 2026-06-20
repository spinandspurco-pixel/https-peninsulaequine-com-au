import { useEffect, useState } from "react";
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
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

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
  lead_tier: string | null;
  lead_tags: string[] | null;
  status: string;
  created_at: string;
}

interface Attachment {
  raw: string;
  name: string;
  url: string | null;
}

interface Props {
  inquiryId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WholePropertyInquiryDrawer({ inquiryId, open, onOpenChange }: Props) {
  const [inquiry, setInquiry] = useState<FullInquiry | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !inquiryId) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setInquiry(null);
      setAttachments([]);
      const { data, error } = await supabase
        .from("inquiries")
        .select(
          "id,name,email,phone,preferred_contact,services,preferred_service,horse_name,horse_breed,horse_age,experience_level,project_vision,project_details,budget_range,preferred_start,attachment_urls,lead_tier,lead_tags,status,created_at",
        )
        .eq("id", inquiryId)
        .maybeSingle();

      if (cancelled) return;
      setLoading(false);

      if (error || !data) {
        toast.error("Couldn't load enquiry.");
        return;
      }
      setInquiry(data as FullInquiry);

      const urls = (data.attachment_urls ?? []) as string[];
      if (urls.length === 0) return;

      const resolved = await Promise.all(
        urls.map(async (raw): Promise<Attachment> => {
          const name = raw.split("/").pop() ?? raw;
          if (/^https?:\/\//i.test(raw)) {
            return { raw, name, url: raw };
          }
          const path = raw.replace(/^inquiry-attachments\//, "");
          const { data: signed } = await supabase.storage
            .from("inquiry-attachments")
            .createSignedUrl(path, 60 * 60);
          return { raw, name, url: signed?.signedUrl ?? null };
        }),
      );
      if (!cancelled) setAttachments(resolved);
    })();

    return () => {
      cancelled = true;
    };
  }, [inquiryId, open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl overflow-y-auto bg-background border-l border-border/30 p-0"
      >
        {/* Architectural grid texture */}
        <div className="absolute inset-0 engineering-grid pointer-events-none opacity-30" />

        <div className="relative p-10">
          <SheetHeader className="space-y-6 mb-10">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-[0.35em] text-accent/70">
                Enquiry · Whole-Property Planning
              </span>
            </div>

            {loading && !inquiry ? (
              <SheetTitle className="font-serif text-2xl font-light text-foreground/40">
                Loading…
              </SheetTitle>
            ) : inquiry ? (
              <>
                <SheetTitle className="font-serif text-3xl font-light tracking-wide text-foreground/95 leading-tight">
                  {inquiry.name}
                </SheetTitle>
                <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/40">
                  <span>{format(new Date(inquiry.created_at), "d MMM yyyy")}</span>
                  <span className="w-4 h-px bg-muted-foreground/20" />
                  <span>{format(new Date(inquiry.created_at), "HH:mm")}</span>
                  <span className="w-4 h-px bg-muted-foreground/20" />
                  <span className={inquiry.status === "new" ? "text-accent/80" : ""}>
                    {inquiry.status}
                  </span>
                </div>
              </>
            ) : null}
          </SheetHeader>

          {inquiry && (
            <div className="space-y-10">
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

              {/* Vision */}
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

              {/* Horse */}
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
                {(!inquiry.attachment_urls || inquiry.attachment_urls.length === 0) ? (
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
                    {attachments.length === 0 && (
                      <li className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground/30">
                        Resolving links…
                      </li>
                    )}
                  </ul>
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
