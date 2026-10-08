import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp, Wallet, TrendingDown, Banknote, FileText, UserPlus,
  Package, Receipt, AlertTriangle, Clock, ArrowRight,
} from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import { Card, CardHead, CardBody } from '../../components/ui/Card.jsx';
import { StatusBadge, Badge } from '../../components/ui/Badge.jsx';
import { LineChart, DonutChart, RankBars } from '../../components/charts/Charts.jsx';
import { EmptyState } from '../../components/ui/Misc.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useMoney } from '../../hooks/useMoney.js';
import { computeMetrics } from '../../lib/metrics.js';
import { invoiceTotals, resolveStatus } from '../../lib/calc.js';
import { formatJalali, relativeDay, todayISO } from '../../lib/date.js';
import { formatNumber } from '../../lib/format.js';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useSettings();
  const { money, currency } = useMoney();
  const { invoices, expenses, accounts, customers, products, customerById } = useData();

  const metrics = useMemo(
    () => computeMetrics({ invoices, expenses, accounts, customers }),
    [invoices, expenses, accounts, customers]
  );

  const recent = useMemo(
    () => [...invoices]
      .sort((a, b) => (a.issueDate < b.issueDate ? 1 : -1))
      .slice(0, 6),
    [invoices]
  );

  const dueSoon = useMemo(() => {
    const today = todayISO();
    return invoices
      .filter((i) => i.status === 'sent')
      .map((i) => ({ invoice: i, ...invoiceTotals(i), status: resolveStatus(i) }))
      .filter((r) => r.remaining > 0 && r.invoice.dueDate >= today)
      .sort((a, b) => (a.invoice.dueDate > b.invoice.dueDate ? 1 : -1))
      .slice(0, 5);
  }, [invoices]);

  const lowStock = products.filter((p) => p.stock !== null && p.stock <= p.minStock);

  const donutData = [
    { label: 'دریافت‌شده', value: metrics.totalReceived, color: '#12B886' },
    { label: 'در انتظار', value: Math.max(metrics.receivables - metrics.overdueAmount, 0), color: '#F59F00' },
    { label: 'معوق', value: metrics.overdueAmount, color: '#E03131' },
  ].filter((d) => d.value > 0);

  const collectRate = metrics.totalInvoiced
    ? Math.round((metrics.totalReceived / metrics.totalInvoiced) * 100)
    : 0;

  return (
    <>
      <section className="dash-hero">
        <div>
          <h1 className="dash-hero__title">
            سلام {user?.name ? user.name : 'کاربر'} 👋
          </h1>
          <p className="dash-hero__desc">
            {settings.businessName} — نگاهی سریع به وضعیت مالی امروز. فروش این ماه{' '}
            <strong className="num">{money(metrics.monthRevenue)}</strong> است.
          </p>
        </div>
        <div className="dash-hero__cta">
          <Button variant="accent" icon={FileText} onClick={() => navigate('/app/invoices/new')}>
            ایجاد فاکتور
          </Button>
          <Button variant="outline" icon={Wallet} onClick={() => navigate('/app/receipts')}>
            ثبت دریافت
          </Button>
        </div>
      </section>

      <div className="grid grid--stats" style={{ marginBottom: 'var(--s-5)' }}>
        <StatCard
          label="فروش این ماه"
          value={formatNumber(metrics.monthRevenue)}
          icon={TrendingUp}
          tone="brand"
          trendLabel="مجموع فاکتورهای ماه جاری"
        />
        <StatCard
          label="دریافتنی‌ها"
          value={formatNumber(metrics.receivables)}
          icon={Wallet}
          tone="warning"
          hint={`${formatNumber(metrics.openItems.length)} فاکتور در انتظار پرداخت`}
        />
        <StatCard
          label="پرداختنی‌ها"
          value={formatNumber(metrics.payables)}
          icon={TrendingDown}
          tone="indigo"
          hint="هزینه‌های پرداخت‌نشده"
        />
        <StatCard
          label="سود خالص"
          value={formatNumber(metrics.netProfit)}
          icon={Banknote}
          tone="success"
          hint={`موجودی نقد: ${formatNumber(metrics.cash)}`}
        />
      </div>

      <div className="grid grid--wide" style={{ marginBottom: 'var(--s-5)' }}>
        <Card>
          <CardHead
            title="روند درآمد و هزینه"
            subtitle="شش ماه گذشته (تومان)"
            actions={<Badge tone="gold">واحد: {currency}</Badge>}
          />
          <CardBody>
            <LineChart
              height={260}
              ariaLabel="روند درآمد شش ماه گذشته"
              data={metrics.series.map((s) => ({ label: s.label, value: s.revenue }))}
            />
            <div className="chart-card__legend">
              <span className="chart-legend-item"><i style={{ background: 'var(--brand)' }} /> درآمد</span>
              <span className="chart-legend-item">
                <i style={{ background: 'var(--gold-400)' }} /> میانگین ماهانه:{' '}
                <strong className="num">
                  {formatNumber(Math.round(metrics.series.reduce((s, m) => s + m.revenue, 0) / (metrics.series.length || 1)))}
                </strong>
              </span>
              <span className="chart-legend-item">
                <i style={{ background: 'var(--success)' }} /> هزینه ماهانه:{' '}
                <strong className="num">
                  {formatNumber(metrics.series[metrics.series.length - 1]?.cost || 0)}
                </strong>
              </span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHead title="وضعیت وصول مطالبات" subtitle="نسبت دریافت‌شده به کل فاکتورها" />
          <CardBody>
            {donutData.length ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--s-5)' }}>
                  <DonutChart
                    size={186}
                    centerValue={`${formatNumber(collectRate)}٪`}
                    centerLabel="وصول شده"
                    ariaLabel="وضعیت وصول مطالبات"
                    data={donutData}
                  />
                </div>
                <div className="legend">
                  {donutData.map((d) => (
                    <div key={d.label} className="legend__item">
                      <span className="legend__swatch" style={{ background: d.color }} />
                      <span className="legend__label">{d.label}</span>
                      <span className="legend__value num">{formatNumber(d.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState icon={Wallet} title="فاکتوری ثبت نشده است" message="با صدور اولین فاکتور، وضعیت وصول مطالبات اینجا نمایش داده می‌شود." compact />
            )}
          </CardBody>
        </Card>
      </div>

      <div className="grid grid--wide" style={{ marginBottom: 'var(--s-5)' }}>
        <Card>
          <CardHead
            title="فاکتورهای اخیر"
            subtitle="آخرین فاکتورهای صادرشده"
            icon={FileText}
            actions={<Button variant="ghost" size="sm" icon={ArrowRight} onClick={() => navigate('/app/invoices')}>همه فاکتورها</Button>}
          />
          <CardBody flush>
            {recent.length ? recent.map((inv) => (
              <Link key={inv.id} to={`/app/invoices/${inv.id}`} className="list-row">
                <span className="badge badge--info"><span className="num">{inv.number}</span></span>
                <div className="list-row__main">
                  <div className="list-row__title">{customerById[inv.customerId]?.name || '—'}</div>
                  <div className="list-row__meta">
                    <span className="num">{formatJalali(inv.issueDate)}</span>
                    <span>{relativeDay(inv.issueDate)}</span>
                  </div>
                </div>
                <span className="list-row__value num">{formatNumber(invoiceTotals(inv).total)}</span>
                <StatusBadge status={resolveStatus(inv)} />
              </Link>
            )) : (
              <EmptyState
                icon={FileText}
                title="هنوز فاکتوری صادر نشده"
                message="اولین فاکتور خود را بسازید تا اینجا نمایش داده شود."
                action={<Button variant="accent" icon={FileText} onClick={() => navigate('/app/invoices/new')}>ایجاد فاکتور</Button>}
                compact
              />
            )}
          </CardBody>
        </Card>

        <div className="stack" style={{ gap: 'var(--s-5)' }}>
          <Card>
            <CardHead title="فاکتورهای سررسیدشده" icon={AlertTriangle} />
            <CardBody flush>
              {metrics.overdue.length ? metrics.overdue.slice(0, 4).map((r) => (
                <Link key={r.invoice.id} to={`/app/invoices/${r.invoice.id}`} className="list-row">
                  <div className="list-row__main">
                    <div className="list-row__title">{customerById[r.invoice.customerId]?.name || '—'}</div>
                    <div className="list-row__meta">
                      <span className="num">سررسید: {formatJalali(r.invoice.dueDate)}</span>
                    </div>
                  </div>
                  <span className="list-row__value num" style={{ color: 'var(--danger)' }}>
                    {formatNumber(r.remaining)}
                  </span>
                </Link>
              )) : (
                <EmptyState icon={AlertTriangle} title="فاکتور معوقی وجود ندارد" message="همه فاکتورها در بازه سررسید خود هستند." compact />
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHead title="سررسیدهای نزدیک" icon={Clock} />
            <CardBody flush>
              {dueSoon.length ? dueSoon.map((r) => (
                <Link key={r.invoice.id} to={`/app/invoices/${r.invoice.id}`} className="list-row">
                  <div className="list-row__main">
                    <div className="list-row__title">{customerById[r.invoice.customerId]?.name || '—'}</div>
                    <div className="list-row__meta">
                      <span className="num">{formatJalali(r.invoice.dueDate)}</span>
                      <span>{relativeDay(r.invoice.dueDate)}</span>
                    </div>
                  </div>
                  <span className="list-row__value num">{formatNumber(r.remaining)}</span>
                </Link>
              )) : (
                <EmptyState icon={Clock} title="سررسید نزدیکی نیست" message="فاکتور پرداخت‌نشده‌ای با سررسید آینده ندارید." compact />
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="grid grid--2" style={{ marginBottom: 'var(--s-5)' }}>
        <Card>
          <CardHead title="دسترسی سریع" subtitle="کارهای پرتکرار روزانه" />
          <CardBody>
            <div className="quick-actions">
              {[
                { icon: FileText, label: 'ایجاد فاکتور', to: '/app/invoices/new' },
                { icon: UserPlus, label: 'افزودن مشتری', to: '/app/customers' },
                { icon: Package, label: 'کالا و خدمات', to: '/app/products' },
                { icon: Receipt, label: 'ثبت هزینه', to: '/app/expenses' },
                { icon: Wallet, label: 'ثبت دریافت', to: '/app/receipts' },
                { icon: TrendingUp, label: 'گزارش‌های مالی', to: '/app/reports' },
              ].map((a) => (
                <button key={a.label} type="button" className="quick-action" onClick={() => navigate(a.to)}>
                  <span className="quick-action__icon" aria-hidden="true"><a.icon size={18} /></span>
                  <span className="quick-action__label">{a.label}</span>
                </button>
              ))}
            </div>

            {lowStock.length ? (
              <div className="note note--warning" style={{ marginTop: 'var(--s-5)' }}>
                <AlertTriangle size={18} className="note__icon" aria-hidden="true" />
                <div>
                  <div className="note__title">هشدار موجودی</div>
                  <div className="note__body">
                    {lowStock.length} کالا به حد هشدار رسیده است:{' '}
                    {lowStock.slice(0, 3).map((p) => p.name).join('، ')}
                    {lowStock.length > 3 ? ' و ...' : ''}
                  </div>
                </div>
              </div>
            ) : null}
          </CardBody>
        </Card>

        <Card>
          <CardHead title="مشتریان برتر" subtitle="بر اساس مبلغ فاکتورها" />
          <CardBody>
            {metrics.topCustomers.length ? (
              <RankBars
                items={metrics.topCustomers}
                format={(v) => `${formatNumber(v)} ${currency}`}
              />
            ) : (
              <EmptyState icon={UserPlus} title="داده‌ای برای نمایش نیست" message="با صدور فاکتور، مشتریان برتر محاسبه می‌شوند." compact />
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
