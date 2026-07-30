import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock } from "lucide-react";
import { posts, categories } from "@/lib/data/posts";
import { Badge } from "@/components/ui";

const catTone: Record<string, "primary" | "accent" | "warning" | "muted"> = {
  "Industry Guides": "primary",
  "AI Education": "accent",
  "Case Studies": "warning",
  "Local SEO Tips": "muted",
  "Product Updates": "muted",
};

function fmt(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function BlogIndex() {
  const [cat, setCat] = useState<string>("All");
  const filtered =
    cat === "All" ? posts : posts.filter((p) => p.category === cat);
  const [featured, ...rest] = filtered;

  return (
    <div>
      {/* Category filter */}
      <div className="mb-10 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              cat === c
                ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                : "border-[var(--card-border)] text-ink-2 hover:text-ink"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Featured */}
      {featured && (
        <Link
          to="/blog/$slug"
          params={{ slug: featured.slug }}
          className="glass-card group mb-8 grid overflow-hidden lg:grid-cols-2"
        >
          <div className="relative min-h-[240px] overflow-hidden">
            <div
              className="absolute inset-0 opacity-90 transition-transform duration-500 group-hover:scale-105"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
              }}
            />
            <div className="dot-grid !mask-none opacity-30" />
            <span className="absolute bottom-5 left-5 font-display text-4xl font-extrabold text-white/90">
              {featured.category}
            </span>
          </div>
          <div className="flex flex-col justify-center p-8">
            <div className="flex items-center gap-3">
              <Badge tone={catTone[featured.category]}>{featured.category}</Badge>
              <span className="text-xs text-ink-2">{fmt(featured.date)}</span>
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold leading-tight text-ink">
              <span className="blog-card-underline">{featured.title}</span>
            </h2>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-2">
              {featured.excerpt}
            </p>
            <div className="mt-5 flex items-center gap-4 text-sm">
              <span className="inline-flex items-center gap-1.5 text-ink-2">
                <Clock size={14} /> {featured.readTime}
              </span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--color-primary)] transition-all group-hover:gap-2.5 dark:text-[#fdba74]">
                Read article <ArrowRight size={15} />
              </span>
            </div>
          </div>
        </Link>
      )}

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((post) => (
          <Link
            key={post.slug}
            to="/blog/$slug"
            params={{ slug: post.slug }}
            className="glass-card group flex flex-col p-6 transition-transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <Badge tone={catTone[post.category]}>{post.category}</Badge>
              <span className="text-xs text-ink-2">{fmt(post.date)}</span>
            </div>
            <h3 className="mt-4 flex-1 font-display text-lg font-semibold leading-snug text-ink">
              <span className="blog-card-underline">{post.title}</span>
            </h3>
            <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-ink-2">
              {post.excerpt}
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-ink-2">
              <Clock size={13} /> {post.readTime}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
