# Senior fashion-commerce product-depth upgrade

## Goal

Move ATELIER from a visually mature fashion prototype into a stronger senior Product Design case by making product uncertainty, variant continuity and checkout recovery inspectable across PDP → Bag → Checkout.

## Product decisions

### PDP — bounded size confidence

The new helper uses only two explicit inputs:

- the shopper's usual labelled size;
- preferred feel: intended / closer / easier.

It then maps to the nearest currently available labelled size. The UI explicitly says that the prototype does **not** infer body measurements or guarantee fit. The existing fit note and size guide remain the stronger decision evidence.

This avoids fake AI sizing and preserves user agency.

### Bag — decision continuity

Bag already supports colour/size edits, inventory limits and Save for later. The upgrade makes that system visible as a pre-checkout decision state:

- variant choices remain editable;
- availability is revalidated before order recording;
- unfinished variant edits are surfaced.

### Checkout — readiness and recovery

The existing local draft and inventory revalidation are strong product behaviours. The new readiness layer exposes them instead of adding a parallel checkout engine:

- Contact readiness;
- Address readiness;
- Delivery + payment readiness;
- Final consent readiness;
- recovery action to focus the first invalid field when the existing checkout reports an error.

## Evidence boundary

The helper is prototype guidance, not a validated size recommendation system. No conversion, return-rate, confidence or satisfaction improvement is claimed. Real-user validation remains required before outcome claims can move beyond `UNKNOWN`.

## Acceptance criteria

1. Preserve ATELIER's monochrome luxury art direction and existing commerce store.
2. Never fabricate live inventory or body-fit intelligence.
3. Guidance must remain explainable and reversible.
4. Cart variants remain editable with inventory continuity.
5. Checkout retains existing local draft + pre-order inventory revalidation.
6. New readiness UI must work at mobile widths.
7. Source contract tests must pass alongside the existing test/build suite.
