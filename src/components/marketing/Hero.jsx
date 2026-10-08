import { Link } from 'react-router-dom';
import { ArrowLeft, PlayCircle, Sparkles } from 'lucide-react';
import Button from '../ui/Button.jsx';
import HeroArt from './HeroArt.jsx';
import { toFaDigits } from '../../lib/format.js';

const STATS = [
  { value: '۴,۲۰۰+', label: 'کسب‌وکار فعال' },
  { value: '۱.۸ م', label: 'فاکتور صادرشده' },
  { value: '۹۹.۹٪', label: 'پایداری سرویس' },
];

export default function Hero() {
  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="hero">
      <div className="container hero__inner">
        <div>
          <span className="hero__badge">
            <span className="hero__badge-dot" aria-hidden="true" />
            نسخه جدید 2HS منتشر شد — گزارش‌های مالی هوشمند
          </span>

          <h1 className="hero__title">
            حسابداری حرفه‌ای،
            <br />
            <em>ساده و همیشه در دسترس</em>
          </h1>

          <p className="hero__desc">
            با 2HS فاکتور صادر کنید، مشتریان خود را مدیریت کنید و وضعیت مالی کسب‌وکارتان را همیشه
            شفاف ببینید.
          </p>

          <p className="hero__tagline">THE MASTER OF YOUR INVOICES</p>

          <div className="hero__cta">
            <Button as={Link} to="/register" variant="accent" size="lg" icon={Sparkles}>
              شروع رایگان
            </Button>
            <Button variant="outline" size="lg" icon={PlayCircle} onClick={scrollToFeatures}>
              مشاهده امکانات
            </Button>
          </div>

          <dl className="hero__stats">
            {STATS.map((s) => (
              <div key={s.label}>
                <dt className="hero__stat-value num">{s.value}</dt>
                <dd className="hero__stat-label">{s.label}</dd>
              </div>
            ))}
          </dl>

          <p className="hero__tagline" style={{ marginTop: 'var(--s-6)', letterSpacing: '0.08em' }}>
            {toFaDigits('1')}۴ روز استفاده آزمایشی رایگان — بدون نیاز به کارت بانکی
          </p>
        </div>

        <div className="hero__art">
          <HeroArt />
        </div>
      </div>
    </section>
  );
}
