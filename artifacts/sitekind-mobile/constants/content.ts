import type { ComponentProps } from 'react';
import { Feather } from '@expo/vector-icons';

type FeatherIconName = ComponentProps<typeof Feather>['name'];

export const HERO = {
  eyebrow: 'Built for Main Street',
  headline: 'The Fully Automated Digital Agency for Service Businesses',
  subheadline:
    'Get an enterprise-grade website, AI voice receptionist, and automated SEO — for less than the cost of a single billboard.',
  primaryCta: 'View Pricing',
  secondaryCta: 'See a Live Demo',
};

export const STATS: { value: string; label: string }[] = [
  { value: '$5.4M+', label: 'revenue generated across portfolio brands' },
  { value: '24 hrs', label: 'from signup to live website' },
  { value: '91.7%', label: 'payment success rate' },
  { value: '90%', label: 'cheaper than a human receptionist' },
];

export interface Capability {
  icon: FeatherIconName;
  title: string;
  body: string;
  tint: 'blush' | 'sky' | 'mint';
}

export const CAPABILITIES: Capability[] = [
  {
    icon: 'phone-call',
    title: 'AI Voice Receptionist',
    body: 'AI answers calls, books appointments, and syncs to your CRM 24/7.',
    tint: 'blush',
  },
  {
    icon: 'layout',
    title: 'Conversion-First Web',
    body: 'Websites built for local conversion with built-in review syndication.',
    tint: 'sky',
  },
  {
    icon: 'map-pin',
    title: 'Google Maps Dominance',
    body: 'Guaranteed Top 3 ranking in 20 weeks through an aggressive SEO blitz.',
    tint: 'mint',
  },
];

export interface Tier {
  id: string;
  name: string;
  price: string;
  cadence: string;
  tagline: string;
  features: string[];
  highlighted?: boolean;
}

export const TIERS: Tier[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$150',
    cadence: '/month',
    tagline: 'Best for local pros starting out.',
    features: [
      'High-conversion website',
      'Managed hosting & SSL',
      'Basic SEO optimization',
      'Email support',
      'AI lead capture (web)',
    ],
  },
  {
    id: 'core',
    name: 'Core',
    price: '$5,000',
    cadence: 'first year · $1,500/yr after',
    tagline: 'Our most popular choice.',
    highlighted: true,
    features: [
      'Professional content strategy',
      'AI Voice Receptionist (50 mins/mo)',
      'Advanced SEO campaign',
      'CRM integration',
      'Priority support',
    ],
  },
  {
    id: 'mega',
    name: 'Mega',
    price: '$15,000',
    cadence: 'flat',
    tagline: 'Dominate your local market.',
    features: [
      'Top 3 Google Maps guarantee',
      '20-week SEO blitz',
      'Competitor displacement',
      'Local PR syndication',
      'Weekly strategy calls',
      '0% financing available',
    ],
  },
];

export const CTA_BAND = {
  title: 'Ready to stop losing leads?',
  body: 'Get started for $150/month, or explore our $5,000 Core Package.',
};

export const CONTACT = {
  title: 'Get in Touch',
  body: "Whether you're ready to start or just have questions, we're here to help.",
  email: 'hello@sitekind.ai',
};

export const TESTIMONIAL = {
  quote: '+41 after-hours jobs / quarter',
  attribution: 'HVAC owner, Sitekind Core',
};
