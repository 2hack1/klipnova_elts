import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MapView } from "@/components/MapView";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Users, MapPin, Activity, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({ component: AdminPanel });

function AdminPanel() {
  const { isAdmin, loading } = useAuth();
  const nav = useNavigate();
  useEffect(() => { if (!loading && !isAdmin) nav({ to: "/dashboard" }); }, [isAdmin, loading, nav]);
  if (!isAdmin) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-sm text-muted-foreground">Manage employees, locations, and view live tracking + reports.</p>
      </div>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview"><Activity className="h-4 w-4" />Overview</TabsTrigger>
          <TabsTrigger value="employees"><Users className="h-4 w-4" />Employees</TabsTrigger>
          <TabsTrigger value="locations"><MapPin className="h-4 w-4" />Locations</TabsTrigger>
          <TabsTrigger value="live">Live Map</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><Overview /></TabsContent>
        <TabsContent value="employees"><EmployeesTab /></TabsContent>
        <TabsContent value="locations"><LocationsTab /></TabsContent>
        <TabsContent value="live"><LiveMap /></TabsContent>
        <TabsContent value="assignments"><Assignments /></TabsContent>
      </Tabs>
    </div>
  );
}

function Overview() {
  const [stats, setStats] = useState({ employees: 0, presentToday: 0, activeSessions: 0, visitsToday: 0 });
  useEffect(() => { void (async () => {
    const today = new Date().toISOString().slice(0, 10);
    const [e, a, s, v] = await Promise.all([
      supabase.from("employees").select("*", { count: "exact", head: true }),
      supabase.from("attendance").select("*", { count: "exact", head: true }).eq("work_date", today),
      supabase.from("travel_sessions").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("visit_history").select("*", { count: "exact", head: true }).gte("visited_at", today + "T00:00:00"),
    ]);
    setStats({ employees: e.count ?? 0, presentToday: a.count ?? 0, activeSessions: s.count ?? 0, visitsToday: v.count ?? 0 });
  })(); }, []);
  const items = [
    { l: "Employees", v: stats.employees }, { l: "Present today", v: stats.presentToday },
    { l: "Active travel sessions", v: stats.activeSessions }, { l: "Visits today", v: stats.visitsToday },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((i) => (
        <Card key={i.l}><CardContent className="p-5"><div className="text-xs text-muted-foreground">{i.l}</div><div className="mt-1 text-3xl font-bold">{i.v}</div></CardContent></Card>
      ))}
    </div>
  );
}

function EmployeesTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", full_name: "", employee_code: "", department: "", designation: "" });
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data } = await supabase.from("employees").select("*, profiles:user_id(full_name, phone)").order("created_at", { ascending: false });
    setRows(data ?? []);
  }
  useEffect(() => { void load(); }, []);

  async function create() {
    setBusy(true);
    try {
      const { data: signUp, error: e1 } = await supabase.auth.signUp({
        email: form.email, password: form.password,
        options: { data: { full_name: form.full_name } },
      });
      if (e1) throw e1;
      const uid = signUp.user?.id;
      if (!uid) throw new Error("Sign-up did not return a user id");
      // wait for trigger to create profile+role, then insert employee
      await new Promise((r) => setTimeout(r, 600));
      const { error: e2 } = await supabase.from("employees").insert({
        user_id: uid, employee_code: form.employee_code,
        department: form.department || null, designation: form.designation || null,
      });
      if (e2) throw e2;
      toast.success("Employee created");
      setOpen(false);
      setForm({ email: "", password: "", full_name: "", employee_code: "", department: "", designation: "" });
      await load();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setBusy(false); }
  }

  async function setRole(userId: string, makeAdmin: boolean) {
    if (makeAdmin) {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
      if (error && !error.message.includes("duplicate")) return toast.error(error.message);
    } else {
      await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
    }
    toast.success("Role updated");
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Employees ({rows.length})</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4" />Add employee</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New employee</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Full name</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>Temporary password</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Employee code</Label><Input value={form.employee_code} onChange={(e) => setForm({ ...form, employee_code: e.target.value })} /></div>
                <div><Label>Department</Label><Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
              </div>
              <div><Label>Designation</Label><Input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} /></div>
              <Button className="w-full" onClick={create} disabled={busy}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Dept</TableHead><TableHead>Designation</TableHead><TableHead>Status</TableHead><TableHead>Admin</TableHead></TableRow></TableHeader>
          <TableBody>{rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-mono">{r.employee_code}</TableCell>
              <TableCell>{(r.profiles as any)?.full_name ?? "—"}</TableCell>
              <TableCell>{r.department ?? "—"}</TableCell>
              <TableCell>{r.designation ?? "—"}</TableCell>
              <TableCell><Badge variant="outline">{r.status}</Badge></TableCell>
              <TableCell>
                <Select onValueChange={(v) => setRole(r.user_id, v === "yes")} defaultValue="no">
                  <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="no">No</SelectItem><SelectItem value="yes">Yes</SelectItem></SelectContent>
                </Select>
              </TableCell>
            </TableRow>))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function LocationsTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", address: "", latitude: "", longitude: "", radius_meter: 100 });
  const [open, setOpen] = useState(false);

  async function load() {
    const { data } = await supabase.from("assigned_locations").select("*").order("created_at", { ascending: false });
    setRows(data ?? []);
  }
  useEffect(() => { void load(); }, []);

  async function create() {
    const { error } = await supabase.from("assigned_locations").insert({
      name: form.name, address: form.address || null,
      latitude: Number(form.latitude), longitude: Number(form.longitude),
      radius_meter: Number(form.radius_meter),
    });
    if (error) return toast.error(error.message);
    toast.success("Location added"); setOpen(false);
    setForm({ name: "", address: "", latitude: "", longitude: "", radius_meter: 100 });
    await load();
  }

  async function remove(id: string) {
    await supabase.from("assigned_locations").delete().eq("id", id);
    await load();
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Locations ({rows.length})</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4" />Add location</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New location</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Latitude</Label><Input value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} /></div>
                <div><Label>Longitude</Label><Input value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} /></div>
              </div>
              <div><Label>Radius (meters)</Label><Input type="number" value={form.radius_meter} onChange={(e) => setForm({ ...form, radius_meter: Number(e.target.value) })} /></div>
              <Button className="w-full" onClick={create}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.length > 0 && <MapView height="320px" markers={rows.map((r) => ({ lat: Number(r.latitude), lng: Number(r.longitude), label: r.name }))} />}
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Address</TableHead><TableHead>Coords</TableHead><TableHead>Radius</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>{rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.name}</TableCell>
              <TableCell>{r.address ?? "—"}</TableCell>
              <TableCell className="font-mono text-xs">{Number(r.latitude).toFixed(4)}, {Number(r.longitude).toFixed(4)}</TableCell>
              <TableCell>{r.radius_meter} m</TableCell>
              <TableCell><Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
            </TableRow>))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function LiveMap() {
  const [markers, setMarkers] = useState<any[]>([]);
  useEffect(() => {
    let stop = false;
    async function tick() {
      const { data } = await supabase
        .from("location_logs")
        .select("latitude,longitude,recorded_at,employee_id,employees:employee_id(employee_code,profiles:user_id(full_name))")
        .order("recorded_at", { ascending: false }).limit(200);
      const seen = new Set<string>();
      const m: any[] = [];
      for (const r of data ?? []) {
        if (seen.has(r.employee_id)) continue;
        seen.add(r.employee_id);
        const emp: any = r.employees;
        m.push({ lat: Number(r.latitude), lng: Number(r.longitude),
          label: `${emp?.profiles?.full_name ?? emp?.employee_code ?? "Employee"} · ${new Date(r.recorded_at).toLocaleTimeString()}`,
          color: "#16a34a" });
      }
      if (!stop) setMarkers(m);
    }
    void tick();
    const i = setInterval(tick, 15000);
    return () => { stop = true; clearInterval(i); };
  }, []);
  return (
    <Card><CardHeader><CardTitle className="text-base">Last known location per employee</CardTitle></CardHeader>
    <CardContent>{markers.length === 0 ? <p className="text-sm text-muted-foreground">No location data yet.</p> : <MapView height="500px" markers={markers} />}</CardContent></Card>
  );
}

function Assignments() {
  const [emps, setEmps] = useState<any[]>([]);
  const [locs, setLocs] = useState<any[]>([]);
  const [empId, setEmpId] = useState<string>("");
  const [locId, setLocId] = useState<string>("");
  const [rows, setRows] = useState<any[]>([]);

  async function load() {
    const [e, l, a] = await Promise.all([
      supabase.from("employees").select("id, employee_code, profiles:user_id(full_name)"),
      supabase.from("assigned_locations").select("id, name"),
      supabase.from("employee_assignments").select("*, employees:employee_id(employee_code), assigned_locations(name)").order("created_at", { ascending: false }),
    ]);
    setEmps(e.data ?? []); setLocs(l.data ?? []); setRows(a.data ?? []);
  }
  useEffect(() => { void load(); }, []);

  async function assign() {
    if (!empId || !locId) return;
    const { error } = await supabase.from("employee_assignments").insert({ employee_id: empId, location_id: locId });
    if (error) return toast.error(error.message);
    toast.success("Assigned"); await load();
  }
  async function remove(id: string) { await supabase.from("employee_assignments").delete().eq("id", id); await load(); }

  return (
    <Card><CardHeader><CardTitle className="text-base">Assign locations</CardTitle></CardHeader>
    <CardContent className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[200px]"><Label>Employee</Label>
          <Select value={empId} onValueChange={setEmpId}><SelectTrigger><SelectValue placeholder="Pick employee" /></SelectTrigger>
            <SelectContent>{emps.map((e) => <SelectItem key={e.id} value={e.id}>{(e.profiles as any)?.full_name ?? e.employee_code}</SelectItem>)}</SelectContent></Select>
        </div>
        <div className="min-w-[200px]"><Label>Location</Label>
          <Select value={locId} onValueChange={setLocId}><SelectTrigger><SelectValue placeholder="Pick location" /></SelectTrigger>
            <SelectContent>{locs.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent></Select>
        </div>
        <Button onClick={assign}>Assign</Button>
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>Employee</TableHead><TableHead>Location</TableHead><TableHead>Date</TableHead><TableHead /></TableRow></TableHeader>
        <TableBody>{rows.map((r) => (
          <TableRow key={r.id}>
            <TableCell>{(r.employees as any)?.employee_code}</TableCell>
            <TableCell>{(r.assigned_locations as any)?.name}</TableCell>
            <TableCell>{r.assigned_date}</TableCell>
            <TableCell><Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
          </TableRow>))}
        </TableBody>
      </Table>
    </CardContent></Card>
  );
}
