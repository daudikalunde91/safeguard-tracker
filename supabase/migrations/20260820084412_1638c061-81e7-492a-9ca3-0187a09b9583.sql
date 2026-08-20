CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  language text NOT NULL DEFAULT 'sw',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  device_code text NOT NULL UNIQUE,
  platform text NOT NULL DEFAULT 'web',
  battery_level int,
  is_charging boolean NOT NULL DEFAULT false,
  network_status text,
  tracking_enabled boolean NOT NULL DEFAULT true,
  last_seen timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.devices TO authenticated;
GRANT ALL ON public.devices TO service_role;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own devices" ON public.devices FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  accuracy double precision,
  speed double precision,
  altitude double precision,
  heading double precision,
  battery_level int,
  is_charging boolean,
  network_status text,
  recorded_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX locations_device_time_idx ON public.locations (device_id, recorded_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.locations TO authenticated;
GRANT ALL ON public.locations TO service_role;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own locations" ON public.locations FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.geofences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id uuid REFERENCES public.devices(id) ON DELETE CASCADE,
  name text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  radius_m int NOT NULL DEFAULT 200,
  alert_enter boolean NOT NULL DEFAULT true,
  alert_exit boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.geofences TO authenticated;
GRANT ALL ON public.geofences TO service_role;
ALTER TABLE public.geofences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own geofences" ON public.geofences FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id uuid REFERENCES public.devices(id) ON DELETE CASCADE,
  type text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alerts TO authenticated;
GRANT ALL ON public.alerts TO service_role;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own alerts" ON public.alerts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.ingest_location(
  p_code text,
  p_lat double precision,
  p_lng double precision,
  p_accuracy double precision DEFAULT NULL,
  p_speed double precision DEFAULT NULL,
  p_altitude double precision DEFAULT NULL,
  p_heading double precision DEFAULT NULL,
  p_battery int DEFAULT NULL,
  p_charging boolean DEFAULT NULL,
  p_network text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  d public.devices%ROWTYPE;
  g public.geofences%ROWTYPE;
  prev public.locations%ROWTYPE;
  dist_now double precision;
  dist_prev double precision;
BEGIN
  SELECT * INTO d FROM public.devices WHERE device_code = upper(trim(p_code));
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'device_not_found');
  END IF;

  SELECT * INTO prev FROM public.locations
    WHERE device_id = d.id ORDER BY recorded_at DESC LIMIT 1;

  INSERT INTO public.locations (device_id, user_id, latitude, longitude, accuracy, speed, altitude, heading, battery_level, is_charging, network_status)
  VALUES (d.id, d.user_id, p_lat, p_lng, p_accuracy, p_speed, p_altitude, p_heading, p_battery, p_charging, p_network);

  UPDATE public.devices
    SET last_seen = now(),
        battery_level = COALESCE(p_battery, battery_level),
        is_charging = COALESCE(p_charging, is_charging),
        network_status = COALESCE(p_network, network_status)
    WHERE id = d.id;

  IF p_battery IS NOT NULL AND p_battery <= 15 AND COALESCE(p_charging, false) = false THEN
    INSERT INTO public.alerts (user_id, device_id, type, message)
    SELECT d.user_id, d.id, 'low_battery', d.name || ': betri iko chini (' || p_battery || '%)'
    WHERE NOT EXISTS (
      SELECT 1 FROM public.alerts a WHERE a.device_id = d.id AND a.type = 'low_battery'
        AND a.created_at > now() - interval '30 minutes'
    );
  END IF;

  FOR g IN SELECT * FROM public.geofences WHERE user_id = d.user_id AND (device_id IS NULL OR device_id = d.id) LOOP
    dist_now := 6371000 * acos(least(1, greatest(-1,
      cos(radians(g.latitude)) * cos(radians(p_lat)) * cos(radians(p_lng) - radians(g.longitude))
      + sin(radians(g.latitude)) * sin(radians(p_lat)))));
    IF prev.id IS NOT NULL THEN
      dist_prev := 6371000 * acos(least(1, greatest(-1,
        cos(radians(g.latitude)) * cos(radians(prev.latitude)) * cos(radians(prev.longitude) - radians(g.longitude))
        + sin(radians(g.latitude)) * sin(radians(prev.latitude)))));
      IF dist_now <= g.radius_m AND dist_prev > g.radius_m AND g.alert_enter THEN
        INSERT INTO public.alerts (user_id, device_id, type, message)
        VALUES (d.user_id, d.id, 'geofence_enter', d.name || ' imeingia ' || g.name);
      ELSIF dist_now > g.radius_m AND dist_prev <= g.radius_m AND g.alert_exit THEN
        INSERT INTO public.alerts (user_id, device_id, type, message)
        VALUES (d.user_id, d.id, 'geofence_exit', d.name || ' imetoka ' || g.name);
      END IF;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('ok', true, 'device', d.name);
END;
$$;

REVOKE ALL ON FUNCTION public.ingest_location(text, double precision, double precision, double precision, double precision, double precision, double precision, int, boolean, text) FROM public;
GRANT EXECUTE ON FUNCTION public.ingest_location(text, double precision, double precision, double precision, double precision, double precision, double precision, int, boolean, text) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.device_exists(p_code text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT jsonb_build_object('ok', true, 'name', name) FROM public.devices WHERE device_code = upper(trim(p_code))), jsonb_build_object('ok', false));
$$;
GRANT EXECUTE ON FUNCTION public.device_exists(text) TO anon, authenticated, service_role;

ALTER PUBLICATION supabase_realtime ADD TABLE public.locations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.devices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;