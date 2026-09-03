import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
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
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    function handlePointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

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

  function reset() {
    setResults([]);
    setStatus('idle');
    setOpen(false);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value);
    if (value.trim().length < 3) {
      reset();
    } else {
      setStatus('loading');
      setOpen(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div className="ha-searchfield" ref={rootRef}>
      <Search size={18} className="ha-searchfield__icon" aria-hidden="true" />
      <Input
        className="ha-searchfield__input"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Search an address or a place…"
        type="search"
        aria-label="Search an address or a place"
        aria-expanded={open}
        aria-controls="searchfield-results"
      />
      {status === 'loading' && (
        <span className="ha-searchfield__spinner">
          <Spinner size={16} label="Searching…" />
        </span>
      )}
      {open && results.length > 0 && (
        <ul className="ha-searchfield__results" id="searchfield-results">
          {results.map((result, index) => (
            <li key={index}>
              <button
                type="button"
                onClick={() => {
                  onSelect(result);
                  reset();
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
          Search unavailable. You can click the map to place a point.
        </p>
      )}
    </div>
  );
}
