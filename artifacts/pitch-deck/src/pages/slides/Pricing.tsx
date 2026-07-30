export default function Pricing() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg">
      <div className="absolute -left-[10vw] -top-[20vh] h-[55vh] w-[40vw] rounded-full bg-tint blur-[80px]" />
      <div className="relative flex h-full flex-col px-[7vw] py-[8vh]">
        <p className="font-body text-[1.5vw] font-bold uppercase tracking-[0.25em] text-accent">
          Pricing
        </p>
        <h2 className="mt-[2vh] font-display text-[4vw] font-extrabold leading-[1.05] tracking-tight text-text">
          Four plans, one upgrade path
        </h2>
        <div className="mt-[6vh] grid flex-1 grid-cols-4 gap-[2vw]">
          <div className="flex flex-col rounded-[1.5vw] border border-line bg-card p-[2vw] shadow-sm">
            <p className="font-display text-[1.8vw] font-bold text-text">
              Starter
            </p>
            <p className="mt-[1.5vh] font-display text-[2.4vw] font-extrabold text-primary">
              $150/mo
            </p>
            <p className="mt-[1.5vh] font-body text-[1.5vw] leading-relaxed text-muted">
              AI-built 5–8 page website, hosted, secured, and maintained.
            </p>
          </div>
          <div className="flex flex-col rounded-[1.5vw] border-[0.2vw] border-primary bg-card p-[2vw] shadow-lg">
            <p className="font-display text-[1.8vw] font-bold text-primary">
              Core Agency
            </p>
            <p className="mt-[1.5vh] font-display text-[2.4vw] font-extrabold text-primary">
              $5,000
            </p>
            <p className="mt-[0.5vh] font-body text-[1.4vw] text-muted">
              first year, then $1,500/yr — financeable at $375/mo
            </p>
            <p className="mt-[1.5vh] font-body text-[1.5vw] leading-relaxed text-muted">
              Premium site, weekly SEO content, ads setup, and citations.
            </p>
          </div>
          <div className="flex flex-col rounded-[1.5vw] border border-line bg-card p-[2vw] shadow-sm">
            <p className="font-display text-[1.8vw] font-bold text-text">
              AI Voice Add-on
            </p>
            <p className="mt-[1.5vh] font-display text-[2.4vw] font-extrabold text-primary">
              $3,500/yr
            </p>
            <p className="mt-[1.5vh] font-body text-[1.5vw] leading-relaxed text-muted">
              24/7 receptionist, missed-call text-back, chatbot, and call
              analytics.
            </p>
          </div>
          <div className="flex flex-col rounded-[1.5vw] border border-line bg-card p-[2vw] shadow-sm">
            <p className="font-display text-[1.8vw] font-bold text-text">
              Mega Package
            </p>
            <p className="mt-[1.5vh] font-display text-[2.4vw] font-extrabold text-primary">
              $15,000
            </p>
            <p className="mt-[1.5vh] font-body text-[1.5vw] leading-relaxed text-muted">
              20-week campaign with a Top-3 Google Maps guarantee — or we keep
              working free.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
