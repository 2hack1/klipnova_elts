import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapView } from "@/components/MapView";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Plus, Crosshair, Trash2 } from "lucide-react";
import { getCurrentPosition } from "@/lib/geo";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/locations")({ component: Locations });

function Locations() {
  const { user, employeeId } = useAuth();
  const [assigned, setAssigned] = useState<any[]>([]);
  const [mine, setMine] = useState<any[]>([]);
  const [visits, setVisits] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", latitude: "", longitude: "", radius_meter: 100 });

  async function load() {
    if (!user) return;
    const [asg, own] = await Promise.all([
      employeeId
        ? supabase.from("employee_assignments").select("*, assigned_locations(*)").eq("employee_id", employeeId)
        : Promise.resolve({ data: [] as any[] }),
      supabase.from("assigned_locations").select("*").eq("owner_user_id", user.id).order("created_at", { ascending: false }),
    ]);
    setAssigned(asg.data ?? []);
    setMine(own.data ?? []);

    if (employeeId) {
      const today = new Date().toISOString().slice(0, 10) + "T00:00:00";
      const { data: vis } = await supabase.from("visit_history")
        .select("location_id, visited_at").eq("employee_id", employeeId).gte("visited_at", today);
      const map: Record<string, string> = {};
      (vis ?? []).forEach((v) => { if (!map[v.location_id]) map[v.location_id] = v.visited_at; });
      setVisits(map);
    }
  }
  useEffect(() => { void load(); /* eslint-disable-next-line */ }, [user, employeeId]);

  async function useMyLocation() {
    try {
      const pos = await getCurrentPosition();
      setForm((f) => ({ ...f, latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) }));
      toast.success("Captured current location");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Could not get location"); }
  }

  async function create() {
    if (!user) return;
    if (!form.name || !form.latitude || !form.longitude) return toast.error("Name and coordinates required");
    const { error } = await supabase.from("assigned_locations").insert({
      name: form.name, address: form.address || null,
      latitude: Number(form.latitude), longitude: Number(form.longitude),
      radius_meter: Number(form.radius_meter),
      owner_user_id: user.id,
    });
    if (error) return toast.error(error.message);
    toast.success("Location added"); setOpen(false);
    setForm({ name: "", address: "", latitude: "", longitude: "", radius_meter: 100 });
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this location?")) return;
    const { error } = await supabase.from("assigned_locations").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await load();
  }

  const assignedMarkers = assigned.map((r) => ({
    lat: Number(r.assigned_locations.latitude),
    lng: Number(r.assigned_locations.longitude),
    label: r.assigned_locations.name,
    color: visits[r.location_id] ? "#16a34a" : "#1d4ed8",
  }));
  const myMarkers = mine.map((r) => ({ lat: Number(r.latitude), lng: Number(r.longitude), label: r.name, color: "#7c3aed" }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Locations</h1>
        <p className="text-sm text-muted-foreground">Locations assigned by your admin, plus locations you add for your own visits.</p>
      </div>

      {/* My locations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">My locations ({mine.length})</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4" />Add location</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New work location</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Name</Label><Input placeholder="Customer / meeting / visit" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
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
          {myMarkers.length > 0 && <MapView height="280px" markers={myMarkers} />}
          {mine.length === 0
            ? <p className="text-sm text-muted-foreground">You haven't added any locations yet.</p>
            : (
              <ul className="divide-y">
                {mine.map((r) => (
                  <li key={r.id} className="flex items-start justify-between gap-3 py-3 text-sm">
                    <div className="flex gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                      <div>
                        <div className="font-medium">{r.name}</div>
                        <div className="text-xs text-muted-foreground">{r.address ?? "—"} · Radius {r.radius_meter} m</div>
                        <div className="text-xs font-mono text-muted-foreground">{Number(r.latitude).toFixed(4)}, {Number(r.longitude).toFixed(4)}</div>
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
                  </li>
                ))}
              </ul>
            )}
        </CardContent>
      </Card>

      {/* Assigned */}
      <Card>
        <CardHeader><CardTitle className="text-base">Assigned by your admin ({assigned.length})</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {assignedMarkers.length > 0 && <MapView height="320px" markers={assignedMarkers} />}
          {assigned.length === 0 ? <p className="text-sm text-muted-foreground">No locations assigned.</p> : (
            <ul className="divide-y">
              {assigned.map((r) => (
                <li key={r.id} className="flex items-start justify-between gap-3 py-3 text-sm">
                  <div className="flex gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                    <div>
                      <div className="font-medium">{r.assigned_locations.name}</div>
                      <div className="text-xs text-muted-foreground">{r.assigned_locations.address ?? "—"} · Radius {r.assigned_locations.radius_meter} m</div>
                      <div className="text-xs text-muted-foreground">Due: {r.due_date ?? "—"}</div>
                    </div>
                  </div>
                  {visits[r.location_id]
                    ? <Badge>Visited {new Date(visits[r.location_id]).toLocaleTimeString()}</Badge>
                    : <Badge variant="outline">Pending</Badge>}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
