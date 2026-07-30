export const testimonials = [
  {
    quote:
      "The AI answers our phones at 2 AM when a furnace dies. We booked 41 after-hours jobs last quarter that we used to sleep through.",
    author: "Marcus D.",
    role: "Owner, 6-truck HVAC company",
    result: "+41 after-hours jobs / quarter",
  },
  {
    quote:
      "Went from page 3 to the Google Maps 3-pack in 14 weeks. Calls from Google more than doubled and the AI books most of them.",
    author: "Priya S.",
    role: "Owner, plumbing company (2 locations)",
    result: "Page 3 → Maps 3-pack in 14 weeks",
  },
  {
    quote:
      "Reservations used to go to voicemail on Friday nights. Now the AI books tables while my whole staff is on the floor.",
    author: "Rosa M.",
    role: "Owner, full-service restaurant",
    result: "+28% Friday reservations",
  },
  {
    quote:
      "One booked consultation from the new site paid for the entire package. We closed a $62k kitchen remodel in week five.",
    author: "Tom H.",
    role: "Owner, design-build remodeler",
    result: "$62k project closed in week 5",
  },
];

export const proofPoints = [
  { value: "$5.4M+", label: "revenue generated across portfolio brands" },
  { value: "24 hrs", label: "from signup to live website" },
  { value: "91.7%", label: "payment success rate" },
  { value: "90%", label: "cheaper than a human receptionist" },
];

export const howItWorks = [
  {
    step: "01",
    title: "We Build It",
    body: "We pull your Google Business Profile — photos, reviews, hours, services — and generate a complete, conversion-optimized website before you ever fill out a form.",
    icon: "sparkles" as const,
  },

  {
    step: "02",
    title: "AI Handles Your Calls",
    body: "Our voice agent answers every call, books appointments, and never puts a customer on hold. Missed calls get a text back within 30 seconds.",
    icon: "phone" as const,
  },
  {
    step: "03",
    title: "You Rank Higher",
    body: "Automated SEO content and Google Maps optimization push you above competitors week after week, while you focus on running your business.",
    icon: "trending" as const,
  },
];

export const featureCards = [
  {
    slug: "ai-websites",
    icon: "globe" as const,
    title: "AI Website Generation",
    body: "A 10–15 page conversion-optimized site, generated from your real business data and written by AI. Live in 24 hours.",
  },
  {
    slug: "voice-agent",
    icon: "phone" as const,
    title: "AI Voice Receptionist",
    body: "A 24/7 voice agent that answers every call, books appointments, and texts back the ones it misses. Never sleeps.",
  },
  {
    slug: "automated-seo",
    icon: "pen" as const,
    title: "Automated SEO & Content",
    body: "Weekly SEO blog posts, service pages, and Google Business Profile updates — all written by AI and quality-judged before publishing.",
  },
  {
    slug: "google-maps",
    icon: "map" as const,
    title: "Google Maps Dominance",
    body: "An aggressive 20-week campaign — citations, reviews, and competitor displacement — to reach the Maps 3-pack. Guaranteed.",
  },
];

// Homepage vs-agency comparison (spec §16.2)
export const featureComparison = {
  rows: [
    "Conversion-optimized website",
    "Copywriting included",
    "Weekly SEO content",
    "24/7 AI phone answering",
    "Google Business Profile management",
    "Citation building",
    "Live in 24 hours",
    "Fixed, predictable pricing",
    "No long-term contract required",
    "You own your domain & site",
  ],
  columns: [
    { name: "sitekind", values: [true, true, true, true, true, true, true, true, true, true] },
    { name: "Traditional Agency", values: [true, true, true, false, true, true, false, false, false, "sometimes"] },
    { name: "DIY Builder", values: ["template", false, false, false, false, false, false, true, true, true] },
  ],
};
