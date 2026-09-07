# V16 — Home Hero Visual Integrity Remediation

## Phase classification

- Scope: `page`
- Type: `remediation + implementation + QA`
- Risk: `high`
- Mode: `production`
- Responsive scope: `desktop_only`
- Skill lock: `Ngh1aa/skills_UIUX@aa9c04e48a32cd1b643c6e9e6129be4ba70c38de`
- Project baseline: `44fa3226df531892e687b85b8f4acfa58772824d`
- Working branch: `fix/home-hero-overlap-media-contract-v16`

## User evidence / findings

### V16-F01 — caption obscured by decision panel

- Label: `FACT`
- Evidence: user-supplied wide Home screenshot shows `ATELIER / VIETNAM` visually sitting beneath/inside the noir decision panel area.
- Root cause: `.home-campaign-v14__media` occupied the full hero canvas while `.home-campaign-v14__caption` was positioned across that full canvas at `z-index: 3`; `.home-campaign-v14__panel` sat above it at `z-index: 4`.
- Impact: important campaign caption becomes partially hidden/low-legibility even though its own foreground/backplate declarations are valid.
- Owner: `atelier-v14.css` Home campaign composition.

### V16-F02 — full-canvas `contain` lacked a source-aware media frame

- Label: `EVIDENCE_BACKED_INFERENCE`
- Evidence: user-supplied full hero screenshot + source inspection show a portrait source asset rendered with `object-fit: contain` inside a full-canvas media owner.
- Root cause: prior crop remediation changed `cover` to `contain` but retained the old full-canvas owner geometry. Subject preservation improved, but the composition still described the portrait as if it owned the entire hero.
- Impact: large accidental dead field and unclear relationship between media caption and decision panel; future stacking regressions remain possible.
- Owner: Home media-frame contract in `atelier-v14.css`.

## Decision log

### D-V16-01 — use a portrait media rail, not universal crop

- Decision: keep `object-fit: contain`, but constrain `.home-campaign-v14__media` to a deliberate left media rail (`clamp(520px, 40vw, 760px)`) with its own near-white surface.
- Rationale: preserves the full human focal subject, avoids destructive `cover`, and makes negative space/composition explicit rather than a side effect of `contain`.
- Effect: caption positioning is now scoped to the media rail; panel and media are separate layout objects.

### D-V16-02 — geometry overlap becomes a hard regression

- Decision: add `scripts/v16-home-hero-geometry.mjs` at 1900, 1363 and 1100 desktop widths.
- It blocks when:
  - decision panel intersects media rail;
  - either caption leaves the media rail;
  - caption intersects decision panel or decision actions;
  - Home media changes away from `contain`;
  - media rail geometry drifts outside the intended desktop range;
  - caption loses its stable backplate.
- Rationale: color contrast alone cannot detect a correctly colored element that is physically covered by a higher stacking context.

## Skill Activation / Usage

| Skill | Trigger | Requirement applied | Change created | Verification | Evidence |
|---|---|---|---|---|---|
| `website-delivery-pipeline` | production remediation with previous false-green QA | project truth → implementation → rendered QA → release only after evidence | kept phase gated; no PASS before rendered evidence | tests/build/visual gate | skill SHA above |
| `adaptive-skill-routing-and-context-budget` | one Home page composition defect | smallest graph, no whole-library load | routed only remediation/media/visual QA owners | branch diff remains narrow | compare main→branch |
| `project-context` | existing V14 contract and desktop-only scope | preserve brand/behavior/source owners | no unrelated route/commerce changes | diff + whole-site QA | project source/docs |
| `ui-improvement` | existing implemented UI needs root-cause fix | inspect rendered evidence + fix owner, not taste patch | edited `atelier-v14.css` owner | rendered comparison | user screenshots + source |
| `asset-media-and-art-direction` | primary human media | no-cut focal subject; source-aware layout over universal cover | portrait media rail + `contain` | 1900/1363/1100 screenshots | V16 geometry artifacts |
| `ui-craft-and-visual-qa` | obvious defect escaped previous QA | elementary sanity + overlap/overlay checks + opened screenshots | V16 geometry hard gate | CI + manual artifact inspection | pending final run |

## Requirement Coverage Ledger

| ID | Requirement | Status | Verification | Evidence |
|---|---|---|---|---|
| V16-R01 | `ATELIER / VIETNAM` and `LOOK 01 / FALL 2026` remain fully visible and inside their media owner | `BLOCKED` | geometry regression + screenshot inspection | pending latest branch QA |
| V16-R02 | Home decision panel must not obscure/collide with media captions | `BLOCKED` | bounding-box intersection check at 1900/1363/1100 | pending latest branch QA |
| V16-R03 | Human hero subject remains non-destructively rendered | `BLOCKED` | computed `object-fit: contain` + rendered inspection | pending latest branch QA |
| V16-R04 | Existing routes/interactions do not regress | `BLOCKED` | npm test + build + V14/V15 suites | pending latest branch QA |
| V16-R05 | Mobile/tablet QA | `N/A_JUSTIFIED` | project remains `desktop_only` | active project contract |
| V16-R06 | Merge/release to `main` | `BLOCKED` | explicit release authorization required after PASS | not yet authorized for this new fix |

## Phase result

`BLOCKED` until the latest branch run completes and rendered artifacts are opened/inspected.
