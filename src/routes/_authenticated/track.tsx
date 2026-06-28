import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapView } from "@/components/MapView";
import { clearWatch, distanceMeters, formatDuration, getCurrentPosition, watchPosition, type LatLng } from "@/lib/geo";
import { toast } from "sonner";
import { LogIn, LogOut, Play, Square, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/track")({ component: Track });

function Track() {
  const { employeeId } = useAuth();
  const [attendance, setAttendance] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [path, setPath] = useState<LatLng[]>([]);
  const [currentPos, setCurrentPos] = useState<LatLng | null>(null);
  const [tick, setTick] = useState(0);
  const [busy, setBusy] = useState(false);
  const watchId = useRef<number | null>(null);
  const lastSave = useRef<number>(0);
  const lastPoint = useRef<LatLng | null>(null);
  const accumKm = useRef<number>(0);

  // Bootstrap today's state
  useEffect(() => {
    if (!employeeId) return;
    void (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const att = await supabase.from("attendance").select("*").eq("employee_id", employeeId).eq("work_date", today).maybeSingle();
      setAttendance(att.data);
      const sess = await supabase.from("travel_sessions").select("*").eq("employee_id", employeeId).eq("status", "active").maybeSingle();
      setSession(sess.data);
      if (sess.data) {
        accumKm.current = Number(sess.data.total_km ?? 0);
        const logs = await supabase.from("location_logs").select("latitude,longitude,recorded_at").eq("travel_session_id", sess.data.id).order("recorded_at");
        const pts = (logs.data ?? []).map((l) => ({ lat: Number(l.latitude), lng: Number(l.longitude) }));
        setPath(pts);
        if (pts.length) lastPoint.current = pts[pts.length - 1];
        startWatch(sess.data.id);
      }
    })();
    return () => { if (watchId.current != null) clearWatch(watchId.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  // Tick clock for live duration
  useEffect(() => {
    if (!session) return;
    const i = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(i);
  }, [session]);

  function startWatch(sessId: string) {
    if (watchId.current != null) clearWatch(watchId.current);
    watchId.current = watchPosition(async (pos) => {
      const p: LatLng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setCurrentPos(p);
      if (lastPoint.current) {
        const m = distanceMeters(lastPoint.current, p);
        if (m < 5) return; // ignore jitter
        accumKm.current += m / 1000;
      }
      lastPoint.current = p;
      setPath((prev) => [...prev, p]);
      const now = Date.now();
      // throttle DB writes to 10s
      if (now - lastSave.current > 10000) {
        lastSave.current = now;
        await supabase.from("location_logs").insert({
          travel_session_id: sessId,
          employee_id: employeeId!,
          latitude: p.lat, longitude: p.lng,
          accuracy: pos.coords.accuracy,
          speed: pos.coords.speed ?? null,
          heading: pos.coords.heading ?? null,
        });
        await supabase.from("travel_sessions").update({ total_km: Number(accumKm.current.toFixed(3)) }).eq("id", sessId);
        await checkGeofence(p, sessId);
      }
    }, () => toast.error("Unable to get location. Enable GPS."));
  }

  async function checkGeofence(p: LatLng, sessId: string) {
    const { data: assigns } = await supabase
      .from("employee_assignments")
      .select("location_id, assigned_locations(id,name,latitude,longitude,radius_meter)")
      .eq("employee_id", employeeId!);
    for (const a of assigns ?? []) {
      const loc: any = a.assigned_locations;
      if (!loc) continue;
      const d = distanceMeters(p, { lat: Number(loc.latitude), lng: Number(loc.longitude) });
      if (d <= (loc.radius_meter ?? 100)) {
        // dedupe: see if a visit already exists in last 30 min
        const since = new Date(Date.now() - 30 * 60_000).toISOString();
        const { data: existing } = await supabase.from("visit_history")
          .select("id").eq("employee_id", employeeId!).eq("location_id", loc.id).gte("visited_at", since).maybeSingle();
        if (!existing) {
          await supabase.from("visit_history").insert({
            employee_id: employeeId!, location_id: loc.id, travel_session_id: sessId,
            visit_latitude: p.lat, visit_longitude: p.lng, distance_meter: d,
          });
          toast.success(`Arrived at ${loc.name}`);
        }
      }
    }
  }

  async function punchIn() {
    setBusy(true);
    try {
      const pos = await getCurrentPosition();
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase.from("attendance").upsert({
        employee_id: employeeId!, work_date: today,
        punch_in_at: new Date().toISOString(),
        punch_in_lat: pos.coords.latitude, punch_in_lng: pos.coords.longitude,
        status: "present",
      }, { onConflict: "employee_id,work_date" }).select().single();
      if (error) throw error;
      setAttendance(data);
      toast.success("Punched in");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setBusy(false); }
  }

  async function punchOut() {
    setBusy(true);
    try {
      if (session) await stopTravel();
      const pos = await getCurrentPosition();
      const { data, error } = await supabase.from("attendance").update({
        punch_out_at: new Date().toISOString(),
        punch_out_lat: pos.coords.latitude, punch_out_lng: pos.coords.longitude,
      }).eq("id", attendance.id).select().single();
      if (error) throw error;
      setAttendance(data);
      toast.success("Punched out");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setBusy(false); }
  }

  async function startTravel() {
    setBusy(true);
    try {
      const pos = await getCurrentPosition();
      const { data, error } = await supabase.from("travel_sessions").insert({
        employee_id: employeeId!, attendance_id: attendance?.id ?? null,
        started_at: new Date().toISOString(),
        start_lat: pos.coords.latitude, start_lng: pos.coords.longitude,
        status: "active",
      }).select().single();
      if (error) throw error;
      setSession(data);
      accumKm.current = 0;
      lastPoint.current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setPath([lastPoint.current]);
      startWatch(data.id);
      toast.success("Travel started");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setBusy(false); }
  }

  async function stopTravel() {
    if (!session) return;
    setBusy(true);
    try {
      if (watchId.current != null) { clearWatch(watchId.current); watchId.current = null; }
      const pos = await getCurrentPosition().catch(() => null);
      const ended = new Date();
      const dur = Math.floor((ended.getTime() - new Date(session.started_at).getTime()) / 1000);
      await supabase.from("travel_sessions").update({
        ended_at: ended.toISOString(),
        end_lat: pos?.coords.latitude ?? null, end_lng: pos?.coords.longitude ?? null,
        total_km: Number(accumKm.current.toFixed(3)),
        duration_seconds: dur,
        status: "completed",
      }).eq("id", session.id);
      // Upsert daily summary
      const today = new Date().toISOString().slice(0, 10);
      const { data: cur } = await supabase.from("daily_travel_summary").select("*").eq("employee_id", employeeId!).eq("summary_date", today).maybeSingle();
      await supabase.from("daily_travel_summary").upsert({
        employee_id: employeeId!, summary_date: today,
        total_km: Number((Number(cur?.total_km ?? 0) + accumKm.current).toFixed(3)),
        total_duration_seconds: (cur?.total_duration_seconds ?? 0) + dur,
        total_sessions: (cur?.total_sessions ?? 0) + 1,
        total_visits: cur?.total_visits ?? 0,
        last_sync_time: new Date().toISOString(),
      }, { onConflict: "employee_id,summary_date" });
      setSession(null); setPath([]); accumKm.current = 0; lastPoint.current = null;
      toast.success("Travel stopped");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setBusy(false); }
  }

  const punchedIn = !!attendance?.punch_in_at && !attendance?.punch_out_at;
  const elapsed = session ? Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000) : 0;
  void tick; // referenced to re-render

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Live Tracking</h1>
        <p className="text-sm text-muted-foreground">Punch in, start travel, and let the system track your route.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Attendance</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={punchedIn ? "default" : "secondary"}>{attendance?.punch_in_at ? (attendance?.punch_out_at ? "Done" : "Punched in") : "Not punched"}</Badge>
            </div>
            {attendance?.punch_in_at && <div className="text-xs text-muted-foreground">In: {new Date(attendance.punch_in_at).toLocaleTimeString()}{attendance.punch_out_at && ` · Out: ${new Date(attendance.punch_out_at).toLocaleTimeString()}`}</div>}
            {!punchedIn && !attendance?.punch_out_at && <Button className="w-full" onClick={punchIn} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}Punch in</Button>}
            {punchedIn && <Button variant="destructive" className="w-full" onClick={punchOut} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}Punch out</Button>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Travel</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Status</span><Badge variant={session ? "default" : "secondary"}>{session ? "Active" : "Stopped"}</Badge></div>
            {session && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><div className="text-xs text-muted-foreground">Duration</div><div className="font-mono">{formatDuration(elapsed)}</div></div>
                <div><div className="text-xs text-muted-foreground">Distance</div><div className="font-mono">{accumKm.current.toFixed(2)} km</div></div>
              </div>
            )}
            {!session && <Button className="w-full" onClick={startTravel} disabled={busy || !punchedIn}><Play className="h-4 w-4" />Start travel</Button>}
            {session && <Button variant="destructive" className="w-full" onClick={stopTravel} disabled={busy}><Square className="h-4 w-4" />Stop travel</Button>}
            {!punchedIn && !session && <p className="text-xs text-muted-foreground">Punch in first to start a travel session.</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Live Map</CardTitle></CardHeader>
        <CardContent>
          <MapView
            height="450px"
            center={currentPos ?? (path.length ? path[path.length - 1] : undefined)}
            markers={currentPos ? [{ lat: currentPos.lat, lng: currentPos.lng, label: "You", color: "#16a34a" }] : []}
            path={path}
          />
        </CardContent>
      </Card>
    </div>
  );
}
