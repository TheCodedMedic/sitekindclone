export type Industry = {
  slug: string;
  name: string;
  shortName: string;
  avgSpend: string;
  heroHook: string;
  painPoints: { title: string; body: string }[];
  services: string[];
  previewBusiness: {
    name: string;
    city: string;
    rating: number;
    reviews: number;
    phone: string;
    tagline: string;
  };
  testimonial: { quote: string; author: string; result: string };
  stat: string;
};

export const industries: Industry[] = [
  {
    slug: "hvac",
    name: "HVAC & Plumbing",
    shortName: "HVAC",
    avgSpend: "$4,200",
    heroHook:
      "Customers call when their AC breaks. If you don't answer, they call your competitor.",
    painPoints: [
      {
        title: "Missed calls are missed jobs",
        body: "The average HVAC company misses 30% of inbound calls during peak season. Each missed call is a $200–$500 service ticket handed to the next listing on Google.",
      },
      {
        title: "Emergency search is winner-take-all",
        body: "“Emergency AC repair near me” searches convert within minutes. If you're not in the Maps 3-pack with strong reviews, you don't exist.",
      },
      {
        title: "Agencies charge truck-payment prices",
        body: "Traditional agencies quote $2,000–$5,000 per month for SEO alone — more than most three-truck shops can justify.",
      },
    ],
    services: ["AC Repair", "Furnace Installation", "Duct Cleaning", "Emergency Service", "Water Heaters", "Maintenance Plans"],
    previewBusiness: {
      name: "Joe's HVAC & Air",
      city: "Plano, TX",
      rating: 4.7,
      reviews: 89,
      phone: "(972) 555-0148",
      tagline: "Fast, honest heating & cooling — 24/7 emergency service.",
    },
    testimonial: {
      quote:
        "The AI answers our phones at 2 AM when a furnace dies. We booked 41 after-hours jobs last quarter that we used to sleep through.",
      author: "Owner, 6-truck HVAC company (pilot program)",
      result: "+41 after-hours bookings per quarter",
    },
    stat: "Turn 2 AM emergency calls into booked service tickets — automatically.",
  },
  {
    slug: "restaurants",
    name: "Restaurants & Hospitality",
    shortName: "Restaurants",
    avgSpend: "$3,500",
    heroHook:
      "Your menu changed six months ago. Your website still doesn't know.",
    painPoints: [
      {
        title: "Third-party apps eat your margin",
        body: "Delivery platforms take 15–30% per order. A direct website with online ordering and reservations keeps that margin in your kitchen.",
      },
      {
        title: "Diners decide on Google, not your door",
        body: "Hours, photos, menus, and reviews on your Google Business Profile decide whether a table gets filled — and most profiles are unclaimed or stale.",
      },
      {
        title: "No time to market during service",
        body: "You're plating dishes at 7 PM, not writing blog posts. Automated content and profile updates run while you run the line.",
      },
    ],
    services: ["Online Menu", "Reservations", "Private Events", "Catering", "Gift Cards", "Order Online"],
    previewBusiness: {
      name: "La Cocina de Rosa",
      city: "Santa Fe, NM",
      rating: 4.8,
      reviews: 312,
      phone: "(505) 555-0192",
      tagline: "Family recipes, wood-fired flavor, patio dining.",
    },
    testimonial: {
      quote:
        "Reservations used to go to voicemail on Friday nights. Now the AI books tables while my whole staff is on the floor.",
      author: "Owner, full-service restaurant (pilot program)",
      result: "+28% Friday reservations",
    },
    stat: "Book tables and take orders while your kitchen runs full service.",
  },
  {
    slug: "beauty-salons",
    name: "Beauty & Salons",
    shortName: "Salons",
    avgSpend: "$2,800",
    heroHook:
      "Every unanswered call during a color treatment is a client booking somewhere else.",
    painPoints: [
      {
        title: "Your hands are literally full",
        body: "Stylists can't answer phones mid-appointment. The AI receptionist books, reschedules, and answers pricing questions while you work.",
      },
      {
        title: "No-shows drain the book",
        body: "Automated confirmations and reminder texts cut no-shows dramatically — without paying a front-desk salary.",
      },
      {
        title: "Instagram isn't a booking system",
        body: "A DM inbox is where appointments go to die. A real website with 24/7 booking turns followers into clients.",
      },
    ],
    services: ["Cuts & Styling", "Color & Balayage", "Extensions", "Nails", "Skincare", "Bridal"],
    previewBusiness: {
      name: "Velvet & Vine Salon",
      city: "Franklin, TN",
      rating: 4.9,
      reviews: 204,
      phone: "(615) 555-0134",
      tagline: "Color specialists. Book online in 30 seconds.",
    },
    testimonial: {
      quote:
        "I used to lose bookings every single day because we couldn't get to the phone. Now nothing slips through.",
      author: "Owner, 8-chair salon (pilot program)",
      result: "0 missed booking calls since launch",
    },
    stat: "Book clients online in 30 seconds — no front-desk hire required.",
  },
  {
    slug: "landscaping",
    name: "Landscaping & Lawn Care",
    shortName: "Landscaping",
    avgSpend: "$2,400",
    heroHook:
      "Spring rush fills your voicemail. The AI turns that voicemail into a schedule.",
    painPoints: [
      {
        title: "Seasonal demand spikes overwhelm you",
        body: "March through June, the phone doesn't stop — and you're on a mower. Every call gets answered, quoted, and scheduled automatically.",
      },
      {
        title: "Route density decides your profit",
        body: "Local SEO that wins whole neighborhoods, not scattered one-offs, is the difference between profit and windshield time.",
      },
      {
        title: "Word of mouth doesn't scale",
        body: "Automated review requests after every job compound your reputation while you focus on the work.",
      },
    ],
    services: ["Weekly Mowing", "Landscape Design", "Irrigation", "Hardscaping", "Seasonal Cleanup", "Tree Care"],
    previewBusiness: {
      name: "GreenLine Lawn & Landscape",
      city: "Overland Park, KS",
      rating: 4.6,
      reviews: 143,
      phone: "(913) 555-0177",
      tagline: "Neighborhood lawn care on a schedule you can trust.",
    },
    testimonial: {
      quote:
        "During spring cleanup season the AI booked estimates while both crews were out. It paid for the year in three weeks.",
      author: "Owner, 2-crew landscaping company (pilot program)",
      result: "63 estimates booked in peak month",
    },
    stat: "Book estimates while your crews are out running mowers.",
  },
  {
    slug: "auto-repair",
    name: "Automotive Repair",
    shortName: "Auto Repair",
    avgSpend: "$3,100",
    heroHook:
      "A dead car means a stressed customer calling down the Google list. Be the shop that answers.",
    painPoints: [
      {
        title: "Bays full, phone ringing",
        body: "Your techs bill hours under the hood, not on the phone. The AI answers, quotes common services, and books drop-offs.",
      },
      {
        title: "Trust is the whole sale",
        body: "Drivers pick shops on reviews and professionalism. A modern site with real reviews beats a decade-old single-pager every time.",
      },
      {
        title: "“Near me” is your storefront",
        body: "Maps ranking drives walk-in volume. Automated citations and GBP posts push you into the 3-pack and keep you there.",
      },
    ],
    services: ["Oil & Fluids", "Brakes", "Engine Diagnostics", "Tires & Alignment", "AC Service", "State Inspection"],
    previewBusiness: {
      name: "Summit Auto Care",
      city: "Boise, ID",
      rating: 4.7,
      reviews: 251,
      phone: "(208) 555-0163",
      tagline: "Honest diagnostics. Same-day service on most repairs.",
    },
    testimonial: {
      quote:
        "The missed-call text-back alone recovered a dozen jobs the first month. Customers text back even when they won't call twice.",
      author: "Owner, independent repair shop (pilot program)",
      result: "12 recovered jobs in month one",
    },
    stat: "Recover the missed calls that are walking into your competitor's bay.",
  },
  {
    slug: "remodeling",
    name: "Home Remodeling",
    shortName: "Remodeling",
    avgSpend: "$3,800",
    heroHook:
      "A $40,000 kitchen remodel starts with a website that looks like it deserves the job.",
    painPoints: [
      {
        title: "High-ticket buyers research hard",
        body: "Homeowners vet remodelers for weeks. A portfolio-grade website with reviews and project galleries wins the shortlist.",
      },
      {
        title: "Slow follow-up kills big leads",
        body: "Remodel leads go cold in days. Instant AI response and booked consultations keep your pipeline warm without a sales hire.",
      },
      {
        title: "Referrals cap your growth",
        body: "Referral-only pipelines swing between famine and feast. Ranked local search delivers steady, qualified project inquiries.",
      },
    ],
    services: ["Kitchen Remodels", "Bathroom Remodels", "Basements", "Additions", "Exterior", "Design-Build"],
    previewBusiness: {
      name: "Harbor Ridge Remodeling",
      city: "Annapolis, MD",
      rating: 4.9,
      reviews: 98,
      phone: "(410) 555-0121",
      tagline: "Design-build remodeling, from first sketch to final walkthrough.",
    },
    testimonial: {
      quote:
        "One booked consultation from the new site paid for the entire package. We closed a $62k kitchen in week five.",
      author: "Owner, design-build remodeler (pilot program)",
      result: "$62k project closed in week 5",
    },
    stat: "Look like the remodeler who deserves the $40k kitchen job.",
  },
  {
    slug: "fitness",
    name: "Fitness & Recreation",
    shortName: "Fitness",
    avgSpend: "$3,000",
    heroHook:
      "Memberships are sold in the moment of motivation. Your website has to close in that moment.",
    painPoints: [
      {
        title: "Motivation has a short shelf life",
        body: "Prospects who can't book a trial class in 60 seconds move on. Frictionless online signup converts the impulse.",
      },
      {
        title: "Churn erodes every win",
        body: "Automated schedules, announcements, and content keep members engaged between visits — without a marketing coordinator.",
      },
      {
        title: "Class questions flood the front desk",
        body: "The AI answers schedule, pricing, and membership questions instantly, on the phone and on the site.",
      },
    ],
    services: ["Group Classes", "Personal Training", "Memberships", "Free Trial Week", "Youth Programs", "Nutrition Coaching"],
    previewBusiness: {
      name: "Ironworks Strength Co.",
      city: "Fort Collins, CO",
      rating: 4.8,
      reviews: 176,
      phone: "(970) 555-0155",
      tagline: "Strength training for every level. First week free.",
    },
    testimonial: {
      quote:
        "Trial signups doubled once people could book a class without calling. The AI handles the ‘what should I bring’ calls too.",
      author: "Owner, strength gym (pilot program)",
      result: "2× trial class signups",
    },
    stat: "Close trial signups in the moment of motivation — 24/7.",
  },
];

export function getIndustry(slug: string) {
  return industries.find((i) => i.slug === slug);
}
