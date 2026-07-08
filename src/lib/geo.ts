// Haversine + helpers for GPS tracking

export interface LatLng {
  lat: number;
  lng: number;
}

const R = 6371e3; // meters
const toRad = (d: number) => (d * Math.PI) / 180;

export function distanceMeters(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export function totalRouteKm(points: LatLng[]): number {
  let m = 0;
  for (let i = 1; i < points.length; i++) m += distanceMeters(points[i - 1], points[i]);
  return m / 1000;
}

export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });
  });
}

export function watchPosition(
  cb: (pos: GeolocationPosition) => void,
  err?: (e: GeolocationPositionError) => void,
): number {
  return navigator.geolocation.watchPosition(cb, err, {
    enableHighAccuracy: true,
    maximumAge: 5000,
    timeout: 20000,
  });
}

export function clearWatch(id: number) {
  if (typeof navigator !== "undefined" && navigator.geolocation)
    navigator.geolocation.clearWatch(id);
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
