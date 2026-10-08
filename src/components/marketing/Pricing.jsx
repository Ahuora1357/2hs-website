import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import Reveal from './Reveal.jsx';
import Button from '../ui/Button.jsx';
import { Segmented } from '../ui/Misc.jsx';
import { formatNumber } from '../../lib/format.js';

const PLANS = [
  {
    id: 'start',
    name: 'شروع',
    desc: 'برای کسب‌وکارهای کوچک و تازه‌کار',
    monthly: 990000,
    yearly: 9900000,
    users: '۱ کاربر',
    invoices: '۵۰ فاکتور در ماه',
    cta: 'شروع رایگان',
    variant: 'outline',
    features: [
      { label: 'صدور و مدیریت فاکتور', on: true },
      { label: 'مدیریت مشتریان', on: true },
      { label: 'ثبت هزینه‌ها', on: true },
      { label: 'گزارش‌های پایه', on: true },
      { label: 'مدیریت موجودی کالا', on: false },
      { label: 'دسترسی چندکاربره', on: false },
      { label: 'پشتیبانی اختصاصی', on: false },
    ],
  },
  {
    id: 'pro',
    name: 'حرفه‌ای',
    desc: 'انتخاب اکثر کسب‌وکارهای در حال رشد',
    monthly: 2490000,
    yearly: 24900000,
    users: '۵ کاربر',
    invoices: '۵۰۰ فاکتور در ماه',
    cta: 'شروع دوره آزمایشی',
    variant: 'accent',
    featured: true,
    features: [
      { label: 'همه امکانات پلن شروع', on: true },
      { label: 'مدیریت موجودی و هشدار کمبود', on: true },
      { label: 'گزارش سود و زیان و جریان نقدی', on: true },
      { label: 'مدیریت حساب‌های بانکی', on: true },
      { label: 'دسترسی چندکاربره با نقش‌ها', on: true },
      { label: 'خروجی PDF و Excel', on: true },
      { label: 'پشتیبانی اختصاصی', on: false },
    ],
  },
  {
    id: 'org',
    name: 'سازمانی',
    desc: 'برای شرکت‌ها و تیم‌های مالی بزرگ',
    monthly: 5900000,
    yearly: 59000000,
    users: 'نامحدود',
    invoices: 'نامحدود',
    cta: 'گفت‌وگو با فروش',
    variant: 'secondary',
    features: [
      { label: 'همه امکانات پلن حرفه‌ای', on: true },
      { label: 'کاربران نامحدود', on: true },
      { label: 'گزارش‌های سفارشی', on: true },
      { label: 'پشتیبان‌گیری اختصاصی', on: true },
      { label: 'دسترسی API', on: true },
      { label: 'آموزش تیم مالی', on: true },
      { label: 'پشتیبانی اختصاصی ۲۴/۷', on: true },
    ],
  },
];

export default function Pricing() {
  const [period, setPeriod] = useState('monthly');
  const yearly = period === 'yearly';

  return (
    <section className="section" id="pricing">
      <div className="container">
        <Reveal className="section__head">
          <span className="section__eyebrow">قیمت‌گذاری</span>
          <h2 className="section__title">پلنی مناسب هر اندازه از کسب‌وکار</h2>
          <p className="section__desc">
            بدون هزینه پنهان. در هر زمان می‌توانید پلن خود را ارتقا دهید یا لغو کنید.
          </p>
        </Reveal>

        <Reveal className="pricing__toggle" delay={40}>
          <Segmented
            ariaLabel="دوره پرداخت"
            value={period}
            onChange={setPeriod}
            options={[
              { value: 'monthly', label: 'پرداخت ماهانه' },
              { value: 'yearly', label: 'پرداخت سالانه (۲ ماه رایگان)' },
            ]}
          />
        </Reveal>

        <div className="plans">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.id} delay={i * 70}>
              <article className={`plan ${plan.featured ? 'plan--featured' : ''}`}>
                {plan.featured ? <span className="plan__flag">پیشنهاد 2HS</span> : null}
                <h3 className="plan__name">{plan.name}</h3>
                <p className="plan__desc">{plan.desc}</p>

                <div className="plan__price">
                  <span className="plan__amount num">{formatNumber(yearly ? plan.yearly : plan.monthly)}</span>
                  <span className="plan__period">تومان / {yearly ? 'سال' : 'ماه'}</span>
                </div>
                <p className="plan__note">
                  {yearly ? 'معادل دو ماه استفاده رایگان' : 'بدون هزینه راه‌اندازی'}
                </p>

                <div className="plan__cta">
                  <Button as={Link} to="/register" variant={plan.variant} block>
                    {plan.cta}
                  </Button>
                </div>

                <div className="row gap-4 wrap" style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>
                  <span>{plan.users}</span>
                  <span>{plan.invoices}</span>
                </div>

                <ul className="plan__features">
                  {plan.features.map((f) => (
                    <li key={f.label} className={`plan__feature ${f.on ? '' : 'is-off'}`}>
                      {f.on ? <Check size={16} /> : <X size={16} />}
                      <span>{f.label}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
