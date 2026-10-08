import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import { TextField, TextareaField, SelectField } from '../../components/ui/Form.jsx';
import { InfoNote } from '../../components/ui/Misc.jsx';
import Reveal from '../../components/marketing/Reveal.jsx';
import { useToast } from '../../context/ToastContext.jsx';

const SUBJECTS = ['درخواست دموی محصول', 'پرسش درباره قیمت‌گذاری', 'پشتیبانی فنی', 'همکاری و نمایندگی', 'سایر موارد'];

export default function Contact() {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = 'نام و نام خانوادگی الزامی است.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'ایمیل معتبر وارد کنید.';
    if (form.phone && !/^[0-9۰-۹\-\s]{8,15}$/.test(form.phone)) next.phone = 'شماره تماس معتبر وارد کنید.';
    if (!form.subject) next.subject = 'موضوع را انتخاب کنید.';
    if (form.message.trim().length < 10) next.message = 'متن پیام باید حداقل ۱۰ کاراکتر باشد.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      toast.success('پیام شما ارسال شد. کارشناسان 2HS حداکثر تا یک روز کاری پاسخ می‌دهند.', { title: 'ارسال موفق' });
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 700);
  };

  return (
    <section className="section section--tint">
      <div className="container">
        <Reveal className="section__head">
          <span className="section__eyebrow">تماس با ما</span>
          <h2 className="section__title">پاسخ سوال‌های شما، یک پیام فاصله دارد</h2>
          <p className="section__desc">
            برای دریافت دموی محصول، مشاوره انتخاب پلن یا هر پرسش دیگری با ما در تماس باشید.
          </p>
        </Reveal>

        <div className="grid grid--sidebar">
          <Reveal>
            <div className="card">
              <div className="card__head">
                <div className="card__head-main">
                  <div>
                    <h3 className="card__title">فرم تماس</h3>
                    <p className="card__subtitle">فیلدهای ستاره‌دار الزامی هستند</p>
                  </div>
                </div>
              </div>
              <div className="card__body">
                <form onSubmit={submit} noValidate className="stack" style={{ gap: 'var(--s-4)' }}>
                  <div className="form-grid">
                    <TextField
                      label="نام و نام خانوادگی"
                      required
                      value={form.name}
                      onChange={set('name')}
                      error={errors.name}
                      placeholder="مثلاً علی محمدی"
                    />
                    <TextField
                      label="ایمیل"
                      type="email"
                      required
                      value={form.email}
                      onChange={set('email')}
                      error={errors.email}
                      placeholder="you@example.com"
                    />
                    <TextField
                      label="شماره تماس"
                      value={form.phone}
                      onChange={set('phone')}
                      error={errors.phone}
                      placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                      hint="اختیاری"
                    />
                    <SelectField
                      label="موضوع"
                      required
                      value={form.subject}
                      onChange={set('subject')}
                      error={errors.subject}
                      placeholder="انتخاب کنید"
                      options={SUBJECTS}
                    />
                  </div>

                  <TextareaField
                    label="متن پیام"
                    required
                    rows={5}
                    value={form.message}
                    onChange={set('message')}
                    error={errors.message}
                    placeholder="شرح درخواست خود را بنویسید…"
                  />

                  <div className="row between wrap gap-3">
                    <span className="faint">با ارسال این فرم، قوانین حریم خصوصی 2HS را می‌پذیرید.</span>
                    <Button type="submit" variant="accent" icon={Send} loading={sending}>
                      ارسال پیام
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="stack" style={{ gap: 'var(--s-4)' }}>
              <div className="card">
                <div className="card__body">
                  <h3 className="card__title" style={{ marginBottom: 'var(--s-4)' }}>اطلاعات تماس</h3>
                  <div className="stack" style={{ gap: 'var(--s-4)' }}>
                    <div className="row gap-3">
                      <span className="usecase__icon" style={{ width: 40, height: 40 }} aria-hidden="true"><Phone size={18} /></span>
                      <div>
                        <div className="strong num">۰۳۱-۳۶۶۶۱۱۲۲</div>
                        <div className="faint">شنبه تا چهارشنبه، ۸ تا ۱۷</div>
                      </div>
                    </div>
                    <div className="row gap-3">
                      <span className="usecase__icon" style={{ width: 40, height: 40 }} aria-hidden="true"><Mail size={18} /></span>
                      <div>
                        <div className="strong num">info@2hs.ir</div>
                        <div className="faint">پاسخ حداکثر تا یک روز کاری</div>
                      </div>
                    </div>
                    <div className="row gap-3">
                      <span className="usecase__icon" style={{ width: 40, height: 40 }} aria-hidden="true"><MapPin size={18} /></span>
                      <div>
                        <div className="strong">اصفهان، برج فناوری</div>
                        <div className="faint">خیابان چهارباغ بالا، طبقه ۷</div>
                      </div>
                    </div>
                    <div className="row gap-3">
                      <span className="usecase__icon" style={{ width: 40, height: 40 }} aria-hidden="true"><Clock size={18} /></span>
                      <div>
                        <div className="strong">پشتیبانی سازمانی</div>
                        <div className="faint">۲۴ ساعته، ۷ روز هفته</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <InfoNote tone="info" title="دموی اختصاصی می‌خواهید؟">
                با انتخاب «درخواست دموی محصول» در فرم، کارشناسان ما یک جلسه آنلاین اختصاصی برای
                معرفی کامل 2HS با شما هماهنگ می‌کنند.
              </InfoNote>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
