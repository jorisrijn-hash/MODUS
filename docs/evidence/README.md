# Preserved evidence

Playwright deletes `test-results/` at the start of every run. The morph
recording was lost that way once already, so the artefacts that are cited
in `PROJECT-STATUS.md` are copied here, where no test run touches them.

| File | What it shows |
|---|---|
| `auth-morph.webm` | The sign-in ↔ sign-up morph, recorded. Stills cannot show it: the swap is ~420ms and screenshot latency exceeds it. |
| `auth-morph-0-before.png`, `auth-morph-4-after.png` | The two endpoints of that transition. |
| `auth-sign-in-{desktop,mobile}.png` | Sign-in on the MODUS surface. |
| `auth-sign-up-{desktop,mobile}.png` | Sign-up, with the brief's own copy. |
| `hero-bubble-{desktop,mobile}.png` | A process bubble on screen, over the cloud and clear of the headline — the defect was that these rendered outside the hero and were clipped. |
| `11-composition-with-profile.png` | The single diagnostic composition carrying the real profile, replacing the node-map card. |
| `private-inbox-{desktop,mobile}.png` | The admin inbox on the MODUS surface. |
| `private-inbox-error.png` | The error state with its retry, in place of a blank list. |
| `private-detail-{desktop,mobile}.png` | The detail view. |
| `private-detail-note-retry.png` | A failed note save keeping the typed text and offering a retry. |

Regenerate with `npx playwright test`, then copy from `e2e-screens/` and
`test-results/`. `e2e-screens/` is gitignored; this directory is not.
