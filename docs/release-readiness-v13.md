# ATELIER V13 — Release Readiness

## Scope

- Project mode: static ecommerce prototype / production-candidate frontend.
- Proposed merge target: `main` through a pull request.
- Changed surfaces: all 20 HTML routes, shared visual owner, catalogue/PDP/Bag/Saved runtime, product positioning data and QA docs.
- Data/API/auth/payment: local JSON and browser-local state; no backend auth, payment, inventory or fulfilment integration.
- Migration/config/env change: none.
- URL change: none; primary route filenames are preserved.

## Stage A — spec and intent compliance

- Keeps the ATELIER monochrome/editorial identity while adding a restrained cobalt action signal.
- Materially changes hierarchy, composition, page-role and shopping journey—not only palette or spacing.
- Addresses the stated 10–20M VND/month audience with a 1.29M–3.49M current edit and no fake sale/scarcity.
- Preserves local Bag/Saved/order behavior and states its limitations truthfully.
- Applies the user's desktop-only override without claiming mobile/tablet coverage.

**Stage A: PASS**

## Stage B — code and experience quality

| Change | Expected outcome | Verification | Pass condition | Result |
|---|---|---|---|---|
| single design owner | no cascade/version drift | static inspection of 20 HTML routes and `main.js` | one V13 stylesheet, no legacy injection | PASS |
| representative redesign | visible structural delta | OLD/NEW 1363 × 936 inspection | Home/Shop/PDP/Collections distinct and usable | PASS |
| whole-site rollout | no legacy primary route | 20-route browser smoke | H1/content/style/no overflow/no site errors | PASS |
| decision journey | product-to-checkout continuity | PDP size → mini bag → Bag → Checkout | product/variant/price/total agree | PASS |
| recovery states | no false success or ghost content | empty Bag, Saved, Account, order-not-found, checkout validation | truthful state + recovery action | PASS |
| build/runtime | releasable static bundle | `npm run build`, `npm test`, browser console | build succeeds, 2/2 tests pass, no site errors | PASS |
| visual QA | no screenshot veto issue | manually opened representative/family/state screenshots | no unresolved P0/P1/material P2 | PASS |
| performance | bundle/media stay within proposed prototype budgets | Vite build inventory | JS/CSS/media budgets met | PASS |

**Stage B: PASS**

## Risks and non-claims

- GitHub combined status currently exposes no remote status checks; local build/test and rendered browser evidence are the available gates.
- Mobile/tablet behavior is not verified and must not be marketed as redesigned or responsive in this release.
- Real payment, inventory, account, email and fulfilment are not implemented.
- Automated accessibility conformance is not claimed; changed keyboard/focus/semantic surfaces were manually checked.

## Rollback

- Before merge: close the PR or keep the feature branch unmerged.
- After merge: use a normal Git revert of the merge commit or GitHub Pages' previous immutable deployment if available.
- Do not use `git reset --hard` or force-push the shared default branch as the default rollback.
- No data/schema migration exists; browser-local data remains compatible with the existing local store keys.

## Deployment and post-deploy smoke

Deployment was not requested or authorized in this run. Production smoke is therefore `N/A_JUSTIFIED`, not silently skipped. If the PR is later merged/deployed, verify the production HTTPS URL, Home/Shop/PDP, Add to Bag, Bag/Checkout, Saved, search, route assets, console errors and GitHub Pages path handling.

`PRE-MERGE RELEASE READINESS = PASSED (DESKTOP SCOPE)`

