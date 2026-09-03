# MyMap — My Places Map

Installable web app (PWA) in the style of Google Maps to create your own places of interest: sights, restaurants, parks, lodging…

## Highlights

- **Your data stays with you**: places are stored in your browser (IndexedDB) and never sent anywhere. The project is shareable, your data is not.
- **OpenStreetMap map** (Leaflet): free, no API key, opens on Paris.
- **Place creation** by address search (Nominatim) or by clicking the map.
- **Dual view** map / card list, HelloAsso-style design system.
- **Filters** by type (Visit, Walk, Restaurant, Dessert, Lodging, Shopping, Other) and by **Outdoor / Indoor** setting, plus a “Hide done” option.
- **Multiple photos** with automatic compression.
- **Descriptions**: free-text notes on every place — what makes it special, tips…
- **JSON export / import** to back up or transfer your places to another device.
- Installable on mobile and desktop (PWA), works offline for the app and already-visited tiles.
- **Styleguide**: open the app with `#styleguide` in the URL (e.g. `http://localhost:5173/#styleguide`) to browse the full design system (colors, type, icons, components).

## Getting started

```bash
npm install
npm run dev
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build (TypeScript check included) |
| `npm run preview` | Preview the build |
| `npm run test` | Run the tests (Vitest) |
| `npm run lint` | Lint the code (ESLint) |
| `npm run icons` | Regenerate the PWA icons |

## Where is my data?

In the IndexedDB storage **of your browser**, under the `mymap` database. It never leaves your machine unless you explicitly export it.

To back it up or transfer it to another device: **⬇️ Export** button (downloads a JSON file with your places and photos) then **⬆️ Import** on the other device.

⚠️ Clearing browser data deletes your places: remember to export regularly.

## Installing the app

- **Chrome / Edge (desktop)**: install icon in the address bar.
- **iOS Safari**: Share → “Add to Home Screen”.
- **Android Chrome**: menu → “Install app”.

## Deployment (GitHub Pages)

1. In `vite.config.ts`, add `base: '/MyMap/'` (your repository name) at the root of the config.
2. `npm run build`, then publish the contents of `dist/`.

## Credits

- Maps and geocoding: [OpenStreetMap](https://www.openstreetmap.org/copyright) and [Nominatim](https://nominatim.org/)
