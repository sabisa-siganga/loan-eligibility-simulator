import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import styles from './Input.module.scss';

export type InputProps = ComponentPropsWithoutRef<'input'>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...rest }, ref) => {
    const classNames = [styles.input, className].filter(Boolean).join(' ');

    return <input ref={ref} type={type} className={classNames} {...rest} />;
  },
);

Input.displayName = 'Input';
