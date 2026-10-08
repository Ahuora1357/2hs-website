import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Download, Printer, Trash2, Eye, Copy, Send, Ban, X,
} from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import DataTable, { Pagination } from '../../components/ui/DataTable.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import { ConfirmDialog } from '../../components/ui/Modal.jsx';
import { Segmented } from '../../components/ui/Misc.jsx';
import { PageHeader } from '../../components/ui/Card.jsx';
import { Select } from '../../components/ui/Form.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useMoney } from '../../hooks/useMoney.js';
import { invoiceTotals, resolveStatus, STATUS_META } from '../../lib/calc.js';
import { formatJalali, todayISO, shiftDays } from '../../lib/date.js';
import { formatNumber } from '../../lib/format.js';
import { paginate, sortBy } from '../../lib/id.js';

const STATUS_FILTERS = [
  { value: 'all', label: 'همه' },
  { value: 'draft', label: 'پیش‌نویس' },
  { value: 'sent', label: 'ارسال‌شده' },
  { value: 'paid', label: 'پرداخت‌شده' },
  { value: 'unpaid', label: 'پرداخت‌نشده' },
  { value: 'overdue', label: 'سررسید گذشته' },
  { value: 'cancelled', label: 'لغوشده' },
];

const PER_PAGE = 8;

export default function Invoices() {
  const navigate = useNavigate();
  const toast = useToast();
  const { currency } = useMoney();
  const {
    invoices, customers, customerById,
    deleteInvoice, setInvoiceStatus, duplicateInvoice,
  } = useData();

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [customerId, setCustomerId] = useState('');
  const [from, setFrom] = useState(shiftDays(todayISO(), -180));
  const [to, setTo] = useState(todayISO());
  const [sort, setSort] = useState({ key: 'issueDate', dir: 'desc' });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [confirm, setConfirm] = useState(null);

  const enriched = useMemo(
    () => invoices.map((inv) => ({
      ...inv,
      _status: resolveStatus(inv),
      _totals: invoiceTotals(inv),
      _customer: customerById[inv.customerId]?.name || '—',
    })),
    [invoices, customerById]
  );

  const filtered = useMemo(() => {
    const q = query.trim();
    const rows = enriched.filter((inv) => {
      if (q && !inv.number.includes(q) && !inv._customer.includes(q)) return false;
      if (status !== 'all' && inv._status !== status) return false;
      if (customerId && inv.customerId !== customerId) return false;
      if (from && inv.issueDate < from) return false;
      if (to && inv.issueDate > to) return false;
      return true;
    });
    const sorted = sortBy(rows, (r) => {
      if (sort.key === 'amount') return r._totals.total;
      if (sort.key === 'customer') return r._customer;
      return r[sort.key];
    }, sort.dir);
    return sorted;
  }, [enriched, query, status, customerId, from, to, sort]);

  const paged = useMemo(() => paginate(filtered, page, PER_PAGE), [filtered, page]);

  const toggleSort = (key, dir) => setSort({ key, dir });

  const resetFilters = () => {
    setQuery(''); setStatus('all'); setCustomerId('');
    setFrom(shiftDays(todayISO(), -180)); setTo(todayISO()); setPage(1);
  };

  const exportCsv = () => {
    const header = ['شماره فاکتور', 'مشتری', 'تاریخ صدور', 'سررسید', `مبلغ (${currency})`, 'وضعیت'];
    const lines = filtered.map((r) => [
      r.number, r._customer, r.issueDate, r.dueDate, r._totals.total,
      STATUS_META[r._status]?.label || r._status,
    ]);
    const csv = [header, ...lines].map((row) => row.join(',')).join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invoices-2hs.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('خروجی فاکتورها آماده شد.', { title: 'خروجی CSV' });
  };

  const bulk = (action) => {
    selected.forEach((id) => {
      if (action === 'delete') deleteInvoice(id);
      if (action === 'sent') setInvoiceStatus(id, 'sent');
      if (action === 'cancelled') setInvoiceStatus(id, 'cancelled');
    });
    toast.success('عملیات گروهی روی فاکتورهای انتخابی انجام شد.');
    setSelected([]);
  };

  const allSelected = paged.rows.length > 0 && paged.rows.every((r) => selected.includes(r.id));

  const columns = [
    {
      key: 'select',
      header: (
        <input
          type="checkbox"
          aria-label="انتخاب همه"
          checked={allSelected}
          onChange={(e) => {
            const ids = paged.rows.map((r) => r.id);
            setSelected(e.target.checked ? [...new Set([...selected, ...ids])] : selected.filter((id) => !ids.includes(id)));
          }}
        />
      ),
      width: 44,
      align: 'center',
      render: (row) => (
        <input
          type="checkbox"
          aria-label={`انتخاب فاکتور ${row.number}`}
          checked={selected.includes(row.id)}
          onChange={(e) => setSelected(
            e.target.checked ? [...selected, row.id] : selected.filter((id) => id !== row.id)
          )}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      key: 'number',
      header: 'شماره فاکتور',
      sortable: true,
      render: (row) => <span className="strong num">{row.number}</span>,
    },
    {
      key: 'customer',
      header: 'مشتری',
      sortable: true,
      render: (row) => row._customer,
    },
    { key: 'issueDate', header: 'تاریخ', sortable: true, render: (row) => <span className="num">{formatJalali(row.issueDate)}</span> },
    { key: 'dueDate', header: 'سررسید', sortable: true, render: (row) => <span className="num">{formatJalali(row.dueDate)}</span> },
    {
      key: 'amount',
      header: `مبلغ (${currency})`,
      align: 'end',
      sortable: true,
      render: (row) => <span className="num strong">{formatNumber(row._totals.total)}</span>,
    },
    { key: 'status', header: 'وضعیت', render: (row) => <StatusBadge status={row._status} /> },
    {
      key: 'actions',
      header: 'عملیات',
      align: 'center',
      width: 190,
      render: (row) => (
        <div className="row gap-1" style={{ justifyContent: 'center' }} onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" icon={Eye} onClick={() => navigate(`/app/invoices/${row.id}`)} aria-label="مشاهده فاکتور" />
          <Button variant="ghost" size="sm" icon={Copy} onClick={() => { duplicateInvoice(row.id); toast.success(`فاکتور ${row.number} تکثیر شد.`); }} aria-label="تکثیر فاکتور" />
          <Button variant="ghost" size="sm" icon={Send} onClick={() => { setInvoiceStatus(row.id, 'sent'); toast.success('وضعیت فاکتور به ارسال‌شده تغییر کرد.'); }} aria-label="علامت‌گذاری ارسال‌شده" />
          <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setConfirm(row)} aria-label="حذف فاکتور" />
        </div>
      ),
    },
  ];

  const summary = useMemo(() => {
    const sum = filtered.reduce((s, r) => s + r._totals.total, 0);
    const remaining = filtered.reduce((s, r) => (r._totals.remaining > 0 ? s + r._totals.remaining : s), 0);
    return { count: filtered.length, sum, remaining };
  }, [filtered]);

  return (
    <>
      <PageHeader
        title="فاکتورها"
        subtitle={`${formatNumber(summary.count)} فاکتور — مجموع ${formatNumber(summary.sum)} ${currency} — مانده ${formatNumber(summary.remaining)} ${currency}`}
        breadcrumbs={[{ label: 'داشبورد', to: '/app' }, { label: 'فاکتورها' }]}
        actions={
          <>
            <Button variant="outline" icon={Printer} onClick={() => window.print()} className="no-print">چاپ فهرست</Button>
            <Button variant="outline" icon={Download} onClick={exportCsv}>خروجی CSV</Button>
            <Button variant="accent" icon={Plus} onClick={() => navigate('/app/invoices/new')}>ایجاد فاکتور</Button>
          </>
        }
      />

      <div className="toolbar no-print">
        <div className="toolbar__search">
          <Search size={17} className="toolbar__search-icon" aria-hidden="true" />
          <label className="sr-only" htmlFor="inv-search">جست‌وجوی فاکتور</label>
          <input
            id="inv-search"
            className="input"
            placeholder="شماره فاکتور یا نام مشتری…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          />
        </div>

        <div style={{ minWidth: 180 }}>
          <Select
            aria-label="فیلتر مشتری"
            value={customerId}
            placeholder="همه مشتریان"
            onChange={(e) => { setCustomerId(e.target.value); setPage(1); }}
            options={customers.map((c) => ({ value: c.id, label: c.name }))}
          />
        </div>

        <div className="row gap-2">
          <div style={{ minWidth: 150 }}>
            <Select
              aria-label="از تاریخ"
              value={from}
              onChange={(e) => { setFrom(e.target.value); setPage(1); }}
              options={[{ value: shiftDays(todayISO(), -540), label: 'از ابتدای سال' }, { value: shiftDays(todayISO(), -180), label: '۶ ماه گذشته' }, { value: shiftDays(todayISO(), -30), label: 'ماه گذشته' }]}
            />
          </div>
          <Button variant="ghost" size="sm" onClick={resetFilters}>حذف فیلترها</Button>
        </div>
      </div>

      <div className="no-print" style={{ marginBottom: 'var(--s-4)', overflowX: 'auto' }}>
        <Segmented
          ariaLabel="فیلتر وضعیت"
          value={status}
          onChange={(v) => { setStatus(v); setPage(1); }}
          options={STATUS_FILTERS}
        />
      </div>

      {selected.length > 0 ? (
        <div className="card no-print" style={{ marginBottom: 'var(--s-4)' }}>
          <div className="card__body row between wrap gap-3">
            <span className="strong">
              <span className="num">{formatNumber(selected.length)}</span> فاکتور انتخاب شده
            </span>
            <div className="row gap-2 wrap">
              <Button variant="outline" size="sm" icon={Send} onClick={() => bulk('sent')}>ارسال‌شده</Button>
              <Button variant="outline" size="sm" icon={Ban} onClick={() => bulk('cancelled')}>لغو</Button>
              <Button variant="danger" size="sm" icon={Trash2} onClick={() => bulk('delete')}>حذف</Button>
              <Button variant="ghost" size="sm" icon={X} onClick={() => setSelected([])}>لغو انتخاب</Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="card">
        <DataTable
          columns={columns}
          rows={paged.rows}
          sort={sort}
          onSort={toggleSort}
          onRowClick={(row) => navigate(`/app/invoices/${row.id}`)}
          emptyTitle="فاکتوری یافت نشد"
          emptyMessage="فیلترها را تغییر دهید یا یک فاکتور جدید ایجاد کنید."
          emptyAction={<Button variant="accent" icon={Plus} onClick={() => navigate('/app/invoices/new')}>ایجاد فاکتور</Button>}
          caption="فهرست فاکتورها"
        />
        <Pagination
          page={paged.page}
          pages={paged.pages}
          from={paged.from}
          to={paged.to}
          total={paged.total}
          onPage={setPage}
        />
      </div>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={() => { deleteInvoice(confirm.id); toast.success(`فاکتور ${confirm.number} حذف شد.`); }}
        title="حذف فاکتور"
        message={`آیا از حذف فاکتور ${confirm?.number || ''} مطمئن هستید؟ این عملیات قابل بازگشت نیست.`}
        confirmLabel="حذف کن"
      />
    </>
  );
}
