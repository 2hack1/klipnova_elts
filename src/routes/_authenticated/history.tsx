import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/geo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, CalendarDays } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/history")({ component: History });

function History() {
  const { employeeId } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [attendance, setAttendance] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [travel, setTravel] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Date range state (default: past 30 days to today)
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

  async function loadData() {
    if (!employeeId) return;
    setLoading(true);
    try {
      const startIso = `${startDate}T00:00:00`;
      const endIso = `${endDate}T23:59:59`;

      const [a, t, v] = await Promise.all([
        supabase
          .from("attendance")
          .select("*")
          .eq("employee_id", employeeId)
          .gte("work_date", startDate)
          .lte("work_date", endDate)
          .order("work_date", { ascending: false }),
        supabase
          .from("travel_sessions")
          .select("*")
          .eq("employee_id", employeeId)
          .gte("started_at", startIso)
          .lte("started_at", endIso)
          .order("started_at", { ascending: false }),
        supabase
          .from("visit_history")
          .select("*, assigned_locations(name, address)")
          .eq("employee_id", employeeId)
          .gte("visited_at", startIso)
          .lte("visited_at", endIso)
          .order("visited_at", { ascending: false }),
      ]);

      setAttendance(a.data ?? []);
      setTravel(t.data ?? []);
      setVisits(v.data ?? []);
    } catch (e) {
      toast.error("Failed to load history data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId, startDate, endDate]);

  // Client-side CSV Exporter
  function handleExportCSV(type: "attendance" | "travel" | "visits") {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = "";

    if (type === "attendance") {
      filename = `Attendance_Report_${startDate}_to_${endDate}.csv`;
      headers = [
        "Date",
        "Punch In Time",
        "Punch In Latitude",
        "Punch In Longitude",
        "Punch Out Time",
        "Punch Out Latitude",
        "Punch Out Longitude",
        "Total Hours",
        "Status",
        "Notes",
      ];
      rows = attendance.map((r) => [
        r.work_date ?? "",
        r.punch_in_at ? new Date(r.punch_in_at).toLocaleTimeString() : "",
        r.punch_in_lat ? r.punch_in_lat.toString() : "",
        r.punch_in_lng ? r.punch_in_lng.toString() : "",
        r.punch_out_at ? new Date(r.punch_out_at).toLocaleTimeString() : "",
        r.punch_out_lat ? r.punch_out_lat.toString() : "",
        r.punch_out_lng ? r.punch_out_lng.toString() : "",
        r.total_working_hours ? Number(r.total_working_hours).toFixed(2) : "",
        r.status ?? "",
        r.notes ?? "",
      ]);
    } else if (type === "travel") {
      filename = `Travel_Report_${startDate}_to_${endDate}.csv`;
      headers = [
        "Start Time",
        "End Time",
        "Start Coordinates (Lat/Lng)",
        "End Coordinates (Lat/Lng)",
        "Distance (km)",
        "Duration",
        "Status",
      ];
      rows = travel.map((r) => [
        new Date(r.started_at).toLocaleString(),
        r.ended_at ? new Date(r.ended_at).toLocaleString() : "Ongoing",
        `${r.start_lat ?? ""}, ${r.start_lng ?? ""}`,
        r.ended_at ? `${r.end_lat ?? ""}, ${r.end_lng ?? ""}` : "",
        r.total_km ? Number(r.total_km).toFixed(2) : "0.00",
        formatDuration(r.duration_seconds ?? 0),
        r.status ?? "",
      ]);
    } else if (type === "visits") {
      filename = `Visits_Report_${startDate}_to_${endDate}.csv`;
      headers = [
        "Visited At",
        "Location Name",
        "Address",
        "Distance from Center (meters)",
        "Notes",
      ];
      rows = visits.map((r) => [
        new Date(r.visited_at).toLocaleString(),
        r.assigned_locations?.name ?? "—",
        r.assigned_locations?.address ?? "—",
        r.distance_meter ? Number(r.distance_meter).toFixed(1) : "0",
        r.notes ?? "",
      ]);
    }

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
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV file downloaded successfully");
  }

  // Summary Metrics
  const totalTravelKm = travel.reduce((acc, t) => acc + Number(t.total_km ?? 0), 0);
  const totalTravelSeconds = travel.reduce((acc, t) => acc + Number(t.duration_seconds ?? 0), 0);
  const totalWorkingHours = attendance.reduce(
    (acc, a) => acc + Number(a.total_working_hours ?? 0),
    0,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">History &amp; Reports</h1>
        <p className="text-sm text-muted-foreground">
          Select a date range to view logs and export spreadsheet reports.
        </p>
      </div>

      {/* Date Filters Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            Filter logs by date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="w-full sm:w-auto flex-1 min-w-[200px]">
              <Label htmlFor="start-date" className="text-xs">
                Start Date
              </Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="w-full sm:w-auto flex-1 min-w-[200px]">
              <Label htmlFor="end-date" className="text-xs">
                End Date
              </Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button onClick={loadData} disabled={loading} className="w-full sm:w-auto">
              {loading ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col justify-center">
            <span className="text-xs text-muted-foreground font-medium">Total Travel Distance</span>
            <span className="text-2xl font-bold mt-1 text-primary">
              {totalTravelKm.toFixed(2)} km
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col justify-center">
            <span className="text-xs text-muted-foreground font-medium">Total Travel Time</span>
            <span className="text-2xl font-bold mt-1 text-primary">
              {formatDuration(totalTravelSeconds)}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col justify-center">
            <span className="text-xs text-muted-foreground font-medium">Total Worked Hours</span>
            <span className="text-2xl font-bold mt-1 text-primary">
              {totalWorkingHours.toFixed(2)} hrs
            </span>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="att" className="w-full">
        <TabsList>
          <TabsTrigger value="att">Attendance ({attendance.length})</TabsTrigger>
          <TabsTrigger value="trv">Travel Sessions ({travel.length})</TabsTrigger>
          <TabsTrigger value="vis">Visits ({visits.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="att">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Attendance logs</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExportCSV("attendance")}
                disabled={attendance.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Punch In</TableHead>
                      <TableHead>Punch Out</TableHead>
                      <TableHead>Working Hours</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendance.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.work_date}</TableCell>
                        <TableCell>
                          {r.punch_in_at ? new Date(r.punch_in_at).toLocaleTimeString() : "—"}
                        </TableCell>
                        <TableCell>
                          {r.punch_out_at ? new Date(r.punch_out_at).toLocaleTimeString() : "—"}
                        </TableCell>
                        <TableCell>
                          {r.total_working_hours
                            ? `${Number(r.total_working_hours).toFixed(2)} hrs`
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{r.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {attendance.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-6 text-sm text-muted-foreground"
                        >
                          No attendance logs found in this date range.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trv">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Travel sessions</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExportCSV("travel")}
                disabled={travel.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Start Time</TableHead>
                      <TableHead>End Time</TableHead>
                      <TableHead>Distance</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {travel.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{new Date(r.started_at).toLocaleString()}</TableCell>
                        <TableCell>
                          {r.ended_at ? new Date(r.ended_at).toLocaleString() : "—"}
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
                    ))}
                    {travel.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-6 text-sm text-muted-foreground"
                        >
                          No travel sessions found in this date range.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vis">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Visit history</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExportCSV("visits")}
                disabled={visits.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Distance</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visits.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{new Date(r.visited_at).toLocaleString()}</TableCell>
                        <TableCell className="font-semibold">
                          {r.assigned_locations?.name ?? "—"}
                        </TableCell>
                        <TableCell>{r.assigned_locations?.address ?? "—"}</TableCell>
                        <TableCell>
                          {r.distance_meter ? `${Number(r.distance_meter).toFixed(1)} m` : "—"}
                        </TableCell>
                        <TableCell
                          className="max-w-[200px] truncate text-muted-foreground"
                          title={r.notes}
                        >
                          {r.notes ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                    {visits.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-6 text-sm text-muted-foreground"
                        >
                          No visits found in this date range.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
