import { Check, FileText, Users, Package, Wallet, Banknote, ShieldCheck, Landmark, Calculator, UserPlus } from 'lucide-react';
import Reveal from './Reveal.jsx';
import { BarChart, DonutChart } from '../charts/Charts.jsx';

function InvoiceMock() {
  return (
    <div className="feature-card">
      <div className="row between" style={{ marginBottom: 'var(--s-4)' }}>
        <strong>فاکتور فروش</strong>
        <span className="badge badge--info num">۱۴۰۵-۰۰۲۱</span>
      </div>
      {[
        ['مشاوره مالی و حسابداری', '۸ ساعت'],
        ['پشتیبانی نرم‌افزار', '۱ ماه'],
        ['لایسنس سالانه 2HS', '۱ سال'],
      ].map(([name, qty]) => (
        <div key={name} className="list-row" style={{ padding: '10px 0' }}>
          <div className="list-row__main">
            <div className="list-row__title">{name}</div>
            <div className="list-row__meta"><span>{qty}</span></div>
          </div>
          <span className="list-row__value num">۱۲,۴۸۰,۰۰۰</span>
        </div>
      ))}
      <div className="totals" style={{ marginTop: 'var(--s-4)' }}>
        <div className="totals__row"><span>جمع کل</span><span className="num">۲۸,۹۶۰,۰۰۰ تومان</span></div>
        <div className="totals__row totals__row--grand"><span>قابل پرداخت</span><span className="totals__grand num">۳۱,۵۶۶,۴۰۰ تومان</span></div>
      </div>
    </div>
  );
}

function CustomersMock() {
  const rows = [
    ['شرکت فولاد سپاهان', '۲۴ فاکتور', 'بالance'],
    ['پتروشیمی اصفهان', '۱۸ فاکتور', ''],
    ['فروشگاه آفتاب', '۱۲ فاکتور', ''],
  ];
  return (
    <div className="feature-card">
      <div className="row between" style={{ marginBottom: 'var(--s-4)' }}>
        <strong>مشتریان</strong>
        <span className="badge badge--success"><span className="num">۱۰</span> فعال</span>
      </div>
      {rows.map(([name, meta]) => (
        <div key={name} className="list-row" style={{ padding: '10px 0' }}>
          <span className="avatar avatar--brand" style={{ width: 34, height: 34, fontSize: 13 }} aria-hidden="true">
            {name.charAt(0)}
          </span>
          <div className="list-row__main">
            <div className="list-row__title">{name}</div>
            <div className="list-row__meta"><span className="num">{meta}</span></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReportsMock() {
  return (
    <div className="feature-card feature-card--brand">
      <div className="row between" style={{ marginBottom: 'var(--s-3)' }}>
        <strong>فروش شش ماه گذشته</strong>
        <span className="badge badge--gold">رشد <span className="num">۱۸٪</span></span>
      </div>
      <BarChart
        height={170}
        ariaLabel="نمودار فروش شش ماه گذشته"
        data={[
          { label: 'اردیبهشت', value: 82000000 },
          { label: 'خرداد', value: 96000000 },
          { label: 'تیر', value: 74000000 },
          { label: 'مرداد', value: 118000000 },
          { label: 'شهریور', value: 132000000 },
          { label: 'مهر', value: 149000000 },
        ]}
      />
    </div>
  );
}

function PaymentsMock() {
  return (
    <div className="feature-card">
      <div className="row between" style={{ marginBottom: 'var(--s-4)' }}>
        <strong>وضعیت دریافت‌ها</strong>
        <span className="badge badge--warning">۲ فاکتور معوق</span>
      </div>
      <div className="row gap-5 wrap" style={{ alignItems: 'center' }}>
        <DonutChart
          size={148}
          thickness={20}
          centerValue="۸۲٪"
          centerLabel="وصول شده"
          ariaLabel="وضعیت دریافت‌ها"
          data={[
            { label: 'دریافت‌شده', value: 82, color: '#12B886' },
            { label: 'در انتظار', value: 12, color: '#F59F00' },
            { label: 'معوق', value: 6, color: '#E03131' },
          ]}
        />
        <div className="legend grow">
          {[
            ['دریافت‌شده', '۱۲۴,۵۰۰,۰۰۰', '#12B886'],
            ['در انتظار', '۱۸,۲۰۰,۰۰۰', '#F59F00'],
            ['معوق', '۹,۱۰۰,۰۰۰', '#E03131'],
          ].map(([label, value, color]) => (
            <div key={label} className="legend__item">
              <span className="legend__swatch" style={{ background: color }} />
              <span className="legend__label">{label}</span>
              <span className="legend__value num">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const ROWS = [
  {
    index: '۰۱',
    title: 'صدور فاکتور حرفه‌ای در چند دقیقه',
    desc: 'فاکتور خود را با چند کلیک بسازید؛ اقلام را اضافه کنید و مالیات، تخفیف و جمع کل به‌صورت خودکار محاسبه می‌شود.',
    points: ['محاسبه خودکار مالیات و تخفیف', 'چاپ و خروجی PDF با سربرگ برند شما', 'ارسال فاکتور و پیگیری وضعیت پرداخت'],
    visual: <InvoiceMock />,
  },
  {
    index: '۰۲',
    title: 'مشتریان و سوابق مالی، همیشه در دسترس',
    desc: 'پروفایل کامل هر مشتری با مانده حساب، تاریخچه فاکتور و دریافت‌ها؛ دیگر هیچ مبلغی فراموش نمی‌شود.',
    points: ['مانده حساب و حد اعتباری هر مشتری', 'تاریخچه فاکتور و پرداخت', 'یادداشت و اطلاعات تماس منظم'],
    visual: <CustomersMock />,
    flip: true,
  },
  {
    index: '۰۳',
    title: 'گزارش‌های مالی که واقعاً کمک می‌کنند',
    desc: 'از فروش بر اساس بازه زمانی تا سود و زیان و جریان نقدی؛ همه گزارش‌ها با نمودارهای خوانا و خروجی قابل چاپ.',
    points: ['گزارش سود و زیان و جریان نقدی', 'فروش بر اساس کالا و مشتری', 'خروجی PDF و Excel برای حسابرس'],
    visual: <ReportsMock />,
  },
  {
    index: '۰۴',
    title: 'کنترل دریافت‌ها، پرداخت‌ها و حساب‌های بانکی',
    desc: 'دریافت‌ها را ثبت کنید تا مانده فاکتور به‌صورت خودکار به‌روز شود و وضعیت نقدینگی کسب‌وکار شفاف بماند.',
    points: ['ثبت دریافت و به‌روزرسانی خودکار مانده', 'مدیریت حساب‌های بانکی و صندوق', 'هشدار فاکتورهای معوق و سررسید گذشته'],
    visual: <PaymentsMock />,
    flip: true,
  },
];

export default function Features() {
  return (
    <section className="section section--tint" id="features">
      <div className="container">
        <Reveal className="section__head">
          <span className="section__eyebrow">امکانات 2HS</span>
          <h2 className="section__title">ابزارهای کامل برای چرخه مالی کسب‌وکار</h2>
          <p className="section__desc">
            هر بخش با تمرکز بر سرعت و دقت طراحی شده است تا کارهای روزمره مالی سریع‌تر و بی‌خطاتر
            انجام شود.
          </p>
        </Reveal>

        <div className="feature-rows">
          {ROWS.map((row, i) => (
            <Reveal key={row.index} delay={i * 60}>
              <div className={`feature-row ${row.flip ? 'feature-row--flip' : ''}`}>
                <div>
                  <div className="feature-row__index">{row.index}</div>
                  <h3 className="feature-row__title">{row.title}</h3>
                  <p className="feature-row__desc">{row.desc}</p>
                  <ul className="feature-row__list">
                    {row.points.map((p) => (
                      <li key={p}>
                        <span className="feature-row__check" aria-hidden="true"><Check size={13} /></span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="feature-row__visual">{row.visual}</div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="section__head" delay={80}>
          <div className="benefit-grid" style={{ marginTop: 'var(--s-9)' }}>
            {[
              { icon: Package, title: 'کالا و خدمات', desc: 'کد کالا، واحد، قیمت خرید و فروش، مالیات و هشدار موجودی.' },
              { icon: Wallet, title: 'هزینه‌ها', desc: 'ثبت هزینه با دسته‌بندی، روش پرداخت و تأمین‌کننده.' },
              { icon: Banknote, title: 'مدیریت چک‌ها', desc: 'پیگیری چک‌های دریافتی و پرداختی تا زمان وصول.' },
              { icon: Landmark, title: 'حساب‌های بانکی', desc: 'صندوق و حساب بانکی با گردش و مانده لحظه‌ای.' },
              { icon: UserPlus, title: 'دسترسی چندکاربره', desc: 'نقش‌ها و سطوح دسترسی برای تیم مالی و فروش.' },
              { icon: ShieldCheck, title: 'پشتیبان‌گیری و امنیت', desc: 'پشتیبان‌گیری منظم و دسترسی امن به داده‌های مالی.' },
            ].map((f) => (
              <article key={f.title} className="benefit">
                <span className="benefit__icon" aria-hidden="true"><f.icon size={22} /></span>
                <h3 className="benefit__title">{f.title}</h3>
                <p className="benefit__desc">{f.desc}</p>
              </article>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
