export default function Market() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg">
      <div className="absolute -right-[10vw] bottom-[-20vh] h-[55vh] w-[40vw] rounded-full bg-tint blur-[80px]" />
      <div className="relative flex h-full flex-col px-[7vw] py-[8vh]">
        <p className="font-body text-[1.5vw] font-bold uppercase tracking-[0.25em] text-accent">
          The Market
        </p>
        <h2 className="mt-[2vh] font-display text-[4vw] font-extrabold leading-[1.05] tracking-tight text-text">
          Priced between DIY and the agency no one can afford
        </h2>
        <div className="mt-[6vh] grid flex-1 grid-cols-4 gap-[2vw]">
          <div className="flex flex-col rounded-[1.5vw] border border-line bg-card p-[2vw] shadow-sm">
            <p className="font-display text-[1.8vw] font-bold text-text">
              Traditional agency
            </p>
            <p className="mt-[2vh] font-display text-[2.6vw] font-extrabold text-muted">
              $10k+
            </p>
            <p className="mt-[1vh] font-body text-[1.55vw] leading-relaxed text-muted">
              Custom work, human retainers, months of lead time.
            </p>
          </div>
          <div className="flex flex-col rounded-[1.5vw] border border-line bg-card p-[2vw] shadow-sm">
            <p className="font-display text-[1.8vw] font-bold text-text">
              Freelancer
            </p>
            <p className="mt-[2vh] font-display text-[2.6vw] font-extrabold text-muted">
              Varies
            </p>
            <p className="mt-[1vh] font-body text-[1.55vw] leading-relaxed text-muted">
              One person, one skill set — no ongoing SEO, content, or phones.
            </p>
          </div>
          <div className="flex flex-col rounded-[1.5vw] border border-line bg-card p-[2vw] shadow-sm">
            <p className="font-display text-[1.8vw] font-bold text-text">
              DIY builders
            </p>
            <p className="mt-[2vh] font-display text-[2.6vw] font-extrabold text-muted">
              Owner's time
            </p>
            <p className="mt-[1vh] font-body text-[1.55vw] leading-relaxed text-muted">
              Cheap tools that make the website the owner's second job.
            </p>
          </div>
          <div className="flex flex-col rounded-[1.5vw] bg-accent p-[2vw] text-[#fffbf5] shadow-lg">
            <p className="font-display text-[1.8vw] font-bold">sitekind</p>
            <p className="mt-[2vh] font-display text-[2.6vw] font-extrabold">
              From $150/mo
            </p>
            <p className="mt-[1vh] font-body text-[1.55vw] leading-relaxed text-[#e3f1f5]">
              Agency-grade output at software prices — because AI does the
              work.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
