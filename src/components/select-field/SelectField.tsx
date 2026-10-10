import { forwardRef, useId } from 'react';
import type { ChangeEvent } from 'react';
import { Info } from 'lucide-react';
import styles from './SelectField.module.scss';

export type SelectOption = {
  value: string;
  label: string;
};

type SelectFieldProps = {
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

const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
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

    const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
      onChange(event.target.value);
    };

    return (
      <div className={styles.field}>
        <label className={styles.label} htmlFor={selectId}>
          {label}
          {required ? (
            <span className={styles.required} aria-hidden="true">
              {' '}
              *
            </span>
          ) : null}
        </label>
        <select
          ref={ref}
          id={selectId}
          name={name}
          className={styles.select}
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            [helperText ? helperId : null, error ? errorId : null].filter(Boolean).join(' ') ||
            undefined
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
        {helperText ? (
          <p id={helperId} className={styles.helper}>
            <Info size={14} aria-hidden="true" />
            <span>{helperText}</span>
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

SelectField.displayName = 'SelectField';

export default SelectField;
