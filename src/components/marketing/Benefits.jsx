import { FileText, TrendingUp, Users, Calculator } from 'lucide-react';
import Reveal from './Reveal.jsx';

const BENEFITS = [
  {
    icon: FileText,
    title: 'فاکتورهای حرفه‌ای',
    desc: 'صدور و مدیریت فاکتور در چند دقیقه، با محاسبه خودکار مالیات، تخفیف و مانده حساب.',
  },
  {
    icon: TrendingUp,
    title: 'گزارش‌های دقیق',
    desc: 'تصمیم‌گیری بهتر با گزارش‌های مالی قابل فهم؛ سود و زیان، جریان نقدی و فروش بر اساس بازه زمانی.',
  },
  {
    icon: Users,
    title: 'مدیریت مشتریان',
    desc: 'اطلاعات مشتریان و سوابق مالی در یکجا؛ از مانده حساب تا تاریخچه فاکتورها و دریافت‌ها.',
  },
  {
    icon: Calculator,
    title: 'کنترل هزینه‌ها',
    desc: 'تمام هزینه‌های کسب‌وکار را منظم و دقیق ثبت کنید و در گزارش‌های مالی ببینید.',
  },
];

export default function Benefits() {
  return (
    <section className="section">
      <div className="container">
        <Reveal className="section__head">
          <span className="section__eyebrow">چرا 2HS</span>
          <h2 className="section__title">همه‌چیز برای مدیریت مالی کسب‌وکار، در یک پلتفرم یکپارچه</h2>
          <p className="section__desc">
            2HS برای صاحبان کسب‌وکار، حسابداران و تیم‌های مالی ساخته شده است؛ ساده برای شروع،
            دقیق برای کار حرفه‌ای.
          </p>
        </Reveal>

        <div className="benefit-grid">
          {BENEFITS.map((b, i) => (
            <Reveal key={b.title} delay={i * 70}>
              <article className="benefit">
                <span className="benefit__icon" aria-hidden="true">
                  <b.icon size={24} />
                </span>
                <h3 className="benefit__title">{b.title}</h3>
                <p className="benefit__desc">{b.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
