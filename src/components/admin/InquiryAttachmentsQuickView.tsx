import { useCallback, useEffect, useState } from "react";
import { Paperclip, Download, ExternalLink, FileText, Image as ImageIcon, Loader2, Eye, EyeOff } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AttachmentRow {
  id: string;
  filename: string;
  storage_path: string;
  size_bytes: number | null;
  mime_type: string | null;
  created_at: string;
  signedUrl?: string | null;
}

function humanBytes(n: number | null | undefined): string {
  if (!n || n <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

const isImageMime = (mime: string | null | undefined, filename: string) => {
  if (mime?.startsWith("image/")) return true;
  return /\.(png|jpe?g|gif|webp|avif|heic)$/i.test(filename);
};

const isPdfMime = (mime: string | null | undefined, filename: string) => {
  if (mime === "application/pdf") return true;
  return /\.pdf$/i.test(filename);
};

interface Props {
  inquiryId: string;
  count: number;
  inquiryName: string;
}

export function InquiryAttachmentsQuickView({ inquiryId, count, inquiryName }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<AttachmentRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState<Set<string>>(() => new Set());

  const togglePreview = useCallback((id: string) => {
    setPreviewing((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("inquiry_attachments")
        .select("id, filename, storage_path, size_bytes, mime_type, created_at")
        .eq("inquiry_id", inquiryId)
        .order("created_at", { ascending: true });
      if (err) throw err;
      const rows = (data ?? []) as AttachmentRow[];

      const withUrls = await Promise.all(
        rows.map(async (r) => {
          const path = r.storage_path.replace(/^inquiry-attachments\//, "");
          const { data: signed } = await supabase.storage
            .from("inquiry-attachments")
            .createSignedUrl(path, 60 * 60);
          return { ...r, signedUrl: signed?.signedUrl ?? null };
        }),
      );
      setItems(withUrls);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Couldn't load attachments";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [inquiryId]);

  useEffect(() => {
    if (open && items === null && !loading) void load();
  }, [open, items, loading, load]);

  const download = async (item: AttachmentRow) => {
    try {
      if (!item.signedUrl) throw new Error("No download URL");
      const res = await fetch(item.signedUrl);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = item.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Download failed";
      toast.error(msg);
    }
  };

  if (count <= 0) return null;

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          aria-label={`Preview ${count} attachment${count === 1 ? "" : "s"} for ${inquiryName}`}
          title={`${count} attachment${count === 1 ? "" : "s"}`}
          className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/50 hover:text-accent transition-colors"
        >
          <Paperclip className="h-3 w-3" strokeWidth={1.5} />
          <span>{String(count).padStart(2, "0")}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        onClick={(e) => e.stopPropagation()}
        className="w-[340px] p-0 border-border/40 bg-background/98 backdrop-blur"
      >
        <div className="px-4 pt-3 pb-2 border-b border-border/[0.12] flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-foreground/60">
            Attachments · {String(count).padStart(2, "0")}
          </span>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8 text-muted-foreground/50">
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
          </div>
        )}

        {error && !loading && (
          <p className="px-4 py-6 font-mono text-[11px] uppercase tracking-[0.3em] text-red-500/80">
            {error}
          </p>
        )}

        {!loading && !error && items && items.length === 0 && (
          <p className="px-4 py-6 font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground/50">
            No files
          </p>
        )}

        {!loading && !error && items && items.length > 0 && (
          <ul className="max-h-[380px] overflow-y-auto divide-y divide-border/[0.08]">
            {items.map((item) => {
              const isImg = isImageMime(item.mime_type, item.filename);
              return (
                <li key={item.id} className="px-4 py-3 flex items-start gap-3">
                  <div className="shrink-0 h-10 w-10 border border-border/25 bg-foreground/[0.02] overflow-hidden flex items-center justify-center">
                    {isImg && item.signedUrl ? (
                      <img
                        src={item.signedUrl}
                        alt={item.filename}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : isImg ? (
                      <ImageIcon className="h-4 w-4 text-muted-foreground/50" strokeWidth={1.5} />
                    ) : (
                      <FileText className="h-4 w-4 text-muted-foreground/50" strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-sans text-[12px] text-foreground/85 truncate" title={item.filename}>
                      {item.filename}
                    </p>
                    <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/50 mt-0.5">
                      {[item.mime_type?.split("/")[1], humanBytes(item.size_bytes)].filter(Boolean).join(" · ")}
                    </p>
                    <div className="flex items-center gap-4 mt-1.5">
                      {item.signedUrl && (
                        <a
                          href={item.signedUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/60 hover:text-accent transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                          Open
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => download(item)}
                        disabled={!item.signedUrl}
                        className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/60 hover:text-accent transition-colors disabled:opacity-40"
                      >
                        <Download className="h-3 w-3" strokeWidth={1.5} />
                        Download
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
