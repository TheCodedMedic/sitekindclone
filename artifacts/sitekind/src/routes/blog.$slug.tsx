import { createFileRoute, Link } from "@tanstack/react-router";

import { notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { Section, Badge, CtaBand } from "@/components/ui";
import { PostBody } from "@/components/blog/PostBody";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { ArticleSchema, BreadcrumbSchema } from "@/components/Schema";
import { posts, getPost } from "@/lib/data/posts";
import { pageHead, emptyHead } from "@/lib/seo";

function fmt(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function PostPage() {
  const { slug } = Route.useParams();
  const post = getPost(slug);
  if (!post) throw notFound();

  const idx = posts.findIndex((p) => p.slug === slug);
  const next = posts[(idx + 1) % posts.length];
  const related = posts
    .filter((p) => p.slug !== slug && p.category === post.category)
    .slice(0, 2);

  return (
    <>
      {/* The article's ONLY motion: a scroll-driven reading-progress bar.
          Functional feedback, fixed overlay, zero ambient movement. */}
      <ReadingProgress />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Blog", url: "/blog" },
          { name: post.title, url: `/blog/${post.slug}` },
        ]}
      />
      <ArticleSchema
        headline={post.title}
        description={post.excerpt}
        datePublished={post.date}
        slug={post.slug}
      />

      <section className="relative overflow-hidden pt-[72px]">
        <div className="mesh" aria-hidden />
        <Section className="relative py-14">
          <div className="mx-auto max-w-3xl">
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-ink-2 transition-colors hover:text-ink"
            >
              <ArrowLeft size={15} /> All articles
            </Link>
            <div className="mt-6 flex items-center gap-3">
              <Badge tone="primary">{post.category}</Badge>
              <span className="text-sm text-ink-2">{fmt(post.date)}</span>
              <span className="inline-flex items-center gap-1.5 text-sm text-ink-2">
                <Clock size={14} /> {post.readTime}
              </span>
            </div>
            <h1 className="mt-5 font-display text-[2rem] font-extrabold leading-[1.15] tracking-tight text-ink sm:text-[2.75rem]">
              {post.title}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-ink-2">
              {post.excerpt}
            </p>
          </div>
        </Section>
      </section>

      <Section className="pb-12">
        <article className="mx-auto max-w-3xl">
          <PostBody content={post.content} />

          {/* Inline CTA */}
          <div className="glass-card mt-12 flex flex-col items-start gap-4 p-7 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-display text-lg font-semibold text-ink">
                This post was written by our AI content engine.
              </div>
              <p className="mt-1 text-sm text-ink-2">
                The same one that publishes to our clients' sites every week.
              </p>
            </div>
            <Link to="/pricing" className="btn-primary shrink-0">
              Get It On Your Site <ArrowRight size={16} />
            </Link>
          </div>
        </article>
      </Section>

      {/* Related + next */}
      <Section className="pb-16">
        <div className="mx-auto max-w-3xl">
          <h3 className="font-display text-lg font-semibold text-ink">
            Keep reading
          </h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {(related.length ? related : [next]).map((p) => (
              <Link
                key={p.slug}
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="glass-card group p-6 transition-transform hover:-translate-y-1"
              >
                <Badge tone="muted">{p.category}</Badge>
                <h4 className="mt-3 font-display text-base font-semibold leading-snug text-ink">
                  {p.title}
                </h4>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-primary)] group-hover:gap-2.5 dark:text-[#fdba74]">
                  Read <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </Section>

      <CtaBand
        title="Ready to put this to work?"
        primary={{ href: "/demo", label: "Preview My Website" }}
        secondary={{ href: "/pricing", label: "See Pricing" }}
      />
    </>
  );
}


export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => {
    const post = getPost(params.slug);
    return post ? pageHead(post.title, post.excerpt) : emptyHead();
  },
  component: PostPage,
});
