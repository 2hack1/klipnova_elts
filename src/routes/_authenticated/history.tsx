import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/geo";

export const Route = createFileRoute("/_authenticated/history")({ component: History });

function History() {
  const { employeeId } = useAuth();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [travel, setTravel] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);

  useEffect(() => {
    if (!employeeId) return;
    void (async () => {
      const [a, t, v] = await Promise.all([
        supabase.from("attendance").select("*").eq("employee_id", employeeId).order("work_date", { ascending: false }).limit(60),
        supabase.from("travel_sessions").select("*").eq("employee_id", employeeId).order("started_at", { ascending: false }).limit(60),
        supabase.from("visit_history").select("*, assigned_locations(name)").eq("employee_id", employeeId).order("visited_at", { ascending: false }).limit(60),
      ]);
      setAttendance(a.data ?? []); setTravel(t.data ?? []); setVisits(v.data ?? []);
    })();
  }, [employeeId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">History &amp; Reports</h1>
        <p className="text-sm text-muted-foreground">Your last 60 records per category.</p>
      </div>
      <Tabs defaultValue="att">
        <TabsList><TabsTrigger value="att">Attendance</TabsTrigger><TabsTrigger value="trv">Travel</TabsTrigger><TabsTrigger value="vis">Visits</TabsTrigger></TabsList>
        <TabsContent value="att">
          <Card><CardHeader><CardTitle className="text-base">Attendance log</CardTitle></CardHeader><CardContent>
            <Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>In</TableHead><TableHead>Out</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>{attendance.map((r) => (
                <TableRow key={r.id}><TableCell>{r.work_date}</TableCell>
                  <TableCell>{r.punch_in_at ? new Date(r.punch_in_at).toLocaleTimeString() : "—"}</TableCell>
                  <TableCell>{r.punch_out_at ? new Date(r.punch_out_at).toLocaleTimeString() : "—"}</TableCell>
                  <TableCell><Badge variant="outline">{r.status}</Badge></TableCell>
                </TableRow>))}
              </TableBody></Table>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="trv">
          <Card><CardHeader><CardTitle className="text-base">Travel sessions</CardTitle></CardHeader><CardContent>
            <Table><TableHeader><TableRow><TableHead>Start</TableHead><TableHead>End</TableHead><TableHead>Distance</TableHead><TableHead>Duration</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>{travel.map((r) => (
                <TableRow key={r.id}><TableCell>{new Date(r.started_at).toLocaleString()}</TableCell>
                  <TableCell>{r.ended_at ? new Date(r.ended_at).toLocaleString() : "—"}</TableCell>
                  <TableCell>{Number(r.total_km ?? 0).toFixed(2)} km</TableCell>
                  <TableCell className="font-mono text-xs">{formatDuration(r.duration_seconds ?? 0)}</TableCell>
                  <TableCell><Badge variant="outline">{r.status}</Badge></TableCell>
                </TableRow>))}
              </TableBody></Table>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="vis">
          <Card><CardHeader><CardTitle className="text-base">Visit history</CardTitle></CardHeader><CardContent>
            <Table><TableHeader><TableRow><TableHead>Time</TableHead><TableHead>Location</TableHead><TableHead>Distance (m)</TableHead></TableRow></TableHeader>
              <TableBody>{visits.map((r) => (
                <TableRow key={r.id}><TableCell>{new Date(r.visited_at).toLocaleString()}</TableCell>
                  <TableCell>{r.assigned_locations?.name ?? "—"}</TableCell>
                  <TableCell>{r.distance_meter ? Number(r.distance_meter).toFixed(1) : "—"}</TableCell>
                </TableRow>))}
              </TableBody></Table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
