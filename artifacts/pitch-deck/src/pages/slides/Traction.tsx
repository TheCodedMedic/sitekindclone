export default function Traction() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg">
      <div className="absolute -right-[12vw] top-[20vh] h-[65vh] w-[45vw] rounded-full bg-tint blur-[90px]" />
      <div className="relative flex h-full flex-col justify-center px-[7vw]">
        <p className="font-body text-[1.5vw] font-bold uppercase tracking-[0.25em] text-accent">
          Traction
        </p>
        <h2 className="mt-[2vh] font-display text-[4vw] font-extrabold leading-[1.05] tracking-tight text-text">
          The numbers so far
        </h2>
        <div className="mt-[7vh] grid grid-cols-4 gap-[2.5vw]">
          <div>
            <p className="font-display text-[4.6vw] font-extrabold leading-none text-primary">
              $5.4M+
            </p>
            <p className="mt-[1.5vh] font-body text-[1.6vw] font-semibold leading-snug text-muted">
              revenue generated across portfolio brands
            </p>
          </div>
          <div>
            <p className="font-display text-[4.6vw] font-extrabold leading-none text-primary">
              24 hrs
            </p>
            <p className="mt-[1.5vh] font-body text-[1.6vw] font-semibold leading-snug text-muted">
              from signup to live website
            </p>
          </div>
          <div>
            <p className="font-display text-[4.6vw] font-extrabold leading-none text-primary">
              91.7%
            </p>
            <p className="mt-[1.5vh] font-body text-[1.6vw] font-semibold leading-snug text-muted">
              payment success rate
            </p>
          </div>
          <div>
            <p className="font-display text-[4.6vw] font-extrabold leading-none text-primary">
              90%
            </p>
            <p className="mt-[1.5vh] font-body text-[1.6vw] font-semibold leading-snug text-muted">
              cheaper than a human receptionist
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
