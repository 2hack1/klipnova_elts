import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MapView } from "@/components/MapView";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Plus,
  Users,
  MapPin,
  Activity,
  Trash2,
  Eye,
  Crosshair,
  ShieldCheck,
  KeyRound,
  Power,
  Download,
  CalendarDays,
  History,
} from "lucide-react";
import { getCurrentPosition, formatDuration } from "@/lib/geo";
import { useServerFn } from "@tanstack/react-start";
import {
  adminCreateEmployee,
  superCreateAccount,
  superSetActive,
  superResetPassword,
  listAccounts,
  adminSetEmployeeActive,
} from "@/lib/admin-users.functions";

export const Route = createFileRoute("/_authenticated/admin")({ component: AdminPanel });

type Profile = { id: string; full_name: string | null; phone: string | null };

function AdminPanel() {
  const { isAdmin, isSuperAdmin, loading } = useAuth();
  const nav = useNavigate();
  useEffect(() => {
    if (!loading && !isAdmin) nav({ to: "/dashboard" });
  }, [isAdmin, loading, nav]);
  if (!isAdmin) return null;

  if (isSuperAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Super Admin Panel</h1>
          <p className="text-sm text-muted-foreground">
            Manage administrative accounts, create new admins and super admins, and track who
            created them.
          </p>
        </div>
        <AccountsTab />
      </div>
    );
  }

  // Normal admin panel
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-sm text-muted-foreground">
          Manage your employees, their locations, assignments and live tracking.
        </p>
      </div>
      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="employees">
            <Users className="h-4 w-4" />
            Employees
          </TabsTrigger>
          <TabsTrigger value="locations">
            <MapPin className="h-4 w-4" />
            Locations
          </TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="reports">
            <History className="h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="live">Live Map</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Overview />
        </TabsContent>
        <TabsContent value="employees">
          <EmployeesTab />
        </TabsContent>
        <TabsContent value="locations">
          <LocationsTab />
        </TabsContent>
        <TabsContent value="assignments">
          <Assignments />
        </TabsContent>
        <TabsContent value="reports">
          <ReportsTab />
        </TabsContent>
        <TabsContent value="live">
          <LiveMap />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AccountsTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "admin" as "admin" | "super_admin",
  });
  const [pwRow, setPwRow] = useState<any | null>(null);
  const [newPw, setNewPw] = useState("");

  const fetchAccounts = useServerFn(listAccounts);
  const createAcc = useServerFn(superCreateAccount);
  const setActive = useServerFn(superSetActive);
  const resetPw = useServerFn(superResetPassword);

  async function load() {
    try {
      setRows(await fetchAccounts());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
    }
  }
  useEffect(() => {
    void load();
  }, []);

  async function create() {
    if (!form.email || form.password.length < 8)
      return toast.error("Email and password (min 8) required");
    setBusy(true);
    try {
      await createAcc({ data: form });
      toast.success(`${form.role === "super_admin" ? "Super Admin" : "Admin"} created`);
      setForm({ email: "", password: "", full_name: "", role: "admin" });
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(u: any) {
    try {
      await setActive({ data: { user_id: u.id, active: u.banned } });
      toast.success(u.banned ? "Activated" : "Deactivated");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  async function doReset() {
    if (!pwRow || newPw.length < 8) return toast.error("Password must be at least 8 characters");
    try {
      await resetPw({ data: { user_id: pwRow.id, password: newPw } });
      toast.success("Password reset");
      setPwRow(null);
      setNewPw("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  const adminRows = useMemo(() => {
    return rows.filter((u) => u.roles.includes("admin") && !u.roles.includes("super_admin"));
  }, [rows]);

  const superAdminRows = useMemo(() => {
    return rows.filter((u) => u.roles.includes("super_admin"));
  }, [rows]);

  function renderAccountsTable(accounts: any[], title: string) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {title} ({accounts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop Table view */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-mono text-xs">{u.email}</TableCell>
                    <TableCell>{u.full_name ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {u.created_by_detail ?? "System / Seed"}
                    </TableCell>
                    <TableCell>
                      {u.banned ? (
                        <Badge variant="destructive">Deactivated</Badge>
                      ) : (
                        <Badge>Active</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="outline" onClick={() => setPwRow(u)}>
                          <KeyRound className="h-4 w-4" />
                          Reset PW
                        </Button>
                        <Button
                          size="sm"
                          variant={u.banned ? "default" : "destructive"}
                          onClick={() => toggleActive(u)}
                        >
                          <Power className="h-4 w-4" />
                          {u.banned ? "Activate" : "Deactivate"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {accounts.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-sm text-muted-foreground py-6"
                    >
                      No accounts found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile responsive cards list */}
          <div className="grid gap-3 md:hidden">
            {accounts.map((u) => (
              <div key={u.id} className="rounded-lg border p-4 space-y-3 bg-card">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{u.full_name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                  </div>
                  <div>
                    {u.banned ? (
                      <Badge variant="destructive">Deactivated</Badge>
                    ) : (
                      <Badge>Active</Badge>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs border-t pt-2.5">
                  <div>
                    <span className="text-muted-foreground">Created By: </span>
                    <span className="font-medium text-foreground">
                      {u.created_by_detail ?? "System / Seed"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs py-1 h-8"
                    onClick={() => setPwRow(u)}
                  >
                    <KeyRound className="h-3.5 w-3.5 mr-1" />
                    Reset PW
                  </Button>
                  <Button
                    size="sm"
                    variant={u.banned ? "default" : "destructive"}
                    className="flex-1 text-xs py-1 h-8"
                    onClick={() => toggleActive(u)}
                  >
                    <Power className="h-3.5 w-3.5 mr-1" />
                    {u.banned ? "Activate" : "Deactivate"}
                  </Button>
                </div>
              </div>
            ))}
            {accounts.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-6">
                No accounts found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Super Admin Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5 flex flex-col justify-center">
            <span className="text-xs text-muted-foreground font-medium">Total Administrators Registered</span>
            <span className="text-2xl font-bold mt-1 text-primary">{adminRows.length}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex flex-col justify-center">
            <span className="text-xs text-muted-foreground font-medium">Total Super Administrators Registered</span>
            <span className="text-2xl font-bold mt-1 text-primary">{superAdminRows.length}</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create Admin / Super Admin Account</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-5">
            <div className="sm:col-span-2 md:col-span-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Full name</Label>
              <Input
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-3">
            <Button onClick={create} disabled={busy}>
              {busy ? "Creating…" : "Create account"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {renderAccountsTable(adminRows, "Admin Accounts")}
      {renderAccountsTable(superAdminRows, "Super Admin Accounts")}

      <Dialog open={!!pwRow} onOpenChange={(o) => !o && (setPwRow(null), setNewPw(""))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset password for {pwRow?.email}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>New password</Label>
              <Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
            </div>
            <Button className="w-full" onClick={doReset}>
              Update password
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Overview() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    employees: 0,
    presentToday: 0,
    activeSessions: 0,
    visitsToday: 0,
    createdByMe: 0,
    activeCreatedByMe: 0,
  });
  useEffect(() => {
    void (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [e, a, s, v, byMe, activeByMe] = await Promise.all([
        supabase.from("employees").select("*", { count: "exact", head: true }),
        supabase
          .from("attendance")
          .select("*", { count: "exact", head: true })
          .eq("work_date", today),
        supabase
          .from("travel_sessions")
          .select("*", { count: "exact", head: true })
          .eq("status", "active"),
        supabase
          .from("visit_history")
          .select("*", { count: "exact", head: true })
          .gte("visited_at", today + "T00:00:00"),
        user
          ? supabase
              .from("employees")
              .select("*", { count: "exact", head: true })
              .eq("created_by_admin", user.id)
          : Promise.resolve({ count: 0 }),
        user
          ? supabase
              .from("employees")
              .select("*", { count: "exact", head: true })
              .eq("created_by_admin", user.id)
              .eq("status", "active")
          : Promise.resolve({ count: 0 }),
      ]);
      setStats({
        employees: e.count ?? 0,
        presentToday: a.count ?? 0,
        activeSessions: s.count ?? 0,
        visitsToday: v.count ?? 0,
        createdByMe: byMe.count ?? 0,
        activeCreatedByMe: activeByMe.count ?? 0,
      });
    })();
  }, [user]);
  const items = [
    { l: "Total Employees", v: stats.employees },
    { l: "Employees Created by You", v: stats.createdByMe },
    { l: "Your Active Employees", v: stats.activeCreatedByMe },
    { l: "Total Employees Working (Started Today)", v: stats.presentToday },
    { l: "Active Travel Sessions", v: stats.activeSessions },
    { l: "Visits Today", v: stats.visitsToday },
  ];
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((i) => (
        <Card key={i.l}>
          <CardContent className="p-5">
            <div className="text-xs text-muted-foreground">{i.l}</div>
            <div className="mt-1 text-3xl font-bold text-primary">{i.v}</div>
          </CardContent>
        </Card>
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
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    employee_code: "",
    department: "",
    designation: "",
    phone: "",
    address: "",
    joining_date: new Date().toISOString().slice(0, 10),
  });
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data } = await supabase
      .from("employees")
      .select("*")
      .order("created_at", { ascending: false });
    const list = data ?? [];
    setRows(list);
    setProfiles(await loadProfileMap(list.map((r) => r.user_id)));
  }
  useEffect(() => {
    void load();
  }, []);

  const createEmployee = useServerFn(adminCreateEmployee);
  async function create() {
    if (!form.email || !form.password || !form.employee_code)
      return toast.error("Email, password and code required");
    if (form.password.length < 8) return toast.error("Password must be at least 8 characters");
    setBusy(true);
    try {
      await createEmployee({
        data: {
          email: form.email,
          password: form.password,
          full_name: form.full_name,
          phone: form.phone,
          employee_code: form.employee_code,
          department: form.department,
          designation: form.designation,
          address: form.address,
          joining_date: form.joining_date,
        },
      });
      toast.success("Employee created");
      setOpen(false);
      setForm({
        email: "",
        password: "",
        full_name: "",
        employee_code: "",
        department: "",
        designation: "",
        phone: "",
        address: "",
        joining_date: new Date().toISOString().slice(0, 10),
      });
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Employees ({rows.length})</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Add employee
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New employee</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Full name</Label>
                <Input
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Temporary password</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Employee code</Label>
                  <Input
                    value={form.employee_code}
                    onChange={(e) => setForm({ ...form, employee_code: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Department</Label>
                  <Input
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Designation</Label>
                  <Input
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Joining Date</Label>
                  <Input
                    type="date"
                    value={form.joining_date}
                    onChange={(e) => setForm({ ...form, joining_date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  placeholder="Employee residence address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <Button className="w-full" onClick={create} disabled={busy}>
                {busy ? "Creating…" : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Dept</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => {
              const p = profiles[r.user_id];
              return (
                <TableRow key={r.id}>
                  <TableCell
                    className="font-mono cursor-pointer hover:underline text-primary"
                    onClick={() => setDetail({ ...r, profile: p })}
                  >
                    {r.employee_code}
                  </TableCell>
                  <TableCell
                    className="cursor-pointer hover:underline font-semibold"
                    onClick={() => setDetail({ ...r, profile: p })}
                  >
                    {p?.full_name ?? "—"}
                  </TableCell>
                  <TableCell>{r.department ?? "—"}</TableCell>
                  <TableCell>{r.designation ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{r.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDetail({ ...r, profile: p })}
                    >
                      <Eye className="h-4 w-4" />
                      Show
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-6">
                  No employees yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <EmployeeDetailDialog employee={detail} onClose={() => setDetail(null)} onReload={load} />
    </Card>
  );
}

function EmployeeDetailDialog({
  employee,
  onClose,
  onReload,
}: {
  employee: any | null;
  onClose: () => void;
  onReload?: () => void;
}) {
  const [data, setData] = useState<any | null>(null);
  const [toggling, setToggling] = useState(false);
  const toggleActive = useServerFn(adminSetEmployeeActive);

  // Targets state
  const [target, setTarget] = useState<any>(null);
  const [targetMonth, setTargetMonth] = useState<string>(() => new Date().toISOString().slice(0, 7));
  const [showTargetForm, setShowTargetForm] = useState(false);
  const [targetForm, setTargetForm] = useState({
    targetMoney: "0",
    targetCompanies: "0",
    achievedMoney: "0",
    achievedCompanies: "0",
  });

  async function fetchTarget(monthStr: string) {
    if (!employee) return;
    const firstDay = `${monthStr}-01`;
    const { data: tData } = await supabase
      .from("employee_targets")
      .select("*")
      .eq("employee_id", employee.id)
      .eq("target_month", firstDay)
      .maybeSingle();

    setTarget(tData);
    if (tData) {
      setTargetForm({
        targetMoney: String(tData.target_money),
        targetCompanies: String(tData.target_companies),
        achievedMoney: String(tData.achieved_money),
        achievedCompanies: String(tData.achieved_companies),
      });
    } else {
      setTargetForm({
        targetMoney: "0",
        targetCompanies: "0",
        achievedMoney: "0",
        achievedCompanies: "0",
      });
    }
  }

  useEffect(() => {
    if (employee) {
      void fetchTarget(targetMonth);
    }
  }, [employee, targetMonth]);

  async function saveTarget() {
    try {
      const monthStart = `${targetMonth}-01`;
      const { error } = await supabase.from("employee_targets" as any).upsert(
        {
          employee_id: employee.id,
          target_month: monthStart,
          target_money: Number(targetForm.targetMoney),
          target_companies: Number(targetForm.targetCompanies),
          achieved_money: Number(targetForm.achievedMoney),
          achieved_companies: Number(targetForm.achievedCompanies),
        },
        { onConflict: "employee_id,target_month" },
      );
      if (error) throw error;
      toast.success("Targets saved successfully");
      setShowTargetForm(false);
      void fetchTarget(targetMonth);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save target");
    }
  }

  useEffect(() => {
    if (!employee) {
      setData(null);
      return;
    }
    void (async () => {
      const empId = employee.id;
      const today = new Date().toISOString().slice(0, 10);
      const [att, sessions, visits, summary, lastLoc] = await Promise.all([
        supabase
          .from("attendance")
          .select("*")
          .eq("employee_id", empId)
          .order("work_date", { ascending: false })
          .limit(10),
        supabase
          .from("travel_sessions")
          .select("*")
          .eq("employee_id", empId)
          .order("started_at", { ascending: false })
          .limit(10),
        supabase
          .from("visit_history")
          .select("*, assigned_locations(name)")
          .eq("employee_id", empId)
          .order("visited_at", { ascending: false })
          .limit(10),
        supabase
          .from("daily_travel_summary")
          .select("*")
          .eq("employee_id", empId)
          .order("work_date", { ascending: false })
          .limit(7),
        supabase
          .from("location_logs")
          .select("latitude,longitude,recorded_at")
          .eq("employee_id", empId)
          .order("recorded_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      const totalKm = (sessions.data ?? []).reduce((s, t: any) => s + Number(t.total_km ?? 0), 0);
      const totalSec = (sessions.data ?? []).reduce(
        (s, t: any) => s + Number(t.duration_seconds ?? 0),
        0,
      );
      const presentToday = (att.data ?? []).some((a) => a.work_date === today);
      setData({
        attendance: att.data ?? [],
        sessions: sessions.data ?? [],
        visits: visits.data ?? [],
        summary: summary.data ?? [],
        lastLoc: lastLoc.data,
        totalKm,
        totalSec,
        presentToday,
      });
    })();
  }, [employee]);

  if (!employee) return null;
  const p = employee.profile;

  async function handleToggleActive() {
    setToggling(true);
    try {
      const isCurrentlyActive = employee.status === "active";
      await toggleActive({ employee_id: employee.id, active: !isCurrentlyActive });
      toast.success(!isCurrentlyActive ? "Employee activated" : "Employee deactivated");
      onClose();
      if (onReload) onReload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to toggle status");
    } finally {
      setToggling(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-3 pr-6">
          <div>
            <DialogTitle className="text-xl">
              {p?.full_name ?? employee.employee_code}{" "}
              <span className="text-muted-foreground font-normal text-sm">
                ({employee.employee_code})
              </span>
            </DialogTitle>
          </div>
          <Button
            variant={employee.status === "active" ? "destructive" : "default"}
            size="sm"
            disabled={toggling}
            onClick={handleToggleActive}
          >
            <Power className="h-4 w-4 mr-2" />
            {employee.status === "active" ? "Deactivate" : "Activate"}
          </Button>
        </DialogHeader>
        <div className="space-y-5 pt-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Info label="Department" value={employee.department} />
            <Info label="Designation" value={employee.designation} />
            <Info label="Phone" value={p?.phone} />
            <Info label="Status" value={employee.status} />
            <Info
              label="Joining Date"
              value={
                employee.joining_date
                  ? new Date(employee.joining_date).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "—"
              }
            />
            <Info label="Present today" value={data?.presentToday ? "Yes" : "No"} />
            <div className="col-span-2">
              <Info label="Address" value={employee.address} />
            </div>
          </div>

          {data && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Stat label="Total distance" value={`${data.totalKm.toFixed(2)} km`} />
              <Stat label="Total time" value={formatDuration(data.totalSec)} />
              <Stat label="Sessions" value={data.sessions.length} />
              <Stat label="Visits" value={data.visits.length} />
            </div>
          )}

          {/* Monthly Targets & Performance management */}
          <Section title="Targets & Performance">
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Month:</Label>
                    <Input
                      type="month"
                      value={targetMonth}
                      onChange={(e) => setTargetMonth(e.target.value)}
                      className="h-8 w-40 text-xs py-1"
                    />
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setShowTargetForm(!showTargetForm)}>
                    {showTargetForm ? "Hide Form" : target ? "Edit Targets" : "Set Targets"}
                  </Button>
                </div>

                {showTargetForm && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 border p-3 rounded-lg bg-accent/20">
                    <div>
                      <Label className="text-xs">Revenue Target</Label>
                      <Input
                        type="number"
                        value={targetForm.targetMoney}
                        onChange={(e) => setTargetForm({ ...targetForm, targetMoney: e.target.value })}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Revenue Achieved</Label>
                      <Input
                        type="number"
                        value={targetForm.achievedMoney}
                        onChange={(e) => setTargetForm({ ...targetForm, achievedMoney: e.target.value })}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Companies Target</Label>
                      <Input
                        type="number"
                        value={targetForm.targetCompanies}
                        onChange={(e) => setTargetForm({ ...targetForm, targetCompanies: e.target.value })}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Companies Achieved</Label>
                      <Input
                        type="number"
                        value={targetForm.achievedCompanies}
                        onChange={(e) => setTargetForm({ ...targetForm, achievedCompanies: e.target.value })}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="col-span-2 md:col-span-4 flex justify-end gap-2 pt-2">
                      <Button size="sm" variant="secondary" onClick={() => setShowTargetForm(false)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={saveTarget}>
                        Save targets
                      </Button>
                    </div>
                  </div>
                )}

                {target ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>Basis Money Progress</span>
                        <span>{Number(target.achieved_money).toLocaleString()} / {Number(target.target_money).toLocaleString()}</span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${Math.min(100, target.target_money > 0 ? (target.achieved_money / target.target_money) * 100 : 0)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {target.target_money > 0 ? ((target.achieved_money / target.target_money) * 100).toFixed(1) : 0}% achieved
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>Companies Added Progress</span>
                        <span>{target.achieved_companies} / {target.target_companies}</span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500" 
                          style={{ width: `${Math.min(100, target.target_companies > 0 ? (target.achieved_companies / target.target_companies) * 100 : 0)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {target.target_companies > 0 ? ((target.achieved_companies / target.target_companies) * 100).toFixed(1) : 0}% achieved
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No targets defined for this month yet.</p>
                )}
              </CardContent>
            </Card>
          </Section>

          {data?.lastLoc && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Last known location</h3>
              <MapView
                height="220px"
                markers={[
                  {
                    lat: Number(data.lastLoc.latitude),
                    lng: Number(data.lastLoc.longitude),
                    label: new Date(data.lastLoc.recorded_at).toLocaleString(),
                  },
                ]}
              />
            </div>
          )}

          <Section title="Recent travel sessions">
            {data?.sessions.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Started</TableHead>
                    <TableHead>Ended</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.sessions.map((s: any) => (
                    <TableRow key={s.id}>
                      <TableCell>{new Date(s.started_at).toLocaleString()}</TableCell>
                      <TableCell>
                        {s.ended_at ? new Date(s.ended_at).toLocaleString() : "—"}
                      </TableCell>
                      <TableCell>{Number(s.total_km ?? 0).toFixed(2)} km</TableCell>
                      <TableCell>{formatDuration(Number(s.duration_seconds ?? 0))}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{s.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Empty />
            )}
          </Section>

          <Section title="Recent visits">
            {data?.visits.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead>Visited at</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.visits.map((v: any) => (
                    <TableRow key={v.id}>
                      <TableCell>{v.assigned_locations?.name ?? "—"}</TableCell>
                      <TableCell>{new Date(v.visited_at).toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground">{v.notes ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Empty />
            )}
          </Section>

          <Section title="Recent attendance">
            {data?.attendance.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Punch in</TableHead>
                    <TableHead>Punch out</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.attendance.map((a: any) => (
                    <TableRow key={a.id}>
                      <TableCell>{a.work_date}</TableCell>
                      <TableCell>
                        {a.punch_in_at ? new Date(a.punch_in_at).toLocaleTimeString() : "—"}
                      </TableCell>
                      <TableCell>
                        {a.punch_out_at ? new Date(a.punch_out_at).toLocaleTimeString() : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{a.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Empty />
            )}
          </Section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value ?? "—"}</div>
    </div>
  );
}
function Stat({ label, value }: { label: string; value: any }) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-lg font-bold mt-0.5">{value}</div>
      </CardContent>
    </Card>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-2">{title}</h3>
      {children}
    </div>
  );
}
function Empty() {
  return <p className="text-sm text-muted-foreground">No records.</p>;
}

function LocationsTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    radius_meter: 100,
  });
  const [open, setOpen] = useState(false);

  async function load() {
    const { data } = await supabase
      .from("assigned_locations")
      .select("*")
      .order("created_at", { ascending: false });
    setRows(data ?? []);
  }
  useEffect(() => {
    void load();
  }, []);

  async function useMyLocation() {
    try {
      const pos = await getCurrentPosition();
      setForm((f) => ({
        ...f,
        latitude: pos.coords.latitude.toFixed(6),
        longitude: pos.coords.longitude.toFixed(6),
      }));
      toast.success("Captured current location");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not get location");
    }
  }

  async function create() {
    if (!form.name || !form.latitude || !form.longitude)
      return toast.error("Name and coordinates required");
    const { error } = await supabase.from("assigned_locations").insert({
      name: form.name,
      address: form.address || null,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      radius_meter: Number(form.radius_meter),
    });
    if (error) return toast.error(error.message);
    toast.success("Location added");
    setOpen(false);
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
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Add location
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New location</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Latitude</Label>
                  <Input
                    value={form.latitude}
                    onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Longitude</Label>
                  <Input
                    value={form.longitude}
                    onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                  />
                </div>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={useMyLocation}>
                <Crosshair className="h-4 w-4" />
                Use my current location
              </Button>
              <div>
                <Label>Radius (meters)</Label>
                <Input
                  type="number"
                  value={form.radius_meter}
                  onChange={(e) => setForm({ ...form, radius_meter: Number(e.target.value) })}
                />
              </div>
              <Button className="w-full" onClick={create}>
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.length > 0 && (
          <MapView
            height="320px"
            markers={rows.map((r) => ({
              lat: Number(r.latitude),
              lng: Number(r.longitude),
              label: r.name,
            }))}
          />
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Coords</TableHead>
              <TableHead>Radius</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell>{r.address ?? "—"}</TableCell>
                <TableCell className="font-mono text-xs">
                  {Number(r.latitude).toFixed(4)}, {Number(r.longitude).toFixed(4)}
                </TableCell>
                <TableCell>{r.radius_meter} m</TableCell>
                <TableCell>
                  <Button size="icon" variant="ghost" onClick={() => remove(r.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function LiveMap() {
  const [markers, setMarkers] = useState<any[]>([]);
  const [list, setList] = useState<
    { name: string; code: string; status: "in" | "out" | "none"; at?: string }[]
  >([]);
  useEffect(() => {
    let stop = false;
    async function tick() {
      const today = new Date().toISOString().slice(0, 10);
      const [{ data: logs }, { data: emps }, { data: att }] = await Promise.all([
        supabase
          .from("location_logs")
          .select("latitude,longitude,recorded_at,employee_id")
          .order("recorded_at", { ascending: false })
          .limit(1000),
        supabase.from("employees").select("id, user_id, employee_code"),
        supabase
          .from("attendance")
          .select("employee_id, punch_in_at, punch_out_at")
          .eq("work_date", today),
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
        const tag =
          s === "in" ? "🟢 Punched in" : s === "out" ? "🔴 Punched out" : "⚪ No attendance";
        return {
          lat: Number(r.latitude),
          lng: Number(r.longitude),
          label: `<b>${name}</b><br/>${tag}<br/><span style="opacity:.7">${new Date(r.recorded_at).toLocaleTimeString()}</span>`,
          color: colorOf(s),
        };
      });

      const roster = (emps ?? [])
        .map((e: any) => {
          const a = attMap.get(e.id) as any;
          const s = statusOf(e.id);
          return {
            name: profileMap[e.user_id]?.full_name ?? e.employee_code,
            code: e.employee_code,
            status: s,
            at: a ? ((s === "in" ? a.punch_in_at : a.punch_out_at) ?? undefined) : undefined,
          };
        })
        .sort((a, b) => (a.status === b.status ? 0 : a.status === "in" ? -1 : 1));

      if (!stop) {
        setMarkers(m);
        setList(roster);
      }
    }
    void tick();
    const i = setInterval(tick, 15000);
    return () => {
      stop = true;
      clearInterval(i);
    };
  }, []);

  const inCount = list.filter((l) => l.status === "in").length;
  const outCount = list.filter((l) => l.status === "out").length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Live employee map</CardTitle>
        <div className="flex flex-wrap gap-3 text-xs mt-1">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 inline-block" />
            Punched in: <b>{inCount}</b>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-600 inline-block" />
            Punched out: <b>{outCount}</b>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-500 inline-block" />
            No attendance: <b>{list.length - inCount - outCount}</b>
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {list.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {list.map((l) => (
              <Badge key={l.code} variant="outline" className="gap-1.5">
                <span
                  className={`h-2 w-2 rounded-full inline-block ${l.status === "in" ? "bg-emerald-600" : l.status === "out" ? "bg-red-600" : "bg-slate-500"}`}
                />
                {l.name} <span className="text-muted-foreground">({l.code})</span>
              </Badge>
            ))}
          </div>
        )}
        {markers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No location data yet. Employees must start tracking to appear here.
          </p>
        ) : (
          <MapView height="500px" markers={markers} />
        )}
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
      supabase
        .from("employees")
        .select("id, user_id, employee_code, department")
        .order("employee_code"),
      supabase.from("assigned_locations").select("id, name, address").order("name"),
      supabase
        .from("employee_assignments")
        .select("*, employees:employee_id(employee_code, user_id), assigned_locations(name)")
        .order("created_at", { ascending: false }),
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
  useEffect(() => {
    void load();
  }, []);

  const empOptions = useMemo(
    () =>
      emps.map((e) => ({
        id: e.id,
        label: `${profiles[e.user_id]?.full_name ?? e.employee_code} (${e.employee_code})${e.department ? " · " + e.department : ""}`,
      })),
    [emps, profiles],
  );

  async function assign() {
    if (!empId || !locId) return toast.error("Pick an employee and a location");
    const { error } = await supabase
      .from("employee_assignments")
      .insert({ employee_id: empId, location_id: locId });
    if (error) return toast.error(error.message);
    toast.success("Assigned");
    setEmpId("");
    setLocId("");
    await load();
  }
  async function remove(id: string) {
    await supabase.from("employee_assignments").delete().eq("id", id);
    await load();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Assign locations to employees</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-[240px] flex-1">
            <Label>Employee</Label>
            <Select value={empId} onValueChange={setEmpId}>
              <SelectTrigger>
                <SelectValue placeholder={emps.length ? "Pick employee" : "No employees yet"} />
              </SelectTrigger>
              <SelectContent>
                {empOptions.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[240px] flex-1">
            <Label>Location</Label>
            <Select value={locId} onValueChange={setLocId}>
              <SelectTrigger>
                <SelectValue placeholder={locs.length ? "Pick location" : "No locations yet"} />
              </SelectTrigger>
              <SelectContent>
                {locs.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.name}
                    {l.address ? ` — ${l.address}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={assign} disabled={!empId || !locId}>
            Assign
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Date</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => {
              const emp = r.employees;
              const name = emp ? (profiles[emp.user_id]?.full_name ?? emp.employee_code) : "—";
              return (
                <TableRow key={r.id}>
                  <TableCell>
                    {name}{" "}
                    <span className="text-xs text-muted-foreground">({emp?.employee_code})</span>
                  </TableCell>
                  <TableCell>{r.assigned_locations?.name ?? "—"}</TableCell>
                  <TableCell>{r.assigned_date}</TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" onClick={() => remove(r.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-6">
                  No assignments yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ReportsTab() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [employees, setEmployees] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [selectedEmp, setSelectedEmp] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [travel, setTravel] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadEmployees() {
    const { data } = await supabase.from("employees").select("*").order("employee_code");
    const list = data ?? [];
    setEmployees(list);
    setProfiles(await loadProfileMap(list.map((r) => r.user_id)));
  }

  async function loadReport() {
    setLoading(true);
    try {
      const startIso = `${startDate}T00:00:00`;
      const endIso = `${endDate}T23:59:59`;

      let query = supabase
        .from("travel_sessions")
        .select("*, employees:employee_id(employee_code, user_id)")
        .gte("started_at", startIso)
        .lte("started_at", endIso)
        .order("started_at", { ascending: false });

      if (selectedEmp !== "all") {
        query = query.eq("employee_id", selectedEmp);
      }

      const { data, error } = await query;
      if (error) throw error;
      setTravel(data ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmp, startDate, endDate]);

  function exportCSV() {
    const headers = [
      "Employee Code",
      "Employee Name",
      "Start Time",
      "End Time",
      "Distance (km)",
      "Duration",
      "Start Address",
      "Stop Address",
      "Status",
    ];
    const rows = travel.map((r) => {
      const emp = r.employees;
      const name = emp ? (profiles[emp.user_id]?.full_name ?? emp.employee_code) : "—";
      return [
        emp?.employee_code ?? "—",
        name,
        new Date(r.started_at).toLocaleString(),
        r.ended_at ? new Date(r.ended_at).toLocaleString() : "Ongoing",
        r.total_km ? Number(r.total_km).toFixed(2) : "0.00",
        formatDuration(r.duration_seconds ?? 0),
        r.travel_start_address ?? "—",
        r.travel_stop_address ?? "—",
        r.status ?? "",
      ];
    });

    const csvContent = [
      headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${(cell ?? "").toString().replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Travel_Report_${startDate}_to_${endDate}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV report downloaded successfully");
  }

  const totalKm = travel.reduce((acc, t) => acc + Number(t.total_km ?? 0), 0);
  const totalSeconds = travel.reduce((acc, t) => acc + Number(t.duration_seconds ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Date Filters Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            Filter reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="w-full sm:w-auto flex-1 min-w-[200px]">
              <Label className="text-xs">Employee</Label>
              <Select value={selectedEmp} onValueChange={setSelectedEmp}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All Employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees.map((e) => {
                    const name = profiles[e.user_id]?.full_name ?? e.employee_code;
                    return (
                      <SelectItem key={e.id} value={e.id}>
                        {name} ({e.employee_code})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-auto flex-1 min-w-[180px]">
              <Label className="text-xs">Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="w-full sm:w-auto flex-1 min-w-[180px]">
              <Label className="text-xs">End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button onClick={loadReport} disabled={loading} className="w-full sm:w-auto">
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col justify-center">
            <span className="text-xs text-muted-foreground font-medium">
              Total Distance (Filtered)
            </span>
            <span className="text-2xl font-bold mt-1 text-primary">{totalKm.toFixed(2)} km</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col justify-center">
            <span className="text-xs text-muted-foreground font-medium">Total Travel Duration</span>
            <span className="text-2xl font-bold mt-1 text-primary">
              {formatDuration(totalSeconds)}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col justify-center">
            <span className="text-xs text-muted-foreground font-medium">
              Active & Completed Sessions
            </span>
            <span className="text-2xl font-bold mt-1 text-primary">{travel.length}</span>
          </CardContent>
        </Card>
      </div>

      {/* Travel sessions table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Travel reports log</CardTitle>
          <Button size="sm" variant="outline" onClick={exportCSV} disabled={travel.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {travel.map((r) => {
                  const emp = r.employees;
                  const name = emp ? (profiles[emp.user_id]?.full_name ?? emp.employee_code) : "—";
                  return (
                    <TableRow key={r.id}>
                      <TableCell>
                        <span className="font-semibold">{name}</span>{" "}
                        <span className="text-xs text-muted-foreground">
                          ({emp?.employee_code})
                        </span>
                      </TableCell>
                      <TableCell>{new Date(r.started_at).toLocaleString()}</TableCell>
                      <TableCell>
                        {r.ended_at ? new Date(r.ended_at).toLocaleString() : "Ongoing"}
                      </TableCell>
                      <TableCell className="font-semibold text-primary">
                        {Number(r.total_km ?? 0).toFixed(2)} km
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {formatDuration(r.duration_seconds ?? 0)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{r.status}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {travel.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-6 text-sm text-muted-foreground"
                    >
                      No travel logs found in this date range.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
