# Plan: place description field

Date: 2026-09-03
Spec: docs/superpowers/specs/2026-09-03-description-field.md
Status: done

TDD, one commit per task, tests written first (red) then implementation (green). `npx vitest run`, `npx tsc -b`, `npm run lint`, `npm run build` all green at the end.

## Tasks

1. **Model + export/import** (`src/types.ts`, `src/exportImport.ts`) — `Place.description?`, `SerializedPlace.description?`, validation `place #N: invalid description.`, round-trip. Tests: round-trip with description, undefined when absent, reject non-string. Commit `5aa31ff`.
2. **Form** (`src/components/PlaceForm.tsx`) — optional multiline textarea after the address, pre-filled in edit, trimmed on save (`undefined` if empty). Tests: save, trim, empty → undefined, pre-fill. Commits `0c2de0a` + `b98490a` (fix: one assertion had kept the old French label).
3. **Details view** (`src/components/PlaceDetails.tsx`, `src/App.css`) — `.details-description` paragraph between header and gallery, `white-space: pre-line`, hidden when absent. Tests: shown when present, hidden when absent. Commit `f1dc4fa`.
4. **Import script** (`scripts/build-import-from-folder.ts`) — `ManifestPlace.description?` + `SerializedPlace.description?`, trimmed passthrough. Test: passthrough trimmed. Commit `6d650b9`.
5. **Docs** — this plan + spec, README highlight. Verification suite.

## Follow-up (data, separate pass)

Descriptions for the 18 new import-data places + the 8 already-imported ones, entered via `import-data/manifest.json`, single regenerate + reimport.
