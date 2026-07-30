import type { BusinessProfile } from "@/lib/demoApi";

export type Evidence = {
  reservations: boolean;
  onlineOrder: boolean;
  menu: boolean;
  reviews: boolean;
  hours: boolean;
  gallery: boolean;
  phoneCta: boolean;
  emergencyService: boolean;
  pricingTiers: boolean;
  classSchedule: boolean;
  /** Tasting/tour language (vineyards, experience-led hospitality) — drives
   * "Tastings & Tours" vocabulary when menu evidence is absent. */
  tastingTour: boolean;
};

const RESERVE_RX = /\b(reserv(e|ation)|book (a )?(table|room)|opentable|resy|tock)\b/i;
const MENU_RX = /\b(menu|pizza|pie|slice|burger|taco|sandwich|brunch|breakfast|lunch|dinner|entree|appetizer|dessert|pastr(y|ies)|coffee|espresso|bbq|barbecue|sushi|noodle|bowl|plate|kitchen|chef|dish(es)?|catering|bakery|deli)\b/i;
const ORDER_RX = /\b(order online|order (now|pickup|delivery)|toast|doordash|uber ?eats|grubhub|chownow|slice|seamless)\b/i;
const EMERGENCY_RX = /\b(24[\/\s-]?7|24 hour|emergency|same[- ]day)\b/i;
const TIER_RX = /\b(basic|standard|pro|premium|signature|deluxe|ultimate|package|tier|plan)\b/i;
const CLASS_RX = /\b(mon|tue|wed|thu|fri|sat|sun)(day)?\b.*\b\d{1,2}(:\d{2})?\s?(am|pm)\b/i;
const TASTING_TOUR_RX = /\b(tastings?|tours?|flights?|tasting room)\b/i;

function anyMatch(rx: RegExp, ...s: (string | null | undefined)[]) {
  return s.some((x) => x && rx.test(x));
}

export function deriveEvidence(p: BusinessProfile): Evidence {
  const serviceBlob = p.services.map((s) => `${s.name} ${s.blurb}`).join(" ");
  // NOTE: ctaLabel is intentionally excluded — it is model-generated and
  // would create a circular check ("Reserve a Table" → reservations=true
  // → button rendered) with zero source evidence.
  const allText = `${p.about} ${p.tagline} ${p.heroHeadline} ${p.heroSub} ${serviceBlob}`;

  const reservations = anyMatch(RESERVE_RX, allText);
  const onlineOrder = anyMatch(ORDER_RX, allText);
  // Requires actual food/menu language, not just the vertical — a vineyard's
  // tastings/tours land in restaurant-hospitality but are not a menu.
  const menu =
    p.vertical === "restaurant-hospitality" &&
    p.services.length >= 3 &&
    anyMatch(MENU_RX, serviceBlob, p.about, p.heroSub);

  return {
    reservations,
    onlineOrder,
    menu,
    reviews: (p.reviews?.length ?? 0) >= 1,
    hours: Boolean(p.hoursLine && p.hoursLine.trim().length > 0),
    gallery: (p.photoUrls?.length ?? 0) >= 3,
    phoneCta: Boolean(p.phone),
    emergencyService: anyMatch(EMERGENCY_RX, allText),
    pricingTiers: p.services.length >= 3 && anyMatch(TIER_RX, serviceBlob),
    classSchedule: anyMatch(CLASS_RX, allText) || (p.vertical === "fitness" && p.services.length >= 4),
    tastingTour: anyMatch(TASTING_TOUR_RX, serviceBlob, p.about, p.heroSub),
  };
}

export function pickPrimaryCta(p: BusinessProfile, e: Evidence): { label: string; kind: "reserve" | "order" | "call" | "quote" } {
  if (p.vertical === "restaurant-hospitality") {
    if (e.reservations) return { label: "Reserve a Table", kind: "reserve" };
    if (e.onlineOrder) return { label: "Order Online", kind: "order" };
  }
  if (e.phoneCta) return { label: p.ctaLabel || "Call Now", kind: "call" };
  return { label: p.ctaLabel || "Get in Touch", kind: "quote" };
}
