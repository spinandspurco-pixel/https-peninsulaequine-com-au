import { useEffect, useMemo, useState } from "react";
import { FileText, FileImage, FileSpreadsheet, File as FileIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Renders a compact list of pending upload attachments with:
 *  - image thumbnail (revocable object URL) for image files
 *  - typed file icon for non-image files
 *  - file name + size
 *  - remove control
 *
 * Used across all inquiry review steps (GuidedIntake, LessonInquiry, Contact)
 * so what the user sees before submit matches what will be uploaded.
 */
export interface AttachmentPreviewListProps {
  files: File[];
  onRemove: (index: number) => void;
  className?: string;
  variant?: "default" | "muted";
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

export function AttachmentPreviewList({
  files,
  onRemove,
  className,
  variant = "default",
}: AttachmentPreviewListProps) {
  const items = useMemo(() => files, [files]);
  if (items.length === 0) return null;

  return (
    <ul
      className={cn(
        "space-y-2",
        variant === "muted" && "text-foreground/60",
        className
      )}
      aria-label="Files ready to upload"
    >
      {items.map((f, i) => (
        <li
          key={`${f.name}-${f.size}-${i}`}
          className="flex items-center gap-3 border border-border/30 bg-background/30 px-2.5 py-2"
        >
          <Thumb file={f} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-foreground/85" title={f.name}>
              {f.name}
            </p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/40">
              {formatSize(f.size)}
              {f.type ? ` · ${f.type.split("/")[1]?.toUpperCase() || f.type}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onRemove(i)}
            aria-label={`Remove ${f.name}`}
            className="flex-none p-1.5 text-foreground/40 hover:text-destructive transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </li>
      ))}
    </ul>
  );
}

export default AttachmentPreviewList;
