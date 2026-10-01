# MODUS Validation Report

Evidence for the Antimetal visual and motion rebuild. This file records what
was actually run and actually seen. Claims without evidence do not belong
here, and a passing build is not evidence that an interaction works.

Status vocabulary: COMPLETE / INCOMPLETE / BLOCKED.

---

## Checkpoint A — Audit and baseline — COMPLETE

| Check | Result |
|---|---|
| Repository instructions read | `CLAUDE.md` → `AGENTS.md`. Next.js docs in `node_modules/next/dist/docs/` noted as authoritative for this Next version. |
| Build pack located and extracted | `~/.Trash/MODUS-CLAUDE-BUILD-PACK.zip` → scratchpad. All 18 manifest files present. |
| Supplied assets inspected | All four PNGs and all five Antimetal JPGs opened and viewed. Findings in `MODUS_REBUILD_PLAN.md` §2. |
| Paper inspected | **No.** No Paper MCP connection available this session. Recorded as a limitation; no Paper claim is made anywhere. |
| Routes and providers mapped | `MODUS_REBUILD_PLAN.md` §3. |
| Version control | **Was absent.** Repo rooted at `/Users/joris`; `modus/` untracked. Resolved: `git init`, baseline commit `643cfad`, 289 files. `.env` verified excluded. |
| Pre-existing test baseline | Not yet captured — see below. |

### Pre-existing failures, captured before any edit

To be filled by the baseline test run. Any failure recorded here is
pre-existing and must not later be described as caused by, or fixed by, this
rebuild unless separately demonstrated.

---

## Checkpoint B — Foundation — NOT STARTED

## Checkpoint C — Static homepage — NOT STARTED

## Checkpoint D — Hero point cloud — NOT STARTED

Required states, none yet captured: disorder, organizing, ordered with
labels, returning, drag, release, offscreen pause.

## Checkpoint E — Real 3D stack — NOT STARTED

Required states, none yet captured: entry, early tilt, layers revealing,
tools entering, final flat, reverse to entry. The tilted captures must show
side/back edges and panels emerging from behind the occlusion plane. If they
do not, the desktop stack is marked INCOMPLETE regardless of how it looks.

## Checkpoint F — Header, SplitText, buttons, Lenis — NOT STARTED

## Checkpoint G — Routes, themes, locales — NOT STARTED

## Checkpoint H — Final comparison — NOT STARTED

---

## Standing rules for this document

- Layout tolerances (2–4px positions, ~1% large dimensions) are comparison
  targets. No fabricated pass rate is reported.
- No whole-page 1:1 parity is claimed against `modusreff.png` or
  `foundationsandcomponents.png`; both are unfinished studies.
- No FPS or performance figure appears without a measurement and the
  conditions it was measured under.
- Secondary polish that is unfinished (hero packets and arrival rings, the
  header progress ring) is named as unfinished, not quietly omitted.
