import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  employeeId: string | null;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  user: null, session: null, loading: true, isAdmin: false, employeeId: null, refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [employeeId, setEmployeeId] = useState<string | null>(null);

  async function loadMeta(uid: string) {
    const [{ data: roles }, { data: emp }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", uid),
      supabase.from("employees").select("id").eq("user_id", uid).maybeSingle(),
    ]);
    setIsAdmin((roles ?? []).some((r) => r.role === "admin"));
    setEmployeeId(emp?.id ?? null);
  }

  async function refresh() {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    setUser(data.session?.user ?? null);
    if (data.session?.user) await loadMeta(data.session.user.id);
    else { setIsAdmin(false); setEmployeeId(null); }
  }

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) { void loadMeta(s.user.id); }
      else { setIsAdmin(false); setEmployeeId(null); }
    });
    void (async () => { await refresh(); setLoading(false); })();
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  return <Ctx.Provider value={{ user, session, loading, isAdmin, employeeId, refresh }}>{children}</Ctx.Provider>;
}

export function useAuth() { return useContext(Ctx); }
