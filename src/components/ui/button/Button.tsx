import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import styles from './Button.module.scss';

export type ButtonVariant = 'primary' | 'secondary' | 'soft' | 'link';

export type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  variant?: ButtonVariant;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', type = 'button', className, ...rest }, ref) => {
    const classNames = [styles[variant], className].filter(Boolean).join(' ');

    return <button ref={ref} type={type} className={classNames} {...rest} />;
  },
);

Button.displayName = 'Button';
