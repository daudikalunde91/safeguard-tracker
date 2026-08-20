import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  label: string;
  accuracy?: number | null;
  active?: boolean;
};

export type MapCircle = {
  id: string;
  lat: number;
  lng: number;
  radius: number;
  label?: string;
};

type Props = {
  markers?: MapMarker[];
  route?: [number, number][];
  circles?: MapCircle[];
  center?: [number, number];
  zoom?: number;
  followId?: string | null;
  onMapClick?: (lat: number, lng: number) => void;
  className?: string;
};

function markerIcon(active: boolean) {
  const color = active ? "var(--color-success)" : "var(--color-primary)";
  return L.divIcon({
    className: "",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    html: `<span style="position:relative;display:block;width:22px;height:22px">
      <span class="sdlt-marker-pulse" style="position:absolute;inset:0;border-radius:9999px;background:${color};opacity:.5"></span>
      <span style="position:absolute;inset:4px;border-radius:9999px;background:${color};border:2px solid var(--color-background)"></span>
    </span>`,
  });
}

export default function MapCanvas({
  markers = [],
  route = [],
  circles = [],
  center = [-6.7924, 39.2083],
  zoom = 13,
  followId = null,
  onMapClick,
  className = "h-full w-full",
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const clickRef = useRef(onMapClick);
  clickRef.current = onMapClick;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { zoomControl: true, attributionControl: true }).setView(
      center,
      zoom,
    );
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);
    map.on("click", (e: L.LeafletMouseEvent) => clickRef.current?.(e.latlng.lat, e.latlng.lng));
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 120);
    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    for (const c of circles) {
      L.circle([c.lat, c.lng], {
        radius: c.radius,
        color: "var(--color-accent)",
        weight: 2,
        fillColor: "var(--color-accent)",
        fillOpacity: 0.12,
      })
        .bindTooltip(c.label ?? "")
        .addTo(layer);
    }

    if (route.length > 1) {
      L.polyline(route, { color: "var(--color-primary)", weight: 4, opacity: 0.85 }).addTo(layer);
    }

    for (const m of markers) {
      if (m.accuracy) {
        L.circle([m.lat, m.lng], {
          radius: m.accuracy,
          color: "var(--color-primary)",
          weight: 1,
          fillColor: "var(--color-primary)",
          fillOpacity: 0.1,
        }).addTo(layer);
      }
      L.marker([m.lat, m.lng], { icon: markerIcon(!!m.active) })
        .bindTooltip(m.label, { direction: "top", offset: [0, -10] })
        .addTo(layer);
    }

    const follow = followId ? markers.find((m) => m.id === followId) : markers[0];
    if (follow) map.panTo([follow.lat, follow.lng], { animate: true });
  }, [markers, route, circles, followId]);

  useEffect(() => {
    const map = mapRef.current;
    if (map && center) map.setView(center, map.getZoom());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center?.[0], center?.[1]]);

  return <div ref={containerRef} className={className} />;
}