# Atelier — luxury monochrome upgrade

## Contract / 2026-09-07

User authorization: upgrade the entire interface to luxury white, black and grey,
repair unequal section composition and CSS display errors. This supersedes the
V13/V14 ivory/burgundy palette and desktop-only constraints. Mode: interactive
prototype. All 20 root HTML routes remain; commerce, prices, SEO and assets stay.

Skills: project-context → adaptive-skill-routing → website-delivery-pipeline →
website-audit-and-redesign → design-system-and-components → responsive-and-device-strategy → ui-craft-and-visual-qa
(elementary visual sanity checklist). Library revision: aa9c04e.

## Audit / preserve and improve

| Family / routes | User goal / business intersection | Evidence and owner | Change / verification |
| --- | --- | --- | --- |
| Home / index | Discover current collection and enter shopping | V14 absolute panel, minimum width, viewport-height media; user's clipped hero | Equal in-flow columns; complete figure and CTA bounds at 360–1920px |
| Catalogue / shop | Compare products / reach a relevant PDP | Fixed 540–720px card heights and oversized header | Compact introduction, consistent 3:4 media, usable filter/sort |
| Decision / detailproduct | Inspect garment, price, size / add correct variant | Fixed 790px gallery and large sticky rail | Bounded media, proportionate purchase rail, mobile gallery before controls |
| Story / collections, about | Understand looks and house identity / enter related products | Fixed chapter heights and staggered cards | Retain lookbook vs manifesto families; consistent alignments, natural content height |
| Service / client-services, contact, shipping&returns, size-guide, care-guide, privacy, terms | Find answers / remove purchase uncertainty | Large min-width grids and oversized titles | Compact directory, readable article widths, mobile table scroll |
| Transaction / cart, favourite, checkout | Review choices and total / complete local flow | Rigid summary columns; dark summary inherits dark muted copy | Responsive ledger and explicit inverse text/control pairs |
| Status / account, order, order-success, login, forgot-password | Understand local state and next action | Fixed two-column account background | Responsive status facts; preserve simulation disclosure and recovery links |

KEEP: local catalogue/store, variant selection, Bag/Saved/order state, URL/query
contracts, metadata, existing photography and identity. IMPROVE: shared visual
owners and responsive composition. No route deletion or framework change.

Source reality: local/static frontend; no backend/payment capability is added.
Entry points include deep catalogue/PDP and service links, so these retain their
own task-led headings rather than receive a campaign hero.

## Design decisions

- White page and controls (#fff), grey media/secondary surface (#f4f4f4), ink
  (#151515), muted copy (#626262), rule (#d9d9d9), inverse copy (#fff/#c7c7c7).
- One spacing rhythm: section 64–104px, group 24–48px, control 8–16px.
  Shared container and gutter align header, section headings and footer.
- Existing sans UI + restrained serif display; no new fonts or dependencies.
- Home: balanced portrait / white editorial panel in document flow, title and
  CTA not overlaid on photography; equal aligned wardrobe and product columns.
- Catalogue: utility header, 3 desktop / 2 mobile products. PDP: 58/42 media
  and purchase layout, single column on small screens.
- Story: inverse manifesto and ordered chapter layouts. Utility/transaction:
  smaller headings and readable task surfaces. These are distinct page families.
- Mobile: accessible existing menu, in-flow hero, compact type, stacked summaries,
  reflowed cards and controls. No body-wide minimum width or hidden overflow mask.
- Preserve natural product colour for purchase decisions; only UI surfaces are
  monochrome. Source-aware contain prevents crop through garments/faces.
- Buttons own foreground, background and border in default/hover/focus/disabled;
  inverse sections explicitly own secondary text. No added override stylesheet.

Reference check: [The Row](https://www.therow.com/) separates catalogue categories,
collection archive and Saved/Bag; [COS](https://www.cos.com/en-us) exposes care,
fit and delivery assistance. Adopt task clarity and distinct shopping/story paths.
These are content/IA observations, not visual or conversion proof. The supplied
screenshot, existing assets and user's monochrome direction govern the design.

## Verification plan

All 20 routes at desktop and mobile: horizontal overflow, broken images, runtime
errors, text visibility and control states. Representative screenshots at 360,
390, 768, 1024, 1440 and 1920; inspect actual pixels and cross-page contact sheets.
Exercise populated Bag/Saved/checkout/order and menu/search/variant controls.
Run existing commerce tests and Vite build. No deploy/commit requested.

## Verified result

`DONE_VERIFIED` for this local implementation and verification phase:

- Build: `npm run build`, all 20 root pages emitted successfully.
- Commerce unit tests: `npm test`, 2 passed.
- Built-site visual scan: 20 routes × 1363/1100/768/390px = **80 states**, **0
  blockers**, 4,492 visible text nodes and 1,758 interactive controls inspected
  across applicable default/hover/focus states.
- Additional overflow check: all 20 routes at 360 and 1920px = **40 states**, no
  document overflow. Home boundary checks at 600/601, 820/821, 1080/1081px and
  1024/1440/1920px found no clipped actions or horizontal overflow.
- Built-site mobile journey exercised: variant selection → Bag → quantity change
  → checkout with summary before form → local order confirmation. Search, filters
  and menu resize reset also passed; no runtime errors in that journey.
- Mobile menu: all five links visible, exact viewport bounds, Escape close and
  body scroll unlock passed.
- Actually opened and inspected desktop/mobile contact sheets, hero at desktop,
  mobile and 1920px, wardrobe rows, product rows, house bridge, and populated
  Bag/checkout/search/drawer captures. Complete photographs remain visible;
  headings, actions, section rows and inverse text remain legible.
- `git diff --check` and changed JavaScript/config syntax checks passed.

Evidence: [visual report](../../qa-evidence/monochrome/report.json),
[desktop sheet](../../qa-evidence/monochrome/contact-sheet-desktop.jpg),
[mobile sheet](../../qa-evidence/monochrome/contact-sheet-mobile.jpg),
[commerce flow](../../qa-evidence/monochrome/commerce-flow-report.json),
[pressure widths](../../qa-evidence/monochrome/viewport-pressure-report.json).
Full PNG captures and the detailed computed-state report remain local; compact
review sheets and reports are retained for version control.

## Root causes and regression ownership

1. The campaign used an absolutely positioned panel with minimum width and
   oversized text inside a clipped fixed-height composition. It now uses two
   equal in-flow grid cells with bounded type and source-aware portrait media.
2. A 960px body minimum and fixed desktop grids prevented mobile reflow. Existing
   page owners now transform at content breakpoints; the established desktop-first
   cascade is retained rather than replacing the project's architecture.
3. Layout-specific typography must stay in its owning layer: generic display
   sizing in a later layer can override small summary/form headings. Base display
   sizing now remains in the base layer.
4. Build inspection found unresolved CSS imports. CSS files are normalized to
   UTF-8 without BOM and plain relative imports; the built stylesheet was checked
   to include all nine cascade layers.
5. Runtime catalogue JSON and image string URLs were absent from `dist`. The Vite
   build now emits the existing catalogue and its referenced images at their
   original URLs, preserving the static-server and commerce contracts.
6. Previous CI built the project but served the source root, and skipped mobile
   under the old desktop-only contract. CI now serves `dist` and runs the current
   80-state scan plus mobile menu regression. Menu bounds now reject oversized
   surfaces as well as undersized ones.

The existing V5.4 sanity checklist covers these failure classes; the project
regressions enforce the known hero, visibility, overflow and build failures.
No upstream skill source edits or production release are part of this task.

Reproduce on Windows (Chrome installed, Playwright available):

```powershell
npm test
npm run build
node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4174
# In a second terminal:
$env:QA_BASE_URL='http://127.0.0.1:4174'
$env:QA_BROWSER_CHANNEL='chrome'
$env:QA_OUT_DIR='qa-evidence/monochrome'
node scripts/v15-elementary-visual-integrity.mjs
node scripts/mobile-menu-regression.mjs
```

Limits: rendered checks used desktop Chrome with emulated viewport sizes. Physical
devices, Safari/Firefox and formal accessibility conformance were not evaluated.
The updated CI workflow has been checked locally through its equivalent commands;
no remote CI run or deployment was triggered. Commerce remains browser-local.
