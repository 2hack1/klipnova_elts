import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { MapPin, Clock, Route as RouteIcon, Shield } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ELTS — Employee Location Tracking System" },
      { name: "description", content: "Enterprise PWA to track field employee attendance, travel and visits in real time." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/30">
      <header className="container mx-auto flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground"><MapPin className="h-5 w-5" /></div>
          <span className="text-lg font-bold tracking-tight">ELTS</span>
        </div>
        <Link to="/auth" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Sign in</Link>
      </header>
      <main className="container mx-auto px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">Employee Location Tracking System</h1>
          <p className="mt-6 text-lg text-muted-foreground">Enterprise PWA for attendance, live GPS travel tracking, assigned visits, and admin reporting — all in one secure platform.</p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/auth" className="rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground">Get started</Link>
          </div>
        </div>
        <div className="mx-auto mt-20 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { i: Clock, t: "Attendance", d: "Punch in/out with GPS verification." },
            { i: RouteIcon, t: "Live travel", d: "Continuous GPS logging with route + km." },
            { i: MapPin, t: "Assigned visits", d: "Geofenced location targets and visit history." },
            { i: Shield, t: "Admin control", d: "Reports, dashboards, role-based access." },
          ].map(({ i: I, t, d }) => (
            <div key={t} className="rounded-xl border bg-card p-5 shadow-sm">
              <I className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
