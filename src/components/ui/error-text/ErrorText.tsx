import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import styles from './ErrorText.module.scss';

export type ErrorTextProps = ComponentPropsWithoutRef<'p'>;

export const ErrorText = forwardRef<HTMLParagraphElement, ErrorTextProps>(
  ({ className, children, role = 'alert', ...rest }, ref) => {
    const classNames = [styles.error, className].filter(Boolean).join(' ');

    return (
      <p ref={ref} className={classNames} role={role} {...rest}>
        {children}
      </p>
    );
  },
);

ErrorText.displayName = 'ErrorText';
