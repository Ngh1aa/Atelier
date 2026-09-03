# ATELIER V13 — Desktop Performance Audit

## Key routes and condition

- Routes: Home, Shop, PDP and Checkout.
- Lab/build condition: local Vite production build on 2026-09-03 plus rendered desktop route smoke at 1363 × 936.
- Field data / CrUX / RUM: **not available**. No Core Web Vitals field claim is made.

## Proposed budgets and evidence

| Dimension | Proposed budget | Current production build evidence | Result |
|---|---:|---:|---|
| main JS | ≤ 50 KB gzip | 41.35 KB gzip | PASS |
| shared CSS | ≤ 10 KB gzip | 7.89 KB gzip | PASS |
| largest shipped visual asset | ≤ 250 KB for this static editorial catalogue | 207.29 KB | PASS |
| third-party runtime scripts | 0 unless required | 0 found in HTML/JS | PASS |
| broken first-view media | 0 | visually inspected Home/Shop/PDP/Collections/House | PASS |

Budgets are project-specific and proposed for this static prototype; they are not universal thresholds.

## Root-cause changes

- Removed the runtime chain that injected six legacy design stylesheets.
- Every HTML route now declares one explicit visual owner: `atelier-v13.css`.
- Shop cards, PDP controls, Bag empty state and Saved empty state are static-first; JavaScript hydrates behavior instead of replacing essential first-view content.
- Below-fold product/editorial media remains lazy-loaded; first-view campaign/PDP images are not lazy-loaded.
- Media uses intrinsic/source-aware frames and `object-fit: contain` for comparison/decision contexts to reduce crop risk and layout shift.
- No animation dependency or third-party UI runtime was introduced.

## Lab versus field

The production bundle and route/resource behavior were verified in lab conditions. LCP, INP and CLS field distributions remain unknown until the redesigned branch is deployed and receives real traffic. A single Lighthouse number is intentionally not used as proof of production performance.

## Regression controls

- Keep main JS under the proposed gzip budget unless a reviewed user-critical capability justifies growth.
- Keep the shared CSS owner singular; do not reintroduce versioned override chains.
- Do not lazy-load the actual first-view campaign/PDP media.
- Re-run build output review and desktop visual smoke after material media, font, routing or interaction changes.

`PERFORMANCE REVIEW = PASSED FOR PRE-MERGE DESKTOP PROTOTYPE`

