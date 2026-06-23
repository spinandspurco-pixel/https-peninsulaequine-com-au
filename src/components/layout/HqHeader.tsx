import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

/**
 * Slim header for private surfaces (HQ, admin, portal, staff, trainer).
 * Public marketing nav is intentionally absent.
 *
 * Layout:
 *   [PE]  HQ · Command Centre        Private HQ · Internal use only  role · email  Sign out
 */
export function HqHeader() {
  const { user, roles, signOut } = useAuth();
  const navigate = useNavigate();
  const primaryRole = roles[0] ?? null;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

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
        <span className="hidden md:inline ml-auto font-mono text-[9px] uppercase tracking-[0.3em] text-accent/55">
          Private HQ · Internal use only
        </span>
        <div className="ml-auto md:ml-6 flex items-center gap-5">
          {user && (
            <span className="hidden sm:inline font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground/55 truncate max-w-[14rem]">
              {primaryRole ? `${primaryRole} · ` : ""}{user.email}
            </span>
          )}
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
