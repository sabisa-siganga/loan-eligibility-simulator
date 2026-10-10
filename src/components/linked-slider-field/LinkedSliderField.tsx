import { forwardRef, useId, useState } from 'react';
import type { ChangeEvent, ClipboardEvent, KeyboardEvent } from 'react';
import {
  formatMoneyInputBlur,
  formatMoneyInputFocus,
  isWholeRandDigitString,
  parseWholeRandDigits,
  sanitizeMoneyPaste,
} from '../../utils/formatMoney';
import styles from './LinkedSliderField.module.scss';

type LinkedSliderFieldProps = {
  label: string;
  mode: 'money' | 'term';
  value: number | null;
  min: number;
  max: number;
  step?: number;
  minLabel: string;
  maxLabel: string;
  onChange: (value: number | null) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  name?: string;
  id?: string;
};

const LinkedSliderField = forwardRef<HTMLInputElement, LinkedSliderFieldProps>(
  (
    {
      label,
      mode,
      value,
      min,
      max,
      step = 1,
      minLabel,
      maxLabel,
      onChange,
      onBlur,
      error,
      required = false,
      name,
      id,
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const sliderId = `${inputId}-slider`;
    const errorId = `${inputId}-error`;
    const [isFocused, setIsFocused] = useState(false);
    const [draft, setDraft] = useState('');
    const [pasteError, setPasteError] = useState<string | undefined>();

    const sliderValue = value !== null && value >= min && value <= max ? value : min;

    const displayValue = (() => {
      if (isFocused) {
        return draft;
      }
      if (value === null) {
        return '';
      }
      return mode === 'money' ? formatMoneyInputBlur(value) : String(value);
    })();

    const shownError = error ?? pasteError;

    const handleFocus = () => {
      setIsFocused(true);
      setPasteError(undefined);
      if (value === null) {
        setDraft('');
        return;
      }
      setDraft(mode === 'money' ? formatMoneyInputFocus(value) : String(value));
    };

    const handleBlur = () => {
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

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      const next = event.target.value;
      setPasteError(undefined);
      if (!isWholeRandDigitString(next)) {
        return;
      }
      setDraft(next);
      onChange(next === '' ? null : Number(next));
    };

    const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
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

    const handleSliderChange = (event: ChangeEvent<HTMLInputElement>) => {
      setPasteError(undefined);
      onChange(Number(event.target.value));
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
          value={displayValue}
          aria-invalid={shownError ? true : undefined}
          aria-describedby={shownError ? errorId : undefined}
          aria-required={required || undefined}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleInputChange}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
        />
        <div className={styles.sliderRow}>
          <input
            id={sliderId}
            className={styles.slider}
            type="range"
            min={min}
            max={max}
            step={step}
            value={sliderValue}
            aria-label={`Adjust ${label}`}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={sliderValue}
            onChange={handleSliderChange}
          />
          <div className={styles.rangeLabels} aria-hidden="true">
            <span>{minLabel}</span>
            <span>{maxLabel}</span>
          </div>
        </div>
        {shownError ? (
          <p id={errorId} className={styles.error} role="alert">
            {shownError}
          </p>
        ) : null}
      </div>
    );
  },
);

LinkedSliderField.displayName = 'LinkedSliderField';

export default LinkedSliderField;
