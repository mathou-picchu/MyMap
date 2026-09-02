# MyMap — Ma carte de lieux

Application web installable (PWA) façon Google Maps pour créer vos propres points d'intérêt : lieux à visiter, restaurants, parcs, hébergements…

## Points clés

- **Vos données restent chez vous** : les points sont stockés dans le navigateur (IndexedDB) et ne sont jamais envoyés nulle part. Le projet est partageable, vos données non.
- **Carte OpenStreetMap** (Leaflet) : gratuite, sans clé API.
- **Création de points** par recherche d'adresse (Nominatim) ou clic sur la carte.
- **Double vue** carte / liste de cartes, façon Airbnb.
- **Filtres par type** : Extérieur, Visite, Nourriture, Boisson, Shopping, Hébergement, Autre.
- **Photos** multiples avec compression automatique.
- **Export / import** JSON pour sauvegarder ou transférer vos points vers un autre appareil.
- Installable sur mobile et ordinateur (PWA), fonctionne hors ligne pour l'application et les tuiles déjà visitées.

## Démarrage

```bash
npm install
npm run dev
```

## Scripts

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production (vérification TypeScript incluse) |
| `npm run preview` | Prévisualise le build |
| `npm run test` | Lance les tests (Vitest) |
| `npm run lint` | Vérifie le code (ESLint) |
| `npm run icons` | Régénère les icônes PWA |

## Où sont mes données ?

Dans le stockage IndexedDB **de votre navigateur**, sous la base `mymap`. Elles ne quittent jamais votre machine, sauf si vous exportez explicitement.

Pour les sauvegarder ou les transférer sur un autre appareil : bouton **⬇️ Exporter** (télécharge un fichier JSON avec vos points et photos) puis **⬆️ Importer** sur l'autre appareil.

⚠️ Vider les données du navigateur supprime vos points : pensez à exporter régulièrement.

## Installer l'application

- **Chrome / Edge (ordinateur)** : icône d'installation dans la barre d'adresse.
- **iOS Safari** : Partager → « Sur l'écran d'accueil ».
- **Android Chrome** : menu → « Installer l'application ».

## Déploiement (GitHub Pages)

1. Dans `vite.config.ts`, ajouter `base: '/MyMap/'` (le nom de votre dépôt) à la racine de la config.
2. `npm run build` puis publier le contenu de `dist/`.

## Crédits

- Cartes et géocodage : [OpenStreetMap](https://www.openstreetmap.org/copyright) et [Nominatim](https://nominatim.org/)
