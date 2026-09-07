# ATELIER V14 — Decision Log

## D-001 — Responsive scope conflict

- Finding: current user asks for a luxury visual/layout upgrade but does not explicitly mention mobile.
- Project truth: `DESKTOP_UPGRADE_SCOPE.md`, V13 audit, V13 Design Contract and V13 Final QA all record an explicit desktop-only scope from the previous release.
- Decision: preserve `desktop_only` for V14 rather than silently expanding scope.
- Impact: desktop rendered evidence is DUE NOW; tablet/mobile = `N/A_JUSTIFIED`; no fully-responsive claim.

## D-002 — Inherit V13 instead of replacing the commerce system

- Finding: V13 passed whole-route desktop QA and fixed important catalogue/PDP/local-commerce defects.
- Decision: preserve V13 behavior, URL and JS contracts; V14 changes visual hierarchy/composition and semantic color roles.
- Impact: representative code must not refactor commerce-store or unrelated JS unless a real regression is found.

## D-003 — Palette evolution

- Finding: V13 cobalt successfully communicated youth/action but reads more digital-product/attainable-premium than the current high-fashion luxury brief.
- Reference evidence: current production luxury/fashion references use strong media, compact metadata, restrained UI and distinct campaign/story layers; no reference is treated as a mandate for a specific palette.
- Decision: project-specific adaptation to warm porcelain + near-black + controlled deep oxblood.
- Evidence label: `PROFESSIONAL_HYPOTHESIS` until rendered V14 review.
- Impact: oxblood is a micro-signal, not a full-site field.

## D-004 — CSS inheritance approach for representative implementation

- Constraint: V13 is the current passed single visual owner and must remain a stable fallback during representative exploration.
- Decision: create `atelier-v14.css` as one explicit V14 entrypoint that imports the passed V13 foundation and contains only documented V14 theme/composition deltas; representative HTML links only V14. This is intentional version inheritance, not runtime stylesheet injection or bug-patch stacking.
- Exit condition: if V14 is rolled out whole-site, the same single entrypoint pattern must be applied consistently; no sequence of V14-fix files is allowed.

## D-005 — Release authority

- User requested an upgrade through GitHub, which authorizes project edits on a working branch.
- Merge/deploy authority is not explicit.
- Decision: branch + implementation + PR/checks may proceed; no merge/deploy without explicit authorization.
