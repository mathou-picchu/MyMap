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
