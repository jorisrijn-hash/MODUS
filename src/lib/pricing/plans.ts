/** Owner-requested indicative monthly tiers. Final scope follows the diagnostic. */
export const MONTHLY_PLANS = [
  {
    id: "essentials",
    name: "Essentials",
    monthly: 200,
    os: false,
    bestValue: false,
  },
  { id: "core", name: "Core", monthly: 700, os: true, bestValue: true },
  { id: "partner", name: "Partner", monthly: 1000, os: true, bestValue: false },
] as const;

export const PLAN_COPY = {
  en: {
    descriptions: [
      "A practical starting point for a small budget.",
      "The strongest balance of clarity and implementation.",
      "More capacity for a broader set of improvements.",
    ],
    features: [
      [
        "Basic website and workflow upkeep",
        "One small improvement at a time",
        "Monthly progress check-in",
        "No MODUS OS access",
      ],
      [
        "MODUS OS workspace access",
        "One priority workflow, improved continuously",
        "Scoped automation and integrations",
        "Monthly review of progress and next steps",
      ],
      [
        "Everything in Core, including MODUS OS",
        "Broader coordination across workflows",
        "More implementation and iteration capacity",
        "More frequent planning and review",
      ],
    ],
    rows: [
      { label: "MODUS OS", values: ["Not included", "Included", "Included"] },
      {
        label: "Improvement scope",
        values: [
          "Small, bounded improvements",
          "One priority workflow",
          "Broader, coordinated workflows",
        ],
      },
      {
        label: "Automation & integrations",
        values: [
          "Simple upkeep only",
          "Within agreed workflow scope",
          "Broader agreed scope",
        ],
      },
      {
        label: "Review cadence",
        values: [
          "Monthly check-in",
          "Monthly progress review",
          "More frequent reviews, agreed in scope",
        ],
      },
      {
        label: "Implementation capacity",
        values: ["Limited", "Ongoing, focused", "Higher capacity"],
      },
    ],
  },
  nl: {
    descriptions: [
      "Een praktisch begin met een klein budget.",
      "De beste balans tussen inzicht en uitvoering.",
      "Meer capaciteit voor een bredere reeks verbeteringen.",
    ],
    features: [
      [
        "Basisonderhoud van website en werkprocessen",
        "Eén kleine verbetering tegelijk",
        "Maandelijkse voortgangscheck",
        "Geen toegang tot MODUS OS",
      ],
      [
        "Toegang tot de MODUS OS-werkruimte",
        "Doorlopende verbetering van één prioriteitsproces",
        "Automatisering en koppelingen binnen scope",
        "Maandelijkse review van voortgang en vervolgstappen",
      ],
      [
        "Alles van Core, inclusief MODUS OS",
        "Bredere afstemming tussen werkprocessen",
        "Meer uitvoerings- en iteratiecapaciteit",
        "Vaker plannen en evalueren",
      ],
    ],
    rows: [
      {
        label: "MODUS OS",
        values: ["Niet inbegrepen", "Inbegrepen", "Inbegrepen"],
      },
      {
        label: "Verbeterscope",
        values: [
          "Kleine, afgebakende verbeteringen",
          "Eén prioriteitsproces",
          "Bredere, samenhangende processen",
        ],
      },
      {
        label: "Automatisering & koppelingen",
        values: [
          "Alleen eenvoudig onderhoud",
          "Binnen de afgesproken processcope",
          "Bredere afgesproken scope",
        ],
      },
      {
        label: "Reviewfrequentie",
        values: [
          "Maandelijkse check-in",
          "Maandelijkse voortgangsreview",
          "Vaker, afgesproken binnen scope",
        ],
      },
      {
        label: "Uitvoeringscapaciteit",
        values: ["Beperkt", "Doorlopend, gericht", "Meer capaciteit"],
      },
    ],
  },
} as const;
