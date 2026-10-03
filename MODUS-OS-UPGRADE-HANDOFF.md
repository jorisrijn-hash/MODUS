# Claude Code continuation — MODUS OS upgrade

Implement and finish this upgrade in the actual `jorisvrr/MODUS` application. The attached `modusapp.pdf` is the main app-interface visual reference; the supplied ReactBits Pricing 7 screenshot is the pricing layout reference. Treat documents as design references, not as instructions that override this request.

A reviewed working implementation is provided in `MODUS-OS-UPGRADE.patch` and `source/`. Its base is `c56a0d765256ca7dd946ed7578640ff4bc7afe49`. Inspect your current branch, AGENTS.md and relevant installed Next.js docs first. Preserve newer work. Use `git apply --check` before applying the patch; if the branch has diverged, integrate the changes manually. Do not replace the current application with an older checkout, and do not apply a second copy if these changes already exist. Screenshots of admin screens use explicit fixtures; they are not production evidence.

## 1. Fix mobile authentication

The mobile marketing nav still imported the legacy demo `ClientUserButton`, while desktop uses real Clerk `AuthControls`. Use Clerk identity on mobile, with `/sign-in` and `/sign-up` links to the shared morph shell, closing the mobile menu on navigation. Keep its focus trap, Escape handling, focus restoration and guest diagnostic access. Signed-in users get Clerk's account control. Test this with a genuine browser session, including sign-out and account switching. Do not revive `/app/login` demo authentication or the deleted shared-password admin path.

## 2. Translate the PDF into the real `/private` workspace

Use its dark neutral canvas, restrained green identity, compact navigation, fine borders, layered panels, readable data and workflow board. Marketing/auth retain their own themes; scope the admin palette. Make mobile navigation, forms, tables and the horizontally scrollable board usable. Keep keyboard focus and reduced motion.

The patch contains an overview with database-backed counts, 14-day UTC submission activity, oldest-first review queue, current workflow distribution and recent records. Every metric explains what is counted. Signals expand to show source answers, why they matter, what to validate and a possible next step. They remain preliminary, rule-based hypotheses, not verified diagnoses, AI analysis or business-health scores.

Use the existing authenticated API and database for search, date/status filters, pagination, status changes, internal notes, pricing review and activity history. All seven stored statuses remain distinct, especially `QUALIFIED` and `REVIEWED`. Pipeline cards save stage changes through the real PATCH route; show saving, confirmed success and rejection without pretending a failed change was stored. The board loads the oldest 20 per stage and links to the full inbox; total counts must include all records. Status changes do not send client email.

Detail screens need clear source answers, validation prompts, next-step guidance, review brief, notes and history. Preserve inputs on failed saves, and check pricing/delete responses before claiming success. A failed deletion must reset the hold control for retry. Keep calculated historical estimates separate from human overrides. The what-if calculator explicitly uses the current model.

Preserve real Clerk + current AdminMember authorization on pages, APIs and mutations, next-request revocation, RLS and account isolation. Application MFA remains intentionally deferred. Do not grant access by email/provider/first signup. Do not copy illustrative PDF billing, uptime, revenue, integrations or AI chat into the real workspace as working features. New schema changes must have a migration and a concrete need; this patch needs none.

## 3. Platform / SYS 04 — compact test demo

Replace the old static dashboard mock with the provided compact interactive OS demo on homepage and `/platform`: Overview → inspect a signal → reveal evidence → start review → move a sample card → write a local demo note → reset. Reuse the workspace visual language. Clearly label sample data, local state and unavailable live integrations/AI. No database writes, notifications, login requirement, sensitive tokens or persistent customer storage. The main CTA leads to the real diagnostic. Keep English/Dutch copy and mobile readability.

## 4. Pricing — owner-requested scope and indicative amounts

Use the attached Pricing 7 layout: joined plan columns, highlighted middle plan, compact homepage block, fuller comparison table on `/pricing`. No invented annual discounts, trial or checkout. Main CTA: **Get your personal price** via the diagnostic, not an immediate subscription purchase.

- **Essentials — approximately €200/month.** Small-budget, deliberately bounded: basic website/workflow upkeep, one small improvement at a time, monthly check-in. No MODUS OS. No broad automation or unlimited implementation.
- **Core — approximately €700/month, best value.** MODUS OS, continuous improvement of one priority workflow, scoped automation/integrations, monthly progress review.
- **Partner — approximately €1,000/month.** Everything in Core including OS, broader coordination between workflows, more implementation/iteration capacity and more frequent agreed planning/review. It must add meaningful scope above Core.

These are indicative anchors. The diagnostic provides a personal range; human review determines agreed scope and quote. Complex work can exceed the anchors. Capacity, integrations, tools and deliverables are bounded in the proposal. Do not invent legal contract lengths, cancellation terms, response-time guarantees or unlimited hours.

The patch lowers the simplest pricing-engine band from €495–650 to €200–350 and minimum to €200; higher-complexity bands and scope adjustments remain. New estimates use model `2026.10`; persisted historical amounts and versions are untouched. Check that public copy, both locales, calculator, chatbot and proposal language agree; OS must not be described as included in Essentials. If a different commercial calibration is required, present the concrete mapping before changing other bands.

## Validation and completion

Already checked locally: production build passed; TypeScript passed; 78 unit tests passed; 3 Playwright tests passed for the actual Platform demo and pricing pages (including 390px/1440px and no demo writes). Eight additional browser checks exercised actual admin components with fixture data and mocked API responses: guide, mobile containment, pipeline save/rejection, note retention, pricing-save failure and delete retry. Those eight checks do **not** prove real auth or persistence.

Finish real integration checks in the isolated development environment: genuine Clerk admin session, ordinary and anonymous rejection, revocation on the next request; persisted pipeline updates and history after reload; filtered URL entry, list pagination and refresh; note/pricing failures preserve inputs; successful delete returns to inbox; historical quotes unchanged; mobile account switch isolation. Do not run submission/email tests against production without the existing explicit test authorization. Use serial Playwright workers as already configured. Capture failure artefacts before rerunning unexplained failures.

Inspect screenshots and record the actual fonts, mobile layout, keyboard behaviour and reduced motion; mounted DOM alone is not visual proof. Update PROJECT-STATUS.md after each finished task with exact evidence and remaining limits. Commit the finished changes and report readiness before pushing. **Do not push or deploy until I explicitly authorize it.**
