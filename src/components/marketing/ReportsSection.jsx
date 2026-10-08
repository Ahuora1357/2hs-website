import { FileSpreadsheet, Calculator, Banknote, Users, Receipt, Landmark, Package, Calendar } from 'lucide-react';
import Reveal from './Reveal.jsx';
import { LineChart, RankBars } from '../charts/Charts.jsx';

const REPORTS = [
  { icon: FileSpreadsheet, label: 'فروش بر اساس بازه زمانی' },
  { icon: Calculator, label: 'سود و زیان' },
  { icon: Banknote, label: 'جریان نقدی' },
  { icon: Users, label: 'مانده حساب مشتریان' },
  { icon: Receipt, label: 'فاکتورهای پرداخت‌نشده' },
  { icon: Landmark, label: 'گزارش دریافت‌ها و پرداخت‌ها' },
  { icon: Package, label: 'موجودی و فروش کالا' },
  { icon: Calendar, label: 'گزارش مالیات' },
];

export default function ReportsSection() {
  return (
    <section className="section section--tint">
      <div className="container">
        <div className="grid grid--wide" style={{ alignItems: 'center' }}>
          <Reveal>
            <span className="section__eyebrow">گزارش‌های مالی</span>
            <h2 className="section__title">هر عددی که برای تصمیم‌گیری لازم دارید</h2>
            <p className="section__desc">
              گزارش‌ها با انتخاب بازه تاریخ شمسی، فیلترهای دلخواه، نمودار خوانا و قابلیت چاپ و
              خروجی PDF و Excel در اختیار شماست.
            </p>
            <div className="grid grid--2" style={{ marginTop: 'var(--s-6)', gap: 'var(--s-3)' }}>
              {REPORTS.map(({ icon: Icon, label }) => (
                <div key={label} className="row gap-3" style={{ padding: '10px 0' }}>
                  <span className="report-tile__icon" style={{ width: 36, height: 36 }} aria-hidden="true">
                    <Icon size={17} />
                  </span>
                  <span style={{ fontWeight: 600 }}>{label}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="card">
              <div className="card__head">
                <div className="card__head-main">
                  <div>
                    <h3 className="card__title">فروش بر اساس بازه زمانی</h3>
                    <p className="card__subtitle">مهر ۱۴۰۴ تا مهر ۱۴۰۵</p>
                  </div>
                </div>
              </div>
              <div className="card__body">
                <LineChart
                  height={190}
                  color="#4263EB"
                  ariaLabel="نمودار فروش بر اساس بازه زمانی"
                  data={[
                    { label: 'اردیبهشت', value: 82000000 },
                    { label: 'خرداد', value: 96000000 },
                    { label: 'تیر', value: 74000000 },
                    { label: 'مرداد', value: 118000000 },
                    { label: 'شهریور', value: 132000000 },
                    { label: 'مهر', value: 149000000 },
                  ]}
                />
                <div style={{ marginTop: 'var(--s-5)' }}>
                  <h4 style={{ fontSize: 'var(--fs-md)', marginBottom: 'var(--s-4)' }}>فروش بر اساس مشتری</h4>
                  <RankBars
                    tone="indigo"
                    items={[
                      { label: 'شرکت فولاد سپاهان', value: 168000000 },
                      { label: 'پتروشیمی اصفهان', value: 142000000 },
                      { label: 'آموزشگاه پارسیان', value: 52000000 },
                      { label: 'فروشگاه آفتاب', value: 47000000 },
                    ]}
                  />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
