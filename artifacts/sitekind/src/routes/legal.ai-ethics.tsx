import { createFileRoute } from "@tanstack/react-router";

import { LegalLayout } from "@/components/LegalLayout";

const body = `## Our commitment
We build AI systems that serve small businesses honestly. This statement describes the principles that govern how our AI generates content, answers calls, and represents our clients.

## Transparency with callers
Our AI voice agent is designed to be helpful, not deceptive. We support and encourage clear disclosure that callers are speaking with an automated assistant, and we provide human escalation paths for any caller who requests one or whose needs exceed the agent's scope.

## Content quality and accuracy
All AI-generated content passes through a panel of three independent language-model judges evaluating accuracy, tone, and brand alignment before publication. Content that fails does not publish. We do not fabricate reviews, testimonials, credentials, or claims on behalf of clients.

## Human oversight
AI handles volume; humans hold responsibility. Clients retain approval controls where their plan provides them, our team monitors flagged calls and content, and any client can request review of anything the system produces.

## Data and consent
We are transparent about the data that powers our platform: what we collect, where it comes from, how it is stored, and how it is used are documented in our Privacy Policy (/legal/privacy) — the single authoritative source for those specifics. On calls, we place responsibility for jurisdiction-specific consent disclosures clearly with the business owner, whom we equip to comply.

## Fairness and non-deception
We will not build systems whose primary purpose is to mislead consumers. Marketing copy is persuasive but must be truthful. Voice agents book real appointments and answer real questions — they do not impersonate specific humans or manufacture urgency that does not exist.

## Guarding against misuse
We reserve the right to decline or terminate service for businesses that direct our AI toward deceptive, harassing, or unlawful ends. Compliance with advertising, spam, and AI-disclosure regulations is a shared, first-class priority.

## Continuous improvement
AI systems are never finished. We monitor for errors, retrain on flagged interactions, and update these principles as the technology and its regulation evolve.

## Contact
Questions or concerns about our AI practices can be directed to ethics@sitekind.ai.`;

function AiEthicsPage() {
  return (
    <LegalLayout
      title="AI Ethics Statement"
      updated="July 13, 2026"
      intro="We automate aggressively and disclose honestly. Here's how we keep AI in service of our clients and their customers."
      body={body}
    />
  );
}


export const Route = createFileRoute("/legal/ai-ethics")({
  head: () => ({
    meta: [
      { title: "AI Ethics Statement" },
      { name: "description", content: "How sitekind builds and operates AI responsibly — transparency, quality control, and human oversight." },
      { property: "og:title", content: "AI Ethics Statement" },
      { property: "og:description", content: "How sitekind builds and operates AI responsibly — transparency, quality control, and human oversight." }
    ],
  }),
  component: AiEthicsPage,
});
