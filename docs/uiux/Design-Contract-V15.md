# ATELIER V15 — Flagship Editorial Commerce Design Contract

## Status

`PHASE 1 — RESEARCH / UX / ART DIRECTION / DESIGN CONTRACT = PASSED`

Implementation is authorized on `feat/atelier-portfolio-upgrade`. Release authority is `create_pr_only`: do not merge and do not deploy from this run.

## Scope and source precedence

1. Current user request — luxury fashion / interaction craft / editorial commerce flagship.
2. `.uiux-profile.json` project truth.
3. `docs/uiux/Experience-System.md` and `docs/uiux/Monochrome-Upgrade.md`.
4. Current HTML/CSS/JS/data/runtime behavior.
5. `Reference-Benchmark.md`.
6. Generic UIUX Factory / `skills_UIUX` guidance.

`Monochrome-Upgrade.md` supersedes the older V14 desktop-only and porcelain/oxblood constraints. V15 therefore uses the existing monochrome direction and `responsive_all` scope.

## Product / portfolio goal

ATELIER should demonstrate that the designer can author a recognizable fashion-commerce world and still increase decision clarity as the user approaches purchase.

Portfolio proof must be visible in the implementation, not only claimed in documentation:

- distinct editorial art direction;
- explicit interaction/motion grammar;
- serious PDP decision support;
- comprehensive states;
- responsive recomposition rather than desktop shrinking;
- keyboard/focus/reduced-motion behavior;
- an inspectable design-system/state showcase;
- trade-off documentation.

## Evidence boundary

No participant interviews, usability sessions, analytics or conversion studies were supplied. External brand research is production-reference evidence only.

The statement below remains a **hypothesis** until participant or behavioral evidence exists:

> Editorial storytelling can increase desire at discovery, while purchase confidence benefits from progressively clearer size, fit, material, availability, delivery and return information nearer PDP/Bag/Checkout.

## Core journey

`Editorial Entry → Collection → Product Discovery → Product Detail → Size / Fit Decision → Variant / Availability → Add to Bag → Bag → Checkout → Confirmation`

Supporting journeys:

- Search → results → PDP.
- Filter/sort → result/empty state → clear/recover.
- Product → Saved → Saved list → PDP.
- PDP → Size Guide → return to current selection.
- PDP/quick add → mini-Bag → Checkout / View Bag / continue shopping.

## Preserve

- Existing route map and GitHub Pages-compatible architecture.
- VND pricing and current local catalogue.
- Product image provenance and complete-garment treatment.
- Search/filter/sort/Saved/Bag/checkout/order local behavior.
- Static/simulated system-reality disclosures.
- Hard-edge monochrome grammar, restrained serif ownership, compact sans utility text.
- Existing focus-management patterns in drawers/dialogs where correct.
- No fake scarcity.

## Change

1. Replace the stale unused navy/gold token file with the real monochrome primitive + semantic token source.
2. Add a V15 flagship layer for editorial composition, interaction states and responsive behavior.
3. Upgrade motion into a named tokenized system with a real CSS `prefers-reduced-motion` contract.
4. Upgrade PDP with explicit availability language, fit/size confidence grouping, selection feedback and mobile purchase continuity.
5. Strengthen PLP product-card hover/focus/saved choreography without making information hover-only.
6. Tighten Bag/Checkout progression so transaction surfaces visually differ from campaign surfaces.
7. Add portfolio-facing Design System, Component States, Sitemap/User Flow and Prototype screens based on actual implementation contracts.
8. Add cloud QA that owns route/asset/viewport/overflow/Playwright/Axe/keyboard/reduced-motion/console/Lighthouse evidence.

## Visual direction

**Quiet editorial luxury + strong fashion photography + disciplined transactional surfaces.**

### Signature sentence

With the wordmark hidden, ATELIER V15 should still read as ATELIER through **monochrome editorial fields, indexed microtype, asymmetric image-led composition, severe rules, quiet serif interruptions, complete-garment media, and transaction surfaces that snap into exact functional alignment**.

### Visual signatures

1. **Editorial index line** — edition/look/object metadata establishes a magazine/runway rhythm.
2. **Asymmetric frame** — Home and Collection may shift media/text proportion, but product/transaction roles use stable grids.
3. **Media threshold** — media dominates until a user enters a product decision; controls then become denser and more explicit.
4. **Hard-edge states** — state changes use rule weight, underline/inset line, opacity and text—not pills/glow.
5. **Motion as continuity** — small reveal, product media response, selector confirmation and edge drawer motion form one system.

## Anti-signatures

Do not use:

- gradients, glassmorphism, metallic/gold luxury shorthand;
- floating blobs or AI decoration;
- universal rounded cards;
- cursor replacement, scroll-jacking or parallax;
- oversized whitespace that pushes decision objects below useful view;
- serif on every heading/control;
- animation as the only state signal.

## Density gradient

| Role | Expression | Information density | Main job |
| --- | --- | --- | --- |
| Home / editorial entry | highest | low | desire + orientation |
| Collection | high | low–medium | story → shoppable look |
| Shop / discovery | medium | medium | narrow + compare |
| PDP | controlled | medium–high | confidence + variant decision |
| Bag | low | high | verify choice + totals |
| Checkout | lowest | high | error-free completion |
| Confirmation | low | medium | status + next action |

## Page-role composition matrix

### Home

- Media-led asymmetric split, not a generic centered hero.
- Hero title remains in document flow; no text required to be read over product photography.
- Runway moments use intentionally unequal visual rhythm at wide viewports.
- Product edit returns to a disciplined grid so editorial tension does not reduce shopping clarity.

### Collection

- Each chapter is a visual narrative beat with direct product bridges.
- Alternating media/copy remains meaningful; layout changes between chapters may vary proportion, not just order.
- No lookbook chapter without a reachable product/collection action.

### Shop

- Result count + Filter + Sort are explicit.
- Product media stays dominant; metadata stays attached to media.
- Save is always reachable with a visible accessible name.
- Quick-add appears through pointer hover **and keyboard focus-within**, but product/PDP link never depends on quick-add.
- Empty/no-result state contains recovery action.

### PDP

Desktop sequence may be spatially parallel, but semantic priority is:

`media → collection/name → price → color → size + size guide → availability → purchase → fit/model → delivery/returns → material/care/origin → related pieces`.

Rules:

- `stock === 0 && inventoryKnown` → `Sold out / unavailable`.
- `0 < stock <= low-stock threshold && inventoryKnown` → `Low availability` is permitted because it is sourced from actual local variant data.
- `inventoryKnown === false` → never convert Infinity fallback to “In stock”; display transparent prototype language such as `Live stock status is not connected in this prototype.`
- Unavailable size remains visible, disabled and labeled.
- Add to Bag without required size moves focus to size and announces the problem.
- Save has text/pressed state, not icon/color alone.
- The mobile purchase dock is a shortcut mirroring current selection, not the only purchase control.

### Bag

- Variant, quantity, price and remove/edit remain clearly associated.
- Empty state is deliberate, not a blank grid.
- Summary can be visually inverse, but every text/control state owns its foreground/background pair.

### Checkout

- Keep explicit prototype reality note.
- Progress is represented through numbered sections and a compact progress rail; motion never gates form interaction.
- Labels remain persistent.
- Errors remain inline + announced; first invalid field receives focus.
- Do not request card data because no payment backend exists.

## Design system

### Primitive token families

- neutral color ramp;
- typography sizes/line-height/tracking;
- spacing 4/8/12/16/24/32/48/64/96/128;
- rule widths;
- radius 0/2 only;
- motion durations and easings;
- layout max widths / gutters / breakpoints.

### Semantic token families

- canvas / surface / inverse surface;
- primary / muted / inverse text;
- default / strong / focus / error / success borders;
- primary / secondary / quiet action;
- selected / saved / disabled / loading / error / success state;
- media background;
- focus ring;
- motion micro / state / disclosure / editorial.

### Components requiring contracts

Navigation, Product Card, Media Container, Filter Drawer, Select, Swatch, Size Selector, Button, Link, Modal/Drawer, Input, Checkbox, Radio, Accordion, Toast/Live Region, Cart Item, Checkout Field.

### Required states

`Default / Hover / Focus / Pressed / Selected / Disabled / Loading / Error / Success / Sold out / Saved`.

Not every component needs every state; the Component States screen must mark `N/A` where a state has no semantic meaning rather than fabricate one.

## Motion & interaction system

Motion jobs: `hierarchy`, `continuity`, `feedback`, `state change`. Delight is optional and may not slow a primary task.

| Trigger | From → To | Token | Purpose | Reduced motion |
| --- | --- | --- | --- | --- |
| editorial reveal | 12–20px + opacity → rest | `--motion-editorial` | hierarchy | opacity/instant |
| product image hover | 1 → ~1.015 scale | `--motion-state` | affordance | no scale |
| selected variant | rule/underline + text state | `--motion-micro` | feedback | instant state |
| gallery change | opacity 0.72 → 1 | `--motion-state` | continuity | instant swap |
| drawer open | edge translate → 0 | `--motion-disclosure` | origin/continuity | no translation |
| add-to-bag | button state + drawer | `--motion-state` | acknowledged action | text/state only |
| checkout progress | line/step state | `--motion-state` | progress | instant state |

Rules:

- Transform/opacity first; no scroll-linked continuous animation.
- No task waits for animation completion.
- Never use `transition: all` in new V15 code.
- `@media (prefers-reduced-motion: reduce)` disables transform/scroll behavior and shortens state transitions to near-instant.
- JS motion detection and CSS media query must agree.

## Responsive contract

### ≥1440

- Use generous outer gutters and asymmetric editorial ratios.
- Home visual hierarchy may span large type; shopping grids remain scannable.
- PDP media + sticky decision rail operate side-by-side.

### 1280

- Preserve desktop hierarchy but reduce panel padding/type before removing content.
- 3-column catalogue remains acceptable if card width remains usable.

### Tablet / 768

- Editorial split can become stacked or 55/45 only if both columns remain readable.
- Shop moves to two columns.
- PDP becomes single-column media → decision; sticky desktop rail disabled.
- Checkout summary appears before form only when it improves order context and does not trap focus.

### 390 mobile

Priority:

`product imagery → product identity → price → variant → size → purchase action → reassurance`.

- One-column PDP.
- Two-column compact PLP when width supports targets; one column on narrow mobile when metadata/actions collide.
- Mobile purchase dock appears only after the primary inline Add to Bag has moved above the viewport; it must not cover fields/content.
- Drawer becomes full-width/near-full-width without side clipping.

### Narrow mobile

- No horizontal body scroll.
- Product/card metadata can reflow to one column.
- Size controls wrap; minimum interactive target maintained.
- Tables scroll locally rather than widening page.

## Accessibility contract

Target: WCAG 2.2 AA design/implementation intent. Final response may only claim checks actually executed.

- Semantic landmarks/headings preserved.
- Native buttons/inputs preferred.
- Visible focus with high-contrast outline/ring.
- Minimum useful target ~44px for primary interactive controls where feasible.
- Dialog/drawer has name, Escape, focus entry, trap and return focus.
- State not color-only.
- Form errors tied by `aria-describedby`, `aria-invalid`; first invalid field focused.
- Status changes announced by live region.
- Reduced motion honored in CSS + JS.
- Product media has useful alt; decorative duplicates empty/hidden.

## Decision records

### Decision 1 — Keep monochrome instead of reintroducing oxblood

**Problem:** V14 brand signal used color to create fashion identity; later project truth explicitly changed the whole interface to monochrome.  
**Evidence:** current source-of-truth `Monochrome-Upgrade.md`; user asks restrained palette rather than a new accent.  
**Hypothesis:** recognition can come from composition, index language, media and motion rather than accent color.  
**Alternatives:** restore oxblood; add fashion accent; stay monochrome.  
**Trade-off:** monochrome reduces an easy state cue, so selected/focus/saved states need stronger shape/rule/text treatment.  
**Decision:** stay monochrome.  
**Expected user value:** less visual noise while states remain explicit.  
**Expected business/portfolio value:** demonstrates brand craft beyond palette tricks.  
**Success signal:** states remain distinguishable in grayscale and keyboard QA.  
**Validation:** component-state render + keyboard + Axe/manual review.

### Decision 2 — Increase PDP information instead of hiding it for luxury minimalism

**Problem:** size/fit/material/availability uncertainty directly affects the purchase decision.  
**Evidence:** TOTEME, The Row, Jil Sander and SSENSE currently surface these objects at/near PDP selection; ATELIER already has most data/contracts.  
**Hypothesis:** a denser but structured decision rail will reduce information hunting without making the brand feel generic.  
**Alternatives:** ultra-minimal PDP; accordion-only PDP; explicit decision rail + progressive details.  
**Trade-off:** more visible utility text competes with editorial quiet.  
**Decision:** explicit decision rail, progressive details below action.  
**Expected user value:** fewer unanswered purchase questions.  
**Expected business/portfolio value:** shows commerce/product reasoning, not only art direction.  
**Success signal:** planned usability tasks can find fit, availability and returns without leaving decision context.  
**Validation:** source QA now; participant protocol later.

### Decision 3 — Build a motion grammar, not page-specific animation

**Problem:** current reveal code exists but there is no documented CSS reduced-motion system or coherent component transition grammar.  
**Evidence:** repository search shows JS motion checks but no `prefers-reduced-motion` CSS contract; interaction states are split across legacy layers.  
**Hypothesis:** tokenized motion can make editorial-to-commerce continuity recognizable without slowing tasks.  
**Alternatives:** no motion; decorative page animation; tokenized state/continuity system.  
**Trade-off:** additional CSS/JS complexity and QA responsibility.  
**Decision:** tokenized reveal/selection/media/drawer/progress motion with reduced-motion override.  
**Expected user value:** clearer feedback and continuity.  
**Expected portfolio value:** interaction craft is visible and explainable.  
**Success signal:** all motion has a named job; reduced-motion path keeps all information/function.  
**Validation:** Playwright emulated reduced motion + keyboard + visual inspection.

### Decision 4 — Keep one working frontend architecture

**Problem:** historical V9–V14 stylesheets create visible provenance but risk further layering.  
**Evidence:** current runtime intentionally uses V14 site as owner; wholesale rewrite would create regression risk across 20 routes.  
**Hypothesis:** one isolated V15 flagship override plus a corrected token source can demonstrate the new system while preserving working commerce.  
**Alternatives:** rewrite all CSS; patch each page; isolated V15 owner.  
**Trade-off:** historical CSS debt remains in repository.  
**Decision:** V15 owns new tokens/states/motion/composition; no page-local fix files. Record legacy consolidation as technical debt rather than pretending it vanished.  
**Expected user value:** fewer regressions.  
**Expected portfolio value:** demonstrates refactoring restraint and change safety.  
**Success signal:** core journey and all shared routes pass cloud smoke/overflow/console checks.  
**Validation:** whole-site cloud QA.

## System reality

| Capability | Reality | V15 UI rule |
| --- | --- | --- |
| Product/search/filter | STATIC + real browser behavior | may show real loaded results/errors |
| Saved/Bag/local profile/order | REAL browser-local | success only after local persistence |
| Inventory | MIXED / usually UNKNOWN unless explicit data exists | never convert unknown to fake availability/scarcity |
| Payment | SIMULATED | no captured-payment language |
| Fulfilment/shipping | SIMULATED | no dispatched/tracking claim without local status contract |
| Account identity | PARTIAL / not connected | no fake authentication confidence |
| Email restock/support | NOT CONNECTED | do not add notify/send success |

## Representative implementation gate

Before whole-site confidence claims, cloud evidence must cover at minimum:

1. `index.html` — editorial entry.
2. `collections.html` — editorial → product bridge.
3. `shop.html` — filter/sort/save/empty discovery.
4. `detailproduct.html?id=tailored-wool-blazer` — variant/size/PDP.
5. populated `cart.html` — Bag.
6. populated `checkout.html` — form/summary/progress.
7. `order-success.html` — confirmation.
8. `design-system.html` and `component-states.html` — system evidence.

Widths: 1440, 1280, 768, 390 plus narrow-mobile pressure width.

## Exit criteria

Phase 2/3 cannot claim complete until:

- build/tests pass;
- routes and required assets resolve;
- no body horizontal overflow at declared widths;
- critical interaction checks pass in Playwright;
- serious/critical Axe issues = 0 for tested representative states;
- keyboard route covers Search, filter, PDP selector, drawer and checkout form;
- reduced-motion emulation shows no essential content hidden and no large transform motion;
- Lighthouse evidence is collected and reported without turning lab scores into user-outcome claims;
- actual screenshots/artifacts are inspectable;
- visual critique has no P0/P1 blocker.
