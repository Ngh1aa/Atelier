# Skill Version Lock — ATELIER V14

## Active lock

- Repository: `Ngh1aa/skills_UIUX`
- Library version: **V5.4**
- Branch resolved: `main`
- Immutable commit SHA: `aa9c04e48a32cd1b643c6e9e6129be4ba70c38de`
- Checked: **2026-09-07**
- Source: GitHub `main` after V5.4 visual-sanity hardening
- Project baseline at migration: `175f9aa5677f3384a678440a8d2f8e2f0fb812a5`

All subsequent ATELIER phases must use this SHA unless another explicit migration review records conflict, decision and ledger impact.

## Current migration — luxury monochrome, 2026-09-07

The user explicitly requested installing the latest skills_UIUX and applying it
to the whole interface. The installed revision in `.uiux-profile.json` is the
current lock above. V5.4 elementary visual sanity gates remain applicable.
White/black/grey and desktop/tablet/mobile replace earlier burgundy and
desktop-only design constraints; see `Monochrome-Upgrade.md`. The migration
history below records earlier runs and does not override the current lock.

## Migration review — V5.3 → V5.4

### Previous lock

- Version: **V5.3**
- SHA: `2886d516deb6eb4fb348142f6a65351fc830237c`
- Used by the completed V14 remediation phase that fixed footer/button contrast and hero crop.

### Trigger

The user requested that the generalizable failure mode discovered in ATELIER be hardened in `skills_UIUX` so future project phases cannot legitimately PASS while skipping the corresponding rendered sanity checks.

### Conflict review

- `FACT`: V5.4 does not replace ATELIER brand/layout/content decisions.
- `FACT`: V5.4 strengthens verification ownership around surface/foreground pairing, interactive-state visibility, shared-owner route coverage, cascade/specificity and human/focal crop inspection.
- `FACT`: ATELIER's already-completed V14 remediation evidence remains valid and was produced under the previous immutable V5.3 lock.
- `EVIDENCE_BACKED_INFERENCE`: adopting V5.4 for future phases is compatible with the current Design Contract because it raises QA/reliability gates without changing the approved visual direction.
- No known migration conflict requires code rollback or design migration.

### Decision

Adopt V5.4 `b8e0f8a0efccbb468834a10de6dcfa32bf2dfb02` for **future ATELIER phases**. Keep historical phase evidence attributed to the SHA actually used at that time; do not rewrite old evidence as if it used V5.4.

### Verification

- `skills_UIUX` branch validation succeeded before main update.
- `skills_UIUX` main validation also succeeded at the new SHA.
- ATELIER main visual QA had already passed after the project remediation, and GitHub Pages deployment for that main commit succeeded.
