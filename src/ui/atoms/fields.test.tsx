import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import Checkbox from './Checkbox';
import Input from './Input';
import Select from './Select';
import Textarea from './Textarea';

describe('champs de formulaire', () => {
  it('Input transmet value et onChange', async () => {
    function Demo() {
      const [v, setV] = useState('');
      return <Input aria-label="Nom" value={v} onChange={(e) => setV(e.target.value)} />;
    }
    render(<Demo />);
    await userEvent.type(screen.getByLabelText('Nom'), 'abc');
    expect(screen.getByLabelText('Nom')).toHaveValue('abc');
  });

  it('Select rend ses options', () => {
    render(
      <Select aria-label="Type">
        <option value="visit">Visite</option>
      </Select>,
    );
    expect(screen.getByLabelText('Type')).toHaveDisplayValue('Visite');
  });

  it('Textarea accepte la saisie', async () => {
    function Demo() {
      const [v, setV] = useState('');
      return <Textarea aria-label="Notes" value={v} onChange={(e) => setV(e.target.value)} />;
    }
    render(<Demo />);
    await userEvent.type(screen.getByLabelText('Notes'), 'hello');
    expect(screen.getByLabelText('Notes')).toHaveValue('hello');
  });

  it('Checkbox se coche et se décoche', async () => {
    function Demo() {
      const [v, setV] = useState(false);
      return <Checkbox aria-label="Gratuit" checked={v} onChange={(e) => setV(e.target.checked)} />;
    }
    render(<Demo />);
    const box = screen.getByLabelText('Gratuit');
    await userEvent.click(box);
    expect(box).toBeChecked();
    await userEvent.click(box);
    expect(box).not.toBeChecked();
  });
});
