export type Plan = {
  id: string;
  name: string;
  blurb: string;
  price: string;
  priceNote: string;
  financing?: string;
  cta: string;
  bestFor: string;
  highlighted?: boolean;
  badge?: string;
  features: string[];
};

export const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    blurb: "A professional AI-built website, hosted and maintained.",
    price: "$150",
    priceNote: "per month",
    cta: "Start for $150/mo",
    bestFor: "New or price-sensitive businesses that need a credible web presence now.",
    features: [
      "AI-generated 5–8 page website",
      "Mobile-responsive design",
      "Secure hosting + SSL certificate",
      "Uptime monitoring & security patches",
      "Monthly performance report",
      "1 design revision per quarter",
    ],
  },
  {
    id: "core",
    name: "Core Agency",
    blurb: "A complete digital transformation, delivered by automation.",
    price: "$5,000",
    priceNote: "first year · then $1,500/yr",
    financing: "or $500 down + $375/mo × 12",
    cta: "Get the Core Package",
    bestFor: "Established service businesses ready to grow calls, bookings, and rankings.",
    highlighted: true,
    badge: "Most Popular",
    features: [
      "Premium 10–15 page conversion-optimized site",
      "All copy written by AI from your business data",
      "LLM-guided Google Ads setup",
      "Weekly SEO blog posts, auto-published",
      "Google Business Profile optimization",
      "Citations across top 30 directories",
      "Analytics dashboard + monthly reports",
      "Quarterly strategy call",
    ],
  },
  {
    id: "ai-addon",
    name: "AI Automation Add-on",
    blurb: "A 24/7 AI receptionist that answers, books, and follows up.",
    price: "$3,500",
    priceNote: "per year · ≈ $292/mo",
    cta: "Add AI Voice Agent",
    bestFor: "Any business losing revenue to missed calls (that's most of them).",
    features: [
      "24/7 AI voice agent — answers & books",
      "Missed-call text-back in 30 seconds",
      "Website AI chatbot on your data",
      "CRM & calendar integration",
      "Call recording + transcription",
      "Monthly call & revenue analytics",
    ],
  },
  {
    id: "mega",
    name: "Mega Package",
    blurb: "Keyword dominance in Google Maps within 20 weeks.",
    price: "$15,000",
    priceNote: "one-time · then $1,500/yr",
    cta: "Dominate Your Market",
    bestFor: "Established businesses ($500k+ revenue) that want the #1 spot, guaranteed.",
    badge: "Performance Guarantee",
    features: [
      "Everything in Core + AI Add-on",
      "20-week aggressive SEO campaign",
      "200+ citations built & managed",
      "Automated review generation system",
      "Competitor displacement strategy",
      "Local PR syndication & backlinks",
      "Bi-weekly strategy calls",
      "Top 3 Maps ranking — or we keep working free",
    ],
  },
];

export const comparisonMatrix = {
  criteria: [
    "Website design & build",
    "Hosting, SSL & security",
    "SEO blog content",
    "Google Business Profile",
    "Citation building",
    "Google Ads setup",
    "AI voice receptionist",
    "Review generation",
    "Strategy calls",
    "Performance guarantee",
  ],
  columns: [
    { name: "Starter", values: ["5–8 pages", "✓", "—", "—", "—", "—", "—", "—", "—", "—"] },
    {
      name: "Core Agency",
      values: ["10–15 pages", "✓", "Weekly", "Full optimization", "Top 30", "✓", "Add-on", "—", "Quarterly", "—"],
    },
    {
      name: "Core + AI",
      values: ["10–15 pages", "✓", "Weekly", "Full optimization", "Top 30", "✓", "24/7 included", "—", "Quarterly", "—"],
    },
    {
      name: "Mega",
      values: ["10–15 pages", "✓", "Weekly", "Full optimization", "200+", "✓", "24/7 included", "Automated", "Bi-weekly", "Top 3 in 20 wks"],
    },
  ],
};

export const marketComparison = {
  rows: [
    { service: "Website design", agency: "$5,000–$15,000", freelancer: "$2,000–$5,000", diy: "$200–$500/yr", us: "Included" },
    { service: "Monthly SEO", agency: "$1,500–$5,000/mo", freelancer: "$500–$1,500/mo", diy: "N/A", us: "Included" },
    { service: "Content creation", agency: "$500–$2,000/mo", freelancer: "$200–$800/mo", diy: "DIY", us: "Included (automated)" },
    { service: "AI voice agent", agency: "$500–$2,000/mo", freelancer: "N/A", diy: "N/A", us: "$292/mo add-on" },
    { service: "Google Ads mgmt", agency: "$500–$2,000/mo", freelancer: "$300–$800/mo", diy: "DIY", us: "Included" },
    { service: "GBP optimization", agency: "$300–$500/mo", freelancer: "$100–$300/mo", diy: "DIY", us: "Included" },
  ],
  totals: {
    agency: "$48,000–$120,000",
    freelancer: "$15,000–$40,000",
    diy: "$2,000–$5,000",
    us: "$5,000–$15,000",
  },
};
