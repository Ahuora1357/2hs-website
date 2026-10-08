import { Link } from 'react-router-dom';
import { Store, Building2, Briefcase, Factory, Truck, GraduationCap, Check, Sparkles } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Reveal from '../../components/marketing/Reveal.jsx';
import UseCases from '../../components/marketing/UseCases.jsx';

const SOLUTIONS = [
  {
    icon: Store,
    title: 'فروشگاه‌ها و خرده‌فروشی',
    desc: 'صدور سریع فاکتور فروش، مدیریت موجودی و شناسایی مشتریان پرخرید.',
    points: ['فاکتور فروش سریع با چند قلم', 'هشدار کمبود موجودی', 'گزارش فروش روزانه و ماهانه'],
  },
  {
    icon: Building2,
    title: 'شرکت‌های بازرگانی',
    desc: 'کنترل دریافت و پرداخت، مطالبات و جریان نقدی در یک داشبورد.',
    points: ['پیگیری مانده حساب مشتریان', 'مدیریت حساب‌های بانکی و صندوق', 'گزارش جریان نقدی'],
  },
  {
    icon: Briefcase,
    title: 'خدمات و مشاوره',
    desc: 'فاکتور ساعتی و قراردادهای دوره‌ای با محاسبه خودکار مبالغ.',
    points: ['فاکتور خدمات ساعتی', 'قرارداد پشتیبانی دوره‌ای', 'پیگیری دریافت از مشتریان'],
  },
  {
    icon: Factory,
    title: 'تولیدی و صنعتی',
    desc: 'ثبت خرید، بهای تمام‌شده و تحلیل فروش بر اساس کالا.',
    points: ['مدیریت کالا و کدگذاری', 'گزارش فروش بر اساس کالا', 'کنترل هزینه‌های تولید'],
  },
  {
    icon: Truck,
    title: 'حمل و نقل و پیمانکاری',
    desc: 'صورت‌وضعیت دوره‌ای پروژه‌ها و کنترل مطالبات بلندمدت.',
    points: ['فاکتور صورت‌وضعیت', 'هزینه‌های پروژه', 'گزارش سود پروژه'],
  },
  {
    icon: GraduationCap,
    title: 'آموزشگاه و مراکز خدماتی',
    desc: 'ثبت‌نام، شهریه دوره‌ای و کنترل دریافت‌های ماهانه.',
    points: ['فاکتور دوره آموزشی', 'یادآوری پرداخت شهریه', 'گزارش درآمد ماهانه'],
  },
];

export default function Solutions() {
  return (
    <>
      <section className="hero" style={{ paddingBottom: 'var(--s-9)' }}>
        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <span className="hero__badge">
            <span className="hero__badge-dot" aria-hidden="true" />
            راهکارها
          </span>
          <h1 className="hero__title" style={{ maxWidth: '24ch', margin: '0 auto' }}>
            راهکار 2HS برای هر نوع کسب‌وکار
          </h1>
          <p className="hero__desc" style={{ marginInline: 'auto' }}>
            ساختار 2HS با فرایند مالی کسب‌وکار شما وفق داده می‌شود؛ از یک فروشگاه کوچک تا شرکت
            تولیدی با چند کاربر و صدها فاکتور در ماه.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="feature-rows">
            {SOLUTIONS.map((s, i) => (
              <Reveal key={s.title} delay={i * 50}>
                <div className={`feature-row ${i % 2 === 1 ? 'feature-row--flip' : ''}`}>
                  <div>
                    <span className="usecase__icon" aria-hidden="true"><s.icon size={22} /></span>
                    <h2 className="feature-row__title" style={{ fontSize: 'var(--fs-3xl)' }}>{s.title}</h2>
                    <p className="feature-row__desc">{s.desc}</p>
                    <ul className="feature-row__list">
                      {s.points.map((p) => (
                        <li key={p}>
                          <span className="feature-row__check" aria-hidden="true"><Check size={13} /></span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                    <Button as={Link} to="/register" variant="outline" style={{ marginTop: 'var(--s-5)' }}>
                      شروع رایگان برای این کسب‌وکار
                    </Button>
                  </div>
                  <div className="feature-row__visual">
                    <div className="feature-card feature-card--brand">
                      <h3 style={{ fontSize: 'var(--fs-lg)', marginBottom: 'var(--s-4)' }}>چه چیزی به دست می‌آورید؟</h3>
                      <div className="stack-sm">
                        {s.points.map((p) => (
                          <div key={p} className="row gap-3">
                            <span className="feature-row__check" aria-hidden="true"><Check size={12} /></span>
                            <span className="muted">{p}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <UseCases />

      <section className="section">
        <div className="container">
          <Reveal>
            <div className="final-cta">
              <h2 className="final-cta__title">راهکار مناسب کسب‌وکارتان را امتحان کنید</h2>
              <p className="final-cta__desc">
                ۱۴ روز استفاده آزمایشی رایگان، بدون نیاز به کارت بانکی.
              </p>
              <Button as={Link} to="/register" variant="accent" size="lg" icon={Sparkles}>
                شروع رایگان
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
