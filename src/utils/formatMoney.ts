import { PRODUCT_SETTINGS } from './productSettings';
import { roundMoney } from './roundMoney';

const DIGITS_ONLY = /^\d+$/;

export const formatMoneyDisplay = (value: number): string => {
  const rounded = roundMoney(value);
  const [whole, fraction = '00'] = rounded.toFixed(2).split('.');
  const withSeparators = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${PRODUCT_SETTINGS.currencySymbol}${withSeparators}.${fraction}`;
};

export const formatMoneyInputBlur = (value: number): string => roundMoney(value).toFixed(2);

export const formatMoneyInputFocus = (value: number): string => String(Math.trunc(value));

export const parseWholeRandDigits = (raw: string): number | null => {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return null;
  }

  if (!DIGITS_ONLY.test(trimmed)) {
    return null;
  }

  const parsed = Number(trimmed);
  if (!Number.isSafeInteger(parsed)) {
    return null;
  }

  return parsed;
};

export const isWholeRandDigitString = (raw: string): boolean => raw === '' || DIGITS_ONLY.test(raw);

export const sanitizeMoneyPaste = (
  pasted: string,
): { ok: true; digits: string } | { ok: false; reason: string } => {
  const digitsOnly = pasted.replace(/\D/g, '');
  if (digitsOnly === '' || digitsOnly !== pasted.replace(/[\s,]/g, '').replace(/\.00$/, '')) {
    const cleaned = pasted.replace(/[R\s,]/gi, '');
    if (DIGITS_ONLY.test(cleaned)) {
      return { ok: true, digits: cleaned };
    }
    if (/^\d+\.00$/.test(cleaned)) {
      return { ok: true, digits: cleaned.slice(0, -3) };
    }
    return {
      ok: false,
      reason: 'Enter whole rands using digits only.',
    };
  }

  return { ok: true, digits: digitsOnly };
};

export const formatTermLabel = (months: number): string =>
  months === 1 ? '1 month' : `${months} months`;
