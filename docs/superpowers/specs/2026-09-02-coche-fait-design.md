# MyMap — Spécification : coche « Fait » sur les points

Date : 2026-09-02
Statut : validé (design approuvé après questions de cadrage)

## Objectif

Permettre de marquer un point comme « fait » (activité réalisée : restaurant visité, musée vu…), de le distinguer visuellement dans la liste et sur la carte, et de pouvoir masquer les points faits.

## Décisions de cadrage

- **Une seule notion** : coche « Fait ». Pas de notion de « favori » (étoile) — écartée.
- **Deux points d'interaction** : bouton dans la fiche détaillée + coche cliquable directement sur chaque carte de la liste (sans ouvrir la fiche). Pas de bascule depuis les marqueurs de la carte.
- **Filtrage** : un bouton unique « Masquer les faits » (deux états). Pas de sélecteur Tous / À faire / Faits.
- **Visuel** : coche verte + estompage. Liste : coche remplie verte sur la carte + contenu estompé (opacité 0.55). Carte : marqueur estompé + petit badge ✓ vert.

## Modèle de données

- `Place.isDone?: boolean` (champ optionnel, absent/faux = à faire). Les points déjà en base restent valides sans migration.
- Création via le formulaire : `isDone: false`. Édition : conserve la valeur existante (`place?.isDone ?? false`).
- La bascule met à jour `updatedAt` (c'est une modification du point) ; le tri de la liste reste fondé sur `createdAt`, inchangé.

## Export / import

- `EXPORT_VERSION` passe à **2**.
- Export : écrit toujours `isDone` comme booléen explicite.
- Import : accepte les versions **1 et 2**. Un point v1 sans `isDone` devient `isDone: false`. En v2, le champ est validé comme booléen s'il est présent. Les autres versions sont rejetées.
- Compatibilité ascendante garantie : un export v2 importé dans une ancienne version de l'app refuserait proprement (contrat de version explicite conservé).

## Interface

### Fiche détaillée (`PlaceDetails`)
- Nouveau prop `onToggleDone(id)`.
- Bouton dans les actions : « ✓ Marquer comme fait » → devient « ✓ Fait » (style vert) quand le point est fait. Cliquer bascule dans l'autre sens.

### Liste (`PlaceList`)
- Nouveaux props : `onToggleDone(id)` et `emptyHint?: string`.
- Chaque carte porte une coche ✓ ronde en haut à droite, cliquable, avec `stopPropagation` (ne sélectionne pas la carte). `aria-pressed` reflète l'état ; libellé accessible « Marquer comme fait » / « Marquer comme à faire ».
- Carte d'un point fait : classe `done` → coche remplie verte, contenu estompé.
- État vide : si des points existent mais sont masqués par le filtre, message « Tous vos points sont faits ! Décochez « Masquer les faits » pour les revoir. » passé via `emptyHint` par App ; sinon message existant.

### Carte (`MapView`)
- Le marqueur d'un point fait garde son emoji de type, prend la classe `done` (opacité réduite) et reçoit un petit badge ✓ vert superposé en haut à droite du pin.
- Pas de test automatisé (convention existante : la carte Leaflet se vérifie manuellement).

### Filtre « Masquer les faits »
- État `hideDone: boolean` dans App, persisté dans `localStorage` (`mymap.hidedone`), validé (valeur non booléenne → faux).
- Rendu comme une pilule verte en fin de rangée de filtres de type (`TypeFilter` étendu des props `hideDone` / `onToggleHideDone`), visuellement séparée par une marge.
- Actif : `filteredPlaces` exclut les points faits — s'applique à la liste, aux marqueurs et au compteur de l'onglet mobile « Liste (n) ».

### Bascule (App)
- `handleToggleDone(id)` : enregistre `{ ...place, isDone: !place.isDone, updatedAt: now }` puis rafraîchit la liste ; la fiche ouverte se met à jour automatiquement.

## Tests (TDD)

- `exportImport` : aller-retour avec `isDone`, export v2 explicite, import v1 sans champ (→ faux), rejet version inconnue.
- `PlaceDetails` : bascule appelle `onToggleDone(id)`, libellé « ✓ Fait » si déjà coché.
- `PlaceList` : coche appelle `onToggleDone` sans sélectionner, classe `done`, `emptyHint`.
- `TypeFilter` : pilule « Masquer les faits » reflète l'état et déclenche le callback.
- `App` : masquage des points faits à l'activation du filtre.

## Non-objectifs

- Notion de favori (étoile), filtre à 3 états, tri spécifique des points faits, bascule depuis les marqueurs, date de réalisation de l'activité.
