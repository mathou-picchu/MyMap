import { useEffect, useState, type FormEvent } from 'react';
import { PLACE_TYPES } from '../constants';
import { compressPhoto } from '../photoUtils';
import type { Place, PlaceDraft, PlacePhoto, PlaceTypeId } from '../types';
import ImgThumb from './ImgThumb';

interface PlaceFormProps {
  place: Place | null;
  draft: PlaceDraft | null;
  onCancel: () => void;
  onSave: (place: Place) => Promise<void> | void;
}

export default function PlaceForm({ place, draft, onCancel, onSave }: PlaceFormProps) {
  const origin = place ?? draft;
  if (!origin) {
    throw new Error('PlaceForm requiert place ou draft');
  }
  const { lat, lng } = origin;
  const isEdit = place !== null;
  const [name, setName] = useState(place?.name ?? draft?.name ?? '');
  const [address, setAddress] = useState(place?.address ?? draft?.address ?? '');
  const [type, setType] = useState<PlaceTypeId>(place?.type ?? 'other');
  const [hours, setHours] = useState(place?.hours ?? '');
  const [isFree, setIsFree] = useState(place?.isFree ?? true);
  const [price, setPrice] = useState(place?.price ?? '');
  const [isOutdoor, setIsOutdoor] = useState(place?.isOutdoor ?? false);
  const [photos, setPhotos] = useState<PlacePhoto[]>(place?.photos ?? []);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    for (const file of Array.from(files)) {
      try {
        const blob = await compressPhoto(file);
        setPhotos((prev) => [...prev, { id: crypto.randomUUID(), blob }]);
      } catch {
        setError(`Photo illisible : ${file.name}`);
      }
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Le nom est obligatoire.');
      return;
    }
    if (!address.trim()) {
      setError('L\'adresse est obligatoire.');
      return;
    }
    setBusy(true);
    try {
      const now = Date.now();
      const saved: Place = {
        id: place?.id ?? crypto.randomUUID(),
        name: name.trim(),
        address: address.trim(),
        lat,
        lng,
        hours: hours.trim() || undefined,
        isFree,
        price: !isFree ? price.trim() || undefined : undefined,
        type,
        isDone: place?.isDone ?? false,
        isOutdoor,
        photos,
        createdAt: place?.createdAt ?? now,
        updatedAt: now,
      };
      await onSave(saved);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <form className="place-form" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>{isEdit ? 'Modifier le lieu' : 'Nouveau lieu'}</h2>
        {error && <p className="form-error">{error}</p>}
        <label>
          Nom *
          <input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </label>
        <label>
          Adresse *
          <input value={address} onChange={(e) => setAddress(e.target.value)} />
        </label>
        <label>
          Type
          <select value={type} onChange={(e) => setType(e.target.value as PlaceTypeId)}>
            {PLACE_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Horaires d'ouverture
          <input
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="ex : Lun-Ven 9h-18h"
          />
        </label>
        <label className="checkbox">
          <input type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} />
          Gratuit
        </label>
        {!isFree && (
          <label>
            Prix
            <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="ex : 12 €" />
          </label>
        )}
        <label className="checkbox">
          <input type="checkbox" checked={isOutdoor} onChange={(e) => setIsOutdoor(e.target.checked)} />
          Extérieur
        </label>
        <label>
          Photos
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
              <div key={photo.id} className="photo-thumb">
                <ImgThumb blob={photo.blob} />
                <button
                  type="button"
                  onClick={() => setPhotos((prev) => prev.filter((p) => p.id !== photo.id))}
                  aria-label="Retirer la photo"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="form-actions">
          <button type="button" onClick={onCancel}>
            Annuler
          </button>
          <button type="submit" disabled={busy}>
            {isEdit ? 'Enregistrer' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  );
}
