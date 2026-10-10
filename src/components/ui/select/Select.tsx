import { forwardRef, useId } from 'react';
import type { ChangeEvent } from 'react';
import { ChevronDown, Info } from 'lucide-react';
import { ErrorText } from '../error-text';
import { HelperText } from '../helper-text';
import { Label } from '../label';
import styles from './Select.module.scss';

export type SelectOption = {
  value: string;
  label: string;
};

export type SelectProps = {
  label: string;
  value: string;
  options: SelectOption[];
  placeholder: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  name?: string;
  id?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      value,
      options,
      placeholder,
      onChange,
      onBlur,
      error,
      helperText,
      required = false,
      name,
      id,
    },
    ref,
  ) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;
    const showHelperText = Boolean(helperText) && !error;

    const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
      onChange(event.target.value);
    };

    return (
      <div className={styles.field}>
        <Label htmlFor={selectId} required={required}>
          {label}
        </Label>
        <div className={styles.selectWrap}>
          <select
            ref={ref}
            id={selectId}
            name={name}
            className={[styles.select, value === '' ? styles.placeholder : '']
              .filter(Boolean)
              .join(' ')}
            value={value}
            aria-invalid={error ? true : undefined}
            aria-describedby={
              [showHelperText ? helperId : null, error ? errorId : null]
                .filter(Boolean)
                .join(' ') || undefined
            }
            aria-required={required || undefined}
            onChange={handleChange}
            onBlur={onBlur}
          >
            <option value="">{placeholder}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className={styles.chevron} size={18} aria-hidden="true" />
        </div>
        {showHelperText ? (
          <HelperText id={helperId}>
            <Info size={16} aria-hidden="true" />
            <span>{helperText}</span>
          </HelperText>
        ) : null}
        {error ? <ErrorText id={errorId}>{error}</ErrorText> : null}
      </div>
    );
  },
);

Select.displayName = 'Select';
