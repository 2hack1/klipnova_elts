import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { MapPin, Loader2 } from "lucide-react";

const searchSchema = z.object({ email: z.string().email().optional() }).partial();

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Set new password — ELTS" }] }),
  validateSearch: (s) => searchSchema.parse(s),
  component: ResetPage,
});

function ResetPage() {
  const nav = useNavigate();
  const search = Route.useSearch();
  const [email, setEmail] = useState(search.email ?? "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [step, setStep] = useState<"verify" | "setpw">("verify");
  const [busy, setBusy] = useState(false);

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
      if (error) throw error;
      setStep("setpw");
      toast.success("Code verified. Set a new password.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid code");
    } finally { setBusy(false); }
  }

  async function setNew(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    if (password !== confirm) return toast.error("Passwords do not match");
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated.");
      nav({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update password");
    } finally { setBusy(false); }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-background to-accent/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground"><MapPin className="h-6 w-6" /></div>
          <CardTitle className="mt-3 text-2xl">{step === "verify" ? "Enter OTP" : "New password"}</CardTitle>
          <CardDescription>
            {step === "verify"
              ? "Enter the 6-digit code sent to your email."
              : "Choose a new password for your account."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "verify" ? (
            <form onSubmit={verify} className="space-y-3">
              <div><Label htmlFor="e">Email</Label><Input id="e" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div><Label htmlFor="c">OTP code</Label><Input id="c" inputMode="numeric" maxLength={6} required value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} /></div>
              <Button className="w-full" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}Verify</Button>
            </form>
          ) : (
            <form onSubmit={setNew} className="space-y-3">
              <div><Label htmlFor="p">New password</Label><Input id="p" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
              <div><Label htmlFor="p2">Confirm password</Label><Input id="p2" type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} /></div>
              <Button className="w-full" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}Update password</Button>
            </form>
          )}
          <p className="mt-4 text-center text-xs text-muted-foreground">
            <Link to="/auth" className="text-primary hover:underline">Back to sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
