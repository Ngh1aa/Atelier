# ATELIER V14 — Whole-site Rollout Report

Generated: 2026-09-07T04:31:01.085Z

Root HTML routes checked: 20
Files changed: 21

## Changed

- `about.html`
- `account.html`
- `care-guide.html`
- `cart.html`
- `checkout.html`
- `client-services.html`
- `collections.html`
- `contact.html`
- `detailproduct.html`
- `favourite.html`
- `forgot-password.html`
- `index.html`
- `login.html`
- `order-success.html`
- `order.html`
- `privacy.html`
- `shipping&returns.html`
- `shop.html`
- `size-guide.html`
- `terms.html`
- `main.js`

## Verification

Status: **DONE_VERIFIED (source ownership gate)**

- Every root HTML route references `atelier-v14-site.css?v=atelier-v14-site`.
- Every root HTML body carries the `v14` marker.
- No root HTML retains the V13 stylesheet owner or `v13` body marker.
- `main.js` exposes `data-atelier-style=luxury-monochrome` for QA.
- Rendered visual QA remains a separate Phase 4 gate.
