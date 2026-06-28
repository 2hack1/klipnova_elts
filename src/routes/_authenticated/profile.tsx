import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({ component: Profile });

function Profile() {
  const { user, employeeId, isAdmin } = useAuth();
  const [profile, setProfile] = useState<any>({ full_name: "", phone: "" });
  const [employee, setEmployee] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (data) setProfile(data);
      if (employeeId) {
        const e = await supabase.from("employees").select("*").eq("id", employeeId).maybeSingle();
        setEmployee(e.data);
      }
    })();
  }, [user, employeeId]);

  async function save() {
    setBusy(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user!.id, full_name: profile.full_name, phone: profile.phone,
    });
    setBusy(false);
    if (error) toast.error(error.message); else toast.success("Profile saved");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
      <Card>
        <CardHeader><CardTitle className="text-base">Personal info</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>Email</Label><Input value={user?.email ?? ""} disabled /></div>
          <div><Label>Full name</Label><Input value={profile.full_name ?? ""} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} /></div>
          <div><Label>Phone</Label><Input value={profile.phone ?? ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></div>
          <Button onClick={save} disabled={busy}>Save</Button>
        </CardContent>
      </Card>

      {employee && (
        <Card>
          <CardHeader><CardTitle className="text-base">Employment</CardTitle></CardHeader>
          <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
            <div><span className="text-muted-foreground">Code</span><div className="font-medium">{employee.employee_code}</div></div>
            <div><span className="text-muted-foreground">Department</span><div className="font-medium">{employee.department ?? "—"}</div></div>
            <div><span className="text-muted-foreground">Designation</span><div className="font-medium">{employee.designation ?? "—"}</div></div>
            <div><span className="text-muted-foreground">Hire date</span><div className="font-medium">{employee.hire_date}</div></div>
            <div><span className="text-muted-foreground">Status</span><div className="font-medium">{employee.status}</div></div>
            <div><span className="text-muted-foreground">Role</span><div className="font-medium">{isAdmin ? "Administrator" : "Employee"}</div></div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
