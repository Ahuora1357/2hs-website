import { useMemo, useState } from 'react';
import { Plus, Search, Pencil, Trash2, Package, Download, AlertTriangle } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import DataTable, { Pagination } from '../../components/ui/DataTable.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import Modal, { ConfirmDialog } from '../../components/ui/Modal.jsx';
import { PageHeader, Card, CardBody } from '../../components/ui/Card.jsx';
import { Select, TextField, TextareaField } from '../../components/ui/Form.jsx';
import { Segmented, InfoNote } from '../../components/ui/Misc.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { PRODUCT_CATEGORIES, PRODUCT_UNITS } from '../../lib/data.js';
import { formatNumber } from '../../lib/format.js';
import { paginate, sortBy } from '../../lib/id.js';

const PER_PAGE = 9;
const EMPTY = {
  name: '', sku: '', category: PRODUCT_CATEGORIES[0], unit: PRODUCT_UNITS[0],
  purchasePrice: '', salePrice: '', taxRate: 9, stock: '', minStock: '', description: '', active: true,
};

export default function Products() {
  const toast = useToast();
  const { settings } = useSettings();
  const { products, addProduct, updateProduct, deleteProduct } = useData();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [stock, setStock] = useState('all');
  const [sort, setSort] = useState({ key: 'name', dir: 'asc' });
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [confirm, setConfirm] = useState(null);

  const lowStock = products.filter((p) => p.stock !== null && p.minStock !== null && p.stock <= p.minStock);

  const rows = useMemo(() => {
    const q = query.trim();
    const list = products
      .filter((p) => (category === 'all' ? true : p.category === category))
      .filter((p) => {
        if (stock === 'low') return p.stock !== null && p.minStock !== null && p.stock <= p.minStock;
        if (stock === 'available') return p.stock === null || p.stock > (p.minStock || 0);
        if (stock === 'inactive') return !p.active;
        return true;
      })
      .filter((p) => !q || p.name.includes(q) || (p.sku || '').includes(q));
    return sortBy(list, sort.key, sort.dir);
  }, [products, query, category, stock, sort]);

  const paged = paginate(rows, page, PER_PAGE);

  const openNew = () => { setEditing('new'); setForm(EMPTY); setErrors({}); };
  const openEdit = (p) => {
    setEditing(p.id);
    setForm({
      ...EMPTY, ...p,
      purchasePrice: p.purchasePrice ?? '',
      salePrice: p.salePrice ?? '',
      stock: p.stock ?? '',
      minStock: p.minStock ?? '',
    });
    setErrors({});
  };

  const save = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = 'نام کالا یا خدمت الزامی است.';
    if (Number(form.salePrice) <= 0) next.salePrice = 'قیمت فروش باید بزرگ‌تر از صفر باشد.';
    setErrors(next);
    if (Object.keys(next).length) return;

    const payload = {
      ...form,
      purchasePrice: Number(form.purchasePrice) || 0,
      salePrice: Number(form.salePrice) || 0,
      taxRate: Number(form.taxRate) || 0,
      stock: form.stock === '' ? null : Number(form.stock),
      minStock: form.minStock === '' ? null : Number(form.minStock),
    };
    if (editing === 'new') {
      addProduct(payload);
      toast.success('کالا یا خدمت جدید ثبت شد.', { title: 'ثبت شد' });
    } else {
      updateProduct(editing, payload);
      toast.success('اطلاعات به‌روزرسانی شد.');
    }
    setEditing(null);
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const columns = [
    {
      key: 'name',
      header: 'کالا / خدمت',
      sortable: true,
      render: (row) => (
        <div>
          <div className="strong">{row.name}</div>
          <div className="faint">{row.sku || 'بدون کد'}{row.active ? '' : ' — غیرفعال'}</div>
        </div>
      ),
    },
    { key: 'category', header: 'دسته‌بندی', render: (row) => <Badge tone="info">{row.category}</Badge> },
    { key: 'unit', header: 'واحد' },
    { key: 'purchasePrice', header: 'قیمت خرید', align: 'end', sortable: true, render: (row) => <span className="num">{formatNumber(row.purchasePrice)}</span> },
    { key: 'salePrice', header: 'قیمت فروش', align: 'end', sortable: true, render: (row) => <span className="num strong">{formatNumber(row.salePrice)}</span> },
    { key: 'taxRate', header: 'مالیات', align: 'center', render: (row) => <span className="num">{formatNumber(row.taxRate)}٪</span> },
    {
      key: 'stock',
      header: 'موجودی',
      align: 'center',
      render: (row) => {
        if (row.stock === null) return <span className="faint">—</span>;
        const low = row.minStock !== null && row.stock <= row.minStock;
        return (
          <span className={`stock-pill ${low ? 'stock-pill--low' : 'stock-pill--ok'}`}>
            {low ? <AlertTriangle size={14} /> : null}
            <span className="num">{formatNumber(row.stock)}</span>
          </span>
        );
      },
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
        title="کالاها و خدمات"
        subtitle={`${formatNumber(products.length)} قلم ثبت‌شده — ${formatNumber(lowStock.length)} مورد نیازمند تأمین`}
        breadcrumbs={[{ label: 'داشبورد', to: '/app' }, { label: 'کالاها و خدمات' }]}
        actions={
          <>
            <Button
              variant="outline"
              icon={Download}
              onClick={() => toast.info('ساختار خروجی آماده است: نام، کد، دسته، واحد، قیمت و مالیات.')}
            >
              خروجی فهرست
            </Button>
            <Button variant="accent" icon={Plus} onClick={openNew}>افزودن کالا / خدمت</Button>
          </>
        }
      />

      {lowStock.length ? (
        <div style={{ marginBottom: 'var(--s-5)' }}>
          <InfoNote tone="warning" icon={AlertTriangle} title="هشدار کمبود موجودی">
            {lowStock.map((p) => p.name).join('، ')} — موجودی این اقلام به حد هشدار رسیده است.
          </InfoNote>
        </div>
      ) : null}

      <div className="toolbar">
        <div className="toolbar__search">
          <Search size={17} className="toolbar__search-icon" aria-hidden="true" />
          <label className="sr-only" htmlFor="prd-search">جست‌وجو</label>
          <input id="prd-search" className="input" placeholder="نام یا کد کالا…" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} />
        </div>
        <div style={{ minWidth: 170 }}>
          <Select
            aria-label="دسته‌بندی"
            value={category}
            placeholder="همه دسته‌ها"
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            options={PRODUCT_CATEGORIES}
          />
        </div>
        <Segmented
          ariaLabel="وضعیت موجودی"
          size="sm"
          value={stock}
          onChange={(v) => { setStock(v); setPage(1); }}
          options={[
            { value: 'all', label: 'همه' },
            { value: 'available', label: 'موجود' },
            { value: 'low', label: 'کمبود' },
            { value: 'inactive', label: 'غیرفعال' },
          ]}
        />
      </div>

      <div className="card">
        <DataTable
          columns={columns}
          rows={paged.rows}
          sort={sort}
          onSort={(key, dir) => setSort({ key, dir })}
          emptyTitle="کالا یا خدمتی یافت نشد"
          emptyMessage="اولین کالا یا خدمت خود را تعریف کنید تا صدور فاکتور سریع‌تر شود."
          emptyAction={<Button variant="accent" icon={Plus} onClick={openNew}>افزودن کالا / خدمت</Button>}
          caption="فهرست کالاها و خدمات"
        />
        <Pagination page={paged.page} pages={paged.pages} from={paged.from} to={paged.to} total={paged.total} onPage={setPage} />
      </div>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'افزودن کالا یا خدمت' : 'ویرایش کالا یا خدمت'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>انصراف</Button>
            <Button variant="accent" icon={Package} onClick={save}>ذخیره</Button>
          </>
        }
      >
        <form onSubmit={save} className="stack" style={{ gap: 'var(--s-4)' }}>
          <div className="form-grid">
            <TextField label="نام کالا یا خدمت" required value={form.name} onChange={set('name')} error={errors.name} placeholder="مثلاً مشاوره مالی و حسابداری" />
            <TextField label="کد کالا (SKU)" dir="ltr" value={form.sku} onChange={set('sku')} placeholder="SRV-1001" />
            <Select aria-label="دسته‌بندی" value={form.category} onChange={set('category')} options={PRODUCT_CATEGORIES} />
            <Select aria-label="واحد" value={form.unit} onChange={set('unit')} options={PRODUCT_UNITS} />
            <TextField label={`قیمت خرید (${settings.currency})`} dir="ltr" inputMode="numeric" value={form.purchasePrice} onChange={set('purchasePrice')} />
            <TextField label={`قیمت فروش (${settings.currency})`} required dir="ltr" inputMode="numeric" value={form.salePrice} onChange={set('salePrice')} error={errors.salePrice} />
            <TextField label="نرخ مالیات (٪)" dir="ltr" inputMode="numeric" value={form.taxRate} onChange={set('taxRate')} />
            <TextField label="موجودی" dir="ltr" inputMode="numeric" value={form.stock} onChange={set('stock')} hint="برای خدمات خالی بگذارید" />
            <TextField label="حد هشدار موجودی" dir="ltr" inputMode="numeric" value={form.minStock} onChange={set('minStock')} />
          </div>
          <TextareaField label="توضیحات" rows={2} value={form.description} onChange={set('description')} placeholder="توضیح کوتاه درباره این کالا یا خدمت…" />
          <label className="check">
            <input type="checkbox" checked={Boolean(form.active)} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
            <span>این قلم فعال است و در فاکتور نمایش داده شود</span>
          </label>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={() => { deleteProduct(confirm.id); toast.success(`«${confirm.name}» حذف شد.`); }}
        title="حذف کالا یا خدمت"
        message={`آیا از حذف «${confirm?.name || ''}» مطمئن هستید؟`}
        confirmLabel="حذف کن"
      />
    </>
  );
}
