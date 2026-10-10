import { describe, expect, it } from 'vitest';
import {
  formatMoneyDisplay,
  formatMoneyInputBlur,
  formatMoneyInputFocus,
  formatTermLabel,
  isWholeRandDigitString,
  parseWholeRandDigits,
  sanitizeMoneyPaste,
} from './formatMoney';

describe('formatMoney', () => {
  it('formats display amounts with a rand symbol and two decimal places', () => {
    expect(formatMoneyDisplay(2365.37)).toBe('R2,365.37');
    expect(formatMoneyDisplay(5000)).toBe('R5,000.00');
  });

  it('formats money for blur and focus editing', () => {
    expect(formatMoneyInputBlur(25000)).toBe('25000.00');
    expect(formatMoneyInputFocus(25000.0)).toBe('25000');
  });

  it('parses whole-rand digit strings and rejects non-digits', () => {
    expect(parseWholeRandDigits('5000')).toBe(5000);
    expect(parseWholeRandDigits('')).toBeNull();
    expect(parseWholeRandDigits('50.00')).toBeNull();
    expect(parseWholeRandDigits('R5000')).toBeNull();
    expect(parseWholeRandDigits(String(Number.MAX_SAFE_INTEGER + 1))).toBeNull();
    expect(isWholeRandDigitString('123')).toBe(true);
    expect(isWholeRandDigitString('12a')).toBe(false);
  });

  it('explains invalid pasted money instead of inventing an amount', () => {
    expect(sanitizeMoneyPaste('abc')).toEqual({
      ok: false,
      reason: 'Enter whole rands using digits only.',
    });
    expect(sanitizeMoneyPaste('25000')).toEqual({ ok: true, digits: '25000' });
    expect(sanitizeMoneyPaste('25000.00')).toEqual({ ok: true, digits: '25000' });
    expect(sanitizeMoneyPaste('R 25,000')).toEqual({ ok: true, digits: '25000' });
    expect(sanitizeMoneyPaste('R 25,000.00')).toEqual({ ok: true, digits: '25000' });
  });

  it('labels a one-month term in the singular', () => {
    expect(formatTermLabel(1)).toBe('1 month');
    expect(formatTermLabel(6)).toBe('6 months');
  });
});
