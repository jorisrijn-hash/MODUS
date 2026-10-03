# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: privateWorkspace.spec.ts >> admin workspace, against the real API and database >> a pipeline stage change persists and is recorded in history
- Location: e2e/privateWorkspace.spec.ts:54:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Status → NEW')
Expected: visible
Error: strict mode violation: getByText('Status → NEW') resolved to 2 elements:
    1) <span class="text-graphite">Status → NEW</span> aka getByText('Status → NEW').first()
    2) <span class="text-graphite">Status → NEW</span> aka getByText('Status → NEW').nth(1)

Call log:
  - Expect "toBeVisible" with timeout 25000ms
  - waiting for getByText('Status → NEW')

```

# Page snapshot

```yaml
- generic [active] [ref=f4e1]:
  - generic [ref=f4e3]:
    - complementary [ref=f4e4]:
      - link "MODUS workspace overview" [ref=f4e5] [cursor=pointer]:
        - /url: /private
        - generic [ref=f4e12]:
          - text: MODUS
          - generic [ref=f4e13]: OPERATIONS
      - navigation "Admin navigation" [ref=f4e14]:
        - link "Overview" [ref=f4e15] [cursor=pointer]:
          - /url: /private
        - link "Diagnostics" [ref=f4e19] [cursor=pointer]:
          - /url: /private/diagnostics
        - link "Pipeline" [ref=f4e23] [cursor=pointer]:
          - /url: /private/pipeline
        - link "Settings" [ref=f4e25] [cursor=pointer]:
          - /url: /private/settings
      - generic [ref=f4e29]:
        - paragraph [ref=f4e30]: Human review, informed.
        - link "Public site" [ref=f4e31] [cursor=pointer]:
          - /url: /
    - generic [ref=f4e35]:
      - banner [ref=f4e36]:
        - paragraph [ref=f4e37]: Workspace /Diagnostics
        - generic [ref=f4e38]:
          - button "Review guide" [ref=f4e39] [cursor=pointer]
          - button "Refresh" [ref=f4e42] [cursor=pointer]
          - group [ref=f4e48]:
            - generic "Account menu" [ref=f4e49] [cursor=pointer]: U
      - main [ref=f4e50]:
        - generic [ref=f4e51]:
          - link "← Back to inbox" [ref=f4e52] [cursor=pointer]:
            - /url: /private/diagnostics
          - paragraph [ref=f4e53]: Diagnostic / W29IQH
          - generic [ref=f4e54]:
            - generic [ref=f4e55]:
              - heading "Bagel Alley" [level=1] [ref=f4e56]
              - paragraph [ref=f4e57]: Restaurant / Café · 6–20 employees · Submitted 02/10/2026, 01:09:32
            - combobox "Diagnostic status" [ref=f4e59]:
              - option "New" [selected]
              - option "In review"
              - option "Contacted"
              - option "Closed"
              - option "Reviewed"
              - option "Qualified"
              - option "Converted"
          - generic [ref=f4e60]:
            - paragraph [ref=f4e61]: Next step / New
            - paragraph [ref=f4e62]: Read the answers and identify a question to validate.
            - group [ref=f4e63]:
              - generic "Why this fit level?" [ref=f4e64] [cursor=pointer]
          - generic [ref=f4e65]:
            - generic [ref=f4e66]: MEDIUM FIT
            - generic [ref=f4e67]: AUTOMATION
            - generic [ref=f4e68]: CUSTOMER INTAKE
            - generic [ref=f4e69]: INTEGRATION
            - generic [ref=f4e70]: BOOKING
            - generic [ref=f4e71]: CONVERSION
          - paragraph [ref=f4e73]: "Why this fit: 5 operational friction areas flagged · Wants to start within 30 days · Clear priority: Improve conversion"
          - group [ref=f4e74]:
            - generic "1 possible duplicate" [ref=f4e75] [cursor=pointer]
            - paragraph [ref=f4e77]: Bagel Alley, submitted 31/08/2026
          - generic [ref=f4e78]:
            - generic [ref=f4e79]:
              - generic [ref=f4e80]:
                - heading "Business" [level=2] [ref=f4e81]
                - generic [ref=f4e82]:
                  - generic [ref=f4e83]:
                    - paragraph [ref=f4e84]: Company
                    - paragraph [ref=f4e85]: Bagel Alley
                  - generic [ref=f4e86]:
                    - paragraph [ref=f4e87]: Website
                    - paragraph [ref=f4e88]: bagelalley.nl
                  - generic [ref=f4e89]:
                    - paragraph [ref=f4e90]: Industry
                    - paragraph [ref=f4e91]: Restaurant / Café
                  - generic [ref=f4e92]:
                    - paragraph [ref=f4e93]: Employees
                    - paragraph [ref=f4e94]: 6–20
                  - generic [ref=f4e95]:
                    - paragraph [ref=f4e96]: Locations
                    - paragraph [ref=f4e97]: "1"
                  - generic [ref=f4e98]:
                    - paragraph [ref=f4e99]: Revenue range
                    - paragraph [ref=f4e100]: Not shared
              - generic [ref=f4e101]:
                - heading "Operations" [level=2] [ref=f4e102]
                - generic [ref=f4e103]:
                  - generic [ref=f4e104]:
                    - paragraph [ref=f4e105]: Customer channels
                    - paragraph [ref=f4e106]: Phone, Walk-in
                  - generic [ref=f4e107]:
                    - paragraph [ref=f4e108]: Enquiry handling
                    - paragraph [ref=f4e109]: POS, Paper/manual
                  - generic [ref=f4e110]:
                    - paragraph [ref=f4e111]: Admin workload
                    - paragraph [ref=f4e112]: A few hours
                  - generic [ref=f4e113]:
                    - paragraph [ref=f4e114]: Process standardization
                    - paragraph [ref=f4e115]: 2 / 5
                  - generic [ref=f4e116]:
                    - paragraph [ref=f4e117]: Key-employee dependency
                    - paragraph [ref=f4e118]: Medium
              - generic [ref=f4e119]:
                - heading "Systems" [level=2] [ref=f4e120]
                - generic [ref=f4e121]:
                  - generic [ref=f4e122]:
                    - paragraph [ref=f4e123]: Systems in use
                    - paragraph [ref=f4e124]: Accounting
                  - generic [ref=f4e125]:
                    - paragraph [ref=f4e126]: Specific tools
                    - paragraph [ref=f4e127]: Not specified
                  - generic [ref=f4e128]:
                    - paragraph [ref=f4e129]: Connectivity
                    - paragraph [ref=f4e130]: Not sure
                  - generic [ref=f4e131]:
                    - paragraph [ref=f4e132]: Spreadsheet dependency
                    - paragraph [ref=f4e133]: We'd stop without them
                  - generic [ref=f4e134]:
                    - paragraph [ref=f4e135]: Automation / AI usage
                    - paragraph [ref=f4e136]: "No"
              - generic [ref=f4e137]:
                - heading "Friction" [level=2] [ref=f4e138]
                - generic [ref=f4e139]:
                  - generic [ref=f4e140]:
                    - paragraph [ref=f4e141]: Areas flagged
                    - paragraph [ref=f4e142]: Nothing obvious, find it for me, Manual data entry, Customer enquiries, Software, Bookings
                  - generic [ref=f4e143]:
                    - paragraph [ref=f4e144]: Primary pain point
                    - paragraph [ref=f4e145]: Manual data entry
                  - generic [ref=f4e146]:
                    - paragraph [ref=f4e147]: Frequency
                    - paragraph [ref=f4e148]: Daily
                  - generic [ref=f4e149]:
                    - paragraph [ref=f4e150]: Impact
                    - paragraph [ref=f4e151]: Time, Customers
                  - generic [ref=f4e152]:
                    - paragraph [ref=f4e153]: In their words
                    - paragraph [ref=f4e154]: Not provided
              - generic [ref=f4e155]:
                - heading "Priorities" [level=2] [ref=f4e156]
                - generic [ref=f4e157]:
                  - generic [ref=f4e158]:
                    - paragraph [ref=f4e159]: Primary interest
                    - paragraph [ref=f4e160]: Automation & AI
                  - generic [ref=f4e161]:
                    - paragraph [ref=f4e162]: Top priorities (ranked)
                    - paragraph [ref=f4e163]: Improve conversion > Reduce administrative work > Use AI effectively
                  - generic [ref=f4e164]:
                    - paragraph [ref=f4e165]: Timing
                    - paragraph [ref=f4e166]: Within 30 days
                  - generic [ref=f4e167]:
                    - paragraph [ref=f4e168]: Decision context
                    - paragraph [ref=f4e169]: Just me
              - generic [ref=f4e170]:
                - heading "Pricing Calculator" [level=2] [ref=f4e171]
                - generic [ref=f4e173]:
                  - generic [ref=f4e174]:
                    - paragraph [ref=f4e175]: From €495
                    - paragraph [ref=f4e176]: / month (system-calculated)
                    - generic [ref=f4e177]: Manual Scope
                  - generic [ref=f4e178]:
                    - generic [ref=f4e179]:
                      - paragraph [ref=f4e180]: Band
                      - paragraph [ref=f4e181]: advanced
                    - generic [ref=f4e182]:
                      - paragraph [ref=f4e183]: Complexity score
                      - paragraph [ref=f4e184]: 14 / 22
                    - generic [ref=f4e185]:
                      - paragraph [ref=f4e186]: Implementation scope
                      - paragraph [ref=f4e187]: substantial
                    - generic [ref=f4e188]:
                      - paragraph [ref=f4e189]: Model version
                      - paragraph [ref=f4e190]: "2026.01"
                  - generic [ref=f4e191]:
                    - generic [ref=f4e192]:
                      - paragraph [ref=f4e193]: Business scale
                      - paragraph [ref=f4e194]: low
                    - generic [ref=f4e195]:
                      - paragraph [ref=f4e196]: System fragmentation
                      - paragraph [ref=f4e197]: moderate
                    - generic [ref=f4e198]:
                      - paragraph [ref=f4e199]: Operational complexity
                      - paragraph [ref=f4e200]: moderate
                    - generic [ref=f4e201]:
                      - paragraph [ref=f4e202]: Implementation scope level
                      - paragraph [ref=f4e203]: high
                  - generic [ref=f4e204]:
                    - paragraph [ref=f4e205]: Why This Estimate
                    - list [ref=f4e206]:
                      - listitem [ref=f4e207]: "• Complexity score 14/22 (band: advanced)."
                      - listitem [ref=f4e208]: • Business scale 1/4, systems 3/5, operations 2/5, friction 4/4, improvement intensity 4/4.
                      - listitem [ref=f4e209]: • Implementation scope classified as substantial.
                      - listitem [ref=f4e210]: • Substantial implementation scope requires manual review regardless of complexity score.
                  - generic [ref=f4e211]:
                    - paragraph [ref=f4e212]: Current-model scenario — what if scope were different?
                    - paragraph [ref=f4e213]: Uses model 2026.10. The original stored estimate above is unchanged.
                    - generic [ref=f4e214]:
                      - combobox [ref=f4e215]:
                        - option "light"
                        - option "standard"
                        - option "substantial" [selected]
                      - paragraph [ref=f4e216]: From €200/month (manual scope)
                  - generic [ref=f4e217]:
                    - paragraph [ref=f4e218]: Reviewed Estimate (after MODUS validates)
                    - generic [ref=f4e219]:
                      - generic [ref=f4e220]: €
                      - spinbutton [ref=f4e221]: "495"
                      - generic [ref=f4e222]: –
                      - generic [ref=f4e223]: €
                      - spinbutton [ref=f4e224]: "495"
                      - button "Save" [ref=f4e225] [cursor=pointer]
                  - generic [ref=f4e226]:
                    - paragraph [ref=f4e227]: Final Proposal (agreed structure)
                    - generic [ref=f4e228]:
                      - generic [ref=f4e229]: €
                      - spinbutton "Monthly amount" [ref=f4e230]
                      - generic [ref=f4e231]: / month
                    - generic [ref=f4e232]:
                      - generic [ref=f4e233]: €
                      - spinbutton "One-time implementation fee" [ref=f4e234]
                      - generic [ref=f4e235]: "Indicative: €500–€2,500"
                    - textbox "Notes on the agreed structure…" [ref=f4e236]
                    - button "Save" [ref=f4e238] [cursor=pointer]
              - generic [ref=f4e239]:
                - heading "Initial Profile" [level=2] [ref=f4e240]
                - generic [ref=f4e242]:
                  - generic [ref=f4e243]:
                    - paragraph [ref=f4e244]: Operational Complexity
                    - paragraph [ref=f4e245]: LOW
                  - generic [ref=f4e246]:
                    - paragraph [ref=f4e247]: System Fragmentation
                    - paragraph [ref=f4e248]: LOW
                  - generic [ref=f4e249]:
                    - paragraph [ref=f4e250]: Automation Maturity
                    - paragraph [ref=f4e251]: EARLY
                  - generic [ref=f4e252]:
                    - paragraph [ref=f4e253]: Process Dependency
                    - paragraph [ref=f4e254]: MODERATE
                  - generic [ref=f4e255]:
                    - paragraph [ref=f4e256]: Visibility
                    - paragraph [ref=f4e257]: LOW
              - generic [ref=f4e258]:
                - heading "Preliminary Signals" [level=2] [ref=f4e259]
                - paragraph [ref=f4e261]: No rule-based signals from this submission.
              - generic [ref=f4e262]:
                - heading "Client Summary" [level=2] [ref=f4e263]
                - generic [ref=f4e264]:
                  - paragraph [ref=f4e265]: A draft assembled from the submitted answers and preliminary signals. Review it for accuracy before sharing it with the client.
                  - button "Generate Summary" [ref=f4e266] [cursor=pointer]
              - generic [ref=f4e267]:
                - heading "Review Brief" [level=2] [ref=f4e268]
                - button "Create Review Brief" [ref=f4e270] [cursor=pointer]
            - generic [ref=f4e271]:
              - generic [ref=f4e272]:
                - heading "Contact" [level=2] [ref=f4e273]
                - generic [ref=f4e274]:
                  - paragraph [ref=f4e275]: Joris van Rijn
                  - paragraph [ref=f4e276]: Director
                  - generic [ref=f4e277]:
                    - button "jorisvrr@bagelalley.com" [ref=f4e278] [cursor=pointer]
                    - button "0638032065" [ref=f4e282] [cursor=pointer]
                    - link "Open Website" [ref=f4e286] [cursor=pointer]:
                      - /url: https://bagelalley.nl
                  - paragraph [ref=f4e291]: "Source: Direct"
              - generic [ref=f4e292]:
                - heading "Internal Notes" [level=2] [ref=f4e293]
                - generic [ref=f4e294]:
                  - textbox "Add a private note…" [ref=f4e295]
                  - button "Save note" [disabled] [ref=f4e297]
                  - paragraph [ref=f4e299]: No notes yet. Notes are private to MODUS and are never shown to the client.
              - generic [ref=f4e300]:
                - heading "Activity Timeline" [level=2] [ref=f4e301]
                - generic [ref=f4e303]:
                  - generic [ref=f4e304]:
                    - generic [ref=f4e305]: 03 Oct
                    - generic [ref=f4e306]: Status → NEW
                  - generic [ref=f4e307]:
                    - generic [ref=f4e308]: 03 Oct
                    - generic [ref=f4e309]: Status → REVIEWING
                  - generic [ref=f4e310]:
                    - generic [ref=f4e311]: 03 Oct
                    - generic [ref=f4e312]: Status → NEW
                  - generic [ref=f4e313]:
                    - generic [ref=f4e314]: 03 Oct
                    - generic [ref=f4e315]: Status → REVIEWING
                  - generic [ref=f4e316]:
                    - generic [ref=f4e317]: 03 Oct
                    - generic [ref=f4e318]: Status → NEW
                  - generic [ref=f4e319]:
                    - generic [ref=f4e320]: 02 Oct
                    - generic [ref=f4e321]: Callback requested via website
                  - generic [ref=f4e322]:
                    - generic [ref=f4e323]: 02 Oct
                    - generic [ref=f4e324]: Diagnostic submitted
              - generic [ref=f4e325]:
                - heading "Danger Zone" [level=2] [ref=f4e326]
                - generic [ref=f4e327]:
                  - button "Hold to Delete Diagnostic press" [ref=f4e328] [cursor=pointer]:
                    - generic [ref=f4e329]:
                      - generic [ref=f4e330]: Hold to Delete Diagnostic
                      - generic [ref=f4e331]: press
                  - paragraph [ref=f4e332]: This permanently removes the diagnostic and its notes.
  - button "Open Next.js Dev Tools" [ref=f4e341] [cursor=pointer]
  - alert [ref=f4e345]
```

# Test source

```ts
  10  |  * against the real authenticated API and the real development database,
  11  |  * signed in as a real Clerk admin.
  12  |  *
  13  |  * Local database only — never production.
  14  |  */
  15  | 
  16  | const env = testAccounts();
  17  | 
  18  | async function asAdmin(page: Page) {
  19  |   await page.goto("/");
  20  |   await signInAs(page, env!.MODUS_TEST_A_EMAIL);
  21  | }
  22  | 
  23  | /** A disposable record so stage changes and deletion touch nothing real. */
  24  | async function createRecord(page: Page, companyName: string) {
  25  |   const payload = {
  26  |     companyName, website: "", industry: "Restaurant / Café", employees: "1-5",
  27  |     locations: "1", revenueRange: "", reachChannels: ["Phone"],
  28  |     enquiryHandling: ["Shared inbox"], adminHours: "A few hours",
  29  |     processStandardization: 3, dependency: "Low", systems: ["CRM"],
  30  |     specificTools: "", connectionLevel: "Partly connected",
  31  |     spreadsheetDependency: "Some", automationUsage: ["None"],
  32  |     friction: ["Administration"], primaryPain: "Administration",
  33  |     problemDescription: "", frequency: "Weekly", impact: ["Time"],
  34  |     primaryInterest: "Automation", priorities: ["Save time"],
  35  |     timing: "Within 3 months", decisionContext: "",
  36  |     firstName: "Workspace", lastName: "QA",
  37  |     email: `workspace-${Date.now()}@playwright-qa.dev`, phone: "", role: "",
  38  |     preliminaryProfile: [], preliminarySignals: [],
  39  |   };
  40  |   const res = await page.request.post("/api/diagnostic", {
  41  |     data: payload,
  42  |     headers: { "Idempotency-Key": `workspace-${companyName}-${Date.now()}` },
  43  |   });
  44  |   expect(res.ok(), "seed submission should succeed").toBe(true);
  45  |   return (await res.json()).id as string;
  46  | }
  47  | 
  48  | test.describe("admin workspace, against the real API and database", () => {
  49  |   test.skip(!env, "run scripts/create-test-users.mjs first");
  50  |   test.describe.configure({ mode: "serial" });
  51  |   test.use({ viewport: { width: 1440, height: 900 } });
  52  |   test.setTimeout(120_000);
  53  | 
  54  |   test("a pipeline stage change persists and is recorded in history", async ({ page }) => {
  55  |     await asAdmin(page);
  56  |     await page.goto("/private/pipeline");
  57  | 
  58  |     /*
  59  |      * Operate on a card the board actually shows, rather than seeding a
  60  |      * new record. The board deliberately loads the OLDEST 20 per stage,
  61  |      * so a freshly created diagnostic is the least likely row to appear —
  62  |      * my first attempt seeded one and then could not find it, which was
  63  |      * the test being wrong about documented behaviour, not the board.
  64  |      */
  65  |     /*
  66  |      * Identified by record id, not company name. Company names are not
  67  |      * unique — the local database holds two different diagnostics both
  68  |      * called "Bagel Alley", in different stages, so a name-based locator
  69  |      * matched two cards. The id comes from the card's own detail link.
  70  |      */
  71  |     const firstCard = page.locator("article").filter({ has: page.locator('select[aria-label^="Stage for "]') }).first();
  72  |     await expect(firstCard).toBeVisible({ timeout: 25_000 });
  73  |     const href = (await firstCard.getByRole("link").first().getAttribute("href"))!;
  74  |     const id = href.split("/").pop()!;
  75  |     const select = firstCard.locator("select");
  76  |     const original = await select.inputValue();
  77  |     const target = original === "REVIEWING" ? "REVIEWED" : "REVIEWING";
  78  | 
  79  |     const statusOf = async () => {
  80  |       const res = await page.request.get(`/api/private/diagnostics?q=${id}`);
  81  |       if (res.ok()) {
  82  |         const match = (await res.json()).diagnostics.find((d: { id: string }) => d.id === id);
  83  |         if (match) return match.status as string;
  84  |       }
  85  |       // The search does not index ids; fall back to the record page.
  86  |       return null;
  87  |     };
  88  | 
  89  |     try {
  90  |       await select.selectOption(target);
  91  |       // Confirmed by the server, not optimistic: the board announces only
  92  |       // after the PATCH resolved. The handoff's fixture checks mocked that
  93  |       // response and so could not show it reaching the database.
  94  |       await expect(page.getByRole("status")).toContainText(/Saved/i, { timeout: 25_000 });
  95  | 
  96  |       // The actual persistence claim: still true on the record itself
  97  |       // after a full reload, read back through the authenticated API.
  98  |       await page.reload();
  99  |       await page.goto(`/private/diagnostics/${id}`);
  100 |       await expect(page.getByLabel("Diagnostic status")).toHaveValue(target, { timeout: 25_000 });
  101 |       // And the database recorded why.
  102 |       await expect(page.getByText(`Status → ${target}`)).toBeVisible({ timeout: 25_000 });
  103 |       void statusOf;
  104 |     } finally {
  105 |       // Put it back, so a verification run leaves no workflow change behind.
  106 |       await page.goto(`/private/diagnostics/${id}`);
  107 |       const restore = page.getByLabel("Diagnostic status");
  108 |       if (await restore.isVisible().catch(() => false)) {
  109 |         await restore.selectOption(original);
> 110 |         await expect(page.getByText(`Status → ${original}`)).toBeVisible({ timeout: 25_000 });
      |                                                              ^ Error: expect(locator).toBeVisible() failed
  111 |       }
  112 |     }
  113 |   });
  114 | 
  115 |   test("a filtered URL opens already filtered", async ({ page }) => {
  116 |     await asAdmin(page);
  117 |     await page.goto("/private/diagnostics?status=QUALIFIED");
  118 |     // The control reflects the URL rather than defaulting to All.
  119 |     const status = page.locator("select").first();
  120 |     await expect(status).toHaveValue("QUALIFIED", { timeout: 20_000 });
  121 |     // And the listing agrees: every visible row is that status.
  122 |     const pills = page.locator("tbody tr td:last-child");
  123 |     const count = await pills.count();
  124 |     for (let i = 0; i < count; i++) {
  125 |       await expect(pills.nth(i)).toHaveText(/Qualified/i);
  126 |     }
  127 |   });
  128 | 
  129 |   test("Refresh re-reads the list from the server", async ({ page }) => {
  130 |     await asAdmin(page);
  131 |     await page.goto("/private/diagnostics");
  132 |     await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 20_000 });
  133 | 
  134 |     let refetched = false;
  135 |     page.on("request", (r) => {
  136 |       if (r.url().includes("/api/private/diagnostics?")) refetched = true;
  137 |     });
  138 |     await page.getByRole("button", { name: /Refresh/i }).click();
  139 |     await expect.poll(() => refetched, { timeout: 20_000 }).toBe(true);
  140 |   });
  141 | 
  142 |   test("a failed pricing save keeps the typed inputs", async ({ page }) => {
  143 |     await asAdmin(page);
  144 |     const company = `Pricing QA ${Date.now()}`;
  145 |     const id = await createRecord(page, company);
  146 |     await page.goto(`/private/diagnostics/${id}`);
  147 | 
  148 |     const min = page.locator('input[type="number"]').first();
  149 |     await expect(min).toBeVisible({ timeout: 20_000 });
  150 |     await min.fill("1234");
  151 | 
  152 |     await page.route(`**/api/private/diagnostics/${id}`, (route) =>
  153 |       route.request().method() === "PATCH"
  154 |         ? route.fulfill({ status: 500, contentType: "application/json", body: "{}" })
  155 |         : route.continue()
  156 |     );
  157 |     await page.getByRole("button", { name: /^Save$/ }).first().click();
  158 | 
  159 |     await expect(page.getByRole("alert").filter({ hasText: /Not saved/i }).first()).toBeVisible({ timeout: 20_000 });
  160 |     // The value the reviewer typed is still there to retry with.
  161 |     await expect(min).toHaveValue("1234");
  162 |   });
  163 | 
  164 |   test("a successful delete returns to the inbox and removes the record", async ({ page }) => {
  165 |     await asAdmin(page);
  166 |     const company = `Delete QA ${Date.now()}`;
  167 |     const id = await createRecord(page, company);
  168 |     await page.goto(`/private/diagnostics/${id}`);
  169 | 
  170 |     const hold = page.getByRole("button", { name: /Hold to Delete Diagnostic/i });
  171 |     await expect(hold).toBeVisible({ timeout: 20_000 });
  172 |     await hold.hover();
  173 |     await page.mouse.down();
  174 |     await page.waitForTimeout(1800);
  175 |     await page.mouse.up();
  176 | 
  177 |     await expect(page).toHaveURL(/\/private\/diagnostics$/, { timeout: 20_000 });
  178 |     const gone = await page.request.get(`/api/private/diagnostics?q=${encodeURIComponent(company)}`);
  179 |     expect((await gone.json()).total, "the deleted record should be gone").toBe(0);
  180 |   });
  181 | });
  182 | 
```