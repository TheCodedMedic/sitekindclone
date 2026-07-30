export default function Problem() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg">
      <div className="absolute -left-[10vw] -top-[20vh] h-[60vh] w-[40vw] rounded-full bg-tint blur-[80px]" />
      <div className="relative flex h-full flex-col px-[7vw] py-[9vh]">
        <p className="font-body text-[1.5vw] font-bold uppercase tracking-[0.25em] text-accent">
          The Problem
        </p>
        <h2 className="mt-[2vh] max-w-[70vw] font-display text-[4.2vw] font-extrabold leading-[1.05] tracking-tight text-text">
          Local service businesses are losing work they never see
        </h2>
        <div className="mt-[7vh] grid flex-1 grid-cols-3 gap-[2.5vw]">
          <div className="rounded-[1.5vw] border border-line bg-card p-[2.2vw] shadow-sm">
            <p className="font-display text-[2.4vw] font-bold text-primary">
              Invisible online
            </p>
            <p className="mt-[2vh] font-body text-[1.7vw] leading-relaxed text-muted">
              Plumbers, salons, and repair shops win or lose on Google — but a
              real agency website starts at five figures and takes months.
            </p>
          </div>
          <div className="rounded-[1.5vw] border border-line bg-card p-[2.2vw] shadow-sm">
            <p className="font-display text-[2.4vw] font-bold text-primary">
              Missed calls, missed revenue
            </p>
            <p className="mt-[2vh] font-body text-[1.7vw] leading-relaxed text-muted">
              Owners are on the job, not by the phone. Every unanswered call is
              a customer who books with the next result on the list.
            </p>
          </div>
          <div className="rounded-[1.5vw] border border-line bg-card p-[2.2vw] shadow-sm">
            <p className="font-display text-[2.4vw] font-bold text-primary">
              No time for marketing
            </p>
            <p className="mt-[2vh] font-body text-[1.7vw] leading-relaxed text-muted">
              SEO, content, ads, and reviews demand weekly attention. DIY tools
              hand owners a second job they never asked for.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
