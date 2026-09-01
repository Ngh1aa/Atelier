# ATELIER V9 — Media / Focal-Point Contract

## Why this exists

V8 exposed an obvious process failure: browser/CI metrics were green while rendered media was visibly broken (head/subject crop, vertical image slices, detached product text, oversized clipped typography).

V9 treats screenshot integrity as a release gate.

## Reference principles

- COS: catalogue-led PLP, editorial moments may interrupt commerce but product scanning stays clear.
- Studio Nicholson: dense product discovery and Quick Add remain owned by the correct product card.
- LEMAIRE: restrained product presentation; media/product information remain primary.

No reference is copied literally. The project uses existing ATELIER assets and static commerce reality.

## Component contract

| Component family | Media intent | Ratio strategy | Fit mode | Focal point | Mobile override | Hard fail |
|---|---|---|---|---|---|---|
| Home hero | full fashion look / campaign anchor | bounded portrait region | contain | upper body / face + garment | single column, full portrait | head/garment cut, huge blank region, title outside bounds |
| Home product cards | identify garment and connect to product metadata | 3:4 | contain | top-center | 1 column at <=540 | vertical slice, detached text |
| Shop / PLP cards | scanable catalogue | 3:4 | contain | top-center | 2 columns mobile | garment cropped beyond recognition, text outside card |
| PDP main image | purchase decision | bounded 4:5-like viewport | contain | full product / subject | 4:5 container, contain | accidental head/garment crop |
| PDP thumbnails | navigation only | 4:5 | contain | top-center | same | unrecognizable crop |
| Collections / House | editorial evidence | intrinsic / bounded | contain first | upper subject | stack rather than crop harder | sliver/stretch/subject loss |
| Cart / Saved | confirm selected item | 3:4 | contain | top-center | smaller width only | product not identifiable |

## Typography bounds

- No oversized decorative word may exceed intended composition bounds.
- `FALL / 26` giant absolute notation from V7/V8 is hidden in V9.
- Home H1 uses clamped scale and must remain inside the hero grid at 390/768/1440/1920.
- Decorative clipping is not allowed unless intentionally documented and still preserves hierarchy.

## Card ownership

Each product card owns:

`image → name → collection/category → price/status → quick action`

CSS may not auto-place card children into neighboring columns.

## Required screenshot matrix

- Home: 390 + 1440 (top + full)
- Shop: 390 + 1440 (top + full)
- PDP: 390 + 1440 (top + full)
- Collections: 390 + 1440
- The House: 390 + 1440
- Existing final QA additionally covers bag/saved/service/order/checkout.

## Release veto

Any obvious crop/layout defect seen in screenshot overrides automated green status.
