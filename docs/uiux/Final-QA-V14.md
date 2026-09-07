# ATELIER V14 — Final Rendered QA

Date: 2026-09-07
Scope: `whole-site`
Type: `QA`
Risk: `high`
Mode: `production_candidate`
Responsive contract: `desktop_only`

## Result

**PASSED**

## Automated rendered evidence

- GitHub Actions workflow: `V14 whole-site rendered QA`
- Passing run: `34083809039`
- Head SHA under test: `bc3319768f7eb365ce3da63bb03dc388914906d5`
- Artifact: `atelier-v14-whole-site-qa` / ID `10004545266`
- Mandatory viewport: `1363×936`
- Desktop pressure viewport: `1100×900`
- Root routes verified: `20/20`
- Pressure checks: `5/5`
- Automated blockers: `0`

Verified automatically:
- HTTP 200 for all root routes under test.
- exactly one main H1 per route.
- `body.v14` and `data-atelier-style=luxury-monochrome` active.
- exactly one `atelier-v14-site.css` entrypoint and no root V13 stylesheet owner.
- no horizontal overflow at the declared desktop viewports.
- no broken rendered images or page/console errors in the tested states.
- seeded Bag, Saved and local Order states render.
- Checkout keeps prototype truth and the action label `Record Order on This Device`.
- Login/Forgot Password preserve no-account/no-password static reality.
- Contact explicitly states that direct messaging is not connected and drafts are not sent.
- House-codes anchor lands below sticky navigation (`targetTop=84`, `navHeight=66`).

## Manual visual inspection

Opened and inspected actual rendered pixels from the passing artifact:
- `v14-cross-page-contact-sheet.jpg`: Home, Shop, PDP, Collections, House, Client Services, Cart, Checkout, Contact, Login, Privacy, Order.
- `collections-1363-chapter.png`.
- `house-1363-codes.png`.
- `services-1363-index.png`.
- desktop pressure evidence at 1100px for Home, Collections, House, Cart and Checkout was also inspected in the remediation cycle.

### Visual verdict

- **FACT:** Home, catalogue, PDP, story, service, transaction, auth and legal roles no longer collapse into one universal composition family.
- **FACT:** The shared system remains coherent through porcelain/ink/oxblood semantics, typography, nav/footer and rule treatment.
- **FACT:** Decision-critical commerce information remains visible and readable while visual hierarchy is materially more fashion-editorial than V13.
- **FACT:** No P0/P1 macro visual defect remained in the final inspected evidence.
- **EVIDENCE_BACKED_INFERENCE:** The result is materially less template-like because boldness is concentrated in role-specific composition instead of repeated decorative devices.

## Remediation history

Initial whole-site QA run `34083471573` returned one blocker: Forgot Password reality-copy regex did not recognize the valid sentence `does not store passwords`. Inspection showed this was a QA assertion defect, not a product truth defect. The assertion was corrected without weakening the system-reality requirement.

Manual inspection also identified a possible sticky-nav collision for the `#house-codes` jump. `about.html` received an explicit anchor offset and the final automated interaction check verifies that the target lands below the nav.

## Scope accounting

- Desktop: `DONE_VERIFIED`.
- Tablet/mobile redesign: `N/A_JUSTIFIED` — current project truth explicitly defines this release as desktop-only; no fully-responsive claim is made.
- Formal WCAG conformance evaluation: `N/A_JUSTIFIED` — baseline semantics were preserved where touched, but no formal conformance claim is made.
- Merge/deploy: outside this QA pass and requires explicit release authorization.
