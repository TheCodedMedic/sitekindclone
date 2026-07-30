import { createFileRoute } from "@tanstack/react-router";

import { LegalLayout } from "@/components/LegalLayout";

const body = `## Agreement to terms
By accessing or using sitekind, you agree to these terms. If you are using the service on behalf of a business, you represent that you are authorized to bind that business.

## Services and plans
We offer Starter, Core Agency, an AI Automation add-on, and the Mega Package as described on our pricing page. Features and inclusions are those listed for your selected plan at the time of purchase.

## Ownership of your website and domain
You own your domain and your website content. If you cancel, we provide a full export of your website, images, and blog posts. We do not hold your digital presence hostage.

## Billing and financing
- Starter plans are billed monthly and may be cancelled at any time.
- The Core Package may be paid in full or financed at $500 down plus $375/month for twelve months. Financing is a binding twelve-month payment agreement.
- Annual maintenance and the AI add-on renew yearly and may be cancelled before renewal.
- The Mega Package is a one-time fee governed by a separate campaign agreement.

## The Mega Package performance guarantee
If your business does not rank in the Top 3 of Google Maps for the agreed primary keywords within twenty weeks, we will continue the campaign at no additional cost until it does. The guarantee applies to the specific keywords and service area defined in your agreement and assumes your timely cooperation (profile access, review responses, and approvals).

## Acceptable use
You agree not to use the platform for unlawful purposes, to misrepresent your business, or to direct the AI voice agent to deceive callers. You are responsible for the accuracy of the business information you provide.

## AI-generated content
Content produced by our engine is reviewed by an automated quality panel but is provided without warranty of factual accuracy. You are responsible for reviewing and approving content where your plan provides approval controls.

## Service availability
We target 99.9% uptime and provide service credits for downtime exceeding that guarantee, as detailed in your plan. We are not liable for outages caused by third-party providers or events beyond our reasonable control.

## Limitation of liability
To the maximum extent permitted by law, our aggregate liability is limited to the amounts you paid in the twelve months preceding the claim.

## Termination
Either party may terminate as provided in your plan. On termination, you may export your data, and we will cease billing for future periods.

## Changes to these terms
We may update these terms and will notify you of material changes. Continued use after changes constitutes acceptance.

## Contact
Questions about these terms can be directed to legal@sitekind.ai.`;

function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      updated="July 8, 2026"
      intro="Plain-English terms for using the platform, billing, ownership, and our guarantees."
      body={body}
    />
  );
}


export const Route = createFileRoute("/legal/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service" },
      { name: "description", content: "The terms governing your use of the sitekind platform." },
      { property: "og:title", content: "Terms of Service" },
      { property: "og:description", content: "The terms governing your use of the sitekind platform." }
    ],
  }),
  component: TermsPage,
});
