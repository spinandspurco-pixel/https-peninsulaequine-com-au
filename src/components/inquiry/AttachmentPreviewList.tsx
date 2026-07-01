import { useEffect, useMemo, useState } from "react";
import { FileText, FileImage, FileSpreadsheet, File as FileIcon, X, RotateCcw, Check, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AttachmentStatus } from "@/hooks/useAttachmentUpload";

/**
 * Renders a compact list of pending upload attachments with:
 *  - image thumbnail (revocable object URL) for image files
 *  - typed file icon for non-image files
 *  - file name + size
 *  - remove control
 *  - live upload progress bar, per-file success/error state, and a
 *    Retry control when a status prop is supplied.
 */
export interface AttachmentPreviewListProps {
  files: File[];
  onRemove: (index: number) => void;
  className?: string;
  variant?: "default" | "muted";
  /** Optional per-file upload status (aligned by index). */
  statuses?: AttachmentStatus[];
  /** Called when the user clicks the retry control on an errored file. */
  onRetry?: () => void;
  /** Disable remove/retry controls (e.g. while uploading). */
  busy?: boolean;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function iconFor(file: File) {
  const name = file.name.toLowerCase();
  if (file.type.startsWith("image/")) return FileImage;
  if (name.endsWith(".pdf")) return FileText;
  if (/\.(xls|xlsx|csv)$/.test(name)) return FileSpreadsheet;
  if (/\.(doc|docx|txt|rtf)$/.test(name)) return FileText;
  return FileIcon;
}

function Thumb({ file }: { file: File }) {
  const isImage = file.type.startsWith("image/") && !file.type.includes("heic");
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isImage) return;
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file, isImage]);

  if (isImage && url) {
    return (
      <img
        src={url}
        alt={file.name}
        loading="lazy"
        className="h-12 w-12 flex-none object-cover border border-border/40 bg-background/40"
      />
    );
  }
  const Icon = iconFor(file);
  return (
    <div className="h-12 w-12 flex-none flex items-center justify-center border border-border/40 bg-background/40 text-foreground/50">
      <Icon className="h-5 w-5" aria-hidden />
    </div>
  );
}

function StatusBadge({ status }: { status?: AttachmentStatus }) {
  if (!status) return null;
  if (status.state === "success") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-emerald-500/90">
        <Check className="h-3 w-3" aria-hidden />
        Uploaded
      </span>
    );
  }
  if (status.state === "uploading") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-foreground/50">
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
        {Math.round(status.progress * 100)}%
      </span>
    );
  }
  if (status.state === "error") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-destructive">
        <AlertCircle className="h-3 w-3" aria-hidden />
        Failed
      </span>
    );
  }
  return null;
}

export function AttachmentPreviewList({
  files,
  onRemove,
  className,
  variant = "default",
  statuses,
  onRetry,
  busy = false,
}: AttachmentPreviewListProps) {
  const items = useMemo(() => files, [files]);
  if (items.length === 0) return null;

  const hasErrors = statuses?.some((s) => s?.state === "error") ?? false;

  return (
    <div className={cn("space-y-2", className)}>
      <ul
        className={cn("space-y-2", variant === "muted" && "text-foreground/60")}
        aria-label="Files ready to upload"
      >
        {items.map((f, i) => {
          const status = statuses?.[i];
          const uploading = status?.state === "uploading";
          const errored = status?.state === "error";
          const succeeded = status?.state === "success";
          return (
            <li
              key={`${f.name}-${f.size}-${i}`}
              className={cn(
                "flex flex-col gap-1.5 border px-2.5 py-2 transition-colors",
                errored
                  ? "border-destructive/40 bg-destructive/[0.04]"
                  : succeeded
                    ? "border-emerald-500/25 bg-background/30"
                    : "border-border/30 bg-background/30",
              )}
            >
              <div className="flex items-center gap-3">
                <Thumb file={f} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p
                      className="truncate text-xs text-foreground/85"
                      title={f.name}
                    >
                      {f.name}
                    </p>
                    <StatusBadge status={status} />
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/40">
                    {formatSize(f.size)}
                    {f.type
                      ? ` · ${f.type.split("/")[1]?.toUpperCase() || f.type}`
                      : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  disabled={busy || uploading}
                  aria-label={`Remove ${f.name}`}
                  className="flex-none p-1.5 text-foreground/40 hover:text-destructive transition-colors disabled:opacity-30 disabled:hover:text-foreground/40 disabled:cursor-not-allowed"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {uploading && (
                <div
                  className="h-0.5 w-full bg-foreground/10 overflow-hidden"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(status.progress * 100)}
                  aria-label={`Uploading ${f.name}`}
                >
                  <div
                    className="h-full bg-accent transition-[width] duration-150"
                    style={{ width: `${Math.max(2, status.progress * 100)}%` }}
                  />
                </div>
              )}

              {errored && (
                <p className="text-[11px] text-destructive/90 leading-snug">
                  {status.message}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      {hasErrors && onRetry && (
        <div className="flex items-center justify-between border border-destructive/30 bg-destructive/[0.04] px-3 py-2">
          <p className="text-[11px] text-destructive/90">
            Some files didn't upload. Successful files are kept.
          </p>
          <button
            type="button"
            onClick={onRetry}
            disabled={busy}
            className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-foreground/80 hover:text-foreground border border-border/40 px-2.5 py-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw className="h-3 w-3" aria-hidden />
            Retry failed
          </button>
        </div>
      )}
    </div>
  );
}

export default AttachmentPreviewList;
