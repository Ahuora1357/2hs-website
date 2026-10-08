/* Invoice + accounting math — single source of truth for totals */

export const STATUS_META = {
  draft: { label: 'پیش‌نویس', tone: 'neutral' },
  sent: { label: 'ارسال‌شده', tone: 'info' },
  paid: { label: 'پرداخت‌شده', tone: 'success' },
  unpaid: { label: 'پرداخت‌نشده', tone: 'warning' },
  overdue: { label: 'سررسید گذشته', tone: 'danger' },
  cancelled: { label: 'لغوشده', tone: 'muted' },
};

export const PAYMENT_METHODS = [
  'نقدی',
  'کارت‌خوان',
  'انتقال بانکی',
  'چک',
  'درگاه اینترنتی',
  'سایر',
];

export function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Totals for one invoice line. discounts are absolute amounts. */
export function lineTotals(item) {
  const qty = num(item?.qty);
  const unitPrice = num(item?.unitPrice);
  const gross = qty * unitPrice;
  const discount = Math.min(num(item?.discount), gross);
  const taxable = gross - discount;
  const tax = Math.round((taxable * num(item?.taxRate)) / 100);
  return { gross, discount, taxable, tax, total: taxable + tax };
}

/** Rolled-up totals for a whole invoice. */
export function invoiceTotals(invoice) {
  const items = invoice?.items || [];
  let subtotal = 0;
  let discount = 0;
  let tax = 0;
  for (const item of items) {
    const t = lineTotals(item);
    subtotal += t.gross;
    discount += t.discount;
    tax += t.tax;
  }
  const shipping = num(invoice?.shipping);
  const total = subtotal - discount + tax + shipping;
  const paid = (invoice?.payments || []).reduce((sum, p) => sum + num(p.amount), 0);
  return { subtotal, discount, tax, shipping, total, paid, remaining: total - paid };
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Derived display status from stored status + payments + due date. */
export function resolveStatus(invoice) {
  if (!invoice) return 'draft';
  const { total, remaining } = invoiceTotals(invoice);
  if (invoice.status === 'cancelled') return 'cancelled';
  if (invoice.status === 'draft') return 'draft';
  if (total > 0 && remaining <= 0) return 'paid';
  if (invoice.dueDate && new Date(invoice.dueDate) < startOfToday()) return 'overdue';
  return 'unpaid';
}

export function statusMeta(status) {
  return STATUS_META[status] || STATUS_META.draft;
}
