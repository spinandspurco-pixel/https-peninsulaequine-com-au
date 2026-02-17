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
  const loadingResolved = useRef(false);

  const resolveLoading = () => {
    if (!loadingResolved.current) {
      loadingResolved.current = true;
      setLoading(false);
    }
  };

  useEffect(() => {
    // Safety timeout — never hang longer than 5s
    const timeout = setTimeout(() => {
      resolveLoading();
    }, 5000);

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Use setTimeout to avoid Supabase client deadlock
          setTimeout(async () => {
            const { data: roles } = await supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", session.user.id);
            
            const roleList = roles?.map(r => r.role) || [];
            setIsAdmin(roleList.includes("admin"));
            setIsEmployee(roleList.includes("employee"));
            setIsTrainer(roleList.includes("trainer"));
            resolveLoading();
          }, 0);
        } else {
          setIsAdmin(false);
          setIsEmployee(false);
          setIsTrainer(false);
          resolveLoading();
        }
      }
    );

    // THEN get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .then(({ data: roles }) => {
            const roleList = roles?.map(r => r.role) || [];
            setIsAdmin(roleList.includes("admin"));
            setIsEmployee(roleList.includes("employee"));
            setIsTrainer(roleList.includes("trainer"));
            resolveLoading();
          });
      } else {
        resolveLoading();
      }
    }).catch(() => {
      resolveLoading();
    });

    return () => {
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
