import { useRef } from 'react';

interface ToolbarProps {
  onExport: () => void;
  onImport: (file: File) => void;
  onLocate: () => void;
}

export default function Toolbar({ onExport, onImport, onLocate }: ToolbarProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div className="toolbar">
      <button type="button" aria-label="Me localiser" title="Me localiser" onClick={onLocate}>
        📍<span className="btn-label"> Me localiser</span>
      </button>
      <button type="button" aria-label="Exporter mes points" title="Exporter mes points" onClick={onExport}>
        ⬇️<span className="btn-label"> Exporter</span>
      </button>
      <button
        type="button"
        aria-label="Importer un fichier"
        title="Importer un fichier"
        onClick={() => fileRef.current?.click()}
      >
        ⬆️<span className="btn-label"> Importer</span>
      </button>
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
