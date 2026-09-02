# Coche « Fait » — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Objectif :** permettre de marquer un point comme « fait » (coche verte + estompage, dans la fiche et sur les cartes de la liste), avec filtre « Masquer les faits » persistant, modèle `isDone` et export v2 compatible v1.

**Architecture :** champ optionnel `isDone` sur `Place`, bascule via le CRUD IndexedDB existant (`savePlace`), filtrage dans `App` au même endroit que les filtres de type. La carte Leaflet reste vérifiée manuellement (convention du projet).

**Stack :** inchangée — Vite · React 19 · TypeScript · Vitest + Testing Library.

**Spec :** `docs/superpowers/specs/2026-09-02-coche-fait-design.md`

**Conventions :** interface en français, TDD, commits par tâche, état initial 64 tests verts.

---

### Task 1 : Modèle `isDone` + export v2 + conservation en édition

**Files:**
- Modify: `src/types.ts`, `src/exportImport.ts`, `src/exportImport.test.ts`, `src/components/PlaceForm.tsx`, `src/components/PlaceForm.test.tsx`

- [ ] **Step 1: Modifier `src/exportImport.test.ts` — projection et test de version**

Dans `project()`, ajouter `isDone` après la ligne `isFree: p.isFree,` :

```ts
      isFree: p.isFree,
      isDone: p.isDone ?? false,
```

Dans le test `écrit un JSON versionné avec les photos en base64`, remplacer `expect(parsed.version).toBe(1);` par :

```ts
    expect(parsed.version).toBe(2);
    expect(parsed.places[0].isDone).toBe(false);
```

- [ ] **Step 2: Ajouter les nouveaux tests dans `src/exportImport.test.ts`** (après le test d'aller-retour existant)

```ts
  it('fait un aller-retour avec le statut fait', async () => {
    const original = [makePlace(), makePlace({ id: 'p2', photos: [], isDone: true })];
    const json = await exportPlaces(original);
    const restored = parseImportFile(json);
    expect(restored[0].isDone).toBe(false);
    expect(restored[1].isDone).toBe(true);
  });

  it('accepte un fichier v1 sans champ isDone', () => {
    const file = JSON.stringify({
      version: 1,
      exportedAt: 0,
      places: [makePlace({ photos: [] })],
    });
    const restored = parseImportFile(file);
    expect(restored[0].isDone).toBe(false);
  });

  it('rejette un isDone invalide', () => {
    const file = JSON.stringify({
      version: 2,
      exportedAt: 0,
      places: [{ ...makePlace(), isDone: 'oui' }],
    });
    expect(() => parseImportFile(file)).toThrow(/fait/);
  });
```

- [ ] **Step 3: Modifier `src/components/PlaceForm.test.tsx`**

Dans le test `appelle onSave avec le point complet`, ajouter après `expect(saved.createdAt).toBeGreaterThan(0);` :

```tsx
    expect(saved.isDone).toBe(false);
```

Ajouter ce nouveau test après `pré-remplit le formulaire en édition` :

```tsx
  it('conserve le statut fait en édition', async () => {
    const { onSave } = renderForm({
      place: {
        id: 'p1',
        name: 'Musée d\'Orsay',
        address: 'Paris',
        lat: 1,
        lng: 2,
        isFree: false,
        price: '16 €',
        type: 'visit',
        photos: [],
        isDone: true,
        createdAt: 1000,
        updatedAt: 1000,
      },
      draft: null,
    });
    await userEvent.click(screen.getByRole('button', { name: /enregistrer/i }));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect((onSave.mock.calls[0][0] as Place).isDone).toBe(true);
  });
```

- [ ] **Step 4: Lancer les tests pour vérifier l'échec**

```bash
npm run test
```

Expected: FAIL — `isDone` absent du JSON exporté, version 2 refusée à l'import, `saved.isDone` undefined.

- [ ] **Step 5: Implémenter `src/types.ts`** — ajouter après `price?: string;` dans `Place` :

```ts
  isDone?: boolean;
```

- [ ] **Step 6: Implémenter `src/exportImport.ts`**

1. `const EXPORT_VERSION = 1;` → `const EXPORT_VERSION = 2;`
2. Dans `SerializedPlace`, ajouter après `price?: string;` :

```ts
  isDone?: boolean;
```

3. Dans `exportPlaces`, juste après `...place,` :

```ts
        ...place,
        isDone: place.isDone ?? false,
```

4. Dans `parseImportFile`, remplacer le contrôle de version :

```ts
  if (file.version !== 1 && file.version !== EXPORT_VERSION) {
    throw new ImportError(`version du fichier non supportée (${String(file.version)}).`);
  }
```

5. Dans `parsePlace`, après le contrôle de `price`, ajouter :

```ts
  if (place.isDone !== undefined && typeof place.isDone !== 'boolean') {
    throw new ImportError(`${prefix} : champ « fait » invalide.`);
  }
```

6. Dans l'objet retourné par `parsePlace`, ajouter après `price: place.price,` :

```ts
    isDone: place.isDone ?? false,
```

- [ ] **Step 7: Implémenter `src/components/PlaceForm.tsx`** — dans l'objet `saved` de `handleSubmit`, ajouter après `type,` :

```ts
        type,
        isDone: place?.isDone ?? false,
```

- [ ] **Step 8: Lancer les tests**

```bash
npm run test
```

Expected: 68 tests PASS (64 + 4).

- [ ] **Step 9: Commit**

```bash
git add src/types.ts src/exportImport.ts src/exportImport.test.ts src/components/PlaceForm.tsx src/components/PlaceForm.test.tsx
git commit -m "feat: statut « fait » dans le modèle et l'export v2"
```

---

### Task 2 : Bascule « fait » dans la fiche détaillée

**Files:**
- Modify: `src/components/PlaceDetails.tsx`, `src/components/PlaceDetails.test.tsx`, `src/App.css`

- [ ] **Step 1: Modifier `src/components/PlaceDetails.test.tsx`**

1. Le helper `renderDetails` devient :

```tsx
function renderDetails() {
  const onBack = vi.fn();
  const onEdit = vi.fn();
  const onDelete = vi.fn();
  const onToggleDone = vi.fn();
  render(
    <PlaceDetails
      place={place}
      onBack={onBack}
      onEdit={onEdit}
      onDelete={onDelete}
      onToggleDone={onToggleDone}
    />,
  );
  return { onBack, onEdit, onDelete, onToggleDone };
}
```

2. Ajouter ces deux tests dans le `describe` :

```tsx
  it('bascule le statut fait depuis la fiche', async () => {
    const { onToggleDone } = renderDetails();
    await userEvent.click(screen.getByRole('button', { name: '✓ Marquer comme fait' }));
    expect(onToggleDone).toHaveBeenCalledWith('p1');
  });

  it('affiche « ✓ Fait » pour un lieu déjà coché', () => {
    render(
      <PlaceDetails
        place={{ ...place, isDone: true }}
        onBack={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        onToggleDone={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: '✓ Fait' })).toBeInTheDocument();
  });
```

- [ ] **Step 2: Lancer les tests pour vérifier l'échec**

```bash
npm run test
```

Expected: FAIL — prop `onToggleDone` inexistante.

- [ ] **Step 3: Implémenter `src/components/PlaceDetails.tsx`**

1. Interface et décomposition :

```tsx
interface PlaceDetailsProps {
  place: Place;
  onBack: () => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
  onToggleDone: (id: string) => void;
}

export default function PlaceDetails({ place, onBack, onEdit, onDelete, onToggleDone }: PlaceDetailsProps) {
```

2. Dans `details-actions`, ajouter le bouton de bascule en premier :

```tsx
      <div className="details-actions">
        <button
          type="button"
          className={`done-toggle${place.isDone ? ' done' : ''}`}
          onClick={() => onToggleDone(place.id)}
        >
          {place.isDone ? '✓ Fait' : '✓ Marquer comme fait'}
        </button>
        <button type="button" onClick={onEdit}>
```

- [ ] **Step 4: Ajouter le style dans `src/App.css`** (après la règle `.details-actions .danger`)

```css
.details-actions .done-toggle.done {
  color: #16a34a;
  border-color: #16a34a;
}
```

- [ ] **Step 5: Lancer les tests**

```bash
npm run test
```

Expected: 70 tests PASS (68 + 2).

- [ ] **Step 6: Commit**

```bash
git add src/components/PlaceDetails.tsx src/components/PlaceDetails.test.tsx src/App.css
git commit -m "feat: bascule « fait » dans la fiche détaillée"
```

---

### Task 3 : Coche « fait » sur les cartes de la liste

**Files:**
- Modify: `src/components/PlaceList.tsx`, `src/components/PlaceList.test.tsx`, `src/App.css`

- [ ] **Step 1: Modifier `src/components/PlaceList.test.tsx`**

1. Tous les `render(<PlaceList …>)` existants reçoivent le prop supplémentaire `onToggleDone={vi.fn()}`.
2. Ajouter ces trois tests dans le `describe` :

```tsx
  it('coche un point sans le sélectionner', async () => {
    const onSelect = vi.fn();
    const onToggleDone = vi.fn();
    render(
      <PlaceList
        places={[makePlace('a', 'Café Jean')]}
        selectedId={null}
        onSelect={onSelect}
        onToggleDone={onToggleDone}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Marquer comme fait' }));
    expect(onToggleDone).toHaveBeenCalledWith('a');
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('marque la carte d\'un point fait', () => {
    render(
      <PlaceList
        places={[{ ...makePlace('a', 'Café Jean'), isDone: true }]}
        selectedId={null}
        onSelect={vi.fn()}
        onToggleDone={vi.fn()}
      />,
    );
    expect(screen.getByRole('listitem')).toHaveClass('done');
    expect(screen.getByRole('button', { name: 'Marquer comme à faire' })).toHaveClass('done');
  });

  it('affiche le message d\'état vide personnalisé', () => {
    render(
      <PlaceList
        places={[]}
        selectedId={null}
        onSelect={vi.fn()}
        onToggleDone={vi.fn()}
        emptyHint="Tous faits !"
      />,
    );
    expect(screen.getByText('Tous faits !')).toBeInTheDocument();
  });
```

- [ ] **Step 2: Lancer les tests pour vérifier l'échec**

```bash
npm run test
```

Expected: FAIL — prop `onToggleDone` inexistante.

- [ ] **Step 3: Réécrire `src/components/PlaceList.tsx`**

```tsx
import { getPlaceTypeDef } from '../constants';
import type { Place } from '../types';
import ImgThumb from './ImgThumb';

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
        <p>
          {emptyHint ?? (
            <>
              Aucun point pour l'instant.
              <br />
              Utilise la recherche ou le bouton « ＋ Ajouter un lieu ».
            </>
          )}
        </p>
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

function PlaceCard({
  place,
  selected,
  onSelect,
  onToggleDone,
}: {
  place: Place;
  selected: boolean;
  onSelect: (id: string) => void;
  onToggleDone: (id: string) => void;
}) {
  const def = getPlaceTypeDef(place.type);
  const done = place.isDone === true;
  return (
    <li className={`place-card${selected ? ' selected' : ''}${done ? ' done' : ''}`}>
      <button type="button" className="card-select" onClick={() => onSelect(place.id)}>
        <span className="card-thumb">
          <ImgThumb
            blob={place.photos[0]?.blob ?? null}
            fallback={
              <span className="card-fallback" style={{ background: def.color }}>
                {def.emoji}
              </span>
            }
          />
        </span>
        <span className="card-body">
          <span className="type-badge" style={{ background: def.color }}>
            {def.emoji} {def.label}
          </span>
          <span className="card-title">{place.name}</span>
          <span className="card-address">{place.address}</span>
          <span className="card-meta">
            {place.isFree ? 'Gratuit' : place.price || 'Payant'}
            {place.hours ? ` · ${place.hours}` : ''}
          </span>
        </span>
      </button>
      <button
        type="button"
        className={`card-done${done ? ' done' : ''}`}
        aria-pressed={done}
        aria-label={done ? 'Marquer comme à faire' : 'Marquer comme fait'}
        onClick={() => onToggleDone(place.id)}
      >
        ✓
      </button>
    </li>
  );
}
```

- [ ] **Step 4: Modifier `src/App.css`**

1. Renommer les sélecteurs existants (le bouton principal porte désormais la classe `card-select`) :
   - `.place-card button {` → `.place-card .card-select {`
   - `.place-card button:hover {` → `.place-card .card-select:hover {`
   - `.place-card.selected button {` → `.place-card.selected .card-select {`
2. Ajouter après ces règles :

```css
.place-card {
  position: relative;
}

.place-card .card-done {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: 50%;
  border: 1.5px solid var(--border);
  background: #fff;
  color: #94a3b8;
  font-size: 14px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.place-card .card-done.done {
  background: #16a34a;
  border-color: #16a34a;
  color: #fff;
}

.place-card .card-done:hover {
  border-color: #16a34a;
  color: #16a34a;
}

.place-card .card-done.done:hover {
  color: #fff;
}

.place-card.done .card-select {
  opacity: 0.55;
}
```

- [ ] **Step 5: Lancer les tests**

```bash
npm run test
```

Expected: 73 tests PASS (70 + 3).

- [ ] **Step 6: Commit**

```bash
git add src/components/PlaceList.tsx src/components/PlaceList.test.tsx src/App.css
git commit -m "feat: coche « fait » sur les cartes de la liste"
```

---

### Task 4 : Pilule « Masquer les faits »

**Files:**
- Modify: `src/components/TypeFilter.tsx`, `src/components/TypeFilter.test.tsx`, `src/App.css`

- [ ] **Step 1: Modifier `src/components/TypeFilter.test.tsx`**

1. Le helper devient :

```tsx
function renderFilter(
  active: PlaceTypeId[],
  onToggle = vi.fn(),
  hideDone = false,
  onToggleHideDone = vi.fn(),
) {
  render(
    <TypeFilter
      active={new Set(active)}
      onToggle={onToggle}
      hideDone={hideDone}
      onToggleHideDone={onToggleHideDone}
    />,
  );
  return { onToggle, onToggleHideDone };
}
```

2. Ajouter ces deux tests :

```tsx
  it('affiche la pilule « Masquer les faits » avec son état', () => {
    renderFilter(PLACE_TYPES.map((t) => t.id));
    const pill = screen.getByRole('button', { name: /masquer les faits/i });
    expect(pill).toHaveAttribute('aria-pressed', 'false');
  });

  it('déclenche onToggleHideDone au clic', async () => {
    const { onToggleHideDone } = renderFilter(['food'], vi.fn(), true);
    const pill = screen.getByRole('button', { name: /masquer les faits/i });
    expect(pill).toHaveClass('active');
    await userEvent.click(pill);
    expect(onToggleHideDone).toHaveBeenCalled();
  });
```

- [ ] **Step 2: Lancer les tests pour vérifier l'échec**

```bash
npm run test
```

Expected: FAIL — props `hideDone` / `onToggleHideDone` inexistantes.

- [ ] **Step 3: Implémenter `src/components/TypeFilter.tsx`**

```tsx
import type { CSSProperties } from 'react';
import { PLACE_TYPES } from '../constants';
import type { PlaceTypeId } from '../types';

interface TypeFilterProps {
  active: Set<PlaceTypeId>;
  onToggle: (type: PlaceTypeId) => void;
  hideDone: boolean;
  onToggleHideDone: () => void;
}

export default function TypeFilter({ active, onToggle, hideDone, onToggleHideDone }: TypeFilterProps) {
  return (
    <div className="type-filter" role="group" aria-label="Filtrer par type">
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

- [ ] **Step 4: Ajouter le style dans `src/App.css`** (après `.filter-pill.active`)

```css
.filter-pill.hide-done {
  margin-left: 12px;
}
```

- [ ] **Step 5: Lancer les tests**

```bash
npm run test
```

Expected: 75 tests PASS (73 + 2).

- [ ] **Step 6: Commit**

```bash
git add src/components/TypeFilter.tsx src/components/TypeFilter.test.tsx src/App.css
git commit -m "feat: filtre « masquer les faits »"
```

---

### Task 5 : Marqueurs carte estompés avec coche

**Files:**
- Modify: `src/components/MapView.tsx`, `src/App.css`

Note : pas de test automatisé pour la carte (convention du projet — vérification manuelle à la Task 6).

- [ ] **Step 1: Modifier `src/components/MapView.tsx`**

1. `placeIcon` prend un troisième paramètre et ajoute le badge :

```tsx
function placeIcon(type: PlaceTypeId, selected: boolean, done: boolean) {
  const def = getPlaceTypeDef(type);
  return divIcon({
    className: 'marker-wrapper',
    html: `<div class="marker-pin${selected ? ' selected' : ''}${done ? ' done' : ''}" style="background:${def.color}"><span>${def.emoji}</span>${done ? '<span class="marker-check">✓</span>' : ''}</div>`,
    iconSize: [36, 44],
    iconAnchor: [18, 42],
  });
}
```

2. L'appel dans le `map` des marqueurs devient :

```tsx
          icon={placeIcon(place.type, place.id === selectedId, place.isDone === true)}
```

- [ ] **Step 2: Modifier `src/App.css`**

1. Dans la règle `.marker-pin {`, ajouter `position: relative;`.
2. Ajouter après les règles `.marker-pin` existantes :

```css
.marker-pin.done {
  opacity: 0.6;
}

.marker-pin .marker-check {
  position: absolute;
  top: -6px;
  right: -8px;
  transform: rotate(45deg);
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #16a34a;
  color: #fff;
  font-size: 10px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #fff;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.4);
}
```

- [ ] **Step 3: Vérifier compilation, lint et build**

```bash
npm run lint && npm run test && npm run build
```

Expected: 75 tests PASS, build OK.

- [ ] **Step 4: Commit**

```bash
git add src/components/MapView.tsx src/App.css
git commit -m "feat: marqueurs estompés avec coche pour les lieux faits"
```

---

### Task 6 : Assemblage App (état, filtrage, persistance)

**Files:**
- Modify: `src/App.tsx`, `src/App.test.tsx`

- [ ] **Step 1: Modifier `src/App.test.tsx`**

1. Ajouter les imports (en tête de fichier) :

```tsx
import userEvent from '@testing-library/user-event';
import type { Place } from './types';
```

2. Ajouter un helper après les `vi.mock` :

```tsx
function makeAppPlace(id: string, name: string, isDone: boolean): Place {
  return {
    id,
    name,
    address: 'Paris',
    lat: 48.85,
    lng: 2.35,
    isFree: true,
    type: 'food',
    photos: [],
    isDone,
    createdAt: 1,
    updatedAt: 1,
  };
}
```

3. Ajouter ce test dans le `describe` :

```tsx
  it('masque les points faits quand le filtre est actif', async () => {
    vi.mocked(listPlaces).mockResolvedValueOnce([
      makeAppPlace('p1', 'Musée fait', true),
      makeAppPlace('p2', 'Café à faire', false),
    ]);
    render(<App />);
    expect(await screen.findByText('Café à faire')).toBeInTheDocument();
    expect(screen.getByText('Musée fait')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /masquer les faits/i }));
    expect(screen.queryByText('Musée fait')).not.toBeInTheDocument();
    expect(screen.getByText('Café à faire')).toBeInTheDocument();
  });
```

- [ ] **Step 2: Lancer les tests pour vérifier l'échec**

```bash
npm run test
```

Expected: FAIL — bouton « Masquer les faits » absent (TypeFilter non câblé dans App).

- [ ] **Step 3: Implémenter `src/App.tsx`**

1. État persistant — ajouter après la déclaration de `storageError` :

```tsx
  const [hideDone, setHideDone] = useState(() => {
    const stored = loadJSON<unknown>('mymap.hidedone', false);
    return typeof stored === 'boolean' ? stored : false;
  });
```

2. Persistance — ajouter après l'effet de `mymap.filters` :

```tsx
  useEffect(() => {
    saveJSON('mymap.hidedone', hideDone);
  }, [hideDone]);
```

3. Filtrage — remplacer la ligne `const filteredPlaces = …` :

```tsx
  const filteredPlaces = places.filter(
    (p) => activeTypes.has(p.type) && !(hideDone && p.isDone),
  );
```

4. Message d'état vide — ajouter après `filteredPlaces` :

```tsx
  const emptyHint =
    hideDone && places.some((p) => p.isDone)
      ? 'Tous vos points sont faits ! Décochez « Masquer les faits » pour les revoir.'
      : undefined;
```

5. Bascule — ajouter près des autres handlers :

```tsx
  async function handleToggleDone(id: string) {
    const place = places.find((p) => p.id === id);
    if (!place) return;
    await savePlace({ ...place, isDone: !place.isDone, updatedAt: Date.now() });
    await refreshPlaces();
  }
```

6. Câblage JSX :
   - `<TypeFilter active={activeTypes} onToggle={handleToggleType} />` devient :

```tsx
      <TypeFilter
        active={activeTypes}
        onToggle={handleToggleType}
        hideDone={hideDone}
        onToggleHideDone={() => setHideDone((v) => !v)}
      />
```

   - `<PlaceDetails … />` reçoit `onToggleDone={handleToggleDone}`.
   - `<PlaceList … />` reçoit `onToggleDone={handleToggleDone}` et `emptyHint={emptyHint}`.

- [ ] **Step 4: Lancer toutes les vérifications**

```bash
npm run lint && npm run test && npm run build
```

Expected: 76 tests PASS, lint et build OK.

- [ ] **Step 5: Vérification manuelle** (`npm run dev`)

1. Cocher un point depuis la liste (la coche devient verte, la carte s'estompe)
2. Ouvrir la fiche → « ✓ Fait » vert → re-cliquer repasse en « ✓ Marquer comme fait »
3. Le marqueur carte estompé avec badge ✓
4. « Masquer les faits » masque liste + marqueurs ; recharger la page → le filtre est mémorisé
5. Tous faits masqués → message « Tous vos points sont faits ! »
6. Exporter → le JSON contient `"isDone": true/false` ; ré-importer → statuts conservés

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/App.test.tsx
git commit -m "feat: filtrage des lieux faits dans l'application"
```

---

## Récapitulatif des vérifications finales

Après la Task 6, la fonctionnalité est complète si :

1. `npm run lint`, `npm run test` (76 tests), `npm run build` sont verts
2. La checklist manuelle de la Task 6 (6 points) est validée
3. Un fichier exporté en v1 s'importe toujours (compatibilité ascendante)
