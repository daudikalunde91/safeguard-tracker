import { Link, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  MapPin,
  Smartphone,
  History,
  Shield,
  Bell,
  Settings,
  LogOut,
  Satellite,
  Menu,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, type TKey } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/LanguageToggle";
import { cn } from "@/lib/utils";

const nav: { to: string; key: TKey; icon: typeof MapPin }[] = [
  { to: "/dashboard", key: "dashboard", icon: LayoutDashboard },
  { to: "/map", key: "liveMap", icon: MapPin },
  { to: "/devices", key: "devices", icon: Smartphone },
  { to: "/history", key: "history", icon: History },
  { to: "/geofence", key: "geofence", icon: Shield },
  { to: "/notifications", key: "notifications", icon: Bell },
  { to: "/settings", key: "settings", icon: Settings },
];

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 shrink-0 border-r border-sidebar-border bg-sidebar p-4 transition-transform md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Link to="/dashboard" className="mb-8 flex items-center gap-2 px-2">
          <span className="grid size-9 place-items-center rounded-xl bg-primary/15 text-primary">
            <Satellite className="size-5" />
          </span>
          <span>
            <span className="block text-sm font-bold tracking-widest text-sidebar-foreground">
              SDLT
            </span>
            <span className="block text-[11px] text-muted-foreground">{t("appTagline")}</span>
          </span>
        </Link>

        <nav className="space-y-1">
          {nav.map(({ to, key, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
              activeProps={{ className: "bg-primary/15 text-primary font-semibold" }}
            >
              <Icon className="size-4" />
              {t(key)}
            </Link>
          ))}
        </nav>

        <div className="absolute inset-x-4 bottom-4 space-y-3">
          <LanguageToggle />
          <Button variant="ghost" className="w-full justify-start gap-3" onClick={signOut}>
            <LogOut className="size-4" />
            {t("signOut")}
          </Button>
        </div>
      </aside>

      {open && (
        <button
          aria-label="close menu"
          className="fixed inset-0 z-30 bg-background/70 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-4 backdrop-blur md:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            <Menu className="size-5" />
          </Button>
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}