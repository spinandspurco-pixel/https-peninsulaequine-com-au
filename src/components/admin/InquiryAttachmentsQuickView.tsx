import { useCallback, useEffect, useState } from "react";
import {
  Paperclip,
  Download,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Loader2,
  Eye,
  EyeOff,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
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
  signError?: string | null;
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

async function signOne(storagePath: string): Promise<{ url: string | null; error: string | null }> {
  const path = storagePath.replace(/^inquiry-attachments\//, "");
  const { data, error } = await supabase.storage
    .from("inquiry-attachments")
    .createSignedUrl(path, 60 * 60);
  if (error) {
    const msg = /not.*found|does not exist/i.test(error.message)
      ? "File missing"
      : error.message || "Signing failed";
    return { url: null, error: msg };
  }
  return { url: data?.signedUrl ?? null, error: data?.signedUrl ? null : "No URL returned" };
}

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
  const [previewLoading, setPreviewLoading] = useState<Set<string>>(() => new Set());
  const [previewError, setPreviewError] = useState<Record<string, string>>({});
  const [downloading, setDownloading] = useState<Set<string>>(() => new Set());
  const [retrying, setRetrying] = useState<Set<string>>(() => new Set());

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
          const { url, error: signErr } = await signOne(r.storage_path);
          return { ...r, signedUrl: url, signError: signErr };
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

  const retrySign = useCallback(async (item: AttachmentRow) => {
    setRetrying((prev) => new Set(prev).add(item.id));
    try {
      const { url, error: signErr } = await signOne(item.storage_path);
      setItems((prev) =>
        prev
          ? prev.map((r) => (r.id === item.id ? { ...r, signedUrl: url, signError: signErr } : r))
          : prev,
      );
      if (signErr) toast.error(signErr);
    } finally {
      setRetrying((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  }, []);

  const togglePreview = useCallback(
    (id: string) => {
      setPreviewing((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
          setPreviewLoading((pl) => new Set(pl).add(id));
          setPreviewError((pe) => {
            const { [id]: _, ...rest } = pe;
            return rest;
          });
        }
        return next;
      });
    },
    [],
  );

  const markPreviewLoaded = useCallback((id: string) => {
    setPreviewLoading((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const markPreviewFailed = useCallback((id: string, msg: string) => {
    setPreviewLoading((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setPreviewError((prev) => ({ ...prev, [id]: msg }));
  }, []);

  const retryPreview = useCallback(
    async (item: AttachmentRow) => {
      setPreviewError((prev) => {
        const { [item.id]: _, ...rest } = prev;
        return rest;
      });
      setPreviewLoading((prev) => new Set(prev).add(item.id));
      await retrySign(item);
    },
    [retrySign],
  );

  const download = useCallback(async (item: AttachmentRow) => {
    setDownloading((prev) => new Set(prev).add(item.id));
    try {
      let url = item.signedUrl;
      if (!url) {
        const { url: fresh, error: signErr } = await signOne(item.storage_path);
        if (signErr || !fresh) throw new Error(signErr ?? "Couldn't get download URL");
        url = fresh;
        setItems((prev) =>
          prev
            ? prev.map((r) => (r.id === item.id ? { ...r, signedUrl: fresh, signError: null } : r))
            : prev,
        );
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.status === 404 ? "File missing" : `Download failed (${res.status})`);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = item.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Download failed";
      toast.error(msg);
    } finally {
      setDownloading((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  }, []);

  if (count <= 0) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
        className="w-[400px] p-0 border-border/40 bg-background/98 backdrop-blur"
      >
        <div className="px-4 pt-3 pb-2 border-b border-border/[0.12] flex items-center justify-between gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-foreground/60">
            Attachments · {String(count).padStart(2, "0")}
          </span>
          {items && !loading && (
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/60 hover:text-accent transition-colors"
              aria-label="Refresh attachments"
            >
              <RefreshCw className="h-3 w-3" strokeWidth={1.5} />
              Refresh
            </button>
          )}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground/60">
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
            <span className="font-mono text-[9px] uppercase tracking-[0.35em]">Loading…</span>
          </div>
        )}

        {error && !loading && (
          <div className="px-4 py-6 flex flex-col items-start gap-3">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-red-500/85">
              <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/70 hover:text-accent transition-colors"
            >
              <RefreshCw className="h-3 w-3" strokeWidth={1.5} />
              Retry
            </button>
          </div>
        )}

        {!loading && !error && items && items.length === 0 && (
          <p className="px-4 py-6 font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground/50">
            No files
          </p>
        )}

        {!loading && !error && items && items.length > 0 && (
          <ul className="max-h-[520px] overflow-y-auto divide-y divide-border/[0.08]">
            {items.map((item) => {
              const isImg = isImageMime(item.mime_type, item.filename);
              const isPdf = isPdfMime(item.mime_type, item.filename);
              const canPreview = (isImg || isPdf) && !!item.signedUrl && !item.signError;
              const isOpen = previewing.has(item.id);
              const isDownloading = downloading.has(item.id);
              const isRetrying = retrying.has(item.id);
              const isPreviewLoading = previewLoading.has(item.id);
              const pError = previewError[item.id];
              const missing = !!item.signError;

              return (
                <li key={item.id} className="px-4 py-3">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 h-10 w-10 border border-border/25 bg-foreground/[0.02] overflow-hidden flex items-center justify-center">
                      {isImg && item.signedUrl ? (
                        <img
                          src={item.signedUrl}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : missing ? (
                        <AlertTriangle className="h-4 w-4 text-red-500/60" strokeWidth={1.5} />
                      ) : isImg ? (
                        <ImageIcon className="h-4 w-4 text-muted-foreground/50" strokeWidth={1.5} />
                      ) : (
                        <FileText className="h-4 w-4 text-muted-foreground/50" strokeWidth={1.5} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="font-sans text-[12px] text-foreground/85 truncate"
                        title={item.filename}
                      >
                        {item.filename}
                      </p>
                      <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/50 mt-0.5">
                        {[item.mime_type?.split("/")[1], humanBytes(item.size_bytes)]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>

                      {missing && (
                        <div className="mt-1.5 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.3em] text-red-500/80">
                          <AlertTriangle className="h-3 w-3" strokeWidth={1.5} />
                          <span>{item.signError}</span>
                          <button
                            type="button"
                            onClick={() => void retrySign(item)}
                            disabled={isRetrying}
                            className="inline-flex items-center gap-1 text-foreground/70 hover:text-accent transition-colors disabled:opacity-40"
                          >
                            {isRetrying ? (
                              <Loader2 className="h-3 w-3 animate-spin" strokeWidth={1.5} />
                            ) : (
                              <RefreshCw className="h-3 w-3" strokeWidth={1.5} />
                            )}
                            Retry
                          </button>
                        </div>
                      )}

                      {!missing && (
                        <div className="flex items-center gap-4 mt-1.5">
                          {canPreview && (
                            <button
                              type="button"
                              onClick={() => togglePreview(item.id)}
                              className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/60 hover:text-accent transition-colors"
                              aria-expanded={isOpen}
                            >
                              {isOpen ? (
                                <>
                                  <EyeOff className="h-3 w-3" strokeWidth={1.5} />
                                  Hide
                                </>
                              ) : (
                                <>
                                  <Eye className="h-3 w-3" strokeWidth={1.5} />
                                  Preview
                                </>
                              )}
                            </button>
                          )}
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
                            onClick={() => void download(item)}
                            disabled={isDownloading}
                            className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/60 hover:text-accent transition-colors disabled:opacity-40"
                          >
                            {isDownloading ? (
                              <Loader2 className="h-3 w-3 animate-spin" strokeWidth={1.5} />
                            ) : (
                              <Download className="h-3 w-3" strokeWidth={1.5} />
                            )}
                            {isDownloading ? "Saving…" : "Download"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {isOpen && canPreview && item.signedUrl && (
                    <div className="mt-3 relative border border-border/25 bg-foreground/[0.02] overflow-hidden">
                      {isPreviewLoading && !pError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm z-10">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground/70" strokeWidth={1.5} />
                        </div>
                      )}
                      {pError ? (
                        <div className="p-6 flex flex-col items-start gap-2">
                          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-red-500/85">
                            <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.5} />
                            <span>{pError}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => void retryPreview(item)}
                            className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/70 hover:text-accent transition-colors"
                          >
                            <RefreshCw className="h-3 w-3" strokeWidth={1.5} />
                            Retry preview
                          </button>
                        </div>
                      ) : isImg ? (
                        <img
                          src={item.signedUrl}
                          alt={item.filename}
                          className="w-full max-h-[420px] object-contain bg-black/40"
                          loading="lazy"
                          onLoad={() => markPreviewLoaded(item.id)}
                          onError={() => markPreviewFailed(item.id, "Preview failed to load")}
                        />
                      ) : (
                        <iframe
                          src={`${item.signedUrl}#toolbar=0&navpanes=0&view=FitH`}
                          title={item.filename}
                          className="w-full h-[440px] bg-background"
                          onLoad={() => markPreviewLoaded(item.id)}
                          onError={() => markPreviewFailed(item.id, "Preview failed to load")}
                        />
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
