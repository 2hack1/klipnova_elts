import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
import { Plus, Users, MapPin, Activity, Trash2, Eye, Crosshair, ShieldCheck, KeyRound, Power } from "lucide-react";
import { getCurrentPosition, formatDuration } from "@/lib/geo";
import { useServerFn } from "@tanstack/react-start";
import {
  adminCreateEmployee, superCreateAccount, superSetActive, superResetPassword, listAccounts,
} from "@/lib/admin-users.functions";

export const Route = createFileRoute("/_authenticated/admin")({ component: AdminPanel });

type Profile = { id: string; full_name: string | null; phone: string | null };

function AdminPanel() {
  const { isAdmin, isSuperAdmin, loading } = useAuth();
  const nav = useNavigate();
  useEffect(() => { if (!loading && !isAdmin) nav({ to: "/dashboard" }); }, [isAdmin, loading, nav]);
  if (!isAdmin) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{isSuperAdmin ? "Super Admin Panel" : "Admin Panel"}</h1>
        <p className="text-sm text-muted-foreground">
          {isSuperAdmin
            ? "Full control over accounts, employees, locations and tracking."
            : "Manage your employees, their locations, assignments and live tracking."}
        </p>
      </div>
      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview"><Activity className="h-4 w-4" />Overview</TabsTrigger>
          {isSuperAdmin && <TabsTrigger value="accounts"><ShieldCheck className="h-4 w-4" />Accounts</TabsTrigger>}
          <TabsTrigger value="employees"><Users className="h-4 w-4" />Employees</TabsTrigger>
          <TabsTrigger value="locations"><MapPin className="h-4 w-4" />Locations</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="live">Live Map</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><Overview /></TabsContent>
        {isSuperAdmin && <TabsContent value="accounts"><AccountsTab /></TabsContent>}
        <TabsContent value="employees"><EmployeesTab /></TabsContent>
        <TabsContent value="locations"><LocationsTab /></TabsContent>
        <TabsContent value="assignments"><Assignments /></TabsContent>
        <TabsContent value="live"><LiveMap /></TabsContent>
      </Tabs>
    </div>
  );
}

function AccountsTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", full_name: "", role: "admin" as "admin" | "super_admin" });
  const [pwRow, setPwRow] = useState<any | null>(null);
  const [newPw, setNewPw] = useState("");

  const fetchAccounts = useServerFn(listAccounts);
  const createAcc = useServerFn(superCreateAccount);
  const setActive = useServerFn(superSetActive);
  const resetPw = useServerFn(superResetPassword);

  async function load() {
    try { setRows(await fetchAccounts()); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed to load"); }
  }
  useEffect(() => { void load(); }, []);

  async function create() {
    if (!form.email || form.password.length < 8) return toast.error("Email and password (min 8) required");
    setBusy(true);
    try {
      await createAcc({ data: form });
      toast.success(`${form.role === "super_admin" ? "Super Admin" : "Admin"} created`);
      setForm({ email: "", password: "", full_name: "", role: "admin" });
      await load();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setBusy(false); }
  }

  async function toggleActive(u: any) {
    try {
      await setActive({ data: { user_id: u.id, active: u.banned } });
      toast.success(u.banned ? "Activated" : "Deactivated");
      await load();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  }

  async function doReset() {
    if (!pwRow || newPw.length < 8) return toast.error("Password must be at least 8 characters");
    try {
      await resetPw({ data: { user_id: pwRow.id, password: newPw } });
      toast.success("Password reset");
      setPwRow(null); setNewPw("");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-base">Create account</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-5">
            <div className="sm:col-span-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>Full name</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
            <div><Label>Password</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
            <div><Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin (User)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-3"><Button onClick={create} disabled={busy}>{busy ? "Creating…" : "Create account"}</Button></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">All accounts ({rows.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Email</TableHead><TableHead>Name</TableHead><TableHead>Roles</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>{rows.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-mono text-xs">{u.email}</TableCell>
                <TableCell>{u.full_name ?? "—"}</TableCell>
                <TableCell><div className="flex flex-wrap gap-1">{u.roles.map((r: string) => <Badge key={r} variant="outline">{r}</Badge>)}</div></TableCell>
                <TableCell>{u.banned ? <Badge variant="destructive">Deactivated</Badge> : <Badge>Active</Badge>}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="outline" onClick={() => setPwRow(u)}><KeyRound className="h-4 w-4" />Reset PW</Button>
                    <Button size="sm" variant={u.banned ? "default" : "destructive"} onClick={() => toggleActive(u)}>
                      <Power className="h-4 w-4" />{u.banned ? "Activate" : "Deactivate"}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-6">No accounts.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!pwRow} onOpenChange={(o) => !o && (setPwRow(null), setNewPw(""))}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reset password for {pwRow?.email}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>New password</Label><Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} /></div>
            <Button className="w-full" onClick={doReset}>Update password</Button>
          </div>
        </DialogContent>
      </Dialog>
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

// Load profiles for a set of user ids and return a map
async function loadProfileMap(userIds: string[]): Promise<Record<string, Profile>> {
  const ids = Array.from(new Set(userIds.filter(Boolean)));
  if (ids.length === 0) return {};
  const { data } = await supabase.from("profiles").select("id, full_name, phone").in("id", ids);
  const map: Record<string, Profile> = {};
  for (const p of data ?? []) map[p.id] = p as Profile;
  return map;
}

function EmployeesTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<any | null>(null);
  const [form, setForm] = useState({ email: "", password: "", full_name: "", employee_code: "", department: "", designation: "", phone: "" });
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data } = await supabase.from("employees").select("*").order("created_at", { ascending: false });
    const list = data ?? [];
    setRows(list);
    setProfiles(await loadProfileMap(list.map((r) => r.user_id)));
  }
  useEffect(() => { void load(); }, []);

  const createEmployee = useServerFn(adminCreateEmployee);
  async function create() {
    if (!form.email || !form.password || !form.employee_code) return toast.error("Email, password and code required");
    if (form.password.length < 8) return toast.error("Password must be at least 8 characters");
    setBusy(true);
    try {
      await createEmployee({ data: {
        email: form.email, password: form.password,
        full_name: form.full_name, phone: form.phone,
        employee_code: form.employee_code,
        department: form.department, designation: form.designation,
      }});
      toast.success("Employee created");
      setOpen(false);
      setForm({ email: "", password: "", full_name: "", employee_code: "", department: "", designation: "", phone: "" });
      await load();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setBusy(false); }
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
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              </div>
              <div><Label>Temporary password</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Employee code</Label><Input value={form.employee_code} onChange={(e) => setForm({ ...form, employee_code: e.target.value })} /></div>
                <div><Label>Department</Label><Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
              </div>
              <div><Label>Designation</Label><Input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} /></div>
              <Button className="w-full" onClick={create} disabled={busy}>{busy ? "Creating…" : "Create"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Dept</TableHead><TableHead>Designation</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>{rows.map((r) => {
            const p = profiles[r.user_id];
            return (
              <TableRow key={r.id}>
                <TableCell className="font-mono">{r.employee_code}</TableCell>
                <TableCell>{p?.full_name ?? "—"}</TableCell>
                <TableCell>{r.department ?? "—"}</TableCell>
                <TableCell>{r.designation ?? "—"}</TableCell>
                <TableCell><Badge variant="outline">{r.status}</Badge></TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" onClick={() => setDetail({ ...r, profile: p })}>
                    <Eye className="h-4 w-4" />Show
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
          {rows.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-6">No employees yet.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>

      <EmployeeDetailDialog employee={detail} onClose={() => setDetail(null)} />
    </Card>
  );
}

function EmployeeDetailDialog({ employee, onClose }: { employee: any | null; onClose: () => void }) {
  const [data, setData] = useState<any | null>(null);
  useEffect(() => {
    if (!employee) { setData(null); return; }
    void (async () => {
      const empId = employee.id;
      const today = new Date().toISOString().slice(0, 10);
      const [att, sessions, visits, summary, lastLoc] = await Promise.all([
        supabase.from("attendance").select("*").eq("employee_id", empId).order("work_date", { ascending: false }).limit(10),
        supabase.from("travel_sessions").select("*").eq("employee_id", empId).order("started_at", { ascending: false }).limit(10),
        supabase.from("visit_history").select("*, assigned_locations(name)").eq("employee_id", empId).order("visited_at", { ascending: false }).limit(10),
        supabase.from("daily_travel_summary").select("*").eq("employee_id", empId).order("work_date", { ascending: false }).limit(7),
        supabase.from("location_logs").select("latitude,longitude,recorded_at").eq("employee_id", empId).order("recorded_at", { ascending: false }).limit(1).maybeSingle(),
      ]);
      const totalKm = (sessions.data ?? []).reduce((s, t: any) => s + Number(t.total_km ?? 0), 0);
      const totalSec = (sessions.data ?? []).reduce((s, t: any) => s + Number(t.duration_seconds ?? 0), 0);
      const presentToday = (att.data ?? []).some((a) => a.work_date === today);
      setData({
        attendance: att.data ?? [], sessions: sessions.data ?? [], visits: visits.data ?? [],
        summary: summary.data ?? [], lastLoc: lastLoc.data, totalKm, totalSec, presentToday,
      });
    })();
  }, [employee]);

  if (!employee) return null;
  const p = employee.profile;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{p?.full_name ?? employee.employee_code} <span className="text-muted-foreground font-normal text-sm">({employee.employee_code})</span></DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Info label="Department" value={employee.department} />
            <Info label="Designation" value={employee.designation} />
            <Info label="Phone" value={p?.phone} />
            <Info label="Status" value={employee.status} />
            <Info label="Joined" value={employee.created_at ? new Date(employee.created_at).toLocaleDateString() : null} />
            <Info label="Present today" value={data?.presentToday ? "Yes" : "No"} />
          </div>

          {data && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Stat label="Total distance" value={`${data.totalKm.toFixed(2)} km`} />
              <Stat label="Total time" value={formatDuration(data.totalSec)} />
              <Stat label="Sessions" value={data.sessions.length} />
              <Stat label="Visits" value={data.visits.length} />
            </div>
          )}

          {data?.lastLoc && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Last known location</h3>
              <MapView height="220px" markers={[{ lat: Number(data.lastLoc.latitude), lng: Number(data.lastLoc.longitude), label: new Date(data.lastLoc.recorded_at).toLocaleString() }]} />
            </div>
          )}

          <Section title="Recent travel sessions">
            {data?.sessions.length ? (
              <Table>
                <TableHeader><TableRow><TableHead>Started</TableHead><TableHead>Ended</TableHead><TableHead>Distance</TableHead><TableHead>Duration</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>{data.sessions.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell>{new Date(s.started_at).toLocaleString()}</TableCell>
                    <TableCell>{s.ended_at ? new Date(s.ended_at).toLocaleString() : "—"}</TableCell>
                    <TableCell>{Number(s.total_km ?? 0).toFixed(2)} km</TableCell>
                    <TableCell>{formatDuration(Number(s.duration_seconds ?? 0))}</TableCell>
                    <TableCell><Badge variant="outline">{s.status}</Badge></TableCell>
                  </TableRow>))}
                </TableBody>
              </Table>
            ) : <Empty />}
          </Section>

          <Section title="Recent visits">
            {data?.visits.length ? (
              <Table>
                <TableHeader><TableRow><TableHead>Location</TableHead><TableHead>Visited at</TableHead><TableHead>Notes</TableHead></TableRow></TableHeader>
                <TableBody>{data.visits.map((v: any) => (
                  <TableRow key={v.id}>
                    <TableCell>{v.assigned_locations?.name ?? "—"}</TableCell>
                    <TableCell>{new Date(v.visited_at).toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">{v.notes ?? "—"}</TableCell>
                  </TableRow>))}
                </TableBody>
              </Table>
            ) : <Empty />}
          </Section>

          <Section title="Recent attendance">
            {data?.attendance.length ? (
              <Table>
                <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Punch in</TableHead><TableHead>Punch out</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>{data.attendance.map((a: any) => (
                  <TableRow key={a.id}>
                    <TableCell>{a.work_date}</TableCell>
                    <TableCell>{a.punch_in_at ? new Date(a.punch_in_at).toLocaleTimeString() : "—"}</TableCell>
                    <TableCell>{a.punch_out_at ? new Date(a.punch_out_at).toLocaleTimeString() : "—"}</TableCell>
                    <TableCell><Badge variant="outline">{a.status}</Badge></TableCell>
                  </TableRow>))}
                </TableBody>
              </Table>
            ) : <Empty />}
          </Section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Info({ label, value }: { label: string; value: any }) {
  return <div><div className="text-xs text-muted-foreground">{label}</div><div className="font-medium">{value ?? "—"}</div></div>;
}
function Stat({ label, value }: { label: string; value: any }) {
  return <Card><CardContent className="p-3"><div className="text-xs text-muted-foreground">{label}</div><div className="text-lg font-bold mt-0.5">{value}</div></CardContent></Card>;
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><h3 className="text-sm font-semibold mb-2">{title}</h3>{children}</div>;
}
function Empty() { return <p className="text-sm text-muted-foreground">No records.</p>; }

function LocationsTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", address: "", latitude: "", longitude: "", radius_meter: 100 });
  const [open, setOpen] = useState(false);

  async function load() {
    const { data } = await supabase.from("assigned_locations").select("*").order("created_at", { ascending: false });
    setRows(data ?? []);
  }
  useEffect(() => { void load(); }, []);

  async function useMyLocation() {
    try {
      const pos = await getCurrentPosition();
      setForm((f) => ({ ...f, latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) }));
      toast.success("Captured current location");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Could not get location"); }
  }

  async function create() {
    if (!form.name || !form.latitude || !form.longitude) return toast.error("Name and coordinates required");
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
              <Button type="button" variant="outline" size="sm" onClick={useMyLocation}>
                <Crosshair className="h-4 w-4" />Use my current location
              </Button>
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
  const [list, setList] = useState<{ name: string; code: string; status: "in" | "out" | "none"; at?: string }[]>([]);
  useEffect(() => {
    let stop = false;
    async function tick() {
      const today = new Date().toISOString().slice(0, 10);
      const [{ data: logs }, { data: emps }, { data: att }] = await Promise.all([
        supabase.from("location_logs").select("latitude,longitude,recorded_at,employee_id").order("recorded_at", { ascending: false }).limit(1000),
        supabase.from("employees").select("id, user_id, employee_code"),
        supabase.from("attendance").select("employee_id, punch_in_at, punch_out_at").eq("work_date", today),
      ]);
      const profileMap = await loadProfileMap((emps ?? []).map((e) => e.user_id));
      const empMap = new Map((emps ?? []).map((e) => [e.id, e]));
      const attMap = new Map((att ?? []).map((a: any) => [a.employee_id, a]));

      // latest location per employee
      const seen = new Set<string>();
      const latest: any[] = [];
      for (const r of logs ?? []) {
        if (seen.has(r.employee_id)) continue;
        seen.add(r.employee_id);
        latest.push(r);
      }

      function statusOf(empId: string): "in" | "out" | "none" {
        const a = attMap.get(empId) as any;
        if (!a) return "none";
        if (a.punch_in_at && !a.punch_out_at) return "in";
        if (a.punch_out_at) return "out";
        return "none";
      }
      function colorOf(s: "in" | "out" | "none") {
        return s === "in" ? "#16a34a" : s === "out" ? "#dc2626" : "#64748b";
      }

      const m = latest.map((r) => {
        const e = empMap.get(r.employee_id) as any;
        const name = e ? (profileMap[e.user_id]?.full_name ?? e.employee_code) : "Employee";
        const s = statusOf(r.employee_id);
        const tag = s === "in" ? "🟢 Punched in" : s === "out" ? "🔴 Punched out" : "⚪ No attendance";
        return {
          lat: Number(r.latitude),
          lng: Number(r.longitude),
          label: `<b>${name}</b><br/>${tag}<br/><span style="opacity:.7">${new Date(r.recorded_at).toLocaleTimeString()}</span>`,
          color: colorOf(s),
        };
      });

      const roster = (emps ?? []).map((e: any) => {
        const a = attMap.get(e.id) as any;
        const s = statusOf(e.id);
        return {
          name: profileMap[e.user_id]?.full_name ?? e.employee_code,
          code: e.employee_code,
          status: s,
          at: a ? (s === "in" ? a.punch_in_at : a.punch_out_at) ?? undefined : undefined,
        };
      }).sort((a, b) => (a.status === b.status ? 0 : a.status === "in" ? -1 : 1));

      if (!stop) { setMarkers(m); setList(roster); }
    }
    void tick();
    const i = setInterval(tick, 15000);
    return () => { stop = true; clearInterval(i); };
  }, []);

  const inCount = list.filter((l) => l.status === "in").length;
  const outCount = list.filter((l) => l.status === "out").length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Live employee map</CardTitle>
        <div className="flex flex-wrap gap-3 text-xs mt-1">
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-600 inline-block" />Punched in: <b>{inCount}</b></span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-600 inline-block" />Punched out: <b>{outCount}</b></span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-slate-500 inline-block" />No attendance: <b>{list.length - inCount - outCount}</b></span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {list.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {list.map((l) => (
              <Badge key={l.code} variant="outline" className="gap-1.5">
                <span className={`h-2 w-2 rounded-full inline-block ${l.status === "in" ? "bg-emerald-600" : l.status === "out" ? "bg-red-600" : "bg-slate-500"}`} />
                {l.name} <span className="text-muted-foreground">({l.code})</span>
              </Badge>
            ))}
          </div>
        )}
        {markers.length === 0
          ? <p className="text-sm text-muted-foreground">No location data yet. Employees must start tracking to appear here.</p>
          : <MapView height="500px" markers={markers} />}
      </CardContent>
    </Card>
  );
}

function Assignments() {
  const [emps, setEmps] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [locs, setLocs] = useState<any[]>([]);
  const [empId, setEmpId] = useState<string>("");
  const [locId, setLocId] = useState<string>("");
  const [rows, setRows] = useState<any[]>([]);

  async function load() {
    const [e, l, a] = await Promise.all([
      supabase.from("employees").select("id, user_id, employee_code, department").order("employee_code"),
      supabase.from("assigned_locations").select("id, name, address").order("name"),
      supabase.from("employee_assignments").select("*, employees:employee_id(employee_code, user_id), assigned_locations(name)").order("created_at", { ascending: false }),
    ]);
    const employees = e.data ?? [];
    setEmps(employees);
    setLocs(l.data ?? []);
    setRows(a.data ?? []);
    const allUserIds = [
      ...employees.map((x) => x.user_id),
      ...(a.data ?? []).map((x: any) => x.employees?.user_id).filter(Boolean),
    ];
    setProfiles(await loadProfileMap(allUserIds));
  }
  useEffect(() => { void load(); }, []);

  const empOptions = useMemo(() => emps.map((e) => ({
    id: e.id,
    label: `${profiles[e.user_id]?.full_name ?? e.employee_code} (${e.employee_code})${e.department ? " · " + e.department : ""}`,
  })), [emps, profiles]);

  async function assign() {
    if (!empId || !locId) return toast.error("Pick an employee and a location");
    const { error } = await supabase.from("employee_assignments").insert({ employee_id: empId, location_id: locId });
    if (error) return toast.error(error.message);
    toast.success("Assigned"); setEmpId(""); setLocId(""); await load();
  }
  async function remove(id: string) { await supabase.from("employee_assignments").delete().eq("id", id); await load(); }

  return (
    <Card><CardHeader><CardTitle className="text-base">Assign locations to employees</CardTitle></CardHeader>
    <CardContent className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[240px] flex-1"><Label>Employee</Label>
          <Select value={empId} onValueChange={setEmpId}>
            <SelectTrigger><SelectValue placeholder={emps.length ? "Pick employee" : "No employees yet"} /></SelectTrigger>
            <SelectContent>{empOptions.map((o) => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="min-w-[240px] flex-1"><Label>Location</Label>
          <Select value={locId} onValueChange={setLocId}>
            <SelectTrigger><SelectValue placeholder={locs.length ? "Pick location" : "No locations yet"} /></SelectTrigger>
            <SelectContent>{locs.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}{l.address ? ` — ${l.address}` : ""}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Button onClick={assign} disabled={!empId || !locId}>Assign</Button>
      </div>

      <Table>
        <TableHeader><TableRow><TableHead>Employee</TableHead><TableHead>Location</TableHead><TableHead>Date</TableHead><TableHead /></TableRow></TableHeader>
        <TableBody>{rows.map((r) => {
          const emp = r.employees;
          const name = emp ? (profiles[emp.user_id]?.full_name ?? emp.employee_code) : "—";
          return (
            <TableRow key={r.id}>
              <TableCell>{name} <span className="text-xs text-muted-foreground">({emp?.employee_code})</span></TableCell>
              <TableCell>{r.assigned_locations?.name ?? "—"}</TableCell>
              <TableCell>{r.assigned_date}</TableCell>
              <TableCell><Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
            </TableRow>
          );
        })}
        {rows.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-6">No assignments yet.</TableCell></TableRow>}
        </TableBody>
      </Table>
    </CardContent></Card>
  );
}
