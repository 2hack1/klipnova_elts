import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  LayoutDashboard,
  MapPin,
  Route as RouteIcon,
  History,
  User,
  Shield,
  LogOut,
  Menu,
  X,
  Bell,
  Sun,
  Moon,
  Globe,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  icon: typeof MapPin;
  label: string;
  adminOnly?: boolean;
}
const NAV: NavItem[] = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/track", icon: RouteIcon, label: "Live Tracking" },
  { to: "/locations", icon: MapPin, label: "Locations" },
  { to: "/history", icon: History, label: "History & Reports" },
  { to: "/profile", icon: User, label: "Profile" },
  { to: "/admin", icon: Shield, label: "Admin Panel", adminOnly: true },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user, role, isAdmin } = useAuth();
  const loc = useLocation();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  // Theme state
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      return (
        (localStorage.getItem("theme") as "light" | "dark") ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      );
    }
    return "light";
  });

  // Apply theme class to <html>
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
    setOpen(false);
  }, [loc.pathname]);

  // Initial unread count fetch
  useEffect(() => {
    if (!user) return;
    void (async () => {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
      setUnread(count ?? 0);
    })();
  }, [user]);

  // Real-time notifications listener & permission request
  useEffect(() => {
    if (!user) return;

    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      void Notification.requestPermission();
    }

    const channel = supabase
      .channel(`user-notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const notif = payload.new;
          setUnread((c) => c + 1);

          // Show Toast notification
          toast.info(notif.title, {
            description: notif.body,
            action: notif.link
              ? {
                  label: "View",
                  onClick: () => nav({ to: notif.link }),
                }
              : undefined,
          });

          // Show Native Web Notification (PWA / browser alert)
          if ("Notification" in window && Notification.permission === "granted") {
            try {
              const nativeNotif = new Notification(notif.title, {
                body: notif.body,
                icon: "/icon.svg",
                tag: notif.id,
              });
              nativeNotif.onclick = () => {
                window.focus();
                if (notif.link) {
                  nav({ to: notif.link });
                }
              };
            } catch (err) {
              console.error("Native notification error:", err);
            }
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user, nav]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    nav({ to: "/auth", replace: true });
  }

  const items = NAV.filter((i) => !i.adminOnly || isAdmin);
  const roleLabel =
    role === "super_admin" ? "Super Admin" : role === "admin" ? "Administrator" : "Employee";

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-card px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" onClick={() => setOpen((v) => !v)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <span className="font-bold">ELTS</span>
        </div>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" className="h-9 w-9" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <NotificationBell unread={unread} setUnread={setUnread} user={user} />
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 transform bg-sidebar text-sidebar-foreground transition-transform lg:static lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-sidebar-primary">
                <MapPin className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
              <div>
                <div className="text-sm font-bold leading-tight">ELTS</div>
                <div className="text-[10px] text-sidebar-foreground/60">Employee Tracking</div>
              </div>
            </div>
            <div className="hidden lg:block">
              <NotificationBell unread={unread} setUnread={setUnread} user={user} />
            </div>
          </div>
          <nav className="flex flex-col gap-1 p-3">
            <Link
              to="/"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground mb-1 border-b border-sidebar-border/30 pb-2"
            >
              <Globe className="h-4 w-4" />
              Back to Website
            </Link>
            {items.map((it) => {
              const active =
                loc.pathname === it.to ||
                (it.to !== "/dashboard" && loc.pathname.startsWith(it.to));
              const Icon = it.icon;
              return (
                <Link
                  key={it.to}
                  to={it.to}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {it.label}
                </Link>
              );
            })}
          </nav>
          <div className="absolute inset-x-3 bottom-3 space-y-2">
            <div className="mb-2 truncate rounded-md bg-sidebar-accent px-3 py-2 text-xs flex items-center justify-between">
              <div>
                <div className="font-medium text-sidebar-accent-foreground truncate max-w-[140px]">
                  {user?.email}
                </div>
                <div className="text-sidebar-foreground/60">{roleLabel}</div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-sidebar-primary/20"
                onClick={toggleTheme}
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
            <Button variant="secondary" size="sm" className="w-full" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </aside>

        {open && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        <main className="flex-1 lg:ml-0">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

function NotificationBell({
  unread,
  setUnread,
  user,
}: {
  unread: number;
  setUnread: React.Dispatch<React.SetStateAction<number>>;
  user: any;
}) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function fetchNotifications() {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(15);
    setNotifications(data ?? []);
    setLoading(false);
  }

  function handleOpenChange(open: boolean) {
    if (open) void fetchNotifications();
  }

  async function markAllAsRead() {
    if (!user || notifications.length === 0) return;
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    if (!error) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnread(0);
    }
  }

  async function handleNotificationClick(notif: any) {
    if (!notif.is_read) {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notif.id);
      if (!error) {
        setUnread((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n)),
        );
      }
    }
    if (notif.link) {
      nav({ to: notif.link });
    }
  }

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-sidebar-foreground lg:text-foreground"
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-destructive" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-2.5 bg-card">
          <span className="font-semibold text-sm">Notifications</span>
          {unread > 0 && (
            <Button
              variant="ghost"
              className="h-auto p-0 text-xs text-primary hover:bg-transparent hover:text-primary/95"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-72">
          {loading ? (
            <div className="flex h-40 items-center justify-center text-xs text-muted-foreground">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-xs text-muted-foreground">
              No notifications yet.
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={cn(
                    "flex flex-col gap-1 px-4 py-3 cursor-pointer transition-colors text-left",
                    n.is_read ? "hover:bg-accent/40" : "bg-primary/5 hover:bg-primary/10",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={cn("text-xs font-semibold", !n.is_read && "text-primary")}>
                      {n.title}
                    </span>
                    {!n.is_read && (
                      <span className="h-2 w-2 rounded-full bg-primary mt-1 shrink-0" />
                    )}
                  </div>
                  {n.body && (
                    <p className="text-xs text-muted-foreground/90 line-clamp-2">{n.body}</p>
                  )}
                  <span className="text-[10px] text-muted-foreground/75 mt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
