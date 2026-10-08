import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Pencil, Trash2, Users, Download } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import DataTable, { Pagination } from '../../components/ui/DataTable.jsx';
import { Badge, Avatar } from '../../components/ui/Badge.jsx';
import Modal, { ConfirmDialog } from '../../components/ui/Modal.jsx';
import { PageHeader } from '../../components/ui/Card.jsx';
import { Select, TextField, TextareaField } from '../../components/ui/Form.jsx';
import { Segmented } from '../../components/ui/Misc.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { customerSummary } from '../../lib/metrics.js';
import { formatNumber } from '../../lib/format.js';
import { formatJalali } from '../../lib/date.js';
import { paginate, sortBy } from '../../lib/id.js';

const PER_PAGE = 8;
const EMPTY = {
  name: '', type: 'حقوقی', contact: '', phone: '', email: '',
  nationalId: '', city: '', address: '', creditLimit: '', paymentTerms: 30, notes: '',
};

export default function Customers() {
  const navigate = useNavigate();
  const toast = useToast();
  const { settings } = useSettings();
  const { customers, invoices, addCustomer, updateCustomer, deleteCustomer } = useData();

  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [sort, setSort] = useState({ key: 'name', dir: 'asc' });
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [confirm, setConfirm] = useState(null);

  const rows = useMemo(() => {
    const q = query.trim();
    const list = customers
      .filter((c) => (type === 'all' ? true : c.type === type))
      .filter((c) => !q || c.name.includes(q) || (c.phone || '').includes(q) || (c.email || '').includes(q))
      .map((c) => ({ ...c, _summary: customerSummary(c.id, invoices) }));
    return sortBy(list, sort.key === 'balance' ? (r) => r._summary.balance : sort.key, sort.dir);
  }, [customers, invoices, query, type, sort]);

  const paged = paginate(rows, page, PER_PAGE);

  const openNew = () => { setEditing('new'); setForm(EMPTY); setErrors({}); };
  const openEdit = (c) => {
    setEditing(c.id);
    setForm({ ...EMPTY, ...c, creditLimit: c.creditLimit || '' });
    setErrors({});
  };

  const save = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = 'نام مشتری الزامی است.';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'ایمیل معتبر وارد کنید.';
    if (form.phone && !/^[0-9۰-۹\-\s]{8,15}$/.test(form.phone)) next.phone = 'شماره تماس معتبر وارد کنید.';
    setErrors(next);
    if (Object.keys(next).length) return;

    const payload = { ...form, creditLimit: Number(form.creditLimit) || 0, paymentTerms: Number(form.paymentTerms) || 0 };
    if (editing === 'new') {
      addCustomer(payload);
      toast.success('مشتری جدید ثبت شد.', { title: 'ثبت شد' });
    } else {
      updateCustomer(editing, payload);
      toast.success('اطلاعات مشتری به‌روزرسانی شد.');
    }
    setEditing(null);
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const columns = [
    {
      key: 'name',
      header: 'مشتری',
      sortable: true,
      render: (row) => (
        <div className="row gap-3">
          <Avatar name={row.name} size={34} />
          <div>
            <div className="strong">{row.name}</div>
            <div className="faint">{row.contact || row.city || '—'}</div>
          </div>
        </div>
      ),
    },
    { key: 'type', header: 'نوع', render: (row) => <Badge tone={row.type === 'حقوقی' ? 'info' : 'neutral'}>{row.type}</Badge> },
    { key: 'phone', header: 'تماس', render: (row) => <span className="num">{row.phone || '—'}</span> },
    { key: 'count', header: 'تعداد فاکتور', align: 'center', render: (row) => <span className="num">{formatNumber(row._summary.count)}</span> },
    {
      key: 'balance',
      header: `مانده (${settings.currency})`,
      align: 'end',
      sortable: true,
      render: (row) => (
        <span className="num strong" style={{ color: row._summary.balance > 0 ? 'var(--danger)' : 'var(--success-strong)' }}>
          {formatNumber(row._summary.balance)}
        </span>
      ),
    },
    { key: 'createdAt', header: 'تاریخ عضویت', render: (row) => <span className="num">{formatJalali(row.createdAt)}</span> },
    {
      key: 'actions',
      header: 'عملیات',
      align: 'center',
      width: 140,
      render: (row) => (
        <div className="row gap-1" style={{ justifyContent: 'center' }} onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" icon={Eye} onClick={() => navigate(`/app/customers/${row.id}`)} aria-label="مشاهده" />
          <Button variant="ghost" size="sm" icon={Pencil} onClick={() => openEdit(row)} aria-label="ویرایش" />
          <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setConfirm(row)} aria-label="حذف" />
        </div>
      ),
    },
  ];

  const exportCsv = () => {
    const header = ['نام', 'نوع', 'تماس', 'ایمیل', 'شهر', `مانده (${settings.currency})`];
    const lines = rows.map((r) => [r.name, r.type, r.phone, r.email, r.city, r._summary.balance]);
    const csv = [header, ...lines].map((r) => r.join(',')).join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'customers-2hs.csv';
    a.click();
    toast.success('خروجی مشتریان آماده شد.');
  };

  return (
    <>
      <PageHeader
        title="مشتریان"
        subtitle={`${formatNumber(customers.length)} مشتری ثبت‌شده در ${settings.businessName}`}
        breadcrumbs={[{ label: 'داشبورد', to: '/app' }, { label: 'مشتریان' }]}
        actions={
          <>
            <Button variant="outline" icon={Download} onClick={exportCsv}>خروجی CSV</Button>
            <Button variant="accent" icon={Plus} onClick={openNew}>افزودن مشتری</Button>
          </>
        }
      />

      <div className="toolbar">
        <div className="toolbar__search">
          <Search size={17} className="toolbar__search-icon" aria-hidden="true" />
          <label className="sr-only" htmlFor="cus-search">جست‌وجوی مشتری</label>
          <input
            id="cus-search"
            className="input"
            placeholder="نام، تلفن یا ایمیل مشتری…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          />
        </div>
        <Segmented
          ariaLabel="نوع مشتری"
          size="sm"
          value={type}
          onChange={(v) => { setType(v); setPage(1); }}
          options={[
            { value: 'all', label: 'همه' },
            { value: 'حقوقی', label: 'حقوقی' },
            { value: 'حقیقی', label: 'حقیقی' },
          ]}
        />
        <div className="toolbar__spacer" />
      </div>

      <div className="card">
        <DataTable
          columns={columns}
          rows={paged.rows}
          sort={sort}
          onSort={(key, dir) => setSort({ key, dir })}
          onRowClick={(row) => navigate(`/app/customers/${row.id}`)}
          emptyTitle="مشتری‌ای یافت نشد"
          emptyMessage="برای شروع، اولین مشتری خود را اضافه کنید."
          emptyAction={<Button variant="accent" icon={Plus} onClick={openNew}>افزودن مشتری</Button>}
          caption="فهرست مشتریان"
        />
        <Pagination page={paged.page} pages={paged.pages} from={paged.from} to={paged.to} total={paged.total} onPage={setPage} />
      </div>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'افزودن مشتری' : 'ویرایش مشتری'}
        description="اطلاعات تماس و شرایط پرداخت مشتری را وارد کنید."
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>انصراف</Button>
            <Button variant="accent" icon={Plus} onClick={save}>ذخیره مشتری</Button>
          </>
        }
      >
        <form onSubmit={save} className="stack" style={{ gap: 'var(--s-4)' }}>
          <div className="form-grid">
            <TextField label="نام مشتری" required value={form.name} onChange={set('name')} error={errors.name} placeholder="مثلاً شرکت فولاد سپاهان" />
            <Select aria-label="نوع مشتری" value={form.type} onChange={set('type')} options={['حقوقی', 'حقیقی']} />
            <TextField label="نام رابط" value={form.contact} onChange={set('contact')} placeholder="مثلاً مهندس احمدی" />
            <TextField label="شماره تماس" dir="ltr" value={form.phone} onChange={set('phone')} error={errors.phone} placeholder="031-36660120" />
            <TextField label="ایمیل" dir="ltr" value={form.email} onChange={set('email')} error={errors.email} placeholder="info@example.com" />
            <TextField label="شماره اقتصادی / ملی" dir="ltr" value={form.nationalId} onChange={set('nationalId')} placeholder="۱۰۲۶۰۰۴۵۶۷۸" />
            <TextField label="شهر" value={form.city} onChange={set('city')} placeholder="اصفهان" />
            <TextField label={`حد اعتباری (${settings.currency})`} dir="ltr" inputMode="numeric" value={form.creditLimit} onChange={set('creditLimit')} placeholder="500000000" />
            <TextField label="مهلت پرداخت (روز)" dir="ltr" inputMode="numeric" value={form.paymentTerms} onChange={set('paymentTerms')} />
          </div>
          <TextareaField label="نشانی" rows={2} value={form.address} onChange={set('address')} placeholder="نشانی کامل مشتری…" />
          <TextareaField label="یادداشت" rows={2} value={form.notes} onChange={set('notes')} placeholder="توضیحات داخلی درباره این مشتری…" />
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={() => { deleteCustomer(confirm.id); toast.success(`مشتری «${confirm.name}» حذف شد.`); }}
        title="حذف مشتری"
        message={`آیا از حذف «${confirm?.name || ''}» مطمئن هستید؟ فاکتورهای ثبت‌شده حذف نمی‌شوند.`}
        confirmLabel="حذف کن"
      />
    </>
  );
}
