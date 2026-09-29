# ATELIER V16 — Senior Commerce Decision & Recovery Layer

V16 keeps the V15 monochrome editorial system and adds a narrow product-design layer for decision quality, destructive-action recovery and system truth. The goal is not more interface; it is fewer ambiguous commerce decisions.

## Why V16 exists

The visual and interaction system was already strong. The remaining senior-level gaps were mostly operational:

- generic STANDARD / EXPRESS labels made shipping speed more prominent than the date the shopper actually needs;
- Bag removal was destructive without Undo;
- the system correctly modeled unknown inventory, but that reality was not visible enough in the Bag summary;
- checkout explained the static-prototype boundary, but did not clearly state what happens after the local order is recorded;
- repository naming drift mixed V14 file names, V15 runtime and V16 rationale.

V16 treats the runtime dataset (`data-atelier-version="v16"`) plus this document as the current product-design layer while deliberately preserving compatible V14/V15 asset file names to avoid a risky rename-only migration.

## Decisions

### 1. Delivery becomes date-first

Checkout choices now lead with `Arrives <date>` while retaining Standard / Express as secondary service labels. The design reduces translation from abstract speed tiers into the outcome a customer actually evaluates.

### 2. Destructive Bag removal is recoverable

Remove still acts immediately, but the last line can be restored through an accessible Undo status. Existing Save for later remains separate because its intent is different from accidental removal.

### 3. Inventory uncertainty remains visible

Known stock is enforced by the commerce store. Unknown inventory remains `UNKNOWN`; the Bag summary explicitly explains that it is rechecked before the local order is recorded. V16 does not manufacture scarcity or an “in stock” claim.

### 4. Checkout explains the next system state

Before consent, shoppers see three explicit consequences:

1. the order is stored locally in the browser;
2. payment is not captured;
3. live fulfilment / reservation does not begin.

This is a prototype-reality contract, not conversion copy.

### 5. Fit uncertainty has an escalation path

The PDP confidence strip keeps size/availability/service information together. V16 adds a short escalation path to the existing full Size Guide for between-size or unfamiliar-silhouette decisions instead of adding another sizing widget.

## Evidence boundary

- Runtime behavior and lifecycle rendering: **VERIFIED only after CI/browser evidence**.
- Inventory: known values can be asserted; unconnected stock remains **UNKNOWN**.
- Real payment, reservation, email, account and fulfilment: **NOT CONNECTED**.
- Conversion lift, usability improvement and customer preference: **UNKNOWN** until direct research / production metrics exist.
- Existing reference benchmark remains competitive/reference evidence, not participant research.

## Regression acceptance

V16 must preserve:

- V15 art direction and motion grammar;
- keyboard/focus behavior and reduced motion;
- truthful sold-out/unknown states;
- Bag variant editing and Save for later;
- checkout draft persistence and inventory recheck;
- Empty / Loading / Error / Sold-out state evidence at desktop, tablet and mobile;
- no body horizontal overflow or runtime/page errors.

The lifecycle contract is now `uiux-state-coverage.json` and the target repository delegates rendered semantic verification to the shared UIUX Factory workflow instead of maintaining a copied Playwright implementation.
