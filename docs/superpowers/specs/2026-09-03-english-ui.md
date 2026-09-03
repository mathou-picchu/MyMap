# MyMap — Spec: English-only interface

Date: 2026-09-03
Status: accepted (user decision — uniformization)

## Decision

All user-facing text is now **English**: UI strings, error messages (import, geocoding, photo compression), test titles and assertions, PWA manifest metadata, `index.html` (`lang`, `<title>`), README, and tooling messages (import build script).

This supersedes the « UI française » decision from the original MyMap spec.

## What does NOT change (stability guarantees)

- **Type ids** (`'visit'`, `'balade'`, `'restaurant'`, `'gourmandise'`, `'lodging'`, `'shopping'`, `'other'`) and **legacy migration keys** (`'outdoor'`, `'food'`, `'drink'`) — they are data/API identifiers, only display labels are translated.
- **localStorage keys** (`mymap.filters`, `mymap.milieu`, `mymap.hidedone`) and the removed `mymap.mapstate`.
- **Export format v3** and the IndexedDB schema — no data migration needed.
- **Existing user data**: place names, addresses and hours stay as entered (real-world data, e.g. French addresses).
- Historical specs/plans under `docs/superpowers/` remain in French (archives).

## Glossary (FR → EN)

| French | English |
|---|---|
| Ajouter un lieu | Add a place |
| Rechercher une adresse ou un lieu | Search an address or a place |
| Me localiser / Localiser | Locate me |
| Exporter / Importer | Export / Import |
| Carte / Liste (n) | Map / List (n) |
| Masquer les faits | Hide done |
| ✓ Marquer comme fait / ✓ Fait | ✓ Mark as done / ✓ Done |
| Nouveau lieu / Modifier le lieu | New place / Edit place |
| Nom / Adresse / Type | Name / Address / Type |
| Horaires d'ouverture | Opening hours |
| Gratuit / Payant | Free / Paid |
| Prix | Price |
| Extérieur / Intérieur (milieu) | Outdoor / Indoor |
| Créer / Enregistrer / Annuler / Modifier / Supprimer | Create / Save / Cancel / Edit / Delete |
| Aucun point pour l'instant | No places yet |
| Stockage indisponible | Storage unavailable |
| Types : Visite, Balade, Restaurant, Gourmandise, Hébergement, Shopping, Autre | Visit, Walk, Restaurant, Dessert, Lodging, Shopping, Other |

## Tests

Test titles and string assertions are translated along with the UI (the suite must stay green after every batch). Type-id literals in tests stay unchanged.
