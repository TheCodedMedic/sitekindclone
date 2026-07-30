import { Outlet, createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/portal/PortalShell";

export const Route = createFileRoute("/portal")({
  head: () => ({
    meta: [
      { title: "Client Portal · sitekind" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PortalLayout,
});

function PortalLayout() {
  return (
    <PortalShell>
      <Outlet />
    </PortalShell>
  );
}
