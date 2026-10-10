/** Half-up rounding to two decimal places for display and money boundaries. */
export const roundMoney = (value: number): number => {
  if (!Number.isFinite(value)) {
    return value;
  }

  const sign = value < 0 ? -1 : 1;
  const absolute = Math.abs(value);
  return (sign * Math.round(absolute * 100 + Number.EPSILON)) / 100;
};
