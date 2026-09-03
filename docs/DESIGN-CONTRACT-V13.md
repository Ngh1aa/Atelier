# ATELIER V13 — DESIGN CONTRACT

> This contract is the Prompt 1 handoff. Production code may not be changed until every Prompt 1 hard gate is either `DONE_VERIFIED` or explicitly `N/A_JUSTIFIED`.

## Project truth

- Existing static HTML/CSS/JS ecommerce prototype hosted on GitHub Pages.
- Market context in source: Vietnam, VND, English UI.
- User instruction adds a material audience constraint: young earners around 10–20M VND/month.
- Official brand guideline: UNKNOWN. Brand source status **C — logo + existing first-party assets, no official brand book**.
- Existing monogram, monochrome system and product imagery are `VERIFIED_FROM_OFFICIAL_ASSET` within this repository.
- V13 typography, cobalt action role and price architecture are `PROPOSED_FOR_DIGITAL`, not official brand facts.

## Business goal and conversion

Primary goal: make ATELIER feel authored and premium while helping the stated audience discover, evaluate and complete a local prototype purchase without the brand appearing financially irrelevant.

Primary conversion: `Discover → narrow → PDP → choose variant → Bag → local guest checkout → local confirmation`.

## Design DNA

**Signature sentence:** With the logo hidden, ATELIER is recognizable through an ink-and-ivory editorial grid, full-garment portrait frames, bracket/rule annotations and a single cobalt action signal.

Concrete attributes:

1. **Attainable, not cheap:** premium through edit, fit, image discipline and service clarity—not inflated prices or fake scarcity.
2. **Young, not juvenile:** decisive sans typography, compact labels and cobalt interaction signals.
3. **Editorial, not obstructive:** one authored visual anchor per role; catalogue/decision tasks stay immediately usable.
4. **Sharp, not sterile:** hard rules and asymmetry, balanced by ivory surfaces and controlled serif phrases.
5. **Truthful, not theatrical:** local/static/simulated system reality remains explicit.

## Semantic roles

| Role | Value | Status | Allowed | Prohibited |
|---|---|---|---|---|
| page / ivory | `#F5F2EA` | PROPOSED_FOR_DIGITAL | Home, House, editorial surfaces | form error/success meaning |
| catalogue / white | `#FFFFFF` | PROPOSED_FOR_DIGITAL | PLP/PDP media and utility surfaces | pretending every page is identical |
| ink | `#111111` | PROPOSED_FOR_ACCESSIBILITY | primary text, primary action | disabled/muted text |
| muted | `#68645E` | PROPOSED_FOR_ACCESSIBILITY | metadata and secondary copy | essential labels below contrast target |
| rule | `#CEC9BE` | PROPOSED_FOR_DIGITAL | alignment, groups, rhythm | decorative boxed-card overload |
| cobalt signal | `#244BFF` | PROPOSED_FOR_DIGITAL | link/focus/current/primary action accent | large section backgrounds or every heading |
| error | `#A12E2E` | PROPOSED_FOR_ACCESSIBILITY | validation/error only | promotion |
| success | `#2B664B` | PROPOSED_FOR_ACCESSIBILITY | confirmed local state | implying backend success |

## Typography and shape

- UI/display: Inter with system fallback; Vietnamese glyph support required.
- Editorial accent: Playfair Display only for selected words, pull-lines and collection titles.
- H1: sans-led `clamp(3rem, 7vw, 7.5rem)`, role-specific max line length.
- Body: 15–17px, 55–68ch max.
- Radius: 0–2px; no rounded SaaS cards.
- Elevation: no routine box shadows; hierarchy comes from crop, rules, spacing and contrast.

## Page-role composition matrix

| Role | First visual anchor | Top composition | Decision object | CTA | Desktop behavior |
|---|---|---|---|---|---|
| Home / orientation | edge-to-edge portrait poster with offset manifesto rail | 7/5 asymmetric editorial stage, not a boxed 50/50 split | three wardrobe moments + price/value entry | Shop the edit | campaign remains dominant; wardrobe moments stay visible directly below the first stage |
| Shop / catalogue | compact title + live result/controls | utility bar above product grid; no full hero delay | product grid/filter/sort | View product / quick size | title, result count and controls appear before the first product row |
| PDP / decision | complete garment media | 60/40 gallery/purchase with persistent decision panel | image, price, fit, size, material, delivery | Add to Bag | purchase panel remains readable beside complete-garment media |
| Collections / lookbook | numbered look frame | staggered chapter rail connected to products | shoppable look/use-case | Shop this moment | chapters alternate intentionally and connect directly to product rails |
| House / trust | manifesto index + image atlas | text-led statement then 3-code visual index | house codes / current edit | Explore the edit | statement and code index create a silhouette distinct from Home/Collections |
| Service / support | task index | compact directory and disclosure rows | size/care/delivery/contact answer | contextual return to shop/PDP | answers are scannable without decorative hero delay |
| Bag / Saved | item ledger | transaction rows + summary | variant/quantity/total | Checkout | item edits and summary remain simultaneously visible when space permits |
| Checkout | progress + form | single task column + stable summary | required fields and final total | Record local order | form and summary dominate; global editorial distraction is reduced |
| Account / Order | state ledger | status facts + recovery actions | local order/account reality | service/continue | status, limits and recovery actions stay visible without wide tables |

Required composition families: **Editorial Orientation, Catalogue Utility, Product Decision, Story/Lookbook, Transaction/Service**.

## Representative composition proofs

### Home — poster + wardrobe moments

```text
DESKTOP
┌──────────── portrait campaign 7/12 ───────────┬── manifesto / CTA 5/12 ──┐
│ full garment; focal safe                       │ ATELIER  /  DROP 02       │
│                                                │ MADE FOR YOUR ACTUAL WEEK │
│                                                │ Shop the edit             │
└────────────────────────────────────────────────┴──────────────────────────┘
 Workday 01  |  After Hours 02  |  Weekend 03  |  pieces from 990K
```

### Shop — catalogue-first

```text
NEW IN / 12 PIECES                    [FILTER 0] [SORT]
Workday → After Hours → Weekend
────────────────────────────────────────────────────────
PRODUCT  PRODUCT  PRODUCT  PRODUCT
name     name     name     name
price    price    price    price
```

### PDP — media/decision

```text
MAIN FULL-GARMENT MEDIA  | name / price
thumbnail rail           | colour / size / fit
                         | ADD TO BAG
                         | delivery / returns / material
```

## Redesign Delta Contract

| Role | Current recognizable structure | V13 intended structure | Must visibly disappear/change | Verification |
|---|---|---|---|---|
| Home | boxed 50/50 split hero | edge-to-edge poster + manifesto rail + wardrobe moments | boxed border shell and generic luxury split | OLD/NEW 1363×936 proof |
| Shop | large reveal-dependent hero; currently blank first viewport | compact utility-led catalogue | blank opening and delayed grid | first viewport contains purpose, count and controls |
| PDP | blank/unstable gallery + dense right panel | reliable complete-garment media + synchronized decision panel | empty media column and stale fallback title | URL product, title, price and image agree before visual PASS |
| Collections | alternating image/copy split chapters | indexed shoppable lookbook | universal alternating split rhythm | contact sheet silhouette differs from House/Home |
| House | split headline/image hero | manifesto index + image atlas + codes | reusable 50/50 hero shell | logo-hidden signature and distinct silhouette |
| Checkout | general site skin around a form | distraction-reduced transaction family | campaign/editorial noise | form/summary are dominant first anchors |

## Media / focal-point contract

| Family | Intent | Ratio | Fit | Focal ownership | Safe crop | Desktop rule | Verification |
|---|---|---:|---|---|---|---|---|
| Home campaign | show full look + attitude | 5:7 / source-aware | contain or safe cover | head + complete primary garment | never cut face/garment | focal position is asset-owned, not universal center | 1363×936 screenshot |
| PLP cards | compare garments consistently | 3:4 | contain | garment silhouette | normalize perceived scale by asset token | consistent four-column desktop rhythm | 4–8 card contact review |
| PDP main | decision completeness | 4:5 | contain | whole product/look | no dramatic crop | complete garment precedes detail crops | URL/image/title sync + screenshot |
| thumbnails | image recognition | 3:4 | cover/contain by source | recognizable look | may crop whitespace, not product | vertical or horizontal rail must not collapse media | visible subject in every thumb |
| Collections | editorial use-case | source-aware 4:5/3:4 | contain/safe cover | person + silhouette | asymmetry from layout, not destructive crop | one dominant look per chapter | chapter contact sheet |
| Related | quick comparison | 3:4 | contain | garment | same family scale tokens as PLP | four-column desktop rail | item ownership visible |

Highest-risk assets: waist-cropped `belted-cropped-jacket`, mixed two-model product sources, extra-tall `home-editorial`, and tightly framed feedback images. Asset-level metadata must replace `nth-child` crop patches.

## Price/value contract

Based on the explicit audience constraint and observable Vietnam accessible-premium peers, V13 working catalogue band is:

- entry/top: 890K–1.49M VND;
- foundation/bottom: 1.29M–2.29M VND;
- tailoring/outerwear: 2.49M–4.49M VND;
- no fake crossed-out price, countdown or scarcity.

This is a user-directed product-positioning change in a static prototype, not a claim about a real inventory system.

## System reality

| Capability | Reality | Contract |
|---|---|---|
| products, filters, search | STATIC/local JSON | usable locally; not live inventory |
| cart, saved, orders | REAL browser-local behavior | persists on the device only |
| stock/variants | SIMULATED/local | do not claim warehouse availability |
| checkout/payment | SIMULATED | order is recorded locally; no payment capture |
| login/account/recovery | SIMULATED/PARTIAL | no server identity or email recovery claim |
| analytics | PARTIAL | dataLayer emission exists; downstream collection UNKNOWN |

## Desktop viewport contract

- Visual source of truth: 1363×936, matching the connected browser and OLD baseline.
- Desktop pressure review: 1024, 1363/1440 and 1920 when the available renderer supports it; 1363×936 remains the mandatory evidence viewport.
- No horizontal overflow or clipped primary text/media at desktop widths.
- Reduced motion must leave every `.reveal` element visible immediately.
- Mobile/tablet transformation and screenshots are `N/A_JUSTIFIED` for this run because the user explicitly requested desktop focus on 2026-09-02.

## DO / DO NOT

### DO

- Make catalogue and price/value evidence available early.
- Use different first anchors for page roles.
- Keep full garments and item ownership intact.
- Consolidate the visual cascade under one explicit owner.
- Preserve URLs and local commerce behavior.

### DO NOT

- Do not create V13 as another injected override file.
- Do not use high prices as a proxy for luxury.
- Do not make Home, Collections and House interchangeable split heroes.
- Do not fake availability, account, payment or fulfillment.
- Do not claim mobile/tablet coverage; it is intentionally outside this run.

## Prompt 1 gate

Desktop research, reference synthesis, page-role proofs, delta contract and media contract are complete. Mobile/tablet requirements are explicitly `N/A_JUSTIFIED` under the user’s scope override. **PROMPT 1 RESULT = PASSED (DESKTOP SCOPE)**; representative-page implementation is authorized.
