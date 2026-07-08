import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, RouteIcon, MapPin, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { employeeId, isAdmin, user } = useAuth();
  const [stats, setStats] = useState({
    todayKm: 0,
    todayVisits: 0,
    attendance: "none",
    activeSession: false,
  });
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [recent, setRecent] = useState<any[]>([]);
  const [target, setTarget] = useState<any>(null);

  useEffect(() => {
    if (!employeeId) return;
    void (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const currentMonthStart = new Date();
      currentMonthStart.setDate(1);
      const targetMonthStr = currentMonthStart.toISOString().slice(0, 10);

      const [att, sess, summary, visits, targetData] = await Promise.all([
        supabase
          .from("attendance")
          .select("*")
          .eq("employee_id", employeeId)
          .eq("work_date", today)
          .maybeSingle(),
        supabase
          .from("travel_sessions")
          .select("*")
          .eq("employee_id", employeeId)
          .eq("status", "active")
          .maybeSingle(),
        supabase
          .from("daily_travel_summary")
          .select("*")
          .eq("employee_id", employeeId)
          .eq("summary_date", today)
          .maybeSingle(),
        supabase
          .from("visit_history")
          .select("*, assigned_locations(name)")
          .eq("employee_id", employeeId)
          .order("visited_at", { ascending: false })
          .limit(5),
        supabase
          .from("employee_targets")
          .select("*")
          .eq("employee_id", employeeId)
          .eq("target_month", targetMonthStr)
          .maybeSingle(),
      ]);
      setTodayAttendance(att.data);
      setActiveSession(sess.data);
      setRecent(visits.data ?? []);
      setTarget(targetData.data);
      setStats({
        todayKm: Number(summary.data?.total_km ?? 0),
        todayVisits: summary.data?.total_visits ?? visits.data?.length ?? 0,
        attendance: att.data?.punch_in_at ? (att.data.punch_out_at ? "completed" : "in") : "none",
        activeSession: !!sess.data,
      });
    })();
  }, [employeeId]);

  if (!employeeId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {user?.email}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You don't yet have an employee profile.{" "}
            {isAdmin
              ? "Open the Admin Panel to create employee records."
              : "Please contact your administrator to provision your employee record."}
          </p>
          {isAdmin && (
            <Link to="/admin">
              <Button className="mt-4">Go to Admin Panel</Button>
            </Link>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Today,{" "}
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Clock}
          label="Attendance"
          value={
            stats.attendance === "in"
              ? "Punched in"
              : stats.attendance === "completed"
                ? "Completed"
                : "Not yet"
          }
          tone={
            stats.attendance === "in"
              ? "success"
              : stats.attendance === "completed"
                ? "muted"
                : "warning"
          }
        />
        <StatCard
          icon={RouteIcon}
          label="Travel today"
          value={`${stats.todayKm.toFixed(2)} km`}
          tone="default"
        />
        <StatCard
          icon={MapPin}
          label="Visits today"
          value={String(stats.todayVisits)}
          tone="default"
        />
        <StatCard
          icon={stats.activeSession ? CheckCircle2 : AlertCircle}
          label="Travel session"
          value={stats.activeSession ? "Active" : "Stopped"}
          tone={stats.activeSession ? "success" : "muted"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today's Attendance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row
              label="Punch in"
              value={
                todayAttendance?.punch_in_at
                  ? new Date(todayAttendance.punch_in_at).toLocaleTimeString()
                  : "—"
              }
            />
            <Row
              label="Punch out"
              value={
                todayAttendance?.punch_out_at
                  ? new Date(todayAttendance.punch_out_at).toLocaleTimeString()
                  : "—"
              }
            />
            <Row
              label="Status"
              value={<Badge variant="outline">{todayAttendance?.status ?? "n/a"}</Badge>}
            />
            <Link to="/track">
              <Button size="sm" className="mt-2">
                Open tracker
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Travel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {activeSession ? (
              <>
                <Row
                  label="Started at"
                  value={new Date(activeSession.started_at).toLocaleTimeString()}
                />
                <Row
                  label="Distance"
                  value={`${Number(activeSession.total_km ?? 0).toFixed(2)} km`}
                />
                <Link to="/track">
                  <Button size="sm" className="mt-2">
                    View live
                  </Button>
                </Link>
              </>
            ) : (
              <p className="text-muted-foreground">No active travel session.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Targets Histogram */}
      {target && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Targets &amp; Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Money target chart */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm font-semibold">
                  <span>Revenue Target Progress</span>
                  <span className="text-primary font-bold">
                    {Number(target.achieved_money).toLocaleString()} / {Number(target.target_money).toLocaleString()} (
                    {target.target_money > 0 ? ((target.achieved_money / target.target_money) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: "Target", Amount: Number(target.target_money) },
                        { name: "Achieved", Amount: Number(target.achieved_money) },
                      ]}
                      margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                    >
                      <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis hide />
                      <Tooltip formatter={(value) => `${Number(value).toLocaleString()}`} />
                      <Bar dataKey="Amount" radius={[4, 4, 0, 0]} barSize={50}>
                        <Cell fill="var(--color-primary)" />
                        <Cell fill="var(--color-success)" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Companies added target chart */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm font-semibold">
                  <span>Client Acquisition Target</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {target.achieved_companies} / {target.target_companies} (
                    {target.target_companies > 0 ? ((target.achieved_companies / target.target_companies) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: "Target", Count: target.target_companies },
                        { name: "Achieved", Count: target.achieved_companies },
                      ]}
                      margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                    >
                      <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis hide />
                      <Tooltip formatter={(value) => `${value} companies`} />
                      <Bar dataKey="Count" radius={[4, 4, 0, 0]} barSize={50}>
                        <Cell fill="var(--color-primary)" />
                        <Cell fill="var(--color-success)" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Visits</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No visits yet.</p>
          ) : (
            <ul className="divide-y">
              {recent.map((v) => (
                <li key={v.id} className="flex items-center justify-between py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    {v.assigned_locations?.name ?? "Location"}
                  </div>
                  <span className="text-muted-foreground">
                    {new Date(v.visited_at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: any;
  label: string;
  value: string;
  tone: "default" | "success" | "warning" | "muted";
}) {
  const colors = {
    default: "text-primary",
    success: "text-[var(--color-success)]",
    warning: "text-[var(--color-warning)]",
    muted: "text-muted-foreground",
  }[tone];
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`grid h-10 w-10 place-items-center rounded-lg bg-accent ${colors}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-lg font-semibold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
