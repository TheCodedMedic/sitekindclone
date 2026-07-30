export default function ClientExperience() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg">
      <div className="absolute -left-[10vw] top-[35vh] h-[60vh] w-[40vw] rounded-full bg-tint blur-[80px]" />
      <div className="relative grid h-full grid-cols-[1fr_1.1fr] items-center gap-[4vw] px-[7vw]">
        <div>
          <p className="font-body text-[1.5vw] font-bold uppercase tracking-[0.25em] text-accent">
            The Client Experience
          </p>
          <h2 className="mt-[2vh] font-display text-[4vw] font-extrabold leading-[1.05] tracking-tight text-text">
            From first look to daily use
          </h2>
          <p className="mt-[3vh] max-w-[34vw] font-body text-[1.85vw] leading-relaxed text-muted">
            The sale starts with a finished preview, not a proposal — and after
            launch, owners manage everything from one portal.
          </p>
        </div>
        <div className="flex flex-col gap-[2.5vh]">
          <div className="flex items-start gap-[1.5vw] rounded-[1.5vw] border border-line bg-card px-[2vw] py-[2.5vh] shadow-sm">
            <span className="mt-[0.5vh] h-[1.2vw] w-[1.2vw] shrink-0 rounded-full bg-primary" />
            <div>
              <p className="font-display text-[1.9vw] font-bold text-text">
                Demo wizard
              </p>
              <p className="mt-[0.5vh] font-body text-[1.6vw] leading-relaxed text-muted">
                Owners enter their business name and see their own finished
                website — the preview is the pitch.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-[1.5vw] rounded-[1.5vw] border border-line bg-card px-[2vw] py-[2.5vh] shadow-sm">
            <span className="mt-[0.5vh] h-[1.2vw] w-[1.2vw] shrink-0 rounded-full bg-accent" />
            <div>
              <p className="font-display text-[1.9vw] font-bold text-text">
                Client portal
              </p>
              <p className="mt-[0.5vh] font-body text-[1.6vw] leading-relaxed text-muted">
                Calls, bookings, content, and rankings in one dashboard, with
                monthly performance reports.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-[1.5vw] rounded-[1.5vw] border border-line bg-card px-[2vw] py-[2.5vh] shadow-sm">
            <span className="mt-[0.5vh] h-[1.2vw] w-[1.2vw] shrink-0 rounded-full bg-primary" />
            <div>
              <p className="font-display text-[1.9vw] font-bold text-text">
                Ownership, not lock-in
              </p>
              <p className="mt-[0.5vh] font-body text-[1.6vw] leading-relaxed text-muted">
                Clients own their website outright and can cancel the low
                annual maintenance at any time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
