// Demo data for the client portal (spec §15.2). Represents "Joe's HVAC & Air".

export const portalClient = {
  business: "Joe's HVAC & Air",
  plan: "Core + AI Voice",
  city: "Plano, TX",
  domain: "joeshvacair.com",
  since: "Live since Apr 2026",
};

export const trafficSeries = [
  { m: "Jan", v: 420 },
  { m: "Feb", v: 510 },
  { m: "Mar", v: 680 },
  { m: "Apr", v: 940 },
  { m: "May", v: 1280 },
  { m: "Jun", v: 1710 },
  { m: "Jul", v: 2140 },
];

export const kpis = [
  { label: "Website visitors", value: "2,140", delta: "+25% MoM", trend: "up" },
  { label: "Calls handled by AI", value: "248", delta: "+34% MoM", trend: "up" },
  { label: "Appointments booked", value: "187", delta: "+41 after-hours", trend: "up" },
  { label: "Google Maps rank", value: "#3", delta: "▲ from #24", trend: "up" },
];

export const rankings = [
  { keyword: "hvac repair plano", pos: 3, prev: 24, volume: "2.4k/mo" },
  { keyword: "ac repair near me", pos: 2, prev: 15, volume: "5.1k/mo" },
  { keyword: "emergency furnace repair", pos: 4, prev: 19, volume: "880/mo" },
  { keyword: "hvac maintenance plano", pos: 1, prev: 11, volume: "620/mo" },
  { keyword: "water heater installation", pos: 6, prev: 27, volume: "1.3k/mo" },
];

export const calls = [
  {
    id: "c-1042",
    caller: "(972) 555-0182",
    time: "Today · 2:14 AM",
    duration: "3:41",
    outcome: "Booked",
    summary: "After-hours no-cool emergency. Booked same-day 2–4 PM window.",
    tag: "Emergency",
  },
  {
    id: "c-1041",
    caller: "(214) 555-0143",
    time: "Today · 9:02 AM",
    duration: "2:08",
    outcome: "Booked",
    summary: "Annual maintenance tune-up. Scheduled for Thursday morning.",
    tag: "Maintenance",
  },
  {
    id: "c-1040",
    caller: "(469) 555-0120",
    time: "Yesterday · 4:37 PM",
    duration: "1:52",
    outcome: "Quote sent",
    summary: "Asked about furnace replacement cost. Sent quote range, follow-up scheduled.",
    tag: "Sales",
  },
  {
    id: "c-1039",
    caller: "(972) 555-0177",
    time: "Yesterday · 11:20 AM",
    duration: "0:48",
    outcome: "FAQ",
    summary: "Confirmed service area and hours. No booking needed.",
    tag: "Info",
  },
  {
    id: "c-1038",
    caller: "(214) 555-0198",
    time: "2 days ago · 6:15 PM",
    duration: "4:22",
    outcome: "Booked",
    summary: "Missed call → text-back → booked drain/duct cleaning for Saturday.",
    tag: "Text-back",
  },
];

export const contentCalendar = [
  { title: "5 Signs Your AC Needs Repair This Summer", date: "Jul 7", status: "Published" },
  { title: "How Much Does Furnace Replacement Cost in Plano?", date: "Jul 14", status: "Scheduled" },
  { title: "Why Your AC Freezes Up (and How to Prevent It)", date: "Jul 21", status: "In review" },
  { title: "Fall HVAC Maintenance Checklist for Texas Homes", date: "Jul 28", status: "Draft" },
  { title: "Heat Pump vs. Furnace: Which Is Right for You?", date: "Aug 4", status: "Draft" },
];

export const invoices = [
  { id: "INV-2026-07", date: "Jul 1, 2026", desc: "Core + AI Voice — monthly", amount: "$708.00", status: "Paid" },
  { id: "INV-2026-06", date: "Jun 1, 2026", desc: "Core + AI Voice — monthly", amount: "$708.00", status: "Paid" },
  { id: "INV-2026-05", date: "May 1, 2026", desc: "Core + AI Voice — monthly", amount: "$708.00", status: "Paid" },
  { id: "INV-2026-04", date: "Apr 1, 2026", desc: "Core setup + first month", amount: "$1,208.00", status: "Paid" },
];
