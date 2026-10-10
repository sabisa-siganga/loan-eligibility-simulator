import { forwardRef, useId, useState } from 'react';
import type { ChangeEvent, ClipboardEvent, KeyboardEvent } from 'react';
import {
  formatMoneyInputBlur,
  formatMoneyInputFocus,
  isWholeRandDigitString,
  parseWholeRandDigits,
  sanitizeMoneyPaste,
} from '../../utils/formatMoney';
import styles from './MoneyInput.module.scss';

type MoneyInputProps = {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  onBlur?: () => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  readOnly?: boolean;
  name?: string;
  id?: string;
};

const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(
  (
    {
      label,
      value,
      onChange,
      onBlur,
      error,
      helperText,
      required = false,
      readOnly = false,
      name,
      id,
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;
    const [isFocused, setIsFocused] = useState(false);
    const [draft, setDraft] = useState('');
    const [pasteError, setPasteError] = useState<string | undefined>();

    const displayValue = isFocused ? draft : value === null ? '' : formatMoneyInputBlur(value);

    const shownError = error ?? pasteError;

    const handleFocus = () => {
      if (readOnly) {
        return;
      }
      setIsFocused(true);
      setPasteError(undefined);
      setDraft(value === null ? '' : formatMoneyInputFocus(value));
    };

    const handleBlur = () => {
      if (readOnly) {
        onBlur?.();
        return;
      }
      setIsFocused(false);
      if (draft === '') {
        onChange(null);
      } else {
        const parsed = parseWholeRandDigits(draft);
        if (parsed !== null) {
          onChange(parsed);
        }
      }
      onBlur?.();
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      if (readOnly) {
        return;
      }
      const next = event.target.value;
      setPasteError(undefined);
      if (!isWholeRandDigitString(next)) {
        return;
      }
      setDraft(next);
      onChange(next === '' ? null : Number(next));
    };

    const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
      if (readOnly) {
        event.preventDefault();
        return;
      }
      const pasted = event.clipboardData.getData('text');
      const result = sanitizeMoneyPaste(pasted);
      event.preventDefault();

      if (!result.ok) {
        setPasteError(result.reason);
        return;
      }

      setPasteError(undefined);
      setDraft(result.digits);
      onChange(result.digits === '' ? null : Number(result.digits));
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (readOnly) {
        return;
      }
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
          readOnly={readOnly}
          value={displayValue}
          aria-invalid={shownError ? true : undefined}
          aria-describedby={
            [helperText ? helperId : null, shownError ? errorId : null].filter(Boolean).join(' ') ||
            undefined
          }
          aria-required={required || undefined}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
        />
        {helperText ? (
          <p id={helperId} className={styles.helper}>
            {helperText}
          </p>
        ) : null}
        {shownError ? (
          <p id={errorId} className={styles.error} role="alert">
            {shownError}
          </p>
        ) : null}
      </div>
    );
  },
);

MoneyInput.displayName = 'MoneyInput';

export default MoneyInput;
