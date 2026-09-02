# ATELIER V13 — Website Audit

**Audit date:** 2026-09-02  
**Scope:** whole-site substantial redesign  
**Project mode:** production-candidate static ecommerce prototype  
**Market brief:** Vietnam; young earners around 10–20 million VND/month  
**Evidence labels:** FACT, EVIDENCE-BACKED INFERENCE, PROFESSIONAL HYPOTHESIS, UNKNOWN

## Executive finding

The current site already has a recognizable monochrome editorial identity and a broad commerce flow, but its implementation owner is fragmented. `style.css` loads first, page HTML sometimes adds legacy V7/V10 sheets, then `main.js` removes some files and injects six V11/V12/media sheets at runtime. The production render proves this debt is user-visible: Shop can present an almost blank first viewport and the PDP can render an empty media column while product content changes asynchronously.

The V13 redesign must preserve the ATELIER mark, portrait-led fashion art direction, URLs, local catalogue and commerce behavior, while replacing the runtime stylesheet stack with one explicit visual owner and repositioning the brand from inaccessible luxury pricing to attainable premium fashion.

## Rendered OLD baseline

| Route / role | Viewport inspected | First anchor | Current silhouette | Material finding | Status |
|---|---:|---|---|---|---|
| `/` — brand orientation | 1363×936 | split copy + full-body portrait | 50/50 boxed hero | coherent, but familiar luxury split-shell and price/content do not fit the new audience brief | DONE_VERIFIED |
| `/shop.html` — catalogue | 1363×936 | intended two-image editorial hero | almost completely blank first viewport | P1: reveal/runtime stylesheet ownership hides the page purpose and delays catalogue discovery | DONE_VERIFIED |
| `/detailproduct.html?id=tailored-wool-blazer` — decision | 1363×936 | intended product media + purchase panel | blank media region + dense panel | P1: product media absent in the first viewport; title/data were observed changing out of sync with the requested URL | DONE_VERIFIED |
| `/collections.html` — editorial | 1363×936 | oversized serif statement | title band then image/copy split | readable but repeats a generic text-left/image-right chapter composition | DONE_VERIFIED |
| `/about.html` — trust/story | 1363×936 | oversized mixed-type statement + portrait | split manifesto hero | visually distinctive but still uses the same broad split grammar and no price/value bridge | DONE_VERIFIED |
| representative mobile baseline | out of scope | — | — | `N/A_JUSTIFIED` — the user explicitly narrowed the redesign and QA scope to desktop on 2026-09-02 | N/A_JUSTIFIED |

No OLD→NEW mobile delta claim will be made. Desktop at the connected 1363×936 viewport is the visual source of truth for this run.

## Page and function inventory

| Route family | User task | Decision | Redesign implication |
|---|---|---|---|
| Home | understand brand and enter a shopping path | IMPROVE | replace boxed split hero with a younger editorial poster/wardrobe entry composition; surface attainable price cues and current drop |
| Shop / search / filters | find a relevant piece quickly | IMPROVE | catalogue must begin in the first purposeful viewport; persistent result count, filter, sort and category context |
| PDP | evaluate product, size, material, delivery and price | IMPROVE | media-first decision object; truthful price/value and complete garment view; persistent desktop decision panel |
| Collections | understand a drop and shop it | IMPROVE | lookbook chapters must connect directly to products and styling use-cases |
| The House | understand the point of view and trust the brand | IMPROVE | retain authored voice; add concrete design/wardrobe principles without inventing company history |
| Saved / Bag | resume and verify choices | IMPROVE | compact transaction rows, obvious variants, transparent totals and recovery |
| Checkout | complete local prototype purchase | IMPROVE | distraction-reduced family; keep simulated/local reality explicit in documentation and success copy |
| Confirmation / Order | understand recorded local order and next step | IMPROVE | do not imply payment capture, fulfillment or live tracking |
| Size / Care / Shipping / Contact | reduce purchase risk | IMPROVE | task-first service index and scannable evidence, not editorial filler |
| Login / Account / Recovery | access local prototype state | IMPROVE | label limitations truthfully; never imply a server account system |
| Privacy / Terms | reference | INTENTIONALLY PRESERVE | align typography/navigation only |

## Owner goal ↔ user goal

| Owner wants to prove | User wants to decide/do | Intersection | Website responsibility | CTA timing |
|---|---|---|---|---|
| ATELIER feels premium and authored | “Can I realistically wear and afford this?” | attainable luxury through restraint, styling and product clarity | show price, use-case, fit and material early | after price/product evidence |
| The collection has a point of view | “Which pieces work for my office, weekend or evening?” | shoppable wardrobe edits | connect editorial frames to real products | after the look/use-case is understood |
| The site demonstrates commerce | “Did my action actually happen?” | honest prototype interaction | preserve local state and never fake backend/payment success | at each confirmed local state |

## Primary audience and top tasks

| Audience by context | Trigger | Barrier | Top task | Success |
|---|---|---|---|---|
| salary-conscious style seeker | payday, social inspiration, office/event need | luxury presentation appears financially out of reach | find a statement or foundation piece within a defensible budget | shortlist a piece and understand total cost |
| discovery-led browser | Home/collection/social link | editorial can feel remote or unshoppable | translate mood into a wearable look | reach a relevant PDP |
| intent-led shopper | search, Shop or direct PDP | fit, crop, material and availability uncertainty | compare and choose confidently | valid variant added to Bag |
| returning shopper | Saved/Bag/direct return | lost context or unclear state | resume the decision | continue without rebuilding selection |

## KEEP / IMPROVE / REMOVE / ADD

### KEEP

- ATELIER wordmark/monogram and monochrome base.
- Portrait fashion imagery with full-body garment context.
- Existing URLs, VND formatting and internal links.
- Local JSON catalogue, filter/sort/search, Saved, Bag and local Orders.
- Serif as a controlled editorial accent.
- Current product/service facts that are supported in source.

### IMPROVE

- Price architecture to align with the explicit 10–20M VND/month audience brief.
- Home journey from brand mood to shoppable price/value evidence.
- PLP first viewport, filters and product-card ownership.
- PDP media reliability, product identity synchronization and purchase hierarchy.
- Desktop navigation, filtering, media ownership and purchase hierarchy.
- English copy clarity and reduction of luxury clichés.

### REMOVE

- Runtime injection/removal of V9–V12 stylesheets.
- Legacy version classes used only to preserve successive patch layers.
- Artificial blank space used as a luxury signal.
- Universal `copy-left / image-right` reliance across unrelated roles.
- Prices equivalent to one to several months of the stated target income.

### ADD

- A single explicit V13 design owner.
- “Wardrobe by moment” routes: Workday, After Hours, Weekend.
- Price/value cues on Home and collection bridges.
- Product-card badges only when factual (New, Low stock from local data).
- Desktop persistent purchase/filter actions and visible applied-filter recovery.
- Regression assertions for first-viewport visibility, PDP product/media synchronization and one-owner CSS.

## Technical/design debt owners

| Finding | Root owner | Impact | Priority |
|---|---|---|---:|
| six stylesheets injected by `main.js` after document load | `main.js` + legacy CSS stack | flash/drift, hidden reveal states, ambiguous cascade | P1 |
| some HTML still links V7/V10 files while JS removes them | page heads + `ensureDesignOwner()` | inconsistent initial and final render | P1 |
| Shop first viewport can be blank | reveal state + V12 hero owner | page purpose and product discovery fail | P1 |
| PDP requested product and rendered presentation can desynchronize | PDP fallback markup + async renderer | trust and purchase-decision defect | P1 |
| product price band contradicts new audience brief | catalogue data + content direction | relevance/conversion mismatch | P1 |
| duplicated version selectors/classes | V9–V12 CSS | maintenance and regression risk | P2 |

## Preserve / migration boundary

No route or slug is removed. SEO metadata, canonical intent, sitemap and GitHub Pages relative assets are preserved unless a specific replacement is documented. V13 is an in-place visual/experience architecture change, not a URL migration.
