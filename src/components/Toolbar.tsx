import { useRef } from 'react';
import { Download, LocateFixed, Upload } from 'lucide-react';
import IconButton from '../ui/atoms/IconButton';

interface ToolbarProps {
  onExport: () => void;
  onImport: (file: File) => void;
  onLocate: () => void;
}

export default function Toolbar({ onExport, onImport, onLocate }: ToolbarProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div className="toolbar">
      <IconButton label="Me localiser" onClick={onLocate}>
        <LocateFixed size={18} />
      </IconButton>
      <IconButton label="Exporter mes points" onClick={onExport}>
        <Download size={18} />
      </IconButton>
      <IconButton label="Importer un fichier" onClick={() => fileRef.current?.click()}>
        <Upload size={18} />
      </IconButton>
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
