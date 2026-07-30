import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/status")({
  component: StatusPage,
});

function StatusPage() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-32 text-center pt-[120px]">
      <h1 className="font-display text-3xl font-extrabold text-ink">
        Site status
      </h1>
      <p className="mt-4 text-ink-2">
        Live status monitoring is not available in this environment.
      </p>
      <Link to="/" className="btn-primary mt-8 inline-flex">
        Back home
      </Link>
    </section>
  );
}
