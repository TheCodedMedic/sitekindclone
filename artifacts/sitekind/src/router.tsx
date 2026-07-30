import {
  createRouter as createTanstackRouter,
  ErrorComponent,
} from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { reportClientError } from "@/lib/client-error-reporter";

export function getRouter() {
  return createTanstackRouter({
    routeTree,
    basepath: import.meta.env.BASE_URL || "/",
    defaultPreload: "intent",
    scrollRestoration: true,
    defaultErrorComponent: (props) => {
      reportClientError(props.error, { boundary: "tanstack_default_error_component" });
      return <ErrorComponent error={props.error} />;
    },
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
