# Visual Direction — V12 Sharp Youth Luxury

## One-sentence signature
If the logo disappears, ATELIER should still read as **warm gallery commerce with portrait fashion frames, sharp sans typography and a restrained signal-blue interaction layer**.

## Visual attributes
1. **Young, not juvenile** — compressed sans display type, concise copy, blue used as a signal rather than decoration.
2. **Premium, not precious** — strong alignment, hard rules, no rounded-card SaaS language, no fake luxury whitespace.
3. **Editorial, not theatrical** — one strong visual anchor per page role; media supports browsing instead of overwhelming it.
4. **Useful, not verbose** — service content is task-first and progressively disclosed.
5. **Portrait-first** — 3:4 frames, contain, focal safety and perceived-crop consistency remain non-negotiable.

## Layout grammar
- Max canvas: 1680px.
- Desktop container: 64px total outer breathing room; mobile: 24px.
- Warm paper field `#F3F0E9`, ink `#101010`, signal blue `#3157FF`.
- Use 1px rules and alignment to create rhythm; avoid box shadows and radius-heavy cards.
- Dense product grids are valid; giant blank zones are not.

## Type hierarchy
- Primary display: Inter/Arial sans, tight tracking, 54–126px desktop, 50–76px mobile.
- Editorial accent: Playfair Display only inside selected words/phrases, never entire page hierarchy.
- Body: 13–15px with compact line lengths.
- Metadata: 10px uppercase, wide tracking.

## Page-role composition matrix

| Page role | User question | Owner message | First visual anchor | Top composition | Decision object | CTA | Media | Mobile transformation |
|---|---|---|---|---|---|---|---|---|
| Shop | What is new and how do I find my piece? | Current edit is compact, directional and easy to browse | 2-image portrait edit | Copy + 2-image visual stage | Product grid + filters | Category chips / product | Two portrait frames then 4-col catalogue | Media first, copy second, horizontal category rail, 2-col grid |
| The House | Why this brand? | Wardrobe supports the person; proportion/material/repeat are the house codes | Portrait house image | Manifesto copy + portrait | House codes + current edit | Collections / Shop | 4 portrait images across 3 sections | Portrait first, manifesto then stacked code stories |
| Client Services | Where do I go for help? | Four destinations answer most needs | One portrait editorial image | Compact help copy + image | Four service routes | Size / Delivery / Care / Contact | Single portrait image only | Media first, short copy, service rows, 1-col accordions |

## Content density rules
### Client Services
- Above the fold: one sentence maximum under H1.
- Four task routes; one line each.
- Long explanation only inside `<details>`.
- No separate accessibility essay block.

### The House
- Must feel materially richer than a short “about” page without relying on invented company history.
- Minimum: hero + manifesto + 3 visual house codes + current edit section.
- Each card/story gets one short paragraph maximum.

### Shop
- Must establish mood before catalogue but not delay shopping by more than one compact hero viewport.
- Catalogue starts immediately after category/filter controls.
- Product cards remain the dominant density object.
- Use signal blue for action/interaction, never as a large decorative background inside the product grid.

## Media direction
- All fashion imagery: portrait 3:4 containers when materially framed.
- `object-fit: contain`; default object-position near top.
- Same card family must maintain similar perceived subject scale.
- No dramatic head/limb crop for hero, PLP or PDP.
- Editorial asymmetry can come from layout, not destructive crop.

## Motion
- 120–180ms interaction feedback.
- Reveal motion is optional and must collapse under reduced motion.
- No parallax or scroll-jacking.

## Do
- Use blue as a label/action state.
- Use sans hierarchy for youth energy.
- Use serif as an occasional editorial interruption.
- Keep product grid dense and visually ordered.
- Use native disclosure for help content.

## Do not
- Do not bring back giant serif hero typography.
- Do not create empty whitespace to simulate luxury.
- Do not repeat copy-left/image-right across every page.
- Do not turn Client Services into six text cards.
- Do not crop models to make an image feel more editorial.
- Do not invent founders, factories, sustainability claims or operational service guarantees.

## Release gate
PASS only if rendered 390px + 1440px screenshots confirm:
- Client Services is materially shorter and scan-first;
- The House has at least 4 meaningful visual anchors and no text-wall feel;
- Shop has a distinct editorial opening but product grid appears quickly and remains easy to browse;
- no horizontal overflow;
- portrait/crop regression still passes;
- V12 style owner is active.
