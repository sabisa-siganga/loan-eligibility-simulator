import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import styles from './Label.module.scss';

export type LabelProps = ComponentPropsWithoutRef<'label'> & {
  required?: boolean;
};

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ required = false, className, children, ...rest }, ref) => {
    const classNames = [styles.label, className].filter(Boolean).join(' ');

    return (
      <label ref={ref} className={classNames} {...rest}>
        {children}
        {required ? (
          <span className={styles.required} aria-hidden="true">
            {' '}
            *
          </span>
        ) : null}
      </label>
    );
  },
);

Label.displayName = 'Label';
