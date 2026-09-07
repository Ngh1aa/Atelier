# ATELIER V14 — Design Contract

## Status

`PHASE 1 RESULT = PASSED (DESKTOP SCOPE)`

Representative implementation is authorized for Home / Shop / PDP. Whole-site rollout is not authorized until those three rendered roles are inspected and the Phase 2 gate passes.

## Project truth

- Existing GitHub Pages static HTML/CSS/JS ecommerce prototype.
- V13 whole-site desktop redesign is the current passed baseline.
- Current commerce reality must remain explicit: catalogue is local/static; Saved/Bag/local orders are browser-local; stock, payment and account backend behavior are simulated/partial.
- Current user request: inherit the existing design and raise layout/color/art direction toward a **young high-fashion luxury brand**.
- Official brand guideline remains `UNKNOWN`; current repository assets and ATELIER wordmark are first-party project truth.
- Responsive scope remains `desktop_only` because the existing project source explicitly records mobile as out of scope and the current request does not reopen it.

## Owner / user goal

**Owner goal:** ATELIER should look less like an accessible premium catalogue and more like an authored, desirable fashion house for younger customers, without losing ecommerce clarity.

**User goal:** quickly understand the fashion point of view, see products at a scale that makes styling/shape legible, and still reach fit, size, price and Bag actions without navigating through decorative spectacle.

## Preserve list

- ATELIER wordmark and existing logo asset.
- Existing routes, metadata intent, catalogue data, VND price presentation and current local commerce behavior.
- Full-garment / portrait-led product imagery and existing product media provenance.
- Hard-edge, no-radius, no-routine-shadow editorial discipline.
- Search, filter, quick-add, Saved, Bag and PDP selectors/JS contracts.
- Distinct page-role families introduced by V13.
- Honest simulated/static system states.

## Visible Redesign Delta

| Current V13 behavior | V14 behavior | Visible delta | Verification |
|---|---|---|---|
| Home uses a fixed 7/5 campaign/media split | Home becomes a full campaign canvas with an overlapping near-black fashion-house panel and runway metadata | hero silhouette changes from two adjacent columns to image-led layered stage | 1363×936 OLD/NEW comparison |
| Three equal wardrobe cards | asymmetrical runway index with intentionally staggered widths/heights | section rhythm no longer reads as equal cards | Home rendered inspection |
| white three-card current edit | dark collection field with floating porcelain product frames and stronger negative space | product edit becomes collection-world contrast moment | Home contact review |
| Shop uses compact four-column utility catalogue | three-column large-media catalogue, minimal metadata and more editorial whitespace | product imagery becomes dominant; mass-catalogue density reduces | Shop 1363×936 first + second viewport |
| PDP 60/40 complete-garment decision split | media-first ~2/3 stage + narrow sticky decision rail, black CTA, oxblood selected states | product object becomes more dominant while purchase information remains immediate | PDP 1363×936 screenshot + interaction check |
| cobalt is the universal youth/action signal | deep oxblood is reserved for micro-signal/current/action emphasis; near-black carries primary conversion | visual tone moves from tech-premium to sensual high-fashion | cross-page palette review |

## Design DNA

**Signature sentence:** With the logo hidden, V14 should be recognizable through warm porcelain fields, near-black campaign panels, restrained oxblood signals, oversized garment photography and runway-like indexing that connects editorial moments to shoppable pieces.

Attributes:

1. **Fashion-house first, commerce-ready second:** campaign presence is strong on Home/Collections, never on utility/checkout pages.
2. **Young through tension, not gimmicks:** asymmetry, cropped metadata and confident scale replace playful SaaS decoration.
3. **Luxury through restraint:** larger media, fewer visible controls, hard rules, precise type and negative space—not gold, shadows or fake exclusivity.
4. **Sensual but usable:** oxblood is a controlled signal; product data and actions remain immediately readable.
5. **Truthful:** no invented service, stock, payment, origin, sustainability or exclusivity claims.

## Semantic color roles

| Token | Value | Role |
|---|---|---|
| `--paper` | `#F1EDE6` | warm porcelain page/editorial field |
| `--white` | `#FCFBF8` | product/media utility surface |
| `--ink` | `#0B0B0C` | primary text / campaign noir / primary CTA |
| `--muted` | `#6E6761` | secondary metadata |
| `--rule` | `#CEC6BC` | structure / quiet separators |
| `--rule-dark` | `#9C938A` | strong controls / table edges |
| `--signal` | `#741F2B` | oxblood micro-signal, selection, active state, limited CTA emphasis |
| `--signal-soft` | `#E8D8D8` | rare secondary accent surface |
| `--campaign-ink` | `#09090A` | Home/collection fashion-house panels only |
| `--campaign-text` | `#F5F0E9` | text on campaign-ink |
| `--error` | retain V13 error role | validation only |
| `--success` | retain V13 success role | confirmed local state only |

No gold gradient, glass, glossy black card or decorative shadow system.

## Type / shape

- Keep the existing sans + editorial serif stack and system fallbacks; no new font dependency is required for V14 representative implementation.
- Sans owns navigation, product names, prices, controls and small runway metadata.
- Serif owns only selected campaign lines / editorial interruption.
- Display scale may increase on Home but must not make Shop/PDP decorative.
- Radius remains 0–2px.
- Elevation is created by overlap and contrast, not drop shadows.

## Page-role composition matrix

| Role | User question | First anchor | V14 top composition | Decision object | CTA |
|---|---|---|---|---|---|
| Home / campaign orientation | What is this fashion world and where do I enter? | large campaign image | full visual canvas + overlapping noir manifesto panel + edition index | three shoppable wardrobe/runway entries | Shop the edit |
| Shop / catalogue | What pieces are here and how do I narrow them? | editorial catalogue title + category rail | compact title band, live result utility, three-column large product field | image + product + price + filter/sort state | View / Select size |
| PDP / decision | Is this piece right for me? | complete garment media | 2/3 media stage + 1/3 sticky decision rail | price, color, size, fit, delivery, material | Add to Bag |
| Collections / story | How does this collection move as looks? | campaign/look frame | retain distinct lookbook family; later rollout uses V14 color/media grammar | look → product bridge | Shop look |
| House / trust | What is ATELIER's point of view? | manifesto/code | retain distinct trust family; no campaign panel cloning | house codes | Explore collection |
| Transaction / Service | Can I complete/recover the task? | task/state | preserve V13 utility structure; only semantic color/type alignment in rollout | item/form/status | contextual |

## Representative proof requirement

Phase 2 must render and inspect:

1. `/index.html`
2. `/shop.html`
3. `/detailproduct.html?id=tailored-wool-blazer`

At **1363×936**. Additional desktop pressure checks: 1024 and 1440/1920 when the renderer is available.

Phase 2 cannot PASS on source/build evidence alone.

## Media contract

- Home hero can use safe `cover` only when face and primary garment remain intact at the evidence viewport; otherwise use source-aware positioning.
- PLP media must preserve full garment and consistent perceived scale; no arbitrary `nth-child` crop fixes.
- PDP main media remains complete-garment first; detail crops are secondary.
- Product/card text must remain owned by its media/item; no detached metadata.

## Interaction contract

- Search/filter/quick-add/PDP selection/Bag behavior must remain unchanged unless a real defect is found.
- Selected color/size uses oxblood signal + shape/border cue, not color alone.
- Primary purchase action uses near-black by default; oxblood is not painted across every button.
- Focus-visible remains obvious and must not depend on subtle color difference only.

## System reality

| Capability | Reality |
|---|---|
| Products / filter / search | `STATIC` local data |
| Saved / Bag / local order state | `REAL` browser-local behavior |
| Stock / availability | `SIMULATED` / local |
| Checkout / payment | `SIMULATED` |
| Account / recovery | `PARTIAL` / simulated |
| Analytics downstream | `UNKNOWN` |

No V14 visual success state may imply server/payment/fulfilment success.

## Responsive scope

`desktop_only`

- 1363×936 is DUE NOW.
- Desktop pressure widths are DUE NOW when renderer allows.
- Mobile/tablet = `N/A_JUSTIFIED` for this run.
- Do not claim fully responsive.

## DO

- Concentrate boldness in campaign composition and media scale.
- Preserve page-role diversity.
- Keep product decision information fast and legible.
- Use oxblood as a limited brand/action signal.
- Keep shop/PDP commerce-first despite luxury art direction.
- Preserve existing behavior and URLs.

## DO NOT

- Do not make the whole site black.
- Do not turn every page into the Home campaign composition.
- Do not use gold/glass/gradient as luxury shorthand.
- Do not enlarge whitespace until first-viewport utility disappears.
- Do not create fake scarcity or luxury service promises.
- Do not call the project mobile responsive in this phase.

## Visual taste calibration

- Memorable commitment: porcelain/noir/oxblood + runway indexing + oversized garment media.
- KEEP: V13 hard-rule system, full-garment imagery, compact metadata.
- REVISE: hero silhouette, equal-card rhythm, grid density, cobalt signal.
- REMOVE: visual decisions that could be transplanted unchanged to a generic SaaS/editorial template.

## Phase 1 gate

Research/reference synthesis, preserve/change boundary, structural delta, palette roles, page-role compositions and representative verification plan are concrete. No DUE-NOW blocker remains.

**PHASE 1 = PASSED.**
