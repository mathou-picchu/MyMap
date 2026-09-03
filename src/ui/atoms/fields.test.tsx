import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import Checkbox from './Checkbox';
import Input from './Input';
import Select from './Select';
import Textarea from './Textarea';

describe('form fields', () => {
  it('Input passes value and onChange', async () => {
    function Demo() {
      const [v, setV] = useState('');
      return <Input aria-label="Name" value={v} onChange={(e) => setV(e.target.value)} />;
    }
    render(<Demo />);
    await userEvent.type(screen.getByLabelText('Name'), 'abc');
    expect(screen.getByLabelText('Name')).toHaveValue('abc');
  });

  it('Select renders its options', () => {
    render(
      <Select aria-label="Type">
        <option value="visit">Visit</option>
      </Select>,
    );
    expect(screen.getByLabelText('Type')).toHaveDisplayValue('Visit');
  });

  it('Textarea accepts input', async () => {
    function Demo() {
      const [v, setV] = useState('');
      return <Textarea aria-label="Notes" value={v} onChange={(e) => setV(e.target.value)} />;
    }
    render(<Demo />);
    await userEvent.type(screen.getByLabelText('Notes'), 'hello');
    expect(screen.getByLabelText('Notes')).toHaveValue('hello');
  });

  it('Checkbox checks and unchecks', async () => {
    function Demo() {
      const [v, setV] = useState(false);
      return <Checkbox aria-label="Free" checked={v} onChange={(e) => setV(e.target.checked)} />;
    }
    render(<Demo />);
    const box = screen.getByLabelText('Free');
    await userEvent.click(box);
    expect(box).toBeChecked();
    await userEvent.click(box);
    expect(box).not.toBeChecked();
  });
});
