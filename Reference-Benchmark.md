# ATELIER — Reference Benchmark

**Run:** V15 flagship portfolio upgrade  
**Research date:** 2026-09-14  
**Scope:** luxury fashion / interaction craft / editorial commerce  
**Evidence status:** production-reference research, **not user research**.

## Decision problem

ATELIER already has a working static commerce journey and a restrained fashion-house visual baseline. The redesign problem is not “make it look more premium.” It is to create an authored editorial system that can build desire at discovery while progressively increasing decision clarity as the shopper approaches purchase.

Working hypothesis to validate later:

> Luxury fashion can use editorial storytelling to create desire, but purchase confidence increasingly depends on reducing uncertainty about size, fit, material, availability, delivery and returns as the user moves from discovery to PDP, Bag and Checkout.

This is a **design hypothesis** informed by production patterns below. It is not presented as an observed user finding.

## Project truth used before benchmarking

- Static HTML/CSS/JS + Vite prototype; no framework/backend migration.
- Product catalogue is local/static.
- Saved, Bag and local order records are real browser-local behavior.
- Checkout/payment/fulfilment/account identity are simulated or partial.
- Existing routes, VND pricing, product photography and commerce contracts should be preserved.
- Current monochrome system supersedes the older V14 porcelain/oxblood direction.
- Responsive scope for V15 is `responsive_all`: ≥1440, 1280, tablet/768, 390 and narrow mobile.
- No fake scarcity, fake fulfilment, fake research or fabricated performance/conversion claims.

## Research method

Production sites were inspected for task patterns rather than copied for surface styling. The benchmark separates each reference's useful role from brand-specific language and implementation that should not transfer to ATELIER.

The six requested references are used for different jobs:

- **LEMAIRE** — restraint, catalogue hierarchy, service reassurance.
- **Jil Sander** — explicit commerce sequence, sizing and returns clarity.
- **TOTEME** — size/fit decision support and availability states.
- **LOEWE** — expressive product media with disciplined transaction reassurance.
- **The Row** — quiet product information architecture and material/size clarity.
- **SSENSE** — high-information product decision surfaces with very low decorative friction.

## 1. LEMAIRE

**Purpose of reference**  
Understand how a quiet fashion brand preserves visual restraint without hiding practical product/service information.

**Pages / flows inspected**

- Collection/catalogue and filtering/search patterns.
- Product-information / sizing guidance.
- FAQ/service reassurance.

**Current production evidence**

- Product sizing is linked from each product page.
- Care guidance points to the garment composition/care label.
- Standard shipping and 14-day return information is made easy to find.

Sources:

- https://www.lemaire.fr/fr/pages/faq
- https://www.lemaire.fr/

**What works**

- Restraint is created through hierarchy, whitespace and product imagery rather than ornamental “luxury UI.”
- Service information is quiet but concrete; reassurance does not need to become a promotional card.
- Product/category information can remain dense enough to shop while the visual tone stays editorial.

**Information density**

Moderate. Catalogue and service pages carry real information, but secondary text and controls stay visually subordinate.

**Image behavior**

Product imagery is treated as merchandise evidence first: clean framing and repeatable catalogue rhythm. ATELIER should preserve this principle for PLP/PDP even when the Home/Collection pages are more expressive.

**Typography**

Use as a lesson in hierarchy and restraint, not as a font reference. ATELIER should keep its own wordmark and existing serif/sans ownership.

**Navigation**

Category-led and commerce-legible. Avoid turning ATELIER navigation into an experimental fashion index that slows Shop, Search, Saved or Bag access.

**PDP / variant / size**

The important transferable behavior is that sizing help is available at the product-decision moment instead of being buried in global help.

**Cart / transaction**

Service confidence is established before checkout through accessible shipping/return information; ATELIER should keep this reassurance close to PDP purchase action and repeat only what is needed in Bag/Checkout.

**Motion**

No motion pattern from LEMAIRE is adopted as evidence in this benchmark. Dynamic behavior was not treated as validated usability proof.

**Mobile behavior**

Adapt the content-priority principle: on small screens, product identity and decision information must outrank decorative editorial copy.

**ADAPT for ATELIER**

- Quiet service reassurance adjacent to purchase decisions.
- Restrained catalogue chrome.
- White space that preserves useful first-viewport information.

**DO NOT ADAPT**

- Exact typography, category naming, imagery or brand voice.
- Any minimal treatment that makes disabled/sold-out/focus states too subtle.

---

## 2. Jil Sander

**Purpose of reference**  
Study a minimal luxury flow that explicitly connects category/search, filters, PDP options, Bag and checkout without making the commerce path feel mass-market.

**Pages / flows inspected**

- FAQ purchase flow.
- Product sizing guidance.
- Returns/exchanges flow.

**Current production evidence**

Jil Sander's current FAQ explicitly describes a sequence from category/search to filters, product detail, size/color selection, cart and checkout. Size Guide is linked from product pages, and online returns/exchanges are supported within a stated window.

Sources:

- https://www.jilsander.com/en-us/faq.html
- https://www.jilsander.com/en-gb/faq.html

**What works**

- The shopping sequence is straightforward even though the visual brand language is restrained.
- Size conversion/help is a first-class decision aid rather than generic support content.
- Return/exchange information is specific enough to reduce uncertainty without dominating PDP hierarchy.

**Information density**

Low-to-moderate in primary shopping surfaces, higher in service content. This separation is useful: ATELIER does not need every policy visible at once, but the route to an answer must be immediate.

**Image behavior**

Use the principle of keeping product media separate from task controls. Do not overlay selectors or essential pricing on imagery.

**Typography**

The transferable lesson is consistent role ownership: brand expression can live in display/editorial type while controls and transaction information remain extremely legible.

**Navigation**

Commerce categories remain discoverable. ATELIER should not sacrifice obvious Shop/Search/Saved/Bag access for a fashion-editorial navigation gimmick.

**PDP / variant / size**

Strong relevance to ATELIER V15: size and color selection needs visible state, direct size help, and unambiguous unavailable behavior.

**Cart interaction**

Use the clear task handoff—selection → cart → checkout—not a theatrical page transition that delays completion.

**Motion**

No Jil Sander animation is treated as a benchmark requirement. ATELIER motion must be justified by its own interaction jobs.

**Mobile behavior**

V15 should preserve the same decision sequence when stacked: image → identity/price → color → size/fit → action → reassurance.

**ADAPT for ATELIER**

- Explicit decision sequence.
- Size guide beside size selector.
- Returns/exchange reassurance as practical content.

**DO NOT ADAPT**

- Brand-specific copy/visual proportions.
- Minimalism that removes labels or relies on hover to reveal meaning.

---

## 3. TOTEME

**Purpose of reference**  
Primary benchmark for size/fit, availability and post-selection feedback because these patterns directly address purchase uncertainty.

**Pages / flows inspected**

- Apparel PDPs with model sizing and garment measurements.
- Footwear PDP with fit guidance.
- Low-availability, unavailable and `Notify Me` states.
- Add-to-bag feedback and returns panel.

**Current production evidence**

Current TOTEME product pages expose model measurements, fit notes, size conversion, garment measurements, store availability, size-specific `Low availability` or `Notify Me` states and a clear `View bag` response after adding. The FAQ points users to PDP `Size & Fit` details and `Notify Me` for out-of-stock items.

Sources:

- https://toteme.com/en-int/products/wide-fluid-shorts-black
- https://toteme.com/en-int/products/naplack-heeled-flip-flops-buttercup
- https://toteme.com/en-us/products/strapless-linen-pocket-top-beige
- https://toteme.com/en-se/pages/faq

**What works**

- Fit uncertainty is answered at the exact size-decision moment.
- Availability belongs to the size, not just the product.
- Unavailable options remain understandable rather than disappearing.
- Add-to-bag provides immediate continuity into the Bag.
- Product details, fit and returns are grouped by question rather than exposed as one long undifferentiated description.

**Information density**

High at PDP, but progressively disclosed. This is a strong reference for ATELIER because luxury expression is not used as an excuse to omit decision information.

**Image behavior**

Multiple views support inspection. ATELIER currently has limited local product imagery for many products, so V15 must not fake alternate views. The gallery system should become interaction-ready and scale when real additional assets exist.

**Typography**

Utility text stays direct around selectors; editorial expression does not infect every form label.

**Navigation**

Not the primary reason for selection as a reference.

**PDP / variant / size**

Highest-value reference. ATELIER should adapt: selected-state clarity, size-specific availability, fit note, model sizing, size guide, and a concise status region.

**Cart interaction**

The `added to your bag` → `View bag` continuity is useful. ATELIER already opens a mini-Bag; V15 should make that transition part of a coherent motion/feedback system.

**Motion**

Adopt the interaction job—not the exact animation: selection should respond immediately; drawer transitions should explain continuity; no action should wait for decorative motion.

**Mobile behavior**

The PDP's high-value decision content should remain near the purchase action. ATELIER V15 will use a mobile purchase dock as a shortcut, but not as a substitute for the full accessible form in document flow.

**ADAPT for ATELIER**

- Size-specific availability states only when inventory data is known.
- Fit/model/size support close to selector.
- Immediate add-to-bag continuity.
- Progressive disclosure for detailed product/service information.

**DO NOT ADAPT**

- `Low stock` when ATELIER's local inventory is `UNKNOWN`.
- Email `Notify Me` because ATELIER has no real email service.
- Store availability because no store inventory integration exists.

---

## 4. LOEWE

**Purpose of reference**  
Study how expressive luxury imagery can coexist with extremely disciplined purchase reassurance.

**Pages / flows inspected**

- Ready-to-wear PDPs with multiple product images.
- Size/color decisions.
- Delivery/returns reassurance adjacent to the product decision.

**Current production evidence**

Current LOEWE PDPs expose multiple product views, size/color choices and concise reassurance such as free shipping timing and free online returns close to the decision surface.

Sources:

- https://www.loewe.com/apc/en/variation?__server_only=&dwvar_H526Y22XAY-1100_Shared_size=403&pid=H526Y22XAY-1100
- https://www.loewe.com/usa/en/men/menswear/t-shirts-and-polos/loose-fit-t-shirt-in-cotton/H526Y22XDU-2108.html

**What works**

- Rich imagery is allowed to lead without making size and service information hard to find.
- Delivery and return confidence is phrased compactly.
- The product remains the visual hero; transaction surfaces stay disciplined.

**Information density**

Low at the top level, with details available on demand. This maps well to ATELIER's quiet editorial direction.

**Image behavior**

Large-format, repeated views make material and silhouette feel important. ATELIER should use stronger gallery choreography with its existing assets, but never duplicate one image to simulate coverage.

**Typography**

Do not copy brand type. Adapt the hierarchy: product name, price and selectors stay quieter than campaign display typography.

**Navigation**

Not used as the main benchmark. ATELIER's navigation should remain more compact because the prototype has a smaller catalogue and fewer taxonomy levels.

**PDP / variant / size**

Keep purchase controls visually disciplined and always adjacent to clear product identity.

**Cart interaction**

The useful principle is continuity and reassurance, not branded packaging theatre.

**Motion**

ATELIER can be more explicit about image transition and drawer motion than this benchmark, provided reduced motion is respected.

**Mobile behavior**

Large media may lead, but the decision stack must follow immediately; avoid huge editorial whitespace between image and selectors.

**ADAPT for ATELIER**

- Media-dominant PDP with restrained control rail.
- Concise delivery/return reassurance near CTA.
- Gallery transition that preserves orientation.

**DO NOT ADAPT**

- Signature packaging claims.
- Delivery promises that differ from ATELIER's existing prototype contract.
- Image volume the local asset set does not actually have.

---

## 5. The Row

**Purpose of reference**  
Benchmark “quiet luxury” information architecture without falling into the false equation of serif + beige = luxury.

**Pages / flows inspected**

- Shopping/payment guidance.
- PDP information requirements.
- Shipping/delivery guidance.

**Current production evidence**

The Row states that PDPs expose available sizes/colors, description, material composition, zoom/detail imagery and product-specific size guides. Guest purchase is supported; preorder and pickup states are disclosed when applicable. Shipping guidance gives concrete delivery windows and costs rather than vague reassurance.

Sources:

- https://www.therow.com/pages/shopping-payment
- https://www.therow.com/pages/shipping-and-delivery

**What works**

- Product facts are explicit even in a highly restrained brand world.
- Material composition and size guides are purchase information, not editorial footnotes.
- Exceptional states such as preorder are disclosed rather than visually implied.
- Guest checkout reduces unnecessary account friction.

**Information density**

Low visual density with high factual sufficiency. This is an important distinction for ATELIER V15.

**Image behavior**

Use imagery to communicate silhouette/material but keep metadata structurally attached to the product.

**Typography**

The useful lesson is confidence through hierarchy and whitespace, not copying “quiet luxury” type choices.

**Navigation**

Category and Saved/Bag access remain recognizable. ATELIER should preserve its current direct utility access.

**PDP / variant / size**

ATELIER should surface exact material data when it exists; when it does not, it should remain honest instead of inventing composition. Product-specific size guidance is preferable to a single generic chart when data exists.

**Cart interaction**

Guest-first continuation aligns with ATELIER's current local prototype. Do not add an account wall to make the project feel more “complete.”

**Motion**

No exact motion is adopted. The Row is mainly an information-architecture reference here.

**Mobile behavior**

Quiet hierarchy must not become excessive scrolling. Transaction controls need stronger density than campaign screens.

**ADAPT for ATELIER**

- Factual sufficiency with restrained visual density.
- Guest-first purchase journey.
- Material/size/service information as confidence objects.

**DO NOT ADAPT**

- Luxury conventions that are purely stylistic.
- Preorder/pickup states without system support.

---

## 6. SSENSE

**Purpose of reference**  
Benchmark a deliberately transactional PDP where high information density remains scan-friendly and fast.

**Pages / flows inspected**

- Current apparel and footwear PDPs.
- Size selection, model sizing, material/origin/item data.
- Shipping/returns reassurance.

**Current production evidence**

Current SSENSE PDPs commonly put product identity and item information alongside a direct `SELECT A SIZE` → `ADD TO BAG` sequence, model sizing, Size Guide, material/origin information and shipping/return reassurance.

Sources:

- https://www.ssense.com/en-us/women/product/vans/white-super-lowpro-serio-sneakers/19040791
- https://www.ssense.com/en-us/women/product/burberry/beige-check-shirt/15685321

**What works**

- Transaction hierarchy is extremely explicit.
- Product facts use compact language and predictable placement.
- Model sizing and Size Guide are close to the size action.
- Commerce surfaces do not depend on decorative cards.

**Information density**

High but structured. This is useful as a counterweight to editorial references: ATELIER's PDP must be closer to SSENSE/TOTEME clarity than its Home campaign density.

**Image behavior**

Images and item facts support comparison/decision rather than immersive storytelling. ATELIER should use more authored composition than SSENSE on Home/Collections, while borrowing this decisiveness for PDP and Checkout.

**Typography**

Utility-first. ATELIER should keep more fashion-house character, but not at the expense of selector/form readability.

**Navigation**

Large marketplace taxonomy is not transferable to ATELIER's small catalogue.

**PDP / variant / size**

Strong transferable ordering: identity → item facts → size → CTA → fit/guide/reassurance.

**Cart interaction**

Fast task completion matters more than theatrical transitions. ATELIER's motion should never add a wait before Bag/Checkout.

**Motion**

Not selected for visual motion inspiration. It is intentionally the “clarity anchor” in the benchmark.

**Mobile behavior**

High-density decision information needs strict hierarchy and target sizing. ATELIER should not shrink desktop typography/columns; it should recompose into one decision stack.

**ADAPT for ATELIER**

- Clear decision order and compact item facts.
- Strong selector/CTA hierarchy.
- Fit/model information adjacent to sizing.

**DO NOT ADAPT**

- Marketplace-level taxonomy/density.
- Generic marketplace visual language on Home/Collections.

---

# Cross-reference synthesis

## Reference roles

| Reference | Primary job for ATELIER | Secondary job | Not used as proof of |
| --- | --- | --- | --- |
| LEMAIRE | editorial restraint + service reassurance | catalogue hierarchy | conversion/accessibility success |
| Jil Sander | explicit shopping sequence | sizing/returns clarity | ideal visual style |
| TOTEME | size/fit/availability states | add-to-bag continuity | permission to fabricate scarcity |
| LOEWE | expressive media + disciplined purchase rail | concise reassurance | permission to copy campaign styling |
| The Row | factual sufficiency in quiet luxury | guest-first clarity | “serif + whitespace = luxury” |
| SSENSE | transaction clarity / information architecture | compact product facts | Atelier's final visual language |

## Information-density gradient for ATELIER

The references support a **deliberate density gradient**, not one universal page style:

1. **Home / Collection:** low UI density, high image/editorial expression.
2. **PLP / discovery:** medium density; filters/sort/results become explicit.
3. **PDP:** medium-high decision density; size/fit/material/availability/service must be close.
4. **Bag / Checkout:** high task clarity, low decorative interruption.
5. **Confirmation:** concise success/status information and next actions.

## Design DNA to carry forward

### Layout grammar

- Use one disciplined grid, but allow asymmetry on editorial surfaces.
- Transaction surfaces snap back to predictable alignment and compact scanning.
- Do not place all content into cards; rules, spacing, media and typography establish grouping.

### Photography

- Large-format imagery can lead campaign and collection pages.
- PLP and PDP media must remain reliable product evidence.
- No fake alternate views; no crop that damages face/garment evidence.

### Typography

- Existing ATELIER serif = editorial interruption/display only.
- Sans = navigation, price, selectors, forms, status and transactional facts.
- Difference in role/scale should create fashion-magazine rhythm without lowering readability.

### Navigation

- Preserve direct Shop / Collections / House / Services plus Search / Bag / Saved.
- No experimental nav interaction that hides the commerce spine.

### PDP structure

`media → identity → price → color → size + size help → availability → purchase → fit/model → delivery/returns → material/care → related pieces`

On desktop this may be spatially parallel. On mobile it becomes a strict vertical priority stack.

### Variant / availability

- Selected state must use more than color alone.
- Unavailable sizes stay visible and understandable.
- `Low stock` is allowed **only** when the variant has known inventory data.
- `UNKNOWN` inventory must not be translated into fake “In stock” confidence.
- No email back-in-stock UI until a real service exists.

### Cart / Bag interaction

- Immediate feedback after Add to Bag.
- Preserve focus and keyboard semantics.
- Drawer motion communicates continuity but does not delay Checkout/View Bag.

### Motion direction

ATELIER needs its own system rather than copied fashion-site animation:

- **Reveal:** low-distance image/text reveal to establish hierarchy once.
- **Selection:** immediate border/underline/label feedback.
- **Media:** short crossfade/scale-under-1% choreography, never a large zoom gimmick.
- **Drawer:** directional continuity from edge; focus enters after open and returns on close.
- **Checkout progress:** state change first, motion second.
- **Reduced motion:** remove translations/scale and expose state instantly.

## Patterns explicitly rejected

- Scroll-jacking, cursor replacement, gratuitous parallax.
- Full-screen video as required navigation.
- Floating pill UI and rounded-card systems.
- Glass/gradient/metallic “luxury” shorthand.
- Concealed size/return information for the sake of minimalism.
- Fake `Only 2 left`, fake waitlists, fake store stock, fake delivery confirmation.
- A universal campaign hero reused on utility, PDP or checkout pages.
- Mobile as a scaled-down desktop composition.

# Page-role reference matrix

| ATELIER role | User question | Reference principles used | ATELIER adaptation | What is rejected |
| --- | --- | --- | --- | --- |
| Home / Editorial Entry | What is this world and where can I shop it? | LOEWE media confidence + LEMAIRE restraint | image-led editorial entry with direct collection/product bridges | immersive spectacle that hides Shop |
| Collection | How does the collection form a point of view? | LEMAIRE restraint + LOEWE media | asymmetrical story rhythm linked to actual products | lookbook with no commerce bridge |
| Shop / Discovery | How do I narrow and compare? | LEMAIRE restraint + SSENSE clarity | strong media, compact metadata, explicit filter/sort/result state | decorative cards / hidden filters |
| PDP | Is this item right for me? | TOTEME size/availability + The Row facts + SSENSE hierarchy | decision rail with truthful stock state, fit/model, material/care, service | fake scarcity / missing decision info |
| Bag | Did I add the right variant and what next? | TOTEME add feedback + Jil Sander sequence | mini-Bag continuity, editable variant/quantity, direct checkout | motion that blocks action |
| Checkout | Can I complete this correctly? | SSENSE/Jil Sander task clarity | compact progress, persistent labels/errors, order summary | campaign treatment / account wall |
| Confirmation | What happened and what can I do next? | service clarity principles | local/simulated reality disclosure + order next actions | fake fulfilment/shipping claims |

# Benchmark decision

**PASS for design-direction input.**

The references converge on one transferable principle: stronger editorial expression is viable when the closer-to-purchase surfaces become more—not less—explicit about product and transaction decisions. V15 therefore should not make every screen more “luxury.” It should make **editorial roles more authored and commerce roles more disciplined**, connected by a shared interaction grammar.

Next owner: `Design-Contract-V15.md` → representative implementation → cloud rendered QA.