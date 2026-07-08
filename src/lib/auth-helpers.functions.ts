import { createServerFn } from "@tanstack/react-start";

export const checkEmailExists = createServerFn({ method: "POST" })
  .inputValidator((d: { email: string }) => {
    const email = String(d?.email ?? "")
      .trim()
      .toLowerCase();
    if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Invalid email");
    }
    return { email };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: exists, error } = await supabaseAdmin.rpc("email_exists", { _email: data.email });
    if (error) throw new Error(error.message);
    return { exists: !!exists };
  });
