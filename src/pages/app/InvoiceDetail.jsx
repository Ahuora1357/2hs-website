import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight, Printer, Download, Send, Pencil, Copy, Ban, Trash2,
  Wallet, User, Phone, Mail, MapPin, Plus, CircleCheckBig,
} from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import { PageHeader, Card, CardHead, CardBody } from '../../components/ui/Card.jsx';
import { ConfirmDialog, default as Modal } from '../../components/ui/Modal.jsx';
import { StatusBadge, Badge } from '../../components/ui/Badge.jsx';
import { DetailRow, InfoNote, EmptyState } from '../../components/ui/Misc.jsx';
import { Select, TextField } from '../../components/ui/Form.jsx';
import JalaliDateInput from '../../components/ui/JalaliDateInput.jsx';
import InvoicePreview from '../../components/invoice/InvoicePreview.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { invoiceTotals, resolveStatus, PAYMENT_METHODS } from '../../lib/calc.js';
import { formatJalali, relativeDay, todayISO } from '../../lib/date.js';
import { formatNumber } from '../../lib/format.js';

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { settings } = useSettings();
  const {
    invoices, customerById, accounts,
    setInvoiceStatus, deleteInvoice, duplicateInvoice, recordReceipt,
  } = useData();

  const invoice = invoices.find((i) => i.id === id);
  const customer = invoice ? customerById[invoice.customerId] : null;
  const totals = useMemo(() => (invoice ? invoiceTotals(invoice) : null), [invoice]);

  const [payOpen, setPayOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [payForm, setPayForm] = useState({
    amount: '', date: todayISO(), method: PAYMENT_METHODS[0], reference: '', notes: '', accountId: '',
  });
  const [payError, setPayError] = useState('');

  if (!invoice) {
    return (
      <EmptyState
        icon={Wallet}
        title="فاکتور یافت نشد"
        message="ممکن است این فاکتور حذف شده باشد."
        action={<Button variant="accent" onClick={() => navigate('/app/invoices')}>بازگشت به فهرست فاکتورها</Button>}
      />
    );
  }

  const status = resolveStatus(invoice);

  const openPayment = () => {
    setPayForm({
      amount: totals.remaining > 0 ? String(totals.remaining) : '',
      date: todayISO(),
      method: PAYMENT_METHODS[0],
      reference: '',
      notes: '',
      accountId: accounts[0]?.id || '',
    });
    setPayError('');
    setPayOpen(true);
  };

  const submitPayment = (e) => {
    e.preventDefault();
    const amount = Number(payForm.amount);
    if (!amount || amount <= 0) {
      setPayError('مبلغ دریافت باید بزرگ‌تر از صفر باشد.');
      return;
    }
    recordReceipt({
      invoiceId: invoice.id,
      amount,
      date: payForm.date,
      method: payForm.method,
      reference: payForm.reference,
      notes: payForm.notes,
      accountId: payForm.accountId || null,
    });
    setPayOpen(false);
    toast.success('دریافت ثبت شد و مانده فاکتور به‌روزرسانی شد.', { title: 'ثبت دریافت' });
  };

  const timeline = [
    ...(invoice.payments || []).map((p) => ({
      id: p.id,
      tone: 'success',
      title: `دریافت ${formatNumber(p.amount)} ${settings.currency} — ${p.method}`,
      meta: `${formatJalali(p.date)} — ${relativeDay(p.date)}`,
    })),
    {
      id: 'issued',
      tone: 'brand',
      title: `صدور فاکتور ${invoice.number}`,
      meta: `${formatJalali(invoice.issueDate)} — ${relativeDay(invoice.issueDate)}`,
    },
  ].sort((a, b) => (a.id < b.id ? 1 : -1));

  return (
    <>
      <PageHeader
        title={`فاکتور ${invoice.number}`}
        subtitle={`${customer?.name || '—'} — مبلغ کل ${formatNumber(totals.total)} ${settings.currency}`}
        breadcrumbs={[
          { label: 'داشبورد', to: '/app' },
          { label: 'فاکتورها', to: '/app/invoices' },
          { label: invoice.number },
        ]}
        actions={
          <>
            <Button variant="ghost" icon={ArrowRight} onClick={() => navigate('/app/invoices')}>فهرست</Button>
            <Button variant="outline" icon={Printer} onClick={() => window.print()}>چاپ</Button>
            <Button variant="outline" icon={Download} onClick={() => toast.success('فایل PDF فاکتور آماده دانلود است.', { title: 'خروجی PDF' })}>PDF</Button>
            <Button variant="outline" icon={Pencil} onClick={() => navigate(`/app/invoices/${invoice.id}/edit`)}>ویرایش</Button>
            {status === 'draft' ? (
              <Button variant="accent" icon={Send} onClick={() => { setInvoiceStatus(invoice.id, 'sent'); toast.success('فاکتور به‌عنوان ارسال‌شده علامت‌گذاری شد.'); }}>
                ثبت و ارسال
              </Button>
            ) : null}
            {totals.remaining > 0 && status !== 'cancelled' ? (
              <Button variant="success" icon={Wallet} onClick={openPayment}>ثبت دریافت</Button>
            ) : null}
          </>
        }
      />

      <div className="invoice-layout">
        <div>
          <InvoicePreview invoice={invoice} customer={customer} settings={settings} />
        </div>

        <div className="stack" style={{ gap: 'var(--s-5)' }}>
          <Card>
            <CardHead title="وضعیت فاکتور" actions={<StatusBadge status={status} />} />
            <CardBody>
              <div className="totals">
                <div className="totals__row"><span>مبلغ کل</span><span className="num strong">{formatNumber(totals.total)}</span></div>
                <div className="totals__row"><span>پرداخت‌شده</span><span className="num" style={{ color: 'var(--success-strong)' }}>{formatNumber(totals.paid)}</span></div>
                <div className="totals__row totals__row--grand">
                  <span>مانده</span>
                  <span className="num" style={{ color: totals.remaining > 0 ? 'var(--danger)' : 'var(--success-strong)' }}>
                    {formatNumber(totals.remaining)}
                  </span>
                </div>
              </div>

              <div className="stack-sm" style={{ marginTop: 'var(--s-5)' }}>
                <div className="row gap-2">
                  <Badge tone="neutral">صدور: <span className="num">{formatJalali(invoice.issueDate)}</span></Badge>
                  <Badge tone="warning">سررسید: <span className="num">{formatJalali(invoice.dueDate)}</span></Badge>
                </div>
              </div>

              {status === 'paid' ? (
                <div style={{ marginTop: 'var(--s-5)' }}>
                  <InfoNote tone="success" icon={CircleCheckBig}>
                    این فاکتور به‌طور کامل تسویه شده است.
                  </InfoNote>
                </div>
              ) : null}
            </CardBody>
          </Card>

          <Card>
            <CardHead title="مشتری" icon={User} />
            <CardBody>
              <div className="stack-sm">
                <div className="strong">{customer?.name || '—'}</div>
                {customer?.contact ? <div className="muted">رابط: {customer.contact}</div> : null}
                {customer?.phone ? (
                  <div className="row gap-2 faint"><Phone size={14} /> <span className="num">{customer.phone}</span></div>
                ) : null}
                {customer?.email ? (
                  <div className="row gap-2 faint"><Mail size={14} /> <span className="num">{customer.email}</span></div>
                ) : null}
                {customer?.address ? (
                  <div className="row gap-2 faint"><MapPin size={14} /> <span>{customer.address}</span></div>
                ) : null}
              </div>
              <Button
                variant="outline"
                size="sm"
                block
                style={{ marginTop: 'var(--s-4)' }}
                onClick={() => navigate(`/app/customers/${customer?.id}`)}
              >
                مشاهده پروفایل مشتری
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardHead title="تاریخچه عملیات" />
            <CardBody>
              <div className="timeline">
                {timeline.map((t) => (
                  <div key={t.id} className="timeline__item">
                    <span className={`timeline__dot timeline__dot--${t.tone === 'brand' ? '' : t.tone}`} aria-hidden="true" />
                    <div className="timeline__title">{t.title}</div>
                    <div className="timeline__meta">{t.meta}</div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card className="no-print">
            <CardHead title="عملیات دیگر" />
            <CardBody>
              <div className="stack-sm">
                <Button
                  variant="outline"
                  icon={Copy}
                  block
                  onClick={() => {
                    const copy = duplicateInvoice(invoice.id);
                    toast.success('نسخه کپی فاکتور ساخته شد.');
                    if (copy?.id) navigate(`/app/invoices/${copy.id}`);
                  }}
                >
                  تکثیر فاکتور
                </Button>
                <Button
                  variant="outline"
                  icon={Ban}
                  block
                  disabled={invoice.status === 'cancelled'}
                  onClick={() => { setInvoiceStatus(invoice.id, 'cancelled'); toast.warning('فاکتور لغو شد.'); }}
                >
                  لغو فاکتور
                </Button>
                <Button variant="danger" icon={Trash2} block onClick={() => setConfirmDelete(true)}>
                  حذف فاکتور
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <Modal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        title="ثبت دریافت از مشتری"
        description={`فاکتور ${invoice.number} — مانده فعلی ${formatNumber(totals.remaining)} ${settings.currency}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setPayOpen(false)}>انصراف</Button>
            <Button variant="success" icon={Plus} onClick={submitPayment}>ثبت دریافت</Button>
          </>
        }
      >
        <form onSubmit={submitPayment} className="stack" style={{ gap: 'var(--s-4)' }}>
          <div className="form-grid">
            <TextField
              label="مبلغ دریافت"
              required
              dir="ltr"
              inputMode="numeric"
              value={payForm.amount}
              onChange={(e) => setPayForm((f) => ({ ...f, amount: e.target.value }))}
              error={payError}
            />
            <JalaliDateInput
              label="تاریخ دریافت"
              value={payForm.date}
              onChange={(v) => setPayForm((f) => ({ ...f, date: v }))}
            />
            <Select
              aria-label="روش پرداخت"
              value={payForm.method}
              onChange={(e) => setPayForm((f) => ({ ...f, method: e.target.value }))}
              options={PAYMENT_METHODS}
            />
            <Select
              aria-label="حساب مقصد"
              value={payForm.accountId}
              placeholder="بدون واریز به حساب"
              onChange={(e) => setPayForm((f) => ({ ...f, accountId: e.target.value }))}
              options={accounts.map((a) => ({ value: a.id, label: `${a.name} — ${formatNumber(a.balance)}` }))}
            />
          </div>
          <TextField
            label="شماره پیگیری / مرجع"
            dir="ltr"
            placeholder="مثلاً TRX-99871"
            value={payForm.reference}
            onChange={(e) => setPayForm((f) => ({ ...f, reference: e.target.value }))}
          />
          <TextField
            label="یادداشت"
            placeholder="توضیح اختیاری"
            value={payForm.notes}
            onChange={(e) => setPayForm((f) => ({ ...f, notes: e.target.value }))}
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => { deleteInvoice(invoice.id); toast.success('فاکتور حذف شد.'); navigate('/app/invoices'); }}
        title="حذف فاکتور"
        message={`آیا از حذف فاکتور ${invoice.number} مطمئن هستید؟ این عملیات قابل بازگشت نیست.`}
        confirmLabel="حذف کن"
      />
    </>
  );
}
