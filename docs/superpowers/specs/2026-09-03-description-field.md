# MyMap — Spec: place description field

Date: 2026-09-03
Status: implemented

## Decision

Add an optional free-text `description` to every place, focused on what makes it specific (its unique purpose/vibe), e.g. “Café pli — s’écrire une lettre reçue dans 1, 5 ou 20 ans”.

## Design

- `Place.description?: string` — optional, trimmed on save, `undefined` when empty. No length limit, multiline allowed (`white-space: pre-line`).
- **Form**: optional multiline textarea (3 rows) after the address; pre-filled in edit mode.
- **Details view**: dedicated paragraph between the header and the photo gallery, hidden when absent. **Not shown on list cards** (kept compact) — user decision.
- **Export format**: stays **version 3** (backward compatible): `SerializedPlace.description?`, validated like `hours`/`price` (optional string, error `place #N: invalid description.`). Existing v3 files without the field keep parsing; older app builds ignore it.
- **Import script**: `ManifestPlace.description?`, passed through trimmed.
- **Data**: descriptions are user data (French by convention, like addresses/hours). No migration: existing places simply have no description.

## Supersedes

Nothing — purely additive.
