# ATELIER V10 — Journey / Layout Delta

## Release intent

V10 is not a cosmetic continuation of V9. It changes the primary page silhouettes and the order in which users encounter decisions.

## Primary journey

`Home task routing → Shop persistent narrowing → PDP product ledger + fitting desk → Bag review → Checkout order ledger → local confirmation`

## Structural delta by page role

| Page role | Previous recognizable structure | V10 structure | User-task change |
|---|---|---|---|
| Home | Campaign hero → product strip → collection editorial | Task-routing rail → split editorial/product hero → vertical wardrobe sequence → collection study | Users can choose shopping/service intent before entering the editorial story. |
| Shop | Wide catalogue header → toolbar → conventional product grid | Sticky category/task rail + persistent desktop filters + larger two-column catalogue | Narrowing is visible beside results instead of hidden behind a generic top bar. |
| PDP | Media left + all product metadata in one sticky right panel | Full-width product ledger → thumbnail studio + large media → separate fitting/decision desk | Identity/price are established before the user evaluates imagery, fit, colour and size. |
| Bag | Items first + summary on the right | Explicit 3-step progress + summary/next-step rail first on desktop + selected items second | The next commitment and total are persistent while the user verifies selections. |
| Checkout | Form left + order summary right | Order/progress ledger left + numbered action form right | Users keep the order context visible while completing required information in sequence. |
| Collections | Standard service hero + alternating chapter rows | Warm collection orientation + media-safe large chapter studies + task-resolving category CTAs | Story resolves directly into shoppable category paths. |
| House | Brand hero + principles/content sections | House orientation aligned to V10 navigation and surface system; shopping path remains explicit | Brand context no longer competes with primary commerce decisions. |

## Media integrity rules

- Product and model imagery uses `contain` where the subject must remain complete.
- No giant decorative typography may overlap or obscure product media.
- Product card media and product information remain owned by the same card.
- PDP main media may not crop the subject for decorative effect.
- Desktop Shop product grid uses larger two-column cards; mobile uses two compact columns without slicing media.

## V10 hard gates

- `scripts/final-visual-qa.mjs`
- `scripts/v10-journey-regression.mjs`
- `scripts/pdp-sticky-regression.mjs`
- `scripts/mobile-menu-regression.mjs`

A release is not approved unless the branch run is successful and representative screenshots are manually inspected before merge.
