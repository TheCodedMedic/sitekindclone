const base = import.meta.env.BASE_URL;

export default function Title() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg">
      <img
        src={`${base}hero.png`}
        crossOrigin="anonymous"
        alt="A local service business on main street"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#2a2118]/85 via-[#2a2118]/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 px-[7vw] pb-[9vh]">
        <p className="font-body text-[1.6vw] font-bold uppercase tracking-[0.25em] text-[#fdba74]">
          Investor &amp; Partner Overview
        </p>
        <h1 className="mt-[2vh] font-display text-[8vw] font-extrabold leading-none tracking-tight text-[#fffbf5]">
          sitekind
        </h1>
        <p className="mt-[3vh] max-w-[52vw] font-body text-[2.2vw] font-semibold leading-snug text-[#f7f1e8]">
          The fully automated digital agency for service businesses.
        </p>
        <p className="mt-[2vh] font-body text-[1.6vw] text-[#c4b5a4]">
          Website, AI voice receptionist, and automated SEO — built and managed
          for you, from $150/mo.
        </p>
      </div>
    </div>
  );
}
