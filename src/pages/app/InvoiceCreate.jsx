import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Plus, Trash2, Save, Send, Eye, Printer, ArrowRight, Package, Info,
} from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import { PageHeader, Card, CardHead, CardBody } from '../../components/ui/Card.jsx';
import { Select, TextField, TextareaField, Field } from '../../components/ui/Form.jsx';
import { InfoNote, EmptyState } from '../../components/ui/Misc.jsx';
import Modal from '../../components/ui/Modal.jsx';
import JalaliDateInput from '../../components/ui/JalaliDateInput.jsx';
import InvoicePreview from '../../components/invoice/InvoicePreview.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useMoney } from '../../hooks/useMoney.js';
import { invoiceTotals, lineTotals, PAYMENT_METHODS } from '../../lib/calc.js';
import { todayISO, shiftDays } from '../../lib/date.js';
import { formatNumber, toFaDigits } from '../../lib/format.js';
import { uid } from '../../lib/id.js';

function emptyItem() {
  return {
    id: uid('it'),
    productId: '',
    description: '',
    qty: 1,
    unitPrice: 0,
    discount: 0,
    taxRate: 9,
  };
}

export default function InvoiceCreate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { currency } = useMoney();
  const { settings, updateSettings } = useSettings();
  const { customers, products, customerById, addInvoice, updateInvoice, invoices } = useData();

  const editing = Boolean(id);
  const source = editing ? invoices.find((i) => i.id === id) : null;

  const [form, setForm] = useState(() => ({
    number: source?.number || `${settings.invoicePrefix || ''}${String(settings.nextInvoiceNumber || 1).padStart(4, '0')}`,
    customerId: source?.customerId || '',
    issueDate: source?.issueDate || todayISO(),
    dueDate: source?.dueDate || shiftDays(todayISO(), settings.paymentTerms || 30),
    shipping: source?.shipping || 0,
    notes: source?.notes || '',
    terms: source?.terms || 'پرداخت حداکثر تا تاریخ سررسید فاکتور الزامی است.',
    items: source?.items?.length ? source.items : [emptyItem()],
  }));
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing && !source) {
      toast.error('فاکتور مورد نظر یافت نشد.');
      navigate('/app/invoices', { replace: true });
    }
  }, [editing, source, navigate, toast]);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const updateItem = (itemId, patch) => {
    setForm((f) => ({
      ...f,
      items: f.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)),
    }));
  };

  const applyProduct = (itemId, productId) => {
    const product = products.find((p) => p.id === productId);
    if (!product) {
      updateItem(itemId, { productId: '' });
      return;
    }
    updateItem(itemId, {
      productId,
      description: product.name,
      unitPrice: product.salePrice,
      taxRate: product.taxRate,
      qty: form.items.find((i) => i.id === itemId)?.qty || 1,
    });
  };

  const addRow = () => setForm((f) => ({ ...f, items: [...f.items, emptyItem()] }));
  const removeRow = (itemId) => setForm((f) => ({
    ...f,
    items: f.items.length > 1 ? f.items.filter((it) => it.id !== itemId) : f.items,
  }));

  const totals = useMemo(
    () => invoiceTotals({ items: form.items, shipping: form.shipping, payments: [] }),
    [form.items, form.shipping]
  );

  const validate = () => {
    const next = {};
    if (!form.customerId) next.customerId = 'مشتری را انتخاب کنید.';
    if (!form.number.trim()) next.number = 'شماره فاکتور الزامی است.';
    const validItems = form.items.filter((it) => it.description.trim() && Number(it.qty) > 0);
    if (!validItems.length) next.items = 'حداقل یک قلم با شرح و تعداد معتبر لازم است.';
    if (form.dueDate < form.issueDate) next.dueDate = 'تاریخ سررسید نمی‌تواند قبل از تاریخ صدور باشد.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const persist = (status) => {
    if (!validate()) {
      toast.error('لطفاً خطاهای فرم را برطرف کنید.');
      return null;
    }
    setSaving(true);
    const payload = {
      number: form.number.trim(),
      customerId: form.customerId,
      issueDate: form.issueDate,
      dueDate: form.dueDate,
      shipping: Number(form.shipping) || 0,
      notes: form.notes,
      terms: form.terms,
      status,
      items: form.items
        .filter((it) => it.description.trim())
        .map((it) => ({
          ...it,
          qty: Number(it.qty) || 0,
          unitPrice: Number(it.unitPrice) || 0,
          discount: Number(it.discount) || 0,
          taxRate: Number(it.taxRate) || 0,
        })),
    };

    if (editing) {
      updateInvoice(id, payload);
      setSaving(false);
      return id;
    }
    const record = addInvoice({ ...payload, payments: [] });
    updateSettings({ nextInvoiceNumber: (settings.nextInvoiceNumber || 1) + 1 });
    setSaving(false);
    return record.id;
  };

  const handleSave = (status) => {
    const savedId = persist(status);
    if (!savedId) return;
    toast.success(
      status === 'sent' ? 'فاکتور ثبت و به‌عنوان ارسال‌شده علامت‌گذاری شد.' : 'پیش‌نویس فاکتور ذخیره شد.',
      { title: status === 'sent' ? 'فاکتور ارسال شد' : 'ذخیره شد' }
    );
    navigate(`/app/invoices/${savedId}`);
  };

  const previewInvoice = {
    ...form,
    items: form.items.map((it) => ({
      ...it,
      qty: Number(it.qty) || 0,
      unitPrice: Number(it.unitPrice) || 0,
      discount: Number(it.discount) || 0,
      taxRate: Number(it.taxRate) || 0,
    })),
    payments: source?.payments || [],
  };

  return (
    <>
      <PageHeader
        title={editing ? `ویرایش فاکتور ${form.number}` : 'ایجاد فاکتور جدید'}
        subtitle="اقلام را وارد کنید؛ مالیات، تخفیف و جمع کل به‌صورت خودکار محاسبه می‌شود."
        breadcrumbs={[
          { label: 'داشبورد', to: '/app' },
          { label: 'فاکتورها', to: '/app/invoices' },
          { label: editing ? 'ویرایش' : 'فاکتور جدید' },
        ]}
        actions={
          <>
            <Button variant="ghost" icon={ArrowRight} onClick={() => navigate('/app/invoices')}>بازگشت</Button>
            <Button variant="outline" icon={Eye} onClick={() => setPreview(true)}>پیش‌نمایش</Button>
            <Button variant="outline" icon={Printer} onClick={() => { setPreview(true); window.setTimeout(() => window.print(), 350); }}>چاپ</Button>
            <Button variant="outline" icon={Save} loading={saving} onClick={() => handleSave('draft')}>ذخیره پیش‌نویس</Button>
            <Button variant="accent" icon={Send} loading={saving} onClick={() => handleSave('sent')}>
              {editing ? 'ذخیره و ارسال' : 'ثبت و ارسال فاکتور'}
            </Button>
          </>
        }
      />

      <div className="invoice-layout">
        <div className="stack" style={{ gap: 'var(--s-5)' }}>
          <Card>
            <CardHead title="اطلاعات فاکتور" subtitle="مشتری، شماره و تاریخ‌ها" />
            <CardBody>
              <div className="form-grid">
                <SelectFieldWrapper label="مشتری" required error={errors.customerId}>
                  {(props) => (
                    <Select
                      {...props}
                      value={form.customerId}
                      placeholder="انتخاب مشتری…"
                      onChange={(e) => setField('customerId', e.target.value)}
                      options={customers.map((c) => ({ value: c.id, label: `${c.name}${c.city ? ` — ${c.city}` : ''}` }))}
                    />
                  )}
                </SelectFieldWrapper>

                <TextField
                  label="شماره فاکتور"
                  required
                  dir="ltr"
                  value={form.number}
                  onChange={(e) => setField('number', e.target.value)}
                  error={errors.number}
                />

                <JalaliDateInput label="تاریخ صدور" value={form.issueDate} onChange={(v) => setField('issueDate', v)} />
                <div>
                  <JalaliDateInput label="تاریخ سررسید" value={form.dueDate} onChange={(v) => setField('dueDate', v)} />
                  {errors.dueDate ? <p className="field__error" role="alert">{errors.dueDate}</p> : null}
                </div>
              </div>

              {form.customerId && customerById[form.customerId] ? (
                <div className="note note--info" style={{ marginTop: 'var(--s-4)' }}>
                  <Info size={18} className="note__icon" aria-hidden="true" />
                  <div>
                    <div className="note__title">{customerById[form.customerId].name}</div>
                    <div className="note__body">
                      {customerById[form.customerId].phone ? <span className="num">{customerById[form.customerId].phone}</span> : null}
                      {customerById[form.customerId].address ? <span> — {customerById[form.customerId].address}</span> : null}
                    </div>
                  </div>
                </div>
              ) : null}
            </CardBody>
          </Card>

          <Card>
            <CardHead
              title="اقلام فاکتور"
              subtitle="کالا یا خدمت، تعداد، قیمت واحد، تخفیف و مالیات"
              icon={Package}
              actions={<Button variant="outline" size="sm" icon={Plus} onClick={addRow}>افزودن قلم</Button>}
            />
            <CardBody flush>
              <div className="table-wrap">
                <table className="items-table">
                  <thead>
                    <tr>
                      <th style={{ minWidth: 200 }}>کالا / خدمت</th>
                      <th style={{ minWidth: 200 }}>شرح</th>
                      <th style={{ width: 90 }}>تعداد</th>
                      <th style={{ width: 150 }}>قیمت واحد</th>
                      <th style={{ width: 130 }}>تخفیف</th>
                      <th style={{ width: 100 }}>مالیات٪</th>
                      <th style={{ width: 150 }}>مبلغ کل</th>
                      <th style={{ width: 54 }} />
                    </tr>
                  </thead>
                  <tbody>
                    {form.items.map((item) => {
                      const t = lineTotals(item);
                      return (
                        <tr key={item.id} className="items-table__row">
                          <td>
                            <Select
                              aria-label="انتخاب کالا یا خدمت"
                              value={item.productId}
                              placeholder="انتخاب…"
                              onChange={(e) => applyProduct(item.id, e.target.value)}
                              options={products.filter((p) => p.active).map((p) => ({ value: p.id, label: p.name }))}
                            />
                          </td>
                          <td>
                            <input
                              className="input"
                              aria-label="شرح قلم"
                              placeholder="شرح کالا یا خدمت"
                              value={item.description}
                              onChange={(e) => updateItem(item.id, { description: e.target.value })}
                            />
                          </td>
                          <td>
                            <input
                              className="input"
                              dir="ltr"
                              inputMode="decimal"
                              aria-label="تعداد"
                              value={item.qty}
                              onChange={(e) => updateItem(item.id, { qty: e.target.value })}
                            />
                          </td>
                          <td>
                            <input
                              className="input"
                              dir="ltr"
                              inputMode="numeric"
                              aria-label="قیمت واحد"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(item.id, { unitPrice: e.target.value })}
                            />
                          </td>
                          <td>
                            <input
                              className="input"
                              dir="ltr"
                              inputMode="numeric"
                              aria-label="تخفیف"
                              value={item.discount}
                              onChange={(e) => updateItem(item.id, { discount: e.target.value })}
                            />
                          </td>
                          <td>
                            <input
                              className="input"
                              dir="ltr"
                              inputMode="numeric"
                              aria-label="درصد مالیات"
                              value={item.taxRate}
                              onChange={(e) => updateItem(item.id, { taxRate: e.target.value })}
                            />
                          </td>
                          <td className="items-table__num">
                            <span className="num strong">{formatNumber(t.total)}</span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="items-table__remove"
                              onClick={() => removeRow(item.id)}
                              aria-label="حذف قلم"
                              disabled={form.items.length === 1}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {errors.items ? (
                <div style={{ padding: 'var(--s-4)' }}>
                  <p className="field__error" role="alert">{errors.items}</p>
                </div>
              ) : null}

              {!products.length ? (
                <div style={{ padding: 'var(--s-5)' }}>
                  <EmptyState
                    icon={Package}
                    title="کالا یا خدمتی تعریف نشده"
                    message="برای انتخاب سریع اقلام، ابتدا کالا و خدمات خود را تعریف کنید. با این حال می‌توانید شرح را دستی وارد کنید."
                    action={<Button variant="outline" onClick={() => navigate('/app/products')}>مدیریت کالا و خدمات</Button>}
                    compact
                  />
                </div>
              ) : null}
            </CardBody>
          </Card>

          <Card>
            <CardHead title="توضیحات و شرایط" subtitle="متن پاورقی و شرایط پرداخت فاکتور" />
            <CardBody>
              <div className="form-grid">
                <TextareaField
                  label="توضیحات"
                  placeholder="توضیحاتی که روی فاکتور چاپ می‌شود…"
                  value={form.notes}
                  onChange={(e) => setField('notes', e.target.value)}
                />
                <TextareaField
                  label="شرایط پرداخت"
                  value={form.terms}
                  onChange={(e) => setField('terms', e.target.value)}
                />
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="sticky-summary">
          <Card>
            <CardHead title="جمع فاکتور" subtitle="محاسبه خودکار" />
            <CardBody>
              <div className="totals">
                <div className="totals__row">
                  <span>جمع اقلام</span>
                  <span className="num">{formatNumber(totals.subtotal)}</span>
                </div>
                <div className="totals__row">
                  <span>تخفیف</span>
                  <span className="num">−{formatNumber(totals.discount)}</span>
                </div>
                <div className="totals__row">
                  <span>مالیات بر ارزش افزوده</span>
                  <span className="num">{formatNumber(totals.tax)}</span>
                </div>

                <div style={{ marginTop: 'var(--s-3)' }}>
                  <TextField
                    label="هزینه حمل (تومان)"
                    dir="ltr"
                    inputMode="numeric"
                    value={form.shipping}
                    onChange={(e) => setField('shipping', e.target.value)}
                  />
                </div>

                <div className="totals__row totals__row--grand">
                  <span>مبلغ قابل پرداخت</span>
                  <span className="totals__grand num">{formatNumber(totals.total)} {currency}</span>
                </div>
                {source?.payments?.length ? (
                  <>
                    <div className="totals__row">
                      <span>پرداخت‌شده</span>
                      <span className="num" style={{ color: 'var(--success-strong)' }}>{formatNumber(totals.paid)}</span>
                    </div>
                    <div className="totals__row">
                      <span>مانده</span>
                      <span className="num">{formatNumber(totals.remaining)}</span>
                    </div>
                  </>
                ) : null}
              </div>

              <div style={{ marginTop: 'var(--s-5)' }}>
                <InfoNote tone="info">
                  تعداد اقلام: <strong className="num">{toFaDigits(form.items.length)}</strong> — همه
                  محاسبات به‌صورت خودکار و بر اساس نرخ مالیات هر قلم انجام می‌شود.
                </InfoNote>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <Modal
        open={preview}
        onClose={() => setPreview(false)}
        title={`پیش‌نمایش فاکتور ${form.number}`}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPreview(false)}>بستن</Button>
            <Button variant="outline" icon={Printer} onClick={() => window.print()}>چاپ فاکتور</Button>
            <Button variant="accent" icon={Send} onClick={() => { setPreview(false); handleSave('sent'); }}>
              ثبت و ارسال
            </Button>
          </>
        }
      >
        <InvoicePreview
          invoice={previewInvoice}
          customer={customerById[form.customerId]}
          settings={settings}
        />
      </Modal>
    </>
  );
}

/* Small local helper so the customer select keeps the shared field styling */
function SelectFieldWrapper({ label, required, error, children }) {
  return (
    <Field label={label} required={required} error={error}>
      {(props) => children(props)}
    </Field>
  );
}
