import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AppShell } from "@/components/AppShell";
import { Loader2 } from "lucide-react";

import appCss from "../../styles.css?url";
import { StylesheetLoader } from "@/components/StylesheetLoader";

const LOADING_STYLES = [appCss];
const AUTH_STYLES = [appCss, "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"];

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: Gate,
});

function Gate() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth" });
  }, [user, loading, nav]);
  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center">
        <StylesheetLoader hrefs={LOADING_STYLES} />
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  return (
    <>
      <StylesheetLoader hrefs={AUTH_STYLES} />
      <AppShell>
        <Outlet />
      </AppShell>
    </>
  );
}
