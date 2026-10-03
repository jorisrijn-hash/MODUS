# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: heroBubbles.spec.ts >> hero process bubbles >> the label changes between cycles rather than repeating one
- Location: e2e/heroBubbles.spec.ts:74:7

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 1
Received:   1

Call Log:
- Timeout 40000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e4]:
      - navigation "Primary" [ref=e5]:
        - link "How It Works" [ref=e6] [cursor=pointer]:
          - /url: /how-it-works
          - generic [ref=e7]:
            - generic [ref=e8]: H
            - generic [ref=e9]: o
            - generic [ref=e10]: w
            - generic [ref=e12]: I
            - generic [ref=e13]: t
            - generic [ref=e15]: W
            - generic [ref=e16]: o
            - generic [ref=e17]: r
            - generic [ref=e18]: k
            - generic [ref=e19]: s
        - link "Capabilities" [ref=e21] [cursor=pointer]:
          - /url: /capabilities
          - generic [ref=e22]:
            - generic [ref=e23]: C
            - generic [ref=e24]: a
            - generic [ref=e25]: p
            - generic [ref=e26]: a
            - generic [ref=e27]: b
            - generic [ref=e28]: i
            - generic [ref=e29]: l
            - generic [ref=e30]: i
            - generic [ref=e31]: t
            - generic [ref=e32]: i
            - generic [ref=e33]: e
            - generic [ref=e34]: s
        - link "Results" [ref=e36] [cursor=pointer]:
          - /url: /results
          - generic [ref=e37]:
            - generic [ref=e38]: R
            - generic [ref=e39]: e
            - generic [ref=e40]: s
            - generic [ref=e41]: u
            - generic [ref=e42]: l
            - generic [ref=e43]: t
            - generic [ref=e44]: s
        - link "Pricing" [ref=e46] [cursor=pointer]:
          - /url: /pricing
          - generic [ref=e47]:
            - generic [ref=e48]: P
            - generic [ref=e49]: r
            - generic [ref=e50]: i
            - generic [ref=e51]: c
            - generic [ref=e52]: i
            - generic [ref=e53]: "n"
            - generic [ref=e54]: g
      - link "MODUS" [ref=e56] [cursor=pointer]:
        - /url: /
      - generic [ref=e64]:
        - button "Preferences" [ref=e66] [cursor=pointer]
        - generic [ref=e68]:
          - button "Sign in" [ref=e69] [cursor=pointer]
          - button "Create account" [ref=e70] [cursor=pointer]
        - link "Run a Diagnostic" [ref=e72] [cursor=pointer]:
          - /url: /diagnostic
          - generic [ref=e73]:
            - generic [ref=e74]: R
            - generic [ref=e75]: u
            - generic [ref=e76]: "n"
            - generic [ref=e78]: a
            - generic [ref=e80]: D
            - generic [ref=e81]: i
            - generic [ref=e82]: a
            - generic [ref=e83]: g
            - generic [ref=e84]: "n"
            - generic [ref=e85]: o
            - generic [ref=e86]: s
            - generic [ref=e87]: t
            - generic [ref=e88]: i
            - generic [ref=e89]: c
  - main [ref=e92]:
    - generic [ref=e93]:
      - generic [ref=e95]:
        - generic [ref=e96]:
          - paragraph [ref=e98]: Business, without the friction
          - heading "Find the friction.Move forward." [level=1] [ref=e99]:
            - generic [ref=e100]: Find the friction.
            - generic [ref=e103]: Move forward.
          - paragraph [ref=e107]: MODUS connects the dots between your people, processes and tools. See what holds you back, and improve what actually matters.
          - generic [ref=e109]:
            - link "Run a Diagnostic" [ref=e111] [cursor=pointer]:
              - /url: /diagnostic
              - generic [ref=e112]:
                - generic [ref=e113]: R
                - generic [ref=e114]: u
                - generic [ref=e115]: "n"
                - generic [ref=e117]: a
                - generic [ref=e119]: D
                - generic [ref=e120]: i
                - generic [ref=e121]: a
                - generic [ref=e122]: g
                - generic [ref=e123]: "n"
                - generic [ref=e124]: o
                - generic [ref=e125]: s
                - generic [ref=e126]: t
                - generic [ref=e127]: i
                - generic [ref=e128]: c
            - link "See How It Works" [ref=e130] [cursor=pointer]:
              - /url: /how-it-works
              - generic [ref=e131]:
                - generic [ref=e132]: S
                - generic [ref=e133]: e
                - generic [ref=e134]: e
                - generic [ref=e136]: H
                - generic [ref=e137]: o
                - generic [ref=e138]: w
                - generic [ref=e140]: I
                - generic [ref=e141]: t
                - generic [ref=e143]: W
                - generic [ref=e144]: o
                - generic [ref=e145]: r
                - generic [ref=e146]: k
                - generic [ref=e147]: s
        - generic [ref=e150]:
          - generic [ref=e151] [cursor=pointer]
          - generic: Friction detected
          - generic [ref=e152]: A rotating three-dimensional network of points that organises into a sphere, representing the connections MODUS maps across a business. The network illustrates the kinds of signal a MODUS diagnostic looks for. It is an illustration, not an analysis of your business.
      - link "Scroll to explore" [ref=e153] [cursor=pointer]:
        - /url: "#manifesto"
    - generic [ref=e159]:
      - paragraph [ref=e161]: Most businesses don’t need more tools.
      - paragraph [ref=e163]: They need to see what is slowing them down.
      - paragraph [ref=e165]: Where time, money and attention are being lost.
      - paragraph [ref=e167]: MODUS finds the friction, fixes what matters,
      - paragraph [ref=e169]: and keeps improving what comes next.
    - generic [ref=e172]:
      - generic [ref=e174]:
        - generic [ref=e176]: Start Here
        - generic [ref=e177]: SYS / 02
      - heading "What could work better?" [level=2] [ref=e179]
      - generic [ref=e181]:
        - textbox "What could work better?" [ref=e182]:
          - /placeholder: Tell us where your business is getting stuck…
        - generic [ref=e183]:
          - generic [ref=e184]:
            - button "Website" [ref=e185] [cursor=pointer]
            - button "Leads" [ref=e186] [cursor=pointer]
            - button "Processes" [ref=e187] [cursor=pointer]
            - button "Growth" [ref=e188] [cursor=pointer]
            - button "Not sure yet" [ref=e189] [cursor=pointer]
          - link "Run a Diagnostic" [ref=e190] [cursor=pointer]:
            - /url: /diagnostic
            - generic [ref=e191]:
              - generic [ref=e192]: R
              - generic [ref=e193]: u
              - generic [ref=e194]: "n"
              - generic [ref=e196]: a
              - generic [ref=e198]: D
              - generic [ref=e199]: i
              - generic [ref=e200]: a
              - generic [ref=e201]: g
              - generic [ref=e202]: "n"
              - generic [ref=e203]: o
              - generic [ref=e204]: s
              - generic [ref=e205]: t
              - generic [ref=e206]: i
              - generic [ref=e207]: c
    - generic [ref=e210]:
      - generic [ref=e211]:
        - paragraph [ref=e212]: 02 / Where we sit
        - generic [ref=e213]:
          - heading "A clearer view.A better way to work." [level=2] [ref=e214]:
            - generic [ref=e215]: A clearer view.
            - generic [ref=e218]: A better way to work.
          - paragraph [ref=e221]: Between the way your business works today and what it could become. MODUS brings the whole picture together.
      - generic [ref=e223]:
        - generic [ref=e226]:
          - paragraph [ref=e227]: 01 / Diagnose
          - heading "See what is slowing you down." [level=3] [ref=e228]:
            - generic [ref=e229]: See what is slowing you
            - generic [ref=e231]: down.
          - paragraph [ref=e233]: Start with your business. Map the friction across processes, systems and everyday work.
        - generic [ref=e236]:
          - paragraph [ref=e237]: 02 / Improve
          - heading "Fix what matters." [level=3] [ref=e238]
          - paragraph [ref=e241]: Turn insight into focused changes, built around the work you actually do.
        - generic [ref=e244]:
          - paragraph [ref=e245]: 03 / Evolve
          - heading "Keep moving forward." [level=3] [ref=e246]
          - paragraph [ref=e249]: Keep learning from your operation and improve what comes next.
      - paragraph [ref=e251]: "A layered diagram of a business: your business at the top, focused improvements and diagnostic insight in the middle alongside the MODUS identity, the business areas MODUS connects — sales, operations, finance, service and tools — and your everyday operation at the base."
    - generic [ref=e253]:
      - generic [ref=e254]:
        - generic [ref=e256]:
          - generic [ref=e258]: Philosophy
          - generic [ref=e259]: SYS / 05
        - heading "Businesses are systems." [level=2] [ref=e260]:
          - generic [ref=e261]: Businesses
          - generic [ref=e263]: are
          - generic [ref=e265]: systems.
        - paragraph [ref=e268]: MODUS looks beyond the visible symptom. We understand the system around it. Then we improve the system.
      - generic [ref=e269]:
        - generic [ref=e270]:
          - paragraph [ref=e271]: A customer service problem
          - generic [ref=e272]: →
          - paragraph [ref=e273]: may actually be a workflow problem.
        - generic [ref=e274]:
          - paragraph [ref=e275]: A sales problem
          - generic [ref=e276]: →
          - paragraph [ref=e277]: may actually be a follow-up problem.
        - generic [ref=e278]:
          - paragraph [ref=e279]: A reporting problem
          - generic [ref=e280]: →
          - paragraph [ref=e281]: may actually be a data architecture problem.
        - generic [ref=e282]:
          - paragraph [ref=e283]: An automation problem
          - generic [ref=e284]: →
          - paragraph [ref=e285]: may actually be a badly designed process.
    - generic [ref=e287]:
      - generic [ref=e288]:
        - generic [ref=e290]:
          - generic [ref=e292]: Capabilities
          - generic [ref=e293]: SYS / 07
        - heading "Different disciplines. One objective." [level=2] [ref=e295]
      - generic [ref=e296]:
        - generic [ref=e298]:
          - heading "Operations" [level=3] [ref=e299]
          - paragraph [ref=e300]: Streamline processes and reduce friction.
        - generic [ref=e302]:
          - heading "Technology" [level=3] [ref=e303]
          - paragraph [ref=e304]: Improve software infrastructure and eliminate unnecessary complexity.
        - generic [ref=e306]:
          - heading "Intelligence" [level=3] [ref=e307]
          - paragraph [ref=e308]: Turn fragmented information into usable decision support.
        - generic [ref=e310]:
          - heading "Automation" [level=3] [ref=e311]
          - paragraph [ref=e312]: Remove repetitive work and apply AI where practical.
        - generic [ref=e314]:
          - heading "Customer" [level=3] [ref=e315]
          - paragraph [ref=e316]: Remove friction from how customers find, buy from and stay with you.
      - link "Capabilities →" [ref=e318] [cursor=pointer]:
        - /url: /capabilities
        - text: Capabilities
        - generic [ref=e319]: →
    - generic [ref=e321]:
      - generic [ref=e323]:
        - generic [ref=e325]:
          - generic [ref=e327]: Recently Improved
          - generic [ref=e328]: SYS / 06
        - heading "From fragmented to focused." [level=2] [ref=e330]
      - generic [ref=e331]:
        - generic [ref=e332]: Multi-location service business · Illustrative example
        - generic [ref=e336]:
          - generic [ref=e337]:
            - paragraph [ref=e338]: Multi-location service business · Illustrative example
            - paragraph [ref=e339]: Unified its systems, automated manual work and cut response time. That's a representative pattern of what a MODUS engagement targets.
          - generic [ref=e340]:
            - generic [ref=e341]:
              - paragraph [ref=e342]:
                - generic [ref=e343]: 0%
              - paragraph [ref=e344]: Faster response time
            - generic [ref=e345]:
              - paragraph [ref=e346]:
                - generic [ref=e347]: 0%
              - paragraph [ref=e348]: Increase in bookings
            - generic [ref=e349]:
              - paragraph [ref=e350]:
                - generic [ref=e351]: €0K+
              - paragraph [ref=e352]: Annual value created
          - link "Read the case →" [ref=e353] [cursor=pointer]:
            - /url: /results
            - text: Read the case
            - generic [ref=e354]: →
    - generic [ref=e356]:
      - generic [ref=e357]:
        - generic [ref=e359]:
          - generic [ref=e361]: Platform
          - generic [ref=e362]: SYS / 04
        - heading "Everything MODUS sees. In one place." [level=2] [ref=e364]
        - paragraph [ref=e366]: Business health, signals, active work and measured outcomes, always visible. Not an inbox you wait on.
      - generic [ref=e369]:
        - generic [ref=e370]:
          - generic [ref=e371]: Platform
          - navigation [ref=e379]:
            - button "Overview" [ref=e380] [cursor=pointer]
            - button "Signals" [ref=e384] [cursor=pointer]
            - button "Improvements" [ref=e392] [cursor=pointer]
            - button "Performance" [ref=e400] [cursor=pointer]
            - button "Systems" [ref=e404] [cursor=pointer]
            - button "Ask MODUS" [ref=e410] [cursor=pointer]
        - generic [ref=e415]:
          - generic [ref=e416]:
            - paragraph [ref=e417]: Business Health
            - paragraph [ref=e418]: 82 / 100
            - paragraph [ref=e419]: Stable · +4 since July
          - generic [ref=e420]:
            - paragraph [ref=e421]: Signals
            - paragraph [ref=e422]: "7"
            - paragraph [ref=e423]: Next review 04 Sep 2026
          - generic [ref=e424]:
            - paragraph [ref=e425]: Active Improvements
            - paragraph [ref=e426]: "3"
            - paragraph [ref=e427]: Customer intake · CRM sync · Checkout
          - generic [ref=e428]:
            - paragraph [ref=e429]: Annualized Impact
            - paragraph [ref=e430]: €18,420
            - paragraph [ref=e431]: 124 hrs removed · +0.8% conv.
      - link "Explore the MODUS Platform" [ref=e436] [cursor=pointer]:
        - /url: /platform
    - generic [ref=e440]:
      - generic [ref=e441]:
        - generic [ref=e443]:
          - generic [ref=e445]: Engagement
          - generic [ref=e446]: SYS / 08
        - heading "Three ways to work with MODUS." [level=2] [ref=e448]
        - paragraph [ref=e450]: Every engagement starts with a Free Diagnostic. Advertising spend is always shown separately from the retainer.
      - generic [ref=e451]:
        - generic [ref=e453]:
          - paragraph [ref=e454]: Essential
          - paragraph [ref=e455]: €200/month
          - paragraph [ref=e456]: A steady, focused improvement cadence for a single constraint at a time.
        - generic [ref=e458]:
          - paragraph [ref=e459]: Intelligence
          - paragraph [ref=e460]: €750/month
          - paragraph [ref=e461]: Deeper diagnostic work and more frequent implementation across the business.
        - generic [ref=e463]:
          - paragraph [ref=e464]: Growth
          - paragraph [ref=e465]: €1,000/month
          - paragraph [ref=e466]: For businesses actively scaling operations, systems and demand.
      - generic [ref=e468]:
        - link "Run a Diagnostic" [ref=e469] [cursor=pointer]:
          - /url: /diagnostic
          - generic [ref=e470]:
            - generic [ref=e471]: R
            - generic [ref=e472]: u
            - generic [ref=e473]: "n"
            - generic [ref=e475]: a
            - generic [ref=e477]: D
            - generic [ref=e478]: i
            - generic [ref=e479]: a
            - generic [ref=e480]: g
            - generic [ref=e481]: "n"
            - generic [ref=e482]: o
            - generic [ref=e483]: s
            - generic [ref=e484]: t
            - generic [ref=e485]: i
            - generic [ref=e486]: c
        - link "See full pricing →" [ref=e488] [cursor=pointer]:
          - /url: /pricing
          - text: See full pricing
          - generic [ref=e489]: →
    - generic [ref=e490]:
      - generic [ref=e494]:
        - paragraph [ref=e496]: Get Started
        - heading "What would MODUS find in your business?" [level=2] [ref=e497]:
          - generic [ref=e498]: What
          - generic [ref=e500]: would
          - generic [ref=e502]: MODUS
          - generic [ref=e504]: find
          - generic [ref=e506]: in
          - generic [ref=e508]: your
          - generic [ref=e510]: business?
        - paragraph [ref=e513]: Find where your business is losing time, performance or opportunity.
        - generic [ref=e515]:
          - link "Run a Diagnostic" [ref=e517] [cursor=pointer]:
            - /url: /diagnostic
            - generic [ref=e518]:
              - generic [ref=e519]: R
              - generic [ref=e520]: u
              - generic [ref=e521]: "n"
              - generic [ref=e523]: a
              - generic [ref=e525]: D
              - generic [ref=e526]: i
              - generic [ref=e527]: a
              - generic [ref=e528]: g
              - generic [ref=e529]: "n"
              - generic [ref=e530]: o
              - generic [ref=e531]: s
              - generic [ref=e532]: t
              - generic [ref=e533]: i
              - generic [ref=e534]: c
          - button "Talk to MODUS" [ref=e536] [cursor=pointer]
        - paragraph [ref=e538]: No generic AI audit. No 40-page report. No obligation to implement everything.
      - generic [ref=e541]:
        - generic [ref=e542]: MODUS
        - paragraph [ref=e546]: A better way to operate.
        - generic [ref=e547]:
          - generic [ref=e548]:
            - paragraph [ref=e549]: MODUS
            - paragraph [ref=e550]: Improvement infrastructure for growing businesses.
          - generic [ref=e551]:
            - paragraph [ref=e552]: Navigate
            - list [ref=e553]:
              - listitem [ref=e554]:
                - link "How It Works" [ref=e555] [cursor=pointer]:
                  - /url: /how-it-works
              - listitem [ref=e556]:
                - link "Platform" [ref=e557] [cursor=pointer]:
                  - /url: /platform
              - listitem [ref=e558]:
                - link "Pricing" [ref=e559] [cursor=pointer]:
                  - /url: /pricing
              - listitem [ref=e560]:
                - link "Capabilities" [ref=e561] [cursor=pointer]:
                  - /url: /capabilities
              - listitem [ref=e562]:
                - link "Results" [ref=e563] [cursor=pointer]:
                  - /url: /results
              - listitem [ref=e564]:
                - link "Company" [ref=e565] [cursor=pointer]:
                  - /url: /company
          - generic [ref=e566]:
            - paragraph [ref=e567]: Get Started
            - generic [ref=e568]:
              - link "Run a Diagnostic" [ref=e569] [cursor=pointer]:
                - /url: /diagnostic
                - generic [ref=e570]:
                  - generic [ref=e571]: R
                  - generic [ref=e572]: u
                  - generic [ref=e573]: "n"
                  - generic [ref=e575]: a
                  - generic [ref=e577]: D
                  - generic [ref=e578]: i
                  - generic [ref=e579]: a
                  - generic [ref=e580]: g
                  - generic [ref=e581]: "n"
                  - generic [ref=e582]: o
                  - generic [ref=e583]: s
                  - generic [ref=e584]: t
                  - generic [ref=e585]: i
                  - generic [ref=e586]: c
              - button "Talk to MODUS" [ref=e588] [cursor=pointer]
        - generic [ref=e589]: MODUS / Online. Systems improve. The loop continues.
        - generic [ref=e592]:
          - generic [ref=e593]:
            - paragraph [ref=e594]: © 2026 MODUS. Improvement Infrastructure.
            - group "Language" [ref=e595]:
              - button "EN" [ref=e597] [cursor=pointer]
              - generic [ref=e598]:
                - generic [ref=e599]: /
                - button "NL" [ref=e600] [cursor=pointer]
          - generic [ref=e601]:
            - link "Privacy" [ref=e602] [cursor=pointer]:
              - /url: /privacypolicy
            - button "Privacy Preferences" [ref=e603] [cursor=pointer]
            - link "Legal" [ref=e604] [cursor=pointer]:
              - /url: /legal
            - link "MODUS on LinkedIn" [ref=e605] [cursor=pointer]:
              - /url: "#"
  - button "Open MODUS assistant" [ref=e611] [cursor=pointer]
  - dialog "Privacy / Preferences" [ref=e618]:
    - generic [ref=e619]:
      - generic [ref=e620]: Privacy / Preferences
      - generic [ref=e625]:
        - paragraph [ref=e626]: MODUS uses necessary technologies to operate this website. Optional analytics help us understand how the site is used, and only run once you allow them.
        - generic [ref=e627]:
          - button "Accept All" [ref=e628] [cursor=pointer]
          - button "Reject Optional" [ref=e629] [cursor=pointer]
          - button "Manage" [ref=e630] [cursor=pointer]
  - alert [ref=e631]
```

# Test source

```ts
  1   | import { test, expect, type Page } from "@playwright/test";
  2   | 
  3   | /**
  4   |  * The hero's process bubbles.
  5   |  *
  6   |  * They were reported missing on the deployed site. They were not missing:
  7   |  * the element existed, the cycle ran and the text changed on every pass.
  8   |  * They were positioned in CANVAS space while being absolutely positioned
  9   |  * inside the ANCHOR, and the canvas is deliberately overscanned to the
  10  |  * size of the hero — so the bubble was placed up to a full overscan to
  11  |  * the right. Measured on production at x≈1790 in a 1440px viewport, which
  12  |  * is outside the hero's `overflow: hidden` box, so every bubble was
  13  |  * clipped away.
  14  |  *
  15  |  * Nothing in the suite noticed, because "is the element present and
  16  |  * animating" was true throughout. These assert the thing that was
  17  |  * actually broken: where it ends up on screen.
  18  |  */
  19  | 
  20  | const BUBBLE = 'div[data-state][aria-hidden="true"]';
  21  | 
  22  | async function sample(page: Page) {
  23  |   return page.evaluate((sel) => {
  24  |     const d = document.querySelector(sel) as HTMLElement | null;
  25  |     if (!d) return null;
  26  |     const b = d.getBoundingClientRect();
  27  |     return {
  28  |       state: d.dataset.state,
  29  |       opacity: Number(getComputedStyle(d).opacity),
  30  |       text: d.textContent?.trim() ?? "",
  31  |       left: b.left,
  32  |       top: b.top,
  33  |       right: b.right,
  34  |       bottom: b.bottom,
  35  |       insideViewport: b.left >= 0 && b.right <= window.innerWidth && b.top >= 0 && b.bottom <= window.innerHeight,
  36  |     };
  37  |   }, BUBBLE);
  38  | }
  39  | 
  40  | test.describe("hero process bubbles", () => {
  41  |   test.use({ viewport: { width: 1440, height: 900 } });
  42  | 
  43  |   test("appear on screen, inside the hero, and are never clipped away", async ({ page }) => {
  44  |     test.setTimeout(60_000);
  45  |     await page.goto("/");
  46  |     await page.waitForLoadState("networkidle");
  47  | 
  48  |     const seen: string[] = [];
  49  |     let everVisible = false;
  50  |     let everOutside = false;
  51  | 
  52  |     // Watch several cycles: hold is 3s with a 2s gap, so this spans more
  53  |     // than one bubble.
  54  |     for (let i = 0; i < 10; i++) {
  55  |       await page.waitForTimeout(900);
  56  |       const s = await sample(page);
  57  |       expect(s, "the bubble element should exist").not.toBeNull();
  58  |       if (s!.state === "in" && s!.opacity > 0.5) {
  59  |         everVisible = true;
  60  |         if (s!.text) seen.push(s!.text);
  61  |         // The real defect: positioned outside the viewport and clipped.
  62  |         if (!s!.insideViewport) everOutside = true;
  63  |       }
  64  |     }
  65  | 
  66  |     expect(everVisible, "a bubble should become visible within ~9s").toBe(true);
  67  |     expect(
  68  |       everOutside,
  69  |       "a visible bubble was positioned outside the viewport and would be clipped by the hero"
  70  |     ).toBe(false);
  71  |     expect(seen.length, "a bubble should carry its label text").toBeGreaterThan(0);
  72  |   });
  73  | 
  74  |   test("the label changes between cycles rather than repeating one", async ({ page }) => {
  75  |     test.setTimeout(60_000);
  76  |     await page.goto("/");
  77  |     await page.waitForLoadState("networkidle");
  78  | 
  79  |     /*
  80  |      * Condition-based rather than a fixed number of samples. A cycle is
  81  |      * ~5s (3s hold, 2s gap) and the loop only advances while the scene is
  82  |      * visible and the tab is active, so under load fewer cycles complete
  83  |      * in a given wall-clock window — which made a fixed sample count fail
  84  |      * intermittently in a full-suite run while passing in isolation.
  85  |      * `pickBubble` cannot repeat an index consecutively, so two distinct
  86  |      * labels is the right assertion; it just needs long enough to see
  87  |      * two bubbles.
  88  |      */
  89  |     const labels = new Set<string>();
  90  |     await expect
  91  |       .poll(
  92  |         async () => {
  93  |           const s = await sample(page);
  94  |           if (s?.state === "in" && s.opacity > 0.5 && s.text) labels.add(s.text);
  95  |           return labels.size;
  96  |         },
  97  |         { timeout: 40_000, intervals: [400] }
  98  |       )
> 99  |       .toBeGreaterThan(1);
      |        ^ Error: expect(received).toBeGreaterThan(expected)
  100 |   });
  101 | 
  102 |   test("they sit over the scene, not over the headline column", async ({ page }) => {
  103 |     test.setTimeout(60_000);
  104 |     await page.goto("/");
  105 |     await page.waitForLoadState("networkidle");
  106 | 
  107 |     const heading = await page.getByRole("heading", { level: 1 }).first().boundingBox();
  108 |     expect(heading).not.toBeNull();
  109 | 
  110 |     for (let i = 0; i < 8; i++) {
  111 |       await page.waitForTimeout(900);
  112 |       const s = await sample(page);
  113 |       if (s?.state !== "in" || s.opacity <= 0.5) continue;
  114 |       // The scene is to the right of the copy; a bubble must not land on
  115 |       // the headline.
  116 |       const overlapsHeading =
  117 |         s.left < heading!.x + heading!.width &&
  118 |         s.right > heading!.x &&
  119 |         s.top < heading!.y + heading!.height &&
  120 |         s.bottom > heading!.y;
  121 |       expect(overlapsHeading, `bubble overlapped the headline at ${s.left},${s.top}`).toBe(false);
  122 |     }
  123 |   });
  124 | 
  125 |   test("reduced motion does not run the bubble cycle", async ({ page }) => {
  126 |     await page.emulateMedia({ reducedMotion: "reduce" });
  127 |     await page.goto("/");
  128 |     await page.waitForLoadState("networkidle");
  129 |     await page.waitForTimeout(4000);
  130 |     const s = await sample(page);
  131 |     // The element may exist, but it must never be animated into view.
  132 |     expect(s?.state).toBe("out");
  133 |   });
  134 | });
  135 | 
  136 | for (const [name, viewport] of [
  137 |   ["desktop", { width: 1440, height: 900 }],
  138 |   ["mobile", { width: 390, height: 844 }],
  139 | ] as const) {
  140 |   test(`capture a visible bubble at ${name}`, async ({ page }) => {
  141 |     test.setTimeout(60_000);
  142 |     await page.setViewportSize(viewport);
  143 |     await page.goto("/");
  144 |     await page.waitForLoadState("networkidle");
  145 |     // Wait for a cycle where the bubble is actually up, so the capture
  146 |     // shows the thing being claimed rather than the gap between bubbles.
  147 |     for (let i = 0; i < 12; i++) {
  148 |       const s = await sample(page);
  149 |       if (s?.state === "in" && s.opacity > 0.9) break;
  150 |       await page.waitForTimeout(500);
  151 |     }
  152 |     await page.screenshot({ path: `e2e-screens/hero-bubble-${name}.png` });
  153 |   });
  154 | }
  155 | 
```