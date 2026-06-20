import { useHqMode } from "@/hooks/useHqMode";
import { useAuth } from "@/hooks/useAuth";

/**
 * Bronze hairline banner that anchors the page when HQ is in client-preview
 * mode. Staff (admin) see an "Exit preview" link so they can flip back.
 */
export function HqPreviewBanner() {
  const { isPreview, exitPreview } = useHqMode();
  const { isAdmin } = useAuth();

  if (!isPreview) return null;

  return (
    <div className="border-b border-accent/25 bg-background/95 backdrop-blur-sm sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <span
            aria-hidden
            className="w-1.5 h-1.5 rounded-full bg-accent/70 animate-pulse"
          />
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent/70">
            Client Preview
          </p>
          <span className="text-muted-foreground/20 hidden sm:inline">·</span>
          <p className="text-[11px] text-muted-foreground/60 hidden sm:inline">
            View-only · curated demo dataset
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={exitPreview}
            className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/50 hover:text-foreground/80 transition-colors"
          >
            Exit preview →
          </button>
        )}
      </div>
    </div>
  );
}
