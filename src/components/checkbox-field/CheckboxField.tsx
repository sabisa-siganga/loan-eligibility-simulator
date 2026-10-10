import { forwardRef, useId } from 'react';
import type { ChangeEvent } from 'react';
import styles from './CheckboxField.module.scss';

type CheckboxFieldProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  onBlur?: () => void;
  name?: string;
  id?: string;
};

const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(
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

CheckboxField.displayName = 'CheckboxField';

export default CheckboxField;
