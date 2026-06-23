import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { MentionsBadge } from "@/components/layout/MentionsBadge";

/**
 * Slim header for private surfaces (HQ, admin, portal, staff, trainer).
 * Public marketing nav is intentionally absent.
 *
 * Layout:
 *   [PE]  HQ · Command Centre        Private HQ · Internal use only  role · email  Sign out
 */
export function HqHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Unauthenticated visitors on private surfaces (only /login reaches this
  // branch in practice — every other private route redirects to /login when
  // signed out) should see the StaffPortalFrame as the sole header. Rendering
  // the HQ chrome here duplicates the title and exposes a Sign Out button
  // that has nothing to sign out of.
  if (!user) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border/10">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-6">
        <Link
          to="/hq"
          className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/85 hover:text-accent transition-colors"
        >
          PE
        </Link>
        <span className="hidden sm:inline font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/55">
          HQ · Command Centre
        </span>
        <div className="ml-auto flex items-center gap-5">
          <MentionsBadge />
          <button
            onClick={handleSignOut}
            className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground/55 hover:text-foreground/90 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}

