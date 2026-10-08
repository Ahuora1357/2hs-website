import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight, FileText, Phone, Mail, MapPin, Pencil, Plus, Wallet, Users,
} from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import { PageHeader, Card, CardHead, CardBody } from '../../components/ui/Card.jsx';
import { StatusBadge, Badge, Avatar } from '../../components/ui/Badge.jsx';
import { DetailRow, EmptyState } from '../../components/ui/Misc.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { Select, TextField, TextareaField } from '../../components/ui/Form.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { customerSummary } from '../../lib/metrics.js';
import { formatNumber } from '../../lib/format.js';
import { formatJalali, relativeDay } from '../../lib/date.js';

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { settings } = useSettings();
  const { customers, invoices, receipts, updateCustomer } = useData();

  const customer = customers.find((c) => c.id === id);
  const summary = useMemo(() => (customer ? customerSummary(customer.id, invoices) : null), [customer, invoices]);
  const customerReceipts = useMemo(
    () => receipts.filter((r) => r.customerId === id),
    [receipts, id]
  );

  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({});

  if (!customer) {
    return (
      <EmptyState
        icon={Users}
        title="مشتری یافت نشد"
        message="ممکن است این مشتری حذف شده باشد."
        action={<Button variant="accent" onClick={() => navigate('/app/customers')}>بازگشت به فهرست مشتریان</Button>}
      />
    );
  }

  const openEdit = () => { setForm({ ...customer, creditLimit: customer.creditLimit || '' }); setEditOpen(true); };
  const save = () => {
    updateCustomer(customer.id, { ...form, creditLimit: Number(form.creditLimit) || 0, paymentTerms: Number(form.paymentTerms) || 0 });
    setEditOpen(false);
    toast.success('اطلاعات مشتری به‌روزرسانی شد.');
  };

  const invoiceColumns = [
    { key: 'number', header: 'شماره', render: (r) => <span className="strong num">{r.invoice.number}</span> },
    { key: 'issueDate', header: 'تاریخ', render: (r) => <span className="num">{formatJalali(r.invoice.issueDate)}</span> },
    { key: 'dueDate', header: 'سررسید', render: (r) => <span className="num">{formatJalali(r.invoice.dueDate)}</span> },
    { key: 'total', header: `مبلغ (${settings.currency})`, align: 'end', render: (r) => <span className="num">{formatNumber(r.total)}</span> },
    { key: 'paid', header: 'پرداخت‌شده', align: 'end', render: (r) => <span className="num" style={{ color: 'var(--success-strong)' }}>{formatNumber(r.paid)}</span> },
    { key: 'remaining', header: 'مانده', align: 'end', render: (r) => <span className="num">{formatNumber(r.remaining)}</span> },
    { key: 'status', header: 'وضعیت', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const timeline = [
    ...customerReceipts.map((r) => ({
      id: r.id,
      tone: 'success',
      title: `دریافت ${formatNumber(r.amount)} ${settings.currency} — ${r.method}`,
      meta: `${formatJalali(r.date)} — ${relativeDay(r.date)}`,
    })),
    ...summary.rows.slice(0, 4).map((r) => ({
      id: `inv-${r.invoice.id}`,
      tone: 'brand',
      title: `صدور فاکتور ${r.invoice.number} به مبلغ ${formatNumber(r.total)}`,
      meta: `${formatJalali(r.invoice.issueDate)} — ${relativeDay(r.invoice.issueDate)}`,
    })),
  ].sort((a, b) => (a.id < b.id ? 1 : -1)).slice(0, 8);

  return (
    <>
      <PageHeader
        title={customer.name}
        subtitle={`${customer.type} — ${customer.city || 'بدون شهر'} — ${formatNumber(summary.count)} فاکتور`}
        breadcrumbs={[
          { label: 'داشبورد', to: '/app' },
          { label: 'مشتریان', to: '/app/customers' },
          { label: customer.name },
        ]}
        actions={
          <>
            <Button variant="ghost" icon={ArrowRight} onClick={() => navigate('/app/customers')}>فهرست</Button>
            <Button variant="outline" icon={Pencil} onClick={openEdit}>ویرایش</Button>
            <Button variant="accent" icon={FileText} onClick={() => navigate('/app/invoices/new')}>ایجاد فاکتور</Button>
          </>
        }
      />

      <div className="grid grid--stats" style={{ marginBottom: 'var(--s-5)' }}>
        <div className="stat stat--brand">
          <div className="stat__head"><span className="stat__label">مجموع خرید</span></div>
          <div className="stat__value num">{formatNumber(summary.invoiced)}</div>
          <div className="stat__foot"><span className="stat__hint">{settings.currency}</span></div>
        </div>
        <div className="stat stat--success">
          <div className="stat__head"><span className="stat__label">مجموع پرداخت</span></div>
          <div className="stat__value num">{formatNumber(summary.paid)}</div>
          <div className="stat__foot"><span className="stat__hint">{settings.currency}</span></div>
        </div>
        <div className={`stat ${summary.balance > 0 ? 'stat--danger' : 'stat--success'}`}>
          <div className="stat__head"><span className="stat__label">مانده حساب</span></div>
          <div className="stat__value num">{formatNumber(summary.balance)}</div>
          <div className="stat__foot">
            <span className="stat__hint">{summary.balance > 0 ? 'بدهکار' : 'تسویه‌شده'}</span>
          </div>
        </div>
        <div className="stat stat--indigo">
          <div className="stat__head"><span className="stat__label">حد اعتباری</span></div>
          <div className="stat__value num">{formatNumber(customer.creditLimit)}</div>
          <div className="stat__foot"><span className="stat__hint">مهلت پرداخت: {formatNumber(customer.paymentTerms)} روز</span></div>
        </div>
      </div>

      <div className="grid grid--sidebar">
        <div className="stack" style={{ gap: 'var(--s-5)' }}>
          <Card>
            <CardHead title="فاکتورهای مشتری" icon={FileText} subtitle={`${formatNumber(summary.count)} فاکتور ثبت‌شده`} />
            <CardBody flush>
              <DataTable
                columns={invoiceColumns}
                rows={summary.rows}
                onRowClick={(r) => navigate(`/app/invoices/${r.invoice.id}`)}
                emptyTitle="فاکتوری ثبت نشده"
                emptyMessage="برای این مشتری هنوز فاکتوری صادر نشده است."
                emptyAction={<Button variant="accent" icon={Plus} onClick={() => navigate('/app/invoices/new')}>ایجاد فاکتور</Button>}
                caption={`فاکتورهای ${customer.name}`}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHead title="تاریخچه فعالیت" subtitle="آخرین رویدادهای مالی" />
            <CardBody>
              {timeline.length ? (
                <div className="timeline">
                  {timeline.map((t) => (
                    <div key={t.id} className="timeline__item">
                      <span className={`timeline__dot ${t.tone === 'success' ? 'timeline__dot--success' : ''}`} aria-hidden="true" />
                      <div className="timeline__title">{t.title}</div>
                      <div className="timeline__meta">{t.meta}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={Wallet} title="فعالیتی ثبت نشده" message="با صدور فاکتور یا ثبت دریافت، رویدادها اینجا نمایش داده می‌شوند." compact />
              )}
            </CardBody>
          </Card>
        </div>

        <div className="stack" style={{ gap: 'var(--s-5)' }}>
          <Card>
            <CardHead title="اطلاعات تماس" />
            <CardBody>
              <div className="row gap-3" style={{ marginBottom: 'var(--s-4)' }}>
                <Avatar name={customer.name} size={48} />
                <div>
                  <div className="strong">{customer.contact || customer.name}</div>
                  <Badge tone={customer.type === 'حقوقی' ? 'info' : 'neutral'}>{customer.type}</Badge>
                </div>
              </div>

              <dl>
                <DetailRow label="تلفن">{customer.phone ? <span className="num">{customer.phone}</span> : '—'}</DetailRow>
                <DetailRow label="ایمیل">{customer.email ? <span className="num">{customer.email}</span> : '—'}</DetailRow>
                <DetailRow label="شماره اقتصادی">{customer.nationalId ? <span className="num">{customer.nationalId}</span> : '—'}</DetailRow>
                <DetailRow label="شهر">{customer.city || '—'}</DetailRow>
                <DetailRow label="تاریخ عضویت"><span className="num">{formatJalali(customer.createdAt)}</span></DetailRow>
              </dl>

              {customer.address ? (
                <p className="muted" style={{ marginTop: 'var(--s-4)' }}>
                  <MapPin size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> {customer.address}
                </p>
              ) : null}

              <div className="stack-sm" style={{ marginTop: 'var(--s-5)' }}>
                {customer.phone ? (
                  <Button as="a" href={`tel:${customer.phone}`} variant="outline" icon={Phone} block>تماس تلفنی</Button>
                ) : null}
                {customer.email ? (
                  <Button as="a" href={`mailto:${customer.email}`} variant="outline" icon={Mail} block>ارسال ایمیل</Button>
                ) : null}
              </div>
            </CardBody>
          </Card>

          {customer.notes ? (
            <Card>
              <CardHead title="یادداشت" />
              <CardBody><p className="muted">{customer.notes}</p></CardBody>
            </Card>
          ) : null}
        </div>
      </div>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="ویرایش مشتری"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>انصراف</Button>
            <Button variant="accent" onClick={save}>ذخیره تغییرات</Button>
          </>
        }
      >
        <div className="form-grid">
          <TextField label="نام مشتری" value={form.name || ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Select aria-label="نوع مشتری" value={form.type || 'حقوقی'} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} options={['حقوقی', 'حقیقی']} />
          <TextField label="نام رابط" value={form.contact || ''} onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))} />
          <TextField label="شماره تماس" dir="ltr" value={form.phone || ''} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          <TextField label="ایمیل" dir="ltr" value={form.email || ''} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <TextField label="شماره اقتصادی / ملی" dir="ltr" value={form.nationalId || ''} onChange={(e) => setForm((f) => ({ ...f, nationalId: e.target.value }))} />
          <TextField label="شهر" value={form.city || ''} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
          <TextField label={`حد اعتباری (${settings.currency})`} dir="ltr" value={form.creditLimit || ''} onChange={(e) => setForm((f) => ({ ...f, creditLimit: e.target.value }))} />
          <TextField label="مهلت پرداخت (روز)" dir="ltr" value={form.paymentTerms || ''} onChange={(e) => setForm((f) => ({ ...f, paymentTerms: e.target.value }))} />
        </div>
        <div style={{ marginTop: 'var(--s-4)' }}>
          <TextareaField label="نشانی" rows={2} value={form.address || ''} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
        </div>
        <div style={{ marginTop: 'var(--s-4)' }}>
          <TextareaField label="یادداشت" rows={2} value={form.notes || ''} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
        </div>
      </Modal>
    </>
  );
}
