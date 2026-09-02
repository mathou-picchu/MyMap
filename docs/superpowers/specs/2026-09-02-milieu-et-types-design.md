# MyMap — Spécification : milieu extérieur/intérieur + nouvelle liste de types

Date : 2026-09-03
Statut : validé (design approuvé après questions de cadrage)

## Objectif

Trois changements demandés :

1. La carte s'ouvre **toujours sur Paris** (zoom 12) — la position n'est plus mémorisée.
2. **« Extérieur » n'est plus un type** : c'est un attribut de point (`isOutdoor`) avec son propre filtre Extérieur / Intérieur.
3. **Nouvelle liste de types** : Visite, Balade, Restaurant, Gourmandise, Hébergement, Shopping, Autre.

## Décisions de cadrage

- **Carte** : suppression totale de la mémorisation (`mymap.mapstate` ignoré, prop `onMoveEnd` retirée). Le bouton de géolocalisation reste inchangé.
- **Boisson** fusionne dans **Gourmandise**.
- Les anciens points « Extérieur » deviennent **Balade + extérieur**.
- Le filtre milieu est **deux pilules** (🌳 Extérieur / 🏠 Intérieur), indépendantes des filtres de type, toutes deux actives par défaut.

## Modèle de données

- `PlaceTypeId = 'visit' | 'balade' | 'restaurant' | 'gourmandise' | 'lodging' | 'shopping' | 'other'`.
- Nouveau champ `Place.isOutdoor?: boolean` (absent = intérieur par défaut à l'affichage).
- Nouveau type `MilieuId = 'outdoor' | 'indoor'`.
- `MILIEUS` et `getMilieuDef(isOutdoor)` dans `constants.ts` (couleurs : extérieur `#22c55e`, intérieur `#f59e0b`).
- `getPlaceTypeDef` garde son repli sur « Autre ».

### Liste des types

| id | Label | Emoji | Couleur |
|---|---|---|---|
| `visit` | Visite | 🏛️ | `#3b82f6` |
| `balade` | Balade | 🌳 | `#22c55e` |
| `restaurant` | Restaurant | 🍽️ | `#f97316` |
| `gourmandise` | Gourmandise | 🍰 | `#a855f7` |
| `lodging` | Hébergement | 🛏️ | `#14b8a6` |
| `shopping` | Shopping | 🛍️ | `#ec4899` |
| `other` | Autre | 📍 | `#64748b` |

## Module de migration (`src/migrations.ts`, nouveau)

- `migrateTypeId(type: string): PlaceTypeId` — convertit `outdoor → balade`, `food → restaurant`, `drink → gourmandise` ; conserve les ids actuels ; remplace un id inconnu par `other`.
- `isKnownTypeId(type: string): type is PlaceTypeId` — vraie pour les ids actuels **et** les anciens ids.
- `migratePlace(place: Place): Place` — type converti + `isOutdoor = place.isOutdoor ?? (type d'origine « outdoor »)`. Renvoie **la même référence** si rien ne change (détection d'inactivité par identité) ; la migration est idempotente.

## Export / import

- `EXPORT_VERSION` passe à **3** ; import accepte **1, 2 et 3**.
- Import : les types anciens sont convertis (`migrateTypeId`), `isOutdoor` est déduit des données (vrai pour un ancien `outdoor`, sinon faux) et validé comme booléen s'il est présent.
- Export : écrit toujours `isDone` et `isOutdoor` comme booléens explicites.
- Un export v2 existant s'importe sans perte : types convertis, milieu déduit.

## Interface

### Carte (App + MapView)
- App passe un constant `PARIS_MAP_STATE` (48.8566, 2.3522, zoom 12) à `MapView` ; plus de sauvegarde sur `moveend`, plus de lecture au démarrage.

### Formulaire (`PlaceForm`)
- Case à cocher « Extérieur » à côté de « Gratuit », décochée par défaut (= intérieur), conservée en édition, enregistrée dans `isOutdoor`.

### Fiche (`PlaceDetails`)
- Badge milieu (🌳 Extérieur / 🏠 Intérieur) affiché à côté du badge de type dans l'en-tête.

### Filtres (`TypeFilter` + App)
- Deux pilules de milieu après les pilules de type, séparées par une marge ; `aria-pressed` et style actif comme les autres pilules.
- État `activeMilieu: Set<MilieuId>` dans App, persisté (`mymap.milieu`), valeurs invalides écartées, défaut = les deux actifs.
- Filtrage : type actif **ET** milieu actif **ET** non masqué-fait — s'applique à la liste, aux marqueurs et au compteur d'onglet mobile.

## Migration au démarrage (App)

- Au chargement : `listPlaces()` → `migratePlace` sur chaque point → si un point change, `replaceAllPlaces` (enregistrement idempotent) → affichage.
- Filtres mémorisés (`mymap.filters`) : ids convertis via `migrateTypeId`, ids invalides écartés ; valeur non tableau → tous les types actifs.

## Tests (TDD)

- `migrations.test.ts` (nouveau) : conversions, ids connus, id inconnu → autre, piège `constructor`, `isOutdoor` déduit, même référence si rien à faire.
- `constants.test.ts` : nouvelle liste, `MILIEUS`, `getMilieuDef`.
- `exportImport.test.ts` : version 3, conversion d'un fichier v2 avec anciens types, rejet `isOutdoor` invalide, aller-retour milieu.
- `PlaceForm.test.tsx` / `PlaceDetails.test.tsx` : case Extérieur, badge milieu.
- `TypeFilter.test.tsx` : pilules milieu (état + callback).
- `App.test.tsx` : carte centrée sur Paris malgré un `mymap.mapstate` périmé, filtrage par milieu, migration au démarrage (avec/sans enregistrement), conversion des filtres mémorisés, validation de `mymap.milieu`.
- Littéraux `'food'` des tests existants remplacés par `'restaurant'` (le build type-checke les tests).

## Non-objectifs

- Géolocalisation améliorée, types personnalisables, filtres combinés avancés (recherche sauvegardée), modification en masse, distinction parc/jardin.
