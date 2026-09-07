# ATELIER — Brand, design system & complete customer journeys

Contract: 2026-09-07. Scope: all 20 existing routes, desktop/tablet/mobile,
interactive front-end prototype. Latest monochrome request takes precedence over
old colour and desktop-only contracts. No framework, dependency or backend change.

## Sources and scope

- The supplied BA PDF, pp. 1–8: editorial fashion commerce; discover, evaluate,
  save, buy, revisit and get assistance. Its LuxRoom header and descriptions of
  old masonry/blog/auth implementations are stale against the actual repository.
- `Monochrome-Upgrade.md`: current implemented visual contract.
- `DESIGN-CONTRACT-V13.md`: Vietnam/VND, accessible premium, guest-first journey.
- Current HTML, shared CSS owners, product JSON and commerce modules: runtime truth.
- No interviews or analytics study was supplied. The behaviours below are design
  hypotheses based on the BA, not claims of observed user behaviour.

Editorial intent is served by Collections, House and care content. A duplicate
blog, admin application, real identity service and payment processing are outside
this front-end design scope. Their absence must not produce fake controls/success.

## PROPOSED BRAND GUIDELINE — LOGO-DERIVED

Status C: repository wordmark/monogram and photography available; no official
brand book. User-directed white/black/grey is the governing digital direction.

| Dimension | Evidence/status | Digital rule |
| --- | --- | --- |
| Wordmark/monogram | Repository assets, verified project truth | Preserve proportions; ink on white, white on ink; no distortion/filter effect |
| Palette | User request, PROPOSED_FOR_DIGITAL | White canvas, grey secondary surfaces, ink actions; natural product colours |
| Typography | Existing CSS, PROPOSED_FOR_DIGITAL | Restrained serif display; sans for forms, price and navigation; no new font download |
| Photography | Existing full-garment images | Contain garment/face; no tint that changes purchase evidence |
| Voice | BA editorial positioning, proposed | Calm, concise English UI; concrete action labels; no urgency or unverified service claims |
| Signature | Existing indexed editorial composition | Fine rules, small edition labels, large portrait imagery, compact functional ledgers |

Logo contexts: header/scrolled/mobile white surface with ink wordmark; footer
grey surface with ink wordmark. Utility screens retain the same shell. Display
type belongs to page headings, not every form field or panel heading.

## Design system and component contracts

Owners: `atelier-v13.css` base/components; `atelier-v14.css` current tokens and
shopping/editorial owners; `atelier-v14-site.css` page families/responsive states.

| Role | Token/contract | Usage |
| --- | --- | --- |
| Canvas/text | `--paper` / `--ink` | White/#151515; primary readable content |
| Secondary surface/text | `--surface` / `--muted` | #f4f4f4/#626262; help, local-state notices |
| Inverse | `--campaign-ink` / `--campaign-text`, `--on-dark-muted` | Order summaries and editorial sections only |
| Divider | `--rule`, `--rule-dark` | Group related information without decoration |
| Primary action | ink/white, hover grey/white | One main action per task group; visible focus, disabled and busy |
| Validation | existing `--error` plus explicit error text | Field-level error; never colour alone |
| Spacing | existing gutter/page/section tokens | 8/16/24/32/48 groups; 64–104 section rhythm |
| Fields | `.form-group`, shared validation | Persistent labels; optional marked; errors linked by aria-describedby; focus first invalid field |
| Drawers | existing commerce overlay | Focus trap/Escape/return focus; Size Guide returns to chosen variant |
| Client workspace | existing account family | Task links, order ledger, editable local details, recent pieces; stacked mobile |
| Service forms | same fields/actions/status | Save draft explicitly; download copy; never imply delivery to an inbox |
| Feedback | existing live region + inline status | Announce result after successful persistence; preserve input on failure |

Do not use new colour accents, placeholder mailboxes, full-screen campaign heroes
on forms, prechecked marketing consent, fictitious tracking, or password storage.
Mobile transforms to one-column tasks, two-column compact product previews and
locally scrollable measurement tables. All controls must remain reachable.

## Journey and route coverage

| Behaviour / goal | Routes and actions | Recovery / next step |
| --- | --- | --- |
| New visitor seeks a look | Home → Collections / House → catalogue/PDP | Every editorial CTA reaches actual product/category content |
| Intent-led shopper | Search → Shop; shared matching, filter and sort | Empty results clear every restriction including collection; retry catalogue failure |
| Evaluating a piece | PDP → image, colour, size, fit, care, delivery | Invalid product gets explicit recovery; preserve variant through size help |
| Still deciding | Saved + recently viewed → variant picker/PDP | Empty Saved links to Shop; all prices from catalogue |
| Ready to buy | Bag → edit quantity/variant/save for later → checkout | Prevent unavailable merge/quantity; persistence failure stays recoverable |
| Guest checkout | Contact → address → delivery → payment → review | Inline errors, explicit terms links, draft restoration, recalculate changed Bag before record |
| Return visit | Account → orders / saved / details | Local profile optional; no account wall; local-only data disclosure |
| Access/recovery | Login entry → local client space; recovery → order lookup | No password or fake reset email; missing order links to current-device history |
| Post-purchase | Confirmation → order details → return/exchange intent | Show totals/address, local request status, prevent duplicate request, cancel local note |
| Needs assistance | Client Services → Contact / shipping / size / care | Contextual answers + editable/exportable enquiry draft; no fake send |
| Policy review | Privacy / Terms / Shipping | Consistent disclosure with actual browser-local storage and service limits |

## System reality and future integration contracts

| Capability | Reality | Source / completion condition | Production dependency |
| --- | --- | --- | --- |
| Search/filter/product data | STATIC data, REAL browser interaction | Product JSON; load failures can retry | Catalogue/inventory API owner |
| Bag/Saved/recent pieces | REAL browser-local | Storage write succeeds before success feedback | Cross-device service optional |
| Client profile/address | REAL browser-local, not authentication | Allowlisted fields, explicit save/clear | Identity + protected profile service |
| Orders/payment/shipping | SIMULATED | Order record stored; no captured funds/shipment | Commerce/payment/fulfilment providers |
| Return/exchange note | SIMULATED | Saved on order; duplicates rejected | Authorised service request API |
| Enquiry | REAL local draft, no sending | Save/download draft; no inbox call | Approved endpoint/address + delivery receipt |
| Login/register/reset | NOT CONNECTED | Local workspace alternative, no password collection | Secure identity/session and verified email provider |
| Newsletter | NOT CONNECTED | Editorial link remains available | Consent + subscription/email service |

Future identity: sign-in/create/reset must preserve non-secret input on error,
have explicit pending states, generic recovery responses, session/CSRF controls,
and guest continuation. Future support: only confirmed server acceptance may show
“sent”; retries must not duplicate cases. These are proposed contracts, no
invented endpoints. Backend integration is not claimed by this implementation.

## Acceptance and verification

Due now: implemented journey regressions, storage failure, stale Bag totals,
shared search/size consistency, keyboard return, responsive state screenshots,
all-route smoke, existing tests and production build. Release is N/A (not asked).
Physical-device/browser-matrix and user research remain unverified. Results will
be appended after execution; a rendered screen alone is not integration evidence.
