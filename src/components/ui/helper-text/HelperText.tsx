import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import styles from './HelperText.module.scss';

export type HelperTextProps = ComponentPropsWithoutRef<'p'>;

export const HelperText = forwardRef<HTMLParagraphElement, HelperTextProps>(
  ({ className, children, ...rest }, ref) => {
    const classNames = [styles.helper, className].filter(Boolean).join(' ');

    return (
      <p ref={ref} className={classNames} {...rest}>
        {children}
      </p>
    );
  },
);

HelperText.displayName = 'HelperText';
