import { useCallback } from 'react';
import { useSettings } from '../context/SettingsContext.jsx';
import { formatMoney, formatMoneyShort, formatNumber, formatPercent } from '../lib/format.js';

/** Currency-aware formatting bound to the business settings. */
export function useMoney() {
  const { currency } = useSettings();

  const money = useCallback((value) => formatMoney(value, currency), [currency]);
  const short = useCallback((value) => formatMoneyShort(value), []);
  const number = useCallback((value, options) => formatNumber(value, options), []);
  const percent = useCallback((value, decimals) => formatPercent(value, decimals), []);

  return { money, short, number, percent, currency };
}
