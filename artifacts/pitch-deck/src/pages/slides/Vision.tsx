export default function Vision() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg">
      <div className="absolute -left-[12vw] -top-[25vh] h-[70vh] w-[45vw] rounded-full bg-tint blur-[90px]" />
      <div className="absolute -right-[10vw] bottom-[-25vh] h-[60vh] w-[40vw] rounded-full bg-tint blur-[90px]" />
      <div className="relative flex h-full flex-col justify-center px-[7vw]">
        <p className="font-body text-[1.5vw] font-bold uppercase tracking-[0.25em] text-accent">
          The Vision
        </p>
        <h2 className="mt-[3vh] max-w-[72vw] font-display text-[4.8vw] font-extrabold leading-[1.08] tracking-tight text-text">
          Every main-street business deserves an{' '}
          <span className="text-primary">enterprise-grade</span> digital
          presence
        </h2>
        <p className="mt-[4vh] max-w-[55vw] font-body text-[2vw] leading-relaxed text-muted">
          Millions of service businesses still run on word of mouth and a
          Facebook page. sitekind gives each of them the website, phones, and
          rankings of a company ten times their size — automatically.
        </p>
        <div className="mt-[6vh] flex items-center gap-[2vw]">
          <p className="font-display text-[2.4vw] font-extrabold text-text">
            sitekind
          </p>
          <span className="h-[3.5vh] w-[0.15vw] bg-line" />
          <p className="font-body text-[1.6vw] font-semibold text-muted">
            sitekind.ai
          </p>
        </div>
      </div>
    </div>
  );
}
