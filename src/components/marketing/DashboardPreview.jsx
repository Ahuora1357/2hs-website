import { ArrowUpRight, Download } from 'lucide-react';
import Reveal from './Reveal.jsx';
import StatCard from '../ui/StatCard.jsx';
import Button from '../ui/Button.jsx';
import { LineChart } from '../charts/Charts.jsx';
import { Wallet, TrendingUp, TrendingDown, Banknote } from 'lucide-react';

export default function DashboardPreview() {
  return (
    <section className="section">
      <div className="container">
        <Reveal className="section__head">
          <span className="section__eyebrow">داشبورد مدیریتی</span>
          <h2 className="section__title">تصویر لحظه‌ای از وضعیت مالی کسب‌وکار</h2>
          <p className="section__desc">
            شاخص‌های کلیدی، نمودار درآمد و فهرست فاکتورهای اخیر — همه در یک نگاه، بدون پیچیدگی.
          </p>
        </Reveal>

        <Reveal delay={60}>
          <div className="preview-frame">
            <div className="preview-frame__bar" aria-hidden="true">
              <span className="preview-frame__dot" />
              <span className="preview-frame__dot" />
              <span className="preview-frame__dot" />
            </div>
            <div className="preview-frame__inner">
              <div className="grid grid--4" style={{ gap: 'var(--s-4)' }}>
                <StatCard label="فروش این ماه" value="۱۲۵,۸۰۰,۰۰۰" icon={TrendingUp} tone="brand" trend={12.4} trendLabel="نسبت به ماه گذشته" />
                <StatCard label="دریافتنی‌ها" value="۴۸,۵۰۰,۰۰۰" icon={Wallet} tone="warning" hint="۷ فاکتور در انتظار پرداخت" />
                <StatCard label="پرداختنی‌ها" value="۲۱,۳۰۰,۰۰۰" icon={TrendingDown} tone="indigo" hint="۳ مورد سررسید نزدیک" />
                <StatCard label="سود خالص" value="۶۴,۷۰۰,۰۰۰" icon={Banknote} tone="success" trend={8.1} trendLabel="این ماه" />
              </div>

              <div className="grid grid--wide" style={{ gap: 'var(--s-4)' }}>
                <div className="card">
                  <div className="card__head">
                    <div className="card__head-main">
                      <div>
                        <h3 className="card__title">روند درآمد و هزینه</h3>
                        <p className="card__subtitle">شش ماه گذشته</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" icon={Download}>خروجی</Button>
                  </div>
                  <div className="card__body">
                    <LineChart
                      height={200}
                      ariaLabel="روند درآمد شش ماه گذشته"
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
                </div>

                <div className="card">
                  <div className="card__head">
                    <div className="card__head-main">
                      <div>
                        <h3 className="card__title">فاکتورهای اخیر</h3>
                        <p className="card__subtitle">آخرین صدورها</p>
                      </div>
                    </div>
                  </div>
                  <div className="card__body card__body--flush">
                    {[
                      ['۱۴۰۵-۰۰۱۹', 'کلینیک تخصصی مهر', '۵,۴۵۰,۰۰۰', 'warning'],
                      ['۱۴۰۵-۰۰۱۸', 'فروشگاه زنجیره‌ای آفتاب', '۱۶,۳۴۰,۰۰۰', 'info'],
                      ['۱۴۰۵-۰۰۱۷', 'خانم سارا محمدی', '۲۹,۰۰۰,۰۰۰', 'success'],
                      ['۱۴۰۵-۰۰۱۶', 'شرکت فولاد سپاهان', '۲۱,۵۳۰,۰۰۰', 'info'],
                    ].map(([num, name, amount, tone]) => (
                      <div key={num} className="list-row">
                        <span className={`badge badge--${tone}`}><span className="num">{num}</span></span>
                        <div className="list-row__main">
                          <div className="list-row__title">{name}</div>
                        </div>
                        <span className="list-row__value num">{amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <p className="center" style={{ marginTop: 'var(--s-7)' }}>
            <Button as="a" href="/register" variant="primary" size="lg" icon={ArrowUpRight}>
              مشاهده داشبورد نمونه
            </Button>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
