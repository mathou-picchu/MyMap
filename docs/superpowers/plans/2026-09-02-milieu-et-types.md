# Milieu extérieur/intérieur + nouvelle liste de types — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** La carte s'ouvre toujours sur Paris ; « extérieur » devient un attribut de point (`isOutdoor`) filtrable ; la liste de types devient Visite, Balade, Restaurant, Gourmandise, Hébergement, Shopping, Autre — avec migration automatique des anciennes données.

**Architecture:** Nouveau module `src/migrations.ts` (conversion des ids de types, idempotent, détection d'inactivité par identité de référence) utilisé par l'import de fichiers et par un effet de démarrage dans App qui réécrit IndexedDB si nécessaire. `MILIEUS` dans `constants.ts` alimente les pilules de filtre et le badge de fiche. La mémorisation de la position de carte (`mymap.mapstate`, `onMoveEnd`) est supprimée.

**Tech Stack:** React 19, TypeScript strict (`noUnusedLocals`), Vitest + Testing Library, idb, react-leaflet.

**Spéc:** `docs/superpowers/specs/2026-09-02-milieu-et-types-design.md`

**Conventions du repo :**

- Tests sans globals : importer `describe, expect, it, vi` depuis `'vitest'`.
- Règle ESLint `react-hooks/set-state-in-effect` : jamais de `setState` synchrone dans le corps d'un `useEffect` (utiliser `.then`).
- Le build (`tsc -b`) type-checke les fichiers de test : les littéraux de types (`'food'`…) doivent être valides partout.
- Exécuter les tests d'un fichier : `npx vitest run <fichier>`. Suite complète : `npm run test`. Lint : `npm run lint`.
- Compteur de tests attendu : 76 → T1 : 75 → T2 : 86 → T3 : 89 → T4 : 93 → T5 : 96 → T6 : 100.

---

### Task 1: Carte toujours centrée sur Paris

**Files:**
- Modify: `src/App.tsx:18-31,48,219-222`
- Modify: `src/components/MapView.tsx:8-56`
- Test: `src/App.test.tsx:69-81`

- [ ] **Step 1: Écrire le test (remplacer les deux tests de position mémorisée)**

Dans `src/App.test.tsx`, remplacer les tests « centre sur Paris si l'ancienne vue France par défaut est mémorisée » et « respecte la position de carte mémorisée » (lignes 69-81) par :

```tsx
  it('ignore toute position mémorisée et ouvre sur Paris', () => {
    localStorage.setItem('mymap.mapstate', JSON.stringify({ lat: 48.85, lng: 2.35, zoom: 15 }));
    render(<App />);
    const map = screen.getByTestId('map-view-mock');
    expect(map).toHaveAttribute('data-lat', '48.8566');
    expect(map).toHaveAttribute('data-lng', '2.3522');
    expect(map).toHaveAttribute('data-zoom', '12');
  });
```

Le test « centre sur Paris par défaut si aucune position n'est mémorisée » (lignes 61-67) est conservé tel quel.

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run src/App.test.tsx`
Expected: FAIL — « respecte la position mémorisée » échoue (data-zoom vaut 15, pas 12). Les autres tests passent.

- [ ] **Step 3: Implémenter dans App.tsx**

Remplacer les lignes 18-31 (les trois constantes/fonction `DEFAULT_MAP_STATE`, `LEGACY_MAP_STATE`, `loadInitialMapState`) par :

```tsx
const PARIS_MAP_STATE: MapState = { lat: 48.8566, lng: 2.3522, zoom: 12 };
```

Supprimer la ligne 48 :

```tsx
  const [initialMapState] = useState(loadInitialMapState);
```

Dans le JSX de `<MapView>`, remplacer `initialMapState={initialMapState}` par `initialMapState={PARIS_MAP_STATE}` et supprimer la ligne `onMoveEnd={(state) => saveJSON('mymap.mapstate', state)}`. (`saveJSON` reste utilisé par les effets `mymap.filters` et `mymap.hidedone`.)

- [ ] **Step 4: Implémenter dans MapView.tsx**

Retirer `onMoveEnd: (state: MapState) => void;` de l'interface `MapViewProps`. Remplacer le composant `MapEvents` par :

```tsx
function MapEvents({ addMode, onMapClick }: Pick<MapViewProps, 'addMode' | 'onMapClick'>) {
  useMapEvents({
    click(e) {
      if (addMode) onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}
```

Dans la signature du composant `MapView`, retirer `onMoveEnd` de la déstructuration. Remplacer `<MapEvents addMode={addMode} onMapClick={onMapClick} onMoveEnd={onMoveEnd} />` par `<MapEvents addMode={addMode} onMapClick={onMapClick} />`.

- [ ] **Step 5: Vérifier**

Run: `npm run test && npm run lint`
Expected: 75 tests passent, lint OK.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/components/MapView.tsx src/App.test.tsx
git commit -m "feat: carte toujours centrée sur Paris au démarrage"
```

---

### Task 2: Nouvelle liste de types, champ isOutdoor, module migrations

**Files:**
- Modify: `src/types.ts`
- Modify: `src/constants.ts`
- Create: `src/migrations.ts`
- Test: Create `src/migrations.test.ts`
- Test: Modify `src/constants.test.ts`
- Test: Modify `src/components/TypeFilter.test.tsx`
- Test: Modify `src/components/PlaceList.test.tsx:7`
- Test: Modify `src/App.test.tsx:34`

- [ ] **Step 1: Écrire le fichier de tests migrations.test.ts**

```ts
import { describe, expect, it } from 'vitest';
import { isKnownTypeId, migratePlace, migrateTypeId } from './migrations';
import type { Place, PlaceTypeId } from './types';

function makePlace(overrides: Partial<Place> = {}): Place {
  return {
    id: 'p1',
    name: 'Tour Eiffel',
    address: 'Paris',
    lat: 48.85,
    lng: 2.29,
    isFree: true,
    type: 'visit',
    photos: [],
    createdAt: 1000,
    updatedAt: 2000,
    ...overrides,
  };
}

describe('migrations', () => {
  it('convertit les anciens types', () => {
    expect(migrateTypeId('outdoor')).toBe('balade');
    expect(migrateTypeId('food')).toBe('restaurant');
    expect(migrateTypeId('drink')).toBe('gourmandise');
  });

  it('garde les types actuels', () => {
    expect(migrateTypeId('visit')).toBe('visit');
    expect(migrateTypeId('balade')).toBe('balade');
    expect(migrateTypeId('restaurant')).toBe('restaurant');
    expect(migrateTypeId('gourmandise')).toBe('gourmandise');
    expect(migrateTypeId('lodging')).toBe('lodging');
    expect(migrateTypeId('shopping')).toBe('shopping');
    expect(migrateTypeId('other')).toBe('other');
  });

  it('reconnaît les types connus, actuels et anciens', () => {
    expect(isKnownTypeId('visit')).toBe(true);
    expect(isKnownTypeId('outdoor')).toBe(true);
    expect(isKnownTypeId('food')).toBe(true);
    expect(isKnownTypeId('drink')).toBe(true);
    expect(isKnownTypeId('museum')).toBe(false);
    expect(isKnownTypeId('')).toBe(false);
  });

  it('remplace un type inconnu par « autre »', () => {
    expect(migrateTypeId('museum')).toBe('other');
  });

  it('ne confond pas « constructor » avec un ancien type', () => {
    expect(isKnownTypeId('constructor')).toBe(false);
    expect(migrateTypeId('constructor')).toBe('other');
  });

  it('marque extérieur un ancien point « outdoor »', () => {
    const migrated = migratePlace(makePlace({ type: 'outdoor' as PlaceTypeId }));
    expect(migrated).toMatchObject({ type: 'balade', isOutdoor: true });
  });

  it('convertit un ancien type en intérieur', () => {
    const migrated = migratePlace(makePlace({ type: 'food' as PlaceTypeId }));
    expect(migrated).toMatchObject({ type: 'restaurant', isOutdoor: false });
  });

  it('complète un isOutdoor manquant', () => {
    const migrated = migratePlace(makePlace());
    expect(migrated.isOutdoor).toBe(false);
  });

  it('renvoie la même référence si rien ne change', () => {
    const place = makePlace({ isOutdoor: false });
    expect(migratePlace(place)).toBe(place);
    const balade = makePlace({ type: 'balade', isOutdoor: true });
    expect(migratePlace(balade)).toBe(balade);
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run src/migrations.test.ts`
Expected: FAIL — `Failed to resolve import "./migrations"` (module inexistant).

- [ ] **Step 3: Implémenter types.ts**

Ligne 1, remplacer l'union et ajouter `MilieuId` :

```ts
export type PlaceTypeId = 'visit' | 'balade' | 'restaurant' | 'gourmandise' | 'lodging' | 'shopping' | 'other';

export type MilieuId = 'outdoor' | 'indoor';
```

Dans `Place`, ajouter après `isDone?: boolean;` :

```ts
  isOutdoor?: boolean;
```

- [ ] **Step 4: Implémenter constants.ts (nouvelle liste + milieux)**

```ts
import type { MilieuId, PlaceTypeId } from './types';

export interface PlaceTypeDef {
  id: PlaceTypeId;
  label: string;
  emoji: string;
  color: string;
}

export const PLACE_TYPES: PlaceTypeDef[] = [
  { id: 'visit', label: 'Visite', emoji: '🏛️', color: '#3b82f6' },
  { id: 'balade', label: 'Balade', emoji: '🌳', color: '#22c55e' },
  { id: 'restaurant', label: 'Restaurant', emoji: '🍽️', color: '#f97316' },
  { id: 'gourmandise', label: 'Gourmandise', emoji: '🍰', color: '#a855f7' },
  { id: 'lodging', label: 'Hébergement', emoji: '🛏️', color: '#14b8a6' },
  { id: 'shopping', label: 'Shopping', emoji: '🛍️', color: '#ec4899' },
  { id: 'other', label: 'Autre', emoji: '📍', color: '#64748b' },
];

export const PLACE_TYPE_IDS: PlaceTypeId[] = PLACE_TYPES.map((t) => t.id);

export function getPlaceTypeDef(id: PlaceTypeId): PlaceTypeDef {
  return PLACE_TYPES.find((t) => t.id === id) ?? PLACE_TYPES[PLACE_TYPES.length - 1];
}

export interface MilieuDef {
  id: MilieuId;
  label: string;
  emoji: string;
  color: string;
}

export const MILIEUS: MilieuDef[] = [
  { id: 'outdoor', label: 'Extérieur', emoji: '🌳', color: '#22c55e' },
  { id: 'indoor', label: 'Intérieur', emoji: '🏠', color: '#f59e0b' },
];

export function getMilieuDef(isOutdoor: boolean): MilieuDef {
  return MILIEUS[isOutdoor ? 0 : 1];
}
```

- [ ] **Step 5: Créer src/migrations.ts**

```ts
import { PLACE_TYPE_IDS } from './constants';
import type { Place, PlaceTypeId } from './types';

const LEGACY_TYPE_MAP = new Map<string, PlaceTypeId>([
  ['outdoor', 'balade'],
  ['food', 'restaurant'],
  ['drink', 'gourmandise'],
]);

export function isKnownTypeId(type: string): type is PlaceTypeId {
  return PLACE_TYPE_IDS.includes(type as PlaceTypeId) || LEGACY_TYPE_MAP.has(type);
}

export function migrateTypeId(type: string): PlaceTypeId {
  return LEGACY_TYPE_MAP.get(type) ?? (isKnownTypeId(type) ? type : 'other');
}

export function migratePlace(place: Place): Place {
  const originalType: string = place.type;
  const type = migrateTypeId(originalType);
  const isOutdoor = place.isOutdoor ?? originalType === 'outdoor';
  if (type === place.type && isOutdoor === place.isOutdoor) {
    return place;
  }
  return { ...place, type, isOutdoor };
}
```

(`const originalType: string = place.type` évite l'erreur TS2367 : en base, d'anciens points peuvent encore porter l'id `outdoor` à l'exécution.)

- [ ] **Step 6: Vérifier migrations**

Run: `npx vitest run src/migrations.test.ts`
Expected: PASS (9 tests).

- [ ] **Step 7: Mettre à jour les tests existants (littéraux d'anciens types)**

`src/constants.test.ts` — remplacer l'assertion `getPlaceTypeDef('food').label).toBe('Nourriture')` par `getPlaceTypeDef('restaurant').label).toBe('Restaurant')` et ajouter deux tests dans le même `describe` :

```ts
  it('définit exactement 2 milieux', () => {
    expect(MILIEUS).toHaveLength(2);
  });

  it('retourne la définition d\'un milieu', () => {
    expect(getMilieuDef(true).id).toBe('outdoor');
    expect(getMilieuDef(false).id).toBe('indoor');
  });
```

Importer en conséquence : `import { getMilieuDef, getPlaceTypeDef, MILIEUS, PLACE_TYPES } from './constants';`

`src/components/TypeFilter.test.tsx` — remplacer les littéraux périmés :

- « marque les pastilles actives » : `renderFilter(['restaurant', 'visit'])`, assertions sur `/restaurant/i` (active) et `/balade/i` (inactive).
- « appelle onToggle avec le type cliqué » : `renderFilter(['restaurant'], onToggle)`, clic sur `/gourmandise/i`, `expect(onToggle).toHaveBeenCalledWith('gourmandise')`.
- « indique l'état pressé » : `renderFilter(['restaurant'])`, assertions sur `/restaurant/i` et `/visite/i`.
- « déclenche onToggleHideDone au clic » : `renderFilter(['restaurant'], vi.fn(), true)`.

`src/components/PlaceList.test.tsx` ligne 7 : `type: PlaceTypeId = 'food'` → `type: PlaceTypeId = 'restaurant'`.

`src/App.test.tsx` ligne 34 : `type: 'food'` → `type: 'restaurant'`.

- [ ] **Step 8: Vérifier**

Run: `npm run test && npm run lint`
Expected: 86 tests passent (75 + 9 migrations + 2 milieux), lint OK.

- [ ] **Step 9: Commit**

```bash
git add src/types.ts src/constants.ts src/migrations.ts src/migrations.test.ts src/constants.test.ts src/components/TypeFilter.test.tsx src/components/PlaceList.test.tsx src/App.test.tsx
git commit -m "feat: nouvelle liste de types + champ isOutdoor + module de migration"
```

---

### Task 3: Export/import v3

**Files:**
- Modify: `src/exportImport.ts`
- Test: `src/exportImport.test.ts`

- [ ] **Step 1: Écrire les tests (dans src/exportImport.test.ts)**

Dans le helper `project()`, ajouter après `isDone: p.isDone ?? false,` :

```ts
      isOutdoor: p.isOutdoor ?? false,
```

Dans le test « écrit un JSON versionné avec les photos en base64 », remplacer `expect(parsed.version).toBe(2)` par `expect(parsed.version).toBe(3)` et ajouter après l'assertion `isDone` :

```ts
    expect(parsed.places[0].isOutdoor).toBe(false);
```

Ajouter trois nouveaux tests dans le `describe` :

```ts
  it('accepte un fichier v2 avec les anciens types et les convertit', () => {
    const file = JSON.stringify({
      version: 2,
      exportedAt: 0,
      places: [
        { ...makePlace(), type: 'outdoor', photos: [] },
        { ...makePlace({ id: 'p2' }), type: 'drink', photos: [] },
        { ...makePlace({ id: 'p3' }), type: 'food', photos: [] },
      ],
    });
    const restored = parseImportFile(file);
    expect(restored[0]).toMatchObject({ type: 'balade', isOutdoor: true });
    expect(restored[1]).toMatchObject({ type: 'gourmandise', isOutdoor: false });
    expect(restored[2]).toMatchObject({ type: 'restaurant', isOutdoor: false });
  });

  it('rejette un isOutdoor invalide', () => {
    const file = JSON.stringify({
      version: 3,
      exportedAt: 0,
      places: [{ ...makePlace(), isOutdoor: 'oui' }],
    });
    expect(() => parseImportFile(file)).toThrow(/extérieur/);
  });

  it('fait un aller-retour avec le milieu', async () => {
    const original = [
      makePlace({ type: 'balade', isOutdoor: true }),
      makePlace({ id: 'p2', photos: [], isOutdoor: false }),
    ];
    const json = await exportPlaces(original);
    const restored = parseImportFile(json);
    expect(restored[0].isOutdoor).toBe(true);
    expect(restored[1].isOutdoor).toBe(false);
  });
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run src/exportImport.test.ts`
Expected: FAIL — version attendue 3 reçue 2 ; fichier v2 avec anciens types rejeté (« type inconnu »).

- [ ] **Step 3: Implémenter exportImport.ts**

Remplacer l'import de constants par migrations :

```ts
import { isKnownTypeId, migrateTypeId } from './migrations';
```

(supprimer `import { PLACE_TYPE_IDS } from './constants';` — sinon erreur `noUnusedLocals`).

`const EXPORT_VERSION = 2;` → `const EXPORT_VERSION = 3;`.

Dans `SerializedPlace` : `type: PlaceTypeId;` → `type: string;` et ajouter `isOutdoor?: boolean;` après `isDone?: boolean;`.

Dans `parseImportFile`, remplacer la vérification de version par :

```ts
  if (file.version !== 1 && file.version !== 2 && file.version !== EXPORT_VERSION) {
    throw new ImportError(`version du fichier non supportée (${String(file.version)}).`);
  }
```

Dans `exportPlaces`, dans l'objet sérialisé, ajouter après `isDone: place.isDone ?? false,` :

```ts
        isOutdoor: place.isOutdoor ?? false,
```

Dans `parsePlace` :

- remplacer la validation du type par :

```ts
  if (typeof place.type !== 'string' || !isKnownTypeId(place.type)) {
    throw new ImportError(`${prefix} : type inconnu (${String(place.type)}).`);
  }
```

- ajouter après la validation de `isDone` :

```ts
  if (place.isOutdoor !== undefined && typeof place.isOutdoor !== 'boolean') {
    throw new ImportError(`${prefix} : champ « extérieur » invalide.`);
  }
```

- dans l'objet retourné, remplacer `type: place.type,` par :

```ts
    isOutdoor: place.isOutdoor ?? place.type === 'outdoor',
    type: migrateTypeId(place.type),
```

- [ ] **Step 4: Vérifier**

Run: `npx vitest run src/exportImport.test.ts && npm run test && npm run lint`
Expected: 17 tests exportImport, 89 au total, lint OK.

- [ ] **Step 5: Commit**

```bash
git add src/exportImport.ts src/exportImport.test.ts
git commit -m "feat: export v3 avec conversion des anciens types et du milieu"
```

---

### Task 4: Case « Extérieur » (formulaire) et badge milieu (fiche)

**Files:**
- Modify: `src/components/PlaceForm.tsx`
- Modify: `src/components/PlaceDetails.tsx`
- Modify: `src/App.css` (après le bloc `.type-badge`)
- Test: `src/components/PlaceForm.test.tsx`
- Test: `src/components/PlaceDetails.test.tsx`

- [ ] **Step 1: Écrire les tests**

`src/components/PlaceForm.test.tsx` — dans « appelle onSave avec le point complet », ajouter après `expect(saved.isDone).toBe(false);` :

```ts
    expect(saved.isOutdoor).toBe(false);
```

Ajouter deux tests :

```tsx
  it('enregistre le milieu extérieur', async () => {
    const { onSave } = renderForm({
      draft: { ...draft, name: 'Parc des Buttes-Chaumont', address: 'Paris' },
    });
    await userEvent.click(screen.getByLabelText(/extérieur/i));
    await userEvent.click(screen.getByRole('button', { name: /créer/i }));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect((onSave.mock.calls[0][0] as Place).isOutdoor).toBe(true);
  });

  it('pré-coche le milieu extérieur en édition et le conserve', async () => {
    const { onSave } = renderForm({
      place: {
        id: 'p1',
        name: 'Parc Montsouris',
        address: 'Paris',
        lat: 1,
        lng: 2,
        isFree: true,
        type: 'balade',
        photos: [],
        isOutdoor: true,
        createdAt: 1000,
        updatedAt: 1000,
      },
      draft: null,
    });
    expect(screen.getByLabelText(/extérieur/i)).toBeChecked();
    await userEvent.click(screen.getByRole('button', { name: /enregistrer/i }));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect((onSave.mock.calls[0][0] as Place).isOutdoor).toBe(true);
  });
```

`src/components/PlaceDetails.test.tsx` — ajouter deux tests :

```tsx
  it('affiche le badge milieu intérieur par défaut', () => {
    renderDetails();
    expect(screen.getByText(/intérieur/i)).toBeInTheDocument();
  });

  it('affiche le badge milieu extérieur', () => {
    render(
      <PlaceDetails
        place={{ ...place, isOutdoor: true }}
        onBack={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        onToggleDone={() => {}}
      />,
    );
    expect(screen.getByText(/extérieur/i)).toBeInTheDocument();
  });
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run src/components/PlaceForm.test.tsx src/components/PlaceDetails.test.tsx`
Expected: FAIL — `getByLabelText(/extérieur/i)` et `getByText(/intérieur/i)` ne trouvent rien.

- [ ] **Step 3: Implémenter PlaceForm.tsx**

Ajouter l'état après `const [price, setPrice] = ...` :

```ts
  const [isOutdoor, setIsOutdoor] = useState(place?.isOutdoor ?? false);
```

Dans `handleSubmit`, dans l'objet `saved`, ajouter après `isDone: place?.isDone ?? false,` :

```ts
        isOutdoor,
```

Dans le JSX, après le bloc conditionnel `{!isFree && (...)}` du prix, ajouter :

```tsx
        <label className="checkbox">
          <input type="checkbox" checked={isOutdoor} onChange={(e) => setIsOutdoor(e.target.checked)} />
          Extérieur
        </label>
```

- [ ] **Step 4: Implémenter PlaceDetails.tsx**

Import : `import { getMilieuDef, getPlaceTypeDef } from '../constants';`

Après `const def = getPlaceTypeDef(place.type);` ajouter :

```ts
  const milieu = getMilieuDef(place.isOutdoor ?? false);
```

Dans l'en-tête, encapsuler le badge existant dans un conteneur et ajouter le badge milieu :

```tsx
        <div className="details-badges">
          <span className="type-badge" style={{ background: def.color }}>
            {def.emoji} {def.label}
          </span>
          <span className="type-badge" style={{ background: milieu.color }}>
            {milieu.emoji} {milieu.label}
          </span>
        </div>
```

- [ ] **Step 5: Ajouter le CSS (App.css, après le bloc `.type-badge`)**

```css
.details-badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
```

- [ ] **Step 6: Vérifier**

Run: `npx vitest run src/components/PlaceForm.test.tsx src/components/PlaceDetails.test.tsx && npm run test && npm run lint`
Expected: 93 tests au total, lint OK.

- [ ] **Step 7: Commit**

```bash
git add src/components/PlaceForm.tsx src/components/PlaceForm.test.tsx src/components/PlaceDetails.tsx src/components/PlaceDetails.test.tsx src/App.css
git commit -m "feat: case Extérieur dans le formulaire et badge milieu dans la fiche"
```

---

### Task 5: Pilules Extérieur / Intérieur et filtrage

**Files:**
- Modify: `src/components/TypeFilter.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.css` (après `.filter-pill.hide-done`)
- Test: `src/components/TypeFilter.test.tsx`
- Test: `src/App.test.tsx`

- [ ] **Step 1: Écrire les tests**

`src/components/TypeFilter.test.tsx` — étendre `renderFilter` (les appels existants à 2-3 arguments restent valides) :

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PLACE_TYPES } from '../constants';
import type { MilieuId, PlaceTypeId } from '../types';
import TypeFilter from './TypeFilter';

function renderFilter(
  active: PlaceTypeId[],
  onToggle = vi.fn(),
  activeMilieu: MilieuId[] = ['outdoor', 'indoor'],
  onToggleMilieu = vi.fn(),
  hideDone = false,
  onToggleHideDone = vi.fn(),
) {
  render(
    <TypeFilter
      active={new Set(active)}
      onToggle={onToggle}
      activeMilieu={new Set(activeMilieu)}
      onToggleMilieu={onToggleMilieu}
      hideDone={hideDone}
      onToggleHideDone={onToggleHideDone}
    />,
  );
  return { onToggle, onToggleMilieu, onToggleHideDone };
}
```

Ajouter deux tests :

```tsx
  it('affiche les pilules de milieu actives par défaut', () => {
    renderFilter(PLACE_TYPES.map((t) => t.id));
    expect(screen.getByRole('button', { name: /extérieur/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /intérieur/i })).toHaveAttribute('aria-pressed', 'true');
  });

  it('déclenche onToggleMilieu au clic', async () => {
    const { onToggleMilieu } = renderFilter([], vi.fn(), ['indoor']);
    expect(screen.getByRole('button', { name: /extérieur/i })).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(screen.getByRole('button', { name: /extérieur/i }));
    expect(onToggleMilieu).toHaveBeenCalledWith('outdoor');
  });
```

`src/App.test.tsx` — donner un type paramétrable à `makeAppPlace` :

```tsx
import type { MapState, Place, PlaceTypeId } from './types';

function makeAppPlace(
  id: string,
  name: string,
  isDone: boolean,
  type: PlaceTypeId = 'restaurant',
  isOutdoor?: boolean,
): Place {
  return {
    id,
    name,
    address: 'Paris',
    lat: 48.85,
    lng: 2.35,
    isFree: true,
    type,
    photos: [],
    isDone,
    isOutdoor,
    createdAt: 1,
    updatedAt: 1,
  };
}
```

Ajouter un test :

```tsx
  it('filtre par milieu extérieur / intérieur', async () => {
    vi.mocked(listPlaces).mockResolvedValueOnce([
      makeAppPlace('p1', 'Jardin partagé', false, 'balade', true),
      makeAppPlace('p2', 'Bibliothèque', false, 'visit', false),
    ]);
    render(<App />);
    expect(await screen.findByText('Jardin partagé')).toBeInTheDocument();
    expect(screen.getByText('Bibliothèque')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /extérieur/i }));
    expect(screen.queryByText('Jardin partagé')).not.toBeInTheDocument();
    expect(screen.getByText('Bibliothèque')).toBeInTheDocument();
  });
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run src/components/TypeFilter.test.tsx src/App.test.tsx`
Expected: FAIL — TypeFilter n'accepte pas les props `activeMilieu`/`onToggleMilieu` (erreur TypeScript / props inconnues).

- [ ] **Step 3: Implémenter TypeFilter.tsx (version complète)**

```tsx
import type { CSSProperties } from 'react';
import { MILIEUS, PLACE_TYPES } from '../constants';
import type { MilieuId, PlaceTypeId } from '../types';

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
        <button
          key={t.id}
          type="button"
          className={`filter-pill${active.has(t.id) ? ' active' : ''}`}
          style={{ '--pill-color': t.color } as CSSProperties}
          onClick={() => onToggle(t.id)}
          aria-pressed={active.has(t.id)}
        >
          <span aria-hidden="true">{t.emoji}</span> {t.label}
        </button>
      ))}
      {MILIEUS.map((m) => (
        <button
          key={m.id}
          type="button"
          className={`filter-pill milieu${activeMilieu.has(m.id) ? ' active' : ''}`}
          style={{ '--pill-color': m.color } as CSSProperties}
          onClick={() => onToggleMilieu(m.id)}
          aria-pressed={activeMilieu.has(m.id)}
        >
          <span aria-hidden="true">{m.emoji}</span> {m.label}
        </button>
      ))}
      <button
        type="button"
        className={`filter-pill hide-done${hideDone ? ' active' : ''}`}
        style={{ '--pill-color': '#16a34a' } as CSSProperties}
        onClick={onToggleHideDone}
        aria-pressed={hideDone}
      >
        <span aria-hidden="true">✓</span> Masquer les faits
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Ajouter le CSS (App.css, après `.filter-pill.hide-done`)**

```css
.filter-pill.milieu {
  margin-left: 12px;
}

.filter-pill.milieu + .filter-pill.milieu {
  margin-left: 0;
}
```

- [ ] **Step 5: Implémenter App.tsx**

Import des types : `import type { MapState, MilieuId, Place, PlaceDraft, PlaceTypeId } from './types';`

Ajouter l'état après `activeTypes` :

```ts
  const [activeMilieu, setActiveMilieu] = useState<Set<MilieuId>>(() => {
    const stored = loadJSON<unknown>('mymap.milieu', null);
    const milieux = Array.isArray(stored)
      ? stored.filter((m): m is MilieuId => m === 'outdoor' || m === 'indoor')
      : ['outdoor', 'indoor'];
    return new Set<MilieuId>(milieux);
  });
```

Ajouter l'effet de persistance à côté de celui de `mymap.filters` :

```ts
  useEffect(() => {
    saveJSON('mymap.milieu', [...activeMilieu]);
  }, [activeMilieu]);
```

Étendre le filtre :

```ts
  const filteredPlaces = places.filter(
    (p) =>
      activeTypes.has(p.type) &&
      activeMilieu.has(p.isOutdoor ? 'outdoor' : 'indoor') &&
      !(hideDone && p.isDone),
  );
```

Ajouter la bascule après `handleToggleType` :

```ts
  function handleToggleMilieu(milieu: MilieuId) {
    setActiveMilieu((prev) => {
      const next = new Set(prev);
      if (next.has(milieu)) {
        next.delete(milieu);
      } else {
        next.add(milieu);
      }
      return next;
    });
  }
```

Passer les props à `<TypeFilter>` :

```tsx
      <TypeFilter
        active={activeTypes}
        onToggle={handleToggleType}
        activeMilieu={activeMilieu}
        onToggleMilieu={handleToggleMilieu}
        hideDone={hideDone}
        onToggleHideDone={() => setHideDone((v) => !v)}
      />
```

- [ ] **Step 6: Vérifier**

Run: `npm run test && npm run lint`
Expected: 96 tests, lint OK.

- [ ] **Step 7: Commit**

```bash
git add src/components/TypeFilter.tsx src/components/TypeFilter.test.tsx src/App.tsx src/App.test.tsx src/App.css
git commit -m "feat: filtres Extérieur / Intérieur dans la barre de filtres"
```

---

### Task 6: Migration au démarrage, filtres mémorisés, README

**Files:**
- Modify: `src/App.tsx`
- Modify: `README.md`
- Test: `src/App.test.tsx`

- [ ] **Step 1: Écrire les tests (src/App.test.tsx)**

Mock `replaceAllPlaces` asynchrone (ligne du `vi.mock('./db')`) :

```ts
  replaceAllPlaces: vi.fn(async () => {}),
```

Importer la fonction pour les assertions :

```ts
import { listPlaces, replaceAllPlaces } from './db';
```

Ajouter quatre tests :

```tsx
  it('migre les anciens types au démarrage et les enregistre', async () => {
    vi.mocked(listPlaces).mockResolvedValueOnce([
      makeAppPlace('p1', 'Parc Monceau', false, 'outdoor' as PlaceTypeId),
      makeAppPlace('p2', 'Vieux café', false, 'food' as PlaceTypeId),
    ]);
    render(<App />);
    await screen.findByText('Parc Monceau');
    expect(replaceAllPlaces).toHaveBeenCalledTimes(1);
    expect(replaceAllPlaces).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'p1', type: 'balade', isOutdoor: true }),
      expect.objectContaining({ id: 'p2', type: 'restaurant', isOutdoor: false }),
    ]);
  });

  it('n\'enregistre rien quand les points sont déjà à jour', async () => {
    vi.mocked(listPlaces).mockResolvedValueOnce([
      makeAppPlace('p1', 'Café moderne', false, 'restaurant', false),
    ]);
    render(<App />);
    await screen.findByText('Café moderne');
    expect(replaceAllPlaces).not.toHaveBeenCalled();
  });

  it('convertit les anciens filtres mémorisés', () => {
    localStorage.setItem('mymap.filters', JSON.stringify(['outdoor', 'food', 'museum']));
    render(<App />);
    expect(screen.getByRole('button', { name: /balade/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /restaurant/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /visite/i })).toHaveAttribute('aria-pressed', 'false');
  });

  it('écarte les valeurs de milieu invalides', () => {
    localStorage.setItem('mymap.milieu', JSON.stringify(['outdoor', 'nimporte']));
    render(<App />);
    expect(screen.getByRole('button', { name: /extérieur/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /intérieur/i })).toHaveAttribute('aria-pressed', 'false');
  });
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run src/App.test.tsx`
Expected: FAIL — « migre les anciens types » : `replaceAllPlaces` jamais appelé (affichage « Parc Monceau » absent car filtre de type ne reconnaît pas `outdoor`) ; « convertit les anciens filtres » : pastilles non actives.

- [ ] **Step 3: Implémenter App.tsx**

Importer les migrations :

```ts
import { isKnownTypeId, migratePlace, migrateTypeId } from './migrations';
```

Remplacer l'initialiseur de `activeTypes` par :

```ts
  const [activeTypes, setActiveTypes] = useState<Set<PlaceTypeId>>(() => {
    const stored = loadJSON<unknown>('mymap.filters', null);
    const ids = Array.isArray(stored)
      ? stored.filter(isKnownTypeId).map(migrateTypeId)
      : [...PLACE_TYPE_IDS];
    return new Set<PlaceTypeId>(ids);
  });
```

Remplacer l'effet de chargement initial par :

```ts
  useEffect(() => {
    listPlaces()
      .then((places) => {
        const migrated = places.map(migratePlace);
        setPlaces(migrated);
        if (migrated.some((p, i) => p !== places[i])) {
          void replaceAllPlaces(migrated).catch(() => setStorageError(true));
        }
      })
      .catch(() => setStorageError(true));
  }, []);
```

- [ ] **Step 4: Vérifier**

Run: `npm run test && npm run lint`
Expected: 100 tests, lint OK.

- [ ] **Step 5: Mettre à jour README.md**

Ligne « Carte OpenStreetMap » :

```markdown
- **Carte OpenStreetMap** (Leaflet) : gratuite, sans clé API, ouverte sur Paris.
```

Ligne « Filtres par type » :

```markdown
- **Filtres** par type (Visite, Balade, Restaurant, Gourmandise, Hébergement, Shopping, Autre) et par milieu **Extérieur / Intérieur**, plus l'option « Masquer les faits ».
```

- [ ] **Step 6: Vérification finale**

Run: `npm run lint && npm run test && npm run build`
Expected: lint OK, 100 tests, build OK (tsc + vite).

Vérification manuelle (navigateur, `npm run dev`) : ouvrir l'app avec d'anciens points (types Extérieur/Nourriture/Boisson) → ils s'affichent en Balade/Restaurant/Gourmandise avec le bon badge milieu ; la carte s'ouvre sur Paris zoom 12 quel que soit le dernier mouvement ; décocher « Intérieur » masque les points intérieurs (liste + marqueurs + compteur).

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx src/App.test.tsx README.md
git commit -m "feat: migration des anciens types au démarrage + README"
```

---

## Auto-revue du plan

- Couverture du spec : carte Paris (T1), types/isOutdoor/migrations (T2), export v3 (T3), formulaire/fiche (T4), filtres milieu (T5), migration démarrage + filtres mémorisés + README (T6). ✔
- Pas de placeholders : tout le code est fourni. ✔
- Cohérence des signatures : `migrateTypeId`/`isKnownTypeId`/`migratePlace` (T2) utilisés tels quels en T3 et T6 ; `MILIEUS`/`getMilieuDef` (T2) utilisés en T4/T5 ; props `activeMilieu`/`onToggleMilieu` identiques en T5 (TypeFilter + App). ✔
