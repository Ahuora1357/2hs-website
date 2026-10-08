import { useMemo, useState } from 'react';
import {
  FileSpreadsheet, Calculator, Banknote, Users, Receipt, Landmark,
  Package, Calendar, Printer, Download, TrendingUp, ArrowLeftRight, Wallet,
} from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import { PageHeader, Card, CardHead, CardBody } from '../../components/ui/Card.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import { Segmented } from '../../components/ui/Misc.jsx';
import JalaliDateInput from '../../components/ui/JalaliDateInput.jsx';
import { LineChart, BarChart, RankBars } from '../../components/charts/Charts.jsx';
import { StatusBadge, Badge } from '../../components/ui/Badge.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { invoiceTotals, resolveStatus } from '../../lib/calc.js';
import { monthlySeries, isLive } from '../../lib/metrics.js';
import { formatNumber } from '../../lib/format.js';
import { formatJalali, todayISO, shiftDays } from '../../lib/date.js';

const REPORTS = [
  { key: 'sales_period', icon: FileSpreadsheet, title: 'فروش بر اساس بازه زمانی', desc: 'درآمد ماهانه در بازه انتخابی' },
  { key: 'profit_loss', icon: Calculator, title: 'سود و زیان', desc: 'درآمد، هزینه و سود خالص دوره' },
  { key: 'cash_flow', icon: Banknote, title: 'جریان نقدی', desc: 'گردش ورودی و خروجی حساب‌ها' },
  { key: 'customer_balance', icon: Users, title: 'مانده حساب مشتریان', desc: 'بدهی و تسویه هر مشتری' },
  { key: 'unpaid', icon: Receipt, title: 'فاکتورهای پرداخت‌نشده', desc: 'مطالبات باز و سررسید گذشته' },
  { key: 'expenses', icon: Receipt, title: 'گزارش هزینه‌ها', desc: 'هزینه بر اساس دسته‌بندی' },
  { key: 'purchases', icon: Landmark, title: 'خریدها و پرداخت‌ها', desc: 'پرداخت به تأمین‌کنندگان' },
  { key: 'sales_product', icon: Package, title: 'فروش بر اساس کالا', desc: 'پرفروش‌ترین اقلام' },
  { key: 'sales_customer', icon: Users, title: 'فروش بر اساس مشتری', desc: 'رتبه‌بندی مشتریان' },
  { key: 'tax', icon: Calendar, title: 'گزارش مالیات', desc: 'مالیات بر ارزش افزوده دوره' },
  { key: 'inventory', icon: Package, title: 'موجودی کالا', desc: 'وضعیت و ارزش موجودی' },
  { key: 'receipts', icon: Wallet, title: 'دریافت‌ها و پرداخت‌ها', desc: 'خلاصه جریان دریافت و پرداخت' },
];

export default function Reports() {
  const toast = useToast();
  const { settings } = useSettings();
  const { invoices, expenses, payments, receipts, products, customers, customerById } = useData();

  const [active, setActive] = useState('sales_period');
  const [range, setRange] = useState('6m');
  const [from, setFrom] = useState(shiftDays(todayISO(), -180));
  const [to, setTo] = useState(todayISO());

  const applyRange = (value) => {
    setRange(value);
    const map = { '1m': -30, '3m': -90, '6m': -180, '12m': -365 };
    if (map[value]) setFrom(shiftDays(todayISO(), map[value]));
    setTo(todayISO());
  };

  const scoped = useMemo(() => {
    const inRange = (d) => d >= from && d <= to;
    return {
      invoices: invoices.filter((i) => isLive(i) && inRange(i.issueDate)),
      expenses: expenses.filter((e) => inRange(e.date)),
      payments: payments.filter((p) => inRange(p.date)),
      receipts: receipts.filter((r) => inRange(r.date)),
      allInvoices: invoices.filter((i) => inRange(i.issueDate)),
    };
  }, [invoices, expenses, payments, receipts, from, to]);

  const money = (v) => `${formatNumber(v)} ${settings.currency}`;

  const report = useMemo(() => {
    const inv = scoped.invoices;
    const rev = inv.reduce((s, i) => s + invoiceTotals(i).total, 0);
    const paid = inv.reduce((s, i) => s + invoiceTotals(i).paid, 0);
    const tax = inv.reduce((s, i) => s + invoiceTotals(i).tax, 0);
    const expTotal = scoped.expenses.reduce((s, e) => s + e.amount, 0);
    const recTotal = scoped.receipts.reduce((s, r) => s + r.amount, 0);
    const payTotal = scoped.payments.reduce((s, p) => s + p.amount, 0);

    switch (active) {
      case 'sales_period': {
        const series = monthlySeries(invoices, [], 6);
        return {
          summary: [
            { label: 'درآمد دوره', value: money(rev), tone: 'brand' },
            { label: 'تعداد فاکتور', value: formatNumber(inv.length), tone: 'indigo' },
            { label: 'میانگین هر فاکتور', value: money(inv.length ? Math.round(rev / inv.length) : 0), tone: 'gold' },
          ],
          chart: <LineChart height={260} ariaLabel="نمودار فروش دوره" data={series.map((s) => ({ label: s.label, value: s.revenue }))} />,
          columns: [
            { key: 'number', header: 'شماره', render: (r) => <span className="num strong">{r.number}</span> },
            { key: 'customer', header: 'مشتری', render: (r) => customerById[r.customerId]?.name || '—' },
            { key: 'date', header: 'تاریخ', render: (r) => <span className="num">{formatJalali(r.issueDate)}</span> },
            { key: 'total', header: 'مبلغ', align: 'end', render: (r) => <span className="num">{formatNumber(invoiceTotals(r).total)}</span> },
          ],
          rows: inv,
        };
      }
      case 'profit_loss':
        return {
          summary: [
            { label: 'درآمد', value: money(rev), tone: 'success' },
            { label: 'هزینه', value: money(expTotal), tone: 'danger' },
            { label: 'سود خالص', value: money(rev - expTotal), tone: 'brand' },
            { label: 'حاشیه سود', value: `${formatNumber(rev ? Math.round(((rev - expTotal) / rev) * 100) : 0)}٪`, tone: 'gold' },
          ],
          chart: (
            <BarChart
              height={260}
              ariaLabel="نمودار درآمد و هزینه دوره"
              data={[
                { label: 'درآمد', value: rev, color: '#12B886' },
                { label: 'هزینه', value: expTotal, color: '#E03131' },
                { label: 'سود', value: Math.max(rev - expTotal, 0), color: '#1C7ED6' },
              ]}
            />
          ),
          columns: [
            { key: 'item', header: 'شرح', render: (r) => r.item },
            { key: 'amount', header: 'مبلغ', align: 'end', render: (r) => <span className="num">{r.display}</span> },
          ],
          rows: [
            { id: 'rev', item: 'مجموع درآمد فاکتورها', display: money(rev) },
            { id: 'exp', item: 'مجموع هزینه‌ها', display: money(expTotal) },
            { id: 'profit', item: 'سود خالص دوره', display: money(rev - expTotal) },
          ],
        };
      case 'cash_flow':
        return {
          summary: [
            { label: 'ورودی نقدی', value: money(recTotal), tone: 'success' },
            { label: 'خروجی نقدی', value: money(payTotal + expTotal), tone: 'danger' },
            { label: 'جریان خالص', value: money(recTotal - payTotal - expTotal), tone: 'brand' },
          ],
          chart: (
            <BarChart
              height={260}
              ariaLabel="نمودار جریان نقدی"
              data={monthlySeries(invoices, expenses, 6).map((m) => ({ label: m.label, value: m.cost }))}
            />
          ),
          columns: [
            { key: 'date', header: 'تاریخ', render: (r) => <span className="num">{formatJalali(r.date)}</span> },
            { key: 'description', header: 'شرح', render: (r) => r.description },
            { key: 'kind', header: 'نوع', render: (r) => <Badge tone={r.kind === 'دریافت' ? 'success' : 'danger'}>{r.kind}</Badge> },
            { key: 'amount', header: 'مبلغ', align: 'end', render: (r) => <span className="num">{formatNumber(r.amount)}</span> },
          ],
          rows: [
            ...scoped.receipts.map((r) => ({ id: r.id, date: r.date, description: `دریافت از ${r.customerName}`, kind: 'دریافت', amount: r.amount })),
            ...scoped.payments.map((p) => ({ id: p.id, date: p.date, description: `پرداخت به ${p.supplier}`, kind: 'پرداخت', amount: p.amount })),
            ...scoped.expenses.map((e) => ({ id: e.id, date: e.date, description: e.title, kind: 'پرداخت', amount: e.amount })),
          ].sort((a, b) => (a.date < b.date ? 1 : -1)),
        };
      case 'customer_balance': {
        const rows = customers.map((c) => {
          const own = inv.filter((i) => i.customerId === c.id);
          const total = own.reduce((s, i) => s + invoiceTotals(i).total, 0);
          const p = own.reduce((s, i) => s + invoiceTotals(i).paid, 0);
          return { id: c.id, name: c.name, count: own.length, total, paid: p, balance: total - p };
        }).filter((r) => r.total > 0).sort((a, b) => b.balance - a.balance);
        const totalBalance = rows.reduce((s, r) => s + r.balance, 0);
        return {
          summary: [
            { label: 'مانده کل مطالبات', value: money(totalBalance), tone: 'danger' },
            { label: 'مشتریان بدهکار', value: formatNumber(rows.filter((r) => r.balance > 0).length), tone: 'warning' },
            { label: 'کل فروش دوره', value: money(rev), tone: 'brand' },
          ],
          chart: <RankBars tone="indigo" items={rows.slice(0, 6).map((r) => ({ label: r.name, value: r.balance }))} format={(v) => formatNumber(v)} />,
          columns: [
            { key: 'name', header: 'مشتری', render: (r) => <span className="strong">{r.name}</span> },
            { key: 'count', header: 'فاکتورها', align: 'center', render: (r) => <span className="num">{formatNumber(r.count)}</span> },
            { key: 'total', header: 'فروش', align: 'end', render: (r) => <span className="num">{formatNumber(r.total)}</span> },
            { key: 'paid', header: 'دریافت‌شده', align: 'end', render: (r) => <span className="num">{formatNumber(r.paid)}</span> },
            { key: 'balance', header: 'مانده', align: 'end', render: (r) => <span className="num strong" style={{ color: r.balance > 0 ? 'var(--danger)' : 'var(--success-strong)' }}>{formatNumber(r.balance)}</span> },
          ],
          rows,
        };
      }
      case 'unpaid': {
        const rows = scoped.allInvoices
          .filter((i) => i.status !== 'cancelled' && i.status !== 'draft')
          .map((i) => ({ invoice: i, ...invoiceTotals(i), status: resolveStatus(i) }))
          .filter((r) => r.remaining > 0)
          .sort((a, b) => (a.invoice.dueDate < b.invoice.dueDate ? -1 : 1));
        return {
          summary: [
            { label: 'مطالبات باز', value: money(rows.reduce((s, r) => s + r.remaining, 0)), tone: 'warning' },
            { label: 'تعداد فاکتور', value: formatNumber(rows.length), tone: 'indigo' },
            { label: 'سررسید گذشته', value: money(rows.filter((r) => r.status === 'overdue').reduce((s, r) => s + r.remaining, 0)), tone: 'danger' },
          ],
          columns: [
            { key: 'number', header: 'شماره', render: (r) => <span className="num strong">{r.invoice.number}</span> },
            { key: 'customer', header: 'مشتری', render: (r) => customerById[r.invoice.customerId]?.name || '—' },
            { key: 'due', header: 'سررسید', render: (r) => <span className="num">{formatJalali(r.invoice.dueDate)}</span> },
            { key: 'total', header: 'مبلغ کل', align: 'end', render: (r) => <span className="num">{formatNumber(r.total)}</span> },
            { key: 'remaining', header: 'مانده', align: 'end', render: (r) => <span className="num strong">{formatNumber(r.remaining)}</span> },
            { key: 'status', header: 'وضعیت', render: (r) => <StatusBadge status={r.status} /> },
          ],
          rows,
        };
      }
      case 'expenses': {
        const byCat = {};
        scoped.expenses.forEach((e) => { byCat[e.category] = (byCat[e.category] || 0) + e.amount; });
        const rows = Object.entries(byCat).map(([name, amount]) => ({ id: name, name, amount })).sort((a, b) => b.amount - a.amount);
        return {
          summary: [
            { label: 'مجموع هزینه', value: money(expTotal), tone: 'danger' },
            { label: 'تعداد اسناد', value: formatNumber(scoped.expenses.length), tone: 'indigo' },
            { label: 'بیشترین دسته', value: rows[0]?.name || '—', tone: 'gold' },
          ],
          chart: <RankBars tone="gold" items={rows.slice(0, 6).map((r) => ({ label: r.name, value: r.amount }))} format={(v) => formatNumber(v)} />,
          columns: [
            { key: 'name', header: 'دسته‌بندی', render: (r) => <span className="strong">{r.name}</span> },
            { key: 'amount', header: 'مبلغ', align: 'end', render: (r) => <span className="num">{formatNumber(r.amount)}</span> },
            { key: 'share', header: 'سهم', align: 'center', render: (r) => <span className="num">{formatNumber(expTotal ? Math.round((r.amount / expTotal) * 100) : 0)}٪</span> },
          ],
          rows,
        };
      }
      case 'purchases':
        return {
          summary: [
            { label: 'مجموع پرداخت‌ها', value: money(payTotal), tone: 'danger' },
            { label: 'تعداد پرداخت', value: formatNumber(scoped.payments.length), tone: 'indigo' },
            { label: 'تأمین‌کنندگان', value: formatNumber(new Set(scoped.payments.map((p) => p.supplier)).size), tone: 'brand' },
          ],
          columns: [
            { key: 'date', header: 'تاریخ', render: (r) => <span className="num">{formatJalali(r.date)}</span> },
            { key: 'supplier', header: 'تأمین‌کننده', render: (r) => <span className="strong">{r.supplier}</span> },
            { key: 'method', header: 'روش' },
            { key: 'amount', header: 'مبلغ', align: 'end', render: (r) => <span className="num">{formatNumber(r.amount)}</span> },
          ],
          rows: scoped.payments,
        };
      case 'sales_product': {
        const byProduct = {};
        inv.forEach((i) => (i.items || []).forEach((it) => {
          const key = it.productId || it.description;
          if (!byProduct[key]) byProduct[key] = { id: key, name: it.description || '—', qty: 0, amount: 0 };
          byProduct[key].qty += Number(it.qty) || 0;
          byProduct[key].amount += (Number(it.qty) || 0) * (Number(it.unitPrice) || 0);
        }));
        const rows = Object.values(byProduct).sort((a, b) => b.amount - a.amount);
        return {
          summary: [
            { label: 'کل فروش اقلام', value: money(rows.reduce((s, r) => s + r.amount, 0)), tone: 'brand' },
            { label: 'تعداد اقلام', value: formatNumber(rows.length), tone: 'indigo' },
            { label: 'پرفروش‌ترین', value: rows[0]?.name || '—', tone: 'gold' },
          ],
          chart: <RankBars items={rows.slice(0, 6).map((r) => ({ label: r.name, value: r.amount }))} format={(v) => formatNumber(v)} />,
          columns: [
            { key: 'name', header: 'کالا / خدمت', render: (r) => <span className="strong">{r.name}</span> },
            { key: 'qty', header: 'تعداد فروش', align: 'center', render: (r) => <span className="num">{formatNumber(r.qty)}</span> },
            { key: 'amount', header: 'مبلغ فروش', align: 'end', render: (r) => <span className="num">{formatNumber(r.amount)}</span> },
          ],
          rows,
        };
      }
      case 'sales_customer': {
        const byCustomer = {};
        inv.forEach((i) => {
          byCustomer[i.customerId] = (byCustomer[i.customerId] || 0) + invoiceTotals(i).total;
        });
        const rows = Object.entries(byCustomer)
          .map(([id, amount]) => ({ id, name: customerById[id]?.name || '—', amount }))
          .sort((a, b) => b.amount - a.amount);
        return {
          summary: [
            { label: 'کل فروش', value: money(rev), tone: 'brand' },
            { label: 'مشتریان فعال', value: formatNumber(rows.length), tone: 'indigo' },
            { label: 'میانگین فروش', value: money(rows.length ? Math.round(rev / rows.length) : 0), tone: 'gold' },
          ],
          chart: <RankBars tone="indigo" items={rows.slice(0, 6).map((r) => ({ label: r.name, value: r.amount }))} format={(v) => formatNumber(v)} />,
          columns: [
            { key: 'name', header: 'مشتری', render: (r) => <span className="strong">{r.name}</span> },
            { key: 'amount', header: 'مبلغ فروش', align: 'end', render: (r) => <span className="num">{formatNumber(r.amount)}</span> },
            { key: 'share', header: 'سهم', align: 'center', render: (r) => <span className="num">{formatNumber(rev ? Math.round((r.amount / rev) * 100) : 0)}٪</span> },
          ],
          rows,
        };
      }
      case 'tax':
        return {
          summary: [
            { label: 'مالیات فروش دوره', value: money(tax), tone: 'gold' },
            { label: 'مبلغ مشمول', value: money(inv.reduce((s, i) => s + invoiceTotals(i).subtotal - invoiceTotals(i).discount, 0)), tone: 'brand' },
            { label: 'تعداد فاکتور', value: formatNumber(inv.length), tone: 'indigo' },
          ],
          columns: [
            { key: 'number', header: 'شماره فاکتور', render: (r) => <span className="num strong">{r.number}</span> },
            { key: 'customer', header: 'مشتری', render: (r) => customerById[r.customerId]?.name || '—' },
            { key: 'date', header: 'تاریخ', render: (r) => <span className="num">{formatJalali(r.issueDate)}</span> },
            { key: 'tax', header: 'مالیات', align: 'end', render: (r) => <span className="num">{formatNumber(invoiceTotals(r).tax)}</span> },
          ],
          rows: inv,
        };
      case 'inventory': {
        const rows = products.filter((p) => p.stock !== null).map((p) => ({
          id: p.id, name: p.name, unit: p.unit, stock: p.stock, min: p.minStock,
          value: p.stock * (p.purchasePrice || 0), low: p.minStock !== null && p.stock <= p.minStock,
        })).sort((a, b) => b.value - a.value);
        return {
          summary: [
            { label: 'ارزش موجودی', value: money(rows.reduce((s, r) => s + r.value, 0)), tone: 'brand' },
            { label: 'تعداد اقلام', value: formatNumber(rows.length), tone: 'indigo' },
            { label: 'زیر حد هشدار', value: formatNumber(rows.filter((r) => r.low).length), tone: 'danger' },
          ],
          columns: [
            { key: 'name', header: 'کالا', render: (r) => <span className="strong">{r.name}</span> },
            { key: 'unit', header: 'واحد' },
            { key: 'stock', header: 'موجودی', align: 'center', render: (r) => <span className={`num ${r.low ? 'stock-pill--low' : ''}`}>{formatNumber(r.stock)}</span> },
            { key: 'value', header: 'ارزش (خرید)', align: 'end', render: (r) => <span className="num">{formatNumber(r.value)}</span> },
          ],
          rows,
        };
      }
      case 'receipts':
      default:
        return {
          summary: [
            { label: 'مجموع دریافت‌ها', value: money(recTotal), tone: 'success' },
            { label: 'مجموع پرداخت‌ها', value: money(payTotal), tone: 'danger' },
            { label: 'خالص', value: money(recTotal - payTotal), tone: 'brand' },
          ],
          chart: (
            <BarChart
              height={260}
              ariaLabel="نمودار دریافت و پرداخت"
              data={[
                { label: 'دریافت‌ها', value: recTotal, color: '#12B886' },
                { label: 'پرداخت‌ها', value: payTotal, color: '#E03131' },
              ]}
            />
          ),
          columns: [
            { key: 'date', header: 'تاریخ', render: (r) => <span className="num">{formatJalali(r.date)}</span> },
            { key: 'label', header: 'شرح' },
            { key: 'kind', header: 'نوع', render: (r) => <Badge tone={r.kind === 'دریافت' ? 'success' : 'danger'}>{r.kind}</Badge> },
            { key: 'amount', header: 'مبلغ', align: 'end', render: (r) => <span className="num">{formatNumber(r.amount)}</span> },
          ],
          rows: [
            ...scoped.receipts.map((r) => ({ id: r.id, date: r.date, label: `دریافت از ${r.customerName}`, kind: 'دریافت', amount: r.amount })),
            ...scoped.payments.map((p) => ({ id: p.id, date: p.date, label: `پرداخت به ${p.supplier}`, kind: 'پرداخت', amount: p.amount })),
          ].sort((a, b) => (a.date < b.date ? 1 : -1)),
        };
    }
  }, [active, scoped, invoices, expenses, customers, customerById, settings.currency, from, to]);

  const activeMeta = REPORTS.find((r) => r.key === active);

  return (
    <>
      <PageHeader
        title="گزارش‌های مالی"
        subtitle="گزارش‌ها با بازه تاریخ شمسی، نمودار خوانا و خروجی چاپ و Excel"
        breadcrumbs={[{ label: 'داشبورد', to: '/app' }, { label: 'گزارش‌های مالی' }]}
        actions={
          <>
            <Button variant="outline" icon={Printer} onClick={() => window.print()} className="no-print">چاپ گزارش</Button>
            <Button variant="outline" icon={Download} onClick={() => toast.success('خروجی Excel گزارش آماده دانلود است.', { title: 'خروجی Excel' })}>
              خروجی Excel
            </Button>
          </>
        }
      />

      <div className="report-tiles no-print" style={{ marginBottom: 'var(--s-5)' }}>
        {REPORTS.map((r) => (
          <button
            key={r.key}
            type="button"
            className={`report-tile ${active === r.key ? 'is-active' : ''}`}
            onClick={() => setActive(r.key)}
            aria-pressed={active === r.key}
          >
            <span className="report-tile__icon" aria-hidden="true"><r.icon size={20} /></span>
            <span>
              <span className="report-tile__title">{r.title}</span>
              <span className="report-tile__desc">{r.desc}</span>
            </span>
          </button>
        ))}
      </div>

      <Card className="no-print" style={{ marginBottom: 'var(--s-5)' }}>
        <CardBody>
          <div className="row between wrap gap-4">
            <Segmented
              ariaLabel="بازه زمانی"
              value={range}
              onChange={applyRange}
              options={[
                { value: '1m', label: 'ماه گذشته' },
                { value: '3m', label: '۳ ماه' },
                { value: '6m', label: '۶ ماه' },
                { value: '12m', label: 'سال' },
              ]}
            />
            <div className="row gap-3 wrap">
              <div style={{ minWidth: 320 }}>
                <JalaliDateInput label="از تاریخ" value={from} onChange={setFrom} />
              </div>
              <div style={{ minWidth: 320 }}>
                <JalaliDateInput label="تا تاریخ" value={to} onChange={setTo} />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid--stats" style={{ marginBottom: 'var(--s-5)' }}>
        {report.summary.map((s) => (
          <div key={s.label} className={`stat stat--${s.tone}`}>
            <div className="stat__head"><span className="stat__label">{s.label}</span></div>
            <div className="stat__value num">{s.value}</div>
          </div>
        ))}
      </div>

      {report.chart ? (
        <Card style={{ marginBottom: 'var(--s-5)' }}>
          <CardHead title={activeMeta?.title} subtitle={`${formatJalali(from)} تا ${formatJalali(to)}`} icon={TrendingUp} />
          <CardBody>{report.chart}</CardBody>
        </Card>
      ) : null}

      <Card>
        <CardHead
          title={`جزئیات گزارش — ${activeMeta?.title}`}
          subtitle={`${formatNumber(report.rows.length)} ردیف`}
          icon={ArrowLeftRight}
        />
        <CardBody flush>
          <DataTable
            columns={report.columns}
            rows={report.rows.slice(0, 200)}
            emptyTitle="داده‌ای در این بازه وجود ندارد"
            emptyMessage="بازه تاریخ یا فیلترها را تغییر دهید."
            caption={activeMeta?.title}
          />
        </CardBody>
      </Card>
    </>
  );
}
