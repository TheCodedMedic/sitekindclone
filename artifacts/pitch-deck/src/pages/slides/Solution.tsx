export default function Solution() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg">
      <div className="absolute -right-[12vw] top-[30vh] h-[70vh] w-[45vw] rounded-full bg-tint blur-[90px]" />
      <div className="relative grid h-full grid-cols-[1.1fr_1fr] items-center gap-[4vw] px-[7vw]">
        <div>
          <p className="font-body text-[1.5vw] font-bold uppercase tracking-[0.25em] text-accent">
            The Solution
          </p>
          <h2 className="mt-[2vh] font-display text-[4.2vw] font-extrabold leading-[1.05] tracking-tight text-text">
            An entire agency, run by automation
          </h2>
          <p className="mt-[3vh] max-w-[38vw] font-body text-[1.9vw] leading-relaxed text-muted">
            sitekind generates a complete, conversion-optimized website from a
            business's real data — then keeps the phones answered and the
            rankings climbing, without a human team behind it.
          </p>
        </div>
        <div className="flex flex-col gap-[3vh]">
          <div className="rounded-[1.5vw] bg-primary px-[2.2vw] py-[3vh] text-[#fffbf5] shadow-lg">
            <p className="font-display text-[3.4vw] font-extrabold leading-none">
              24 hours
            </p>
            <p className="mt-[1vh] font-body text-[1.7vw] font-semibold">
              from signup to live website
            </p>
          </div>
          <div className="rounded-[1.5vw] border border-line bg-card px-[2.2vw] py-[3vh] shadow-sm">
            <p className="font-display text-[3.4vw] font-extrabold leading-none text-accent">
              $150/mo
            </p>
            <p className="mt-[1vh] font-body text-[1.7vw] font-semibold text-muted">
              entry price — a fraction of agency retainers
            </p>
          </div>
          <div className="rounded-[1.5vw] border border-line bg-card px-[2.2vw] py-[3vh] shadow-sm">
            <p className="font-display text-[3.4vw] font-extrabold leading-none text-accent">
              Zero effort
            </p>
            <p className="mt-[1vh] font-body text-[1.7vw] font-semibold text-muted">
              built and managed for the owner, not by the owner
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
