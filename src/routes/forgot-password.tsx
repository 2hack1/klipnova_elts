import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { MapPin, Loader2 } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot password — ELTS" }] }),
  component: ForgotPage,
});

function ForgotPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { data: exists, error: eErr } = await supabase.rpc("email_exists", { _email: email });
      if (eErr) throw eErr;
      if (!exists) {
        toast.error("Email not found. Please enter a registered email address.");
        return;
      }
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
      });
      if (error) throw error;
      toast.success("OTP sent. Check your email.");
      nav({ to: "/reset-password", search: { email } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send OTP");
    } finally { setBusy(false); }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-background to-accent/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground"><MapPin className="h-6 w-6" /></div>
          <CardTitle className="mt-3 text-2xl">Reset password</CardTitle>
          <CardDescription>We'll email you a 6-digit code to set a new password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={send} className="space-y-3">
            <div><Label htmlFor="e">Email</Label><Input id="e" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <Button className="w-full" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}Send code</Button>
          </form>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            <Link to="/auth" className="text-primary hover:underline">Back to sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
