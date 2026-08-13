# ATELIER Desktop Upgrade — Scope & UX Decisions

## Objective

Transform the existing GitHub Pages site into a polished desktop-first luxury fashion brand experience that is credible as a catalogue, editorial destination and pre-commerce storefront. Preserve ATELIER's monochrome editorial direction and quiet-luxury positioning.

## Assumptions

| Assumption | Decision for this release | Reason |
|---|---|---|
| Deployment remains GitHub Pages | Keep the project static, without server-side code | Current public deployment and repository are static. |
| The brand needs a professional public web presence now | Prioritise desktop catalogue, product storytelling, client-service IA and credibility | These are deliverable without collecting business/payment credentials. |
| No verified payment processor, inventory system or fulfilment policy is available | Do not claim live payments, account authentication, delivery windows, return windows or legal terms that cannot be verified | A fake retail flow damages luxury-brand trust. |
| Mobile work is out of scope for this task | Do not alter responsive design intentionally; test desktop only | Explicit user instruction. |
| Product descriptions and sustainability/origin claims require owner verification | Display only existing product data plus neutral, non-legal product-care structure; flag factual content for later review | Avoid inventing material, origin, shipping or sustainability claims. |

## Recommended desktop thesis

**ATELIER is a monochrome, editorially curated fashion house: product discovery should feel deliberate and cinematic, while purchasing intent moves through a transparent “shopping bag / client services” bridge until a real commerce system is connected.**

## In-scope implementation

1. A desktop information architecture: Home, Shop, Collections, Journal, The House, Client Services, Size Guide, Shipping & Returns, Privacy, Terms and Bag.
2. Shared desktop navigation and footer, with only valid links and no dead `#` destinations.
3. A richer product model and PDP: collection context, product details, size selector, fit/care blocks, related pieces and clear client-service / purchasing state.
4. Unified Vietnamese Dong presentation across product, cart and order-related pages.
5. A static pre-commerce checkout: no fake payment success; order finalisation is replaced by a transparent “store launching / client-services” state until backend integration.
6. Desktop visual-system polish: contrast, focus states, motion preferences, layout rhythm, cards, filters and empty states.
7. Automated desktop regression and quality checks, then GitHub push.

## Explicitly deferred: requirements for real commerce

| Capability | Required before launch | Suitable path |
|---|---|---|
| Card / wallet payments | Payment provider account, business details, legal terms, server-side order validation | Shopify storefront/checkout or a full-stack commerce integration. |
| Customer accounts | Secure identity provider, database and account recovery flow | Shopify customer accounts or full-stack auth. |
| Orders / stock / fulfilment | Product inventory source, shipping zones and transactional email | Shopify or a commerce back office. |
| Client contact | Verified brand inbox or approved form provider endpoint | User-supplied inbox, Formspree/Resend backend or Shopify contact form. |
| Policy publication | Owner-verified return, shipping, privacy and terms content | Legal/business approval before making enforceable promises. |

## Design system direction

- **Personality:** quiet, assured, architectural, editorial, precise.
- **Desktop grid:** constrained content rail with deliberate full-bleed editorial moments; no decorative card elevation.
- **Typography:** retain Playfair Display + Inter, tighten heading measure and ensure muted text remains readable.
- **Interaction:** hover/focus communicate hierarchy; motion is optional and respects `prefers-reduced-motion`.
- **Conversion:** product detail and bag are primary; no fake checkout confirmation or form submission.
