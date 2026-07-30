import { useEffect, useRef } from "react";
import { Section, SectionHeading } from "@/components/ui";
import { Reveal } from "@/components/Reveal";

const BASE = import.meta.env.BASE_URL;

/**
 * Inline promo video — exported from the Sitekind promo motion piece.
 * Autoplays muted + loops while on screen, pauses off screen; the
 * aspect-video wrapper reserves space so there is zero layout shift.
 */
export function PromoVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting && !reducedMotion) {
          video.play().catch(() => {
            /* autoplay blocked — poster stays visible */
          });
        } else {
          video.pause();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <Section className="pb-4 pt-16">
      <SectionHeading
        center
        eyebrow="Sitekind in 25 Seconds"
        title="Watch what runs while you're on the job"
      />
      <Reveal className="mx-auto mt-10 max-w-4xl">
        <div className="glass-card overflow-hidden p-2 shadow-2xl">
          <div className="aspect-video w-full overflow-hidden rounded-xl bg-[var(--surface)]">
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              src={`${BASE}videos/sitekind-promo.mp4`}
              poster={`${BASE}videos/sitekind-promo-poster.jpg`}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="Sitekind promo video: website, AI voice receptionist, and automated SEO for service businesses"
            />
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
