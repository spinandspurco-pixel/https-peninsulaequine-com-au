import { useState, useEffect, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { authLog } from "@/lib/authRouting";

export type AppRole = "admin" | "employee" | "trainer" | "moderator" | "preview" | "user";

/**
 * Hard cap for how long we are willing to wait on the *initial* role lookup
 * before declaring the auth flow ready. If the cap fires while a session is
 * present but roles are still unknown, we sign the session out — rendering
 * a signed-in user with empty roles is what produced the homepage-bounce
 * bug, so we refuse to ever enter that state.
 */
const ROLE_FETCH_HARD_TIMEOUT_MS = 4000;

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    let initialResolved = false;
    let hardTimer: ReturnType<typeof setTimeout> | null = null;

    const fetchRoles = async (userId: string) => {
      authLog("roles:fetch:start", { userId });
      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId);
        if (!mounted.current) return;
        if (error) {
          authLog("roles:fetch:error", { error: error.message });
          setRoles([]);
        } else {
          const list = (data?.map((r) => r.role) || []) as AppRole[];
          setRoles(list);
          authLog("roles:fetch:ok", { roles: list });
        }
      } catch (err) {
        authLog("roles:fetch:exception", { err: String(err) });
        if (mounted.current) setRoles([]);
      } finally {
        if (mounted.current) setRolesLoading(false);
      }
    };

    const applySession = (newSession: Session | null, source: string) => {
      authLog("session:apply", { source, hasUser: !!newSession?.user });
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setAuthLoading(false);

      if (newSession?.user) {
        setRolesLoading(true);
        // Defer the role fetch off the auth callback frame. Supabase
        // documents that awaiting inside onAuthStateChange can deadlock
        // subsequent events, so we hop out with setTimeout(0).
        const uid = newSession.user.id;
        setTimeout(() => {
          if (mounted.current) void fetchRoles(uid);
        }, 0);
      } else {
        setRoles([]);
        setRolesLoading(false);
      }

      if (!initialResolved) {
        initialResolved = true;
        // Start the hard cap on first session resolution.
        hardTimer = setTimeout(async () => {
          if (!mounted.current) return;
          // If we still don't know the roles by the cap and a user is
          // present, sign out rather than leave a half-resolved state.
          // ProtectedRoute will then send them through /login cleanly.
          // We read state via refs would be cleaner, but functional updates
          // on the next paint are sufficient for this safety net.
          setRolesLoading((isLoading) => {
            if (!isLoading) return isLoading;
            authLog("roles:hard-timeout", { action: "signOut" });
            void supabase.auth.signOut();
            return false;
          });
        }, ROLE_FETCH_HARD_TIMEOUT_MS);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!mounted.current) return;
        applySession(newSession, `event:${event}`);
      }
    );

    supabase.auth
      .getSession()
      .then(({ data: { session: s } }) => {
        if (!mounted.current) return;
        // If the auth event already applied a session, this is a no-op duplicate
        // for the same user, so re-running applySession is safe.
        applySession(s, "getSession");
      })
      .catch((err) => {
        authLog("getSession:error", { err: String(err) });
        if (mounted.current) {
          setAuthLoading(false);
          setRolesLoading(false);
        }
      });

    return () => {
      mounted.current = false;
      if (hardTimer) clearTimeout(hardTimer);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  // `ready` is the only flag callers should gate routing decisions on.
  // It guarantees both session state and role state are fully known.
  const ready = !authLoading && !rolesLoading;

  return {
    user,
    session,
    loading: !ready, // back-compat alias for existing call sites
    ready,
    authLoading,
    rolesLoading,
    roles,
    isAdmin: roles.includes("admin"),
    isEmployee: roles.includes("employee"),
    isTrainer: roles.includes("trainer"),
    isModerator: roles.includes("moderator"),
    isPreview: roles.includes("preview"),
    signIn,
    signUp,
    signOut,
  };
}
