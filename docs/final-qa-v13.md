# ATELIER V13 — Final Desktop QA & Remediation

## Scope and evidence condition

- Evidence viewport: **1363 × 936 desktop**.
- Immutable rendered code checkpoint: `c9eb298e8f1ef69f731252c2c96159c87cd46a1e` on `redesign/youth-luxury-v13`.
- Screens were rendered from the GitHub commit URL, opened as images and manually inspected. DOM-only checks and build success were not treated as visual evidence.
- Mobile and tablet are outside this run by the user's explicit desktop-only scope override.

## Review 1 — OLD → NEW

| Representative role | OLD baseline | NEW inspected result | Verdict |
|---|---|---|---|
| Home / orientation | conventional boxed 50/50 luxury split | edge-to-edge full-look poster, manifesto rail, value cue and wardrobe moments | PASS — hierarchy and silhouette materially changed |
| Shop / catalogue | blank/delayed first viewport behind an editorial hero | purpose, count, categories, filter and first product row visible immediately | PASS — journey is catalogue-first |
| PDP / decision | media/title desynchronisation and blank decision controls | synchronized full-garment media, price, colour, visible sizes, fit and CTA | PASS — decision object is complete |
| Collections / lookbook | repeated alternating image/copy template | indexed, staggered three-chapter lookbook with product bridges | PASS — distinct Story/Lookbook family |
| House / trust | reusable broad split hero | manifesto-led brand statement, house codes and image atlas | PASS — distinct trust role |

## Review 2 — NEW → Design Contract

| Contract rule | Evidence | Result |
|---|---|---|
| Ink/ivory editorial grid + cobalt signal | repeated across Home, Shop, PDP, House, Services and transaction routes | PASS |
| Different first anchors by page role | five composition families inspected | PASS |
| Shop and PDP immediately usable | controls and decision data visible in first desktop viewport | PASS |
| Complete-garment media | Home, PLP, PDP, Collections and search result crops inspected | PASS |
| Accessible-premium value | current product edit is 1.29M–3.49M VND without fake discounts/scarcity | PASS |
| Truthful system reality | checkout says local prototype; account/password/order states do not claim backend services | PASS |
| One visual owner | all 20 HTML routes reference only `atelier-v13.css`; runtime legacy injection removed | PASS |

## Review 3 — NEW → NEW cross-page QA

| Family | Sampled routes | Shared recognition cues | Intentional variation | Result |
|---|---|---|---|---|
| Editorial Orientation | Home | rules, labels, full-look portrait, cobalt CTA | immersive campaign stage | PASS |
| Catalogue Utility | Shop, search | compact utility controls, complete product cards | dense comparison and filtering | PASS |
| Product Decision | PDP | rule-led facts, complete media, cobalt purchase action | 60/40 purchase composition | PASS |
| Story / Trust | Collections, House | numbered/indexed editorial language and portrait art direction | chapters vs manifesto/code atlas | PASS |
| Transaction / Service | Bag, Checkout, Saved, Account, Client Services, legal | ledger rules, direct labels, truthful states | item review, forms, recovery and content reading patterns | PASS |

The logo-hidden recognition heuristic retains at least three recurring cues: ink/ivory rules, full-look portrait art direction, and cobalt decision/focus signals. Page families do not collapse into a universal hero.

## Material remediation log

| Severity | Finding from inspected screenshot/state | Root-owner fix | Re-rendered result |
|---|---|---|---|
| P1 | Shop/PDP dynamic media and controls could exist in DOM without painting reliably | static-first catalogue cards and PDP decision controls, hydrated in place | PASS |
| P1 | empty Bag rendered a blank left column | static empty-state in `cart.html`; JS preserves it when empty | PASS |
| P1 | Bag line item flowed into multiple accidental rows; remove became a full-width bar | corrected `.cart-item` five-column owner and child sizing | PASS |
| P1 | Checkout product name, variant and price overlapped | corrected `.summary-item` metadata hierarchy | PASS |
| P1 | Saved said “0 items” while legacy demo cards remained visible | removed false demo inventory; static truthful empty-state | PASS |
| P2 | search result name/category/price were concatenated | styled the actual `.search-product-result` owner | PASS |

No unresolved P0, P1 or material fixable P2 remains in the authorized desktop scope.

## Whole-sitemap desktop smoke

All routes below were visited at the evidence commit. Each returned one H1, one V13 stylesheet, non-empty main content, no horizontal overflow, and no site-origin console warning/error.

| Family | Routes | Result |
|---|---|---|
| Orientation/catalogue/decision | `index.html`, `shop.html`, `detailproduct.html?id=tailored-wool-blazer` | PASS |
| Story/trust | `collections.html`, `about.html` | PASS |
| Service | `client-services.html`, `size-guide.html`, `care-guide.html`, `shipping&returns.html`, `contact.html` | PASS |
| Transaction | `cart.html`, `checkout.html`, `favourite.html` | PASS |
| Account/order/recovery | `account.html`, `login.html`, `forgot-password.html`, `order.html`, `order-success.html` | PASS |
| Legal | `privacy.html`, `terms.html` | PASS |

Home's below-fold lazy images can remain incomplete during a short top-of-page smoke; the first campaign image was loaded and visually inspected. This is expected lazy-loading behavior, not a broken-media result.

## Interaction and accessibility-visible checks

| Check | Evidence | Result |
|---|---|---|
| PDP size → Add to Bag | selected size S, `aria-pressed=true`, Bag count became 1, mini bag showed correct product/variant/price | PASS |
| Bag → Checkout | item, quantity, total and product image agreed across both pages | PASS |
| Checkout required-field recovery | attempted empty submission focused `#checkoutEmail`; no local order was recorded | PASS |
| Search dialog | query “cape” returned two correct items; Escape closed and restored focus to Search | PASS |
| Filter drawer | opened with grouped size/category/colour controls; Escape set `aria-hidden=true` and restored focus to Filter | PASS |
| Focus / reduced motion | global visible cobalt focus; `.reveal` content is visible by default and reduced-motion rules do not hide content | PASS |

Automated accessibility conformance or assistive-technology certification is not claimed; the checks above cover the changed semantic/keyboard-visible surfaces.

## Final QA result

`PROMPT 3 RESULT = PASSED (DESKTOP SCOPE)`

