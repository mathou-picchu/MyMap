import type { ReactNode } from 'react';
import {
  Check,
  Download,
  EyeOff,
  List,
  MapPinned,
  Plus,
  Search,
  Sun,
  Upload,
} from 'lucide-react';
import { MILIEUS, PLACE_TYPES } from '../../constants';
import type { Place } from '../../types';
import Badge from '../atoms/Badge';
import Button from '../atoms/Button';
import Checkbox from '../atoms/Checkbox';
import IconButton from '../atoms/IconButton';
import Input from '../atoms/Input';
import Pill from '../atoms/Pill';
import Select from '../atoms/Select';
import Textarea from '../atoms/Textarea';
import Spinner from '../atoms/Spinner';
import TypeIcon from '../atoms/TypeIcon';
import DoneToggle from '../molecules/DoneToggle';
import EmptyState from '../molecules/EmptyState';
import MilieuChip from '../molecules/MilieuChip';
import PlaceCard from '../molecules/PlaceCard';
import StorageBanner from '../molecules/StorageBanner';
import { MILIEU_ICONS } from '../icons';
import SearchFieldDoc from './SearchFieldDoc';
import '../molecules/MarkerPin.css';
import './Styleguide.css';

const samplePlace: Place = {
  id: 'sample',
  name: 'Café Jean',
  address: '10 rue de la Paix, Paris',
  lat: 48.86,
  lng: 2.33,
  isFree: true,
  type: 'restaurant',
  photos: [],
  createdAt: 0,
  updatedAt: 0,
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="sg-section">
      <h2 className="sg-title">
        {title} <span className="ha-accent">·</span>
      </h2>
      <div className="sg-section__body">{children}</div>
    </section>
  );
}

export default function Styleguide() {
  return (
    <div className="sg">
      <header className="sg-header">
        <MapPinned size={28} aria-hidden="true" />
        <h1>
          MyMap <span className="ha-accent">styleguide</span>
        </h1>
        <a href="#" className="sg-back">
          ← Back to the app
        </a>
      </header>

      <Section title="Colors">
        <div className="sg-swatches">
          {[
            ['--ha-bg', 'Cream'],
            ['--ha-surface', 'Surface'],
            ['--ha-navy', 'Navy'],
            ['--ha-iris', 'Iris'],
            ['--ha-iris-20', 'Iris 20'],
            ['--ha-iris-10', 'Iris 10'],
            ['--ha-sun', 'Amber'],
            ['--ha-rose', 'Rose'],
            ['--ha-purple', 'Purple'],
            ['--ha-muted', 'Muted'],
            ['--ha-border', 'Border'],
            ['--ha-danger', 'Danger'],
            ['--ha-success', 'Success'],
          ].map(([token, label]) => (
            <div key={token} className="sg-swatch">
              <span className="sg-swatch__color" style={{ background: `var(${token})` }} />
              <code>{token}</code>
              <small>{label}</small>
            </div>
          ))}
        </div>
        <div className="sg-swatches">
          {PLACE_TYPES.map((t) => (
            <div key={t.id} className="sg-swatch">
              <span className="sg-swatch__color" style={{ background: `var(--type-${t.id})` }} />
              <code>--type-{t.id}</code>
              <small>{t.label}</small>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typography">
        <div className="sg-type">
          <p className="sg-type__h1">Place title — uppercase 800</p>
          <p className="sg-type__h2">Subtitle — uppercase 700</p>
          <p>
            Body text 16px Open Sans, with a word in <span className="ha-accent">Besley italic</span>.
          </p>
          <p className="sg-type__small">Secondary text 14px muted</p>
          <p className="sg-type__label">LABEL 12PX UPPERCASE</p>
        </div>
      </Section>

      <Section title="Icons">
        <div className="sg-icons">
          {PLACE_TYPES.map((t) => (
            <span key={t.id} className="sg-icon">
              <TypeIcon type={t.id} size={20} />
              <small>{t.label}</small>
            </span>
          ))}
          {MILIEUS.map((m) => {
            const Icon = MILIEU_ICONS[m.id];
            return (
              <span key={m.id} className="sg-icon">
                <Icon size={20} aria-hidden="true" />
                <small>{m.label}</small>
              </span>
            );
          })}
          <span className="sg-icon"><Plus size={20} /><small>Add</small></span>
          <span className="sg-icon"><Search size={20} /><small>Search</small></span>
          <span className="sg-icon"><Download size={20} /><small>Export</small></span>
          <span className="sg-icon"><Upload size={20} /><small>Import</small></span>
          <span className="sg-icon"><EyeOff size={20} /><small>Hide</small></span>
          <span className="sg-icon"><List size={20} /><small>List</small></span>
          <span className="sg-icon"><Check size={20} /><small>Done</small></span>
          <span className="sg-icon"><Sun size={20} /><small>Sun</small></span>
        </div>
      </Section>

      <Section title="Buttons">
        <div className="sg-row">
          <Button variant="primary" iconLeft={<Plus size={18} />}>Add a place</Button>
          <Button variant="accent">Hero action</Button>
          <Button variant="outline">Discover</Button>
          <Button variant="ghost">Cancel</Button>
          <Button variant="danger">Delete</Button>
          <Button variant="dark">Navy</Button>
          <Button variant="primary" loading>Loading</Button>
          <Button variant="primary" disabled>Disabled</Button>
        </div>
        <div className="sg-row">
          <Button size="sm" variant="outline">Small</Button>
          <Button size="md" variant="outline">Medium</Button>
          <Button size="lg" variant="outline">Large</Button>
          <IconButton label="Export"><Download size={18} /></IconButton>
          <IconButton label="Import"><Upload size={18} /></IconButton>
        </div>
      </Section>

      <Section title="Badges & pills">
        <div className="sg-row">
          {PLACE_TYPES.map((t) => (
            <Badge key={t.id} color={t.id} icon={<TypeIcon type={t.id} size={12} />}>
              {t.label}
            </Badge>
          ))}
          <Badge color="success" icon={<Check size={12} />}>Done</Badge>
          <MilieuChip milieu="outdoor" />
          <MilieuChip milieu="indoor" />
        </div>
        <div className="sg-row">
          {PLACE_TYPES.map((t) => (
            <Pill key={t.id} color={t.id} active>
              <TypeIcon type={t.id} size={14} /> {t.label}
            </Pill>
          ))}
          <Pill color="navy"><Sun size={14} /> Outdoor</Pill>
          <Pill color="success"><EyeOff size={14} /> Hide done</Pill>
        </div>
        <div className="sg-row">
          {PLACE_TYPES.map((t) => (
            <Pill key={t.id} color={t.id}>
              <TypeIcon type={t.id} size={14} /> {t.label}
            </Pill>
          ))}
        </div>
      </Section>

      <Section title="Form fields">
        <div className="sg-fields">
          <label>
            Name *
            <Input placeholder="e.g. Musée d'Orsay" />
          </label>
          <label>
            Type
            <Select>
              {PLACE_TYPES.map((t) => (
                <option key={t.id}>{t.label}</option>
              ))}
            </Select>
          </label>
          <label>
            Notes
            <Textarea rows={3} placeholder="e.g. Book ahead" />
          </label>
          <label className="sg-checkbox">
            <Checkbox defaultChecked /> Free
          </label>
        </div>
      </Section>

      <Section title="Molecules">
        <div className="sg-row">
          <DoneToggle done={false} onToggle={() => {}} variant="round" />
          <DoneToggle done onToggle={() => {}} variant="round" />
          <DoneToggle done={false} onToggle={() => {}} variant="line" />
          <DoneToggle done onToggle={() => {}} variant="line" />
          <Spinner size={24} />
        </div>
        <div className="sg-row">
          <EmptyState icon={<MapPinned size={28} />}>
            No places <span className="ha-accent">just yet</span>.
          </EmptyState>
        </div>
        <StorageBanner>Storage unavailable (private mode?).</StorageBanner>
        <div className="sg-row">
          <SearchFieldDoc />
        </div>
      </Section>

      <Section title="Place card">
        <div className="sg-row">
          <ul className="sg-card-list">
            <PlaceCard place={samplePlace} selected={false} onSelect={() => {}} onToggleDone={() => {}} />
            <PlaceCard
              place={{ ...samplePlace, id: 's2', name: 'Jardin partagé', type: 'balade', isDone: true }}
              selected
              onSelect={() => {}}
              onToggleDone={() => {}}
            />
          </ul>
        </div>
      </Section>

      <Section title="Markers">
        <div className="sg-markers">
          {PLACE_TYPES.map((t) => (
            <span key={t.id} className="sg-marker">
              <span className="marker-pin" style={{ background: `var(--type-${t.id})` }}>
                <TypeIcon type={t.id} size={15} />
              </span>
              <small>{t.label}</small>
            </span>
          ))}
          <span className="sg-marker">
            <span className="marker-pin done" style={{ background: 'var(--type-visit)' }}>
              <TypeIcon type="visit" size={15} />
              <span className="marker-check"><Check size={10} /></span>
            </span>
            <small>Done</small>
          </span>
        </div>
      </Section>

      <Section title="Mobile tabs">
        <nav className="mobile-tabbar mobile-tabbar--static" aria-label="Tabs preview">
          <button type="button" className="mobile-tabbar__seg active">
            <MapPinned size={18} /> Map
          </button>
          <button type="button" className="mobile-tabbar__seg">
            <List size={18} /> List <span className="mobile-tabbar__count">12</span>
          </button>
        </nav>
      </Section>
    </div>
  );
}
