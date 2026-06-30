import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { MapPin, Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — ELTS" }, { name: "description", content: "Sign in to ELTS." }] }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!loading && user) nav({ to: "/dashboard" }); }, [user, loading, nav]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Signed in.");
      nav({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally { setBusy(false); }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-background to-accent/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground"><MapPin className="h-6 w-6" /></div>
          <CardTitle className="mt-3 text-2xl">ELTS</CardTitle>
          <CardDescription>Sign in with the account your administrator created for you.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div><Label htmlFor="e">Email</Label><Input id="e" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="p">Password</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
              <Input id="p" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button className="w-full" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}Sign in</Button>
          </form>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            New accounts can only be created by an administrator.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
