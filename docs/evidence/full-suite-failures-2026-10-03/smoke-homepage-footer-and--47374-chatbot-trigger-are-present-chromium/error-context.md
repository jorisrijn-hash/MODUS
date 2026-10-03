# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> homepage >> footer and Talk to MODUS chatbot trigger are present
- Location: e2e/smoke.spec.ts:56:7

# Error details

```
Error: locator.scrollIntoViewIfNeeded: Error: strict mode violation: locator('footer') resolved to 2 elements:
    1) <footer class="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4">…</footer> aka getByTestId('platform-demo').locator('footer')
    2) <footer class="border-t border-line bg-inverted text-inverted-foreground">…</footer> aka locator('footer').filter({ hasText: 'MODUSA better way to operate.' })

Call log:
  - waiting for locator('footer')

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
        - link "Run a Diagnostic" [ref=e69] [cursor=pointer]:
          - /url: /diagnostic
          - generic [ref=e70]:
            - generic [ref=e71]: R
            - generic [ref=e72]: u
            - generic [ref=e73]: "n"
            - generic [ref=e75]: a
            - generic [ref=e77]: D
            - generic [ref=e78]: i
            - generic [ref=e79]: a
            - generic [ref=e80]: g
            - generic [ref=e81]: "n"
            - generic [ref=e82]: o
            - generic [ref=e83]: s
            - generic [ref=e84]: t
            - generic [ref=e85]: i
            - generic [ref=e86]: c
  - main [ref=e89]:
    - generic [ref=e90]:
      - generic [ref=e92]:
        - generic [ref=e93]:
          - paragraph [ref=e95]: Business, without the friction
          - heading "Find the friction.Move forward." [level=1] [ref=e96]:
            - generic [ref=e97]: Find the friction.
            - generic [ref=e100]: Move forward.
          - paragraph [ref=e104]: MODUS connects the dots between your people, processes and tools. See what holds you back, and improve what actually matters.
          - generic [ref=e106]:
            - link "Run a Diagnostic" [ref=e108] [cursor=pointer]:
              - /url: /diagnostic
              - generic [ref=e109]:
                - generic [ref=e110]: R
                - generic [ref=e111]: u
                - generic [ref=e112]: "n"
                - generic [ref=e114]: a
                - generic [ref=e116]: D
                - generic [ref=e117]: i
                - generic [ref=e118]: a
                - generic [ref=e119]: g
                - generic [ref=e120]: "n"
                - generic [ref=e121]: o
                - generic [ref=e122]: s
                - generic [ref=e123]: t
                - generic [ref=e124]: i
                - generic [ref=e125]: c
            - link "See How It Works" [ref=e127] [cursor=pointer]:
              - /url: /how-it-works
              - generic [ref=e128]:
                - generic [ref=e129]: S
                - generic [ref=e130]: e
                - generic [ref=e131]: e
                - generic [ref=e133]: H
                - generic [ref=e134]: o
                - generic [ref=e135]: w
                - generic [ref=e137]: I
                - generic [ref=e138]: t
                - generic [ref=e140]: W
                - generic [ref=e141]: o
                - generic [ref=e142]: r
                - generic [ref=e143]: k
                - generic [ref=e144]: s
        - generic [ref=e147]:
          - generic [ref=e148] [cursor=pointer]
          - generic [ref=e149]: A rotating three-dimensional network of points that organises into a sphere, representing the connections MODUS maps across a business. The network illustrates the kinds of signal a MODUS diagnostic looks for. It is an illustration, not an analysis of your business.
      - link "Scroll to explore" [ref=e150] [cursor=pointer]:
        - /url: "#manifesto"
    - generic [ref=e156]:
      - paragraph [ref=e158]: Most businesses don’t need more tools.
      - paragraph [ref=e160]: They need to see what is slowing them down.
      - paragraph [ref=e162]: Where time, money and attention are being lost.
      - paragraph [ref=e164]: MODUS finds the friction, fixes what matters,
      - paragraph [ref=e166]: and keeps improving what comes next.
    - generic [ref=e169]:
      - generic [ref=e171]:
        - generic [ref=e173]: Start Here
        - generic [ref=e174]: SYS / 02
      - heading "What could work better?" [level=2] [ref=e176]
      - generic [ref=e178]:
        - textbox "What could work better?" [ref=e179]:
          - /placeholder: Tell us where your business is getting stuck…
        - generic [ref=e180]:
          - generic [ref=e181]:
            - button "Website" [ref=e182] [cursor=pointer]
            - button "Leads" [ref=e183] [cursor=pointer]
            - button "Processes" [ref=e184] [cursor=pointer]
            - button "Growth" [ref=e185] [cursor=pointer]
            - button "Not sure yet" [ref=e186] [cursor=pointer]
          - link "Run a Diagnostic" [ref=e187] [cursor=pointer]:
            - /url: /diagnostic
            - generic [ref=e188]:
              - generic [ref=e189]: R
              - generic [ref=e190]: u
              - generic [ref=e191]: "n"
              - generic [ref=e193]: a
              - generic [ref=e195]: D
              - generic [ref=e196]: i
              - generic [ref=e197]: a
              - generic [ref=e198]: g
              - generic [ref=e199]: "n"
              - generic [ref=e200]: o
              - generic [ref=e201]: s
              - generic [ref=e202]: t
              - generic [ref=e203]: i
              - generic [ref=e204]: c
    - generic [ref=e207]:
      - generic [ref=e208]:
        - paragraph [ref=e209]: 02 / Where we sit
        - generic [ref=e210]:
          - heading "A clearer view.A better way to work." [level=2] [ref=e211]:
            - generic [ref=e212]: A clearer view.
            - generic [ref=e215]: A better way to work.
          - paragraph [ref=e218]: Between the way your business works today and what it could become. MODUS brings the whole picture together.
      - generic [ref=e220]:
        - generic [ref=e223]:
          - paragraph [ref=e224]: 01 / Diagnose
          - heading "See what is slowing you down." [level=3] [ref=e225]:
            - generic [ref=e226]: See what is slowing
            - generic [ref=e228]: you down.
          - paragraph [ref=e230]: Start with your business. Map the friction across processes, systems and everyday work.
        - generic [ref=e233]:
          - paragraph [ref=e234]: 02 / Improve
          - heading "Fix what matters." [level=3] [ref=e235]
          - paragraph [ref=e238]: Turn insight into focused changes, built around the work you actually do.
        - generic [ref=e241]:
          - paragraph [ref=e242]: 03 / Evolve
          - heading "Keep moving forward." [level=3] [ref=e243]
          - paragraph [ref=e246]: Keep learning from your operation and improve what comes next.
      - paragraph [ref=e248]: "A layered diagram of a business: your business at the top, focused improvements and diagnostic insight in the middle alongside the MODUS identity, the business areas MODUS connects — sales, operations, finance, service and tools — and your everyday operation at the base."
    - generic [ref=e250]:
      - generic [ref=e251]:
        - generic [ref=e253]:
          - generic [ref=e255]: Philosophy
          - generic [ref=e256]: SYS / 05
        - heading "Businesses are systems." [level=2] [ref=e257]:
          - generic [ref=e258]: Businesses
          - generic [ref=e260]: are
          - generic [ref=e262]: systems.
        - paragraph [ref=e265]: MODUS looks beyond the visible symptom. We understand the system around it. Then we improve the system.
      - generic [ref=e266]:
        - generic [ref=e267]:
          - paragraph [ref=e268]: A customer service problem
          - generic [ref=e269]: →
          - paragraph [ref=e270]: may actually be a workflow problem.
        - generic [ref=e271]:
          - paragraph [ref=e272]: A sales problem
          - generic [ref=e273]: →
          - paragraph [ref=e274]: may actually be a follow-up problem.
        - generic [ref=e275]:
          - paragraph [ref=e276]: A reporting problem
          - generic [ref=e277]: →
          - paragraph [ref=e278]: may actually be a data architecture problem.
        - generic [ref=e279]:
          - paragraph [ref=e280]: An automation problem
          - generic [ref=e281]: →
          - paragraph [ref=e282]: may actually be a badly designed process.
    - generic [ref=e284]:
      - generic [ref=e285]:
        - generic [ref=e287]:
          - generic [ref=e289]: Capabilities
          - generic [ref=e290]: SYS / 07
        - heading "Different disciplines. One objective." [level=2] [ref=e292]
      - generic [ref=e293]:
        - generic [ref=e295]:
          - heading "Operations" [level=3] [ref=e296]
          - paragraph [ref=e297]: Streamline processes and reduce friction.
        - generic [ref=e299]:
          - heading "Technology" [level=3] [ref=e300]
          - paragraph [ref=e301]: Improve software infrastructure and eliminate unnecessary complexity.
        - generic [ref=e303]:
          - heading "Intelligence" [level=3] [ref=e304]
          - paragraph [ref=e305]: Turn fragmented information into usable decision support.
        - generic [ref=e307]:
          - heading "Automation" [level=3] [ref=e308]
          - paragraph [ref=e309]: Remove repetitive work and apply AI where practical.
        - generic [ref=e311]:
          - heading "Customer" [level=3] [ref=e312]
          - paragraph [ref=e313]: Remove friction from how customers find, buy from and stay with you.
      - link "Capabilities →" [ref=e315] [cursor=pointer]:
        - /url: /capabilities
        - text: Capabilities
        - generic [ref=e316]: →
    - generic [ref=e318]:
      - generic [ref=e320]:
        - generic [ref=e322]:
          - generic [ref=e324]: Recently Improved
          - generic [ref=e325]: SYS / 06
        - heading "From fragmented to focused." [level=2] [ref=e327]
      - generic [ref=e328]:
        - generic [ref=e329]: Multi-location service business · Illustrative example
        - generic [ref=e333]:
          - generic [ref=e334]:
            - paragraph [ref=e335]: Multi-location service business · Illustrative example
            - paragraph [ref=e336]: Unified its systems, automated manual work and cut response time. That's a representative pattern of what a MODUS engagement targets.
          - generic [ref=e337]:
            - generic [ref=e338]:
              - paragraph [ref=e339]:
                - generic [ref=e340]: 0%
              - paragraph [ref=e341]: Faster response time
            - generic [ref=e342]:
              - paragraph [ref=e343]:
                - generic [ref=e344]: 0%
              - paragraph [ref=e345]: Increase in bookings
            - generic [ref=e346]:
              - paragraph [ref=e347]:
                - generic [ref=e348]: €0K+
              - paragraph [ref=e349]: Annual value created
          - link "Read the case →" [ref=e350] [cursor=pointer]:
            - /url: /results
            - text: Read the case
            - generic [ref=e351]: →
    - generic [ref=e353]:
      - generic [ref=e354]:
        - generic [ref=e356]:
          - generic [ref=e358]: Platform
          - generic [ref=e359]: SYS / 04
        - heading "Everything MODUS sees. In one place." [level=2] [ref=e361]
        - paragraph [ref=e363]: Business health, signals, active work and measured outcomes, always visible. Not an inbox you wait on.
      - region "Interactive MODUS OS demo" [ref=e365]:
        - generic [ref=e366]:
          - generic [ref=e367]:
            - generic [ref=e374]: MODUS OS
            - generic [ref=e375]: Test demo
          - button "Reset" [ref=e376] [cursor=pointer]
        - generic [ref=e380]:
          - navigation "Demo navigation" [ref=e381]:
            - button "Overview" [pressed] [ref=e382] [cursor=pointer]
            - button "Signals" [ref=e386] [cursor=pointer]
            - button "Workflow" [ref=e394] [cursor=pointer]
          - generic [ref=e396]:
            - paragraph [ref=e397]: Sample business / Northline Studio
            - generic [ref=e398]:
              - heading "Less searching. More progress." [level=3] [ref=e399]
              - paragraph [ref=e400]: Follow one example from a signal to a concrete next step.
              - generic [ref=e401]:
                - generic [ref=e402]:
                  - paragraph [ref=e403]: Signals
                  - paragraph [ref=e404]: "1"
                - generic [ref=e405]:
                  - paragraph [ref=e406]: In review
                  - paragraph [ref=e407]: "0"
                - generic [ref=e408]:
                  - paragraph [ref=e409]: Contacted
                  - paragraph [ref=e410]: "0"
              - generic [ref=e411]:
                - paragraph [ref=e412]: Opportunity to investigate
                - heading "Enquiries arrive. Follow-up is scattered." [level=4] [ref=e413]
                - paragraph [ref=e414]: Three intake channels and a shared spreadsheet. Start by asking who owns each enquiry.
                - button "Inspect the signal" [ref=e415] [cursor=pointer]
        - generic [ref=e418]:
          - paragraph [ref=e419]: Sample data · local demo · no live integrations or AI. Available features depend on the agreed scope.
          - link "Start with your business" [ref=e420] [cursor=pointer]:
            - /url: /diagnostic
      - link "Explore the MODUS Platform" [ref=e424] [cursor=pointer]:
        - /url: /platform
    - generic [ref=e428]:
      - generic [ref=e429]:
        - generic [ref=e430]:
          - generic [ref=e432]: Engagement
          - generic [ref=e433]: SYS / 08
        - generic [ref=e434]:
          - heading "Start small. Build with purpose." [level=2] [ref=e435]
          - link "Compare the full scope →" [ref=e436] [cursor=pointer]:
            - /url: /pricing
      - generic [ref=e438]:
        - generic [ref=e439]:
          - generic [ref=e440]:
            - paragraph [ref=e441]: Personal pricing
            - heading "Your business shapes the scope." [level=3] [ref=e442]
            - paragraph [ref=e443]: Indicative monthly prices. The free diagnostic gives a personal price range; review determines the scope and quote.
            - link "Get your personal price" [ref=e444] [cursor=pointer]:
              - /url: /diagnostic
          - article [ref=e447]:
            - heading "Essentials" [level=3] [ref=e449]
            - paragraph [ref=e450]: A practical starting point for a small budget.
            - paragraph [ref=e451]: ≈ €200/ month
            - list [ref=e452]:
              - listitem [ref=e453]: Basic website and workflow upkeep
              - listitem [ref=e456]: One small improvement at a time
              - listitem [ref=e459]: Monthly progress check-in
            - paragraph [ref=e462]: Without MODUS OS
            - link "Find my scope" [ref=e463] [cursor=pointer]:
              - /url: /diagnostic?interest=essentials
          - article [ref=e464]:
            - generic [ref=e465]:
              - heading "Core" [level=3] [ref=e466]
              - generic [ref=e467]: Best value
            - paragraph [ref=e468]: The strongest balance of clarity and implementation.
            - paragraph [ref=e469]: ≈ €700/ month
            - list [ref=e470]:
              - listitem [ref=e471]: MODUS OS workspace access
              - listitem [ref=e474]: One priority workflow, improved continuously
              - listitem [ref=e477]: Scoped automation and integrations
            - paragraph [ref=e480]: MODUS OS included
            - link "Find my scope" [ref=e481] [cursor=pointer]:
              - /url: /diagnostic?interest=core
          - article [ref=e482]:
            - heading "Partner" [level=3] [ref=e484]
            - paragraph [ref=e485]: More capacity for a broader set of improvements.
            - paragraph [ref=e486]: ≈ €1,000/ month
            - list [ref=e487]:
              - listitem [ref=e488]: Everything in Core, including MODUS OS
              - listitem [ref=e491]: Broader coordination across workflows
              - listitem [ref=e494]: More implementation and iteration capacity
            - paragraph [ref=e497]: MODUS OS included
            - link "Find my scope" [ref=e498] [cursor=pointer]:
              - /url: /diagnostic?interest=partner
        - paragraph [ref=e499]: No unlimited hours or integrations. Capacity, tools, review cadence and deliverables are agreed before work starts. Advertising spend, third-party tools and any one-time implementation are separate in the quote.
    - generic [ref=e500]:
      - generic [ref=e504]:
        - paragraph [ref=e506]: Get Started
        - heading "What would MODUS find in your business?" [level=2] [ref=e507]:
          - generic [ref=e508]: What
          - generic [ref=e510]: would
          - generic [ref=e512]: MODUS
          - generic [ref=e514]: find
          - generic [ref=e516]: in
          - generic [ref=e518]: your
          - generic [ref=e520]: business?
        - paragraph [ref=e523]: Find where your business is losing time, performance or opportunity.
        - generic [ref=e525]:
          - link "Run a Diagnostic" [ref=e527] [cursor=pointer]:
            - /url: /diagnostic
            - generic [ref=e528]:
              - generic [ref=e529]: R
              - generic [ref=e530]: u
              - generic [ref=e531]: "n"
              - generic [ref=e533]: a
              - generic [ref=e535]: D
              - generic [ref=e536]: i
              - generic [ref=e537]: a
              - generic [ref=e538]: g
              - generic [ref=e539]: "n"
              - generic [ref=e540]: o
              - generic [ref=e541]: s
              - generic [ref=e542]: t
              - generic [ref=e543]: i
              - generic [ref=e544]: c
          - button "Talk to MODUS" [ref=e546] [cursor=pointer]
        - paragraph [ref=e548]: No generic AI audit. No 40-page report. No obligation to implement everything.
      - generic [ref=e551]:
        - generic [ref=e552]: MODUS
        - paragraph [ref=e556]: A better way to operate.
        - generic [ref=e557]:
          - generic [ref=e558]:
            - paragraph [ref=e559]: MODUS
            - paragraph [ref=e560]: Improvement infrastructure for growing businesses.
          - generic [ref=e561]:
            - paragraph [ref=e562]: Navigate
            - list [ref=e563]:
              - listitem [ref=e564]:
                - link "How It Works" [ref=e565] [cursor=pointer]:
                  - /url: /how-it-works
              - listitem [ref=e566]:
                - link "Platform" [ref=e567] [cursor=pointer]:
                  - /url: /platform
              - listitem [ref=e568]:
                - link "Pricing" [ref=e569] [cursor=pointer]:
                  - /url: /pricing
              - listitem [ref=e570]:
                - link "Capabilities" [ref=e571] [cursor=pointer]:
                  - /url: /capabilities
              - listitem [ref=e572]:
                - link "Results" [ref=e573] [cursor=pointer]:
                  - /url: /results
              - listitem [ref=e574]:
                - link "Company" [ref=e575] [cursor=pointer]:
                  - /url: /company
          - generic [ref=e576]:
            - paragraph [ref=e577]: Get Started
            - generic [ref=e578]:
              - link "Run a Diagnostic" [ref=e579] [cursor=pointer]:
                - /url: /diagnostic
                - generic [ref=e580]:
                  - generic [ref=e581]: R
                  - generic [ref=e582]: u
                  - generic [ref=e583]: "n"
                  - generic [ref=e585]: a
                  - generic [ref=e587]: D
                  - generic [ref=e588]: i
                  - generic [ref=e589]: a
                  - generic [ref=e590]: g
                  - generic [ref=e591]: "n"
                  - generic [ref=e592]: o
                  - generic [ref=e593]: s
                  - generic [ref=e594]: t
                  - generic [ref=e595]: i
                  - generic [ref=e596]: c
              - button "Talk to MODUS" [ref=e598] [cursor=pointer]
        - generic [ref=e599]: MODUS / Online. Systems improve. The loop continues.
        - generic [ref=e602]:
          - generic [ref=e603]:
            - paragraph [ref=e604]: © 2026 MODUS. Improvement Infrastructure.
            - group "Language" [ref=e605]:
              - button "EN" [ref=e607] [cursor=pointer]
              - generic [ref=e608]:
                - generic [ref=e609]: /
                - button "NL" [ref=e610] [cursor=pointer]
          - generic [ref=e611]:
            - link "Privacy" [ref=e612] [cursor=pointer]:
              - /url: /privacypolicy
            - button "Privacy Preferences" [ref=e613] [cursor=pointer]
            - link "Legal" [ref=e614] [cursor=pointer]:
              - /url: /legal
            - link "MODUS on LinkedIn" [ref=e615] [cursor=pointer]:
              - /url: "#"
  - button "Open MODUS assistant" [ref=e621] [cursor=pointer]
  - dialog "Privacy / Preferences" [ref=e628]:
    - generic [ref=e629]:
      - generic [ref=e630]: Privacy / Preferences
      - generic [ref=e635]:
        - paragraph [ref=e636]: MODUS uses necessary technologies to operate this website. Optional analytics help us understand how the site is used, and only run once you allow them.
        - generic [ref=e637]:
          - button "Accept All" [ref=e638] [cursor=pointer]
          - button "Reject Optional" [ref=e639] [cursor=pointer]
          - button "Manage" [ref=e640] [cursor=pointer]
  - button "Open Next.js Dev Tools" [ref=e646] [cursor=pointer]
  - alert [ref=e650]
```

# Test source

```ts
  1  | import { test, expect, type Page } from "@playwright/test";
  2  | 
  3  | function trackConsoleErrors(page: Page) {
  4  |   const errors: string[] = [];
  5  |   page.on("console", (msg) => {
  6  |     if (msg.type() === "error") errors.push(msg.text());
  7  |   });
  8  |   page.on("pageerror", (err) => errors.push(err.message));
  9  |   return errors;
  10 | }
  11 | 
  12 | const PUBLIC_ROUTES = ["/", "/how-it-works", "/platform", "/pricing", "/capabilities", "/results", "/company", "/diagnostic"];
  13 | 
  14 | test.describe("public routes load clean", () => {
  15 |   for (const route of PUBLIC_ROUTES) {
  16 |     test(`${route} has no console errors`, async ({ page }) => {
  17 |       const errors = trackConsoleErrors(page);
  18 |       const res = await page.goto(route);
  19 |       expect(res?.status()).toBeLessThan(400);
  20 |       await page.waitForLoadState("networkidle");
  21 |       expect(errors, `console errors on ${route}:\n${errors.join("\n")}`).toEqual([]);
  22 |     });
  23 |   }
  24 | });
  25 | 
  26 | test.describe("homepage", () => {
  27 |   test("nav links and language switch work", async ({ page }) => {
  28 |     await page.goto("/");
  29 |     // Checkpoint 5.5 — the primary nav row was reduced to 4 links
  30 |     // (Platform moved out, still reachable via the footer and the mobile
  31 |     // menu's fuller set); "Capabilities" is one of the four that remain.
  32 |     await expect(page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Capabilities" })).toBeVisible();
  33 | 
  34 |     // language switch: EN -> NL -> EN, headline should change and not vanish.
  35 |     // Checkpoint 5.5 moved the EN/NL control out of the nav bar itself and
  36 |     // into the compact `NavUtilityMenu` popover, so it must be opened first.
  37 |     const headline = page.locator("h1").first();
  38 |     await expect(headline).toBeVisible();
  39 |     const enText = await headline.textContent();
  40 | 
  41 |     await page.getByRole("button", { name: "Preferences", exact: true }).click();
  42 |     await page.getByRole("banner").getByRole("button", { name: "NL", exact: true }).click();
  43 |     await page.waitForTimeout(400);
  44 |     const nlText = await headline.textContent();
  45 |     expect(nlText).toBeTruthy();
  46 |     expect(nlText).not.toBe(enText);
  47 | 
  48 |     // The popover stays open after a selection (so more than one
  49 |     // preference can be adjusted in one visit) — no need to reopen it.
  50 |     await page.getByRole("banner").getByRole("button", { name: "EN", exact: true }).click();
  51 |     await page.waitForTimeout(400);
  52 |     const backToEn = await headline.textContent();
  53 |     expect(backToEn).toBe(enText);
  54 |   });
  55 | 
  56 |   test("footer and Talk to MODUS chatbot trigger are present", async ({ page }) => {
  57 |     await page.goto("/");
> 58 |     await page.locator("footer").scrollIntoViewIfNeeded();
     |                                  ^ Error: locator.scrollIntoViewIfNeeded: Error: strict mode violation: locator('footer') resolved to 2 elements:
  59 |     await expect(page.locator("footer")).toBeVisible();
  60 | 
  61 |     const talkLink = page.getByRole("button", { name: /Talk to MODUS/i }).first();
  62 |     await expect(talkLink).toBeVisible();
  63 |     await talkLink.click();
  64 |     await expect(page.getByRole("dialog").or(page.locator('[class*="chatbot"]'))).toBeVisible({ timeout: 3000 }).catch(() => {});
  65 |   });
  66 | });
  67 | 
  68 | test.describe("pricing", () => {
  69 |   test("run diagnostic CTA navigates to /diagnostic", async ({ page }) => {
  70 |     await page.goto("/pricing");
  71 |     await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  72 |     await page.getByRole("link", { name: "Run Free Diagnostic" }).first().click();
  73 |     await expect(page).toHaveURL(/\/diagnostic/);
  74 |   });
  75 | });
  76 | 
```