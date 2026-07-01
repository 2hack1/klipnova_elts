import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type CreateEmpInput = {
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
  employee_code: string;
  department?: string;
  designation?: string;
};

async function callerRoles(ctx: any): Promise<Set<string>> {
  const { data } = await ctx.supabase.from("user_roles").select("role").eq("user_id", ctx.userId);
  return new Set((data ?? []).map((r: any) => r.role));
}

export const adminCreateEmployee = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: CreateEmpInput) => d)
  .handler(async ({ data, context }) => {
    const roles = await callerRoles(context);
    if (!roles.has("admin") && !roles.has("super_admin")) throw new Error("Forbidden: admin only");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.full_name ?? "", phone: data.phone ?? "" },
    });
    if (error || !created.user) throw new Error(error?.message ?? "Failed to create user");
    const uid = created.user.id;

    const { error: e2 } = await supabaseAdmin.from("employees").upsert({
      user_id: uid,
      employee_code: data.employee_code,
      department: data.department ?? null,
      designation: data.designation ?? null,
      created_by_admin: context.userId,
    }, { onConflict: "user_id" });
    if (e2) throw new Error(e2.message);

    return { ok: true, user_id: uid };
  });

type CreateAccountInput = {
  email: string;
  password: string;
  full_name?: string;
  role: "admin" | "super_admin";
};

export const superCreateAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: CreateAccountInput) => d)
  .handler(async ({ data, context }) => {
    const roles = await callerRoles(context);
    if (!roles.has("super_admin")) throw new Error("Forbidden: super admin only");
    if (data.role !== "admin" && data.role !== "super_admin") throw new Error("Invalid role");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email, password: data.password, email_confirm: true,
      user_metadata: { full_name: data.full_name ?? "" },
    });
    if (error || !created.user) throw new Error(error?.message ?? "Failed to create user");

    const uid = created.user.id;
    // Trigger inserted 'employee' role; replace with requested role.
    await supabaseAdmin.from("user_roles").delete().eq("user_id", uid);
    const { error: e2 } = await supabaseAdmin.from("user_roles").insert({ user_id: uid, role: data.role });
    if (e2) throw new Error(e2.message);
    return { ok: true, user_id: uid };
  });

type ActiveInput = { user_id: string; active: boolean };

export const superSetActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: ActiveInput) => d)
  .handler(async ({ data, context }) => {
    const roles = await callerRoles(context);
    if (!roles.has("super_admin")) throw new Error("Forbidden: super admin only");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Ban via Auth Admin API (banned_until far future = deactivate, null = activate)
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.user_id, {
      ban_duration: data.active ? "none" : "876000h", // ~100 years
    } as any);
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("profiles").update({ is_active: data.active }).eq("id", data.user_id);
    return { ok: true };
  });

export const superResetPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { user_id: string; password: string }) => d)
  .handler(async ({ data, context }) => {
    const roles = await callerRoles(context);
    if (!roles.has("super_admin")) throw new Error("Forbidden: super admin only");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.user_id, { password: data.password });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const roles = await callerRoles(context);
    if (!roles.has("super_admin")) throw new Error("Forbidden: super admin only");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
    if (error) throw new Error(error.message);
    const ids = users.users.map((u) => u.id);
    const [{ data: allRoles }, { data: profiles }] = await Promise.all([
      supabaseAdmin.from("user_roles").select("user_id, role").in("user_id", ids),
      supabaseAdmin.from("profiles").select("id, full_name, is_active").in("id", ids),
    ]);
    const roleMap = new Map<string, string[]>();
    for (const r of allRoles ?? []) {
      const arr = roleMap.get(r.user_id) ?? [];
      arr.push(r.role);
      roleMap.set(r.user_id, arr);
    }
    const profMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
    return users.users.map((u) => ({
      id: u.id,
      email: u.email ?? "",
      full_name: (profMap.get(u.id) as any)?.full_name ?? null,
      is_active: (profMap.get(u.id) as any)?.is_active ?? true,
      banned: !!(u as any).banned_until,
      roles: roleMap.get(u.id) ?? [],
      created_at: u.created_at,
    }));
  });
