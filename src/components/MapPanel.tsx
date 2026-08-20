import { Suspense, lazy } from "react";
import { ClientOnly } from "@tanstack/react-router";
import type { ComponentProps } from "react";

const MapCanvas = lazy(() => import("./MapCanvas"));

type Props = ComponentProps<typeof MapCanvas>;

function Skeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-xl bg-muted/40 text-sm text-muted-foreground">
      …
    </div>
  );
}

export function MapPanel(props: Props) {
  return (
    <ClientOnly fallback={<Skeleton />}>
      <Suspense fallback={<Skeleton />}>
        <MapCanvas {...props} />
      </Suspense>
    </ClientOnly>
  );
}