# ATELIER V14 — Contrast, Interactive-State & Media Remediation

## Phase classification

- Scope: `system / whole-site`
- Type: `remediation + QA`
- Risk: `high`
- Mode: `production_candidate`
- Responsive scope: `desktop_only` (unchanged)
- Locked `skills_UIUX`: `2886d516deb6eb4fb348142f6a65351fc830237c`

## Skill Activation Plan

| Task | Trigger / risk | Skill | Expected impact | Verification |
|---|---|---|---|---|
| Fix shared CSS visibility/state defects | visible text disappears on paper surface; hover can remove button label | `ui-improvement`, `ui-craft-and-visual-qa`, `accessibility` | repair shared owner instead of page patches; default/hover/focus remain readable | rendered state checks + computed contrast regression |
| Fix Home hero crop | model face/head is clipped by `cover` crop | `asset-media-and-art-direction` | source-aware focal positioning, preserve face + primary garment at contract viewport | rendered Home capture at 1363×936 and 1100×900 |
| Prevent recurrence | prior whole-site QA did not assert visible text/button state contrast or project-specific hero focal point | `visual-regression-and-design-drift` | add project regression for footer/text/button states + hero media owner | automated regression + inspected screenshots |

## Findings

### V14-R01 — Shared footer contrast regression
- Label: `FACT`
- Severity: `P0/P1 visual defect`
- Evidence: `atelier-v14.css` gives `.v14 .site-footer` a dark background and `campaign-text`; `atelier-v14-site.css` later changes only the footer background to `--paper` and did not reset inherited foreground colors.
- Result before remediation: white / near-white footer text rendered on warm porcelain and became effectively invisible until text selection highlighted it.
- Root owner: shared V14 site layer, not individual HTML pages.
- Remediation: the V14 site layer now owns the complete light-footer surface/foreground/link/divider/button state contract.

### V14-R02 — Interactive state / specificity contrast gap
- Label: `FACT`
- Severity: `P1`
- Evidence: rendered states showed outlined/light CTAs whose labels could disappear. Regression also caught `PROCEED TO CHECKOUT` at `1:1` contrast because a more-specific inherited-link color rule overrode the CTA foreground while the CTA surface stayed light.
- Root owner: shared component-state contract + selector specificity + missing rendered-state regression.
- Remediation: CTA/button owner selectors now set matched foreground/background pairs, including hover/focus-relevant states; regression audits actual computed rendered contrast.

### V14-R03 — Home campaign focal crop
- Label: `FACT`
- Severity: `P1`
- Evidence: the reported Home render clipped the model's head. The previous owner used `.home-campaign-v14__media img { object-fit: cover; object-position: center 20%; }` without a project-specific focal-point gate.
- Root owner: Home V14 media rule + missing focal regression.
- Remediation: focal positioning was moved to a top-safe crop and verified on rendered 1363×936 and 1100×900 evidence.

## Requirement Coverage

| ID | Requirement | OWNER_PHASE | Status | Verification |
|---|---|---|---|---|
| V14-R01 | Footer/common light surfaces keep readable foreground colors on every root route | Remediation | DONE_VERIFIED | V14 visual-sanity rendered/computed contrast scan across 20 routes; inspected footer artifact |
| V14-R02 | Shared button variants remain readable in default/hover/focus-visible | Remediation | DONE_VERIFIED | computed default/hover/focus contrast regression + inspected secondary/footer/Cart CTA state captures |
| V14-R03 | Home hero preserves model head/focal point at declared desktop viewports | Remediation | DONE_VERIFIED | inspected 1363×936 + 1100×900 rendered captures |
| V14-R04 | Regression suite fails if R01–R03 recur | QA | DONE_VERIFIED | GitHub Actions run `34086949527`: whole-site 20 routes + 5 desktop pressure checks, visual-sanity 20 routes, `Blockers: 0` |
| V14-R05 | Merge remediation to `main` | Release | DONE_VERIFIED | explicitly authorized by user on 2026-09-07; fast-forward merge/update only, no separate deployment claim |

## Verification evidence

- Whole-site QA: 20 routes + 5 desktop pressure checks, blockers `0`.
- Visual sanity regression: 20 routes, blockers `0`.
- Rendered artifacts manually inspected after the final code fix: Home hero, 1100px Home pressure state, light footer, secondary CTA default/hover, Cart CTA, House hero and Client Services hero.
- Build/CI success is not treated as visual proof; inspected rendered artifacts are the visual evidence.

## Phase result

`PASSED` — all remediation requirements due in this phase are `DONE_VERIFIED`. The skill-library hardening requested after this project defect is tracked separately in `Ngh1aa/skills_UIUX` and does not retroactively change the immutable skill SHA used for this remediation phase.
