import { Section, Eyebrow } from "@/components/ui";
import { PostBody } from "@/components/blog/PostBody";

export function LegalLayout({
  title,
  updated,
  intro,
  body,
}: {
  title: string;
  updated: string;
  intro: string;
  body: string;
}) {
  return (
    <>
      <section className="relative overflow-hidden pt-[72px]">
        <div className="mesh" aria-hidden />
        <Section className="relative py-14">
          <div className="mx-auto max-w-3xl">
            <Eyebrow>Legal</Eyebrow>
            <h1 className="mt-5 font-display text-[2.25rem] font-extrabold leading-tight tracking-tight text-ink sm:text-[2.75rem]">
              {title}
            </h1>
            <p className="mt-4 font-code text-sm text-ink-2">
              Last updated: {updated}
            </p>
            <p className="mt-5 text-lg leading-relaxed text-ink-2">{intro}</p>
          </div>
        </Section>
      </section>
      <Section className="pb-20">
        <article className="mx-auto max-w-3xl">
          <PostBody content={body} />
          <p className="mt-12 rounded-xl border border-[var(--card-border)] bg-[var(--surface-2)] p-5 text-sm text-ink-2">
            This document is a demonstration template for the sitekind build
            and is not legal advice. Production terms should be reviewed by
            counsel before publication.
          </p>
        </article>
      </Section>
    </>
  );
}
