import { useMoney } from '../../hooks/useMoney.js';

/** Inline currency value with tabular Latin digits inside RTL text. */
export default function Money({ value, short = false, className = '' }) {
  const { money, short: shortMoney } = useMoney();
  return <span className={`num ${className}`}>{short ? shortMoney(value) : money(value)}</span>;
}
