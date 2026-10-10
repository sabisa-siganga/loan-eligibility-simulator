import { forwardRef, useId } from 'react';
import type { ChangeEvent, ClipboardEvent, KeyboardEvent } from 'react';
import { isWholeRandDigitString, sanitizeMoneyPaste } from '../../utils/formatMoney';
import { ErrorText } from '../ui/error-text';
import { HelperText } from '../ui/helper-text';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import styles from './WholeNumberInput.module.scss';

type WholeNumberInputProps = {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  onBlur?: () => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  name?: string;
  id?: string;
};

const WholeNumberInput = forwardRef<HTMLInputElement, WholeNumberInputProps>(
  ({ label, value, onChange, onBlur, error, helperText, required = false, name, id }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      const next = event.target.value;
      if (!isWholeRandDigitString(next)) {
        return;
      }
      onChange(next === '' ? null : Number(next));
    };

    const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
      const pasted = event.clipboardData.getData('text');
      const result = sanitizeMoneyPaste(pasted);
      event.preventDefault();
      if (!result.ok) {
        return;
      }
      onChange(result.digits === '' ? null : Number(result.digits));
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      const allowedKeys = [
        'Backspace',
        'Delete',
        'Tab',
        'Escape',
        'Enter',
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
        'Home',
        'End',
      ];

      if (allowedKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
        return;
      }

      if (!/^\d$/.test(event.key)) {
        event.preventDefault();
      }
    };

    return (
      <div className={styles.field}>
        <Label htmlFor={inputId} required={required}>
          {label}
        </Label>
        <Input
          ref={ref}
          id={inputId}
          name={name}
          inputMode="numeric"
          autoComplete="off"
          value={value === null ? '' : String(value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            [helperText ? helperId : null, error ? errorId : null].filter(Boolean).join(' ') ||
            undefined
          }
          aria-required={required || undefined}
          onBlur={onBlur}
          onChange={handleChange}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
        />
        {helperText ? <HelperText id={helperId}>{helperText}</HelperText> : null}
        {error ? <ErrorText id={errorId}>{error}</ErrorText> : null}
      </div>
    );
  },
);

WholeNumberInput.displayName = 'WholeNumberInput';

export default WholeNumberInput;
