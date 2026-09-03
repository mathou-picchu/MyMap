import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Search } from 'lucide-react';
import { searchAddress, type GeoResult } from '../../geocoding';
import Input from '../atoms/Input';
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
    } else {
      setStatus('loading');
    }
  }

  return (
    <div className="ha-searchfield">
      <Search size={18} className="ha-searchfield__icon" aria-hidden="true" />
      <Input
        className="ha-searchfield__input"
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
