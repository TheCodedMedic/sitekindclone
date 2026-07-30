export default function HowItWorks() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg">
      <div className="absolute -left-[8vw] bottom-[-25vh] h-[60vh] w-[40vw] rounded-full bg-tint blur-[80px]" />
      <div className="relative flex h-full flex-col px-[7vw] py-[9vh]">
        <p className="font-body text-[1.5vw] font-bold uppercase tracking-[0.25em] text-accent">
          How It Works
        </p>
        <h2 className="mt-[2vh] font-display text-[4.2vw] font-extrabold leading-[1.05] tracking-tight text-text">
          Preview first, pay later
        </h2>
        <div className="mt-[7vh] grid flex-1 grid-cols-3 gap-[2.5vw]">
          <div className="flex flex-col rounded-[1.5vw] border border-line bg-card p-[2.2vw] shadow-sm">
            <p className="font-display text-[2.8vw] font-extrabold text-primary">
              01
            </p>
            <p className="mt-[1.5vh] font-display text-[2vw] font-bold text-text">
              We build it before you buy
            </p>
            <p className="mt-[1.5vh] font-body text-[1.65vw] leading-relaxed text-muted">
              We pull the Google Business Profile — photos, reviews, hours,
              services — and generate the full site before the owner fills out
              a single form.
            </p>
          </div>
          <div className="flex flex-col rounded-[1.5vw] border border-line bg-card p-[2.2vw] shadow-sm">
            <p className="font-display text-[2.8vw] font-extrabold text-primary">
              02
            </p>
            <p className="mt-[1.5vh] font-display text-[2vw] font-bold text-text">
              AI answers every call
            </p>
            <p className="mt-[1.5vh] font-body text-[1.65vw] leading-relaxed text-muted">
              A 24/7 voice agent answers, books appointments, and texts back
              missed calls within 30 seconds.
            </p>
          </div>
          <div className="flex flex-col rounded-[1.5vw] border border-line bg-card p-[2.2vw] shadow-sm">
            <p className="font-display text-[2.8vw] font-extrabold text-primary">
              03
            </p>
            <p className="mt-[1.5vh] font-display text-[2vw] font-bold text-text">
              Rankings climb on autopilot
            </p>
            <p className="mt-[1.5vh] font-body text-[1.65vw] leading-relaxed text-muted">
              Weekly SEO content and Google Maps optimization push the business
              above competitors while the owner runs the business.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
