# MyMap — Spécification : interface graphique façon HelloAsso (design system atomic)

Date : 2026-09-03
Statut : validé (design approuvé section par section après questions de cadrage)

## Objectif

Réaliser l'interface graphique de MyMap en s'appuyant sur la direction artistique de
https://info.helloasso.com/ (tokens extraits du CSS de production), avec les bonnes pratiques
du métier : design system complet dans le code, structuré en atomes → molécules → organismes,
tous les assets regroupés, et une page styleguide vivante dans l'app.

## Décisions de cadrage

1. **Design system intégré léger** : `src/ui/` (tokens + atoms + molecules + styleguide) ;
   les écrans métier restent dans `src/components/` et consomment le DS ; `App.css` est
   supprimé en fin de migration. Pas de Storybook, pas de routeur.
2. **7 couleurs de types conservées** mais ré-harmonisées avec la DA (même famille de
   saturation/luminosité, ancrées sur l'iris) ; elles se distinguent du chrome de l'app.
3. **Icônes SVG `lucide-react`** partout ; les emojis disparaissent de toute l'UI.
4. **Polices self-hostées** via `@fontsource/open-sans` (400/600/700/800) et
   `@fontsource/besley` (500 italique) — offline PWA OK, zéro requête externe.
5. **Styleguide vivante** accessible par hash `#styleguide`, documentée dans le README.
6. **Reskin fidèle + raffinements** : structure et interactions actuelles conservées ;
   habillage complet DA + espacement, hiérarchie, focus states, barre mobile flottante.

## Fondations — tokens (`src/ui/tokens.css`)

Seul fichier contenant des valeurs brutes. Tous les autres CSS consomment des tokens.

### Couleurs de la charte (extraites de la DA HelloAsso)

| Token | Valeur | Usage |
|---|---|---|
| `--ha-bg` | `#fffbf5` | fond de page (crème) |
| `--ha-surface` | `#ffffff` | cartes, panneaux, modales |
| `--ha-navy` | `#131445` | texte principal, surfaces sombres |
| `--ha-iris` | `#4c40cf` | primaire : CTA, liens, focus, sélection |
| `--ha-iris-20` | `#dbd9f5` | fonds clairs, badges, survols |
| `--ha-iris-10` | `#eeecfb` | fonds très clairs |
| `--ha-sun` | `#f9c339` | accent ambre : CTA secondaires (pilule) |
| `--ha-rose` | `#e882e8` | accent éditorial ponctuel |
| `--ha-purple` | `#2a267c` | accent éditorial ponctuel |
| `--ha-muted` | `#505870` | textes secondaires |
| `--ha-border` | `#e9e2d6` | bordures chaudes sur crème |
| `--ha-danger` | `#e5484d` | suppression |
| `--ha-success` | `#1f9d55` | état « fait », confirmations |

### Couleurs des 7 types (calibrées S≈60 / L≈42, texte blanc AA)

| Type | Icône lucide | Couleur | Teinte douce (badge) |
|---|---|---|---|
| Visite | `Landmark` | `#4c40cf` | `#eeecfb` |
| Balade | `TreePine` | `#27995c` | `#e2f4ea` |
| Restaurant | `UtensilsCrossed` | `#d96a06` | `#fdeeda` |
| Gourmandise | `CakeSlice` | `#c2449c` | `#f9e3f2` |
| Hébergement | `BedDouble` | `#11788c` | `#dcf0f4` |
| Shopping | `ShoppingBag` | `#d93b55` | `#fbe2e6` |
| Autre | `MapPin` | `#6e7691` | `#eef0f5` |

Milieux : Extérieur `Sun`, Intérieur `Home` — pastille sur fond `--ha-iris-10`, icône et
texte navy.

Chaque type expose un token `--type-{id}` et `--type-{id}-soft`. `constants.ts` est mis à
jour pour référencer ces couleurs ; les champs `emoji` de `PlaceTypeDef`/`MilieuDef`
disparaissent (l'icône est dérivée du mapping `src/ui/icons.ts`).

### Typographie

- `--font-main` : Open Sans ; `--font-accent` : Besley.
- Corps : 16px/1.5, letter-spacing -0.2px, couleur navy.
- Titres : uppercase, graisse 800, letter-spacing négatif (titre de fiche 24px/28/-1.2px).
- Méta 14px ; labels 12px uppercase ; boutons 16px/600 (small 14px).
- Besley italique 500 réservé à **un seul mot d'accent par titre** (signature HelloAsso
  `.italic-style`), ex. état vide : « Aucun lieu *pour l'instant* ».

### Formes, ombres, mouvement

- Rayons : boutons/inputs 8px, vignettes 12px, cartes/modales 24px, pilules 999px.
- Ombres : `--shadow-sm` `0 2px 9px 2px rgba(0,0,0,.03)` ; `--shadow-md`
  `0 5px 15px 5px rgba(0,0,0,.03)` ; `--shadow-lg` `0 10px 40px 10px rgba(0,0,0,.06)`.
- Transitions 150–200ms ease-out ; survol pilules/boutons ambre `scale(1.05)` ;
  `prefers-reduced-motion` respecté.

## Iconographie (`src/ui/icons.ts`)

Mapping centralisé (assets regroupés) :

- **Types** : `Landmark`, `TreePine`, `UtensilsCrossed`, `CakeSlice`, `BedDouble`,
  `ShoppingBag`, `MapPin`.
- **Milieux** : `Sun`, `Home`.
- **Actions** : `Plus`, `Search`, `LocateFixed`, `Download`, `Upload`, `Trash2`, `Pencil`,
  `Check`, `ArrowLeft`, `X`, `ImagePlus`, `ChevronLeft`, `ChevronRight`, `EyeOff`, `List`,
  `Map`, `MapPinned`, `AlertTriangle`.

Trait 2px arrondi (défaut lucide), tailles normalisées (14/16/18/20/24).

## Atomes (`src/ui/atoms/`)

| Atome | Spécification |
|---|---|
| `Button` | Variantes `primary` (iris plein, radius 8, hover navy), `accent` (pilule ambre, radius 999, hover scale 1.05), `outline`, `ghost`, `danger`, `dark` (navy) ; tailles sm/md/lg ; slots icône gauche/droite ; disabled/loading |
| `IconButton` | Carré 40px, ghost, hover `iris-10`, focus ring iris |
| `Badge` | Pastille type : fond teinte douce, texte/icône couleur type ; variante `success` |
| `Pill` | Filtre : idle = blanc + bordure 1.5px couleur type ; active = fond couleur type + texte blanc ; hover scale |
| `Input` / `Textarea` / `Select` | Blanc, bordure `--ha-border`, radius 8, focus bordure iris + ring `iris-20` 3px |
| `Checkbox` | Case 18px radius 4, coche iris, label à droite |
| `Spinner` | Loader iris 16/24px |
| `TypeIcon` | Icône lucide du type colorée par son token |

## Molécules (`src/ui/molecules/`)

| Molécule | Spécification |
|---|---|
| `SearchField` | Input + loupe + dropdown résultats (radius 12, ombre md, items hover `iris-10`) + Spinner + erreur |
| `PlaceCard` | Vignette (photo ou teinte douce + TypeIcon) + titre uppercase + adresse/méta + Badge + DoneToggle ; hover ombre md, sélection ring iris, fait estompé |
| `DoneToggle` | Rond 28px, coche ; actif = fond `--ha-success` |
| `MarkerPin` | Épingle goutte : fond couleur type, icône lucide blanche, bordure blanche 2px, ombre ; états fait / sélectionné / draft (navy + pulse) |
| `PhotoThumb` | Vignette radius 12 + bouton suppression flottant |
| `EmptyState` | Icône dans pastille `iris-10` + texte avec accent Besley italique |
| `MilieuChip` | Pastille `Sun`/`Home` Extérieur/Intérieur |
| `StorageBanner` | Alerte douce fond `#fdecec` texte `#9c2327`, `AlertTriangle` |

Convention : chaque composant DS a son CSS colocalisé (ex. `Button.css`) consommant
uniquement des tokens.

## Écrans (organismes métier dans `src/components/`, consommant le DS)

| Écran | Traitement DA |
|---|---|
| Header | Logo `MapPinned` iris + « MyMap » uppercase 800 navy ; SearchField au centre ; toolbar IconButtons ; CTA « Ajouter un lieu » primary (mode ajout → « Annuler » danger) ; fond crème, bordure basse |
| Barre de filtres | Pills par type + pilule « Masquer les faits » (`EyeOff`) ; scroll horizontal mobile |
| Carte | Tuiles OSM inchangées ; MarkerPins relookés ; contrôles zoom restylés (blancs, radius 8, ombre sm) ; crosshair en mode ajout |
| Colonne liste | Panneau blanc bord gauche ; PlaceCards ; vide = EmptyState + CTA pilule ambre |
| Fiche détaillée | Retour ghost `ArrowLeft` ; titre uppercase 800 24px ; MilieuChip + Badge ; galerie PhotoThumbs ; `dt` uppercase 12px ; Modifier (outline), fait (outline success), Supprimer (danger) + confirmation inline |
| Formulaire (modale) | Overlay navy 55% ; panneau blanc radius 24 ; champs DS ; zone photos pointillés `iris-20` + `ImagePlus` ; Annuler (ghost) / Enregistrer (primary) |
| Visionneuse | Lightbox navy 92% ; `ChevronLeft/Right`, `X` |
| Onglets mobiles | Barre flottante pilule (blanc, ombre lg, radius 999) centrée bas ; segments Carte/Liste + compteur ; actif iris plein |
| Bannière stockage | StorageBanner sous le header si IndexedDB indisponible |

Icônes PWA et manifest re-teintés : fond crème, épingle iris, `theme_color: #4c40cf`,
`background_color: #fffbf5`.

## Styleguide (`src/ui/styleguide/`)

- Accès : `location.hash === '#styleguide'` (aucun routeur), lien documenté dans le README.
- Sections : swatches couleurs + noms de tokens, échelle typo, rayons/ombres, table
  d'iconographie complète, chaque atome avec toutes ses variantes, molécules avec données
  factices.
- Rendu façon DA : fond crème, container max 60rem, titres uppercase avec accent Besley.

## Architecture & migration

```
src/ui/
  tokens.css / base.css / icons.ts
  atoms/     # Button, IconButton, Badge, Pill, Input, Textarea, Select, Checkbox, Spinner, TypeIcon
  molecules/ # SearchField, PlaceCard, DoneToggle, MarkerPin, PhotoThumb, EmptyState, MilieuChip, StorageBanner
  styleguide/
src/components/  # écrans métier migrés, CSS réécrit à base de tokens (colocalisé)
```

Dépendances ajoutées : `lucide-react`, `@fontsource/open-sans`, `@fontsource/besley`.

Migration en 3 phases livrables (app fonctionnelle entre chaque) :

1. **Fondations** — tokens.css, base.css, polices, re-teinte PWA/manifest : le fond et les
   couleurs globales basculent.
2. **Design system** — atoms → molecules → styleguide (+ smoke tests) : aucun impact écrans.
3. **Écrans** — header, filtres, carte/marqueurs, liste, fiche, formulaire, visionneuse,
   onglets mobiles → suppression de `App.css`.

## Accessibilité, responsive, tests

- Focus visible : outline 2px iris + offset (amélioration assumée vs bleu Webflow de la DA).
- Contrastes AA : couleurs types calibrées L≈42 pour texte blanc ; navy sur crème ≈ 14.9:1.
- Cibles tactiles ≥ 40px (IconButton, Pill, DoneToggle) ; `prefers-reduced-motion`.
- Responsive : breakpoint 900px conservé ; barre flottante mobile ; filtres scrollables.
- Tests : tests Vitest/Testing Library existants restent verts (requêtes par rôle/label/
  texte — aria-labels et libellés préservés) ; smoke tests des variantes d'atoms ;
  vérification visuelle via `#styleguide` ; `npm run lint` + `npm run build` à chaque phase.

## Hors périmètre

- Mode sombre, restructuration des écrans, nouvelles fonctionnalités, changement de moteur
  de carte, tuiles personnalisées, redesign du flux export/import (logique inchangée).
