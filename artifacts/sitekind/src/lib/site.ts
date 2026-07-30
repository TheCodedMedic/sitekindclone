export const site = {
  name: "sitekind",
  tagline: "The Fully Automated Digital Agency for Service Businesses.",
  description:
    "Enterprise-grade website, AI voice receptionist, and automated SEO for service businesses — built and managed for you, from $150/mo.",
  url: "https://sitekind.ai",
  portfolioRevenue: "$5.4M+",
  paymentSuccess: "91.7%",
} as const;

export const nav = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features" },
  { label: "Industries", href: "/industries" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
] as const;

export const footerColumns = [
  {
    heading: "Product",
    links: [
      { label: "AI Website Generation", href: "/features/ai-websites" },
      { label: "AI Voice Receptionist", href: "/features/voice-agent" },
      { label: "Automated SEO & Content", href: "/features/automated-seo" },
      { label: "Google Maps Dominance", href: "/features/google-maps" },
      { label: "Pricing", href: "/pricing" },
      { label: "ROI Calculator", href: "/roi-calculator" },
    ],
  },
  {
    heading: "Industries",
    links: [
      { label: "HVAC & Plumbing", href: "/industries/hvac" },
      { label: "Restaurants", href: "/industries/restaurants" },
      { label: "Beauty & Salons", href: "/industries/beauty-salons" },
      { label: "Landscaping", href: "/industries/landscaping" },
      { label: "Auto Repair", href: "/industries/auto-repair" },
      { label: "All Industries", href: "/industries" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Agency Partners", href: "/partners" },
      { label: "Contact", href: "/contact" },
      { label: "Client Login", href: "/login" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Terms of Service", href: "/legal/terms" },
      { label: "AI Ethics Statement", href: "/legal/ai-ethics" },
    ],
  },
] as const;
