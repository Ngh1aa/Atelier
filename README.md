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

## Commerce/system reality — a complete demo store without a backend

`src/js/commerce-store.js` is the source of truth for catalogue, variant, Bag, Saved, order, account, address, alert and appointment state. All user data lives in **sessionStorage**: it survives navigation and reload inside one browser tab and disappears with the tab. The first read in a tab seeds it from one file, [`src/data/demo-seed.js`](./src/data/demo-seed.js) (stock per variant, promo codes, the seeded client, two addresses, two orders, two Saved pieces, appointment hours).

Working flows: shop search/filter/sort with URL state · PDP colour, size, size guide, stock, sold-out “Notify me” and not-found · Saved (add, remove, move to Bag) · Bag quantity, remove, promo codes (`ATELIER10` valid; `WELCOME200` minimum spend; `FALL2025` expired) and gift note · checkout with saved addresses, delivery method, simulated payment (cash, transfer or a card **without any card fields** that approves or declines), review and an order number · order history and detail with cancel (processing) or return/exchange (delivered) · simulated sign up, sign in, sign out, "Continue as Linh Tran" and password reset (the code is shown on screen only with `?demo=1`) · profile edit and address book CRUD · contact enquiry and Client Services appointment booking.

**Entry URL:** https://atelier-henna-tau.vercel.app/ opens the homepage. A first-time visitor is already signed in as the seeded client **Linh Tran** (`linh.tran@atelier-studio.vn` / `atelier-demo`), so Account, Orders and Saved are populated. Sign out works; the sign-in page then offers **Continue as Linh Tran** and still accepts the credentials.

**Demo tools:** add `?demo=1` to any URL (e.g. https://atelier-henna-tau.vercel.app/?demo=1). A small floating **Demo tools** panel appears (simulated request failures, **Reset demo data**, the simulated card outcome at checkout, the on-screen reset code and the design-review feedback toolbar). The flag is remembered for the tab; `?demo=0` turns it off. Normal visitors see none of this; every footer only carries the line "Concept product designed by Đỗ Anh Nghĩa." Design-documentation pages (`design-system.html`, `component-states.html`, `state-matrix.html`, `recruiter-state-lab.html`, `figma-*.html`) stay published but are not linked from the store.

Every “server” action goes through `simulateRequest()` (latency, loading state, recoverable error with **Try again**). The hidden **Demo tools** panel (`?demo=1`) can make the next request — or every request, including the catalogue — fail, and **Reset demo data** restores the seed (signed in again as Linh Tran). Nothing is actually charged, shipped or emailed.

QA for this layer (serve the build on port 8924 with `npx vite preview --port 8924`, Playwright via `NODE_PATH`):

```bash
QA_BASE_URL=http://127.0.0.1:8924 node scripts/full-prototype-e2e.mjs   # every flow + reset + console/href checks
QA_BASE_URL=http://127.0.0.1:8924 node scripts/control-inventory.mjs    # clicks every control on the 20 site pages
```

## Technology

| Layer | Technology |
| --- | --- |
| Markup | Semantic HTML5 |
| Visual system | CSS cascade layers + V15 semantic tokens |
| Interaction | JavaScript ES modules |
| Build | Vite |
| State | Tab-local `sessionStorage`, seeded from `src/data/demo-seed.js` |
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
│   ├── demo-controls.js · auth.js · account.js · services.js
│   ├── motion-system.js
│   └── pdp-v15.js
├── src/data/demo-seed.js
├── scripts/v15-flagship-interaction-qa.mjs · full-prototype-e2e.mjs · control-inventory.mjs
└── .github/workflows/atelier-v15-flagship-qa.yml
```

## Git workflow for V15

V15 work lives on `feat/atelier-portfolio-upgrade`. The intended delivery is a **draft PR only** until appropriate cloud gates pass and visual critique has no blocking issue. This project should not be merged automatically as part of the redesign run.
