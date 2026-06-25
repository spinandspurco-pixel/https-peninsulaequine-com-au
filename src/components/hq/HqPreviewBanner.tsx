import { useHqMode } from "@/hooks/useHqMode";
import { useAuth } from "@/hooks/useAuth";

/**
 * Sticky bronze hairline banner shown whenever HQ is in client-preview mode.
 * Designed to read as an intentional part of the interface — not a warning.
 *
 * Staff (admin) see an "Exit preview" link so they can flip back. For preview
 * users it simply states what this environment is, in the same restrained
 * register as the rest of HQ.
 */
export function HqPreviewBanner() {
  const { isPreview, exitPreview } = useHqMode();
  const { isAdmin } = useAuth();

  if (!isPreview) return null;

  // Admins land here by clicking "Client preview" on /hq; they impersonate the
  // preview view and need a way back. Real preview-role users (Josh) never see
  // the exit affordance because preview is their permanent role.
  const handleExit = () => {
    exitPreview();
  };

  return (
    <div className="sticky top-14 z-40 border-b border-accent/20 bg-background/85 backdrop-blur-md">
      {/* Top hairline gradient — the bronze thread */}
      <div
        aria-hidden
        className="h-px w-full bg-gradient-to-r from-transparent via-accent/40 to-transparent"
      />
      <div className="max-w-5xl mx-auto px-6 py-2.5 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4 min-w-0">
          <span
            aria-hidden
            className="w-1.5 h-1.5 rounded-full bg-accent/70 animate-pulse shrink-0"
          />
          <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-accent/80 shrink-0">
            Client Preview
          </p>
          <span className="text-muted-foreground/20 hidden sm:inline" aria-hidden>·</span>
          <p className="text-[11px] text-muted-foreground/65 hidden sm:inline truncate">
            View-only
          </p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={handleExit}
            className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent/70 hover:text-accent transition-colors shrink-0"
          >
            Exit preview →
          </button>
        )}
      </div>
    </div>
  );
}
