import { forwardRef, useId } from 'react';
import type { ChangeEvent, ClipboardEvent, KeyboardEvent } from 'react';
import { isWholeRandDigitString, sanitizeMoneyPaste } from '../../utils/formatMoney';
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
        <label className={styles.label} htmlFor={inputId}>
          {label}
          {required ? (
            <span className={styles.required} aria-hidden="true">
              {' '}
              *
            </span>
          ) : null}
        </label>
        <input
          ref={ref}
          id={inputId}
          name={name}
          className={styles.input}
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
        {helperText ? (
          <p id={helperId} className={styles.helper}>
            {helperText}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

WholeNumberInput.displayName = 'WholeNumberInput';

export default WholeNumberInput;
