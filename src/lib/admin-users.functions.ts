import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type CreateInput = {
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
  employee_code: string;
  department?: string;
  designation?: string;
};

export const adminCreateEmployee = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: CreateInput) => d)
  .handler(async ({ data, context }) => {
    // Only admins can call this
    const { data: roles } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    const isAdmin = (roles ?? []).some((r: any) => r.role === "admin");
    if (!isAdmin) throw new Error("Forbidden: admin only");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.full_name ?? "", phone: data.phone ?? "" },
    });
    if (error || !created.user) throw new Error(error?.message ?? "Failed to create user");
    const uid = created.user.id;

    // Trigger created profile + employee role. Now add employee record.
    const { error: e2 } = await supabaseAdmin.from("employees").upsert({
      user_id: uid,
      employee_code: data.employee_code,
      department: data.department ?? null,
      designation: data.designation ?? null,
    }, { onConflict: "user_id" });
    if (e2) throw new Error(e2.message);

    return { ok: true, user_id: uid };
  });
