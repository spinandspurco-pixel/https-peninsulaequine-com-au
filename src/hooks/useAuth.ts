import { createContext, createElement, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { authLog } from "@/lib/authRouting";

export type AppRole = "admin" | "employee" | "trainer" | "moderator" | "preview" | "user";

type AuthState = ReturnType<typeof useAuthState>;

const AuthContext = createContext<AuthState | null>(null);

const ROLE_FETCH_RETRY_DELAYS_MS = [0, 350, 900];

function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const mounted = useRef(true);
  const roleRequestId = useRef(0);

  useEffect(() => {
    mounted.current = true;

    const fetchRoles = async (userId: string, requestId: number) => {
      authLog("roles:fetch:start", { userId, requestId });
      try {
        for (let attempt = 0; attempt < ROLE_FETCH_RETRY_DELAYS_MS.length; attempt += 1) {
          const delay = ROLE_FETCH_RETRY_DELAYS_MS[attempt];
          if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
          if (!mounted.current || roleRequestId.current !== requestId) return;

          const { data, error } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", userId);

          if (!mounted.current || roleRequestId.current !== requestId) return;
          if (error) {
            authLog("roles:fetch:error", { attempt, error: error.message });
            if (attempt < ROLE_FETCH_RETRY_DELAYS_MS.length - 1) continue;
            setRoles([]);
            return;
          }

          const list = (data?.map((r) => r.role) || []) as AppRole[];
          setRoles(list);
          authLog("roles:fetch:ok", { roles: list, requestId });
          return;
        }
      } catch (err) {
        authLog("roles:fetch:exception", { err: String(err), requestId });
        if (mounted.current) setRoles([]);
      } finally {
        if (mounted.current && roleRequestId.current === requestId) {
          setRolesLoading(false);
        }
      }
    };

    const applySession = (newSession: Session | null, source: string) => {
      authLog("session:apply", { source, hasUser: !!newSession?.user });
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setAuthLoading(false);

      if (newSession?.user) {
        const requestId = roleRequestId.current + 1;
        roleRequestId.current = requestId;
        setRolesLoading(true);
        // Defer the role fetch off the auth callback frame. Supabase
        // documents that awaiting inside onAuthStateChange can deadlock
        // subsequent events, so we hop out with setTimeout(0).
        const uid = newSession.user.id;
        setTimeout(() => {
          if (mounted.current && roleRequestId.current === requestId) void fetchRoles(uid, requestId);
        }, 0);
      } else {
        roleRequestId.current += 1;
        setRoles([]);
        setRolesLoading(false);
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
      roleRequestId.current += 1;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const value = useAuthState();
  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return value;
}
