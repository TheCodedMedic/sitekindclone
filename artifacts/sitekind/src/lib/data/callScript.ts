// The canonical two-sided demo call for Joe's HVAC & Air.
// Ava (the business) ALWAYS answers first with a proper greeting.
// Audio pre-generated from these exact lines with xAI Grok flagship voices
// (Ava = "eve", Mike the caller = "rex", model grok-voice-latest) via
// scripts/generate-call-audio.mjs. Missing mp3 -> timed text fallback.

export type CallLine = {
  who: "ai" | "caller";
  text: string;
  audio: string;
  // fallback display duration when audio is unavailable
  ms: number;
};

export const RING_AUDIO = "/audio/call-v2/ring.wav";

export const callScript: CallLine[] = [
  { who: "ai", ms: 4600, audio: "/audio/call-v2/l01.mp3", text: "Thank you for calling Joe's HVAC and Air, this is Ava — how can I help you today?" },
  { who: "caller", ms: 6400, audio: "/audio/call-v2/l02.mp3", text: "Hi — yeah, um... my AC just quit on me about an hour ago? It's already ninety-eight in the house, and I've got two little kids home with me." },
  { who: "ai", ms: 5400, audio: "/audio/call-v2/l03.mp3", text: "Oh no, ninety-eight with little ones — okay, let's get someone out to you fast. Can I get your name and the service address?" },
  { who: "caller", ms: 5200, audio: "/audio/call-v2/l04.mp3", text: "Yeah — it's Mike. Mike Hendricks. Forty-two twelve Maple Court... that's over by Legacy West." },
  { who: "ai", ms: 6200, audio: "/audio/call-v2/l05.mp3", text: "Thanks, Mike — that's right in our service area. A couple quick questions so the tech shows up prepared: is it central air, or a heat pump system?" },
  { who: "caller", ms: 4200, audio: "/audio/call-v2/l06.mp3", text: "Uh, central air. The outside unit's a Trane... maybe twelve years old?" },
  { who: "ai", ms: 4900, audio: "/audio/call-v2/l07.mp3", text: "Perfect. And is the thermostat on and set to cool — do you hear the outside unit trying to run at all?" },
  { who: "caller", ms: 4800, audio: "/audio/call-v2/l08.mp3", text: "Thermostat's on, set to seventy... but the outside unit is just dead quiet. Nothing." },
  { who: "ai", ms: 7800, audio: "/audio/call-v2/l09.mp3", text: "Okay, that helps a lot — could be a capacitor or a power issue, and our techs carry those parts on the truck. I've got a technician free this afternoon between two and four. Would that window work?" },
  { who: "caller", ms: 4200, audio: "/audio/call-v2/l10.mp3", text: "Two to four... yeah, that works. Um — how much is the visit gonna be?" },
  { who: "ai", ms: 5800, audio: "/audio/call-v2/l11.mp3", text: "It's an eighty-nine dollar diagnostic, and we waive that completely if you go ahead with the repair. And the best number for your confirmation text?" },
  { who: "caller", ms: 4200, audio: "/audio/call-v2/l12.mp3", text: "It's nine seven two... five five five... zero one eight two." },
  { who: "ai", ms: 8200, audio: "/audio/call-v2/l13.mp3", text: "Got it, Mike — you're all set for today, two to four, at forty-two twelve Maple Court. Your confirmation text is on its way. Keep the kiddos near a fan, and Marcus will call when he's about twenty minutes out." },
  { who: "caller", ms: 2900, audio: "/audio/call-v2/l14.mp3", text: "That's great. Thank you so much — seriously." },
  { who: "ai", ms: 3400, audio: "/audio/call-v2/l15.mp3", text: "Of course — that's what we're here for. Stay cool, Mike. Bye now!" },
];
