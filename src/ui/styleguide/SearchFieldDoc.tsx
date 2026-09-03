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
          Selection: {value.name} — {value.address}
        </p>
      )}
    </div>
  );
}
