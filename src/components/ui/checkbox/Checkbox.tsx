import { forwardRef, useId } from 'react';
import type { ChangeEvent } from 'react';
import styles from './Checkbox.module.scss';

export type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  onBlur?: () => void;
  name?: string;
  id?: string;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, checked, onChange, onBlur, name, id }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.checked);
    };

    return (
      <div className={styles.field}>
        <input
          ref={ref}
          id={inputId}
          name={name}
          className={styles.input}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          onBlur={onBlur}
        />
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      </div>
    );
  },
);

Checkbox.displayName = 'Checkbox';
