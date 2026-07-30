import { createFileRoute } from "@tanstack/react-router";

import { LegalLayout } from "@/components/LegalLayout";

const body = `## Information we collect
We collect information you provide directly — your name, business details, contact information, and payment data — as well as information generated through your use of the platform, including website analytics, call recordings and transcripts from the AI voice agent, and content approvals.

## Business data from public sources
Our platform draws on a proprietary database of business profiles compiled from publicly available sources, including business directories, mapping services, and public records. When you claim a preview website, we associate your account with the corresponding public business record.

## Demo and contact submissions
When you request a preview website, unlock a report, or ask to book a call, the details you submit — and the research and drafts generated from them — are stored in a secure managed database (Supabase). We use them to prepare your preview, reports, and follow-up, and for no other purpose. This information is never sold.

## How we use your information
- To build, host, and maintain your website and digital services.
- To operate the AI voice agent, including recording and transcribing calls for quality and analytics.
- To generate content and reports tailored to your business.
- To process payments and manage your subscription.
- To communicate with you about your account and service.

## Call recording and AI processing
The AI voice agent records and transcribes calls to your business line. You are responsible for any consent or disclosure required in your jurisdiction. Recordings and transcripts are stored securely and made available in your client portal.

## Data sharing
We do not sell your personal information. We share data with service providers strictly as needed to deliver the service — payment processors, voice and AI infrastructure providers, and analytics platforms — under contractual confidentiality obligations.

## Data retention
We retain your data for as long as your account is active and as required to comply with legal obligations. On cancellation, we provide a full export of your website content and, on request, delete your personal data subject to legal retention requirements.

## Your rights
Depending on your jurisdiction, you may have rights to access, correct, export, or delete your personal information. Contact us to exercise these rights.

## Security
We use industry-standard measures including encryption in transit, access controls, and daily backups. No system is perfectly secure, but we treat your data as we treat our own.

## Bot protection
To protect our forms and demo tools from automated abuse, this site uses Cloudflare Turnstile in invisible mode, which may collect limited device and behavioral signals to distinguish humans from bots. Turnstile's handling of that data is described in the Cloudflare Turnstile Privacy Addendum (https://www.cloudflare.com/turnstile-privacy-policy/). We do not receive or store the raw signals Turnstile evaluates.

## Contact
Questions about this policy can be directed to privacy@sitekind.ai.`;

function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      updated="July 13, 2026"
      intro="Your trust runs our business. This policy explains what we collect, why, and the control you keep over your information."
      body={body}
    />
  );
}


export const Route = createFileRoute("/legal/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy" },
      { name: "description", content: "How sitekind collects, uses, and protects your information." },
      { property: "og:title", content: "Privacy Policy" },
      { property: "og:description", content: "How sitekind collects, uses, and protects your information." }
    ],
  }),
  component: PrivacyPage,
});
