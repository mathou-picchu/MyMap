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
      <button type="button" aria-label="Locate me" title="Locate me" onClick={onLocate}>
        📍<span className="btn-label"> Locate me</span>
      </button>
      <button type="button" aria-label="Export my places" title="Export my places" onClick={onExport}>
        ⬇️<span className="btn-label"> Export</span>
      </button>
      <button
        type="button"
        aria-label="Import a file"
        title="Import a file"
        onClick={() => fileRef.current?.click()}
      >
        ⬆️<span className="btn-label"> Import</span>
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
