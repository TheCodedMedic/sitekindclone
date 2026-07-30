/// <reference types="vite/client" />
import {
  Link,
  Outlet,
  createRootRoute,
  useRouter,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ThemeScript } from "@/components/ThemeScript";
import { MotionProvider, MotionScript } from "@/lib/motion/MotionProvider";
import { RouteTransition } from "@/lib/motion/RouteTransition";
import { ButtonMagnetics } from "@/lib/motion/ButtonMagnetics";
import { OrganizationSchema } from "@/components/Schema";
import { reportClientError } from "@/lib/client-error-reporter";
import "@/lib/client-error-reporter";
import { registerAppServiceWorker } from "@/pwa/registerSW";

export const Route = createRootRoute({
  notFoundComponent: NotFoundPage,
  errorComponent: RootErrorComponent,
  component: RootShell,
});

function RootErrorComponent({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const router = useRouter();
  useEffect(() => {
    reportClientError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <section className="mx-auto max-w-2xl px-6 py-32 text-center">
      <h1 className="font-display text-4xl font-extrabold text-ink">
        Something went wrong
      </h1>
      <p className="mt-4 text-ink-2">
        {error?.message ?? "An unexpected error occurred."}
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <button
          type="button"
          className="btn-primary inline-flex"
          onClick={() => {
            reset();
            void router.invalidate();
          }}
        >
          Try again
        </button>
        <Link to="/" className="btn-secondary inline-flex">
          Go home
        </Link>
      </div>
    </section>
  );
}

function RootShell() {
  useEffect(() => {
    void registerAppServiceWorker();
  }, []);

  return (
    <>
      <ThemeScript />
      <MotionScript />
      <OrganizationSchema />
      <MotionProvider>
        <Navbar />
        <main>
          <RouteTransition>
            <Outlet />
          </RouteTransition>
        </main>
        <Footer />
        <ButtonMagnetics />
      </MotionProvider>
    </>
  );
}

function NotFoundPage() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-32 text-center">
      <h1 className="font-display text-4xl font-extrabold text-ink">
        Page not found
      </h1>
      <p className="mt-4 text-ink-2">
        The page you were looking for doesn't exist.
      </p>
      <Link to="/" className="btn-primary mt-8 inline-flex">
        Back home
      </Link>
    </section>
  );
}
