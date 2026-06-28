import { useEffect, useRef } from "react";

interface MarkerSpec { lat: number; lng: number; label?: string; color?: string }
interface MapViewProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: MarkerSpec[];
  path?: { lat: number; lng: number }[];
  height?: string;
}

export function MapView({ center, zoom = 14, markers = [], path = [], height = "400px" }: MapViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layersRef = useRef<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !ref.current) return;
      if (!mapRef.current) {
        mapRef.current = L.map(ref.current).setView([center?.lat ?? 0, center?.lng ?? 0], zoom);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap",
          maxZoom: 19,
        }).addTo(mapRef.current);
      }
      const map = mapRef.current;
      // Clear old layers
      layersRef.current.forEach((l) => map.removeLayer(l));
      layersRef.current = [];
      // Markers
      for (const m of markers) {
        const icon = L.divIcon({
          className: "",
          html: `<div style="width:18px;height:18px;border-radius:9999px;background:${m.color ?? "#1d4ed8"};border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>`,
        });
        const mk = L.marker([m.lat, m.lng], { icon }).addTo(map);
        if (m.label) mk.bindPopup(m.label);
        layersRef.current.push(mk);
      }
      // Path
      if (path.length > 1) {
        const poly = L.polyline(path.map((p) => [p.lat, p.lng] as [number, number]), { color: "#1d4ed8", weight: 4, opacity: 0.8 }).addTo(map);
        layersRef.current.push(poly);
        map.fitBounds(poly.getBounds(), { padding: [30, 30] });
      } else if (center) {
        map.setView([center.lat, center.lng], zoom);
      } else if (markers.length === 1) {
        map.setView([markers[0].lat, markers[0].lng], zoom);
      } else if (markers.length > 1) {
        const grp = L.featureGroup(layersRef.current.filter(Boolean));
        try { map.fitBounds(grp.getBounds(), { padding: [30, 30] }); } catch {}
      }
    })();
    return () => { cancelled = true; };
  }, [center?.lat, center?.lng, zoom, JSON.stringify(markers), JSON.stringify(path)]);

  useEffect(() => () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } }, []);

  return <div ref={ref} style={{ height }} className="overflow-hidden rounded-lg border" />;
}
