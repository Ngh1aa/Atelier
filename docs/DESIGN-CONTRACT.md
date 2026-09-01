# ATELIER — DESIGN CONTRACT

> Prompt 1 / pre-design research artifact. This file locks the design direction for the next implementation prompt.
>
> **NO-CODE GATE:** production HTML/CSS/JS is intentionally unchanged by this phase. Prompt 2 must implement this contract rather than re-invent a generic visual direction.

**Project:** Atelier  
**Repository:** https://github.com/Ngh1aa/Atelier  
**Research date:** 2026-09-01  
**Project mode:** substantial redesign of an existing static ecommerce prototype  
**Market currently evidenced in source:** Vietnam (VND catalogue; English UI)  
**Brand guideline:** UNKNOWN  

---

## 1. Evidence discipline

Material decisions in this contract use these labels:

- **FACT** — directly supported by supplied/current project source or first-party reference.
- **EVIDENCE-BACKED INFERENCE** — conclusion derived from multiple project/reference signals.
- **PROFESSIONAL HYPOTHESIS** — proposed direction requiring later user/business validation.
- **ASSUMPTION** — needed to proceed but not established as truth.
- **UNKNOWN** — insufficient evidence; Prompt 2 must not fabricate it.

Brand-specific statuses additionally use:

- `VERIFIED_FROM_OFFICIAL_ASSET`
- `INFERRED_FROM_OFFICIAL_ASSETS`
- `PROPOSED_FOR_DIGITAL`
- `PROPOSED_FOR_ACCESSIBILITY`
- `UNKNOWN`

---

## 2. Updated skills_UIUX graph actually used

The research intentionally used a minimal graph from the current `Ngh1aa/skills_UIUX` repository rather than loading every skill.

| Skill | Status | Decision materially changed by it |
|---|---|---|
| `website-delivery-pipeline` | USED | Enforced Design Contract + no-code gate + 3+ composition families before rollout. |
| `project-context` | USED | Checked project-specific source first; `.uiux-profile.json` is absent, so no project truth was invented. |
| `website-audit-and-redesign` | USED | Added preserve/change/remove/add, page-family monotony audit and visible redesign delta. |
| `audience-intent-and-top-tasks` | USED | Defined users by visit context/task rather than demographics. |
| `entry-context-and-visit-intent` | USED | PDP, Shop and utility pages are treated as valid entry pages, not downstream-only pages. |
| `information-architecture` | USED | Mapped content/functions to page roles and navigation responsibility. |
| `journey-driven-content-and-layout` | USED | Section order is based on question → evidence → decision → action. |
| `brand-guidelines` | USED | Classified brand source as C; separated logo evidence from proposed digital roles. |
| `design-reference-research-and-benchmark` | USED | References are assigned jobs by page role; no site is treated as a master template. |
| `ecommerce-website` | USED | Locked discover → filter → PDP → bag → checkout → post-purchase journey and product-decision evidence. |
| `real-world-artifact-and-domain-metaphor-design` | USED | Fashion artifacts (pattern sheet, garment label, lookbook) are limited to L1–L2 cues, not literal skeuomorphism. |
| `brand-distinctiveness-and-visual-signature` | USED | Distinctiveness must survive the logo-hidden test. |
| `visual-design-direction` | USED | Locked layout grammar, composition families, proofs and anti-template rules. |
| `responsive-and-device-strategy` | USED | Mobile is a transformed composition, not a stacked desktop screenshot. |
| `system-reality-and-production-readiness` | USED | Local/static/simulated commerce states are explicitly labelled. |

---

# PROJECT TRUTH

## 3. Current product/site truth

| Information | Finding | Status | Design implication |
|---|---|---|---|
| Website type | Premium fashion ecommerce prototype / portfolio-grade storefront | FACT | Must combine editorial desire-building with very clear shopping utility. |
| Technical base | Static HTML/CSS/JS; product catalogue loaded from local JSON | FACT | Prompt 2 should improve the existing architecture rather than invent backend capabilities. |
| Currency | VND | FACT | Preserve localized VND formatting and Vietnam purchase context. |
| Product attributes | Name, category, collection, price, images, sizes, description, fit, material, care, origin | FACT | PDP has enough real data to become much more decision-oriented without fabricating content. |
| Product state | Color/size variants and stock are generated or sourced locally | FACT | Availability is local prototype state, not live inventory. |
| Cart / Saved / Orders | Stored in `localStorage` | FACT | Preserve state behavior but label production reality accurately. |
| Analytics | Events are pushed to `window.dataLayer` | FACT | Event emission exists; downstream analytics collection is UNKNOWN. |
| Current visual system | Black background, white type, Playfair Display headings, Inter body, uppercase headings, broad letter spacing | FACT | This is recognizable but over-applied; utility pages inherit a fashion-editorial treatment even when the task differs. |
| Logo | Geometric `AT` monogram SVG using `currentColor` | FACT | Geometry can inform fine-line/precision cues; logo provides no verified brand color. |
| Official brand guideline | Not found in repo or supplied inputs | UNKNOWN | Do not call any new palette/type/tone “official”. |
| `.uiux-profile.json` | Not present | FACT | Current source + supplied prompt + verified references are the working truth. |

## 4. Business goal / primary conversion

### Primary business goal

**EVIDENCE-BACKED INFERENCE:** Present Atelier as a credible premium fashion house **and** enable a user to move from product discovery to a completed prototype order with low decision friction.

### Primary conversion

`Product selection → valid variant → Bag → guest checkout → local order confirmation`

Because the project is static, the conversion is a **SIMULATED/local prototype purchase**, not a verified real-world transaction.

### Secondary goals

- Encourage collection/product exploration.
- Increase product-detail confidence before Add to Bag.
- Support Save for Later / returning purchase consideration.
- Make Client Services content (size, care, shipping/returns) reduce purchase risk.
- Make post-purchase order state understandable within the prototype.

| Business goal | Website responsibility | User action | Signal |
|---|---|---|---|
| Express an authored premium fashion identity | Use distinctive editorial composition and art direction without obscuring commerce | Explore collection / product | Collection/PDP depth |
| Convert interest into purchase intent | Surface price, fit, size, material, availability, delivery/returns before commitment | Select variant / Add to Bag | `add_to_cart` |
| Reduce abandonment | Preserve context, cart state and transparent checkout steps | Complete checkout | `purchase` event / local order created |
| Retain consideration | Make Saved state obvious and recoverable | Save / revisit | wishlist state |
| Build trust | Put relevant service evidence close to decision points | Read size/care/shipping policy | service content engagement |

---

# AUDIENCE / ENTRY CONTEXT / TOP TASKS

## 5. Primary audience groups

These are task/context groups, not demographic personas.

| Audience | Trigger / entry context | Motivation | Main barrier | Top task | Success |
|---|---|---|---|---|---|
| Intent-led shopper | Search, Shop, direct PDP, saved link | Find a suitable piece and know whether to buy it | Fit/size/material/availability uncertainty | Narrow products and evaluate one item | Confident variant selection |
| Discovery-led fashion browser | Home, collection/editorial entry | Understand the collection and find a silhouette/product worth exploring | Brand story can become decorative and unshoppable | Move from visual inspiration to real products | Opens relevant collection/PDP |
| Returning consideration shopper | Saved, Bag, direct return | Resume a previous decision quickly | Lost state or unclear variant availability | Review saved/bagged items and continue | Returns to PDP/checkout without rebuilding context |
| Checkout-ready shopper | Bag / Checkout deep link | Finish purchase with minimal distraction | Long form, unclear costs/reality, unnecessary navigation | Provide delivery/payment details and review | Order confirmation |
| Post-purchase prototype user | Confirmation / order / account | Understand what happened and what comes next | Local simulated state can look more real than it is | Review order/status/support options | Understand order state and limits |

## 6. Top tasks

| Priority | User task | Main question | Evidence needed | Next action |
|---:|---|---|---|---|
| 1 | Decide whether a product is right | “Will this fit me, what is it made from, and is my variant available?” | True-color imagery, fit, sizes, material, stock state, size guide | Add to Bag |
| 2 | Find a relevant product quickly | “Which pieces match category/size/color/collection?” | Useful filters, count, applied-filter state, concise product cards | Open PDP |
| 3 | Understand the collection without losing shopping momentum | “What makes this edit/collection distinct and what can I buy from it?” | Art-directed story connected to shoppable products | Shop collection/look |
| 4 | Finish checkout confidently | “What information is required, what will I pay, and what happens next?” | Clear steps, order summary, transparent payment/delivery reality | Place prototype order |
| 5 | Reduce sizing/care/delivery risk | “Can I choose the correct size and maintain/return the item?” | Size guide, fit context, care, returns | Continue purchase |

---

# OWNER ↔ USER INTERSECTION

## 7. What the owner wants to show vs. what the user needs

| Owner wants to show/prove | User wants to know/do | Intersection | Website responsibility | Proof needed | CTA timing |
|---|---|---|---|---|---|
| Atelier is a premium, restrained fashion house | “Is this product genuinely worth considering?” | Premium expression through product quality evidence | Pair editorial art direction with concrete product facts | Material, fit, imagery, construction-oriented copy already present in catalogue | CTA after essential variant evidence is visible |
| Collections have a point of view | “Which pieces are relevant to me?” | Shoppable editorial narrative | Every collection story must resolve into products/looks | Collection imagery + product links | After the collection proposition is understood |
| The experience feels elevated | “Can I still find size, price, returns and checkout easily?” | Luxury through clarity and restraint, not obscurity | Keep controls quiet but conventional and discoverable | Clear price, size, filter, delivery, returns | At natural decision points |
| The site demonstrates a full commerce journey | “Is this action real and what will happen?” | Honest prototype behavior | Never imply a real payment/order backend | Reality labels in implementation docs; truthful copy in UI | Before final commitment |

**Core rule:** editorial design creates desire; commerce design reduces decision risk. Neither layer is allowed to hide the other.

---

# PRIMARY JOURNEY

## 8. Journey contract

`Entry → Orientation → Explore/Search → Narrow → PDP Evaluate → Variant Decision → Bag → Checkout → Review → Local Confirmation → Order/Service`

| Stage | Main question | Required content/proof | Interaction | CTA |
|---|---|---|---|---|
| Entry | “Where am I and is this relevant?” | Page-specific title/object, collection/product context | Search/nav/category routing | Contextual next step |
| Exploration | “What is available?” | Products/collections with enough scan information | Browse/search | View product/collection |
| Narrowing | “How do I reduce the set?” | Size, color, category, collection/status where real | Filter/sort + applied state | View filtered results |
| Evaluation | “Is this item right?” | True-color imagery, price, fit, material, size, stock, delivery/returns | Gallery + variants + information sections | Add to Bag |
| Bag | “Is my selection correct?” | Product, variant, quantity, totals | Edit/remove/save | Checkout |
| Checkout | “What do you need and what happens?” | Contact, address, delivery, payment mode, summary | Single-column form + visible summary | Review / Place order |
| Confirmation | “Was it recorded and what next?” | Order ID, local status, payment instruction if relevant | Track/order view | View order / continue shopping |
| Post-purchase | “How do I manage it?” | Local order detail + service routes | Order/support actions | Appropriate service action |

CTA must follow evidence. Do not put stronger conversion pressure before the user sees critical product decision information.

---

# IA / PAGE ROLES

## 9. Working sitemap and role model

Preserve current URLs unless a later SEO/migration decision explicitly changes them.

| Current route | Page role | Primary task | Primary CTA | Decision |
|---|---|---|---|---|
| `index.html` | Brand orientation + discovery | Understand Atelier and enter relevant collection/product path | Shop / Discover collection | IMPROVE |
| `shop.html` | Product finding / listing | Browse, filter, sort | View product | IMPROVE |
| `detailproduct.html` | Product decision | Evaluate and choose variant | Add to Bag | IMPROVE |
| `collections.html` | Curated discovery | Understand collection and shop it | Shop collection/look | IMPROVE |
| `about.html` | House / trust / brand context | Understand the house and design point of view | Explore collections / services | IMPROVE |
| `favourite.html` | Saved consideration | Resume saved products | View product / Add to Bag | IMPROVE |
| `cart.html` | Transaction preparation | Verify selection and totals | Checkout | IMPROVE |
| `checkout.html` | Transaction | Complete guest prototype checkout | Place order | IMPROVE |
| `order-success.html` | Confirmation | Understand order result and next step | View order | IMPROVE |
| `order.html` | Post-purchase utility | Review local order state | Relevant support/continue | IMPROVE |
| `account.html` | Account/order utility | Access local account/order experience | View order | IMPROVE / reality check |
| `login.html` / `forgot-password.html` | Account access | Sign in/recover | Continue | IMPROVE / reality check |
| `size-guide.html` | Service evidence | Choose size confidently | Return to product | IMPROVE |
| `care-guide.html` | Service evidence | Understand product care | Return to product/shop | IMPROVE |
| `shipping&returns.html` | Service evidence | Understand delivery/returns | Continue shopping | IMPROVE |
| `contact.html` | Service/contact | Know available support path | Contact action supported by reality | IMPROVE |
| `privacy.html` / `terms.html` | Legal/reference | Read policy | — | KEEP / style-system alignment only |

### Navigation responsibility

**Primary:** New In / Shop / Collections / The House  
**Utility:** Search / Saved / Bag / Account  
**Service:** Size Guide / Shipping & Returns / Care / Contact  

Do not promote internal/legal pages into the same visual weight as shopping tasks.

### Deep-entry rule

Shop, PDP, Collections, Size Guide, Shipping & Returns, Saved and Order pages must provide sufficient orientation when entered directly. They may not depend on users having read Home first.

---

# PRESERVE / CHANGE / REMOVE / ADD

## 10. Preserve list

Prompt 2 must preserve unless there is a documented reason not to:

- Existing URLs/page files and internal link equity.
- Local product catalogue and real product attributes.
- VND formatting.
- Variant selection and stock-aware state logic.
- Cart / wishlist / orders persistence behavior.
- Search/filter URL-state behavior where already implemented.
- Existing image assets unless a verified better project asset replaces them.
- AT monogram asset.
- Useful product/service content: fit, material, care, origin, delivery/return language.
- Existing semantic/accessibility work that is already correct.
- Analytics event names unless a migration plan is documented.

## 11. Change

- Replace the **site-wide pure-black luxury template** with role-based surface behavior.
- Stop applying uppercase + wide tracking to all headings.
- Stop using one global editorial rhythm for discovery, listing, decision and checkout pages.
- Make Shop utility-led, not hero-led.
- Make PDP purchase-confidence-led, not effect-led.
- Make checkout distraction-reduced and form-effort conscious.
- Move service proof closer to product/checkout decisions.
- Consolidate repeated product-card and layout styling into system-level patterns during Prompt 2.
- Make mobile compositions deliberate rather than a simple vertical collapse.

## 12. Remove / demote

- Remove the PDP **“View True Colors”** grayscale/true-color gimmick as a prerequisite to seeing the product. Product imagery should default to true color.
- Remove generic decorative quotation content on Home if it cannot be traced to the brand/project source.
- Demote decorative copy blocks that repeat the same promise without advancing a user decision.
- Avoid newsletter/signup language unless a real form/integration exists; do not present a plain link as a functioning subscription mechanism.
- Avoid fake scarcity, countdowns, “only X left” persuasion unless the state is genuinely supported and ethically appropriate.

## 13. Add / strengthen

- Applied-filter overview with removable state.
- Category/collection shortcuts that use actual catalogue vocabulary.
- Product cards with sufficient scan evidence: name, price, relevant color/variant cue and availability/status only when real.
- PDP fit/size/material/service evidence positioned near the variant decision.
- Garment measurements only if real measurement data is added; do **not** fabricate it from generic size charts.
- Return-to-product affordance from Size/Care/Shipping content.
- Reduced-distraction checkout header and clearer progress/review structure.
- Empty/error/recovery states for product finding and local commerce flows.

---

# BRAND SOURCE STATUS + EVIDENCE

## 14. Brand classification

**C — LOGO AVAILABLE, NO BRAND GUIDELINE**

The supplied/current logo is a monochrome geometric AT monogram using `currentColor`. It supports geometry/precision cues but does **not** establish a brand palette, positioning, tone of voice or photography strategy.

### Brand evidence ledger

| Dimension | Finding | Status | Confidence | UI implication |
|---|---|---|---:|---|
| Logo | Geometric AT monogram, straight/square line ending | VERIFIED_FROM_OFFICIAL_ASSET | High | Use fine-line precision / alignment cues sparingly. |
| Logo color | `currentColor`; no inherent verified brand color | VERIFIED_FROM_OFFICIAL_ASSET | High | Do not claim black/white as official brand colors solely from SVG. |
| Existing digital palette | Black/white/grey | INFERRED_FROM_OFFICIAL_ASSETS | High | It is an existing site convention, not a formal guideline. |
| Existing typography | Playfair Display + Inter | INFERRED_FROM_OFFICIAL_ASSETS | High | Preserve as the safest working pair in Prompt 2 unless a verified brand font appears. |
| Existing photography | Fashion/editorial product imagery | INFERRED_FROM_OFFICIAL_ASSETS | Medium | Preserve image-first fashion communication; improve crop/role consistency. |
| Positioning / mission / values | Not established by supplied official brand material | UNKNOWN | — | Prompt 2 must not invent brand claims. |

## 15. PROPOSED BRAND GUIDELINE — LOGO-DERIVED / EXISTING-ASSET-DERIVED

This is a **working digital proposal**, not official brand identity.

### Proposed visual direction name

**ATELIER — Editorial Pattern-Cut Modernism**

Meaning: editorial fashion restraint + tailoring precision + garment/pattern-sheet cues at low metaphor fidelity. It must feel authored and fashion-native without becoming a literal sewing/pattern theme.

### Concrete visual attributes

1. **Editorial restraint** — large imagery and deliberate whitespace, but not empty decorative sections.
2. **Tailoring precision** — thin rules, measured alignment, numbered/meta details, exact grid behavior.
3. **Tactile material clarity** — true-color imagery and material/fit copy treated as premium evidence.
4. **Authored asymmetry** — selective offset magazine composition on discovery pages; not random masonry.
5. **Low-chrome commerce utility** — filters, variants and forms remain conventional and highly legible.
6. **Quiet contrast** — light paper-like shopping surfaces balanced by controlled dark editorial moments.

### Logo-hidden recognition sentence

> If the logo is removed, Atelier should still be recognizable through a warm paper/ink surface system, precise fine rules and numbering, editorial image crops, selective serif moments, restrained sans-serif commerce UI, and pattern-cut grid asymmetry.

---

# SEMANTIC COLOR ROLES

## 16. Working color contract

No decorative accent color is invented as a new “brand color”. Distinctiveness must come primarily from composition, type behavior and imagery.

| Role | Proposed value | Status | Usage |
|---|---|---|---|
| Page Background / Paper | `#F4F1EA` | PROPOSED_FOR_DIGITAL | Main shopping/service background. |
| Light Surface / Chalk | `#FBFAF6` | PROPOSED_FOR_DIGITAL | Product info, form, utility surfaces. |
| Text / Ink | `#11110F` | PROPOSED_FOR_DIGITAL | Primary text and primary light-surface action. |
| Dark Surface / Ink | `#11110F` | PROPOSED_FOR_DIGITAL | Controlled editorial/House/footer zones; not every page. |
| Text Inverse | `#F7F4ED` | PROPOSED_FOR_DIGITAL | Text on dark editorial surfaces. |
| Secondary Text / Graphite | `#6E6962` | PROPOSED_FOR_DIGITAL | Secondary copy/meta with contrast validation. |
| Border / Stone | `#D8D2C7` | PROPOSED_FOR_DIGITAL | Fine rules/dividers. |
| Primary Action | `#11110F` on light | PROPOSED_FOR_DIGITAL | Add to Bag / checkout / key actions. |
| Inverse Action | `#F4F1EA` on dark | PROPOSED_FOR_DIGITAL | Rare dark-surface CTA. |
| Focus | `#3E5F9B` | PROPOSED_FOR_ACCESSIBILITY | Functional focus ring only; not a decorative brand accent. |
| Error | `#A33A35` | PROPOSED_FOR_ACCESSIBILITY | Validation/system error. |
| Success | `#2F6B4F` | PROPOSED_FOR_ACCESSIBILITY | Confirmed local success state. |
| Warning | `#8A6326` | PROPOSED_FOR_ACCESSIBILITY | Non-critical caution. |

### Prohibited color behavior

- Do not fill every section with black because “luxury”.
- Do not add gold/beige/burgundy as a luxury cliché without brand evidence.
- Do not use low-contrast grey for essential product/checkout information.
- Do not recolor the logo into a new accent and call it official.

---

# TYPOGRAPHY / MEDIA / SHAPE / MOTION

## 17. Typography contract

**Working families:** preserve `Playfair Display` + `Inter` because they are already part of the implemented identity; treat them as existing digital assets, not official brand fonts.

- **Inter:** navigation, body, commerce labels, product metadata, filters, forms, price, buttons.
- **Playfair Display:** campaign/collection display moments, selected editorial H1/H2, pull copy when source-backed.
- Do not uppercase every heading.
- Use letter spacing as a controlled meta/label device, not a universal luxury effect.
- Product name, price, size and service evidence must remain rapidly scannable.
- Mobile display type must reduce without forcing awkward 2–4 word line breaks.

## 18. Image direction

- Product/PDP imagery defaults to **true color**.
- Product grid imagery uses a stable principal ratio; 3:4 is preferred when source assets support it.
- Editorial discovery pages may use wider or offset crops, but never at the cost of subject recognition.
- Do not fabricate campaign shoots, materials, sustainability certifications or manufacturing evidence.
- Where one product has only one valid image, design for that reality rather than duplicating/faking gallery richness.

## 19. Shape / border / elevation

- Radius: predominantly square/near-square; no generic rounded-card system.
- Dividers: fine 1px rules aligned to the grid.
- Elevation: minimal. Prefer spatial separation, rule and surface contrast to card shadows.
- AT monogram may appear as a restrained seal/index cue in a few branded contexts, not repeated as decoration on every card.

## 20. Motion

Motion jobs only:

- reveal hierarchy;
- image/collection transition;
- state feedback;
- navigation orientation;
- filter/result feedback.

No motion may delay product information, interfere with scrolling, or hide controls. Honor `prefers-reduced-motion`.

---

# DOMAIN ARTIFACT INTELLIGENCE

## 21. Fashion-native artifacts

Selected artifact family: **pattern sheet / garment label / editorial lookbook**.

| Artifact | Transfer | Fidelity | Keep | Do not copy |
|---|---|---|---|---|
| Garment pattern sheet | Structural + form cue | L1–L2 | alignment lines, numbering, measured rhythm, annotated meta | literal sewing diagrams behind every section |
| Garment label | Information cue | L1 | compact material/care/origin hierarchy | fake certification badges / legal-looking stamps |
| Fashion lookbook | Structural/editorial | L2 | image sequence + shoppable product relation | image-only storytelling with hidden price/CTA |

**Reason:** these cues are domain-native and support product information hierarchy while helping the site escape the generic “black luxury ecommerce template”.

---

# REFERENCE BENCHMARK

## 22. Reference source hierarchy

Production/category sources are used for UX/task evidence; their visual surfaces are **not** copied.

### Final references by job

| Reference | Page/state inspected | Job | Principle to transfer | Do NOT copy |
|---|---|---|---|---|
| TOTEME | Home/collections, New In, PDP | Editorial-commerce integration + PDP confidence | Quiet editorial modules remain shoppable; PDP surfaces fit, measurements, materials/traceability and returns around the product decision | TOTEME-specific typography, product identity or exact layout |
| LEMAIRE | Home/navigation/services | Brand universe + commerce coexistence | Product categories and cultural/brand content can coexist without hiding services/shipping/payment trust | Their branded bag taxonomy or exact menu styling |
| Jil Sander | Home + Women New Arrivals | Fashion category hierarchy + clear PLP filters | Seasonal art direction can lead into a conventional, scannable product-finding interface | Their exact campaign shells/category system |
| COS | Women New Arrivals | Merchandising inside PLP | Editorial modules can interrupt a product grid selectively while preserving filter/sort and product scan | Overuse of branded editorial inserts in an 8-item catalogue |
| ARKET | Women New Arrivals | Large catalogue clarity | Product count/category clarity + calm product finding | Scale patterns intended for hundreds of products when Atelier has a small catalogue |
| Baymard Institute | Filtering, PLP, PDP sizing, checkout | Research-backed UX constraints | Applied filters visible; mobile filter layer; size guidance important; guest checkout prominent; reduce visible form effort; keep order summary accessible | Treating every large-catalog recommendation as mandatory for Atelier regardless of catalogue size |

### Page-role reference matrix

| Atelier page role | User question | Reference job | Adaptation |
|---|---|---|---|
| Home / brand discovery | “What is Atelier and where should I begin?” | TOTEME + LEMAIRE | Campaign/editorial frame followed by clear shopping routes; no generic quote-first hero. |
| Collection | “What is this edit and what can I buy?” | TOTEME / Jil Sander | Look/collection narrative remains directly shoppable. |
| Shop / PLP | “How do I find a relevant item?” | Jil Sander + COS + ARKET + Baymard | No cinematic hero; compact context + count + filter/sort + product grid; only limited editorial interruption. |
| PDP | “Will this work for me?” | TOTEME + Baymard | True-color gallery; fit/size/material/delivery/returns near variant decision. |
| Checkout | “How do I finish safely and quickly?” | Baymard | Enclosed/minimal header, guest path, single primary form column, visible/collapsible order summary. |
| Service pages | “What policy/guidance reduces my risk?” | LEMAIRE + ecommerce conventions | Question-led text hierarchy and direct return to shopping context, not a fashion hero. |

---

# DESIGN DNA / PAGE-ROLE COMPOSITION

## 23. Layout grammar

- Desktop base grid: 12 columns; editorial pages may break alignment deliberately but must return to the grid.
- Commerce pages use stronger alignment and predictable utility zones.
- Max reading width for long service copy is constrained; product listing uses wider content canvas.
- Section rhythm comes from the user’s question sequence, not `heading → three cards → CTA` repetition.
- Repeated system cues: fine rules, index/meta labels, paper/ink surfaces, restrained type hierarchy, image crop discipline.

## 24. Required composition families

Atelier has materially different page jobs; Prompt 2 must implement **at least five** families. It may share tokens/components but not a universal hero shell.

### Family A — Brand / Editorial Discovery

**Pages:** Home, selected Collections, The House  
**First visual anchor:** art-directed fashion image/collection object  
**Top composition:** asymmetric editorial spread / image-led sequence with anchored copy  
**CTA:** contextual collection/shop path  
**Rule:** not a reusable `title + subtitle + button + background image` hero.

### Family B — Product Finding

**Pages:** Shop, search/results if present  
**First visual anchor:** product set + count/finding controls  
**Top composition:** short orientation row + category shortcuts + filter/sort + grid  
**CTA:** product selection  
**Rule:** **no large hero**.

### Family C — Product Decision

**Pages:** PDP  
**First visual anchor:** product gallery  
**Top composition:** image-dominant gallery + sticky/anchored purchase panel  
**Decision object:** color, size, fit, material, availability, price, delivery/returns  
**CTA:** Add to Bag  
**Rule:** no campaign hero before purchase evidence.

### Family D — Conversion

**Pages:** Bag, Checkout  
**First visual anchor:** selected order contents / transaction step  
**Top composition:** reduced chrome, explicit progress and summary  
**CTA:** Checkout / Place order  
**Rule:** global discovery navigation is reduced during checkout.

### Family E — Service / Trust

**Pages:** Size Guide, Care Guide, Shipping & Returns, Contact  
**First visual anchor:** user question / reference index  
**Top composition:** utility heading + answer categories/table/accordion where appropriate  
**CTA:** return to product/shop or supported contact action  
**Rule:** no fashion-image hero unless the image directly explains the service content.

### Family F — Account / Post-purchase Utility

**Pages:** Login, Account, Order, Confirmation  
**First visual anchor:** account/order state  
**Top composition:** compact utility shell  
**Rule:** clarify local/simulated reality; do not imply remote auth/order infrastructure if absent.

---

# REPRESENTATIVE COMPOSITION PROOFS

## 25. Proof A — Home / Brand Discovery

```text
┌────────────────────────────────────────────────────────────────────┐
│ Global nav: New In / Shop / Collections      Search Saved Bag     │
├───────────────────────────────────┬────────────────────────────────┤
│                                   │  01 / FALL 2026               │
│                                   │                                │
│       PRIMARY CAMPAIGN IMAGE      │  Collection-led statement      │
│       7–8 columns                 │  (source-backed, concise)      │
│                                   │                                │
│                                   │  Shop the collection  →       │
├───────────────────────────────────┴────────────────────────────────┤
│ NEW IN — product strip/grid with real price + direct product path │
├────────────────────────────────────────────┬───────────────────────┤
│ Editorial collection image                │ Material / silhouette │
│                                            │ story → products      │
├────────────────────────────────────────────┴───────────────────────┤
│ Collection routes / House / service confidence                     │
└────────────────────────────────────────────────────────────────────┘
```

**Mobile transformation:** image becomes first visual anchor; copy is anchored immediately after/over a protected image safe-zone; first shoppable route must appear early. No long decorative intro before products.

## 26. Proof B — Shop / Product Finding

```text
┌────────────────────────────────────────────────────────────────────┐
│ Nav                                                                │
├────────────────────────────────────────────────────────────────────┤
│ SHOP / NEW IN                         12 pieces                    │
│ Outerwear  Knitwear  Evening  Shoes  Accessories                  │
├────────────────────────────────────────────────────────────────────┤
│ FILTER  Category  Size  Color     Applied: Black ×   SORT         │
├────────────────────────────────────────────────────────────────────┤
│ Product      Product      Product      Product                      │
│ name / price name / price name / price name / price                │
│ Product      Product      Product      Product                      │
└────────────────────────────────────────────────────────────────────┘
```

**Mobile transformation:** 2-column product grid where image readability remains adequate; sticky `Filter & Sort` control; applied filters visible above results as horizontally scrollable/removable chips; filter opens dedicated overlay/bottom sheet with explicit result count/apply action.

## 27. Proof C — PDP / Product Decision

```text
┌───────────────────────────────────────┬────────────────────────────┐
│                                       │ Collection / category       │
│                                       │ PRODUCT NAME                │
│            TRUE-COLOR                 │ Price                       │
│            PRODUCT MEDIA              │ Short description           │
│            7 columns                  │ Color                       │
│                                       │ Size + Size guide           │
│                                       │ Fit evidence                │
│                                       │ Availability state          │
│                                       │ [ ADD TO BAG ]              │
│                                       │ Delivery / Returns          │
├───────────────────────────────────────┴────────────────────────────┤
│ Material / Care / Origin / related styling (source-backed only)   │
└────────────────────────────────────────────────────────────────────┘
```

**Mobile transformation:** product image first; product name/price/variant controls immediately follow; sticky bottom Add to Bag may appear only after required variant state is understandable; fit/size guide remains close to size selection; information sections collapse accessibly if needed.

## 28. Optional proof D — Checkout / Conversion

```text
┌────────────────────────────────────────────────────────────────────┐
│ ATELIER mark                                  Secure prototype flow │
├───────────────────────────────────────┬────────────────────────────┤
│ Guest checkout                        │ ORDER SUMMARY               │
│ Contact                               │ item / variant / qty        │
│ Delivery address                      │ subtotal / delivery / total │
│ Delivery method                       │                            │
│ Payment method (COD / transfer only)  │                            │
│ Review                                │                            │
│ [ PLACE ORDER ]                       │                            │
└───────────────────────────────────────┴────────────────────────────┘
```

**Mobile transformation:** single form column; summary available near the top as a collapsed panel and fully visible again before final action; no full discovery navigation competing with completion.

---

# SWAP / MONOTONY TEST

## 29. Hard visual gate

These screenshots must **not** be swappable by replacing title + image:

- Home top ≠ Shop top.
- Shop top ≠ PDP top.
- PDP top ≠ Checkout top.
- Service top ≠ Collection top.

If Prompt 2 produces five pages that all look like `nav + large heading + image + button`, implementation fails this contract even if typography/colors are correct.

Consistency comes from tokens, rules, typography behavior, fine-line/index cues and interaction language — **not** from one repeated shell.

---

# MOBILE TRANSFORMATION RULES

## 30. Mobile is a separate composition decision

- Prioritize **task object first**: Home image/route; Shop products/filter; PDP product/variant; Checkout form/summary; Service answer/index.
- Touch targets minimum ~44px where interactive.
- Hover-only behavior must have an equivalent touch/click path.
- Filter UI moves to a dedicated layer; selected state remains visible outside it.
- PDP decision panel becomes flow content; important Add to Bag state may become sticky after context is established.
- Checkout keeps one primary form column; avoid multi-column field layouts.
- Long editorial type and oversized headlines must be clamped to avoid excessive first-screen takeover.
- Reduced motion must be honored.

---

# SYSTEM REALITY

## 31. Capability matrix

| Capability | Current reality | Evidence / implication |
|---|---|---|
| Product catalogue | STATIC local JSON | Real within prototype; not CMS/live commerce feed. |
| Product filter/search | REAL front-end behavior over local catalogue where implemented | Keep useful state; no claim of backend search. |
| Variant availability | SIMULATED/PARTIAL | Some inventory may be explicit; fallback stock is generated in JS. Do not call it live stock. |
| Cart | REAL local front-end behavior | Persisted in `localStorage`; not server cart. |
| Wishlist/Saved | REAL local front-end behavior | Persisted in `localStorage`. |
| Order creation | SIMULATED local behavior | Order IDs/status are generated and stored locally. |
| COD / bank transfer selection | SIMULATED | No verified payment processing. |
| Card payment | NOT PRESENT | Do not add fake card fields or payment logos that imply integration. |
| Delivery date/window | SIMULATED client-side calculation | Present as estimate/prototype behavior, not carrier data. |
| Order tracking | PARTIAL / local | No verified carrier integration. |
| Account/authentication | UNKNOWN/PARTIAL until verified page-by-page | UI presence is not proof of authentication backend. |
| Analytics | PARTIAL | `dataLayer` push exists; receiver/analytics property is UNKNOWN. |
| Newsletter | UNKNOWN / likely non-integrated | Do not display success state without a real endpoint. |

### Prompt 2 truth rule

A rendered success toast/page is not evidence of backend success. Any new flow must remain truthful to this matrix.

---

# VISIBLE REDESIGN DELTA

## 32. What must visibly change

| Current visible problem | New design behavior | Why it matters | Verification |
|---|---|---|---|
| Nearly every page inherits black/dark luxury styling | Light paper-led commerce/service surfaces + controlled dark editorial zones | Page role becomes visible before reading | Compare Home, Shop, PDP, Checkout screenshots side-by-side |
| Uppercase/letter-spaced serif is overused | Serif reserved for authored editorial moments; utility uses legible sans hierarchy | Reduces template-luxury feeling and improves scan speed | Type hierarchy screenshot audit |
| Home begins as generic fashion statement/quote pattern | Collection/product-led editorial orientation | Connects brand expression to shopping intent | First 1–1.5 viewport review |
| Shop reads as “Our Products” + grid | Product-finding header, category context, count, filters, applied state | Supports the actual top task | Filter a product set and inspect state |
| PDP uses grayscale/“View True Colors” effect | True color by default; fit/material/service evidence gains prominence | Removes friction from evaluating a fashion item | PDP desktop/mobile screenshot + task check |
| Checkout keeps normal storefront chrome and broad form rhythm | Reduced-distraction transaction shell + clearer summary/progress | Reduces completion friction | Checkout desktop/mobile visual test |
| Multiple page roles can feel like the same template | 5–6 composition families share DNA but not hero shell | Substantial redesign is recognizable | Cross-page montage / swap test |

---

# VISUAL ACCEPTANCE CONDITIONS FOR PROMPT 2

## 33. Must be true before full rollout

1. **Representative-page-first:** implement and visually verify Home + Shop + PDP + Checkout before propagating system changes to all utility pages.
2. At least **5 composition families** above remain materially distinguishable.
3. No universal hero component is used for materially different page roles.
4. Brand source status remains C unless new verified brand material is supplied.
5. The proposed paper/ink palette is never presented as an official brand palette.
6. AT logo works on light nav, dark editorial surface, scrolled nav, mobile menu and footer without filter/invert hacks that destroy fidelity.
7. Shop exposes count/filter/sort and applied state without forcing a large hero.
8. PDP defaults to true-color product imagery and exposes fit/size/material/availability/service evidence before or immediately around conversion.
9. Checkout is visually enclosed/reduced-distraction and uses a single primary form column.
10. Mobile is reviewed as a transformed composition, not only a breakpoint.
11. No fabricated backend/payment/auth/newsletter success is introduced.
12. Cross-page screenshot montage passes the swap/monotony test.
13. Visible delta is in hierarchy/composition/journey/brand expression — not merely new colors, fonts, spacing or animation.

---

# DO / DO NOT

## 34. DO

- Use fashion editorial craft to guide discovery.
- Use conventional, clear commerce controls for product finding and purchasing.
- Keep price, size, fit, availability and returns easy to locate.
- Use thin pattern-sheet-like rules/indexing as an L1/L2 domain cue.
- Reuse current product facts and functionality.
- Make collection storytelling shoppable.
- Design service pages as trust/decision tools.
- Preserve URLs and useful state behavior.
- Validate light/dark logo states.
- Prefer one strong repeatable signature over many trendy effects.

## 35. DO NOT

- Do not equate luxury with all-black UI.
- Do not add gold/glass/gradient/3D merely to make it “premium”.
- Do not clone TOTEME, LEMAIRE, Jil Sander, COS or any other reference.
- Do not use one `hero + heading + cards` template everywhere.
- Do not hide commerce utility for editorial purity.
- Do not fabricate mission, sustainability proof, measurements, reviews, scarcity or certificates.
- Do not fabricate payment/auth/newsletter integrations.
- Do not make all headings uppercase/letter-spaced.
- Do not use decorative animations that delay product decisions.
- Do not treat build success as visual proof.

---

# IMPLEMENTATION RISKS FOR PROMPT 2

## 36. Risks to handle deliberately

- **Cross-page CSS debt:** existing shared CSS and page-local rules may conflict; Prompt 2 should consolidate root tokens/components rather than stack override layers.
- **Asset limitations:** many catalogue items currently have limited imagery. Composition must gracefully support one-image products.
- **Content truth:** do not invent premium-brand storytelling when source is absent; replace generic filler with concise product/collection language based on existing truth.
- **Static reality:** visually premium checkout/account states can easily imply backend capabilities that do not exist.
- **Responsive drift:** desktop editorial asymmetry must not become awkward mobile whitespace or hidden commerce controls.
- **Performance:** large editorial imagery must be responsive/lazy-loaded appropriately; do not add decorative media dependencies without value.

---

# PROMPT 2 HANDOFF

## 37. Implementation order

Prompt 2 must not restart visual research from zero. It should:

1. Read this file before editing.
2. Audit existing shared/page-local CSS and JS owners.
3. Create an implementation checklist mapped to this contract.
4. Implement shared tokens/navigation/product-card/form primitives needed by the representative pages.
5. Redesign **Home + Shop + PDP + Checkout first**.
6. Render/inspect desktop and mobile representatives.
7. Run the swap/monotony and visible-delta gates.
8. Fix the system at the owner layer, not with accumulating page patches.
9. Roll the validated design grammar into Collections, House, Saved, Bag, Service, Account/Post-purchase and Legal families.
10. Run full cross-page visual/interaction/responsive/accessibility/system-reality QA.

If the representative pages fail this contract, **do not continue rollout** merely to finish all HTML files.

---

# RESEARCH SOURCES

## 38. Project / skill sources

- Supplied `MASTER PRE-DESIGN RESEARCH PROMPT V3.0`.
- `https://github.com/Ngh1aa/skills_UIUX`
- `https://github.com/Ngh1aa/Atelier`
- Current source files inspected: `style.css`, `assets/logo/atelier-mark.svg`, `index.html`, `shop.html`, `detailproduct.html`, `checkout.html`, `src/data/products.json`, `src/js/commerce-store.js`, plus route inventory.

## 39. External production / research sources

- TOTEME official: `https://toteme.com/`
- LEMAIRE official: `https://www.lemaire.fr/`
- Jil Sander official: `https://www.jilsander.com/`
- COS official: `https://www.cos.com/`
- ARKET official: `https://www.arket.com/`
- Baymard ecommerce filtering: `https://baymard.com/learn/ecommerce-filter-ui`
- Baymard product-list research: `https://baymard.com/research/ecommerce-product-lists`
- Baymard checkout optimization: `https://baymard.com/learn/checkout-flow-ux-optimization`
- Baymard size-guide examples/research: `https://baymard.com/ecommerce-design-examples/size-guide`

These references supply **principles**, not surfaces to clone.

---

# FINAL GATE

**PROMPT 1 STATUS: PASS for implementation handoff, with explicit unknowns retained.**

Prompt 2 is allowed to make code-level implementation choices, but it is **not** allowed to freely re-select the site style, brand palette status, page-role composition model, primary user journey or system reality.

If code implementation returns to a generic black luxury template, a universal hero, one-layout-fits-all sections, or hides purchase-critical information, it violates this Design Contract.
