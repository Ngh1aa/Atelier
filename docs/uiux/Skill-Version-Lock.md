# Skill Version Lock — ATELIER V16

## Active lock

- Repository: `Ngh1aa/skills_UIUX`
- Library version: **V5.4 + elementary visual-integrity hardening**
- Branch resolved: `main`
- Immutable commit SHA: `aa9c04e48a32cd1b643c6e9e6129be4ba70c38de`
- Checked: **2026-09-07**
- Source: GitHub `main` after reusable visual-integrity runner, overlap/state/crop hardening and regression eval updates
- Project baseline at migration: `44fa3226df531892e687b85b8f4acfa58772824d`

All subsequent ATELIER phases must use this SHA unless another explicit migration review records conflict, decision and ledger impact.

## Migration review — V5.4 baseline → V5.4 visual-integrity hardening

### Previous lock

- Version: **V5.4**
- SHA: `b8e0f8a0efccbb468834a10de6dcfa32bf2dfb02`
- Used by the prior V14/V15 remediation work.

### Trigger

The user supplied rendered Home screenshots after the previous release showing an obvious remaining visual-integrity defect: the right hero caption could sit underneath the noir decision panel, and the full-canvas `contain` strategy preserved the subject but did not define a source-aware media frame. The user had already requested that generalizable CSS/media failures be hardened in `skills_UIUX` so they do not recur.

### Conflict review

- `FACT`: SHA `aa9c04e48a32cd1b643c6e9e6129be4ba70c38de` preserves the existing V5.4 lifecycle and ATELIER brand/design decisions.
- `FACT`: it strengthens elementary visual sanity, crop/media verification, shared-owner coverage and adds reusable visual-integrity tooling.
- `FACT`: ATELIER remains `desktop_only`; tablet/mobile remain `N/A_JUSTIFIED` unless the user expands responsive scope.
- `EVIDENCE_BACKED_INFERENCE`: adopting the hardening SHA is compatible with the passed V14 Design Contract because it changes verification rigor, not the approved youthful-luxury direction.
- No known migration conflict requires design rollback, behavior change or architecture migration.

### Decision

Adopt `aa9c04e48a32cd1b643c6e9e6129be4ba70c38de` for the V16 Home visual-integrity remediation and future phases. Historical evidence remains attributed to the SHA actually used in those phases.

### Verification

- `skills_UIUX/main` validation passed at `aa9c04e48a32cd1b643c6e9e6129be4ba70c38de`.
- The new V16 project regression must prove hero caption/panel non-overlap and source-aware portrait media behavior before phase PASS.
