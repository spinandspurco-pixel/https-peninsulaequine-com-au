import { useSignedAttachmentUrls } from "@/hooks/useSignedAttachmentUrls";
import { FileText, Image as ImageIcon, Film, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminAttachmentViewerProps {
  attachmentUrls: string[] | null;
}

const ICON_MAP: Record<string, typeof FileText> = {
  image: ImageIcon,
  video: Film,
};

function guessType(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() || "";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "image";
  if (["mp4", "mov", "webm"].includes(ext)) return "video";
  return "file";
}

function fileName(path: string): string {
  return path.split("/").pop() || path;
}

export function AdminAttachmentViewer({ attachmentUrls }: AdminAttachmentViewerProps) {
  const { urls, loading, error } = useSignedAttachmentUrls(attachmentUrls);

  if (!attachmentUrls || attachmentUrls.length === 0) return null;

  return (
    <div>
      <label className="text-sm font-medium text-muted-foreground">Attachments</label>
      {loading && (
        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading attachments…
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
      {!loading && !error && (
        <ul className="mt-2 space-y-2">
          {attachmentUrls.map((path) => {
            const type = guessType(path);
            const signedUrl = urls[path];
            const Icon = ICON_MAP[type] || FileText;
            const name = fileName(path);

            return (
              <li key={path} className="flex items-center gap-3 p-2 rounded-lg border bg-card">
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-sm truncate flex-1">{name}</span>
                {signedUrl ? (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={signedUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                      View
                    </a>
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">Unavailable</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
