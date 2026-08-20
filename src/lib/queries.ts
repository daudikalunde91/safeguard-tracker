import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Alert, Device, Geofence, LocationPoint } from "./sdlt";

export function useDevices() {
  return useQuery({
    queryKey: ["devices"],
    queryFn: async (): Promise<Device[]> => {
      const { data, error } = await supabase
        .from("devices")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Device[];
    },
    refetchInterval: 15000,
  });
}

export function useLatestLocations() {
  return useQuery({
    queryKey: ["latest-locations"],
    queryFn: async (): Promise<LocationPoint[]> => {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(300);
      if (error) throw error;
      const seen = new Set<string>();
      const out: LocationPoint[] = [];
      for (const row of (data ?? []) as LocationPoint[]) {
        if (seen.has(row.device_id)) continue;
        seen.add(row.device_id);
        out.push(row);
      }
      return out;
    },
    refetchInterval: 10000,
  });
}

export function useLocationHistory(deviceId: string | null, sinceIso: string | null) {
  return useQuery({
    queryKey: ["history", deviceId, sinceIso],
    enabled: !!deviceId,
    queryFn: async (): Promise<LocationPoint[]> => {
      let q = supabase
        .from("locations")
        .select("*")
        .eq("device_id", deviceId!)
        .order("recorded_at", { ascending: true })
        .limit(2000);
      if (sinceIso) q = q.gte("recorded_at", sinceIso);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as LocationPoint[];
    },
  });
}

export function useGeofences() {
  return useQuery({
    queryKey: ["geofences"],
    queryFn: async (): Promise<Geofence[]> => {
      const { data, error } = await supabase
        .from("geofences")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Geofence[];
    },
  });
}

export function useAlerts(limit = 100) {
  return useQuery({
    queryKey: ["alerts", limit],
    queryFn: async (): Promise<Alert[]> => {
      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as Alert[];
    },
    refetchInterval: 20000,
  });
}

/** Live refresh of devices/locations/alerts via realtime. */
export function useLiveSync() {
  const queryClient = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel("sdlt-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "locations" }, () => {
        queryClient.invalidateQueries({ queryKey: ["latest-locations"] });
        queryClient.invalidateQueries({ queryKey: ["history"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "devices" }, () => {
        queryClient.invalidateQueries({ queryKey: ["devices"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "alerts" }, () => {
        queryClient.invalidateQueries({ queryKey: ["alerts"] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);
}