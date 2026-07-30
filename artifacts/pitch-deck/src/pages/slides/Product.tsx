export default function Product() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg">
      <div className="absolute -right-[10vw] -top-[20vh] h-[60vh] w-[40vw] rounded-full bg-tint blur-[80px]" />
      <div className="relative flex h-full flex-col px-[7vw] py-[8vh]">
        <p className="font-body text-[1.5vw] font-bold uppercase tracking-[0.25em] text-accent">
          The Product
        </p>
        <h2 className="mt-[2vh] font-display text-[4vw] font-extrabold leading-[1.05] tracking-tight text-text">
          Four AI systems, one platform
        </h2>
        <div className="mt-[5vh] grid flex-1 grid-cols-2 grid-rows-2 gap-[2vw]">
          <div className="rounded-[1.5vw] border border-line bg-card p-[2vw] shadow-sm">
            <p className="font-display text-[2vw] font-bold text-primary">
              AI Website Generation
            </p>
            <p className="mt-[1vh] font-body text-[1.6vw] leading-relaxed text-muted">
              A 10–15 page conversion-optimized site, written by AI from real
              business data. Live in 24 hours.
            </p>
          </div>
          <div className="rounded-[1.5vw] border border-line bg-card p-[2vw] shadow-sm">
            <p className="font-display text-[2vw] font-bold text-primary">
              AI Voice Receptionist
            </p>
            <p className="mt-[1vh] font-body text-[1.6vw] leading-relaxed text-muted">
              Answers every call, books appointments, and texts back the ones
              it misses. Never sleeps.
            </p>
          </div>
          <div className="rounded-[1.5vw] border border-line bg-card p-[2vw] shadow-sm">
            <p className="font-display text-[2vw] font-bold text-primary">
              Automated SEO &amp; Content
            </p>
            <p className="mt-[1vh] font-body text-[1.6vw] leading-relaxed text-muted">
              Weekly blog posts, service pages, and profile updates — written
              by AI and quality-judged before publishing.
            </p>
          </div>
          <div className="rounded-[1.5vw] border border-line bg-card p-[2vw] shadow-sm">
            <p className="font-display text-[2vw] font-bold text-primary">
              Google Maps Dominance
            </p>
            <p className="mt-[1vh] font-body text-[1.6vw] leading-relaxed text-muted">
              Citations, reviews, and local signals managed continuously — with
              a Top-3 Maps guarantee on the flagship plan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
