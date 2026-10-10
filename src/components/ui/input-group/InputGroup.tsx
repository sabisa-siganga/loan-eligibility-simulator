import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef, HTMLAttributes } from 'react';
import styles from './InputGroup.module.scss';

export type InputGroupProps = HTMLAttributes<HTMLDivElement>;

export const InputGroup = forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className, ...rest }, ref) => {
    const classNames = [styles.group, className].filter(Boolean).join(' ');

    return <div ref={ref} className={classNames} data-slot="input-group" {...rest} />;
  },
);

InputGroup.displayName = 'InputGroup';

export type InputGroupInputProps = ComponentPropsWithoutRef<'input'>;

export const InputGroupInput = forwardRef<HTMLInputElement, InputGroupInputProps>(
  ({ className, type = 'text', ...rest }, ref) => {
    const classNames = [styles.control, className].filter(Boolean).join(' ');

    return (
      <input
        ref={ref}
        type={type}
        className={classNames}
        data-slot="input-group-control"
        {...rest}
      />
    );
  },
);

InputGroupInput.displayName = 'InputGroupInput';

export type InputGroupAddonAlign = 'inline-start' | 'inline-end';

export type InputGroupAddonProps = HTMLAttributes<HTMLDivElement> & {
  align?: InputGroupAddonAlign;
};

export const InputGroupAddon = forwardRef<HTMLDivElement, InputGroupAddonProps>(
  ({ align = 'inline-start', className, ...rest }, ref) => {
    const alignClass = align === 'inline-end' ? styles.addonInlineEnd : styles.addonInlineStart;
    const classNames = [styles.addon, alignClass, className].filter(Boolean).join(' ');

    return <div ref={ref} className={classNames} data-slot="input-group-addon" {...rest} />;
  },
);

InputGroupAddon.displayName = 'InputGroupAddon';

export type InputGroupTextProps = HTMLAttributes<HTMLSpanElement>;

export const InputGroupText = forwardRef<HTMLSpanElement, InputGroupTextProps>(
  ({ className, ...rest }, ref) => {
    const classNames = [styles.text, className].filter(Boolean).join(' ');

    return <span ref={ref} className={classNames} data-slot="input-group-text" {...rest} />;
  },
);

InputGroupText.displayName = 'InputGroupText';
