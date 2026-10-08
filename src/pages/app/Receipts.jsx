import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Wallet, Download, FileText } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import DataTable, { Pagination } from '../../components/ui/DataTable.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { PageHeader, Card, CardHead, CardBody } from '../../components/ui/Card.jsx';
import { Select, TextField } from '../../components/ui/Form.jsx';
import { EmptyState, InfoNote } from '../../components/ui/Misc.jsx';
import JalaliDateInput from '../../components/ui/JalaliDateInput.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { invoiceTotals, resolveStatus, PAYMENT_METHODS } from '../../lib/calc.js';
import { formatNumber } from '../../lib/format.js';
import { formatJalali, todayISO, monthKey } from '../../lib/date.js';
import { paginate, sortBy } from '../../lib/id.js';

const PER_PAGE = 9;

export default function Receipts() {
  const navigate = useNavigate();
  const toast = useToast();
  const { settings } = useSettings();
  const { receipts, invoices, customers, customerById, accounts, recordReceipt } = useData();

  const [query, setQuery] = useState('');
  const [method, setMethod] = useState('all');
  const [sort, setSort] = useState({ key: 'date', dir: 'desc' });
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState({});

  const openInvoices = useMemo(
    () => invoices
      .filter((i) => i.status === 'sent')
      .map((i) => ({ invoice: i, ...invoiceTotals(i), status: resolveStatus(i) }))
      .filter((r) => r.remaining > 0),
    [invoices]
  );

  const [form, setForm] = useState({
    customerId: '', invoiceId: '', amount: '', date: todayISO(),
    method: PAYMENT_METHODS[0], reference: '', notes: '', accountId: '',
  });

  const thisMonth = monthKey(todayISO());
  const stats = useMemo(() => ({
    total: receipts.reduce((s, r) => s + r.amount, 0),
    month: receipts.filter((r) => monthKey(r.date) === thisMonth).reduce((s, r) => s + r.amount, 0),
    count: receipts.length,
  }), [receipts, thisMonth]);

  const rows = useMemo(() => {
    const q = query.trim();
    const list = receipts
      .filter((r) => (method === 'all' ? true : r.method === method))
      .filter((r) => !q || r.customerName.includes(q) || r.invoiceNumber.includes(q) || (r.reference || '').includes(q));
    return sortBy(list, sort.key, sort.dir);
  }, [receipts, query, method, sort]);

  const paged = paginate(rows, page, PER_PAGE);

  const customerInvoices = form.customerId
    ? openInvoices.filter((r) => r.invoice.customerId === form.customerId)
    : openInvoices;

  const openModal = () => {
    setForm({
      customerId: '', invoiceId: '', amount: '', date: todayISO(),
      method: PAYMENT_METHODS[0], reference: '', notes: '', accountId: accounts[0]?.id || '',
    });
    setErrors({});
    setOpen(true);
  };

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.invoiceId) next.invoiceId = 'فاکتور را انتخاب کنید.';
    if (!Number(form.amount) || Number(form.amount) <= 0) next.amount = 'مبلغ دریافت باید بزرگ‌تر از صفر باشد.';
    setErrors(next);
    if (Object.keys(next).length) return;

    recordReceipt({
      invoiceId: form.invoiceId,
      amount: Number(form.amount),
      date: form.date,
      method: form.method,
      reference: form.reference,
      notes: form.notes,
      accountId: form.accountId || null,
    });
    setOpen(false);
    toast.success('دریافت ثبت شد و مانده فاکتور به‌روزرسانی شد.', { title: 'ثبت دریافت' });
  };

  const columns = [
    {
      key: 'customerName',
      header: 'مشتری',
      sortable: true,
      render: (row) => <span className="strong">{row.customerName}</span>,
    },
    {
      key: 'invoiceNumber',
      header: 'فاکتور',
      render: (row) => (
        <button
          type="button"
          className="badge badge--info"
          style={{ border: 0, cursor: 'pointer' }}
          onClick={() => navigate(`/app/invoices/${row.invoiceId}`)}
        >
          <span className="num">{row.invoiceNumber}</span>
        </button>
      ),
    },
    { key: 'date', header: 'تاریخ', sortable: true, render: (row) => <span className="num">{formatJalali(row.date)}</span> },
    { key: 'method', header: 'روش پرداخت', render: (row) => <Badge tone="neutral">{row.method}</Badge> },
    { key: 'reference', header: 'شماره پیگیری', render: (row) => <span className="num">{row.reference || '—'}</span> },
    {
      key: 'amount',
      header: `مبلغ (${settings.currency})`,
      align: 'end',
      sortable: true,
      render: (row) => <span className="num strong" style={{ color: 'var(--success-strong)' }}>{formatNumber(row.amount)}</span>,
    },
  ];

  return (
    <>
      <PageHeader
        title="دریافت‌ها"
        subtitle={`مجموع دریافت‌ها ${formatNumber(stats.total)} ${settings.currency}`}
        breadcrumbs={[{ label: 'داشبورد', to: '/app' }, { label: 'دریافت‌ها' }]}
        actions={
          <>
            <Button variant="outline" icon={Download} onClick={() => toast.info('خروجی دریافت‌ها آماده می‌شود.')}>خروجی</Button>
            <Button variant="accent" icon={Plus} onClick={openModal}>ثبت دریافت</Button>
          </>
        }
      />

      <div className="grid grid--stats" style={{ marginBottom: 'var(--s-5)' }}>
        <div className="stat stat--success">
          <div className="stat__head"><span className="stat__label">دریافت این ماه</span></div>
          <div className="stat__value num">{formatNumber(stats.month)}</div>
          <div className="stat__foot"><span className="stat__hint">{settings.currency}</span></div>
        </div>
        <div className="stat stat--brand">
          <div className="stat__head"><span className="stat__label">مجموع دریافت‌ها</span></div>
          <div className="stat__value num">{formatNumber(stats.total)}</div>
          <div className="stat__foot"><span className="stat__hint">تمام دوره‌ها</span></div>
        </div>
        <div className="stat stat--warning">
          <div className="stat__head"><span className="stat__label">فاکتورهای باز</span></div>
          <div className="stat__value num">{formatNumber(openInvoices.length)}</div>
          <div className="stat__foot"><span className="stat__hint">در انتظار دریافت</span></div>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar__search">
          <Search size={17} className="toolbar__search-icon" aria-hidden="true" />
          <label className="sr-only" htmlFor="rct-search">جست‌وجوی دریافت</label>
          <input id="rct-search" className="input" placeholder="مشتری، شماره فاکتور یا پیگیری…" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} />
        </div>
        <div style={{ minWidth: 170 }}>
          <Select aria-label="روش پرداخت" value={method} placeholder="همه روش‌ها" onChange={(e) => { setMethod(e.target.value); setPage(1); }} options={PAYMENT_METHODS} />
        </div>
      </div>

      <Card>
        <CardHead
          title="دفتر دریافت‌ها"
          subtitle="فهرست دریافت‌های ثبت‌شده روی فاکتورها"
          icon={Wallet}
        />
        <CardBody flush>
          <DataTable
            columns={columns}
            rows={paged.rows}
            sort={sort}
            onSort={(key, dir) => setSort({ key, dir })}
            emptyTitle="دریافتی ثبت نشده"
            emptyMessage="با ثبت دریافت روی فاکتورها، سابقه پرداخت مشتریان اینجا نمایش داده می‌شود."
            emptyAction={<Button variant="accent" icon={Plus} onClick={openModal}>ثبت دریافت</Button>}
            caption="دفتر دریافت‌ها"
          />
          <Pagination page={paged.page} pages={paged.pages} from={paged.from} to={paged.to} total={paged.total} onPage={setPage} />
        </CardBody>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="ثبت دریافت جدید"
        description="با انتخاب مشتری، فاکتورهای پرداخت‌نشده او نمایش داده می‌شود."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>انصراف</Button>
            <Button variant="success" icon={Plus} onClick={submit}>ثبت دریافت</Button>
          </>
        }
      >
        {openInvoices.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="فاکتور پرداخت‌نشده‌ای وجود ندارد"
            message="همه فاکتورهای ارسال‌شده تسویه شده‌اند."
            action={<Button variant="outline" onClick={() => navigate('/app/invoices')}>مشاهده فاکتورها</Button>}
          />
        ) : (
          <form onSubmit={submit} className="stack" style={{ gap: 'var(--s-4)' }}>
            <div className="form-grid">
              <Select
                aria-label="مشتری"
                value={form.customerId}
                placeholder="همه مشتریان"
                onChange={(e) => setForm((f) => ({ ...f, customerId: e.target.value, invoiceId: '' }))}
                options={customers.map((c) => ({ value: c.id, label: c.name }))}
              />
              <div>
                <Select
                  aria-label="فاکتور"
                  value={form.invoiceId}
                  placeholder="انتخاب فاکتور…"
                  onChange={(e) => {
                    const sel = customerInvoices.find((r) => r.invoice.id === e.target.value);
                    setForm((f) => ({ ...f, invoiceId: e.target.value, amount: sel ? String(sel.remaining) : f.amount }));
                  }}
                  options={customerInvoices.map((r) => ({
                    value: r.invoice.id,
                    label: `${r.invoice.number} — ${customerById[r.invoice.customerId]?.name || ''} — مانده ${formatNumber(r.remaining)}`,
                  }))}
                />
                {errors.invoiceId ? <p className="field__error" role="alert">{errors.invoiceId}</p> : null}
              </div>
              <TextField
                label={`مبلغ دریافت (${settings.currency})`}
                required
                dir="ltr"
                inputMode="numeric"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                error={errors.amount}
              />
              <JalaliDateInput label="تاریخ دریافت" value={form.date} onChange={(v) => setForm((f) => ({ ...f, date: v }))} />
              <Select aria-label="روش پرداخت" value={form.method} onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))} options={PAYMENT_METHODS} />
              <Select
                aria-label="حساب مقصد"
                value={form.accountId}
                placeholder="بدون واریز به حساب"
                onChange={(e) => setForm((f) => ({ ...f, accountId: e.target.value }))}
                options={accounts.map((a) => ({ value: a.id, label: `${a.name} — ${formatNumber(a.balance)}` }))}
              />
              <TextField label="شماره پیگیری / مرجع" dir="ltr" value={form.reference} onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))} placeholder="TRX-99871" />
              <TextField label="یادداشت" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>
            <InfoNote tone="info">
              با ثبت دریافت، مانده فاکتور به‌صورت خودکار به‌روزرسانی می‌شود و در صورت انتخاب حساب،
              گردش بانکی نیز ثبت خواهد شد.
            </InfoNote>
          </form>
        )}
      </Modal>
    </>
  );
}
