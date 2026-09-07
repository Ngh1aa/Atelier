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
- Evidence label: `EVIDENCE_BACKED_INFERENCE` after rendered V14 review.
- Impact: oxblood is a micro-signal, not a full-site field.

## D-004 — CSS inheritance approach

- Constraint: V13 is the passed foundation and must remain available as an implementation base without creating a patch chain.
- Decision: `atelier-v14.css` inherits the stable V13 foundation; whole-site rollout has one explicit owner, `atelier-v14-site.css`, which imports V14 and adds role-specific whole-site composition. Root HTML references only `atelier-v14-site.css`.
- Verification: deterministic rollout checked all 20 root HTML routes and found no V13 root stylesheet owner.
- Impact: no sequence of `v14-fix.css` files or runtime stylesheet injection is allowed.

## D-005 — Release authority

- User requested an upgrade through GitHub, which authorizes project edits on a working branch.
- Merge/deploy authority is not explicit.
- Decision: branch + implementation + checks may proceed; no merge/deploy without explicit authorization.

## D-006 — Page-role differentiation for whole-site rollout

- Trigger: a high-fashion visual direction can become generic if every route receives the same dark campaign hero.
- Decision: keep a shared material/type/color grammar but assign different composition families: Home = campaign canvas; Collections = runway/archive; House = manifesto/evidence; Client Services = trust index; service/legal = editorial utility; Cart/Checkout/Order = transaction ledger; Auth = explicit static-reality split.
- Verification: final 12-role contact sheet was opened and inspected; no universal hero/layout pattern remained across materially different roles.
- Evidence label: `FACT` based on rendered pixels.

## D-007 — Legacy QA drift vs V14 canonical QA

- Finding: the repository's older `final visual QA` workflow contains V12/mobile-era assertions that conflict with the current desktop-only V14 Design Contract. The old workflow was already failing on the V13 main baseline.
- Decision: do not weaken product requirements to satisfy stale assertions. Add a V14-specific whole-site rendered QA that uses the current Design Contract, 20 root routes, 1363×936 mandatory evidence, 1100×900 desktop pressure checks, commerce seeds and system-reality checks.
- Impact: V14 pass/fail is owned by `V14 whole-site rendered QA` for this branch; the legacy workflow remains historical debt rather than canonical evidence for V14.

## D-008 — QA blocker remediation

- Initial final-QA run reported one Forgot Password reality-copy blocker.
- Evidence: rendered content correctly said the static edition does not store passwords; the regex failed to recognize that valid disclosure.
- Decision: fix the assertion, not the product copy and not the system-reality requirement.
- Manual inspection also raised a possible sticky-nav collision at `#house-codes`; an explicit anchor offset was added and an interaction regression verifies `targetTop=84` with nav height `66`.
- Final result: whole-site QA run `34083809039` passed with zero blockers.
