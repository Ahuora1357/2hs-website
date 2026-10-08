import { Building2, Briefcase, Store, Factory, Truck, Wrench, GraduationCap, HeartPulse } from 'lucide-react';
import Reveal from './Reveal.jsx';

const CASES = [
  { icon: Store, title: 'فروشگاه‌ها', desc: 'صدور سریع فاکتور فروش، کنترل موجودی و شناسایی مشتریان وفادار.' },
  { icon: Building2, title: 'شرکت‌ها', desc: 'مدیریت دریافت و پرداخت، گزارش سود و زیان و کنترل هزینه‌های سازمانی.' },
  { icon: Briefcase, title: 'خدمات و مشاوره', desc: 'فاکتور ساعتی، قراردادهای دوره‌ای و پیگیری مانده حساب مشتریان.' },
  { icon: Factory, title: 'تولیدی و صنعتی', desc: 'ثبت خرید، بهای تمام‌شده و گزارش فروش بر اساس کالا.' },
  { icon: Truck, title: 'حمل و نقل و پیمانکاری', desc: 'صورت‌وضعیت دوره‌ای، هزینه پروژه و کنترل مطالبات.' },
  { icon: Wrench, title: 'خدمات فنی', desc: 'سفارش‌های خدماتی، شارژ پشتیبانی و فاکتور خدمات.' },
  { icon: GraduationCap, title: 'آموزشگاه‌ها', desc: 'ثبت‌نام دوره‌ها، شهریه و گزارش دریافت‌های ماهانه.' },
  { icon: HeartPulse, title: 'کلینیک‌ها', desc: 'فاکتور خدمات درمانی، بیمه و پیگیری پرداخت بیماران.' },
];

export default function UseCases() {
  return (
    <section className="section">
      <div className="container">
        <Reveal className="section__head">
          <span className="section__eyebrow">مناسب برای</span>
          <h2 className="section__title">هر کسب‌وکاری، اندازه خودش</h2>
          <p className="section__desc">
            از یک فروشگاه کوچک تا شرکت با چند کاربر؛ 2HS با ساختار کسب‌وکار شما هم‌راه می‌شود.
          </p>
        </Reveal>

        <div className="usecase-grid">
          {CASES.map((c, i) => (
            <Reveal key={c.title} delay={i * 50}>
              <article className="usecase">
                <span className="usecase__icon" aria-hidden="true"><c.icon size={22} /></span>
                <h3 className="usecase__title">{c.title}</h3>
                <p className="usecase__desc">{c.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
