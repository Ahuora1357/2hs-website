import { Link } from 'react-router-dom';
import { Target, ShieldCheck, Users, Sparkles, Check } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Reveal from '../../components/marketing/Reveal.jsx';
import { Avatar } from '../../components/ui/Badge.jsx';

const VALUES = [
  { icon: Target, title: 'دقت و شفافیت', desc: 'هر عددی که در 2HS می‌بینید قابل ردیابی است؛ از فاکتور تا گزارش سود و زیان.' },
  { icon: ShieldCheck, title: 'امنیت داده‌ها', desc: 'دسترسی نقش‌محور، پشتیبان‌گیری منظم و محافظت از اطلاعات مالی کسب‌وکار شما.' },
  { icon: Users, title: 'سادگی برای همه', desc: 'رابط فارسی و راست‌به‌چپ که هم حسابدار حرفه‌ای و هم صاحب کسب‌وکار با آن راحت است.' },
  { icon: Sparkles, title: 'توسعه مستمر', desc: 'هر ماه امکانات جدید بر اساس بازخورد واقعی کاربران اضافه می‌شود.' },
];

const TEAM = [
  { name: 'مهندس امیر حسینی', role: 'مدیرعامل و بنیان‌گذار' },
  { name: 'مریم شریفی', role: 'مدیر محصول' },
  { name: 'حسین نوری', role: 'مدیر فنی' },
  { name: 'زهرا اکبری', role: 'مدیر موفقیت مشتریان' },
];

const MILESTONES = [
  '۴,۲۰۰ کسب‌وکار فعال',
  '۱.۸ میلیون فاکتور صادرشده',
  '۹۹.۹٪ پایداری سرویس',
  '۱۲ سال تجربه در حوزه مالی',
];

export default function About() {
  return (
    <>
      <section className="hero" style={{ paddingBottom: 'var(--s-9)' }}>
        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <span className="hero__badge">
            <span className="hero__badge-dot" aria-hidden="true" />
            درباره 2HS
          </span>
          <h1 className="hero__title" style={{ maxWidth: '22ch', margin: '0 auto' }}>
            حسابداری حرفه‌ای برای کسب‌وکارهای ایران
          </h1>
          <p className="hero__desc" style={{ marginInline: 'auto' }}>
            هسین حاسب سپاهان (2HS) از سال ۱۳۹۳ با هدف ساده‌کردن امور مالی کسب‌وکارها فعالیت می‌کند.
            امروز هزاران شرکت، فروشگاه و تیم مالی هر روز با 2HS فاکتور صادر می‌کنند و گزارش‌های
            مالی خود را مدیریت می‌کنند.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid--wide" style={{ alignItems: 'center' }}>
            <Reveal>
              <span className="section__eyebrow">مأموریت ما</span>
              <h2 className="section__title">امور مالی کسب‌وکارها را بدون پیچیدگی، دقیق کنیم</h2>
              <p className="section__desc">
                باور ما این است که نرم‌افزار حسابداری نباید فقط برای حسابداران باشد. 2HS طوری طراحی
                شده که صاحب کسب‌وکار در یک نگاه بداند چقدر فروخته، چقدر وصول کرده و چه مقدار طلبکار
                است — و در همان حال، ابزارهای حرفه‌ای مورد نیاز حسابداران را نیز داشته باشد.
              </p>
              <ul className="feature-row__list" style={{ marginTop: 'var(--s-5)' }}>
                {MILESTONES.map((m) => (
                  <li key={m}>
                    <span className="feature-row__check" aria-hidden="true"><Check size={13} /></span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={100}>
              <div className="grid grid--2">
                {VALUES.map((v) => (
                  <article key={v.title} className="benefit">
                    <span className="benefit__icon" aria-hidden="true"><v.icon size={22} /></span>
                    <h3 className="benefit__title" style={{ fontSize: 'var(--fs-lg)' }}>{v.title}</h3>
                    <p className="benefit__desc" style={{ fontSize: 'var(--fs-md)' }}>{v.desc}</p>
                  </article>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section section--tint">
        <div className="container">
          <Reveal className="section__head">
            <span className="section__eyebrow">تیم ما</span>
            <h2 className="section__title">افرادی که 2HS را می‌سازند</h2>
          </Reveal>
          <div className="benefit-grid">
            {TEAM.map((t) => (
              <Reveal key={t.name}>
                <article className="benefit center">
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--s-3)' }}>
                    <Avatar name={t.name} size={64} />
                  </div>
                  <h3 className="benefit__title" style={{ fontSize: 'var(--fs-lg)' }}>{t.name}</h3>
                  <p className="benefit__desc" style={{ fontSize: 'var(--fs-md)' }}>{t.role}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <div className="final-cta">
              <h2 className="final-cta__title">آماده شروع هستید؟</h2>
              <p className="final-cta__desc">
                همین امروز حساب 2HS خود را بسازید و اولین فاکتورتان را در چند دقیقه صادر کنید.
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
