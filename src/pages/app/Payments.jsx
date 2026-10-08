import { useMemo, useState } from 'react';
import { Plus, Search, Banknote, Trash2, Download } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import DataTable, { Pagination } from '../../components/ui/DataTable.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import Modal, { ConfirmDialog } from '../../components/ui/Modal.jsx';
import { PageHeader, Card, CardHead, CardBody } from '../../components/ui/Card.jsx';
import { Select, TextField } from '../../components/ui/Form.jsx';
import JalaliDateInput from '../../components/ui/JalaliDateInput.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { PAYMENT_METHODS } from '../../lib/calc.js';
import { formatNumber } from '../../lib/format.js';
import { formatJalali, todayISO, monthKey } from '../../lib/date.js';
import { paginate, sortBy } from '../../lib/id.js';

const PER_PAGE = 9;

export default function Payments() {
  const toast = useToast();
  const { settings } = useSettings();
  const { payments, suppliers, accounts, accountById, recordSupplierPayment, deletePayment } = useData();

  const [query, setQuery] = useState('');
  const [accountId, setAccountId] = useState('all');
  const [sort, setSort] = useState({ key: 'date', dir: 'desc' });
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    supplier: '', amount: '', date: todayISO(), accountId: '',
    method: PAYMENT_METHODS[0], reference: '', notes: '',
  });

  const thisMonth = monthKey(todayISO());
  const stats = useMemo(() => ({
    total: payments.reduce((s, p) => s + p.amount, 0),
    month: payments.filter((p) => monthKey(p.date) === thisMonth).reduce((s, p) => s + p.amount, 0),
    count: payments.length,
  }), [payments, thisMonth]);

  const rows = useMemo(() => {
    const q = query.trim();
    const list = payments
      .filter((p) => (accountId === 'all' ? true : p.accountId === accountId))
      .filter((p) => !q || p.supplier.includes(q) || (p.reference || '').includes(q));
    return sortBy(list, sort.key, sort.dir);
  }, [payments, query, accountId, sort]);

  const paged = paginate(rows, page, PER_PAGE);

  const openModal = () => {
    setForm({
      supplier: '', amount: '', date: todayISO(), accountId: accounts[0]?.id || '',
      method: PAYMENT_METHODS[0], reference: '', notes: '',
    });
    setErrors({});
    setOpen(true);
  };

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.supplier) next.supplier = 'تأمین‌کننده را انتخاب کنید.';
    if (!Number(form.amount) || Number(form.amount) <= 0) next.amount = 'مبلغ پرداخت باید بزرگ‌تر از صفر باشد.';
    setErrors(next);
    if (Object.keys(next).length) return;

    recordSupplierPayment({
      supplier: form.supplier,
      amount: Number(form.amount),
      date: form.date,
      accountId: form.accountId || null,
      method: form.method,
      reference: form.reference,
      notes: form.notes,
    });
    setOpen(false);
    toast.success('پرداخت ثبت شد و موجودی حساب به‌روزرسانی شد.', { title: 'ثبت پرداخت' });
  };

  const columns = [
    { key: 'supplier', header: 'تأمین‌کننده', sortable: true, render: (row) => <span className="strong">{row.supplier}</span> },
    { key: 'date', header: 'تاریخ', sortable: true, render: (row) => <span className="num">{formatJalali(row.date)}</span> },
    { key: 'method', header: 'روش پرداخت', render: (row) => <Badge tone="neutral">{row.method}</Badge> },
    {
      key: 'account',
      header: 'حساب',
      render: (row) => (row.accountId ? accountById[row.accountId]?.name || '—' : <span className="faint">بدون حساب</span>),
    },
    { key: 'reference', header: 'شماره پیگیری', render: (row) => <span className="num">{row.reference || '—'}</span> },
    {
      key: 'amount',
      header: `مبلغ (${settings.currency})`,
      align: 'end',
      sortable: true,
      render: (row) => <span className="num strong" style={{ color: 'var(--danger)' }}>{formatNumber(row.amount)}</span>,
    },
    {
      key: 'actions',
      header: 'عملیات',
      align: 'center',
      width: 70,
      render: (row) => (
        <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setConfirm(row)} aria-label="حذف پرداخت" />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="پرداخت‌ها"
        subtitle={`مجموع پرداخت‌ها ${formatNumber(stats.total)} ${settings.currency}`}
        breadcrumbs={[{ label: 'داشبورد', to: '/app' }, { label: 'پرداخت‌ها' }]}
        actions={
          <>
            <Button variant="outline" icon={Download} onClick={() => toast.info('خروجی پرداخت‌ها آماده می‌شود.')}>خروجی</Button>
            <Button variant="accent" icon={Plus} onClick={openModal}>ثبت پرداخت</Button>
          </>
        }
      />

      <div className="grid grid--stats" style={{ marginBottom: 'var(--s-5)' }}>
        <div className="stat stat--danger">
          <div className="stat__head"><span className="stat__label">پرداخت این ماه</span></div>
          <div className="stat__value num">{formatNumber(stats.month)}</div>
          <div className="stat__foot"><span className="stat__hint">{settings.currency}</span></div>
        </div>
        <div className="stat stat--indigo">
          <div className="stat__head"><span className="stat__label">مجموع پرداخت‌ها</span></div>
          <div className="stat__value num">{formatNumber(stats.total)}</div>
          <div className="stat__foot"><span className="stat__hint">تمام دوره‌ها</span></div>
        </div>
        <div className="stat stat--brand">
          <div className="stat__head"><span className="stat__label">تعداد پرداخت</span></div>
          <div className="stat__value num">{formatNumber(stats.count)}</div>
          <div className="stat__foot"><span className="stat__hint">ثبت‌شده در سیستم</span></div>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar__search">
          <Search size={17} className="toolbar__search-icon" aria-hidden="true" />
          <label className="sr-only" htmlFor="pmt-search">جست‌وجوی پرداخت</label>
          <input id="pmt-search" className="input" placeholder="تأمین‌کننده یا شماره پیگیری…" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} />
        </div>
        <div style={{ minWidth: 200 }}>
          <Select
            aria-label="حساب"
            value={accountId}
            placeholder="همه حساب‌ها"
            onChange={(e) => { setAccountId(e.target.value); setPage(1); }}
            options={accounts.map((a) => ({ value: a.id, label: a.name }))}
          />
        </div>
      </div>

      <Card>
        <CardHead title="دفتر پرداخت‌ها" subtitle="پرداخت‌های انجام‌شده به تأمین‌کنندگان" icon={Banknote} />
        <CardBody flush>
          <DataTable
            columns={columns}
            rows={paged.rows}
            sort={sort}
            onSort={(key, dir) => setSort({ key, dir })}
            emptyTitle="پرداختی ثبت نشده"
            emptyMessage="پرداخت‌های خود به تأمین‌کنندگان را اینجا ثبت کنید."
            emptyAction={<Button variant="accent" icon={Plus} onClick={openModal}>ثبت پرداخت</Button>}
            caption="دفتر پرداخت‌ها"
          />
          <Pagination page={paged.page} pages={paged.pages} from={paged.from} to={paged.to} total={paged.total} onPage={setPage} />
        </CardBody>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="ثبت پرداخت جدید"
        description="پرداخت به تأمین‌کننده یا هزینه‌های کسب‌وکار"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>انصراف</Button>
            <Button variant="accent" icon={Plus} onClick={submit}>ثبت پرداخت</Button>
          </>
        }
      >
        <form onSubmit={submit} className="stack" style={{ gap: 'var(--s-4)' }}>
          <div className="form-grid">
            <div>
              <Select
                aria-label="تأمین‌کننده"
                value={form.supplier}
                placeholder="انتخاب تأمین‌کننده…"
                onChange={(e) => setForm((f) => ({ ...f, supplier: e.target.value }))}
                options={suppliers}
              />
              {errors.supplier ? <p className="field__error" role="alert">{errors.supplier}</p> : null}
            </div>
            <TextField
              label={`مبلغ پرداخت (${settings.currency})`}
              required
              dir="ltr"
              inputMode="numeric"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              error={errors.amount}
            />
            <JalaliDateInput label="تاریخ پرداخت" value={form.date} onChange={(v) => setForm((f) => ({ ...f, date: v }))} />
            <Select
              aria-label="حساب بانکی"
              value={form.accountId}
              placeholder="بدون کسر از حساب"
              onChange={(e) => setForm((f) => ({ ...f, accountId: e.target.value }))}
              options={accounts.map((a) => ({ value: a.id, label: `${a.name} — ${formatNumber(a.balance)}` }))}
            />
            <Select aria-label="روش پرداخت" value={form.method} onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))} options={PAYMENT_METHODS} />
            <TextField label="شماره پیگیری / مرجع" dir="ltr" value={form.reference} onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))} placeholder="CHK-4412" />
          </div>
          <TextField label="یادداشت" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="توضیح اختیاری" />
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={() => { deletePayment(confirm.id); toast.success('پرداخت حذف شد و موجودی حساب اصلاح شد.'); }}
        title="حذف پرداخت"
        message="آیا از حذف این پرداخت مطمئن هستید؟ در صورت ثبت روی حساب، موجودی آن اصلاح می‌شود."
        confirmLabel="حذف کن"
      />
    </>
  );
}
