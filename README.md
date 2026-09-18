# ATELIER — Editorial Luxury Fashion Commerce

ATELIER is a static fashion-commerce prototype and UI/UX case study exploring a deliberate tension: **editorial expression should create desire, while the interface becomes progressively more explicit about product and transaction decisions as the shopper approaches purchase**.

V15 is designed as a portfolio flagship for art direction, interaction craft, product-detail UX, responsive behavior, accessibility-minded component states and design-to-frontend execution. It does **not** claim participant research, conversion lift or production commerce capabilities that have not been validated.

## V15 experience model

```text
Editorial Entry
→ Collection
→ Product Discovery
→ Product Detail
→ Size / Fit Decision
→ Variant / Availability
→ Add to Bag
→ Bag
→ Checkout
→ Confirmation
```

The visual direction is **quiet editorial luxury + strong fashion photography + disciplined transactional surfaces**. Home and Collections carry the strongest editorial expression; PDP, Bag and Checkout deliberately increase information clarity and reduce decorative interruption.

## Core product surfaces

- **Home** — asymmetric editorial entry with direct commerce bridges.
- **Collections** — shoppable lookbook chapters rather than a disconnected campaign gallery.
- **Shop** — search, filter, sort, applied filters, URL state, Saved, quick add and no-result recovery.
- **Product Detail** — product identity, gallery, colour, size, size guide, truthful availability, fit, sourced model note when present, material/care/origin, delivery/returns, Saved and related pieces.
- **Bag** — variant, quantity, price, edit/remove/save behavior and shared VND totals.
- **Checkout** — guest contact/address/delivery/payment-choice/review flow with inline validation and an explicit static-prototype reality note.
- **Confirmation / Order** — browser-local order record and follow-up status surfaces without pretending payment or fulfilment is live.
- **Client Services** — contact, shipping/returns, size and care guidance.

## Portfolio evidence screens

- [`design-system.html`](./design-system.html) — primitive + semantic tokens, typography, spacing, grid, breakpoints, shape, motion and working commerce component contracts.
- [`component-states.html`](./component-states.html) — Default, Hover, Focus, Pressed, Selected, Disabled, Loading, Error, Success, Sold out and Saved specimens plus a state-coverage matrix.

## Research and reasoning artifacts

- [`Reference-Benchmark.md`](./Reference-Benchmark.md) — production benchmark of LEMAIRE, Jil Sander, TOTEME, LOEWE, The Row and SSENSE. Reference evidence is not presented as user research.
- [`docs/uiux/Design-Contract-V15.md`](./docs/uiux/Design-Contract-V15.md) — visual direction, page-role composition, motion, responsive and accessibility contracts plus major decision records.
- [`docs/uiux/PLANNED-VALIDATION.md`](./docs/uiux/PLANNED-VALIDATION.md) — usability protocol only; no participant findings are fabricated.
- [`docs/uiux/INTERACTION-COMMERCE-RATIONALE-V16.md`](./docs/uiux/INTERACTION-COMMERCE-RATIONALE-V16.md) — explains the editorial-to-commerce density gradient, motion jobs, PDP decision contract and evidence boundary.
- [`docs/uiux/Experience-System.md`](./docs/uiux/Experience-System.md) — commerce and system-reality model.

## Interaction system

V15 uses a small motion grammar instead of page-specific effects:

- editorial/image reveal → hierarchy;
- product hover/focus → affordance;
- variant/size feedback → state confirmation;
- PDP gallery response → continuity;
- mini-Bag drawer → action-to-result continuity;
- checkout progress → orientation.

`prefers-reduced-motion: reduce` removes large transforms/translation and preserves the same content, state and task completion path. No scroll-jacking, cursor replacement, gratuitous parallax or motion-only information is used.

## Responsive contract

The interface is recomposed—not merely shrunk—across:

- **≥1440** — asymmetric editorial canvas, generous media, PDP media + decision rail;
- **1280** — desktop hierarchy with tighter spacing/type;
- **768 / tablet** — two-column discovery, stacked editorial roles and single-column PDP decision flow;
- **390 mobile** — image → identity → price → variant → size → purchase → reassurance;
- **narrow mobile** — one-column recovery where two-column product metadata no longer fits, with no body-level horizontal overflow.

## Accessibility intent

Target: WCAG 2.2 AA design/implementation intent. The project includes semantic landmarks, native form controls where possible, visible focus, persistent labels, live status/error regions, focus-managed dialogs/drawers, keyboard interactions, non-colour state cues and reduced-motion behavior.

Automated Axe/Lighthouse output is treated as regression evidence—not proof of complete accessibility conformance. Manual/participant validation remains separate.

## Commerce/system reality

`src/js/commerce-store.js` is the source of truth for catalogue, variant, Bag, Saved and browser-local Order state.

- Search/filter/PDP/Bag interactions are real client-side behavior.
- Bag, Saved and local order records persist in browser storage.
- Inventory may be `UNKNOWN`; V15 does not turn unknown stock into fake “In stock” or fake scarcity.
- Cash on delivery and bank transfer are simulated choices in a local prototype.
- Card payment, server inventory, email, authentication and live fulfilment are **not connected**.

## Technology

| Layer | Technology |
| --- | --- |
| Markup | Semantic HTML5 |
| Visual system | CSS cascade layers + V15 semantic tokens |
| Interaction | JavaScript ES modules |
| Build | Vite |
| State | Browser-local JavaScript / `localStorage` |
| QA | GitHub Actions, Playwright, Axe, Lighthouse |
| Design source | Figma + repository design contracts |

## Cloud QA

The V15 branch adds `.github/workflows/atelier-v15-flagship-qa.yml` and keeps the existing whole-site visual regression suite.

The flagship gate checks:

- production build and commerce tests;
- route resolution and broken images;
- 1440 / 1280 / 768 / 390 / 320 representative states;
- body horizontal overflow;
- console/page/request errors;
- serious/critical Axe findings;
- Search, Filter, PDP Add-to-Bag/drawer, Checkout validation and mobile-menu keyboard behavior;
- reduced-motion behavior;
- Lighthouse lab evidence;
- rendered screenshots/artifacts.

## Local development

```bash
npm install
npm run dev
```

Before proposing a release:

```bash
npm test
npm run build
```

Cloud/browser QA remains the acceptance evidence for the V15 branch.

## Repository map

```text
Atelier/
├── index.html
├── collections.html
├── shop.html
├── detailproduct.html
├── favourite.html
├── cart.html
├── checkout.html
├── order-success.html
├── order.html
├── account.html
├── client-services.html
├── design-system.html
├── component-states.html
├── atelier-v15.css
├── Reference-Benchmark.md
├── docs/uiux/
│   ├── Design-Contract-V15.md
│   └── PLANNED-VALIDATION.md
├── src/css/tokens.css
├── src/js/
│   ├── commerce-store.js
│   ├── commerce-ui.js
│   ├── motion-system.js
│   └── pdp-v15.js
├── scripts/v15-flagship-interaction-qa.mjs
└── .github/workflows/atelier-v15-flagship-qa.yml
```

## Git workflow for V15

V15 work lives on `feat/atelier-portfolio-upgrade`. The intended delivery is a **draft PR only** until appropriate cloud gates pass and visual critique has no blocking issue. This project should not be merged automatically as part of the redesign run.
