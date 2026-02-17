import { useState, useEffect, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEmployee, setIsEmployee] = useState(false);
  const [isTrainer, setIsTrainer] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    // Hard safety timeout — never hang longer than 3s
    const timeout = setTimeout(() => {
      if (mounted.current) {
        console.log("[useAuth] Safety timeout — resolving loading");
        setLoading(false);
      }
    }, 3000);

    const fetchRoles = async (userId: string) => {
      try {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId);

        if (!mounted.current) return;
        const roleList = roles?.map(r => r.role) || [];
        setIsAdmin(roleList.includes("admin"));
        setIsEmployee(roleList.includes("employee"));
        setIsTrainer(roleList.includes("trainer"));
      } catch (err) {
        console.warn("[useAuth] Role fetch failed:", err);
      }
    };

    const clearRoles = () => {
      setIsAdmin(false);
      setIsEmployee(false);
      setIsTrainer(false);
    };

    // 1. Get initial session
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      if (!mounted.current) return;
      setSession(s);
      setUser(s?.user ?? null);

      if (s?.user) {
        await fetchRoles(s.user.id);
      } else {
        clearRoles();
      }
      if (mounted.current) setLoading(false);
    }).catch(() => {
      if (mounted.current) setLoading(false);
    });

    // 2. Listen for future auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (!mounted.current) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          setTimeout(async () => {
            if (!mounted.current) return;
            await fetchRoles(newSession.user.id);
            if (mounted.current) setLoading(false);
          }, 0);
        } else {
          clearRoles();
          setLoading(false);
        }
      }
    );

    return () => {
      mounted.current = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    session,
    loading,
    isAdmin,
    isEmployee,
    isTrainer,
    signIn,
    signUp,
    signOut,
  };
}
