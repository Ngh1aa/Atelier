# ATELIER V7 — Visual Direction

## Signature
**Runway Contact Sheet / Campaign Commerce**

If the logo is hidden, Atelier should still be recognizable through: **oversized collection notation + asymmetric image contact sheet + numbered garment captions + precise product-decision rails**.

## Visual attributes
1. Editorial, not decorative — imagery carries the mood; controls stay literal.
2. Cropped and asymmetrical — image scale changes create rhythm instead of repeated section cards.
3. Precise — thin rules, compact labels, numbered studies and clean alignment.
4. Commerce-forward — price/size/fit/service information is never hidden behind storytelling.
5. Quiet chrome — no gradients, glass, giant rounded cards or ornamental shadows.

## Layout grammar
- Desktop: 12-column grid with full-bleed escape zones.
- Primary gutter: clamp(18px, 2.2vw, 36px).
- Section rhythm alternates dense catalogue bands and large campaign frames; do not use equal vertical padding everywhere.
- Editorial sections may touch viewport edges; commerce decision panels remain contained.
- Image ratios intentionally vary: portrait 4:5, tall 3:5, landscape 16:10.

## Type
- Display: Playfair Display only for collection/campaign statements.
- UI/product/navigation: Inter.
- Product names are sans, sentence/title case.
- Oversized collection notation may use serif at 9–16vw desktop, but never on Shop/Checkout.

## Color roles
- Page: white.
- Ink: near-black.
- Soft surface: warm light grey.
- Rules: cool/warm grey.
- Chroma comes from product/campaign photography. No invented brand color.

## Motion
- Campaign blocks: subtle translate/clip reveal.
- Product cards: image zoom <= 1.02 and utility reveal on pointer devices.
- Navigation: height/rule transition only.
- Checkout: no decorative movement.
- Respect reduced motion.

## Page-role composition matrix

| Page | Entry question | First visual anchor | Top composition | Decision object | Primary CTA | Mobile transform |
|---|---|---|---|---|---|---|
| Home | What is Atelier showing now? | Tall campaign image | 3-plane contact sheet: oversized title, tall hero, offset crop | Collection + selected products | Shop New In | Full-width image, title overlays lower edge, secondary crop becomes swipe-like horizontal frame |
| Shop | What can I buy? | Product grid | Compact masthead + sticky category/filter strip | Product cards | Open product / quick add | Two-column catalogue, filter drawer, sticky utility strip |
| PDP | Is this piece right? | Product image canvas | Large visual field + sticky fitting rail | Size/color/fit/material | Add to Bag | Image first, compact decision sheet, sticky CTA only after primary action passed |
| Checkout | Can I complete this confidently? | Step/progress + form | Utility sheet with compact header | Contact/address/delivery/payment/review | Record Order | Single column with summary before final review |

## Representative composition proofs

### Home desktop
```text
┌────────────────────────────────────────────────────────────────────┐
│ NAV                                                                │
├───────────────┬──────────────────────────┬─────────────────────────┤
│ FW / 26       │                          │ 02 / SILHOUETTE         │
│ giant serif   │       HERO 4:5           │ OFFSET CROP             │
│ statement     │                          │                         │
│ CTA + index   │                          │                         │
└───────────────┴──────────────────────────┴─────────────────────────┘
│ 01 PRODUCT  02 MATERIAL  03 FIT  04 SERVICE                        │
│ 3 PRODUCT STRIP                                                     │
│ FULL-BLEED COLLECTION IMAGE + anchored caption                      │
```

### Shop desktop
```text
NEW IN / 008 PIECES                         FILTER   SORT
Outerwear / Knitwear / Tees / ...
────────────────────────────────────────────────────
[PRODUCT][PRODUCT][PRODUCT][PRODUCT]
[PRODUCT][PRODUCT][PRODUCT][PRODUCT]
```

### PDP desktop
```text
┌──────────────────────────────────┬─────────────────────┐
│                                  │ COLLECTION          │
│       LARGE PRODUCT CANVAS       │ PRODUCT NAME        │
│                                  │ PRICE               │
│                                  │ COLOR               │
│ thumbnails / image count         │ SIZE / FIT          │
│                                  │ ADD TO BAG          │
│                                  │ DELIVERY / RETURNS  │
└──────────────────────────────────┴─────────────────────┘
```

## Do
- Let image scale/crop create hierarchy.
- Keep Home visually authored and Shop/PDP highly usable.
- Make page tops clearly non-interchangeable.
- Use existing product/service truth.

## Do not
- Do not reuse one centered hero pattern.
- Do not make every block `container + heading + cards`.
- Do not solve differentiation with background color alone.
- Do not add fake brand colors, fake scarcity, fake payment or fake newsletter functionality.
- Do not make mobile a simple vertical collapse of desktop.
