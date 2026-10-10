import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef, CSSProperties } from 'react';
import styles from './Slider.module.scss';

export type SliderProps = Omit<ComponentPropsWithoutRef<'input'>, 'type'> & {
  min: number;
  max: number;
  value: number;
};

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, min, max, value, style, ...rest }, ref) => {
    const progress =
      max === min ? 0 : Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
    const classNames = [styles.slider, className].filter(Boolean).join(' ');
    const mergedStyle = {
      ...style,
      '--slider-progress': `${progress}%`,
    } as CSSProperties;

    return (
      <input
        ref={ref}
        type="range"
        className={classNames}
        min={min}
        max={max}
        value={value}
        style={mergedStyle}
        {...rest}
      />
    );
  },
);

Slider.displayName = 'Slider';
