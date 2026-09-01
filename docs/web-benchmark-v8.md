# ATELIER V8 — Web Benchmark + Redesign Delta Contract

Research date: 2026-09-01
Scope: whole-site visual system rollout after V7 representative-page redesign.

## Reference roles

| Reference | Production page/state | Role used | Principle transferred | Do not copy |
|---|---|---|---|---|
| COS | Women's New Arrivals | PLP / commerce | Category shortcuts + filter/sort stay close to dense product browsing; shopping utility stays dominant. | COS brand copy, exact card styling, promotional mechanics. |
| Studio Nicholson | Homepage / New Arrivals | Product-led editorial commerce | Product density and direct product actions can coexist with restrained brand storytelling. | Exact grid, typography or brand-specific merchandising. |
| TOTEME | Official store / collections | Luxury navigation + media | Keep navigation visually quiet so collection/product imagery and silhouette carry the brand. | Exact navigation labels or monochrome brand surface. |
| LEMAIRE | Official store | Category architecture | Restrained category/navigation surface supports a slower editorial product rhythm without decorative UI chrome. | Exact taxonomy, brand wording or product imagery. |

Source URLs:
- https://www.cos.com/en-eu/women/new-arrivals
- https://www.studionicholson.com/
- https://toteme.com/en-us/
- https://www.lemaire.fr/

## V8 design DNA

`restrained navigation + contact-sheet editorial media + dense catalogue + fitting-desk decision UI + document-like utility surfaces`

Consistency comes from:
- black/white/warm-paper role system;
- hairline rules;
- restrained small UI type;
- large editorial statements only where the page role deserves them;
- image-led composition;
- numbered/indexed editorial cues;
- no rounded-card marketplace shell.

Diversity comes from page composition, not new colors.

## Redesign Delta Contract

| Page role | V7/current recognizable structure | V8 intended structure | Structural delta | User/business reason |
|---|---|---|---|---|
| Home | V7 campaign contact-sheet | Preserve V7 campaign contact-sheet | intentionally preserved: already passes structural delta | Brand orientation + discovery. |
| Shop | V7 catalogue first | Preserve dense catalogue + filters | intentionally preserved | Fast product finding. |
| PDP | V7 fitting desk | Preserve fitting desk | intentionally preserved | Product confidence + purchase. |
| Checkout | V7 order sheet | Preserve utility order sheet | intentionally preserved | Low-distraction conversion. |
| Collections | generic service hero + two 50/50 image/copy sections | oversized lookbook opening + near-full-height image/copy chapters | hero silhouette, media dominance and chapter proportions change | Collection should feel shoppable/editorial rather than service-template. |
| The House | split hero + statement + 3 equal cards | manifesto-scale opening + asymmetric statement + rule-separated principles + full-height image story | first screen, type scale, card removal, media composition | Brand story needs authored fashion-house expression, not generic corporate/about template. |
| Bag | generic page title + content/summary columns | transaction ledger with oversized task title + item rows + sticky total rail | density, row proportions, summary behavior | Verify order quickly and proceed. |
| Saved | generic wishlist cards | visual product board with catalogue-like density | product board silhouette and hierarchy | Resume product consideration visually. |
| Client Services / Size / Care / Shipping | generic service hero | document-index utility family | typography, first screen, content rhythm | task-first trust/support. |
| Account / local orders | generic content page | system utility/paper family | surface and hierarchy | clearly separate local prototype utility from campaign pages. |

## Silhouette acceptance

V8 passes only if rendered screenshots show these materially different families:
1. campaign/contact-sheet;
2. dense catalogue;
3. fitting-desk product decision;
4. order/transaction sheet;
5. lookbook collection;
6. manifesto/house;
7. document/service utility;
8. saved/bag transaction utilities.

Color/font changes alone do not count.

## Mobile transformation

- Collections: desktop two-column full-height chapters become image-first chapters with copy below, not a squeezed 50/50 grid.
- House: oversized manifesto stays dominant; principles become rule-separated stacked statements rather than cards.
- Bag: sticky desktop summary becomes a full-width summary after item rows.
- Saved: 3-column desktop visual board becomes 2-column mobile product board.
- Service pages: task title becomes first screen and content follows in document order.

## Whole-site QA routes

Required rendered coverage before merge:
- Home
- Shop
- PDP
- Checkout
- Collections
- The House
- Client Services
- Size Guide
- Bag
- Saved
- Account/local utility

Desktop and mobile are required for the added V8 families.
