# MyMap — Interface HelloAsso (design system atomic) — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Relooker toute l'app MyMap selon la DA HelloAsso via un design system dans le code (tokens + atomes + molécules + styleguide vivante), en 3 phases livrables.

**Architecture:** `src/ui/` contient le design system générique (tokens CSS, atomes, molécules, styleguide) ; `src/components/` contient les écrans métier qui consomment le DS ; chaque composant a son CSS colocalisé consommant uniquement des tokens. L'ancien `App.css` (732 lignes) est dissous progressivement en CSS colocalisés + `AppShell.css` (layout), puis supprimé.

**Tech Stack:** React 19 + TypeScript + Vite, CSS custom properties, `lucide-react` (icônes), `@fontsource/open-sans` + `@fontsource/besley` (polices self-hostées), Vitest + Testing Library.

**Spéc :** `docs/superpowers/specs/2026-09-03-mymap-ui-helloasso-design.md`

**Contraintes tests existantes** (à préserver sauf indication contraire) :
- `src/App.test.tsx` : heading `MyMap`, bouton `/ajouter un lieu/i`, texte `/aucun point/i`, pilules `/masquer les faits/i`, `/extérieur/i`, `/intérieur/i` avec `aria-pressed` et classe `active`.
- `src/components/PlaceList.test.tsx` : `.card-title` (querySelector), `listitem` avec classes `selected`/`done`, boutons `Marquer comme fait` / `Marquer comme à faire` avec classe `done`, texte `/aucun point/i`.
- `src/components/PlaceDetails.test.tsx` : boutons `/^supprimer$/i`, `/oui, supprimer/i`, `/modifier/i`, `/^voir la photo/i`. **Noms mis à jour en tâche 2** : `'✓ Marquer comme fait'` → `'Marquer comme fait'`, `'✓ Fait'` → `'Fait'`.
- `src/components/PlaceForm.test.tsx` : labels `Nom *`, `Adresse *`, `Type`, `Horaires`, `Gratuit`, `Prix`, `Extérieur`, `Photos`, boutons `/créer/i`, `/enregistrer/i`.
- `src/components/Toolbar.test.tsx` : `input[type="file"]` (querySelector), boutons `/exporter/i`, `/me localiser/i`.
- `src/components/SearchBar.test.tsx` : bouton `/tour eiffel — 5 avenue/i` (déplacé en tâche 7).

**Commandes de vérification** (après chaque tâche) : `npm run lint && npm run build && npm run test`.

---

## Phase 1 — Fondations

### Task 1: Dépendances, tokens, base, polices, manifest

**Files:**
- Modify: `package.json` (deps)
- Create: `src/ui/tokens.css`, `src/ui/type-colors.css`, `src/ui/base.css`
- Modify: `src/main.tsx`
- Delete: `src/index.css`
- Modify: `src/App.css` (variables de compatibilité temporaires)
- Modify: `vite.config.ts` (couleurs manifest)
- Modify: `scripts/generate-icons.mjs` (couleurs icônes PWA)

- [ ] **Step 1: Installer les dépendances**

```bash
npm install lucide-react@^1.39.0 @fontsource/open-sans@^5.3.0 @fontsource/besley@^5.3.0
```

Attendu : installation sans erreur, 3 deps dans `package.json`.

- [ ] **Step 2: Créer `src/ui/tokens.css`**

```css
:root {
  /* Couleurs charte HelloAsso */
  --ha-bg: #fffbf5;
  --ha-surface: #ffffff;
  --ha-navy: #131445;
  --ha-iris: #4c40cf;
  --ha-iris-20: #dbd9f5;
  --ha-iris-10: #eeecfb;
  --ha-sun: #f9c339;
  --ha-rose: #e882e8;
  --ha-purple: #2a267c;
  --ha-muted: #505870;
  --ha-border: #e9e2d6;
  --ha-danger: #e5484d;
  --ha-danger-bg: #fdecec;
  --ha-danger-text: #9c2327;
  --ha-success: #1f9d55;
  --ha-success-bg: #e3f4ea;

  /* Couleurs des types de lieux */
  --type-visit: #4c40cf;
  --type-visit-soft: #eeecfb;
  --type-balade: #27995c;
  --type-balade-soft: #e2f4ea;
  --type-restaurant: #d96a06;
  --type-restaurant-soft: #fdeeda;
  --type-gourmandise: #c2449c;
  --type-gourmandise-soft: #f9e3f2;
  --type-lodging: #11788c;
  --type-lodging-soft: #dcf0f4;
  --type-shopping: #d93b55;
  --type-shopping-soft: #fbe2e6;
  --type-other: #6e7691;
  --type-other-soft: #eef0f5;

  /* Typographie */
  --font-main: 'Open Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --font-accent: 'Besley', Georgia, serif;

  /* Rayons */
  --radius-sm: 8px;
  --radius-thumb: 12px;
  --radius-card: 24px;
  --radius-pill: 999px;

  /* Ombres */
  --shadow-sm: 0 2px 9px 2px rgba(0, 0, 0, 0.03);
  --shadow-md: 0 5px 15px 5px rgba(0, 0, 0, 0.03);
  --shadow-lg: 0 10px 40px 10px rgba(0, 0, 0, 0.06);

  /* Mouvement */
  --transition-fast: 150ms ease-out;
  --transition-base: 200ms ease-out;
}
```

- [ ] **Step 3: Créer `src/ui/type-colors.css`** (classes dérivées des couleurs de types, partagées par Badge/Pill/PlaceCard)

```css
.ha-badge--visit,
.type-surface--visit {
  background: var(--type-visit-soft);
  color: var(--type-visit);
}
.ha-badge--balade,
.type-surface--balade {
  background: var(--type-balade-soft);
  color: var(--type-balade);
}
.ha-badge--restaurant,
.type-surface--restaurant {
  background: var(--type-restaurant-soft);
  color: var(--type-restaurant);
}
.ha-badge--gourmandise,
.type-surface--gourmandise {
  background: var(--type-gourmandise-soft);
  color: var(--type-gourmandise);
}
.ha-badge--lodging,
.type-surface--lodging {
  background: var(--type-lodging-soft);
  color: var(--type-lodging);
}
.ha-badge--shopping,
.type-surface--shopping {
  background: var(--type-shopping-soft);
  color: var(--type-shopping);
}
.ha-badge--other,
.type-surface--other {
  background: var(--type-other-soft);
  color: var(--type-other);
}

.ha-pill--visit {
  border-color: var(--type-visit);
  color: var(--type-visit);
}
.ha-pill--visit.active {
  background: var(--type-visit);
}
.ha-pill--balade {
  border-color: var(--type-balade);
  color: var(--type-balade);
}
.ha-pill--balade.active {
  background: var(--type-balade);
}
.ha-pill--restaurant {
  border-color: var(--type-restaurant);
  color: var(--type-restaurant);
}
.ha-pill--restaurant.active {
  background: var(--type-restaurant);
}
.ha-pill--gourmandise {
  border-color: var(--type-gourmandise);
  color: var(--type-gourmandise);
}
.ha-pill--gourmandise.active {
  background: var(--type-gourmandise);
}
.ha-pill--lodging {
  border-color: var(--type-lodging);
  color: var(--type-lodging);
}
.ha-pill--lodging.active {
  background: var(--type-lodging);
}
.ha-pill--shopping {
  border-color: var(--type-shopping);
  color: var(--type-shopping);
}
.ha-pill--shopping.active {
  background: var(--type-shopping);
}
.ha-pill--other {
  border-color: var(--type-other);
  color: var(--type-other);
}
.ha-pill--other.active {
  background: var(--type-other);
}
```

- [ ] **Step 4: Créer `src/ui/base.css`**

```css
* {
  box-sizing: border-box;
}

html,
body,
#root {
  height: 100%;
}

body {
  margin: 0;
  font-family: var(--font-main);
  font-size: 16px;
  line-height: 1.5;
  letter-spacing: -0.2px;
  color: var(--ha-navy);
  background: var(--ha-bg);
}

button {
  font: inherit;
  cursor: pointer;
}

:focus-visible {
  outline: 2px solid var(--ha-iris);
  outline-offset: 2px;
}

::selection {
  background: var(--ha-iris-20);
}

/* Accent éditorial signature HelloAsso (Besley italique) */
.ha-accent {
  font-family: var(--font-accent);
  font-style: italic;
  font-weight: 500;
  text-transform: none;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 5: Réécrire `src/main.tsx`**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '@fontsource/open-sans/400.css';
import '@fontsource/open-sans/600.css';
import '@fontsource/open-sans/700.css';
import '@fontsource/open-sans/800.css';
import '@fontsource/besley/500-italic.css';
import './ui/tokens.css';
import './ui/type-colors.css';
import './ui/base.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 6: Supprimer `src/index.css` et garantir la compatibilité d'App.css**

```bash
git rm src/index.css
```

`App.css` utilisait les variables de `index.css`. Ajouter temporairement en tête de `src/App.css` :

```css
:root {
  --primary: var(--ha-iris);
  --danger: var(--ha-danger);
  --text: var(--ha-navy);
  --muted: var(--ha-muted);
  --border: var(--ha-border);
  --bg: var(--ha-bg);
}
```

(Ce bloc disparaît avec `App.css` en tâche 16.)

- [ ] **Step 7: Re-teinter le manifest** (`vite.config.ts`, remplacer les deux lignes `theme_color`/`background_color`)

```ts
        theme_color: '#4c40cf',
        background_color: '#fffbf5',
```

- [ ] **Step 8: Re-teinter les icônes PWA** (`scripts/generate-icons.mjs`, ligne `const bg = [79, 70, 229];`)

```js
  const bg = [76, 64, 207];
  const fg = [255, 255, 255];
```

Puis régénérer :

```bash
npm run icons
```

Attendu : « icon-192.png et icon-192-maskable.png générés » + « icon-512.png et icon-512-maskable.png générés ».

- [ ] **Step 9: Vérifier et committer**

```bash
npm run lint && npm run build && npm run test
```

Attendu : 0 erreur (aucun test modifié). Vérif visuelle : `npm run dev` → fond crème, textes navy.

```bash
git add package.json package-lock.json src/ui/ src/main.tsx src/index.css src/App.css vite.config.ts scripts/generate-icons.mjs public/icons/
git commit -m "feat: fondations DA HelloAsso (tokens, polices self-hostées, PWA)"
```

---

### Task 2: Module d'icônes + constants sans emoji

**Files:**
- Create: `src/ui/icons.ts`
- Modify: `src/constants.ts`
- Modify: `src/constants.test.ts`
- Modify: `src/components/TypeFilter.tsx`, `src/components/PlaceList.tsx`, `src/components/PlaceDetails.tsx`, `src/components/MapView.tsx`, `src/components/PlaceForm.tsx`
- Modify: `src/components/PlaceDetails.test.tsx` (noms sans « ✓ »)
- Test: `src/ui/icons.test.ts`

- [ ] **Step 1: Écrire le test `src/ui/icons.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { checkSvg, markerSvg, MILIEU_ICONS, TYPE_ICONS } from './icons';
import { PLACE_TYPE_IDS } from '../constants';

describe('icons', () => {
  it('mappe les 7 types vers un composant lucide', () => {
    expect(Object.keys(TYPE_ICONS).sort()).toEqual([...PLACE_TYPE_IDS].sort());
  });

  it('mappe les 2 milieux vers un composant lucide', () => {
    expect(Object.keys(MILIEU_ICONS).sort()).toEqual(['indoor', 'outdoor']);
  });

  it('génère un SVG pour chaque type de marqueur', () => {
    for (const id of PLACE_TYPE_IDS) {
      const svg = markerSvg(id, 15);
      expect(svg).toContain('<svg');
      expect(svg).toContain('stroke="currentColor"');
      expect(svg).toContain('width="15"');
    }
  });

  it('génère un SVG de coche', () => {
    expect(checkSvg(10)).toContain('<svg');
    expect(checkSvg(10)).toContain('width="10"');
  });
});
```

- [ ] **Step 2: Vérifier qu'il échoue**

```bash
npm run test -- src/ui/icons.test.ts
```

Attendu : FAIL — `Cannot find module './icons'`.

- [ ] **Step 3: Créer `src/ui/icons.ts`**

```ts
import {
  AlertTriangle,
  ArrowLeft,
  BedDouble,
  CakeSlice,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  EyeOff,
  Home,
  ImagePlus,
  Landmark,
  List,
  LocateFixed,
  Map,
  MapPin,
  MapPinned,
  Pencil,
  Plus,
  Search,
  ShoppingBag,
  Sun,
  Trash2,
  TreePine,
  Upload,
  UtensilsCrossed,
  X,
  type LucideIcon,
} from 'lucide-react';
import type { MilieuId, PlaceTypeId } from '../types';

/** Icône lucide par type de lieu (usage React). */
export const TYPE_ICONS: Record<PlaceTypeId, LucideIcon> = {
  visit: Landmark,
  balade: TreePine,
  restaurant: UtensilsCrossed,
  gourmandise: CakeSlice,
  lodging: BedDouble,
  shopping: ShoppingBag,
  other: MapPin,
};

/** Icône lucide par milieu (usage React). */
export const MILIEU_ICONS: Record<MilieuId, LucideIcon> = {
  outdoor: Sun,
  indoor: Home,
};

/** Icônes d'action (usage React). */
export const ACTION_ICONS = {
  add: Plus,
  search: Search,
  locate: LocateFixed,
  export: Download,
  import: Upload,
  delete: Trash2,
  edit: Pencil,
  done: Check,
  back: ArrowLeft,
  close: X,
  addPhoto: ImagePlus,
  prev: ChevronLeft,
  next: ChevronRight,
  hideDone: EyeOff,
  list: List,
  map: Map,
  logo: MapPinned,
  alert: AlertTriangle,
} as const;

/**
 * Tracés SVG vendored (source d'origine : lucide-static v0.544.0, licence ISC)
 * pour les marqueurs Leaflet, qui exigent du HTML string et non du React.
 * Couplage : chaque entrée doit représenter la même icône que son homologue
 * dans TYPE_ICONS (lucide-react). Les tracés peuvent différer légèrement de
 * la version de lucide-react installée — à vérifier visuellement en cas de
 * mise à jour de lucide-react.
 */
const PIN_PATHS: Record<PlaceTypeId | 'check', string> = {
  visit:
    '<path d="M10 18v-7"/><path d="M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z"/><path d="M14 18v-7"/><path d="M18 18v-7"/><path d="M3 22h18"/><path d="M6 18v-7"/>',
  balade:
    '<path d="m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z"/><path d="M12 22v-3"/>',
  restaurant:
    '<path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8"/><path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7"/><path d="m2.1 21.8 6.4-6.3"/><path d="m19 5-7 7"/>',
  gourmandise:
    '<path d="M16 13H3"/><path d="M16 17H3"/><path d="m7.2 7.9-3.388 2.5A2 2 0 0 0 3 12.01V20a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-8.654c0-2-2.44-6.026-6.44-8.026a1 1 0 0 0-1.082.057L10.4 5.6"/><circle cx="9" cy="7" r="2"/>',
  lodging:
    '<path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/><path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><path d="M12 4v6"/><path d="M2 18h20"/>',
  shopping:
    '<path d="M16 10a4 4 0 0 1-8 0"/><path d="M3.103 6.034h17.794"/><path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z"/>',
  other:
    '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
};

/** SVG string d'une icône de type (pour les marqueurs Leaflet). */
export function markerSvg(type: PlaceTypeId, size = 15): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${PIN_PATHS[type]}</svg>`;
}

/** SVG string d'une coche (pour le badge « fait » des marqueurs). */
export function checkSvg(size = 10): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${PIN_PATHS.check}</svg>`;
}
```

- [ ] **Step 4: Réécrire `src/constants.ts`** (suppression des emojis, nouvelles couleurs, milieux navy)

```ts
import type { MilieuId, PlaceTypeId } from './types';

export interface PlaceTypeDef {
  id: PlaceTypeId;
  label: string;
  color: string;
}

export const PLACE_TYPES: PlaceTypeDef[] = [
  { id: 'visit', label: 'Visite', color: '#4c40cf' },
  { id: 'balade', label: 'Balade', color: '#27995c' },
  { id: 'restaurant', label: 'Restaurant', color: '#d96a06' },
  { id: 'gourmandise', label: 'Gourmandise', color: '#c2449c' },
  { id: 'lodging', label: 'Hébergement', color: '#11788c' },
  { id: 'shopping', label: 'Shopping', color: '#d93b55' },
  { id: 'other', label: 'Autre', color: '#6e7691' },
];

export const PLACE_TYPE_IDS: PlaceTypeId[] = PLACE_TYPES.map((t) => t.id);

export function getPlaceTypeDef(id: PlaceTypeId): PlaceTypeDef {
  return PLACE_TYPES.find((t) => t.id === id) ?? PLACE_TYPES[PLACE_TYPES.length - 1];
}

export interface MilieuDef {
  id: MilieuId;
  label: string;
  color: string;
}

export const MILIEUS: MilieuDef[] = [
  { id: 'outdoor', label: 'Extérieur', color: '#131445' },
  { id: 'indoor', label: 'Intérieur', color: '#131445' },
];

export function getMilieuDef(isOutdoor: boolean): MilieuDef {
  return MILIEUS[isOutdoor ? 0 : 1];
}
```

- [ ] **Step 5: Mettre à jour `src/constants.test.ts`** (remplacer le test « a des labels, couleurs et emojis valides »)

```ts
  it('a des labels et couleurs valides', () => {
    for (const t of PLACE_TYPES) {
      expect(t.label.length).toBeGreaterThan(0);
      expect(t.color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
```

- [ ] **Step 6: Adapter les usages d'emoji (remplacements mécaniques pour compiler)**

`src/components/TypeFilter.tsx` — imports à ajouter en tête :

```tsx
import { EyeOff } from 'lucide-react';
import { MILIEU_ICONS, TYPE_ICONS } from '../ui/icons';
```

Dans le map des types, remplacer `<span aria-hidden="true">{t.emoji}</span> {t.label}` par :

```tsx
{(() => {
  const Icon = TYPE_ICONS[t.id];
  return <Icon size={14} aria-hidden="true" />;
})()}{' '}
{t.label}
```

Plus lisible : déclarer un sous-composant local au-dessus du composant principal :

```tsx
function TypePillIcon({ type }: { type: PlaceTypeId }) {
  const Icon = TYPE_ICONS[type];
  return <Icon size={14} aria-hidden="true" />;
}
```

et utiliser `<TypePillIcon type={t.id} /> {t.label}`. Idem pour les milieux :

```tsx
function MilieuPillIcon({ milieu }: { milieu: MilieuId }) {
  const Icon = MILIEU_ICONS[milieu];
  return <Icon size={14} aria-hidden="true" />;
}
```

avec `<MilieuPillIcon milieu={m.id} /> {m.label}`. La pilule « Masquer les faits » : remplacer `<span aria-hidden="true">✓</span> Masquer les faits` par `<EyeOff size={14} aria-hidden="true" /> Masquer les faits`.

`src/components/PlaceList.tsx` — dans `PlaceCard`, fallback : remplacer `{def.emoji}` par l'icône du type. Ajouter l'import `import { TYPE_ICONS } from '../ui/icons';` et au-dessus de `PlaceCard` :

```tsx
function CardFallbackIcon({ type }: { type: Place['type'] }) {
  const Icon = TYPE_ICONS[type];
  return <Icon size={24} aria-hidden="true" />;
}
```

puis `fallback={<span className="card-fallback" style={{ background: def.color }}><CardFallbackIcon type={place.type} /></span>}`. Le badge type `{def.emoji} {def.label}` devient `{def.label}` (le badge passera à la molécule `Badge` en tâche 12).

`src/components/PlaceDetails.tsx` — badges : `{def.emoji} {def.label}` → `{def.label}` et `{milieu.emoji} {milieu.label}` → `{milieu.label}` (les icônes reviennent avec Badge/MilieuChip en tâche 13). Bouton done : `{place.isDone ? '✓ Fait' : '✓ Marquer comme fait'}` → `{place.isDone ? 'Fait' : 'Marquer comme fait'}`.

- [ ] **Step 7: Mettre à jour `src/components/PlaceDetails.test.tsx`** (lignes 65 et 79)

```tsx
    await userEvent.click(screen.getByRole('button', { name: 'Marquer comme fait' }));
```

```tsx
    expect(screen.getByRole('button', { name: 'Fait' })).toBeInTheDocument();
```

- [ ] **Step 8: Adapter `src/components/MapView.tsx`** — remplacer `placeIcon` et `draftIcon` :

```tsx
import { checkSvg, markerSvg } from '../ui/icons';

function placeIcon(type: PlaceTypeId, selected: boolean, done: boolean) {
  return divIcon({
    className: 'marker-wrapper',
    html: `<div class="marker-pin${selected ? ' selected' : ''}${done ? ' done' : ''}" style="background:${getPlaceTypeDef(type).color}">${markerSvg(type, 15)}${done ? `<span class="marker-check">${checkSvg(10)}</span>` : ''}</div>`,
    iconSize: [36, 44],
    iconAnchor: [18, 42],
  });
}

const draftIcon = divIcon({
  className: 'marker-wrapper',
  html: `<div class="marker-pin draft" style="background:#131445">${markerSvg('other', 15)}</div>`,
  iconSize: [36, 44],
  iconAnchor: [18, 42],
});
```

`src/components/PlaceForm.tsx` — options du select : `{t.emoji} {t.label}` → `{t.label}`.

- [ ] **Step 9: Vérifier et committer**

```bash
npm run lint && npm run build && npm run test
```

Attendu : tout vert (y compris `icons.test.ts`).

```bash
git add src/ui/icons.ts src/ui/icons.test.ts src/constants.ts src/constants.test.ts src/components/TypeFilter.tsx src/components/PlaceList.tsx src/components/PlaceDetails.tsx src/components/PlaceDetails.test.tsx src/components/MapView.tsx src/components/PlaceForm.tsx
git commit -m "feat: icônes lucide centralisées + types sans emoji"
```

---

## Phase 2 — Design system

### Task 3: Atomes — Spinner, Button, IconButton

**Files:**
- Create: `src/ui/atoms/Spinner.tsx`, `src/ui/atoms/Spinner.css`
- Create: `src/ui/atoms/Button.tsx`, `src/ui/atoms/Button.css`
- Create: `src/ui/atoms/IconButton.tsx`, `src/ui/atoms/IconButton.css`
- Test: `src/ui/atoms/Button.test.tsx`

- [ ] **Step 1: Écrire le test `src/ui/atoms/Button.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Button from './Button';

describe('Button', () => {
  it('applique variante et taille par classes', () => {
    render(
      <Button variant="accent" size="lg">
        Go
      </Button>,
    );
    const btn = screen.getByRole('button', { name: 'Go' });
    expect(btn).toHaveClass('ha-button--accent');
    expect(btn).toHaveClass('ha-button--lg');
  });

  it('désactive pendant le chargement', () => {
    render(
      <Button loading>
        Go
      </Button>,
    );
    const btn = screen.getByRole('button', { name: 'Go' });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
    const spinner = btn.querySelector('.ha-spinner');
    expect(spinner).not.toBeNull();
    expect(spinner?.parentElement).toHaveAttribute('aria-hidden', 'true');
  });

  it('transmet type submit', () => {
    render(
      <Button type="submit">
        Ok
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Ok' })).toHaveAttribute('type', 'submit');
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

```bash
npm run test -- src/ui/atoms/Button.test.tsx
```

Attendu : FAIL — module `./Button` introuvable.

- [ ] **Step 3: Créer `src/ui/atoms/Spinner.tsx` + `Spinner.css`**

```tsx
import './Spinner.css';

interface SpinnerProps {
  size?: number;
  label?: string;
}

export default function Spinner({ size = 24, label = 'Chargement…' }: SpinnerProps) {
  return (
    <span
      className="ha-spinner"
      role="status"
      aria-label={label}
      style={{ width: size, height: size }}
    />
  );
}
```

```css
.ha-spinner {
  display: inline-block;
  border: 2.5px solid var(--ha-iris-20);
  border-top-color: var(--ha-iris);
  border-radius: 50%;
  animation: ha-spin 0.8s linear infinite;
  flex-shrink: 0;
}

@keyframes ha-spin {
  to {
    transform: rotate(360deg);
  }
}
```

- [ ] **Step 4: Créer `src/ui/atoms/Button.tsx` + `Button.css`**

```tsx
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import Spinner from './Spinner';
import './Button.css';

type ButtonVariant = 'primary' | 'accent' | 'outline' | 'ghost' | 'danger' | 'dark';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  loading = false,
  className = '',
  disabled,
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`ha-button ha-button--${variant} ha-button--${size}${className ? ` ${className}` : ''}`}
      {...rest}
    >
      {loading ? (
        <span aria-hidden="true">
          <Spinner size={16} />
        </span>
      ) : (
        iconLeft
      )}
      {children}
      {loading ? null : iconRight}
    </button>
  );
}
```

```css
.ha-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: var(--radius-sm);
  font-weight: 600;
  line-height: 1.25;
  white-space: nowrap;
  border: 1px solid transparent;
  transition:
    background-color var(--transition-base),
    color var(--transition-base),
    border-color var(--transition-base),
    transform var(--transition-base);
}

.ha-button--sm {
  padding: 6px 12px;
  font-size: 14px;
  min-height: 34px;
}

.ha-button--md {
  padding: 12px 24px;
  font-size: 16px;
  min-height: 44px;
}

.ha-button--lg {
  padding: 16px 32px;
  font-size: 18px;
  min-height: 52px;
}

.ha-button--primary {
  background: var(--ha-iris);
  border-color: var(--ha-iris);
  color: #fff;
}

.ha-button--primary:hover:not(:disabled) {
  background: var(--ha-navy);
  border-color: var(--ha-navy);
}

.ha-button--accent {
  background: var(--ha-sun);
  border-color: var(--ha-sun);
  color: var(--ha-navy);
  border-radius: var(--radius-pill);
}

.ha-button--accent:hover:not(:disabled) {
  transform: scale(1.05);
}

.ha-button--outline {
  background: var(--ha-surface);
  border-color: var(--ha-iris);
  color: var(--ha-iris);
}

.ha-button--outline:hover:not(:disabled) {
  background: var(--ha-iris);
  color: #fff;
}

.ha-button--ghost {
  background: transparent;
  color: var(--ha-navy);
}

.ha-button--ghost:hover:not(:disabled) {
  background: var(--ha-iris-10);
}

.ha-button--danger {
  background: var(--ha-surface);
  border-color: var(--ha-danger);
  color: var(--ha-danger);
}

.ha-button--danger:hover:not(:disabled) {
  background: var(--ha-danger);
  color: #fff;
}

.ha-button--dark {
  background: var(--ha-navy);
  border-color: var(--ha-navy);
  color: #fff;
}

.ha-button--dark:hover:not(:disabled) {
  background: var(--ha-iris);
  border-color: var(--ha-iris);
}

.ha-button:disabled {
  opacity: 0.55;
  cursor: default;
}

.ha-button svg {
  flex-shrink: 0;
}
```

- [ ] **Step 5: Créer `src/ui/atoms/IconButton.tsx` + `IconButton.css`**

```tsx
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './IconButton.css';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
}

export default function IconButton({ label, children, className = '', ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`ha-icon-button${className ? ` ${className}` : ''}`}
      {...rest}
    >
      {children}
    </button>
  );
}
```

```css
.ha-icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--ha-navy);
  flex-shrink: 0;
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast);
}

.ha-icon-button:hover:not(:disabled) {
  background: var(--ha-iris-10);
  color: var(--ha-iris);
}

.ha-icon-button:disabled {
  opacity: 0.55;
  cursor: default;
}
```

- [ ] **Step 6: Vérifier et committer**

```bash
npm run test -- src/ui/atoms/Button.test.tsx && npm run lint && npm run build
```

Attendu : PASS.

```bash
git add src/ui/atoms/
git commit -m "feat: atomes Button, IconButton, Spinner (DS HelloAsso)"
```

---

### Task 4: Atomes — Badge, Pill, TypeIcon

**Files:**
- Create: `src/ui/atoms/Badge.tsx`, `src/ui/atoms/Badge.css`
- Create: `src/ui/atoms/Pill.tsx`, `src/ui/atoms/Pill.css`
- Create: `src/ui/atoms/TypeIcon.tsx`
- Test: `src/ui/atoms/Badge.test.tsx`, `src/ui/atoms/Pill.test.tsx`, `src/ui/atoms/TypeIcon.test.tsx`

- [ ] **Step 1: Écrire les tests**

`src/ui/atoms/Badge.test.tsx` :

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Badge from './Badge';

describe('Badge', () => {
  it('affiche son contenu avec la classe du type', () => {
    render(<Badge color="visit">Visite</Badge>);
    expect(screen.getByText('Visite')).toHaveClass('ha-badge--visit');
  });

  it('affiche une icône devant le contenu', () => {
    render(
      <Badge color="success" icon={<span data-testid="fake-icon" />}>
        Fait
      </Badge>,
    );
    expect(screen.getByTestId('fake-icon')).toBeInTheDocument();
    expect(screen.getByText('Fait')).toBeInTheDocument();
  });
});
```

`src/ui/atoms/Pill.test.tsx` :

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Pill from './Pill';

describe('Pill', () => {
  it("marque l'état actif par classe et aria-pressed", () => {
    render(<Pill active>Restaurant</Pill>);
    const pill = screen.getByRole('button', { name: 'Restaurant' });
    expect(pill).toHaveClass('active');
    expect(pill).toHaveAttribute('aria-pressed', 'true');
  });

  it('applique la couleur demandée', () => {
    render(<Pill color="balade">Balade</Pill>);
    expect(screen.getByRole('button', { name: 'Balade' })).toHaveClass('ha-pill--balade');
  });
});
```

`src/ui/atoms/TypeIcon.test.tsx` :

```tsx
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TypeIcon from './TypeIcon';

describe('TypeIcon', () => {
  it('rend un svg pour chaque type', () => {
    const types = [
      'visit',
      'balade',
      'restaurant',
      'gourmandise',
      'lodging',
      'shopping',
      'other',
    ] as const;
    for (const type of types) {
      const { container } = render(<TypeIcon type={type} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    }
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

```bash
npm run test -- src/ui/atoms/Badge.test.tsx src/ui/atoms/Pill.test.tsx src/ui/atoms/TypeIcon.test.tsx
```

Attendu : FAIL — modules introuvables.

- [ ] **Step 3: Créer `src/ui/atoms/TypeIcon.tsx`**

```tsx
import { TYPE_ICONS } from '../icons';
import type { PlaceTypeId } from '../../types';

interface TypeIconProps {
  type: PlaceTypeId;
  size?: number;
}

export default function TypeIcon({ type, size = 16 }: TypeIconProps) {
  const Icon = TYPE_ICONS[type];
  return <Icon size={size} aria-hidden="true" strokeWidth={2} />;
}
```

- [ ] **Step 4: Créer `src/ui/atoms/Badge.tsx` + `Badge.css`**

```tsx
import type { HTMLAttributes, ReactNode } from 'react';
import './Badge.css';

type BadgeColor =
  | 'visit'
  | 'balade'
  | 'restaurant'
  | 'gourmandise'
  | 'lodging'
  | 'shopping'
  | 'other'
  | 'success'
  | 'milieu'
  | 'iris';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor;
  icon?: ReactNode;
  children: ReactNode;
}

export default function Badge({ color = 'iris', icon, children, className = '', ...rest }: BadgeProps) {
  return (
    <span className={`ha-badge ha-badge--${color}${className ? ` ${className}` : ''}`} {...rest}>
      {icon}
      {children}
    </span>
  );
}
```

```css
.ha-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 700;
  border-radius: var(--radius-pill);
  padding: 3px 10px;
  width: fit-content;
  line-height: 1.2;
}

/* Les variantes par type (ha-badge--visit, etc.) sont dans ui/type-colors.css */

.ha-badge--success {
  background: var(--ha-success-bg);
  color: var(--ha-success);
}

.ha-badge--milieu {
  background: var(--ha-iris-10);
  color: var(--ha-navy);
}

.ha-badge--iris {
  background: var(--ha-iris-20);
  color: var(--ha-iris);
}
```

- [ ] **Step 5: Créer `src/ui/atoms/Pill.tsx` + `Pill.css`**

```tsx
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Pill.css';

type PillColor =
  | 'visit'
  | 'balade'
  | 'restaurant'
  | 'gourmandise'
  | 'lodging'
  | 'shopping'
  | 'other'
  | 'navy'
  | 'success';

interface PillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  color?: PillColor;
  children: ReactNode;
}

export default function Pill({
  active = false,
  color = 'navy',
  className = '',
  children,
  ...rest
}: PillProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={`ha-pill ha-pill--${color}${active ? ' active' : ''}${className ? ` ${className}` : ''}`}
      {...rest}
    >
      {children}
    </button>
  );
}
```

```css
.ha-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: var(--radius-pill);
  padding: 8px 14px;
  font-size: 14px;
  font-weight: 600;
  min-height: 40px;
  background: var(--ha-surface);
  border: 1.5px solid var(--ha-muted);
  color: var(--ha-navy);
  white-space: nowrap;
  transition:
    transform var(--transition-fast),
    background-color var(--transition-fast),
    color var(--transition-fast),
    border-color var(--transition-fast);
}

.ha-pill:hover {
  transform: scale(1.05);
}

.ha-pill.active {
  color: #fff;
}

/* Les variantes par type (ha-pill--visit, etc.) sont dans ui/type-colors.css */

.ha-pill--navy {
  border-color: var(--ha-navy);
  color: var(--ha-navy);
}

.ha-pill--navy.active {
  background: var(--ha-navy);
}

.ha-pill--success {
  border-color: var(--ha-success);
  color: var(--ha-success);
}

.ha-pill--success.active {
  background: var(--ha-success);
}
```

- [ ] **Step 6: Vérifier et committer**

```bash
npm run test -- src/ui/atoms/ && npm run lint && npm run build
```

Attendu : PASS partout.

```bash
git add src/ui/atoms/
git commit -m "feat: atomes Badge, Pill, TypeIcon"
```

### Task 5: Atomes — Input, Textarea, Select, Checkbox

**Files:**
- Create: `src/ui/atoms/Input.tsx`, `src/ui/atoms/Textarea.tsx`, `src/ui/atoms/Select.tsx`, `src/ui/atoms/Input.css`
- Create: `src/ui/atoms/Checkbox.tsx`, `src/ui/atoms/Checkbox.css`
- Test: `src/ui/atoms/fields.test.tsx`

- [ ] **Step 1: Écrire le test `src/ui/atoms/fields.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import Checkbox from './Checkbox';
import Input from './Input';
import Select from './Select';
import Textarea from './Textarea';

describe('champs de formulaire', () => {
  it('Input transmet value et onChange', async () => {
    function Demo() {
      const [v, setV] = useState('');
      return <Input aria-label="Nom" value={v} onChange={(e) => setV(e.target.value)} />;
    }
    render(<Demo />);
    await userEvent.type(screen.getByLabelText('Nom'), 'abc');
    expect(screen.getByLabelText('Nom')).toHaveValue('abc');
  });

  it('Select rend ses options', () => {
    render(
      <Select aria-label="Type">
        <option value="visit">Visite</option>
      </Select>,
    );
    expect(screen.getByLabelText('Type')).toHaveDisplayValue('Visite');
  });

  it('Textarea accepte la saisie', async () => {
    function Demo() {
      const [v, setV] = useState('');
      return <Textarea aria-label="Notes" value={v} onChange={(e) => setV(e.target.value)} />;
    }
    render(<Demo />);
    await userEvent.type(screen.getByLabelText('Notes'), 'hello');
    expect(screen.getByLabelText('Notes')).toHaveValue('hello');
  });

  it('Checkbox se coche et se décoche', async () => {
    function Demo() {
      const [v, setV] = useState(false);
      return <Checkbox aria-label="Gratuit" checked={v} onChange={(e) => setV(e.target.checked)} />;
    }
    render(<Demo />);
    const box = screen.getByLabelText('Gratuit');
    await userEvent.click(box);
    expect(box).toBeChecked();
    await userEvent.click(box);
    expect(box).not.toBeChecked();
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

```bash
npm run test -- src/ui/atoms/fields.test.tsx
```

Attendu : FAIL — modules introuvables.

- [ ] **Step 3: Créer les composants + CSS partagé**

`src/ui/atoms/Input.tsx` :

```tsx
import type { InputHTMLAttributes } from 'react';
import './Input.css';

export default function Input({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`ha-input${className ? ` ${className}` : ''}`} {...rest} />;
}
```

`src/ui/atoms/Textarea.tsx` :

```tsx
import type { TextareaHTMLAttributes } from 'react';
import './Input.css';

export default function Textarea({ className = '', ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`ha-textarea${className ? ` ${className}` : ''}`} {...rest} />;
}
```

`src/ui/atoms/Select.tsx` :

```tsx
import type { SelectHTMLAttributes } from 'react';
import './Input.css';

export default function Select({ className = '', ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`ha-select${className ? ` ${className}` : ''}`} {...rest} />;
}
```

`src/ui/atoms/Input.css` :

```css
.ha-input,
.ha-textarea,
.ha-select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--ha-border);
  border-radius: var(--radius-sm);
  background: var(--ha-surface);
  color: var(--ha-navy);
  font: inherit;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.ha-input:focus,
.ha-textarea:focus,
.ha-select:focus {
  outline: none;
  border-color: var(--ha-iris);
  box-shadow: 0 0 0 3px var(--ha-iris-20);
}

.ha-input::placeholder,
.ha-textarea::placeholder {
  color: var(--ha-muted);
}
```

`src/ui/atoms/Checkbox.tsx` :

```tsx
import type { InputHTMLAttributes } from 'react';
import './Checkbox.css';

export default function Checkbox({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="checkbox" className={`ha-checkbox${className ? ` ${className}` : ''}`} {...rest} />;
}
```

`src/ui/atoms/Checkbox.css` :

```css
.ha-checkbox {
  appearance: none;
  width: 18px;
  height: 18px;
  margin: 0;
  border: 1.5px solid var(--ha-border);
  border-radius: 4px;
  background: var(--ha-surface);
  display: inline-grid;
  place-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast);
}

.ha-checkbox::before {
  content: '';
  width: 10px;
  height: 10px;
  transform: scale(0);
  transition: transform var(--transition-fast);
  clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
  background: #fff;
}

.ha-checkbox:checked {
  background: var(--ha-iris);
  border-color: var(--ha-iris);
}

.ha-checkbox:checked::before {
  transform: scale(1);
}

.ha-checkbox:focus-visible {
  outline: 2px solid var(--ha-iris);
  outline-offset: 2px;
}
```

- [ ] **Step 4: Vérifier et committer**

```bash
npm run test -- src/ui/atoms/fields.test.tsx && npm run lint && npm run build
```

Attendu : PASS.

```bash
git add src/ui/atoms/
git commit -m "feat: atomes de formulaire Input, Textarea, Select, Checkbox"
```

---

### Task 6: Molécules — DoneToggle, EmptyState, MilieuChip, StorageBanner

**Files:**
- Create: `src/ui/molecules/DoneToggle.tsx` + `.css`, `EmptyState.tsx` + `.css`, `MilieuChip.tsx` + `.css`, `StorageBanner.tsx` + `.css`
- Test: `src/ui/molecules/DoneToggle.test.tsx`, `EmptyState.test.tsx`, `MilieuChip.test.tsx`, `StorageBanner.test.tsx`

- [ ] **Step 1: Écrire les tests**

`src/ui/molecules/DoneToggle.test.tsx` :

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import DoneToggle from './DoneToggle';

describe('DoneToggle', () => {
  it("variante ronde : aria-label selon l'état et classe done", () => {
    const { rerender } = render(<DoneToggle done={false} onToggle={() => {}} variant="round" />);
    expect(screen.getByRole('button', { name: 'Marquer comme fait' })).not.toHaveClass('done');
    rerender(<DoneToggle done onToggle={() => {}} variant="round" />);
    const btn = screen.getByRole('button', { name: 'Marquer comme à faire' });
    expect(btn).toHaveClass('done');
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  it("variante ligne : libellé selon l'état", () => {
    render(<DoneToggle done={false} onToggle={() => {}} variant="line" />);
    expect(screen.getByRole('button', { name: 'Marquer comme fait' })).toBeInTheDocument();
  });

  it('déclenche onToggle', async () => {
    const onToggle = vi.fn();
    render(<DoneToggle done={false} onToggle={onToggle} variant="round" />);
    await userEvent.click(screen.getByRole('button', { name: 'Marquer comme fait' }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
```

`src/ui/molecules/EmptyState.test.tsx` :

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import EmptyState from './EmptyState';

describe('EmptyState', () => {
  it('affiche icône, texte et action', () => {
    render(
      <EmptyState icon={<span data-testid="icon" />} action={<button type="button">Ajouter</button>}>
        Aucun point <span className="ha-accent">pour l'instant</span>.
      </EmptyState>,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText(/aucun point/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ajouter' })).toBeInTheDocument();
  });
});
```

`src/ui/molecules/MilieuChip.test.tsx` :

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import MilieuChip from './MilieuChip';

describe('MilieuChip', () => {
  it('affiche le label du milieu', () => {
    render(<MilieuChip milieu="outdoor" />);
    expect(screen.getByText(/extérieur/i)).toBeInTheDocument();
  });
});
```

`src/ui/molecules/StorageBanner.test.tsx` :

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import StorageBanner from './StorageBanner';

describe('StorageBanner', () => {
  it('est une alerte avec son contenu', () => {
    render(<StorageBanner>Stockage indisponible.</StorageBanner>);
    expect(screen.getByRole('alert')).toHaveTextContent('Stockage indisponible.');
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

```bash
npm run test -- src/ui/molecules/
```

Attendu : FAIL — modules introuvables.

- [ ] **Step 3: Créer `src/ui/molecules/DoneToggle.tsx` + `.css`**

```tsx
import { Check } from 'lucide-react';
import './DoneToggle.css';

interface DoneToggleProps {
  done: boolean;
  onToggle: () => void;
  variant?: 'round' | 'line';
}

export default function DoneToggle({ done, onToggle, variant = 'round' }: DoneToggleProps) {
  if (variant === 'line') {
    return (
      <button
        type="button"
        className={`ha-done-toggle ha-done-toggle--line${done ? ' done' : ''}`}
        onClick={onToggle}
      >
        <Check size={16} aria-hidden="true" />
        {done ? 'Fait' : 'Marquer comme fait'}
      </button>
    );
  }
  return (
    <button
      type="button"
      className={`ha-done-toggle ha-done-toggle--round${done ? ' done' : ''}`}
      aria-pressed={done}
      aria-label={done ? 'Marquer comme à faire' : 'Marquer comme fait'}
      onClick={onToggle}
    >
      <Check size={14} aria-hidden="true" />
    </button>
  );
}
```

```css
.ha-done-toggle--round {
  position: relative;
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: 50%;
  border: 1.5px solid var(--ha-border);
  background: var(--ha-surface);
  color: var(--ha-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast);
}

/* Zone de clic élargie à 40px (cible tactile) */
.ha-done-toggle--round::before {
  content: '';
  position: absolute;
  inset: -6px;
}

.ha-done-toggle--round:hover {
  border-color: var(--ha-success);
  color: var(--ha-success);
}

.ha-done-toggle--round.done {
  background: var(--ha-success);
  border-color: var(--ha-success);
  color: #fff;
}

.ha-done-toggle--line {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--ha-border);
  background: var(--ha-surface);
  color: var(--ha-navy);
  font-size: 14px;
  font-weight: 600;
  min-height: 38px;
  transition:
    border-color var(--transition-fast),
    color var(--transition-fast),
    background-color var(--transition-fast);
}

.ha-done-toggle--line.done {
  border-color: var(--ha-success);
  color: var(--ha-success);
  background: var(--ha-success-bg);
}
```

- [ ] **Step 4: Créer `src/ui/molecules/EmptyState.tsx` + `.css`**

```tsx
import type { ReactNode } from 'react';
import './EmptyState.css';

interface EmptyStateProps {
  icon: ReactNode;
  children: ReactNode;
  action?: ReactNode;
}

export default function EmptyState({ icon, children, action }: EmptyStateProps) {
  return (
    <div className="ha-empty-state">
      <span className="ha-empty-state__icon" aria-hidden="true">
        {icon}
      </span>
      <p className="ha-empty-state__text">{children}</p>
      {action}
    </div>
  );
}
```

```css
.ha-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  color: var(--ha-navy);
  max-width: 320px;
}

.ha-empty-state__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: var(--radius-pill);
  background: var(--ha-iris-10);
  color: var(--ha-iris);
}

.ha-empty-state__text {
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
}
```

- [ ] **Step 5: Créer `src/ui/molecules/MilieuChip.tsx` + `.css`**

```tsx
import { MILIEU_ICONS } from '../icons';
import { getMilieuDef } from '../../constants';
import type { MilieuId } from '../../types';
import './MilieuChip.css';

interface MilieuChipProps {
  milieu: MilieuId;
}

export default function MilieuChip({ milieu }: MilieuChipProps) {
  const def = getMilieuDef(milieu);
  const Icon = MILIEU_ICONS[milieu];
  return (
    <span className="ha-milieu-chip">
      <Icon size={12} aria-hidden="true" /> {def.label}
    </span>
  );
}
```

```css
.ha-milieu-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 700;
  border-radius: var(--radius-pill);
  padding: 3px 10px;
  width: fit-content;
  background: var(--ha-iris-10);
  color: var(--ha-navy);
  line-height: 1.2;
}
```

- [ ] **Step 6: Créer `src/ui/molecules/StorageBanner.tsx` + `.css`**

```tsx
import { AlertTriangle } from 'lucide-react';
import type { ReactNode } from 'react';
import './StorageBanner.css';

interface StorageBannerProps {
  children: ReactNode;
}

export default function StorageBanner({ children }: StorageBannerProps) {
  return (
    <div className="ha-storage-banner" role="alert">
      <AlertTriangle size={18} aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
```

```css
.ha-storage-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: var(--ha-danger-bg);
  color: var(--ha-danger-text);
  font-size: 14px;
  border-bottom: 1px solid #f5c6c8;
}
```

- [ ] **Step 7: Vérifier et committer**

```bash
npm run test -- src/ui/molecules/ && npm run lint && npm run build
```

Attendu : PASS.

```bash
git add src/ui/molecules/
git commit -m "feat: molécules DoneToggle, EmptyState, MilieuChip, StorageBanner"
```

### Task 7: Molécules — ImgThumb (déplacé), PhotoThumb, SearchField (déplacé)

**Files:**
- Move: `src/components/ImgThumb.tsx` → `src/ui/molecules/ImgThumb.tsx` (+ son test)
- Create: `src/ui/molecules/PhotoThumb.tsx` + `.css`
- Move: `src/components/SearchBar.tsx` → `src/ui/molecules/SearchField.tsx` (relooké, + son test)
- Create: `src/ui/molecules/SearchField.css`
- Delete: ancien `src/components/SearchBar.test.tsx` (déplacé)
- Modify: `src/App.tsx`, `src/components/PlaceList.tsx`, `src/components/PlaceForm.tsx`, `src/components/PlaceDetails.tsx` (imports), `src/App.css` (CSS mort)

- [ ] **Step 1: Déplacer ImgThumb**

```bash
git mv src/components/ImgThumb.tsx src/ui/molecules/ImgThumb.tsx
git mv src/components/ImgThumb.test.tsx src/ui/molecules/ImgThumb.test.tsx
```

Dans les deux fichiers déplacés, corriger l'import du hook : `from '../hooks/useObjectUrl'` → `from '../../hooks/useObjectUrl'`. Dans les 3 consommateurs (`PlaceList.tsx`, `PlaceForm.tsx`, `PlaceDetails.tsx`), remplacer `import ImgThumb from './ImgThumb'` par `import ImgThumb from '../ui/molecules/ImgThumb'`.

- [ ] **Step 2: Écrire le test `src/ui/molecules/PhotoThumb.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import PhotoThumb from './PhotoThumb';

describe('PhotoThumb', () => {
  it('affiche un bouton de suppression quand onRemove est fourni', async () => {
    const onRemove = vi.fn();
    render(<PhotoThumb blob={new Blob(['x'])} onRemove={onRemove} />);
    await userEvent.click(screen.getByRole('button', { name: 'Retirer la photo' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("n'affiche pas de bouton sans onRemove", () => {
    render(<PhotoThumb blob={new Blob(['x'])} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Vérifier l'échec**

```bash
npm run test -- src/ui/molecules/PhotoThumb.test.tsx
```

Attendu : FAIL.

- [ ] **Step 4: Créer `src/ui/molecules/PhotoThumb.tsx` + `.css`**

```tsx
import { X } from 'lucide-react';
import ImgThumb from './ImgThumb';
import './PhotoThumb.css';

interface PhotoThumbProps {
  blob: Blob;
  onRemove?: () => void;
}

export default function PhotoThumb({ blob, onRemove }: PhotoThumbProps) {
  return (
    <div className="ha-photo-thumb">
      <ImgThumb blob={blob} />
      {onRemove && (
        <button
          type="button"
          className="ha-photo-thumb__remove"
          aria-label="Retirer la photo"
          onClick={onRemove}
        >
          <X size={12} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
```

```css
.ha-photo-thumb {
  position: relative;
  width: 72px;
  height: 72px;
  border-radius: var(--radius-thumb);
  overflow: hidden;
  flex-shrink: 0;
}

.ha-photo-thumb .img-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.ha-photo-thumb__remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: rgba(19, 20, 69, 0.72);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

- [ ] **Step 5: Déplacer SearchBar → SearchField (relooké DA)**

```bash
git mv src/components/SearchBar.tsx src/ui/molecules/SearchField.tsx
git mv src/components/SearchBar.test.tsx src/ui/molecules/SearchField.test.tsx
```

Réécrire `src/ui/molecules/SearchField.tsx` (logique identique, markup DA, spinner pendant le debounce) :

```tsx
import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Search } from 'lucide-react';
import { searchAddress, type GeoResult } from '../../geocoding';
import Spinner from '../atoms/Spinner';
import './SearchField.css';

interface SearchFieldProps {
  onSelect: (result: GeoResult) => void;
}

export default function SearchField({ onSelect }: SearchFieldProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoResult[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) {
      return;
    }
    setStatus('loading');
    const controller = new AbortController();
    const timer = setTimeout(() => {
      searchAddress(q, controller.signal)
        .then((found) => {
          setResults(found);
          setStatus('idle');
          setOpen(true);
        })
        .catch((err: unknown) => {
          if (err instanceof Error && err.name === 'AbortError') return;
          setStatus('error');
          setResults([]);
        });
    }, 400);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value);
    if (value.trim().length < 3) {
      setResults([]);
      setStatus('idle');
      setOpen(false);
    }
  }

  return (
    <div className="ha-searchfield">
      <Search size={18} className="ha-searchfield__icon" aria-hidden="true" />
      <input
        className="ha-input ha-searchfield__input"
        value={query}
        onChange={handleChange}
        placeholder="Rechercher une adresse ou un lieu…"
        type="search"
        aria-label="Rechercher une adresse ou un lieu"
      />
      {status === 'loading' && (
        <span className="ha-searchfield__spinner">
          <Spinner size={16} label="Recherche en cours…" />
        </span>
      )}
      {open && results.length > 0 && (
        <ul className="ha-searchfield__results">
          {results.map((result, index) => (
            <li key={index}>
              <button
                type="button"
                onClick={() => {
                  onSelect(result);
                  setOpen(false);
                  setQuery('');
                }}
              >
                {result.name} — {result.address}
              </button>
            </li>
          ))}
        </ul>
      )}
      {status === 'error' && (
        <p className="ha-searchfield__error" role="alert">
          Recherche indisponible. Tu peux cliquer sur la carte pour placer un point.
        </p>
      )}
    </div>
  );
}
```

Note : `setStatus('loading')` au début de l'effet n'impacte pas les tests existants (aucun ne vérifie le statut intermédiaire ; le mock de `searchAddress` reste utilisé).

`src/ui/molecules/SearchField.css` :

```css
.ha-searchfield {
  position: relative;
  flex: 1 1 260px;
  max-width: 480px;
}

.ha-searchfield__icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--ha-muted);
  pointer-events: none;
}

.ha-searchfield__input {
  padding-left: 40px;
  padding-right: 40px;
}

.ha-searchfield__spinner {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
}

.ha-searchfield__results {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 1100;
  background: var(--ha-surface);
  border: 1px solid var(--ha-border);
  border-radius: var(--radius-thumb);
  list-style: none;
  margin: 0;
  padding: 6px;
  box-shadow: var(--shadow-md);
  max-height: 320px;
  overflow-y: auto;
}

.ha-searchfield__results button {
  display: block;
  width: 100%;
  text-align: left;
  padding: 8px 10px;
  border: none;
  background: none;
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--ha-navy);
}

.ha-searchfield__results button:hover {
  background: var(--ha-iris-10);
}

.ha-searchfield__error {
  color: var(--ha-danger);
  font-size: 13px;
  margin: 6px 0 0;
}
```

Dans `src/ui/molecules/SearchField.test.tsx`, corriger les imports : `from './SearchBar'` → `from './SearchField'` et `from '../geocoding'` → `from '../../geocoding'`.

- [ ] **Step 6: Mettre à jour `src/App.tsx`**

Remplacer `import SearchBar from './components/SearchBar';` par `import SearchField from './ui/molecules/SearchField';` et `<SearchBar onSelect={handleSearchSelect} />` par `<SearchField onSelect={handleSearchSelect} />`.

- [ ] **Step 7: Nettoyer le CSS mort dans `src/App.css`**

Supprimer les blocs `.searchbar`, `.searchbar input`, `.searchbar input:focus`, `.searchbar-results`, `.searchbar-results button`, `.searchbar-results button:hover`, `.searchbar-error`.

- [ ] **Step 8: Vérifier et committer**

```bash
npm run test && npm run lint && npm run build
```

Attendu : tout vert (SearchField.test et ImgThumb.test passent depuis leur nouvel emplacement).

```bash
git add -A src/
git commit -m "feat: molécules SearchField, PhotoThumb + ImgThumb déplacé dans le DS"
```

---

### Task 8: Molécules — PlaceCard, MarkerPin

**Files:**
- Create: `src/ui/molecules/PlaceCard.tsx` + `.css`
- Create: `src/ui/molecules/MarkerPin.tsx` + `.css`
- Test: `src/ui/molecules/PlaceCard.test.tsx`, `src/ui/molecules/MarkerPin.test.tsx`

- [ ] **Step 1: Écrire les tests**

`src/ui/molecules/PlaceCard.test.tsx` :

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Place } from '../../types';
import PlaceCard from './PlaceCard';

const place: Place = {
  id: 'p1',
  name: 'Café Jean',
  address: '10 rue de la Paix, Paris',
  lat: 48.86,
  lng: 2.33,
  isFree: true,
  type: 'restaurant',
  photos: [],
  createdAt: 0,
  updatedAt: 0,
};

describe('PlaceCard', () => {
  it('affiche nom (classe card-title) et adresse', () => {
    render(<PlaceCard place={place} selected={false} onSelect={() => {}} onToggleDone={() => {}} />);
    expect(screen.getByText('Café Jean')).toHaveClass('card-title');
    expect(screen.getByText(/10 rue de la Paix/)).toBeInTheDocument();
  });

  it('sélectionne au clic et bascule fait', async () => {
    const onSelect = vi.fn();
    const onToggleDone = vi.fn();
    render(
      <PlaceCard place={place} selected={false} onSelect={onSelect} onToggleDone={onToggleDone} />,
    );
    await userEvent.click(screen.getByRole('button', { name: /café jean/i }));
    expect(onSelect).toHaveBeenCalledWith('p1');
    await userEvent.click(screen.getByRole('button', { name: 'Marquer comme fait' }));
    expect(onToggleDone).toHaveBeenCalledWith('p1');
  });
});
```

`src/ui/molecules/MarkerPin.test.tsx` :

```tsx
import { describe, expect, it } from 'vitest';
import { draftPinIcon, placePinIcon } from './MarkerPin';

describe('MarkerPin', () => {
  it("génère une épingle par type avec l'icône SVG", () => {
    const html = String(placePinIcon('visit', false, false).options.html);
    expect(html).toContain('marker-pin');
    expect(html).toContain('<svg');
    expect(html).toContain('var(--type-visit)');
  });

  it("marque l'état fait et sélectionné", () => {
    const html = String(placePinIcon('balade', true, true).options.html);
    expect(html).toContain('selected');
    expect(html).toContain('done');
    expect(html).toContain('marker-check');
  });

  it('génère une épingle de brouillon', () => {
    const html = String(draftPinIcon().options.html);
    expect(html).toContain('draft');
    expect(html).toContain('var(--ha-navy)');
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

```bash
npm run test -- src/ui/molecules/PlaceCard.test.tsx src/ui/molecules/MarkerPin.test.tsx
```

Attendu : FAIL.

- [ ] **Step 3: Créer `src/ui/molecules/PlaceCard.tsx` + `.css`**

```tsx
import { getPlaceTypeDef } from '../../constants';
import type { Place } from '../../types';
import Badge from '../atoms/Badge';
import TypeIcon from '../atoms/TypeIcon';
import DoneToggle from './DoneToggle';
import ImgThumb from './ImgThumb';
import './PlaceCard.css';

interface PlaceCardProps {
  place: Place;
  selected: boolean;
  onSelect: (id: string) => void;
  onToggleDone: (id: string) => void;
}

export default function PlaceCard({ place, selected, onSelect, onToggleDone }: PlaceCardProps) {
  const def = getPlaceTypeDef(place.type);
  const done = place.isDone === true;
  return (
    <li className={`place-card${selected ? ' selected' : ''}${done ? ' done' : ''}`}>
      <button type="button" className="card-select" onClick={() => onSelect(place.id)}>
        <span className="card-thumb">
          <ImgThumb
            blob={place.photos[0]?.blob ?? null}
            fallback={
              <span className={`card-fallback type-surface--${place.type}`}>
                <TypeIcon type={place.type} size={24} />
              </span>
            }
          />
        </span>
        <span className="card-body">
          <Badge color={place.type} icon={<TypeIcon type={place.type} size={12} />}>
            {def.label}
          </Badge>
          <span className="card-title">{place.name}</span>
          <span className="card-address">{place.address}</span>
          <span className="card-meta">
            {place.isFree ? 'Gratuit' : place.price || 'Payant'}
            {place.hours ? ` · ${place.hours}` : ''}
          </span>
        </span>
      </button>
      <DoneToggle done={done} onToggle={() => onToggleDone(place.id)} variant="round" />
    </li>
  );
}
```

```css
.place-card {
  position: relative;
}

.place-card .card-select {
  display: flex;
  gap: 12px;
  width: 100%;
  text-align: left;
  padding: 12px;
  border: 1px solid var(--ha-border);
  border-radius: var(--radius-card);
  background: var(--ha-surface);
  color: inherit;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.place-card .card-select:hover {
  border-color: var(--ha-iris-20);
  box-shadow: var(--shadow-md);
}

.place-card.selected .card-select {
  border-color: var(--ha-iris);
  box-shadow: 0 0 0 3px var(--ha-iris-20);
}

.place-card .ha-done-toggle--round {
  position: absolute;
  top: 10px;
  right: 10px;
}

.place-card.done .card-select {
  opacity: 0.55;
}

.card-thumb {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-thumb);
  overflow: hidden;
  flex-shrink: 0;
}

.card-thumb .img-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.card-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.card-body {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
  align-items: flex-start;
  padding-right: 32px;
}

.card-title {
  display: block;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.2px;
  color: var(--ha-navy);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.card-address,
.card-meta {
  display: block;
  font-size: 13px;
  color: var(--ha-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.card-meta {
  font-size: 12px;
}
```

- [ ] **Step 4: Créer `src/ui/molecules/MarkerPin.tsx` + `.css`**

```tsx
import { divIcon } from 'leaflet';
import type { PlaceTypeId } from '../../types';
import { checkSvg, markerSvg } from '../icons';
import './MarkerPin.css';

export function placePinIcon(type: PlaceTypeId, selected: boolean, done: boolean) {
  return divIcon({
    className: 'marker-wrapper',
    html: `<div class="marker-pin${selected ? ' selected' : ''}${done ? ' done' : ''}" style="background:var(--type-${type})">${markerSvg(type, 15)}${done ? `<span class="marker-check">${checkSvg(10)}</span>` : ''}</div>`,
    iconSize: [36, 44],
    iconAnchor: [18, 42],
  });
}

export function draftPinIcon() {
  return divIcon({
    className: 'marker-wrapper',
    html: `<div class="marker-pin draft" style="background:var(--ha-navy)">${markerSvg('other', 15)}</div>`,
    iconSize: [36, 44],
    iconAnchor: [18, 42],
  });
}
```

```css
.marker-wrapper {
  background: transparent;
  border: none;
}

.marker-pin {
  width: 32px;
  height: 32px;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
  box-shadow: 0 2px 6px rgba(19, 20, 69, 0.35);
  position: relative;
  color: #fff;
}

.marker-pin.done {
  opacity: 0.55;
}

.marker-pin svg {
  transform: rotate(45deg);
}

.marker-pin .marker-check {
  position: absolute;
  top: -6px;
  right: -8px;
  transform: rotate(45deg);
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--ha-success);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #fff;
}

.marker-pin.selected {
  transform: rotate(-45deg) scale(1.3);
}

.marker-pin.draft {
  animation: marker-pulse 1.2s infinite ease-in-out;
}

@keyframes marker-pulse {
  0%,
  100% {
    transform: rotate(-45deg) scale(1);
  }
  50% {
    transform: rotate(-45deg) scale(1.15);
  }
}
```

- [ ] **Step 5: Vérifier et committer**

```bash
npm run test -- src/ui/molecules/ && npm run lint && npm run build
```

Attendu : PASS.

```bash
git add src/ui/molecules/
git commit -m "feat: molécules PlaceCard et MarkerPin"
```

### Task 9: Styleguide vivante (route #styleguide)

**Files:**
- Create: `src/ui/styleguide/Styleguide.tsx`, `src/ui/styleguide/Styleguide.css`, `src/ui/styleguide/SearchFieldDoc.tsx`
- Create: `src/hooks/useHashRoute.ts`
- Modify: `src/App.tsx`
- Test: `src/hooks/useHashRoute.test.ts`
- Modify: `README.md`

- [ ] **Step 1: Écrire le test `src/hooks/useHashRoute.test.ts`**

```ts
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useHashRoute } from './useHashRoute';

describe('useHashRoute', () => {
  afterEach(() => {
    window.location.hash = '';
  });

  it('retourne le hash courant', () => {
    window.location.hash = '#styleguide';
    const { result } = renderHook(() => useHashRoute());
    expect(result.current).toBe('#styleguide');
  });

  it('suit les changements de hash', () => {
    const { result } = renderHook(() => useHashRoute());
    act(() => {
      window.location.hash = '#styleguide';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(result.current).toBe('#styleguide');
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

```bash
npm run test -- src/hooks/useHashRoute.test.ts
```

Attendu : FAIL.

- [ ] **Step 3: Créer `src/hooks/useHashRoute.ts`**

```ts
import { useEffect, useState } from 'react';

export function useHashRoute(): string {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
}
```

- [ ] **Step 4: Créer `src/ui/styleguide/SearchFieldDoc.tsx`** (aperçu interactif du champ de recherche)

```tsx
import { useState } from 'react';
import SearchField from '../molecules/SearchField';
import type { GeoResult } from '../../geocoding';

export default function SearchFieldDoc() {
  const [value, setValue] = useState<GeoResult | null>(null);
  return (
    <div className="sg-searchfield-doc">
      <SearchField onSelect={setValue} />
      {value && (
        <p>
          Sélection : {value.name} — {value.address}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Créer `src/ui/styleguide/Styleguide.tsx`**

```tsx
import type { ReactNode } from 'react';
import {
  Check,
  Download,
  EyeOff,
  List,
  MapPinned,
  Plus,
  Search,
  Sun,
  Upload,
} from 'lucide-react';
import { MILIEUS, PLACE_TYPES } from '../../constants';
import type { Place } from '../../types';
import Badge from '../atoms/Badge';
import Button from '../atoms/Button';
import Checkbox from '../atoms/Checkbox';
import IconButton from '../atoms/IconButton';
import Input from '../atoms/Input';
import Pill from '../atoms/Pill';
import Select from '../atoms/Select';
import Spinner from '../atoms/Spinner';
import TypeIcon from '../atoms/TypeIcon';
import DoneToggle from '../molecules/DoneToggle';
import EmptyState from '../molecules/EmptyState';
import MilieuChip from '../molecules/MilieuChip';
import PlaceCard from '../molecules/PlaceCard';
import StorageBanner from '../molecules/StorageBanner';
import { MILIEU_ICONS } from '../icons';
import SearchFieldDoc from './SearchFieldDoc';
import './Styleguide.css';

const samplePlace: Place = {
  id: 'sample',
  name: 'Café Jean',
  address: '10 rue de la Paix, Paris',
  lat: 48.86,
  lng: 2.33,
  isFree: true,
  type: 'restaurant',
  photos: [],
  createdAt: 0,
  updatedAt: 0,
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="sg-section">
      <h2 className="sg-title">
        {title} <span className="ha-accent">·</span>
      </h2>
      <div className="sg-section__body">{children}</div>
    </section>
  );
}

export default function Styleguide() {
  return (
    <div className="sg">
      <header className="sg-header">
        <MapPinned size={28} aria-hidden="true" />
        <h1>
          MyMap <span className="ha-accent">styleguide</span>
        </h1>
        <a href="#" className="sg-back">
          ← Retour à l'app
        </a>
      </header>

      <Section title="Couleurs">
        <div className="sg-swatches">
          {[
            ['--ha-bg', 'Crème'],
            ['--ha-surface', 'Surface'],
            ['--ha-navy', 'Navy'],
            ['--ha-iris', 'Iris'],
            ['--ha-iris-20', 'Iris 20'],
            ['--ha-iris-10', 'Iris 10'],
            ['--ha-sun', 'Ambre'],
            ['--ha-rose', 'Rose'],
            ['--ha-purple', 'Violet'],
            ['--ha-muted', 'Muted'],
            ['--ha-border', 'Bordure'],
            ['--ha-danger', 'Danger'],
            ['--ha-success', 'Succès'],
          ].map(([token, label]) => (
            <div key={token} className="sg-swatch">
              <span className="sg-swatch__color" style={{ background: `var(${token})` }} />
              <code>{token}</code>
              <small>{label}</small>
            </div>
          ))}
        </div>
        <div className="sg-swatches">
          {PLACE_TYPES.map((t) => (
            <div key={t.id} className="sg-swatch">
              <span className="sg-swatch__color" style={{ background: `var(--type-${t.id})` }} />
              <code>--type-{t.id}</code>
              <small>{t.label}</small>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typographie">
        <div className="sg-type">
          <p className="sg-type__h1">Titre fiche — uppercase 800</p>
          <p className="sg-type__h2">Sous-titre — uppercase 700</p>
          <p>
            Corps de texte 16px Open Sans, avec un mot en <span className="ha-accent">Besley italique</span>.
          </p>
          <p className="sg-type__small">Texte secondaire 14px muted</p>
          <p className="sg-type__label">LABEL 12PX UPPERCASE</p>
        </div>
      </Section>

      <Section title="Icônes">
        <div className="sg-icons">
          {PLACE_TYPES.map((t) => (
            <span key={t.id} className="sg-icon">
              <TypeIcon type={t.id} size={20} />
              <small>{t.label}</small>
            </span>
          ))}
          {MILIEUS.map((m) => {
            const Icon = MILIEU_ICONS[m.id];
            return (
              <span key={m.id} className="sg-icon">
                <Icon size={20} aria-hidden="true" />
                <small>{m.label}</small>
              </span>
            );
          })}
          <span className="sg-icon"><Plus size={20} /><small>Ajouter</small></span>
          <span className="sg-icon"><Search size={20} /><small>Rechercher</small></span>
          <span className="sg-icon"><Download size={20} /><small>Exporter</small></span>
          <span className="sg-icon"><Upload size={20} /><small>Importer</small></span>
          <span className="sg-icon"><EyeOff size={20} /><small>Masquer</small></span>
          <span className="sg-icon"><List size={20} /><small>Liste</small></span>
          <span className="sg-icon"><Check size={20} /><small>Fait</small></span>
          <span className="sg-icon"><Sun size={20} /><small>Soleil</small></span>
        </div>
      </Section>

      <Section title="Boutons">
        <div className="sg-row">
          <Button variant="primary" iconLeft={<Plus size={18} />}>Ajouter un lieu</Button>
          <Button variant="accent">Action phare</Button>
          <Button variant="outline">Découvrir</Button>
          <Button variant="ghost">Annuler</Button>
          <Button variant="danger">Supprimer</Button>
          <Button variant="dark">Navy</Button>
          <Button variant="primary" loading>Chargement</Button>
          <Button variant="primary" disabled>Désactivé</Button>
        </div>
        <div className="sg-row">
          <Button size="sm" variant="outline">Small</Button>
          <Button size="md" variant="outline">Medium</Button>
          <Button size="lg" variant="outline">Large</Button>
          <IconButton label="Exporter"><Download size={18} /></IconButton>
          <IconButton label="Importer"><Upload size={18} /></IconButton>
        </div>
      </Section>

      <Section title="Badges & pilules">
        <div className="sg-row">
          {PLACE_TYPES.map((t) => (
            <Badge key={t.id} color={t.id} icon={<TypeIcon type={t.id} size={12} />}>
              {t.label}
            </Badge>
          ))}
          <Badge color="success" icon={<Check size={12} />}>Fait</Badge>
          <MilieuChip milieu="outdoor" />
          <MilieuChip milieu="indoor" />
        </div>
        <div className="sg-row">
          {PLACE_TYPES.map((t) => (
            <Pill key={t.id} color={t.id} active>
              <TypeIcon type={t.id} size={14} /> {t.label}
            </Pill>
          ))}
          <Pill color="navy"><Sun size={14} /> Extérieur</Pill>
          <Pill color="success"><EyeOff size={14} /> Masquer les faits</Pill>
        </div>
        <div className="sg-row">
          {PLACE_TYPES.map((t) => (
            <Pill key={t.id} color={t.id}>
              <TypeIcon type={t.id} size={14} /> {t.label}
            </Pill>
          ))}
        </div>
      </Section>

      <Section title="Champs de formulaire">
        <div className="sg-fields">
          <label>
            Nom *
            <Input placeholder="ex : Musée d'Orsay" />
          </label>
          <label>
            Type
            <Select>
              {PLACE_TYPES.map((t) => (
                <option key={t.id}>{t.label}</option>
              ))}
            </Select>
          </label>
          <label className="sg-checkbox">
            <Checkbox defaultChecked /> Gratuit
          </label>
        </div>
      </Section>

      <Section title="Molécules">
        <div className="sg-row">
          <DoneToggle done={false} onToggle={() => {}} variant="round" />
          <DoneToggle done onToggle={() => {}} variant="round" />
          <DoneToggle done={false} onToggle={() => {}} variant="line" />
          <DoneToggle done onToggle={() => {}} variant="line" />
          <Spinner size={24} />
        </div>
        <div className="sg-row">
          <EmptyState icon={<MapPinned size={28} />}>
            Aucun point <span className="ha-accent">pour l'instant</span>.
          </EmptyState>
        </div>
        <StorageBanner>Stockage indisponible (mode privé ?).</StorageBanner>
        <div className="sg-row">
          <SearchFieldDoc />
        </div>
      </Section>

      <Section title="Carte de lieu">
        <div className="sg-row">
          <ul className="sg-card-list">
            <PlaceCard place={samplePlace} selected={false} onSelect={() => {}} onToggleDone={() => {}} />
            <PlaceCard
              place={{ ...samplePlace, id: 's2', name: 'Jardin partagé', type: 'balade', isDone: true }}
              selected
              onSelect={() => {}}
              onToggleDone={() => {}}
            />
          </ul>
        </div>
      </Section>

      <Section title="Marqueurs">
        <div className="sg-markers">
          {PLACE_TYPES.map((t) => (
            <span key={t.id} className="sg-marker">
              <span className="marker-pin" style={{ background: `var(--type-${t.id})` }}>
                <TypeIcon type={t.id} size={15} />
              </span>
              <small>{t.label}</small>
            </span>
          ))}
          <span className="sg-marker">
            <span className="marker-pin done" style={{ background: 'var(--type-visit)' }}>
              <TypeIcon type="visit" size={15} />
              <span className="marker-check"><Check size={10} /></span>
            </span>
            <small>Fait</small>
          </span>
        </div>
      </Section>

      <Section title="Onglets mobiles">
        <nav className="mobile-tabbar mobile-tabbar--static" aria-label="Aperçu onglets">
          <button type="button" className="mobile-tabbar__seg active">
            <MapPinned size={18} /> Carte
          </button>
          <button type="button" className="mobile-tabbar__seg">
            <List size={18} /> Liste <span className="mobile-tabbar__count">12</span>
          </button>
        </nav>
      </Section>
    </div>
  );
}
```

- [ ] **Step 6: Créer `src/ui/styleguide/Styleguide.css`**

```css
.sg {
  max-width: 60rem;
  margin: 0 auto;
  padding: 24px 24px 64px;
  background: var(--ha-bg);
  min-height: 100dvh;
}

.sg-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 0;
  border-bottom: 1px solid var(--ha-border);
  margin-bottom: 8px;
  color: var(--ha-iris);
}

.sg-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: -1.2px;
  color: var(--ha-navy);
  flex: 1;
}

.sg-back {
  color: var(--ha-iris);
  font-weight: 600;
  text-decoration: none;
}

.sg-section {
  margin-top: 32px;
}

.sg-title {
  font-size: 18px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: -0.8px;
  color: var(--ha-navy);
  margin: 0 0 16px;
}

.sg-section__body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sg-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.sg-swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.sg-swatch {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 110px;
}

.sg-swatch__color {
  height: 48px;
  border-radius: var(--radius-thumb);
  border: 1px solid var(--ha-border);
}

.sg-swatch code {
  font-size: 11px;
  color: var(--ha-navy);
}

.sg-swatch small {
  color: var(--ha-muted);
  font-size: 11px;
}

.sg-type {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sg-type__h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: -1.2px;
}

.sg-type__h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: -0.8px;
}

.sg-type__small {
  margin: 0;
  color: var(--ha-muted);
  font-size: 14px;
}

.sg-type__label {
  margin: 0;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--ha-muted);
}

.sg-icons {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.sg-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: var(--ha-navy);
  width: 72px;
}

.sg-icon small {
  font-size: 11px;
  color: var(--ha-muted);
}

.sg-fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 360px;
}

.sg-fields label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  font-weight: 500;
}

.sg-checkbox {
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.sg-card-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: min(400px, 100%);
}

.sg-markers {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: flex-end;
}

.sg-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.sg-marker small {
  font-size: 11px;
  color: var(--ha-muted);
}

.sg-searchfield-doc {
  flex: 1 1 320px;
  max-width: 480px;
}

.mobile-tabbar--static {
  position: static;
  transform: none;
  display: inline-flex;
}
```

- [ ] **Step 7: Brancher la route dans `src/App.tsx`**

Ajouter les imports :

```tsx
import { useHashRoute } from './hooks/useHashRoute';
import Styleguide from './ui/styleguide/Styleguide';
```

En tête du composant `App`, juste après les déclarations de state (avant `refreshPlaces`) :

```tsx
  const hash = useHashRoute();
  if (hash === '#styleguide') {
    return <Styleguide />;
  }
```

- [ ] **Step 8: Documenter dans `README.md`** (à la fin de la section « Points clés »)

```markdown
- **Styleguide** : ouvrez l'app avec `#styleguide` dans l'URL (ex : `http://localhost:5173/#styleguide`) pour consulter le design system complet (couleurs, typo, icônes, composants).
```

- [ ] **Step 9: Vérifier et committer**

```bash
npm run test && npm run lint && npm run build
```

Attendu : tout vert. Vérif visuelle : `npm run dev` puis `http://localhost:5173/#styleguide`.

```bash
git add src/ui/styleguide/ src/hooks/ src/App.tsx README.md
git commit -m "feat: styleguide vivante accessible via #styleguide"
```

## Phase 3 — Migration des écrans

### Task 10: Header, Toolbar, layout AppShell, onglets mobiles

**Files:**
- Create: `src/AppShell.css`
- Modify: `src/App.tsx` (header, bannière stockage, onglets mobiles, imports)
- Modify: `src/components/Toolbar.tsx`
- Modify: `src/App.css` (retrait des règles migrées)

- [ ] **Step 1: Réécrire `src/components/Toolbar.tsx`**

```tsx
import { useRef } from 'react';
import { Download, LocateFixed, Upload } from 'lucide-react';
import IconButton from '../ui/atoms/IconButton';

interface ToolbarProps {
  onExport: () => void;
  onImport: (file: File) => void;
  onLocate: () => void;
}

export default function Toolbar({ onExport, onImport, onLocate }: ToolbarProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div className="toolbar">
      <IconButton label="Me localiser" onClick={onLocate}>
        <LocateFixed size={18} />
      </IconButton>
      <IconButton label="Exporter mes points" onClick={onExport}>
        <Download size={18} />
      </IconButton>
      <IconButton label="Importer un fichier" onClick={() => fileRef.current?.click()}>
        <Upload size={18} />
      </IconButton>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onImport(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Créer `src/AppShell.css`**

```css
.app {
  display: flex;
  flex-direction: column;
  height: 100dvh;
}

.app-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  min-height: 64px;
  background: var(--ha-bg);
  border-bottom: 1px solid var(--ha-border);
  flex-wrap: wrap;
}

.app-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--ha-iris);
}

.app-title {
  font-size: 20px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: -0.8px;
  margin: 0 8px 0 0;
  color: var(--ha-navy);
  white-space: nowrap;
}

.toolbar {
  display: flex;
  gap: 4px;
}

.app-main {
  flex: 1;
  display: flex;
  min-height: 0;
}

.map-pane {
  flex: 1 1 60%;
  min-width: 0;
  position: relative;
}

.map-container {
  height: 100%;
  width: 100%;
}

.map-container.add-mode,
.map-container.add-mode .leaflet-grab {
  cursor: crosshair !important;
}

.side-column {
  flex: 0 0 400px;
  width: 400px;
  max-width: 45%;
  background: var(--ha-surface);
  border-left: 1px solid var(--ha-border);
  overflow-y: auto;
}

/* Onglets mobiles : barre flottante pilule */
.mobile-tabbar {
  display: none;
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1200;
  background: var(--ha-surface);
  border-radius: var(--radius-pill);
  box-shadow: var(--shadow-lg);
  padding: 6px;
  gap: 4px;
}

.mobile-tabbar__seg {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: transparent;
  padding: 10px 18px;
  border-radius: var(--radius-pill);
  font-weight: 600;
  font-size: 14px;
  color: var(--ha-muted);
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast);
}

.mobile-tabbar__seg.active {
  background: var(--ha-iris);
  color: #fff;
}

.mobile-tabbar__count {
  background: var(--ha-iris-20);
  color: var(--ha-iris);
  border-radius: var(--radius-pill);
  font-size: 12px;
  font-weight: 700;
  padding: 1px 8px;
}

.mobile-tabbar__seg.active .mobile-tabbar__count {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
}

@media (max-width: 900px) {
  .app-header {
    gap: 8px;
    padding: 8px 12px;
  }

  .app-main {
    position: relative;
  }

  .app-main[data-mobile-view='list'] {
    padding-bottom: 80px;
  }

  .map-pane,
  .side-column {
    display: none;
  }

  .app-main[data-mobile-view='map'] .map-pane {
    display: block;
  }

  .app-main[data-mobile-view='list'] .side-column {
    display: block;
    flex: 1 1 auto;
    width: 100%;
    max-width: none;
    border-left: none;
  }

  .mobile-tabbar {
    display: inline-flex;
  }
}
```

- [ ] **Step 3: Mettre à jour `src/App.tsx`**

Imports à ajouter :

```tsx
import { List, Map, MapPinned, Plus, X } from 'lucide-react';
import Button from './ui/atoms/Button';
import StorageBanner from './ui/molecules/StorageBanner';
import './AppShell.css';
```

Remplacer le bloc `<header className="app-header">…</header>` par :

```tsx
      <header className="app-header">
        <div className="app-brand">
          <MapPinned size={26} aria-hidden="true" />
          <h1 className="app-title">MyMap</h1>
        </div>
        <SearchField onSelect={handleSearchSelect} />
        <Toolbar onExport={handleExport} onImport={handleImport} onLocate={handleLocate} />
        <Button
          variant={addMode ? 'danger' : 'primary'}
          iconLeft={addMode ? <X size={18} /> : <Plus size={18} />}
          onClick={() => {
            setAddMode((v) => !v);
            setDraft(null);
          }}
        >
          {addMode ? 'Annuler' : 'Ajouter un lieu'}
        </Button>
      </header>
```

Remplacer la bannière stockage par :

```tsx
      {storageError && (
        <StorageBanner>
          Stockage indisponible : impossible d'enregistrer tes points dans ce navigateur (mode privé ?).
        </StorageBanner>
      )}
```

Remplacer les onglets mobiles par :

```tsx
      <nav className="mobile-tabbar" aria-label="Basculer la vue mobile">
        <button
          type="button"
          className={`mobile-tabbar__seg${mobileView === 'map' ? ' active' : ''}`}
          onClick={() => setMobileView('map')}
        >
          <Map size={18} aria-hidden="true" /> Carte
        </button>
        <button
          type="button"
          className={`mobile-tabbar__seg${mobileView === 'list' ? ' active' : ''}`}
          onClick={() => setMobileView('list')}
        >
          <List size={18} aria-hidden="true" /> Liste
          <span className="mobile-tabbar__count">{filteredPlaces.length}</span>
        </button>
      </nav>
```

- [ ] **Step 4: Retirer d'`App.css` les règles migrées**

Supprimer : `.app`, `.app-header`, `.app-title`, `.toolbar`, `.toolbar button`, `.add-button`, `.add-button.active`, `.storage-banner`, `.app-main`, `.map-pane`, `.map-container`, `.map-container.add-mode` (et sa variante `.leaflet-grab`), `.side-column`, `.mobile-tabs`, `.mobile-tabs button`, `.mobile-tabs button.active`, et le bloc `@media (max-width: 900px)` dans son intégralité.

- [ ] **Step 5: Vérifier et committer**

```bash
npm run test && npm run lint && npm run build
```

Attendu : tout vert (App.test : bouton `/ajouter un lieu/i` ✓, heading `MyMap` ✓).

```bash
git add src/App.tsx src/AppShell.css src/App.css src/components/Toolbar.tsx
git commit -m "feat: header et toolbar façon HelloAsso + barre mobile flottante"
```

---

### Task 11: Barre de filtres

**Files:**
- Modify: `src/components/TypeFilter.tsx`
- Create: `src/components/TypeFilter.css`
- Modify: `src/App.css` (retrait des règles migrées)

- [ ] **Step 1: Réécrire `src/components/TypeFilter.tsx`**

```tsx
import { EyeOff } from 'lucide-react';
import { MILIEUS, PLACE_TYPES } from '../constants';
import type { MilieuId, PlaceTypeId } from '../types';
import Pill from '../ui/atoms/Pill';
import TypeIcon from '../ui/atoms/TypeIcon';
import { MILIEU_ICONS } from '../ui/icons';
import './TypeFilter.css';

interface TypeFilterProps {
  active: Set<PlaceTypeId>;
  onToggle: (type: PlaceTypeId) => void;
  activeMilieu: Set<MilieuId>;
  onToggleMilieu: (milieu: MilieuId) => void;
  hideDone: boolean;
  onToggleHideDone: () => void;
}

export default function TypeFilter({
  active,
  onToggle,
  activeMilieu,
  onToggleMilieu,
  hideDone,
  onToggleHideDone,
}: TypeFilterProps) {
  return (
    <div className="type-filter" role="group" aria-label="Filtrer par type et milieu">
      {PLACE_TYPES.map((t) => (
        <Pill key={t.id} color={t.id} active={active.has(t.id)} onClick={() => onToggle(t.id)}>
          <TypeIcon type={t.id} size={14} /> {t.label}
        </Pill>
      ))}
      {MILIEUS.map((m) => {
        const MilieuIcon = MILIEU_ICONS[m.id];
        return (
          <Pill
            key={m.id}
            color="navy"
            active={activeMilieu.has(m.id)}
            onClick={() => onToggleMilieu(m.id)}
          >
            <MilieuIcon size={14} /> {m.label}
          </Pill>
        );
      })}
      <Pill
        color="success"
        active={hideDone}
        onClick={onToggleHideDone}
        className="type-filter__hide-done"
      >
        <EyeOff size={14} aria-hidden="true" /> Masquer les faits
      </Pill>
    </div>
  );
}
```

- [ ] **Step 2: Créer `src/components/TypeFilter.css`**

```css
.type-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--ha-surface);
  border-bottom: 1px solid var(--ha-border);
  overflow-x: auto;
  flex-wrap: nowrap;
}

.type-filter__hide-done {
  margin-left: 12px;
}
```

- [ ] **Step 3: Retirer d'`App.css` les règles migrées**

Supprimer : `.type-filter`, `.filter-pill`, `.filter-pill.active`, `.filter-pill.hide-done`.

- [ ] **Step 4: Vérifier et committer**

```bash
npm run test && npm run lint && npm run build
```

Attendu : tout vert (TypeFilter.test : classes `active`, `aria-pressed`, noms par label ✓).

```bash
git add src/components/TypeFilter.tsx src/components/TypeFilter.css src/App.css
git commit -m "feat: barre de filtres avec pilules DA"
```

---

### Task 12: Liste de lieux

**Files:**
- Modify: `src/components/PlaceList.tsx`
- Create: `src/components/PlaceList.css`
- Modify: `src/App.css` (retrait des règles migrées)

- [ ] **Step 1: Réécrire `src/components/PlaceList.tsx`**

```tsx
import { MapPinned } from 'lucide-react';
import type { Place } from '../types';
import EmptyState from '../ui/molecules/EmptyState';
import PlaceCard from '../ui/molecules/PlaceCard';
import './PlaceList.css';

interface PlaceListProps {
  places: Place[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggleDone: (id: string) => void;
  emptyHint?: string;
}

export default function PlaceList({
  places,
  selectedId,
  onSelect,
  onToggleDone,
  emptyHint,
}: PlaceListProps) {
  if (places.length === 0) {
    return (
      <div className="place-list empty">
        <EmptyState icon={<MapPinned size={28} />}>
          {emptyHint ?? (
            <>
              Aucun point <span className="ha-accent">pour l'instant</span>.
              <br />
              Utilise la recherche ou le bouton « Ajouter un lieu ».
            </>
          )}
        </EmptyState>
      </div>
    );
  }
  return (
    <ul className="place-list">
      {places.map((place) => (
        <PlaceCard
          key={place.id}
          place={place}
          selected={place.id === selectedId}
          onSelect={onSelect}
          onToggleDone={onToggleDone}
        />
      ))}
    </ul>
  );
}
```

- [ ] **Step 2: Créer `src/components/PlaceList.css`**

```css
.place-list {
  list-style: none;
  margin: 0;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.place-list.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 24px;
}
```

- [ ] **Step 3: Retirer d'`App.css` les règles migrées**

Supprimer : `.place-list`, `.place-list.empty`, `.place-card` (et toutes ses sous-règles : `.card-select`, `.card-done`, `.done`, `.card-thumb`, `.card-fallback`, `.card-body`, `.card-title`, `.card-address`, `.card-meta`), `.type-badge`.

- [ ] **Step 4: Vérifier et committer**

```bash
npm run test && npm run lint && npm run build
```

Attendu : tout vert (PlaceList.test : `.card-title`, `listitem` classes `selected`/`done`, `/aucun point/i` ✓).

```bash
git add src/components/PlaceList.tsx src/components/PlaceList.css src/App.css
git commit -m "feat: liste de lieux avec cartes DA"
```

### Task 13: Fiche détaillée + visionneuse photos

**Files:**
- Modify: `src/components/PlaceDetails.tsx`
- Create: `src/components/PlaceDetails.css`
- Modify: `src/App.css` (retrait des règles migrées)

- [ ] **Step 1: Réécrire `src/components/PlaceDetails.tsx`** (logique inchangée, markup DA)

```tsx
import { useEffect, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getPlaceTypeDef } from '../constants';
import { useObjectUrl } from '../hooks/useObjectUrl';
import type { Place, PlacePhoto } from '../types';
import Badge from '../ui/atoms/Badge';
import Button from '../ui/atoms/Button';
import TypeIcon from '../ui/atoms/TypeIcon';
import DoneToggle from '../ui/molecules/DoneToggle';
import ImgThumb from '../ui/molecules/ImgThumb';
import MilieuChip from '../ui/molecules/MilieuChip';
import './PlaceDetails.css';

interface PlaceDetailsProps {
  place: Place;
  onBack: () => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
  onToggleDone: (id: string) => void;
}

export default function PlaceDetails({ place, onBack, onEdit, onDelete, onToggleDone }: PlaceDetailsProps) {
  const def = getPlaceTypeDef(place.type);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  return (
    <article className="place-details">
      <button type="button" className="details-back" onClick={onBack}>
        <ArrowLeft size={16} aria-hidden="true" /> Retour à la liste
      </button>
      <header className="details-header">
        <div className="details-badges">
          <Badge color={place.type} icon={<TypeIcon type={place.type} size={12} />}>
            {def.label}
          </Badge>
          <MilieuChip milieu={place.isOutdoor ? 'outdoor' : 'indoor'} />
        </div>
        <h2 className="details-title">{place.name}</h2>
        <p className="details-address">{place.address}</p>
      </header>
      {place.photos.length > 0 && (
        <div className="details-gallery">
          {place.photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              className="gallery-thumb"
              aria-label={`Voir la photo ${index + 1}`}
              onClick={() => setViewerIndex(index)}
            >
              <ImgThumb blob={photo.blob} />
            </button>
          ))}
        </div>
      )}
      <dl className="details-info">
        {place.hours && (
          <div>
            <dt>Horaires</dt>
            <dd>{place.hours}</dd>
          </div>
        )}
        <div>
          <dt>Prix</dt>
          <dd>{place.isFree ? 'Gratuit' : place.price || 'Payant'}</dd>
        </div>
      </dl>
      <div className="details-actions">
        <DoneToggle done={place.isDone === true} onToggle={() => onToggleDone(place.id)} variant="line" />
        <Button variant="outline" size="sm" onClick={onEdit}>
          Modifier
        </Button>
        {confirmDelete ? (
          <>
            <span className="confirm-label">Supprimer ce point ?</span>
            <Button variant="danger" size="sm" onClick={() => onDelete(place.id)}>
              Oui, supprimer
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
              Annuler
            </Button>
          </>
        ) : (
          <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
            Supprimer
          </Button>
        )}
      </div>
      {viewerIndex !== null && (
        <PhotoViewer
          photos={place.photos}
          startIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </article>
  );
}

function PhotoViewer({
  photos,
  startIndex,
  onClose,
}: {
  photos: PlacePhoto[];
  startIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const url = useObjectUrl(photos[index].blob);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % photos.length);
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + photos.length) % photos.length);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, photos.length]);

  return (
    <div className="photo-viewer" role="dialog" aria-modal="true" onClick={onClose}>
      {url && <img src={url} alt="" onClick={(e) => e.stopPropagation()} />}
      {photos.length > 1 && (
        <>
          <button
            type="button"
            className="viewer-nav prev"
            aria-label="Photo précédente"
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => (i - 1 + photos.length) % photos.length);
            }}
          >
            <ChevronLeft size={44} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="viewer-nav next"
            aria-label="Photo suivante"
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => (i + 1) % photos.length);
            }}
          >
            <ChevronRight size={44} aria-hidden="true" />
          </button>
        </>
      )}
      <button type="button" className="viewer-close" aria-label="Fermer" onClick={onClose}>
        <X size={34} aria-hidden="true" />
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Créer `src/components/PlaceDetails.css`**

```css
.place-details {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.details-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: none;
  color: var(--ha-iris);
  padding: 0;
  font-size: 14px;
  font-weight: 600;
  width: fit-content;
}

.details-back:hover {
  text-decoration: underline;
}

.details-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.details-title {
  margin: 8px 0 4px;
  font-size: 24px;
  line-height: 28px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: -1.2px;
  color: var(--ha-navy);
}

.details-address {
  margin: 0;
  color: var(--ha-muted);
  font-size: 14px;
}

.details-gallery {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.gallery-thumb {
  border: none;
  background: none;
  padding: 0;
  border-radius: var(--radius-thumb);
  overflow: hidden;
  flex-shrink: 0;
  width: 96px;
  height: 96px;
}

.gallery-thumb .img-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.details-info {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.details-info dt {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--ha-muted);
}

.details-info dd {
  margin: 2px 0 0;
}

.details-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 8px;
}

.confirm-label {
  font-size: 14px;
  color: var(--ha-danger);
}

.photo-viewer {
  position: fixed;
  inset: 0;
  z-index: 3000;
  background: rgba(19, 20, 69, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-viewer img {
  max-width: 92vw;
  max-height: 88vh;
  object-fit: contain;
  border-radius: var(--radius-thumb);
}

.viewer-close {
  position: absolute;
  top: 14px;
  right: 18px;
  background: none;
  border: none;
  color: #fff;
  display: flex;
}

.viewer-nav {
  position: absolute;
  background: none;
  border: none;
  color: #fff;
  padding: 16px;
  display: flex;
}

.viewer-nav.prev {
  left: 8px;
}

.viewer-nav.next {
  right: 8px;
}
```

- [ ] **Step 3: Retirer d'`App.css` les règles migrées**

Supprimer : `.place-details`, `.details-back`, `.details-header h2`, `.details-address`, `.details-gallery`, `.gallery-thumb` (et `.gallery-thumb .img-thumb`), `.details-info` (et `dt`/`dd`), `.details-actions` (et ses boutons), `.confirm-label`, `.photo-viewer` (et `img`), `.viewer-close`, `.viewer-nav` (et `.prev`/`.next`).

- [ ] **Step 4: Vérifier et committer**

```bash
npm run test && npm run lint && npm run build
```

Attendu : tout vert (PlaceDetails.test déjà mis à jour en tâche 2 : `'Marquer comme fait'`, `'Fait'`).

```bash
git add src/components/PlaceDetails.tsx src/components/PlaceDetails.css src/App.css
git commit -m "feat: fiche détaillée et visionneuse façon HelloAsso"
```

---

### Task 14: Formulaire (modale)

**Files:**
- Modify: `src/components/PlaceForm.tsx`
- Create: `src/components/PlaceForm.css`
- Modify: `src/App.css` (retrait des règles migrées)

- [ ] **Step 1: Réécrire le JSX de `src/components/PlaceForm.tsx`** (états, `handleFiles`, `handleSubmit` conservés à l'identique — seul le `return` change)

Imports à ajouter (et supprimer `import ImgThumb from './ImgThumb'` s'il reste) :

```tsx
import { ImagePlus } from 'lucide-react';
import Button from '../ui/atoms/Button';
import Checkbox from '../ui/atoms/Checkbox';
import Input from '../ui/atoms/Input';
import Select from '../ui/atoms/Select';
import PhotoThumb from '../ui/molecules/PhotoThumb';
import './PlaceForm.css';
```

Nouveau `return` :

```tsx
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <form className="place-form" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2 className="place-form__title">{isEdit ? 'Modifier le lieu' : 'Nouveau lieu'}</h2>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <label>
          Nom *
          <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </label>
        <label>
          Adresse *
          <Input value={address} onChange={(e) => setAddress(e.target.value)} />
        </label>
        <label>
          Type
          <Select value={type} onChange={(e) => setType(e.target.value as PlaceTypeId)}>
            {PLACE_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </Select>
        </label>
        <label>
          Horaires d'ouverture
          <Input
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="ex : Lun-Ven 9h-18h"
          />
        </label>
        <label className="place-form__check">
          <Checkbox checked={isFree} onChange={(e) => setIsFree(e.target.checked)} />
          Gratuit
        </label>
        {!isFree && (
          <label>
            Prix
            <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="ex : 12 €" />
          </label>
        )}
        <label className="place-form__check">
          <Checkbox checked={isOutdoor} onChange={(e) => setIsOutdoor(e.target.checked)} />
          Extérieur
        </label>
        <label className="place-form__photos">
          <ImagePlus size={20} aria-hidden="true" />
          <span>Photos — cliquer pour ajouter</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              void handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </label>
        {photos.length > 0 && (
          <div className="photo-thumbs">
            {photos.map((photo) => (
              <PhotoThumb
                key={photo.id}
                blob={photo.blob}
                onRemove={() => setPhotos((prev) => prev.filter((p) => p.id !== photo.id))}
              />
            ))}
          </div>
        )}
        <div className="form-actions">
          <Button variant="ghost" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit" disabled={busy}>
            {isEdit ? 'Enregistrer' : 'Créer'}
          </Button>
        </div>
      </form>
    </div>
  );
```

- [ ] **Step 2: Créer `src/components/PlaceForm.css`**

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(19, 20, 69, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.place-form {
  background: var(--ha-surface);
  border-radius: var(--radius-card);
  padding: 24px;
  width: min(560px, 100%);
  max-height: 92dvh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: var(--shadow-lg);
}

.place-form__title {
  margin: 0 0 6px;
  font-size: 20px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: -0.8px;
  color: var(--ha-navy);
}

.place-form label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  font-weight: 500;
}

.place-form__check {
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.place-form__photos {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 2px dashed var(--ha-iris-20);
  border-radius: var(--radius-sm);
  padding: 14px;
  color: var(--ha-muted);
  cursor: pointer;
  transition:
    border-color var(--transition-fast),
    color var(--transition-fast);
}

.place-form__photos:hover {
  border-color: var(--ha-iris);
  color: var(--ha-iris);
}

.place-form__photos input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
}

.form-error {
  color: var(--ha-danger-text);
  background: var(--ha-danger-bg);
  border: 1px solid #f5c6c8;
  border-radius: var(--radius-sm);
  padding: 8px 10px;
  margin: 0;
  font-size: 14px;
}

.photo-thumbs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 6px;
}
```

- [ ] **Step 3: Retirer d'`App.css` les règles migrées**

Supprimer : `.modal-overlay`, `.place-form` (et toutes ses sous-règles), `.form-error`, `.photo-thumbs`, `.photo-thumb` (et sous-règles), `.form-actions` (et sous-règles).

- [ ] **Step 4: Vérifier et committer**

```bash
npm run test && npm run lint && npm run build
```

Attendu : tout vert (PlaceForm.test : labels, `/créer/i`, `/enregistrer/i`, upload `/photos/i` ✓ — l'input file reste dans le label).

```bash
git add src/components/PlaceForm.tsx src/components/PlaceForm.css src/App.css
git commit -m "feat: formulaire en modale façon HelloAsso"
```

---

### Task 15: Carte — marqueurs et contrôles zoom

**Files:**
- Modify: `src/components/MapView.tsx`
- Create: `src/components/MapView.css`

- [ ] **Step 1: Modifier `src/components/MapView.tsx`**

Remplacer les fonctions locales `placeIcon` et `draftIcon` (issues de la tâche 2) par les molécules. Nouveaux imports :

```tsx
import type { Map as LeafletMap } from 'leaflet';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import type { MapState, Place } from '../types';
import { draftPinIcon, placePinIcon } from '../ui/molecules/MarkerPin';
import 'leaflet/dist/leaflet.css';
import './MapView.css';
```

(Supprimer l'import `divIcon` de `leaflet`, l'import `getPlaceTypeDef`, `checkSvg`/`markerSvg` et le type `PlaceTypeId` s'ils ne servent plus.) Dans le corps :

```tsx
          icon={placePinIcon(place.type, place.id === selectedId, place.isDone === true)}
```

et :

```tsx
        <Marker position={[draftPos.lat, draftPos.lng]} icon={draftPinIcon()} interactive={false} />
```

- [ ] **Step 2: Créer `src/components/MapView.css`**

```css
/* Contrôles zoom Leaflet façon DA */
.leaflet-control-zoom {
  border: none !important;
  box-shadow: var(--shadow-sm) !important;
  border-radius: var(--radius-sm) !important;
  overflow: hidden;
}

.leaflet-control-zoom a {
  color: var(--ha-navy) !important;
  border: none !important;
  background: var(--ha-surface) !important;
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast);
}

.leaflet-control-zoom a:hover {
  background: var(--ha-iris-10) !important;
  color: var(--ha-iris) !important;
}

.leaflet-container .leaflet-control-attribution {
  background: rgba(255, 251, 245, 0.85) !important;
  color: var(--ha-muted);
  font-size: 10px;
}
```

- [ ] **Step 3: Retirer d'`App.css` les règles marqueurs migrées**

Supprimer : `.marker-wrapper`, `.marker-pin` (et toutes ses sous-règles : `.done`, `.marker-check`, `span`, `.selected`, `.draft`), `@keyframes marker-pulse`.

- [ ] **Step 4: Vérifier et committer**

```bash
npm run test && npm run lint && npm run build
```

Attendu : tout vert.

```bash
git add src/components/MapView.tsx src/components/MapView.css src/App.css
git commit -m "feat: marqueurs et contrôles carte façon DA"
```

---

### Task 16: Suppression d'App.css, vérification finale

**Files:**
- Delete: `src/App.css`
- Modify: `src/App.tsx` (retirer l'import)

- [ ] **Step 1: Vérifier le contenu restant d'`App.css`**

```bash
grep -c '' src/App.css
```

Attendu : uniquement le bloc de variables de compatibilité `:root` ajouté en tâche 1 (toutes les autres règles ont été retirées dans les tâches 10-15). Si des règles restent, les migrer dans le CSS colocalisé du composant concerné avant de continuer.

- [ ] **Step 2: Supprimer `App.css`**

```bash
git rm src/App.css
```

Retirer `import './App.css';` de `src/App.tsx`.

- [ ] **Step 3: Vérification complète**

```bash
npm run lint && npm run build && npm run test
```

Attendu : 0 erreur, tous les tests verts.

- [ ] **Step 4: Vérification visuelle finale**

```bash
npm run dev
```

Checklist (à parcourir dans le navigateur) :
- Fond crème général, textes navy, bouton « Ajouter un lieu » iris (hover navy)
- Marqueurs avec icônes lucide de couleur par type, coche verte sur les lieux faits
- Cartes de lieu radius 24px avec badges en teintes douces, pilules de filtres par type
- Fiche détaillée : titre uppercase, badges, actions outline/danger
- Modale de création : panneau blanc radius 24px, dropzone photos en pointillés
- `#styleguide` : toutes les sections s'affichent
- Fenêtre < 900px : barre flottante pilule en bas, bascule Carte/Liste

- [ ] **Step 5: Commit final**

```bash
git add -A
git commit -m "feat: fin de migration DA — suppression d'App.css"
```

---

## Récapitulatif des livrables

| Phase | Tasks | Résultat |
|---|---|---|
| 1 — Fondations | 1-2 | Tokens DA, polices self-hostées, PWA re-teintée, icônes centralisées |
| 2 — Design system | 3-9 | 10 atomes, 8 molécules, styleguide `#styleguide`, tests DS |
| 3 — Écrans | 10-16 | Header, filtres, liste, fiche, formulaire, carte, onglets mobiles, `App.css` supprimé |






