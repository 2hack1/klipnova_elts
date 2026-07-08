import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

import { toast } from "sonner";

export type AppRole = "super_admin" | "admin" | "employee";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: AppRole | null;
  isSuperAdmin: boolean;
  isAdmin: boolean; // true for admin OR super_admin (kept for backwards compat)
  employeeId: string | null;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  user: null,
  session: null,
  loading: true,
  role: null,
  isSuperAdmin: false,
  isAdmin: false,
  employeeId: null,
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<AppRole | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);

  async function loadMeta(uid: string) {
    const [{ data: roles }, { data: emp }, { data: profile }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", uid),
      supabase.from("employees").select("id").eq("user_id", uid).maybeSingle(),
      supabase.from("profiles").select("is_active").eq("id", uid).maybeSingle(),
    ]);
    const names = (roles ?? []).map((r) => r.role as AppRole);
    const top: AppRole | null = names.includes("super_admin")
      ? "super_admin"
      : names.includes("admin")
        ? "admin"
        : names.includes("employee")
          ? "employee"
          : null;

    const isAdminUser = top === "super_admin" || top === "admin";
    if (profile && !profile.is_active && !isAdminUser) {
      await supabase.auth.signOut();
      toast.error("Your account is deactivated. Please contact an administrator.");
      return;
    }

    setRole(top);
    setEmployeeId(emp?.id ?? null);
  }

  async function refresh() {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    setUser(data.session?.user ?? null);
    if (data.session?.user) await loadMeta(data.session.user.id);
    else {
      setRole(null);
      setEmployeeId(null);
    }
  }

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        void loadMeta(s.user.id);
      } else {
        setRole(null);
        setEmployeeId(null);
      }
    });
    void (async () => {
      await refresh();
      setLoading(false);
    })();
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const isSuperAdmin = role === "super_admin";
  const isAdmin = role === "admin" || role === "super_admin";

  return (
    <Ctx.Provider
      value={{ user, session, loading, role, isSuperAdmin, isAdmin, employeeId, refresh }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  return useContext(Ctx);
}
