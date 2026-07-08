import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { MapPin, Clock, Route as RouteIcon, Shield, Check, Mail, Phone } from "lucide-react";

import appCss from "../styles.css?url";
import { StylesheetLoader } from "@/components/StylesheetLoader";

const ELTS_STYLES = [appCss];

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
      <StylesheetLoader hrefs={ELTS_STYLES} />
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
          <Link
            to="/auth"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Sign in
          </Link>
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
                  price: "$0",
                  period: "/mo",
                  features: ["Up to 5 employees", "Attendance & GPS", "Basic reports"],
                  cta: "Get started",
                },
                {
                  name: "Business",
                  price: "$29",
                  period: "/mo",
                  features: [
                    "Up to 50 employees",
                    "Live map & geofencing",
                    "Advanced reports",
                    "Priority support",
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
          <div className="container mx-auto max-w-3xl px-6 py-20">
            <h2 className="text-3xl font-bold tracking-tight text-center">Contact Us</h2>
            <p className="mt-3 text-center text-muted-foreground">We'd love to hear from you.</p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <a
                href="mailto:hello@elts.app"
                className="flex items-center gap-3 rounded-xl border bg-card p-5"
              >
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="font-medium">hello@elts.app</div>
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
