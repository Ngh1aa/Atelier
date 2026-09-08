# Violet Marketplace — UX Prototype

Violet là hướng mở rộng từ ecommerce single-brand của ATELIER sang **multi-category marketplace**. Mục tiêu không phải clone Shopee về visual, mà giữ logic mua sắm mạnh của marketplace và giảm cognitive load bằng hierarchy sạch, trust signal rõ và một design system tím premium.

## Phase 1 đã triển khai

Buyer flow chạy độc lập trong thư mục `violet/`:

- `index.html` — marketplace homepage, search-first header, campaign hero, quick actions, category discovery, Flash Deals, Violet Mall, recommendation feed, editorial commerce và trust strip.
- `search.html` — PLP/search results với filter theo category và sort shell.
- `product.html` — PDP với pricing hierarchy, voucher, variant, delivery, seller trust và Buyer Protection.
- `cart.html` — cart nhóm theo seller, quantity state và tổng tiền.
- `checkout.html` — address, item review, delivery, payment và summary không có promotion gây nhiễu.
- `styles.css` — design tokens + responsive rules dùng chung.
- `app.js` — demo catalogue, autocomplete, feed, localStorage cart và checkout interactions.

## Design direction

**Premium Consumer Tech × Editorial Commerce × Friendly Marketplace**

- Primary: Purple 700 `#6D28D9`
- Background: White / Lavender `#F7F5FF`
- Text: `#18151F`
- Sale: Rose `#E93E6F`
- Success/Delivery: Green `#14804A`
- Typography: Be Vietnam Pro
- Desktop master: 1280px content shell
- Mobile: sticky commerce navigation and simplified density

## UX principles

1. **Search first** — search is the main command center, not a small utility.
2. **Same commerce power, lower cognitive load** — promotions have hierarchy instead of competing equally.
3. **Trust at decision points** — official/Mall, seller quality, delivery and return are shown before checkout.
4. **Transparent deal math** — subtotal, discount, shipping and final total remain explicit.
5. **Marketplace-aware cart** — items are grouped by seller instead of pretending everything ships as one package.
6. **Quiet checkout** — no recommendation banners or campaign noise at the final conversion step.

## Run locally

From repository root:

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:5173/violet/
```

## Demo flow

```text
Home
  → Search / Category
    → Product Detail
      → Add to Cart / Buy Now
        → Multi-seller Cart
          → Checkout
```

Cart state is persisted in `localStorage` under `violet-cart-v1`.

## Scope boundaries

This is a **frontend UX prototype**, not a production marketplace backend. Product inventory, pricing, KYC, payment capture, fulfilment, fraud controls, chat and voucher validation are simulated UI/state only.

## Next phases

### Phase 2 — Buyer completeness
- Account / orders / tracking
- Return & refund flow
- Wishlist / followed shops
- Voucher wallet
- Reviews with media
- Seller storefront
- Responsive filter bottom sheet
- Search ranking/empty/error/loading states

### Phase 3 — Seller Center
- Dashboard
- Product & SKU management
- Inventory
- Orders / returns
- Promotions / vouchers
- Chat
- Analytics
- Store design

### Phase 4 — Marketplace Admin
- Seller KYC/moderation
- Product/category governance
- Orders/refunds/disputes
- Campaign CMS
- Voucher rules
- Fraud/risk review
- Reporting

## Architecture direction for production

Storefront can remain frontend-framework agnostic, but a production version should separate catalogue/search, order/payment, inventory, promotion and seller domains. Recommended direction from the design plan: Next.js storefront, NestJS services, PostgreSQL for transactional commerce data, Redis for cache/session, OpenSearch/Elasticsearch for search and S3-compatible object storage.
