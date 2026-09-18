# ATELIER V16 — Interaction & Commerce Rationale

**Status:** IMPLEMENTED RATIONALE + PLANNED VALIDATION. No participant findings, conversion lift or production-payment claims are made.

## Product tension

ATELIER deliberately uses two different experience modes:

- **Editorial discovery** creates desire through image hierarchy, asymmetry and restrained motion.
- **Transactional decision** progressively reduces ambiguity around colour, size, availability, fit, delivery, returns and completion.

The design goal is not “more motion” or “more luxury decoration.” It is to know when expression should lead and when clarity should take over.

## Decision-density gradient

| Surface | Brand expression | Decision density | Primary user question |
| --- | --- | --- | --- |
| Home | High | Low | Is this world for me? |
| Collections | High | Low–medium | Which look or story interests me? |
| Shop | Medium | Medium | Which pieces fit my intent? |
| PDP | Controlled | High | Is this exact variant right for me? |
| Bag | Low | High | Is my selection correct? |
| Checkout | Lowest | Highest | Can I complete this without error? |

## Interaction jobs

### 1. Hierarchy
Editorial/image reveal establishes reading order. It may not delay access to primary product or transaction controls.

### 2. Affordance
Product hover/focus, size selection and Saved states clarify what can be acted on. Pointer hover is never the only route.

### 3. Feedback
Variant selection, availability language, Add-to-Bag confirmation and inline errors communicate state change immediately.

### 4. Continuity
Gallery transitions, mini-Bag motion and checkout progress explain where an action came from and what changed next.

## PDP decision contract

The PDP now places a compact decision summary immediately before the primary purchase action:

1. **Size & fit** — whether a size has been selected plus the fit description.
2. **Availability** — sourced local variant state, or explicit prototype uncertainty.
3. **Delivery & returns** — current service summary already present in the PDP.

This is intentionally not a new feature layer. It surfaces existing evidence at the moment the user is deciding whether to add the piece to Bag.

## Truthfulness rules

- Unknown inventory remains unknown.
- Sold-out and low-availability states are derived only from known local variant data.
- No urgency timer or fabricated scarcity.
- Delivery/return copy is prototype content, not fulfilment evidence.
- Browser-local Bag/Saved/Order state is described as local behavior.
- Payment processing is simulated; no real charge is claimed.

## Motion restraint rules

Motion is removed or reduced when it:
- slows a primary task;
- competes with product information;
- becomes the only state signal;
- creates spatial ambiguity;
- conflicts with `prefers-reduced-motion`.

## Planned validation questions

1. Can shoppers find fit, delivery and return information before Add to Bag without prompting?
2. Does the decision summary reduce backtracking between size, fit and service information?
3. Do shoppers understand unknown inventory as unknown rather than “probably available”?
4. Does editorial motion help orientation or feel like delay?
5. Does the transition from editorial discovery to Bag/Checkout feel coherent rather than stylistically abrupt?

## Evidence boundary

Until moderated usability sessions occur, this document records **design rationale and hypotheses only**. Any future portfolio claim must cite an observed session, a real analytics source or a clearly labeled expert audit.
