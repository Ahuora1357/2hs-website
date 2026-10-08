import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Image, Phone, FileText, Hash, Percent, Coins, CalendarDays,
  Users, Bell, CreditCard, ShieldCheck, DatabaseBackup, Save, Download,
  Upload, RotateCcw, Trash2, ShieldAlert,
} from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import { PageHeader, Card, CardBody, CardHead } from '../../components/ui/Card.jsx';
import { Select, TextField, TextareaField, Switch } from '../../components/ui/Form.jsx';
import { InfoNote, Segmented } from '../../components/ui/Misc.jsx';
import { LogoMark } from '../../components/brand/Logo.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { BUSINESS_TYPES } from '../../lib/data.js';
import { CURRENCY_UNITS } from '../../lib/format.js';
import { PAYMENT_METHODS } from '../../lib/calc.js';

const SECTIONS = [
  { id: 'business', label: 'اطلاعات کسب‌وکار', icon: Building2 },
  { id: 'brand', label: 'لوگو و هویت برند', icon: Image },
  { id: 'contact', label: 'اطلاعات تماس', icon: Phone },
  { id: 'invoice', label: 'تنظیمات فاکتور', icon: FileText },
  { id: 'numbering', label: 'شماره‌گذاری فاکتورها', icon: Hash },
  { id: 'tax', label: 'مالیات', icon: Percent },
  { id: 'currency', label: 'واحد پول و تقویم', icon: Coins },
  { id: 'users', label: 'کاربران و دسترسی‌ها', icon: Users },
  { id: 'notifications', label: 'اعلان‌ها', icon: Bell },
  { id: 'payments', label: 'روش‌های پرداخت', icon: CreditCard },
  { id: 'security', label: 'امنیت', icon: ShieldCheck },
  { id: 'backup', label: 'پشتیبان‌گیری', icon: DatabaseBackup },
];

export default function Settings() {
  const navigate = useNavigate();
  const toast = useToast();
  const { settings, updateSettings, resetSettings } = useSettings();
  const { resetDemo, exportData, importData } = useData();

  const [active, setActive] = useState('business');
  const [draft, setDraft] = useState(settings);
  const [password, setPassword] = useState({ current: '', next: '', confirm: '' });
  const fileRef = useRef(null);

  const set = (key) => (e) => setDraft((d) => ({ ...d, [key]: e.target.value }));
  const dirty = JSON.stringify(draft) !== JSON.stringify(settings);

  const save = () => {
    updateSettings(draft);
    toast.success('تنظیمات با موفقیت ذخیره شد.', { title: 'ذخیره شد' });
  };

  const toggleMethod = (method) => {
    setDraft((d) => {
      const list = d.paymentMethods || [];
      return {
        ...d,
        paymentMethods: list.includes(method) ? list.filter((m) => m !== method) : [...list, method],
      };
    });
  };

  const changePassword = (e) => {
    e.preventDefault();
    if (!password.current) { toast.error('رمز عبور فعلی را وارد کنید.'); return; }
    if (password.next.length < 6) { toast.error('رمز عبور جدید باید حداقل ۶ کاراکتر باشد.'); return; }
    if (password.next !== password.confirm) { toast.error('تکرار رمز عبور مطابقت ندارد.'); return; }
    setPassword({ current: '', next: '', confirm: '' });
    toast.success('رمز عبور شما تغییر کرد.', { title: 'تغییر موفق' });
  };

  const download = () => {
    const blob = new Blob([exportData()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `2hs-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    toast.success('فایل پشتیبان دانلود شد.', { title: 'پشتیبان‌گیری' });
  };

  const onImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importData(String(reader.result));
        toast.success('داده‌های پشتیبان بازگردانی شد.', { title: 'بازگردانی موفق' });
      } catch (err) {
        toast.error(err.message || 'فایل پشتیبان معتبر نیست.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <>
      <PageHeader
        title="تنظیمات"
        subtitle="پیکربندی هویت کسب‌وکار، فاکتورها، مالیات و امنیت"
        breadcrumbs={[{ label: 'داشبورد', to: '/app' }, { label: 'تنظیمات' }]}
        actions={
          <Button variant="accent" icon={Save} disabled={!dirty} onClick={save}>
            {dirty ? 'ذخیره تغییرات' : 'تغییرات ذخیره شده'}
          </Button>
        }
      />

      <div className="settings-layout">
        <nav className="card settings-nav" style={{ padding: 'var(--s-3)' }} aria-label="بخش‌های تنظیمات">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`settings-nav__item ${active === s.id ? 'is-active' : ''}`}
              onClick={() => setActive(s.id)}
              aria-current={active === s.id ? 'true' : undefined}
            >
              <s.icon size={17} aria-hidden="true" />
              <span>{s.label}</span>
            </button>
          ))}
        </nav>

        <div>
          {active === 'business' ? (
            <Card>
              <CardHead title="اطلاعات کسب‌وکار" subtitle="این اطلاعات روی فاکتورها و گزارش‌ها نمایش داده می‌شود" icon={Building2} />
              <CardBody>
                <div className="form-grid">
                  <TextField label="نام کسب‌وکار" value={draft.businessName} onChange={set('businessName')} />
                  <Select aria-label="نوع کسب‌وکار" value={draft.businessType} onChange={set('businessType')} options={BUSINESS_TYPES} />
                  <TextField label="شماره اقتصادی / شناسه ملی" dir="ltr" value={draft.nationalId} onChange={set('nationalId')} />
                  <TextField label="شماره مالیاتی" dir="ltr" value={draft.taxNumber} onChange={set('taxNumber')} />
                </div>
              </CardBody>
            </Card>
          ) : null}

          {active === 'brand' ? (
            <Card>
              <CardHead title="لوگو و هویت برند" subtitle="ظاهر برند شما در فاکتورها و سیستم" icon={Image} />
              <CardBody>
                <div className="row gap-4 wrap" style={{ marginBottom: 'var(--s-5)' }}>
                  <LogoMark size={64} />
                  <div>
                    <div className="strong">{draft.businessName}</div>
                    <div className="faint">پیش‌نمایش نشان برند در فاکتور</div>
                  </div>
                </div>
                <div className="form-grid">
                  <TextField
                    label="متن نشانه (مونوگرام)"
                    value={draft.logoText}
                    onChange={set('logoText')}
                    hint="حداکثر ۴ کاراکتر — روی فاکتور و هدر نمایش داده می‌شود"
                  />
                </div>
                <div style={{ marginTop: 'var(--s-4)' }}>
                  <TextareaField
                    label="پاورقی فاکتور"
                    rows={2}
                    value={draft.invoiceFooter}
                    onChange={set('invoiceFooter')}
                    hint="این متن در پایین همه فاکتورهای چاپی نمایش داده می‌شود"
                  />
                </div>
                <div style={{ marginTop: 'var(--s-5)' }}>
                  <InfoNote tone="info" icon={Image}>
                    امکان بارگذاری فایل لوگو (PNG/SVG) در نسخه بعدی فعال می‌شود؛ در حال حاضر نشان
                    گرافیکی 2HS با رنگ‌های برند روی فاکتورها استفاده می‌شود.
                  </InfoNote>
                </div>
              </CardBody>
            </Card>
          ) : null}

          {active === 'contact' ? (
            <Card>
              <CardHead title="اطلاعات تماس" subtitle="راه‌های ارتباطی کسب‌وکار" icon={Phone} />
              <CardBody>
                <div className="form-grid">
                  <TextField label="تلفن" dir="ltr" value={draft.phone} onChange={set('phone')} />
                  <TextField label="ایمیل" dir="ltr" value={draft.email} onChange={set('email')} />
                  <TextField label="وب‌سایت" dir="ltr" value={draft.website} onChange={set('website')} />
                </div>
                <div style={{ marginTop: 'var(--s-4)' }}>
                  <TextareaField label="نشانی" rows={2} value={draft.address} onChange={set('address')} />
                </div>
              </CardBody>
            </Card>
          ) : null}

          {active === 'invoice' ? (
            <Card>
              <CardHead title="تنظیمات فاکتور" subtitle="مقادیر پیش‌فرض هنگام صدور فاکتور" icon={FileText} />
              <CardBody>
                <div className="form-grid">
                  <TextField
                    label="مهلت پرداخت پیش‌فرض (روز)"
                    dir="ltr"
                    inputMode="numeric"
                    value={draft.paymentTerms}
                    onChange={(e) => setDraft((d) => ({ ...d, paymentTerms: e.target.value }))}
                  />
                  <TextField
                    label="نرخ مالیات پیش‌فرض (٪)"
                    dir="ltr"
                    inputMode="numeric"
                    value={draft.defaultTaxRate}
                    onChange={(e) => setDraft((d) => ({ ...d, defaultTaxRate: e.target.value }))}
                  />
                </div>
                <div style={{ marginTop: 'var(--s-4)' }}>
                  <TextareaField
                    label="شرایط پرداخت پیش‌فرض"
                    rows={2}
                    value={draft.invoiceFooter}
                    onChange={set('invoiceFooter')}
                    hint="در فاکتورهای جدید به‌صورت پیش‌فرض درج می‌شود"
                  />
                </div>
              </CardBody>
            </Card>
          ) : null}

          {active === 'numbering' ? (
            <Card>
              <CardHead title="شماره‌گذاری فاکتورها" subtitle="الگوی تولید شماره فاکتور" icon={Hash} />
              <CardBody>
                <div className="form-grid">
                  <TextField label="پیشوند شماره فاکتور" dir="ltr" value={draft.invoicePrefix} onChange={set('invoicePrefix')} hint="مثلاً 1405-" />
                  <TextField
                    label="شماره فاکتور بعدی"
                    dir="ltr"
                    inputMode="numeric"
                    value={draft.nextInvoiceNumber}
                    onChange={(e) => setDraft((d) => ({ ...d, nextInvoiceNumber: Number(e.target.value) || 1 }))}
                  />
                </div>
                <div style={{ marginTop: 'var(--s-4)' }}>
                  <InfoNote tone="info">
                    نمونه شماره فاکتور بعدی:{' '}
                    <strong className="num">
                      {draft.invoicePrefix}
                      {String(draft.nextInvoiceNumber || 1).padStart(4, '0')}
                    </strong>
                  </InfoNote>
                </div>
              </CardBody>
            </Card>
          ) : null}

          {active === 'tax' ? (
            <Card>
              <CardHead title="مالیات" subtitle="نرخ مالیات بر ارزش افزوده" icon={Percent} />
              <CardBody>
                <div className="form-grid">
                  <TextField
                    label="نرخ مالیات پیش‌فرض (٪)"
                    dir="ltr"
                    inputMode="numeric"
                    value={draft.defaultTaxRate}
                    onChange={(e) => setDraft((d) => ({ ...d, defaultTaxRate: e.target.value }))}
                  />
                </div>
                <div style={{ marginTop: 'var(--s-4)' }}>
                  <InfoNote tone="warning" icon={ShieldAlert}>
                    نرخ مالیات هر قلم را می‌توانید در زمان صدور فاکتور به‌صورت جداگانه تغییر دهید. گزارش
                    مالیات در بخش گزارش‌های مالی قابل مشاهده و چاپ است.
                  </InfoNote>
                </div>
              </CardBody>
            </Card>
          ) : null}

          {active === 'currency' ? (
            <Card>
              <CardHead title="واحد پول و تقویم" subtitle="پیکربندی نمایش مبالغ و تاریخ" icon={Coins} />
              <CardBody>
                <div className="form-grid">
                  <Select aria-label="واحد پول" value={draft.currency} onChange={set('currency')} options={CURRENCY_UNITS} />
                  <Select
                    aria-label="تقویم"
                    value={draft.calendar}
                    onChange={set('calendar')}
                    options={['شمسی', 'میلادی']}
                  />
                  <Select
                    aria-label="شروع سال مالی"
                    value={draft.fiscalYearStart}
                    onChange={set('fiscalYearStart')}
                    options={['فروردین', 'تیر', 'مهر', 'دی']}
                  />
                </div>
                <div style={{ marginTop: 'var(--s-4)' }}>
                  <InfoNote tone="info">
                    تقویم پیش‌فرض شمسی است. تغییر واحد پول، برچسب تمام گزارش‌ها و فاکتورها را به‌روزرسانی
                    می‌کند.
                  </InfoNote>
                </div>
              </CardBody>
            </Card>
          ) : null}

          {active === 'users' ? (
            <Card>
              <CardHead title="کاربران و دسترسی‌ها" subtitle="مدیریت اعضای تیم و سطوح دسترسی" icon={Users} />
              <CardBody>
                <p className="muted">
                  مدیریت کاربران، نقش‌ها و ماتریس دسترسی در صفحه اختصاصی «کاربران و دسترسی‌ها» انجام
                  می‌شود. در آنجا می‌توانید کاربر جدید اضافه کنید و تعیین کنید هر نقش به کدام بخش‌ها
                  دسترسی داشته باشد.
                </p>
                <Button variant="outline" icon={Users} style={{ marginTop: 'var(--s-4)' }} onClick={() => navigate('/app/users')}>
                  رفتن به مدیریت کاربران
                </Button>
              </CardBody>
            </Card>
          ) : null}

          {active === 'notifications' ? (
            <Card>
              <CardHead title="اعلان‌ها" subtitle="انتخاب کنید چه رویدادهایی به شما اطلاع داده شود" icon={Bell} />
              <CardBody>
                <div className="stack" style={{ gap: 'var(--s-5)' }}>
                  {[
                    ['overdue', 'هشدار فاکتورهای سررسیدشده', 'وقتی فاکتوری از تاریخ سررسید عبور کند'],
                    ['lowStock', 'هشدار کمبود موجودی', 'وقتی موجودی کالا به حد هشدار برسد'],
                    ['payments', 'اعلان دریافت و پرداخت', 'با ثبت هر دریافت یا پرداخت جدید'],
                    ['weekly', 'خلاصه هفتگی مالی', 'گزارش خلاصه عملکرد مالی هر هفته'],
                  ].map(([key, label, hint]) => (
                    <div key={key} className="row between wrap gap-3">
                      <div>
                        <div className="strong">{label}</div>
                        <div className="faint">{hint}</div>
                      </div>
                      <Switch
                        id={`notif-${key}`}
                        checked={draft.notifications?.[key]}
                        onChange={(val) => setDraft((d) => ({ ...d, notifications: { ...d.notifications, [key]: val } }))}
                      />
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          ) : null}

          {active === 'payments' ? (
            <Card>
              <CardHead title="روش‌های پرداخت" subtitle="روش‌های فعال برای ثبت دریافت و پرداخت" icon={CreditCard} />
              <CardBody>
                <div className="row gap-2 wrap">
                  {PAYMENT_METHODS.map((m) => {
                    const on = (draft.paymentMethods || []).includes(m);
                    return (
                      <button
                        key={m}
                        type="button"
                        className={`choice ${on ? 'is-active' : ''}`}
                        style={{ padding: '10px 16px' }}
                        aria-pressed={on}
                        onClick={() => toggleMethod(m)}
                      >
                        <span className="choice__label">{m}</span>
                      </button>
                    );
                  })}
                </div>
                <div style={{ marginTop: 'var(--s-5)' }}>
                  <InfoNote tone="info">
                    روش‌های انتخاب‌شده در فرم‌های ثبت دریافت، پرداخت و هزینه قابل استفاده خواهند بود.
                  </InfoNote>
                </div>
              </CardBody>
            </Card>
          ) : null}

          {active === 'security' ? (
            <div className="stack" style={{ gap: 'var(--s-5)' }}>
              <Card>
                <CardHead title="تغییر رمز عبور" subtitle="برای امنیت حساب، رمز قوی انتخاب کنید" icon={ShieldCheck} />
                <CardBody>
                  <form onSubmit={changePassword} className="stack" style={{ gap: 'var(--s-4)' }}>
                    <div className="form-grid">
                      <TextField label="رمز عبور فعلی" type="password" dir="ltr" value={password.current} onChange={(e) => setPassword((p) => ({ ...p, current: e.target.value }))} />
                      <TextField label="رمز عبور جدید" type="password" dir="ltr" value={password.next} onChange={(e) => setPassword((p) => ({ ...p, next: e.target.value }))} />
                      <TextField label="تکرار رمز عبور جدید" type="password" dir="ltr" value={password.confirm} onChange={(e) => setPassword((p) => ({ ...p, confirm: e.target.value }))} />
                    </div>
                    <div>
                      <Button type="submit" variant="primary" icon={ShieldCheck}>تغییر رمز عبور</Button>
                    </div>
                  </form>
                </CardBody>
              </Card>

              <Card>
                <CardHead title="سیاست‌های امنیتی" subtitle="تنظیمات محافظت از حساب کاربری" />
                <CardBody>
                  <div className="stack" style={{ gap: 'var(--s-5)' }}>
                    <div className="row between wrap gap-3">
                      <div>
                        <div className="strong">ورود دو مرحله‌ای</div>
                        <div className="faint">دریافت کد تأیید پیامکی هنگام ورود</div>
                      </div>
                      <Segmented
                        ariaLabel="ورود دو مرحله‌ای"
                        size="sm"
                        value={draft.twoFactor ? 'on' : 'off'}
                        onChange={(v) => setDraft((d) => ({ ...d, twoFactor: v === 'on' }))}
                        options={[{ value: 'off', label: 'غیرفعال' }, { value: 'on', label: 'فعال' }]}
                      />
                    </div>
                    <div className="row between wrap gap-3">
                      <div>
                        <div className="strong">خروج خودکار پس از بی‌فعالیتی</div>
                        <div className="faint">مدت زمان باقی‌ماندن نشست فعال</div>
                      </div>
                      <div style={{ minWidth: 160 }}>
                        <Select
                          aria-label="مدت نشست"
                          value={draft.sessionTimeout || '30'}
                          onChange={(e) => setDraft((d) => ({ ...d, sessionTimeout: e.target.value }))}
                          options={[
                            { value: '15', label: '۱۵ دقیقه' },
                            { value: '30', label: '۳۰ دقیقه' },
                            { value: '60', label: '۱ ساعت' },
                          ]}
                        />
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          ) : null}

          {active === 'backup' ? (
            <div className="stack" style={{ gap: 'var(--s-5)' }}>
              <Card>
                <CardHead title="پشتیبان‌گیری از داده‌ها" subtitle="دریافت نسخه پشتیبان یا بازگردانی آن" icon={DatabaseBackup} />
                <CardBody>
                  <div className="row gap-3 wrap">
                    <Button variant="primary" icon={Download} onClick={download}>دانلود نسخه پشتیبان (JSON)</Button>
                    <Button variant="outline" icon={Upload} onClick={() => fileRef.current?.click()}>بازگردانی از فایل</Button>
                    <input ref={fileRef} type="file" accept="application/json" hidden onChange={onImport} />
                  </div>
                  <div style={{ marginTop: 'var(--s-5)' }}>
                    <InfoNote tone="info">
                      نسخه پشتیبان شامل تمام مشتریان، فاکتورها، هزینه‌ها، دریافت‌ها، پرداخت‌ها و تنظیمات
                      کسب‌وکار شماست.
                    </InfoNote>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHead title="بازنشانی" subtitle="بازگرداندن داده‌های نمونه یا پاک‌سازی کامل" />
                <CardBody>
                  <div className="stack" style={{ gap: 'var(--s-4)' }}>
                    <div className="row between wrap gap-3">
                      <div>
                        <div className="strong">بازنشانی داده‌های نمونه</div>
                        <div className="faint">تمام تغییرات پاک و داده‌های نمایشی اولیه بازگردانی می‌شود</div>
                      </div>
                      <Button
                        variant="outline"
                        icon={RotateCcw}
                        onClick={() => {
                          resetDemo();
                          resetSettings();
                          setDraft({ ...settings });
                          toast.warning('داده‌های نمونه بازنشانی شد.');
                        }}
                      >
                        بازنشانی
                      </Button>
                    </div>
                    <div className="row between wrap gap-3">
                      <div>
                        <div className="strong">پاک‌سازی کامل داده‌ها</div>
                        <div className="faint">حذف فاکتورها، مشتریان و همه سوابق مالی</div>
                      </div>
                      <Button
                        variant="danger"
                        icon={Trash2}
                        onClick={() => toast.error('برای پاک‌سازی کامل، با پشتیبانی 2HS تماس بگیرید.')}
                      >
                        پاک کردن
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          ) : null}

          {dirty ? (
            <div className="card" style={{ marginTop: 'var(--s-5)' }}>
              <CardBody>
                <div className="row between wrap gap-3">
                  <span className="muted">تغییرات ذخیره‌نشده دارید.</span>
                  <div className="row gap-2">
                    <Button variant="ghost" onClick={() => setDraft(settings)}>لغو تغییرات</Button>
                    <Button variant="accent" icon={Save} onClick={save}>ذخیره تغییرات</Button>
                  </div>
                </div>
              </CardBody>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
