import { forwardRef, useId, useState } from 'react';
import type { ChangeEvent, ClipboardEvent, KeyboardEvent } from 'react';
import {
  formatMoneyInputBlur,
  formatMoneyInputFocus,
  isWholeRandDigitString,
  parseWholeRandDigits,
  sanitizeMoneyPaste,
} from '../../utils/formatMoney';
import { ErrorText } from '../ui/error-text';
import { HelperText } from '../ui/helper-text';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '../ui/input-group';
import { Label } from '../ui/label';
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
    const showHelperText = Boolean(helperText) && !shownError;

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
        <Label htmlFor={inputId} required={required}>
          {label}
        </Label>
        <InputGroup>
          <InputGroupInput
            ref={ref}
            id={inputId}
            name={name}
            inputMode="numeric"
            autoComplete="off"
            readOnly={readOnly}
            value={displayValue}
            aria-invalid={shownError ? true : undefined}
            aria-describedby={
              [showHelperText ? helperId : null, shownError ? errorId : null]
                .filter(Boolean)
                .join(' ') || undefined
            }
            aria-required={required || undefined}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
          />
          <InputGroupAddon align="inline-start">
            <InputGroupText aria-hidden="true">R</InputGroupText>
          </InputGroupAddon>
        </InputGroup>

        {showHelperText ? <HelperText id={helperId}>{helperText}</HelperText> : null}
        {shownError ? <ErrorText id={errorId}>{shownError}</ErrorText> : null}
      </div>
    );
  },
);

MoneyInput.displayName = 'MoneyInput';

export default MoneyInput;
