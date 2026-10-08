import { useMemo, useState } from 'react';
import { Plus, Search, Pencil, Trash2, Receipt, Download, AlertTriangle } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import DataTable, { Pagination } from '../../components/ui/DataTable.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import Modal, { ConfirmDialog } from '../../components/ui/Modal.jsx';
import { PageHeader } from '../../components/ui/Card.jsx';
import { Select, TextField, TextareaField } from '../../components/ui/Form.jsx';
import JalaliDateInput from '../../components/ui/JalaliDateInput.jsx';
import { Segmented } from '../../components/ui/Misc.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { EXPENSE_CATEGORIES } from '../../lib/data.js';
import { PAYMENT_METHODS } from '../../lib/calc.js';
import { formatNumber } from '../../lib/format.js';
import { formatJalali, todayISO, monthKey } from '../../lib/date.js';
import { paginate, sortBy } from '../../lib/id.js';

const PER_PAGE = 9;
const EMPTY = {
  title: '', category: EXPENSE_CATEGORIES[0], amount: '', date: todayISO(),
  method: PAYMENT_METHODS[0], supplier: '', description: '', status: 'paid',
};

export default function Expenses() {
  const toast = useToast();
  const { settings } = useSettings();
  const { expenses, suppliers, addExpense, updateExpense, deleteExpense } = useData();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState({ key: 'date', dir: 'desc' });
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [confirm, setConfirm] = useState(null);

  const thisMonth = monthKey(todayISO());
  const stats = useMemo(() => {
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const month = expenses.filter((e) => monthKey(e.date) === thisMonth).reduce((s, e) => s + e.amount, 0);
    const pending = expenses.filter((e) => e.status === 'pending');
    return { total, month, pending, pendingSum: pending.reduce((s, e) => s + e.amount, 0) };
  }, [expenses, thisMonth]);

  const rows = useMemo(() => {
    const q = query.trim();
    const list = expenses
      .filter((e) => (category === 'all' ? true : e.category === category))
      .filter((e) => (status === 'all' ? true : e.status === status))
      .filter((e) => !q || e.title.includes(q) || (e.supplier || '').includes(q));
    return sortBy(list, sort.key, sort.dir);
  }, [expenses, query, category, status, sort]);

  const paged = paginate(rows, page, PER_PAGE);

  const openNew = () => { setEditing('new'); setForm({ ...EMPTY, date: todayISO() }); setErrors({}); };
  const openEdit = (e) => { setEditing(e.id); setForm({ ...EMPTY, ...e }); setErrors({}); };

  const save = (ev) => {
    ev.preventDefault();
    const next = {};
    if (!form.title.trim()) next.title = 'عنوان هزینه الزامی است.';
    if (Number(form.amount) <= 0) next.amount = 'مبلغ باید بزرگ‌تر از صفر باشد.';
    setErrors(next);
    if (Object.keys(next).length) return;

    const payload = { ...form, amount: Number(form.amount) || 0 };
    if (editing === 'new') {
      addExpense(payload);
      toast.success('هزینه جدید ثبت شد.', { title: 'ثبت شد' });
    } else {
      updateExpense(editing, payload);
      toast.success('هزینه به‌روزرسانی شد.');
    }
    setEditing(null);
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const columns = [
    {
      key: 'title',
      header: 'عنوان هزینه',
      sortable: true,
      render: (row) => (
        <div>
          <div className="strong">{row.title}</div>
          <div className="faint">{row.supplier || '—'}</div>
        </div>
      ),
    },
    { key: 'category', header: 'دسته‌بندی', render: (row) => <Badge tone="info">{row.category}</Badge> },
    { key: 'date', header: 'تاریخ', sortable: true, render: (row) => <span className="num">{formatJalali(row.date)}</span> },
    { key: 'method', header: 'روش پرداخت' },
    {
      key: 'amount',
      header: `مبلغ (${settings.currency})`,
      align: 'end',
      sortable: true,
      render: (row) => <span className="num strong">{formatNumber(row.amount)}</span>,
    },
    {
      key: 'status',
      header: 'وضعیت',
      render: (row) => (
        <Badge tone={row.status === 'paid' ? 'success' : 'warning'} dot>
          {row.status === 'paid' ? 'پرداخت‌شده' : 'در انتظار پرداخت'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'عملیات',
      align: 'center',
      width: 110,
      render: (row) => (
        <div className="row gap-1" style={{ justifyContent: 'center' }}>
          <Button variant="ghost" size="sm" icon={Pencil} onClick={() => openEdit(row)} aria-label="ویرایش" />
          <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setConfirm(row)} aria-label="حذف" />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="هزینه‌ها"
        subtitle={`مجموع هزینه‌های ثبت‌شده ${formatNumber(stats.total)} ${settings.currency}`}
        breadcrumbs={[{ label: 'داشبورد', to: '/app' }, { label: 'هزینه‌ها' }]}
        actions={
          <>
            <Button
              variant="outline"
              icon={Download}
              onClick={() => toast.info('خروجی هزینه‌ها شامل تاریخ، دسته‌بندی، مبلغ و روش پرداخت آماده می‌شود.')}
            >
              خروجی
            </Button>
            <Button variant="accent" icon={Plus} onClick={openNew}>ثبت هزینه</Button>
          </>
        }
      />

      <div className="grid grid--stats" style={{ marginBottom: 'var(--s-5)' }}>
        <div className="stat stat--indigo">
          <div className="stat__head"><span className="stat__label">هزینه این ماه</span></div>
          <div className="stat__value num">{formatNumber(stats.month)}</div>
          <div className="stat__foot"><span className="stat__hint">{settings.currency}</span></div>
        </div>
        <div className="stat stat--brand">
          <div className="stat__head"><span className="stat__label">مجموع هزینه‌ها</span></div>
          <div className="stat__value num">{formatNumber(stats.total)}</div>
          <div className="stat__foot"><span className="stat__hint">تمام دوره‌ها</span></div>
        </div>
        <div className="stat stat--warning">
          <div className="stat__head"><span className="stat__label">در انتظار پرداخت</span></div>
          <div className="stat__value num">{formatNumber(stats.pendingSum)}</div>
          <div className="stat__foot">
            <span className="stat__hint"><span className="num">{formatNumber(stats.pending.length)}</span> مورد</span>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar__search">
          <Search size={17} className="toolbar__search-icon" aria-hidden="true" />
          <label className="sr-only" htmlFor="exp-search">جست‌وجوی هزینه</label>
          <input id="exp-search" className="input" placeholder="عنوان هزینه یا تأمین‌کننده…" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} />
        </div>
        <div style={{ minWidth: 170 }}>
          <Select aria-label="دسته‌بندی" value={category} placeholder="همه دسته‌ها" onChange={(e) => { setCategory(e.target.value); setPage(1); }} options={EXPENSE_CATEGORIES} />
        </div>
        <Segmented
          ariaLabel="وضعیت"
          size="sm"
          value={status}
          onChange={(v) => { setStatus(v); setPage(1); }}
          options={[
            { value: 'all', label: 'همه' },
            { value: 'paid', label: 'پرداخت‌شده' },
            { value: 'pending', label: 'در انتظار' },
          ]}
        />
      </div>

      <div className="card">
        <DataTable
          columns={columns}
          rows={paged.rows}
          sort={sort}
          onSort={(key, dir) => setSort({ key, dir })}
          emptyTitle="هزینه‌ای ثبت نشده"
          emptyMessage="هزینه‌های کسب‌وکار خود را ثبت کنید تا در گزارش‌ها دیده شوند."
          emptyAction={<Button variant="accent" icon={Plus} onClick={openNew}>ثبت هزینه</Button>}
          caption="فهرست هزینه‌ها"
        />
        <Pagination page={paged.page} pages={paged.pages} from={paged.from} to={paged.to} total={paged.total} onPage={setPage} />
      </div>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'ثبت هزینه جدید' : 'ویرایش هزینه'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>انصراف</Button>
            <Button variant="accent" icon={Receipt} onClick={save}>ذخیره هزینه</Button>
          </>
        }
      >
        <form onSubmit={save} className="stack" style={{ gap: 'var(--s-4)' }}>
          <div className="form-grid">
            <TextField label="عنوان هزینه" required value={form.title} onChange={set('title')} error={errors.title} placeholder="مثلاً اجاره دفتر مرکزی" />
            <Select aria-label="دسته‌بندی" value={form.category} onChange={set('category')} options={EXPENSE_CATEGORIES} />
            <TextField label={`مبلغ (${settings.currency})`} required dir="ltr" inputMode="numeric" value={form.amount} onChange={set('amount')} error={errors.amount} />
            <JalaliDateInput label="تاریخ هزینه" value={form.date} onChange={(v) => setForm((f) => ({ ...f, date: v }))} />
            <Select aria-label="روش پرداخت" value={form.method} onChange={set('method')} options={PAYMENT_METHODS} />
            <Select aria-label="تأمین‌کننده" value={form.supplier} placeholder="انتخاب تأمین‌کننده" onChange={set('supplier')} options={suppliers} />
            <Select
              aria-label="وضعیت"
              value={form.status}
              onChange={set('status')}
              options={[{ value: 'paid', label: 'پرداخت‌شده' }, { value: 'pending', label: 'در انتظار پرداخت' }]}
            />
          </div>
          <TextareaField label="توضیحات" rows={2} value={form.description} onChange={set('description')} placeholder="توضیحات تکمیلی…" />
          <div className="note note--info">
            <AlertTriangle size={18} className="note__icon" aria-hidden="true" />
            <div className="note__body">
              امکان پیوست فایل فاکتور خرید در نسخه‌های بعدی فعال می‌شود. در حال حاضر می‌توانید شرح کامل
              هزینه را در بخش توضیحات ثبت کنید.
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={() => { deleteExpense(confirm.id); toast.success('هزینه حذف شد.'); }}
        title="حذف هزینه"
        message={`آیا از حذف «${confirm?.title || ''}» مطمئن هستید؟`}
        confirmLabel="حذف کن"
      />
    </>
  );
}
