import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { MapPin, Clock, Route as RouteIcon, Shield, Check, Mail, Phone, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

import appCss from "../styles.css?url";

export const Route = createFileRoute("/elts")({
  head: () => ({
    meta: [
      { title: "ELTS — Employee Location Tracking System" },
      {
        name: "description",
        content:
          "Enterprise PWA to track field employee attendance, travel and visits in real time.",
      },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: Landing,
});

function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      return (
        (localStorage.getItem("theme") as "light" | "dark") ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      );
    }
    return "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/30 text-foreground transition-colors duration-300">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
              <MapPin className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">ELTS</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="hover:text-primary">
              Features
            </a>
            <a href="#about" className="hover:text-primary">
              About
            </a>
            <a href="#pricing" className="hover:text-primary">
              Pricing
            </a>
            <a href="#contact" className="hover:text-primary">
              Contact
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Link
              to="/auth"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="container mx-auto px-6 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Employee Location Tracking System
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Enterprise PWA for attendance, live GPS travel tracking, assigned visits, and admin
              reporting — all in one secure platform.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Link
                to="/auth"
                className="rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground"
              >
                Get started
              </Link>
              <a href="#pricing" className="rounded-md border px-6 py-3 font-medium">
                View pricing
              </a>
            </div>
          </div>

          <div
            id="features"
            className="mx-auto mt-20 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {[
              { i: Clock, t: "Attendance", d: "Punch in/out with GPS verification." },
              { i: RouteIcon, t: "Live travel", d: "Continuous GPS logging with route + km." },
              {
                i: MapPin,
                t: "Assigned visits",
                d: "Geofenced location targets and visit history.",
              },
              { i: Shield, t: "Admin control", d: "Reports, dashboards, role-based access." },
            ].map(({ i: I, t, d }) => (
              <div key={t} className="rounded-xl border bg-card p-5 shadow-sm">
                <I className="h-6 w-6 text-primary" />
                <h3 className="mt-3 font-semibold">{t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* About */}
        <section id="about" className="border-t bg-card/40">
          <div className="container mx-auto max-w-4xl px-6 py-20">
            <h2 className="text-3xl font-bold tracking-tight text-center">About Us</h2>
            <p className="mt-4 text-center text-muted-foreground">
              Built for modern field teams that need accountability without friction.
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-3 text-center">
              <div>
                <div className="text-3xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">Privacy first</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">Live</div>
                <div className="text-sm text-muted-foreground">GPS updates</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">3 Roles</div>
                <div className="text-sm text-muted-foreground">Super Admin, Admin, Employee</div>
              </div>
            </div>
            <p className="mt-10 text-muted-foreground leading-relaxed">
              ELTS gives organizations complete visibility over their field workforce. Super Admins
              manage the entire platform, Admins onboard and supervise their own teams, and
              Employees log attendance, share live GPS, and record customer visits — all from a
              single installable PWA.
            </p>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="border-t">
          <div className="container mx-auto max-w-5xl px-6 py-20">
            <h2 className="text-3xl font-bold tracking-tight text-center">Pricing</h2>
            <p className="mt-3 text-center text-muted-foreground">
              Simple plans that scale with your team.
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                {
                  name: "Starter",
                  price: "$30",
                  period: "/mo",
                  features: ["6 employees", "Attendance & GPS", "Basic reports", "7 days free trial"],
                  cta: "Get started",
                },
                {
                  name: "Business",
                  price: "$100",
                  period: "/mo",
                  features: [
                    "20 employees",
                    "Live map & geofencing",
                    "Advanced reports",
                    "Priority support",
                    "7 days free trial",
                  ],
                  cta: "Start free trial",
                  featured: true,
                },
                {
                  name: "Enterprise",
                  price: "Custom",
                  period: "",
                  features: [
                    "Unlimited employees",
                    "SSO / SAML",
                    "Dedicated success manager",
                    "Custom integrations",
                  ],
                  cta: "Contact sales",
                },
              ].map((p) => (
                <div
                  key={p.name}
                  className={`rounded-xl border bg-card p-6 shadow-sm ${p.featured ? "ring-2 ring-primary" : ""}`}
                >
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{p.price}</span>
                    <span className="text-sm text-muted-foreground">{p.period}</span>
                  </div>
                  <ul className="mt-5 space-y-2 text-sm">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#contact"
                    className={`mt-6 block rounded-md px-4 py-2 text-center text-sm font-medium ${p.featured ? "bg-primary text-primary-foreground" : "border"}`}
                  >
                    {p.cta}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="border-t bg-card/40">
          <div className="container mx-auto max-w-4xl px-6 py-20">
            <h2 className="text-3xl font-bold tracking-tight text-center">Contact Us</h2>
            <p className="mt-3 text-center text-muted-foreground">We'd love to hear from you.</p>
            <div className="mt-10 grid gap-6 grid-cols-1 md:grid-cols-3">
              <a
                href="mailto:admin@klipnova.com"
                className="flex items-center gap-3 rounded-xl border bg-card p-5"
              >
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="font-medium">admin@klipnova.com</div>
                </div>
              </a>
              <a
                href="tel:+911234567890"
                className="flex items-center gap-3 rounded-xl border bg-card p-5"
              >
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Phone</div>
                  <div className="font-medium">+91 12345 67890</div>
                </div>
              </a>
              <a
                href="https://wa.me/919131475945"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border bg-card p-5"
              >
                <svg
                  className="h-5 w-5 text-primary fill-current flex-shrink-0"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <div>
                  <div className="text-sm text-muted-foreground">WhatsApp</div>
                  <div className="font-medium">+91 91314 75945 (WhatsApp only)</div>
                </div>
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container mx-auto px-6 py-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} ELTS — Employee Location Tracking System
        </div>
      </footer>
    </div>
  );
}
