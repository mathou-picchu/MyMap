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
