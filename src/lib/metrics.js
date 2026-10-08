/* Derived financial metrics — shared by dashboard and reports */

import { invoiceTotals, resolveStatus } from './calc.js';
import { monthKey, lastMonths } from './date.js';

export function isLive(invoice) {
  return invoice.status !== 'cancelled' && invoice.status !== 'draft';
}

export function monthlySeries(invoices, expenses, monthCount = 6) {
  const months = lastMonths(monthCount);
  const revenue = Object.fromEntries(months.map((m) => [m.key, 0]));
  const cost = Object.fromEntries(months.map((m) => [m.key, 0]));

  invoices.filter(isLive).forEach((inv) => {
    const key = monthKey(inv.issueDate);
    if (key in revenue) revenue[key] += invoiceTotals(inv).total;
  });
  expenses.forEach((exp) => {
    const key = monthKey(exp.date);
    if (key in cost) cost[key] += Number(exp.amount) || 0;
  });

  return months.map((m) => ({
    key: m.key,
    label: m.label,
    revenue: revenue[m.key],
    cost: cost[m.key],
    profit: revenue[m.key] - cost[m.key],
  }));
}

export function computeMetrics({ invoices = [], expenses = [], accounts = [], customers = [] } = {}) {
  const live = invoices.filter(isLive);

  const totalInvoiced = live.reduce((s, i) => s + invoiceTotals(i).total, 0);
  const totalReceived = live.reduce((s, i) => s + invoiceTotals(i).paid, 0);

  const withStatus = live.map((i) => ({ invoice: i, status: resolveStatus(i), ...invoiceTotals(i) }));
  const overdue = withStatus.filter((r) => r.status === 'overdue');
  const openItems = withStatus.filter((r) => r.remaining > 0 && r.status !== 'overdue');

  const receivables = withStatus.reduce((s, r) => (r.remaining > 0 ? s + r.remaining : s), 0);
  const overdueAmount = overdue.reduce((s, r) => s + r.remaining, 0);

  const expensesTotal = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const payables = expenses.filter((e) => e.status === 'pending').reduce((s, e) => s + (Number(e.amount) || 0), 0);

  const cash = accounts.reduce((s, a) => s + (Number(a.balance) || 0), 0);

  const thisMonth = monthKey(new Date().toISOString().slice(0, 10));
  const monthRevenue = live
    .filter((i) => monthKey(i.issueDate) === thisMonth)
    .reduce((s, i) => s + invoiceTotals(i).total, 0);

  const series = monthlySeries(invoices, expenses, 6);

  // top customers by invoiced volume
  const byCustomer = {};
  live.forEach((i) => {
    byCustomer[i.customerId] = (byCustomer[i.customerId] || 0) + invoiceTotals(i).total;
  });
  const topCustomers = Object.entries(byCustomer)
    .map(([id, value]) => ({ id, value, label: customers.find((c) => c.id === id)?.name || '—' }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return {
    totalInvoiced,
    totalReceived,
    receivables,
    overdue,
    overdueAmount,
    openItems,
    expensesTotal,
    payables,
    cash,
    monthRevenue,
    netProfit: totalInvoiced - expensesTotal,
    series,
    topCustomers,
    statusBreakdown: {
      paid: withStatus.filter((r) => r.status === 'paid').length,
      unpaid: withStatus.filter((r) => r.status === 'unpaid').length,
      overdue: overdue.length,
      draft: invoices.filter((i) => i.status === 'draft').length,
    },
  };
}

/** Per-customer rollup used on the customer detail page. */
export function customerSummary(customerId, invoices) {
  const own = invoices.filter((i) => i.customerId === customerId && i.status !== 'cancelled');
  let invoiced = 0;
  let paid = 0;
  const rows = own.map((i) => {
    const t = invoiceTotals(i);
    invoiced += t.total;
    paid += t.paid;
    return { invoice: i, ...t, status: resolveStatus(i) };
  });
  return {
    rows: rows.sort((a, b) => (a.invoice.issueDate < b.invoice.issueDate ? 1 : -1)),
    invoiced,
    paid,
    balance: invoiced - paid,
    count: own.length,
  };
}
