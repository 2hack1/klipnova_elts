import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, MapPin, Route as RouteIcon, History, User, Shield, LogOut, Menu, X, Bell,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface NavItem { to: string; icon: typeof MapPin; label: string; adminOnly?: boolean }
const NAV: NavItem[] = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/track", icon: RouteIcon, label: "Live Tracking" },
  { to: "/locations", icon: MapPin, label: "Assigned Locations" },
  { to: "/history", icon: History, label: "History & Reports" },
  { to: "/profile", icon: User, label: "Profile" },
  { to: "/admin", icon: Shield, label: "Admin Panel", adminOnly: true },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user, isAdmin } = useAuth();
  const loc = useLocation();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => { setOpen(false); }, [loc.pathname]);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const { count } = await supabase.from("notifications").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("is_read", false);
      setUnread(count ?? 0);
    })();
  }, [user]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    nav({ to: "/auth", replace: true });
  }

  const items = NAV.filter((i) => !i.adminOnly || isAdmin);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-card px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" onClick={() => setOpen((v) => !v)}>{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</Button>
          <span className="font-bold">ELTS</span>
        </div>
        <div className="relative">
          <Bell className="h-5 w-5" />
          {unread > 0 && <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-destructive text-[10px] text-destructive-foreground">{unread}</span>}
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform bg-sidebar text-sidebar-foreground transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}>
          <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-sidebar-primary"><MapPin className="h-5 w-5 text-sidebar-primary-foreground" /></div>
            <div>
              <div className="text-sm font-bold leading-tight">ELTS</div>
              <div className="text-[10px] text-sidebar-foreground/60">Employee Tracking</div>
            </div>
          </div>
          <nav className="flex flex-col gap-1 p-3">
            {items.map((it) => {
              const active = loc.pathname === it.to || (it.to !== "/dashboard" && loc.pathname.startsWith(it.to));
              const Icon = it.icon;
              return (
                <Link key={it.to} to={it.to} className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}>
                  <Icon className="h-4 w-4" />{it.label}
                </Link>
              );
            })}
          </nav>
          <div className="absolute inset-x-3 bottom-3">
            <div className="mb-2 truncate rounded-md bg-sidebar-accent px-3 py-2 text-xs">
              <div className="font-medium text-sidebar-accent-foreground">{user?.email}</div>
              <div className="text-sidebar-foreground/60">{isAdmin ? "Administrator" : "Employee"}</div>
            </div>
            <Button variant="secondary" size="sm" className="w-full" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />Sign out
            </Button>
          </div>
        </aside>

        {/* Backdrop */}
        {open && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />}

        <main className="flex-1 lg:ml-0">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
