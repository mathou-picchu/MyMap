# MyMap — Spécification de design

**Date** : 2026-09-02
**Statut** : Validé par l'utilisateur

## Vision

Application web installable (PWA) façon Google Maps : une carte sur laquelle chaque utilisateur crée ses propres points d'intérêt (lieux à visiter, restaurants, parcs...).

**Principe fondamental** : le projet (le code) est partageable — n'importe qui peut le récupérer et l'utiliser. Les données (les points) sont personnelles : elles restent dans le navigateur de chaque utilisateur et ne sont jamais envoyées nulle part. Comme une app du store : l'app est partagée, les données de chacun lui appartiennent.

## Fonctionnalités

### 1. Carte
- Leaflet + tuiles OpenStreetMap (gratuit, aucune clé API requise — le projet reste utilisable immédiatement par quiconque le récupère)
- Marqueurs colorés par type de lieu, avec icône
- Position/zoom de la carte mémorisés entre les sessions (localStorage)
- Bouton « Me localiser » (géolocalisation navigateur)

### 2. Création de points — deux chemins
- **Recherche d'adresse** : champ de recherche → géocodage via Nominatim (gratuit, sans clé, appels avec debounce) → liste de résultats → clic sur un résultat → la carte se centre, un pin temporaire apparaît, le formulaire s'ouvre pré-rempli (nom, adresse, coordonnées)
- **Clic sur la carte** : bouton « ＋ Ajouter un lieu » activant un mode ajout (curseur distinct) → clic sur la carte → formulaire. Le mode dédié évite les créations accidentelles pendant la navigation. Esc ou re-clic sur le bouton pour annuler.

### 3. Formulaire de point
- Nom (requis)
- Adresse (requis, pré-remplie par le géocodage, modifiable)
- Type (select illustré, voir liste fixe ci-dessous)
- Horaires d'ouverture : texte libre (« Lun-Ven 9h-18h, Sam 10h-13h »)
- Prix : case « Gratuit » ; si décochée, champ texte prix (« 12 € »)
- Photos : sélection multiple (galerie ou appareil photo sur mobile), miniatures avec suppression
- Boutons Annuler / Enregistrer

### 4. Types de lieux — liste fixe (7)
| Type | Icône | Identifiant |
|---|---|---|
| Extérieur | 🌳 | `outdoor` |
| Visite | 🏛️ | `visit` |
| Nourriture | 🍽️ | `food` |
| Boisson | 🍷 | `drink` |
| Shopping | 🛍️ | `shopping` |
| Hébergement | 🛏️ | `lodging` |
| Autre | 📍 | `other` |

Chaque type a sa couleur de marqueur et son emoji.

### 5. Double vue carte / liste (façon Airbnb / SeLoger)
- **Desktop** : écran scindé — carte à gauche (~60 %), colonne de droite (~40 %) avec liste de cartes défilante. Cliquer sur une carte ou un pin ouvre la fiche détaillée dans la colonne de droite (bouton « ← Retour à la liste »).
- **Mobile** : onglets « Carte » / « Liste ». Fiche détaillée en panneau coulissant bas (bottom sheet).
- **Cartes de la liste** : photo miniature (ou couleur du type si pas de photo), nom, badge type (couleur + icône), adresse, prix/gratuit, horaires en résumé.
- **Synchronisation** : clic sur un pin → centrage + fiche ouverte ; clic sur une carte → la carte glisse vers le pin + fiche ouverte.
- Liste triée par ajout récent (plus récent en premier).

### 6. Fiche détaillée
- Toutes les infos du point
- Galerie photo (miniatures cliquables, visionneuse plein écran simple)
- Boutons Modifier (rouvre le formulaire pré-rempli) et Supprimer (avec confirmation)

### 7. Filtrage par type
- Barre de pastilles (une par type, couleur + icône), toutes actives par défaut
- Clic sur une pastille → masque/affiche les points de ce type
- S'applique simultanément à la carte ET à la liste
- État mémorisé entre les sessions (localStorage)

### 8. Export / Import
- **Export** : télécharge `mymap-export-YYYY-MM-DD.json` — tous les points, photos converties en base64, format versionné (`"version": 1`)
- **Import** : sélection du fichier → validation (format, version) → confirmation « Remplacer les X points actuels par les Y points du fichier ? » → remplacement complet (sémantique : remplacer, pas fusionner)
- Permet la sauvegarde et le transfert entre appareils (ex. ordinateur ↔ téléphone)

### 9. PWA
- Manifest complet (nom, icônes 192/512, standalone, thème)
- Service worker : app shell en cache (démarrage offline), tuiles déjà visitées mises en cache ; les nouvelles tuiles nécessitent du réseau
- Installable depuis Chrome/Safari (« Ajouter à l'écran d'accueil »)
- Interface en français

## Non-objectifs (explicitement hors scope)
- Aucun compte utilisateur, aucun serveur, aucune synchronisation cloud
- Pas de partage de points entre utilisateurs
- Pas de types personnalisables (liste fixe)
- Pas d'horaires structurés par jour (texte libre)
- Pas d'itinéraires, notes, favoris, recherche dans les points

## Stack technique

- **Build** : Vite + React 19 + TypeScript
- **Carte** : react-leaflet + Leaflet, tuiles OpenStreetMap
- **Stockage** : IndexedDB via `idb`
- **Géocodage** : API Nominatim (OpenStreetMap)
- **PWA** : vite-plugin-pwa (Workbox)
- **Tests** : Vitest + @testing-library/react + fake-indexeddb
- **Qualité** : ESLint

## Structure du projet

```
MyMap/
├── index.html
├── vite.config.ts          # React + plugin PWA
├── public/                 # icônes PWA
└── src/
    ├── main.tsx / App.tsx  # état global : sélection, filtres, vues
    ├── types.ts            # modèle Place
    ├── constants.ts        # types de lieux, couleurs, icônes
    ├── db.ts               # CRUD IndexedDB
    ├── exportImport.ts     # export/import JSON
    ├── geocoding.ts        # recherche Nominatim
    ├── photoUtils.ts       # compression photos
    └── components/
        ├── MapView.tsx       # carte + marqueurs
        ├── SearchBar.tsx     # recherche d'adresse
        ├── PlaceForm.tsx     # création / édition
        ├── PlaceList.tsx     # liste de cartes
        ├── PlaceDetails.tsx  # fiche + galerie
        ├── TypeFilter.tsx    # pastilles de filtres
        └── Toolbar.tsx       # export / import / localisation
```

Chaque module non-UI (`db`, `exportImport`, `geocoding`, `photoUtils`) a une responsabilité unique, une interface claire, et est testable indépendamment.

## Modèle de données

```ts
type PlaceTypeId = 'outdoor' | 'visit' | 'food' | 'drink'
                 | 'shopping' | 'lodging' | 'other';

interface PlacePhoto {
  id: string;   // crypto.randomUUID()
  blob: Blob;   // JPEG compressé côté client
}

interface Place {
  id: string;            // crypto.randomUUID()
  name: string;          // requis
  address: string;       // requis
  lat: number;
  lng: number;
  hours?: string;        // texte libre
  isFree: boolean;
  price?: string;        // présent si isFree === false
  type: PlaceTypeId;
  photos: PlacePhoto[];
  createdAt: number;
  updatedAt: number;
}
```

## Stockage et flux de données

- IndexedDB, base `mymap`, object store `places` indexé par `id`
- Les photos sont stockées comme Blobs directement dans l'enregistrement du point (support natif IndexedDB)
- Aucune donnée ne quitte le navigateur, sauf action explicite d'export

### Photos — pipeline de compression
- Sélection via `<input type="file" accept="image/*" multiple capture="environment">` (galerie ou appareil photo mobile)
- Lecture du File → redimensionnement canvas (côté le plus long ≤ 1600 px) → JPEG qualité 85 % → Blob (~200-400 Ko typique)
- Affichage via `URL.createObjectURL`, révocation au démontage

### Format d'export
```json
{
  "version": 1,
  "exportedAt": 1725283200000,
  "places": [
    { "id": "...", "name": "...", "photos": [{ "id": "...", "data": "<base64>" }] }
  ]
}
```

## Gestion d'erreurs

| Cas | Comportement |
|---|---|
| Nominatim indisponible / rate-limité | Message « Recherche indisponible » + le clic carte reste utilisable |
| IndexedDB indisponible (mode privé) | Bandeau d'avertissement persistant |
| Fichier d'import invalide (format/version) | Message d'erreur, aucune donnée touchée ; validation complète avant remplacement, écriture en transaction unique |
| Suppression d'un point | Confirmation explicite requise |
| Annulation du formulaire | Points et photos temporaires non persistés |

## Stratégie de tests

- **Unitaires (Vitest)** :
  - `photoUtils` : dimensions/qualité de compression, formats d'entrée
  - `exportImport` : aller-retour export → import sans perte, rejet des fichiers invalides, conversion base64 ↔ Blob
  - `db` : CRUD complet avec fake-indexeddb
- **Composants (@testing-library/react)** :
  - `PlaceForm` : validation (nom/adresse requis), bascule gratuit/payant
  - `TypeFilter` : état des pastilles
  - `PlaceList` : rendu conditionnel selon filtres
- **Carte Leaflet** : vérification manuelle (pas d'automatisation)

## Décisions d'architecture (rationale)

- **Leaflet/OSM plutôt que Google Maps** : aucune clé API ni carte bancaire — quiconque récupère le projet peut l'utiliser immédiatement
- **IndexedDB plutôt que localStorage** : capacité (photos en Blobs) et index
- **Export en un seul JSON avec base64** : simplicité (un fichier = tout), taille acceptable après compression (~200-400 Ko/photo)
- **Remplacement complet à l'import** : sémantique prévisible et sûre pour transférer entre appareils
- **React + TypeScript** : état UI riche (formulaire multi-champs, double vue, filtres), modèle typé, évolutivité

## Évolutions futures possibles (hors scope actuel)

- Filtres supplémentaires (gratuit/payant), tri de la liste
- Recherche textuelle dans les points
- Partage optionnel d'une sélection (export partiel)
- Cache offline complet des tuiles autour des points
