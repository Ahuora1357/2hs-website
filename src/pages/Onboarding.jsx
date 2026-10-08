import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Coins, CalendarDays, UserPlus, Package, FileText,
  ChevronLeft, ChevronRight, CircleCheckBig, Sparkles, ArrowRight,
} from 'lucide-react';
import Logo from '../components/brand/Logo.jsx';
import Button from '../components/ui/Button.jsx';
import { TextField, SelectField, Field } from '../components/ui/Form.jsx';
import { ProgressBar, InfoNote } from '../components/ui/Misc.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { BUSINESS_TYPES, PRODUCT_CATEGORIES, PRODUCT_UNITS } from '../lib/data.js';
import { CURRENCY_UNITS } from '../lib/format.js';
import { todayISO, shiftDays } from '../lib/date.js';
import { uid } from '../lib/id.js';

const STEPS = [
  { key: 'business', title: 'کسب‌وکار شما چه نام دارد؟', desc: 'این اطلاعات روی فاکتورهای شما نمایش داده می‌شود.', icon: Building2 },
  { key: 'currency', title: 'واحد پول و سال مالی', desc: 'واحد پول پیش‌فرض و شروع سال مالی خود را انتخاب کنید.', icon: Coins },
  { key: 'customer', title: 'اولین مشتری را اضافه کنید', desc: 'برای صدور فاکتور حداقل به یک مشتری نیاز دارید.', icon: UserPlus },
  { key: 'product', title: 'اولین کالا یا خدمت', desc: 'اقلامی که می‌فروشید را تعریف کنید تا صدور فاکتور سریع شود.', icon: Package },
  { key: 'invoice', title: 'اولین فاکتور شما', desc: 'یک فاکتور نمونه بسازیم تا مسیر کار را ببینید.', icon: FileText },
  { key: 'done', title: 'همه‌چیز آماده است!', desc: 'حساب شما آماده استفاده است.', icon: CircleCheckBig },
];

const FISCAL_YEARS = ['فروردین', 'تیر', 'مهر', 'دی'];

export default function Onboarding() {
  const navigate = useNavigate();
  const toast = useToast();
  const { settings, updateSettings } = useSettings();
  const { addCustomer, addProduct, addInvoice } = useData();
  const { completeOnboarding, user } = useAuth();

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});

  const [business, setBusiness] = useState({
    businessName: settings.businessName === 'شرکت هسین حاسب سپاهان' ? '' : settings.businessName,
    businessType: settings.businessType || BUSINESS_TYPES[0],
  });
  const [currency, setCurrency] = useState({ currency: settings.currency, fiscalYearStart: settings.fiscalYearStart });
  const [customer, setCustomer] = useState({ name: '', type: 'حقوقی', phone: '', email: '' });
  const [product, setProduct] = useState({ name: '', category: PRODUCT_CATEGORIES[0], unit: PRODUCT_UNITS[0], salePrice: '', taxRate: 9 });
  const [invoice, setInvoice] = useState({ qty: 1, dueInDays: 30 });

  const created = useState(() => ({ customer: null, product: null, invoice: null }))[0];

  const progress = ((step + 1) / STEPS.length) * 100;
  const current = STEPS[step];

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const validateAndAdvance = () => {
    const nextErrors = {};
    if (current.key === 'business') {
      if (!business.businessName.trim()) nextErrors.businessName = 'نام کسب‌وکار را وارد کنید.';
      if (Object.keys(nextErrors).length) {
        setErrors(nextErrors);
        return;
      }
      updateSettings({ businessName: business.businessName.trim(), businessType: business.businessType });
    }

    if (current.key === 'currency') {
      updateSettings({ currency: currency.currency, fiscalYearStart: currency.fiscalYearStart });
    }

    if (current.key === 'customer') {
      if (!customer.name.trim()) {
        setErrors({ name: 'نام مشتری را وارد کنید.' });
        return;
      }
      created.customer = addCustomer({
        name: customer.name.trim(),
        type: customer.type,
        phone: customer.phone,
        email: customer.email,
        contact: '',
        nationalId: '',
        city: '',
        address: '',
        creditLimit: 0,
        paymentTerms: 30,
        notes: 'ایجادشده در راه‌اندازی اولیه',
      });
    }

    if (current.key === 'product') {
      if (!product.name.trim()) {
        setErrors({ name: 'نام کالا یا خدمت را وارد کنید.' });
        return;
      }
      created.product = addProduct({
        name: product.name.trim(),
        sku: '',
        category: product.category,
        unit: product.unit,
        purchasePrice: 0,
        salePrice: Number(product.salePrice) || 0,
        taxRate: Number(product.taxRate) || 0,
        stock: null,
        minStock: null,
        description: 'ایجادشده در راه‌اندازی اولیه',
        active: true,
      });
    }

    if (current.key === 'invoice') {
      const price = Number(product.salePrice) || 1000000;
      created.invoice = addInvoice({
        number: `${settings.invoicePrefix || ''}${String(settings.nextInvoiceNumber || 1).padStart(4, '0')}`,
        customerId: created.customer?.id,
        issueDate: todayISO(),
        dueDate: shiftDays(todayISO(), Number(invoice.dueInDays) || 30),
        status: 'sent',
        items: [
          {
            id: uid('it'),
            productId: created.product?.id,
            description: product.name.trim() || 'خدمات',
            qty: Number(invoice.qty) || 1,
            unitPrice: price,
            discount: 0,
            taxRate: Number(product.taxRate) || 0,
          },
        ],
        shipping: 0,
        notes: 'اولین فاکتور شما در 2HS',
        terms: 'پرداخت حداکثر تا تاریخ سررسید فاکتور الزامی است.',
        payments: [],
      });
      updateSettings({ nextInvoiceNumber: (settings.nextInvoiceNumber || 1) + 1 });
      toast.success('اولین فاکتور شما ساخته شد.', { title: 'آفرین!' });
    }

    setErrors({});
    next();
  };

  const finish = () => {
    completeOnboarding();
    toast.success('راه‌اندازی کامل شد. به داشبورد خوش آمدید!', { title: 'آماده شروع' });
    navigate('/app', { replace: true });
  };

  return (
    <div className="onboarding">
      <div className="onboarding__top">
        <Logo size={40} />
        <div style={{ flex: 1, maxWidth: 320 }}>
          <ProgressBar value={progress} label="پیشرفت راه‌اندازی" />
          <p className="faint" style={{ marginTop: 6 }}>
            گام <span className="num">{step + 1}</span> از <span className="num">{STEPS.length}</span>
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={finish}>
          رد کردن راه‌اندازی
        </Button>
      </div>

      <div className="onboarding__card">
        <div className="row gap-4" style={{ marginBottom: 'var(--s-3)' }}>
          <span className="usecase__icon" aria-hidden="true"><current.icon size={22} /></span>
          <div>
            <h1 className="onboarding__title" style={{ fontSize: 'var(--fs-3xl)' }}>{current.title}</h1>
            <p className="onboarding__desc" style={{ fontSize: 'var(--fs-md)' }}>{current.desc}</p>
          </div>
        </div>

        {user?.name ? (
          <InfoNote tone="info">
            {user.name} عزیز، چند قدم کوتاه تا آماده‌شدن حساب شما باقی مانده است.
          </InfoNote>
        ) : null}

        <div className="onboarding__body">
          {current.key === 'business' ? (
            <div className="form-grid">
              <TextField
                label="نام کسب‌وکار"
                required
                placeholder="مثلاً شرکت پارس تجارت"
                value={business.businessName}
                onChange={(e) => setBusiness((b) => ({ ...b, businessName: e.target.value }))}
                error={errors.businessName}
              />
              <SelectField
                label="نوع کسب‌وکار"
                value={business.businessType}
                onChange={(e) => setBusiness((b) => ({ ...b, businessType: e.target.value }))}
                options={BUSINESS_TYPES}
              />
            </div>
          ) : null}

          {current.key === 'currency' ? (
            <div className="form-grid">
              <Field label="واحد پول">
                {(props) => (
                  <>
                    <div className="choice-grid">
                      {CURRENCY_UNITS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          className={`choice ${currency.currency === c ? 'is-active' : ''}`}
                          onClick={() => setCurrency((v) => ({ ...v, currency: c }))}
                          aria-pressed={currency.currency === c}
                        >
                          <span className="choice__icon" aria-hidden="true"><Coins size={17} /></span>
                          <span className="choice__label">{c}</span>
                        </button>
                      ))}
                    </div>
                    {props['aria-describedby'] ? null : null}
                  </>
                )}
              </Field>
              <SelectField
                label="شروع سال مالی"
                value={currency.fiscalYearStart}
                onChange={(e) => setCurrency((v) => ({ ...v, fiscalYearStart: e.target.value }))}
                options={FISCAL_YEARS}
                hint="پیش‌فرض سیستم: فروردین"
              />
            </div>
          ) : null}

          {current.key === 'customer' ? (
            <div className="form-grid">
              <TextField
                label="نام مشتری"
                required
                placeholder="مثلاً شرکت فولاد سپاهان"
                value={customer.name}
                onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))}
                error={errors.name}
              />
              <SelectField
                label="نوع مشتری"
                value={customer.type}
                onChange={(e) => setCustomer((c) => ({ ...c, type: e.target.value }))}
                options={['حقوقی', 'حقیقی']}
              />
              <TextField
                label="شماره تماس"
                dir="ltr"
                placeholder="031-00000000"
                value={customer.phone}
                onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value }))}
              />
              <TextField
                label="ایمیل"
                dir="ltr"
                type="email"
                placeholder="info@example.com"
                value={customer.email}
                onChange={(e) => setCustomer((c) => ({ ...c, email: e.target.value }))}
              />
            </div>
          ) : null}

          {current.key === 'product' ? (
            <div className="form-grid">
              <TextField
                label="نام کالا یا خدمت"
                required
                placeholder="مثلاً مشاوره مالی و حسابداری"
                value={product.name}
                onChange={(e) => setProduct((p) => ({ ...p, name: e.target.value }))}
                error={errors.name}
              />
              <SelectField
                label="دسته‌بندی"
                value={product.category}
                onChange={(e) => setProduct((p) => ({ ...p, category: e.target.value }))}
                options={PRODUCT_CATEGORIES}
              />
              <TextField
                label="قیمت فروش (تومان)"
                dir="ltr"
                inputMode="numeric"
                placeholder="1200000"
                value={product.salePrice}
                onChange={(e) => setProduct((p) => ({ ...p, salePrice: e.target.value }))}
              />
              <SelectField
                label="واحد"
                value={product.unit}
                onChange={(e) => setProduct((p) => ({ ...p, unit: e.target.value }))}
                options={PRODUCT_UNITS}
              />
              <TextField
                label="نرخ مالیات (٪)"
                dir="ltr"
                inputMode="numeric"
                value={product.taxRate}
                onChange={(e) => setProduct((p) => ({ ...p, taxRate: e.target.value }))}
              />
            </div>
          ) : null}

          {current.key === 'invoice' ? (
            <div className="form-grid">
              <div className="note note--info" style={{ gridColumn: '1 / -1' }}>
                <Sparkles size={18} className="note__icon" aria-hidden="true" />
                <div>
                  <div className="note__title">فاکتور نمونه آماده ساخت است</div>
                  <div className="note__body">
                    مشتری: <strong>{customer.name || '—'}</strong> — قلم: <strong>{product.name || '—'}</strong>
                  </div>
                </div>
              </div>
              <TextField
                label="تعداد"
                dir="ltr"
                inputMode="numeric"
                value={invoice.qty}
                onChange={(e) => setInvoice((v) => ({ ...v, qty: e.target.value }))}
              />
              <TextField
                label="مهلت پرداخت (روز)"
                dir="ltr"
                inputMode="numeric"
                value={invoice.dueInDays}
                onChange={(e) => setInvoice((v) => ({ ...v, dueInDays: e.target.value }))}
              />
            </div>
          ) : null}

          {current.key === 'done' ? (
            <div className="center">
              <div className="done-check" aria-hidden="true"><CircleCheckBig size={36} /></div>
              <h2 style={{ fontSize: 'var(--fs-2xl)' }}>حساب شما آماده است</h2>
              <p className="muted" style={{ marginTop: 'var(--s-2)' }}>
                کسب‌وکار، واحد پول، مشتری، کالا و اولین فاکتور شما ثبت شد. از این پس می‌توانید
                فاکتور صادر کنید و گزارش‌های مالی را ببینید.
              </p>
            </div>
          ) : null}
        </div>

        <div className="onboarding__foot">
          <Button variant="ghost" onClick={back} disabled={step === 0} icon={ChevronRight}>
            مرحله قبل
          </Button>

          {current.key === 'done' ? (
            <Button variant="accent" size="lg" onClick={finish} icon={ArrowRight}>
              ورود به داشبورد
            </Button>
          ) : (
            <Button variant="primary" size="lg" onClick={validateAndAdvance} icon={ChevronLeft} iconEnd={undefined}>
              {step === STEPS.length - 2 ? 'ساخت فاکتور نمونه' : 'مرحله بعد'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
