import { createContext, createElement, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { authLog } from "@/lib/authRouting";

export type AppRole = "admin" | "employee" | "trainer" | "moderator" | "preview" | "user";

type AuthState = ReturnType<typeof useAuthState>;

const AuthContext = createContext<AuthState | null>(null);

const ROLE_FETCH_RETRY_DELAYS_MS = [0, 350, 900];
const ROLE_FETCH_WATCHDOG_MS = 8000;

function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [refetchTick, setRefetchTick] = useState(0);
  const mounted = useRef(true);
  const roleRequestId = useRef(0);
  const currentUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    mounted.current = true;

    const dbg = (scope: string, payload: Record<string, unknown>) => {
      // TEMP: unconditional trace for HQ login-hang investigation
      // eslint-disable-next-line no-console
      console.log(`[auth:${scope}]`, payload);
      authLog(scope, payload);
    };

    const fetchRoles = async (userId: string, requestId: number) => {
      dbg("roles:fetch:start", { userId, requestId });
      try {
        for (let attempt = 0; attempt < ROLE_FETCH_RETRY_DELAYS_MS.length; attempt += 1) {
          const delay = ROLE_FETCH_RETRY_DELAYS_MS[attempt];
          if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
          if (!mounted.current || roleRequestId.current !== requestId) {
            dbg("roles:fetch:cancelled-before-query", { attempt, requestId, current: roleRequestId.current, mounted: mounted.current });
            return;
          }

          dbg("roles:fetch:query-begin", { attempt, requestId });
          const t0 = Date.now();
          const { data, error } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", userId);
          dbg("roles:fetch:query-end", { attempt, requestId, ms: Date.now() - t0, hasData: !!data, errorMsg: error?.message, errorCode: (error as any)?.code });

          if (!mounted.current || roleRequestId.current !== requestId) {
            dbg("roles:fetch:cancelled-after-query", { attempt, requestId, current: roleRequestId.current, mounted: mounted.current });
            return;
          }
          if (error) {
            dbg("roles:fetch:error", { attempt, error: error.message, code: (error as any).code });
            if (attempt < ROLE_FETCH_RETRY_DELAYS_MS.length - 1) continue;
            setRoles([]);
            return;
          }

          const list = (data?.map((r) => r.role) || []) as AppRole[];
          setRoles(list);
          dbg("roles:fetch:ok", { roles: list, requestId });
          return;
        }
      } catch (err) {
        dbg("roles:fetch:exception", { err: String(err), requestId });
        if (mounted.current) setRoles([]);
      } finally {
        dbg("roles:fetch:finally", { requestId, current: roleRequestId.current, mounted: mounted.current });
        if (mounted.current && roleRequestId.current === requestId) {
          setRolesLoading(false);
          dbg("roles:fetch:rolesLoading=false", { requestId });
        } else {
          dbg("roles:fetch:rolesLoading-NOT-cleared", { requestId, current: roleRequestId.current, mounted: mounted.current });
        }
      }
    };

    const applySession = (newSession: Session | null, source: string) => {
      dbg("session:apply", { source, hasUser: !!newSession?.user, uid: newSession?.user?.id });
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setAuthLoading(false);

      if (newSession?.user) {
        const requestId = roleRequestId.current + 1;
        roleRequestId.current = requestId;
        setRolesLoading(true);
        const uid = newSession.user.id;
        dbg("session:schedule-roles-fetch", { source, requestId, uid });
        setTimeout(() => {
          dbg("session:roles-fetch-timer-fired", { requestId, current: roleRequestId.current, mounted: mounted.current });
          if (mounted.current && roleRequestId.current === requestId) void fetchRoles(uid, requestId);
          else dbg("session:roles-fetch-skipped", { requestId, current: roleRequestId.current, mounted: mounted.current });
        }, 0);
      } else {
        roleRequestId.current += 1;
        setRoles([]);
        setRolesLoading(false);
        dbg("session:no-user-clear", {});
      }
    };

    dbg("provider:mount", {});

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        dbg("event:onAuthStateChange", { event, hasSession: !!newSession });
        if (!mounted.current) return;
        applySession(newSession, `event:${event}`);
      }
    );

    supabase.auth
      .getSession()
      .then(({ data: { session: s } }) => {
        dbg("getSession:then", { hasSession: !!s });
        if (!mounted.current) return;
        applySession(s, "getSession");
      })
      .catch((err) => {
        dbg("getSession:error", { err: String(err) });
        if (mounted.current) {
          setAuthLoading(false);
          setRolesLoading(false);
        }
      });

    return () => {
      dbg("provider:unmount", { currentReqId: roleRequestId.current });
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
