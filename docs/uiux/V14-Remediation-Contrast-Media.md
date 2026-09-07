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
- Evidence: `atelier-v14.css` gives `.v14 .site-footer` a dark background and `campaign-text`; `atelier-v14-site.css` later changes only the footer background to `--paper` and does not reset inherited foreground colors.
- Result: white / near-white footer text can render on warm porcelain and become effectively invisible until text selection highlights it.
- Root owner: shared V14 site layer, not individual HTML pages.

### V14-R02 — Interactive state contrast gap
- Label: `FACT + EVIDENCE_BACKED_INFERENCE`
- Severity: `P1`
- Evidence: user-provided rendered state shows outlined black-on-white CTA whose hover label turns white while its surface remains light. Existing QA captures default screenshots but does not inspect hover/focus contrast across shared button variants.
- Root owner: shared component-state contract + missing state regression.

### V14-R03 — Home campaign focal crop
- Label: `FACT`
- Severity: `P1`
- Evidence: user-provided Home render visibly clips the model's head. Current owner uses `.home-campaign-v14__media img { object-fit: cover; object-position: center 20%; }` although the Design Contract requires face + primary garment to remain intact at the evidence viewport.
- Root owner: Home V14 media rule.

## Requirement Coverage

| ID | Requirement | OWNER_PHASE | Status | Verification |
|---|---|---|---|---|
| V14-R01 | Footer/common light surfaces keep readable foreground colors on every root route | Remediation | BLOCKED | cross-route rendered + contrast scan |
| V14-R02 | Shared button variants remain readable in default/hover/focus-visible | Remediation | BLOCKED | computed state contrast + state captures |
| V14-R03 | Home hero preserves model head/focal point at declared desktop viewports | Remediation | BLOCKED | 1363×936 + 1100×900 rendered inspection |
| V14-R04 | Regression suite fails if R01–R03 recur | QA | BLOCKED | CI run on remediation branch |
| V14-R05 | Merge/deploy remediation | Release | N/A_JUSTIFIED | requires explicit release authorization for this remediation |

## Phase result

`BLOCKED` until all due-now remediation requirements above are verified with actual rendered evidence.
