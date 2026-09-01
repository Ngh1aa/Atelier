# Design Reference Benchmark — V12 Sharp Youth Luxury

## Project decision
- Business goal: make ATELIER read as a distinctive premium fashion brand for a younger audience while keeping product finding and checkout practical.
- Audience/top tasks: discover the current edit, understand the brand point of view, compare products quickly, resolve fit/delivery questions without reading a wall of text.
- Brand constraints: current monochrome fashion imagery, static GitHub Pages implementation, no verified founder/history/manufacturing claims, portrait-first media rule.
- Page roles in this pass: Shop / The House / Client Services, plus shared nav/footer polish.

## Source mix and pages inspected

| Reference | Type | Pages inspected | Job | Principle kept | What not to copy |
|---|---|---|---|---|---|
| Coperni | Production fashion brand | Homepage, All Products, Collections, Delivery & Returns | Shop/discovery + service clarity | Put discovery/category language next to commerce; catalogue remains dense and task-first; collections form a brand universe | Coperni-specific product naming, futuristic brand surface, exact menu/category structure |
| Paloma Wool | Production fashion brand | Homepage, Collections, FAQ, Shipping & Returns | Youth culture + progressive service content | Treat collections/projects as brand culture; move long help content behind task labels/FAQ rather than hero copy | Brand-specific locations, makers/production facts, exact playful visual identity |

## Web evidence used
- https://coperni.com/
- https://coperni.com/collections/all
- https://coperni.com/pages/collections
- https://coperni.com/pages/delivery-and-returns
- https://palomawool.com/
- https://palomawool.com/pages/collections
- https://palomawool.com/pages/faqs
- https://palomawool.com/pages/shipping-and-returns

## Page-role reference matrix

| Page role | User question | Reference principle | ATELIER adaptation |
|---|---|---|---|
| Shop | “What is new, and can I get to the right piece fast?” | Coperni: discover/category layer sits directly beside dense catalogue | One compact editorial masthead, quick category chips, sticky filter/sort, then 4-col product grid |
| The House | “Why should I care about this brand?” | Paloma Wool: brand universe is built through collections/projects/culture instead of a short brochure paragraph | Visual manifesto + 3 house codes + current edit; no invented founder/history claims |
| Client Services | “Where do I go for fit, delivery, care or help?” | Paloma Wool FAQ + Coperni delivery: service info is task-labelled and progressive | Four primary service routes + native details/summary quick answers; remove repeated prose blocks |

## Extracted design DNA inputs
- **Layout grammar:** strong 2-column intros, portrait media, dense commerce, no giant empty whitespace.
- **Type:** sans-led for energy and utility; serif used only as an editorial accent.
- **Color:** warm paper + black + one signal-blue role for active states, labels and interaction emphasis.
- **Media:** all fashion frames remain portrait 3:4 / contain; no head/limb crop to manufacture drama.
- **Interaction:** chips, sticky finding controls, native accordion, restrained hover state.
- **Brand voice:** short, direct, culturally aware; less “quiet luxury brochure,” more wardrobe/project language.

## Rejected patterns
- Huge serif headlines taking most of a viewport.
- Long service paragraphs repeated across cards.
- Generic 3-card “values” sections without imagery.
- Shop as a plain filter bar plus undifferentiated product grid.
- Copying one reference site’s complete surface language.

## Handoff
Use `docs/visual-direction-v12.md` as the implementation contract. Browser screenshots at 390 and 1440 are required before merge.
