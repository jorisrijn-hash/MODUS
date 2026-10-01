/**
 * MODUS / App — showcase mock dataset.
 *
 * Single source of truth for the fictional demo client so every /app page
 * stays internally consistent (per the showcase brief: "if Overview says
 * 91 leads, Performance should not say 63"). Nothing here is real client
 * data — this is a cold-call/demo environment only. Structured so a real
 * backend could replace this module without changing page components.
 */

export const DEMO_CLIENT = {
  name: "Van Loon Interieur",
  industry: "Interior design & renovation",
  city: "Utrecht",
  founded: 2014,
  employees: 14,
  website: "vanlooninterieur.nl",
  contactName: "Marieke van Loon",
  contactRole: "Owner",
  plan: "intelligence" as const, // "essential" | "intelligence" | "growth"
};

// ---- Plans (source of truth for pricing shown anywhere) -------------------

export const PLANS = {
  essential: { name: "MODUS Essential", price: 200 },
  intelligence: { name: "MODUS Intelligence", price: 750 },
  growth: { name: "MODUS Growth", price: 1000 },
} as const;

export const ADVERTISING_BUDGET = 500; // always separate from the retainer

// ---- Core KPIs (this month vs. previous month) -----------------------------

function pctChange(current: number, previous: number): number {
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

const raw = {
  visitors: { current: 5240, previous: 4510 },
  leads: { current: 91, previous: 82 },
  wonDeals: { current: 17, previous: 13 },
  revenue: { current: 82400, previous: 68900 },
};

export const KPIS = {
  visitors: {
    label: "Traffic",
    value: raw.visitors.current,
    change: pctChange(raw.visitors.current, raw.visitors.previous),
  },
  leads: {
    label: "Leads",
    value: raw.leads.current,
    change: pctChange(raw.leads.current, raw.leads.previous),
  },
  conversion: {
    label: "Conversion",
    value: Math.round((raw.leads.current / raw.visitors.current) * 1000) / 10,
    previousValue: Math.round((raw.leads.previous / raw.visitors.previous) * 1000) / 10,
    get change() {
      return Math.round((this.value - this.previousValue) * 10) / 10;
    },
  },
  revenue: {
    label: "Revenue",
    value: raw.revenue.current,
    change: pctChange(raw.revenue.current, raw.revenue.previous),
  },
};

// ---- 12-month traffic/leads series (for charts) ----------------------------

export const MONTHLY_SERIES = [
  { month: "Oct", visitors: 3120, leads: 48, revenue: 41200 },
  { month: "Nov", visitors: 3340, leads: 52, revenue: 44800 },
  { month: "Dec", visitors: 2980, leads: 41, revenue: 36100 },
  { month: "Jan", visitors: 3510, leads: 55, revenue: 47900 },
  { month: "Feb", visitors: 3680, leads: 58, revenue: 51300 },
  { month: "Mar", visitors: 3920, leads: 61, revenue: 54600 },
  { month: "Apr", visitors: 4105, leads: 66, revenue: 58900 },
  { month: "May", visitors: 4260, leads: 70, revenue: 61800 },
  { month: "Jun", visitors: 4180, leads: 68, revenue: 60200 },
  { month: "Jul", visitors: 4340, leads: 74, revenue: 64500 },
  { month: "Aug", visitors: 4510, leads: 82, revenue: 68900 },
  { month: "Sep", visitors: 5240, leads: 91, revenue: 82400 },
];

export const TRAFFIC_SOURCES = [
  { source: "Organic Search", visitors: 2148, share: 41 },
  { source: "Google Ads", visitors: 1362, share: 26 },
  { source: "Direct", visitors: 890, share: 17 },
  { source: "Meta Ads", visitors: 524, share: 10 },
  { source: "Referral", visitors: 316, share: 6 },
];

// ---- Signals ----------------------------------------------------------------
//
// One coherent story runs through sig-01 (the flagship): a website issue was
// detected → diagnosed → an action was implemented → the result was
// measured. The same figures (+18% conversion, +12% qualified leads, +€2,840
// estimated monthly opportunity) are reused verbatim in the MODUS Briefing,
// the Overview result callouts, and the September report — never restated
// with different numbers. The remaining signals are real, independent
// observations (not every signal has to belong to the same story), but each
// is internally consistent with WEBSITE_OPPORTUNITIES / ACTIONS / LEADS.

export type SignalPriority = "high" | "opportunity" | "positive";
export type SignalStatus = "open" | "in_progress" | "resolved";
export type SignalConfidence = "high" | "medium" | "low";

export type Signal = {
  id: string;
  priority: SignalPriority;
  status: SignalStatus;
  confidence: SignalConfidence;
  title: string;
  timestamp: string;
  impact?: string;
  explanation: string;
  data: { label: string; value: string }[];
  recommendation: string;
  actionLabel: string;
  /** The Observed → Diagnosed → Action → Result narrative for the drawer. */
  story: {
    observed: string;
    diagnosed: string;
    action: string;
    result?: string;
  };
};

export const SIGNALS: Signal[] = [
  {
    id: "sig-01",
    priority: "positive",
    status: "resolved",
    confidence: "high",
    title: "Conversion opportunity — contact-page CTA",
    timestamp: "2 days ago",
    impact: "+€2,840 estimated monthly opportunity",
    explanation:
      "Mobile visitors were converting to leads less often after the 18 September homepage update pushed the contact form below the fold. The fix has now been live for 6 days and conversion has not just recovered — it's 18% higher than before the update.",
    data: [
      { label: "Mobile conversion (before fix)", value: "1.8%" },
      { label: "Mobile conversion (now)", value: "2.4%" },
      { label: "Qualified enquiries", value: "+12%" },
    ],
    recommendation:
      "Apply the same above-the-fold CTA pattern to the two remaining service pages that still use the old layout.",
    actionLabel: "Mobile CTA optimization",
    story: {
      observed: "Mobile conversion dropped 12% in the two weeks after the 18 September homepage update.",
      diagnosed: "The new mobile hero layout pushed the contact form below the fold on screens under 400px wide.",
      action: "MODUS restored a visible call-to-action above the fold and shortened the mobile enquiry form.",
      result:
        "Mobile conversion is now 18% higher than before the original update, and qualified enquiries are up 12% month-over-month.",
    },
  },
  {
    id: "sig-02",
    priority: "opportunity",
    status: "open",
    confidence: "medium",
    title: "High-intent search traffic detected",
    timestamp: "5 days ago",
    impact: "+380 estimated visitors/month if resolved",
    explanation:
      "Search Console shows rising impressions for \"keukenrenovatie Utrecht\" and \"interieurontwerp op maat\" — both currently rank on page 2, with strong click-through on the few positions that do reach page 1.",
    data: [
      { label: "Impressions (30d)", value: "3,840" },
      { label: "Current avg. position", value: "14.2" },
      { label: "Estimated traffic if top 5", value: "+380 visitors/mo" },
    ],
    recommendation:
      "A dedicated service page targeting these terms, linked from the homepage and one existing project page, is likely to move both terms into the top 10 within 6–8 weeks.",
    actionLabel: "SEO metadata & service page",
    story: {
      observed: "Search impressions for two high-intent renovation terms have been rising for three weeks.",
      diagnosed: "Neither term has a dedicated page — both currently rank on page 2 off the homepage alone.",
      action: "MODUS is building a dedicated service page and internal links for both terms.",
    },
  },
  {
    id: "sig-03",
    priority: "high",
    status: "open",
    confidence: "high",
    title: "Website load time regression on service pages",
    timestamp: "3 days ago",
    impact: "41% of visitors leave within 8 seconds",
    explanation:
      "The kitchen renovation service page is loading noticeably slower than the rest of the site, and visitors are leaving before the page finishes rendering.",
    data: [
      { label: "Page", value: "/diensten/keukenrenovatie" },
      { label: "Load time", value: "4.1s (site avg. 1.9s)" },
      { label: "Early exits", value: "41%" },
    ],
    recommendation: "Compress the three uncompressed project images on this page and lazy-load the gallery below the fold.",
    actionLabel: "Website speed optimization (images)",
    story: {
      observed: "The kitchen renovation service page has a 41% early-exit rate — the highest on the site.",
      diagnosed: "Three uncompressed project images add 2.2s to the page load time versus the site average.",
      action: "MODUS is compressing the affected images and deferring the below-fold gallery.",
    },
  },
  {
    id: "sig-04",
    priority: "opportunity",
    status: "open",
    confidence: "medium",
    title: "Returning visitors rarely revisit project pages",
    timestamp: "9 days ago",
    explanation:
      "Visitors who return to the site after their first visit go straight to the contact page 74% of the time, skipping the project gallery that typically strengthens trust before enquiry.",
    data: [
      { label: "Returning visitors (30d)", value: "412" },
      { label: "Project page revisits", value: "26%" },
    ],
    recommendation:
      "Surface 2–3 relevant recent projects directly on the contact page instead of requiring a separate visit.",
    actionLabel: "Contact page redesign",
    story: {
      observed: "74% of returning visitors go straight to the contact page, skipping the project gallery.",
      diagnosed: "There's no trust-building content (recent projects) visible on the contact page itself.",
      action: "MODUS is planning a contact-page redesign that surfaces 2–3 recent projects inline.",
    },
  },
];

// ---- Actions (kanban) --------------------------------------------------------

export type ActionStatus = "discovered" | "planned" | "in_progress" | "completed";

export type ActionCard = {
  id: string;
  title: string;
  category: "Website" | "SEO" | "Ads" | "Conversion" | "Leads";
  status: ActionStatus;
  date: string;
  owner: string;
  relatedSignal?: string;
  priority: "high" | "medium" | "low";
  expectedImpact?: string;
};

export const ACTIONS: ActionCard[] = [
  { id: "act-01", title: "Mobile CTA optimization", category: "Conversion", status: "completed", date: "26 Sep", owner: "MODUS", relatedSignal: "sig-01", priority: "high", expectedImpact: "+€2,840/mo" },
  { id: "act-05", title: "Website speed optimization (images)", category: "Website", status: "in_progress", date: "20 Sep", owner: "MODUS", relatedSignal: "sig-03", priority: "high", expectedImpact: "-2.2s load time" },
  { id: "act-02", title: "SEO metadata & service page", category: "SEO", status: "planned", date: "29 Sep", owner: "MODUS", relatedSignal: "sig-02", priority: "medium", expectedImpact: "+380 visitors/mo" },
  { id: "act-03", title: "Contact page redesign", category: "Website", status: "discovered", date: "26 Sep", owner: "MODUS", relatedSignal: "sig-04", priority: "medium" },
  { id: "act-04", title: "Google Ads — new ad group for renovation", category: "Ads", status: "planned", date: "01 Oct", owner: "MODUS", priority: "medium" },
  { id: "act-06", title: "Lead follow-up sequence (email)", category: "Leads", status: "completed", date: "12 Sep", owner: "MODUS", priority: "medium" },
  { id: "act-07", title: "Service page conversion (shortened form)", category: "Conversion", status: "completed", date: "05 Sep", owner: "MODUS", priority: "high" },
  { id: "act-08", title: "Homepage hero copy refresh", category: "Website", status: "completed", date: "29 Aug", owner: "MODUS", priority: "low" },
];

// ---- Leads --------------------------------------------------------------------

export type LeadStatus = "new" | "contacted" | "qualified" | "won" | "lost";

export type Lead = {
  id: string;
  name: string;
  company?: string;
  source: string;
  status: LeadStatus;
  value: number;
  date: string;
};

export const LEADS: Lead[] = [
  { id: "ld-01", name: "Anouk de Groot", source: "Organic Search", status: "won", value: 18400, date: "24 Sep" },
  { id: "ld-02", name: "Bram Hendriks", source: "Google Ads", status: "qualified", value: 12200, date: "23 Sep" },
  { id: "ld-03", name: "Familie Jansen", source: "Referral", status: "contacted", value: 8600, date: "23 Sep" },
  { id: "ld-04", name: "Sanne Willems", company: "Kantoor Willems B.V.", source: "Meta Ads", status: "new", value: 26500, date: "22 Sep" },
  { id: "ld-05", name: "Tom Bakker", source: "Organic Search", status: "won", value: 9800, date: "21 Sep" },
  { id: "ld-06", name: "Lotte van Dam", source: "Direct", status: "lost", value: 15200, date: "20 Sep" },
  { id: "ld-07", name: "Familie de Boer", source: "Google Ads", status: "qualified", value: 21000, date: "19 Sep" },
  { id: "ld-08", name: "Rick Mulder", source: "Organic Search", status: "contacted", value: 7400, date: "18 Sep" },
  { id: "ld-09", name: "Eva Peters", source: "Referral", status: "won", value: 13600, date: "17 Sep" },
  { id: "ld-10", name: "Daan Visser", company: "Visser Advocatuur", source: "Meta Ads", status: "new", value: 31200, date: "17 Sep" },
  { id: "ld-11", name: "Fleur Smit", source: "Organic Search", status: "qualified", value: 10400, date: "16 Sep" },
  { id: "ld-12", name: "Wouter Dekker", source: "Google Ads", status: "lost", value: 6200, date: "15 Sep" },
  { id: "ld-13", name: "Familie Kramer", source: "Direct", status: "won", value: 19800, date: "14 Sep" },
  { id: "ld-14", name: "Noa Verhoeven", source: "Organic Search", status: "contacted", value: 8900, date: "13 Sep" },
  { id: "ld-15", name: "Milan Brouwer", source: "Referral", status: "new", value: 14700, date: "12 Sep" },
];

// ---- Website health -----------------------------------------------------------

export const WEBSITE_SCORES = {
  performance: 78,
  mobile: 64,
  seo: 86,
  accessibility: 91,
  conversion: 72,
};

export const WEBSITE_OPPORTUNITIES = [
  { id: "web-03", title: "Service page drop-off", severity: "high", page: "/diensten/keukenrenovatie", detail: "41% of visitors leave within 8 seconds — three uncompressed images are slowing this page down. Fix in progress." },
  { id: "web-01", title: "Hero image not compressed", severity: "medium", page: "Homepage", detail: "2.4MB hero image — compressing to WebP would save ~1.8MB per visit." },
  { id: "web-04", title: "Missing meta description", severity: "low", page: "/projecten", detail: "Search engines are generating their own snippet, reducing click-through." },
  { id: "web-05", title: "Mobile layout overlap", severity: "medium", page: "/contact", detail: "Contact form fields overlap the sidebar on screens between 375–414px." },
];

export const WEBSITE_RESOLVED = [
  { id: "web-resolved-01", title: "Weak call-to-action on mobile", page: "Homepage", resolvedDate: "26 Sep", detail: "CTA restored above the fold — mobile conversion is now 18% higher than before the original issue." },
];

// ---- Campaigns ------------------------------------------------------------------

export type Campaign = {
  id: string;
  platform: "Google" | "Meta";
  name: string;
  spend: number;
  clicks: number;
  leads: number;
  status: "active" | "paused";
};

export const CAMPAIGNS: Campaign[] = [
  { id: "camp-01", platform: "Google", name: "Keukenrenovatie Utrecht", spend: 284, clicks: 391, leads: 17, status: "active" },
  { id: "camp-02", platform: "Google", name: "Interieurontwerp op maat", spend: 156, clicks: 203, leads: 9, status: "active" },
  { id: "camp-03", platform: "Meta", name: "Voor & Na — Renovatieprojecten", spend: 98, clicks: 512, leads: 6, status: "active" },
  { id: "camp-04", platform: "Meta", name: "Retargeting — websitebezoekers", spend: 62, clicks: 287, leads: 4, status: "paused" },
];

// ---- Reports ---------------------------------------------------------------------

export const REPORTS = [
  { id: "rep-2026-09", month: "September 2026", generated: "01 Oct 2026", headline: "Mobile CTA fix delivered an estimated +€2,840/month in recovered and new opportunity." },
  { id: "rep-2026-08", month: "August 2026", generated: "01 Sep 2026", headline: "Homepage hero refresh shipped; groundwork laid for the September CTA fix." },
  { id: "rep-2026-07", month: "July 2026", generated: "01 Aug 2026", headline: "Traffic up 4.3% month-over-month on steady organic growth." },
];

// ---- Integrations -----------------------------------------------------------------

export const INTEGRATIONS_CONNECTED = [
  { id: "int-ga", name: "Google Analytics", connectedSince: "Mar 2026" },
  { id: "int-gsc", name: "Google Search Console", connectedSince: "Mar 2026" },
  { id: "int-gads", name: "Google Ads", connectedSince: "Apr 2026" },
  { id: "int-web", name: "Website", connectedSince: "Mar 2026" },
  { id: "int-meta", name: "Meta Ads", connectedSince: "Jun 2026" },
];

export const INTEGRATIONS_AVAILABLE = ["HubSpot", "Shopify", "Mailchimp", "WhatsApp Business"];

// ---- Billing --------------------------------------------------------------------------

export const INVOICES = [
  { id: "inv-2026-09", period: "September 2026", amount: PLANS[DEMO_CLIENT.plan].price + ADVERTISING_BUDGET, status: "paid", date: "01 Sep 2026" },
  { id: "inv-2026-08", period: "August 2026", amount: PLANS[DEMO_CLIENT.plan].price + ADVERTISING_BUDGET, status: "paid", date: "01 Aug 2026" },
  { id: "inv-2026-07", period: "July 2026", amount: PLANS[DEMO_CLIENT.plan].price + ADVERTISING_BUDGET, status: "paid", date: "01 Jul 2026" },
];

// ---- Activity feed ----------------------------------------------------------------------

export const ACTIVITY = [
  { id: "act-log-00", text: "Mobile CTA optimization completed — conversion now 18% above pre-issue baseline", timestamp: "09:42", category: "Conversion" },
  { id: "act-log-01a", text: "Website speed optimization in progress — 2 of 3 images compressed", timestamp: "09:18", category: "Website" },
  { id: "act-log-01", text: "Service page conversion shipped — shortened enquiry form live on 3 pages", timestamp: "2 days ago", category: "Conversion" },
  { id: "act-log-02", text: "Lead follow-up email sequence activated", timestamp: "5 days ago", category: "Leads" },
  { id: "act-log-03", text: "Homepage hero copy refresh shipped", timestamp: "1 week ago", category: "Website" },
  { id: "act-log-04", text: "Monthly report for August generated", timestamp: "1 week ago", category: "Reports" },
  { id: "act-log-05", text: "Google Ads budget reallocated toward top-performing ad group", timestamp: "2 weeks ago", category: "Ads" },
];

// ---- Support chat (static demo transcript) -------------------------------------------------

export const SUPPORT_CHAT_DEMO: { role: "user" | "modus"; text: string; signalId?: string }[] = [
  { role: "user", text: "Why did our conversion rate improve this month?" },
  {
    role: "modus",
    text: "The mobile CTA optimization MODUS shipped on 26 September restored the contact form above the fold. Mobile conversion is now 18% higher than before the original issue, and qualified enquiries are up 12%.",
    signalId: "sig-01",
  },
];

// ---- Sparklines (KPI cards) ---------------------------------------------------------------
//
// Derived directly from MONTHLY_SERIES — never a separate fabricated
// series — so a KPI card's sparkline always agrees with the Performance
// chart behind it.

export const SPARKLINES = {
  visitors: MONTHLY_SERIES.map((m) => m.visitors),
  leads: MONTHLY_SERIES.map((m) => m.leads),
  revenue: MONTHLY_SERIES.map((m) => m.revenue),
  conversion: MONTHLY_SERIES.map((m) => Math.round((m.leads / m.visitors) * 1000) / 10),
};

// ---- MODUS Score (Business Health) ---------------------------------------------------------
//
// Reuses WEBSITE_SCORES rather than inventing a parallel set of numbers —
// the category breakdown here must match what the Website page itself
// shows.

export const MODUS_SCORE = {
  value: 82,
  change: 6.4,
  categories: [
    { label: "Website", value: WEBSITE_SCORES.performance, href: "/app/website" },
    { label: "Conversion", value: WEBSITE_SCORES.conversion, href: "/app/performance" },
    { label: "Leads", value: 84, href: "/app/leads" },
    { label: "Performance", value: WEBSITE_SCORES.seo, href: "/app/performance" },
    { label: "Growth", value: 72, href: "/app/campaigns" },
  ],
};

// ---- MODUS Briefing (Overview) --------------------------------------------------------------
//
// Built from the same SIGNALS array shown on /app/signals — a briefing
// item and its signal are the same object, never a re-typed duplicate.

export const BRIEFING_SIGNAL_IDS = ["sig-01", "sig-03", "sig-02"];

