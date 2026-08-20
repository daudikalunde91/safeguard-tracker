export type Device = {
  id: string;
  user_id: string;
  name: string;
  device_code: string;
  platform: string;
  battery_level: number | null;
  is_charging: boolean;
  network_status: string | null;
  tracking_enabled: boolean;
  last_seen: string | null;
  created_at: string;
};

export type LocationPoint = {
  id: string;
  device_id: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  speed: number | null;
  altitude: number | null;
  heading: number | null;
  battery_level: number | null;
  is_charging: boolean | null;
  network_status: string | null;
  recorded_at: string;
};

export type Geofence = {
  id: string;
  user_id: string;
  device_id: string | null;
  name: string;
  latitude: number;
  longitude: number;
  radius_m: number;
  alert_enter: boolean;
  alert_exit: boolean;
  created_at: string;
};

export type Alert = {
  id: string;
  device_id: string | null;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export const ONLINE_WINDOW_MS = 2 * 60 * 1000;

export function isOnline(device: Pick<Device, "last_seen">): boolean {
  if (!device.last_seen) return false;
  return Date.now() - new Date(device.last_seen).getTime() < ONLINE_WINDOW_MS;
}

export function generateDeviceCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return out.slice(0, 4) + "-" + out.slice(4);
}

export function haversine(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const R = 6371000;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLng = ((b.longitude - a.longitude) * Math.PI) / 180;
  const la1 = (a.latitude * Math.PI) / 180;
  const la2 = (b.latitude * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function routeDistance(points: LocationPoint[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) total += haversine(points[i - 1]!, points[i]!);
  return total;
}

export function formatDistance(meters: number): string {
  return meters >= 1000 ? `${(meters / 1000).toFixed(2)} km` : `${Math.round(meters)} m`;
}

export function formatSpeed(mps: number | null | undefined): string {
  if (mps == null || Number.isNaN(mps)) return "—";
  return `${(mps * 3.6).toFixed(1)} km/h`;
}

export function formatRelative(iso: string | null | undefined, lang: "sw" | "en"): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.max(0, Math.round(diff / 1000));
  if (s < 60) return lang === "sw" ? `sekunde ${s} zilizopita` : `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return lang === "sw" ? `dakika ${m} zilizopita` : `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return lang === "sw" ? `saa ${h} zilizopita` : `${h}h ago`;
  const d = Math.round(h / 24);
  return lang === "sw" ? `siku ${d} zilizopita` : `${d}d ago`;
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleString();
}

export function toCsv(points: LocationPoint[]): string {
  const header = "recorded_at,latitude,longitude,accuracy,speed_kmh,altitude,battery,network";
  const rows = points.map((p) =>
    [
      p.recorded_at,
      p.latitude,
      p.longitude,
      p.accuracy ?? "",
      p.speed != null ? (p.speed * 3.6).toFixed(2) : "",
      p.altitude ?? "",
      p.battery_level ?? "",
      p.network_status ?? "",
    ].join(","),
  );
  return [header, ...rows].join("\n");
}