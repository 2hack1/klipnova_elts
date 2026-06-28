import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapView } from "@/components/MapView";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

export const Route = createFileRoute("/_authenticated/locations")({ component: Locations });

function Locations() {
  const { employeeId } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [visits, setVisits] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!employeeId) return;
    void (async () => {
      const { data } = await supabase.from("employee_assignments")
        .select("*, assigned_locations(*)")
        .eq("employee_id", employeeId);
      setRows(data ?? []);
      const today = new Date().toISOString().slice(0, 10) + "T00:00:00";
      const { data: vis } = await supabase.from("visit_history")
        .select("location_id, visited_at").eq("employee_id", employeeId).gte("visited_at", today);
      const map: Record<string, string> = {};
      (vis ?? []).forEach((v) => { if (!map[v.location_id]) map[v.location_id] = v.visited_at; });
      setVisits(map);
    })();
  }, [employeeId]);

  const markers = rows.map((r) => ({
    lat: Number(r.assigned_locations.latitude),
    lng: Number(r.assigned_locations.longitude),
    label: r.assigned_locations.name,
    color: visits[r.location_id] ? "#16a34a" : "#1d4ed8",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Assigned Locations</h1>
        <p className="text-sm text-muted-foreground">Your visit targets. Auto check-in happens when you enter the geofence radius.</p>
      </div>

      {markers.length > 0 && (
        <Card><CardHeader><CardTitle className="text-base">Map</CardTitle></CardHeader>
        <CardContent><MapView height="380px" markers={markers} /></CardContent></Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Locations ({rows.length})</CardTitle></CardHeader>
        <CardContent>
          {rows.length === 0 ? <p className="text-sm text-muted-foreground">No locations assigned.</p> : (
            <ul className="divide-y">
              {rows.map((r) => (
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
