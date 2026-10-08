import { LogoMark } from '../brand/Logo.jsx';
import { formatJalali, formatJalaliLong } from '../../lib/date.js';
import { invoiceTotals, resolveStatus, statusMeta } from '../../lib/calc.js';
import { formatNumber } from '../../lib/format.js';
import { StatusBadge } from '../ui/Badge.jsx';

/**
 * Printable invoice document — brand header, parties, item table, totals,
 * payment info and signature area. RTL and print-ready.
 */
export default function InvoicePreview({ invoice, customer, settings }) {
  if (!invoice) return null;
  const totals = invoiceTotals(invoice);
  const status = resolveStatus(invoice);
  const meta = statusMeta(status);
  const currency = settings?.currency || 'تومان';

  const money = (v) => `${formatNumber(v)} ${currency}`;

  return (
    <article className="invoice-doc" id="invoice-doc">
      <header className="invoice-doc__top">
        <div className="invoice-doc__brand">
          <LogoMark size={54} />
          <div>
            <div className="invoice-doc__biz">{settings?.businessName || 'نام کسب‌وکار'}</div>
            <div className="invoice-doc__biz-meta">
              {settings?.address ? <div>{settings.address}</div> : null}
              <div>
                {settings?.phone ? <span className="num">{settings.phone}</span> : null}
                {settings?.email ? <span className="num"> — {settings.email}</span> : null}
              </div>
              {settings?.taxNumber ? (
                <div>شماره اقتصادی: <span className="num">{settings.taxNumber}</span></div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="invoice-doc__title-block">
          <div className="invoice-doc__title">فاکتور فروش</div>
          <div className="invoice-doc__number">
            شماره: <span className="num strong">{invoice.number}</span>
          </div>
          <div style={{ marginTop: 'var(--s-3)' }}>
            <StatusBadge status={status} />
          </div>
        </div>
      </header>

      <div className="invoice-doc__parties">
        <section>
          <div className="invoice-doc__party-label">مشخصات خریدار</div>
          <div className="invoice-doc__party-name">{customer?.name || '—'}</div>
          <div className="invoice-doc__party-meta">
            {customer?.contact ? <div>رابط: {customer.contact}</div> : null}
            {customer?.phone ? <div>تلفن: <span className="num">{customer.phone}</span></div> : null}
            {customer?.email ? <div>ایمیل: <span className="num">{customer.email}</span></div> : null}
            {customer?.nationalId ? <div>شماره اقتصادی/ملی: <span className="num">{customer.nationalId}</span></div> : null}
            {customer?.address ? <div>{customer.address}{customer.city ? `، ${customer.city}` : ''}</div> : null}
          </div>
        </section>

        <section>
          <div className="invoice-doc__party-label">اطلاعات فاکتور</div>
          <dl className="invoice-doc__party-meta">
            <div className="detail-row">
              <dt className="detail-row__label">تاریخ صدور</dt>
              <dd className="detail-row__value num">{formatJalaliLong(invoice.issueDate)}</dd>
            </div>
            <div className="detail-row">
              <dt className="detail-row__label">تاریخ سررسید</dt>
              <dd className="detail-row__value num">{formatJalaliLong(invoice.dueDate)}</dd>
            </div>
            <div className="detail-row">
              <dt className="detail-row__label">شرایط پرداخت</dt>
              <dd className="detail-row__value">
                {customer?.paymentTerms ? `تا ${formatNumber(customer.paymentTerms)} روز` : 'نقدی'}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <table className="invoice-doc__table">
        <caption className="sr-only">اقلام فاکتور</caption>
        <thead>
          <tr>
            <th style={{ width: 40 }}>#</th>
            <th>شرح کالا / خدمت</th>
            <th style={{ width: 80 }}>تعداد</th>
            <th style={{ width: 130 }}>مبلغ واحد</th>
            <th style={{ width: 100 }}>تخفیف</th>
            <th style={{ width: 130 }}>مبلغ کل</th>
          </tr>
        </thead>
        <tbody>
          {(invoice.items || []).map((item, index) => {
            const gross = (Number(item.qty) || 0) * (Number(item.unitPrice) || 0);
            const net = gross - (Number(item.discount) || 0);
            return (
              <tr key={item.id || index}>
                <td className="num">{formatNumber(index + 1)}</td>
                <td>{item.description || '—'}</td>
                <td className="num">{formatNumber(item.qty)}</td>
                <td className="num">{formatNumber(item.unitPrice)}</td>
                <td className="num">{formatNumber(item.discount)}</td>
                <td className="num">{formatNumber(net + Math.round(net * (Number(item.taxRate) || 0) / 100))}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4} />
            <td className="num">جمع کل</td>
            <td className="num">{formatNumber(totals.subtotal)}</td>
          </tr>
          {totals.discount ? (
            <tr>
              <td colSpan={4} />
              <td className="num">تخفیف</td>
              <td className="num">{formatNumber(totals.discount)}</td>
            </tr>
          ) : null}
          <tr>
            <td colSpan={4} />
            <td className="num">مالیات بر ارزش افزوده</td>
            <td className="num">{formatNumber(totals.tax)}</td>
          </tr>
          {totals.shipping ? (
            <tr>
              <td colSpan={4} />
              <td className="num">هزینه حمل</td>
              <td className="num">{formatNumber(totals.shipping)}</td>
            </tr>
          ) : null}
          <tr>
            <td colSpan={4} />
            <td className="num">مبلغ قابل پرداخت</td>
            <td className="num invoice-doc__grand">{money(totals.total)}</td>
          </tr>
          <tr>
            <td colSpan={4} />
            <td className="num">پرداخت‌شده</td>
            <td className="num">{formatNumber(totals.paid)}</td>
          </tr>
          <tr>
            <td colSpan={4} />
            <td className="num">مانده</td>
            <td className="num">{formatNumber(totals.remaining)}</td>
          </tr>
        </tfoot>
      </table>

      <div className="invoice-doc__foot">
        <div>
          <div className="invoice-doc__party-label">توضیحات و شرایط</div>
          <p className="invoice-doc__terms">
            {invoice.notes ? <span>{invoice.notes}<br /></span> : null}
            {invoice.terms || 'پرداخت حداکثر تا تاریخ سررسید فاکتور الزامی است.'}
          </p>
          {invoice.payments?.length ? (
            <div style={{ marginTop: 'var(--s-4)' }}>
              <div className="invoice-doc__party-label">سابقه پرداخت</div>
              <ul className="stack-sm">
                {invoice.payments.map((p) => (
                  <li key={p.id} className="row between gap-3" style={{ fontSize: 'var(--fs-sm)' }}>
                    <span className="num muted">{formatJalali(p.date)} — {p.method}</span>
                    <span className="num strong">{formatNumber(p.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="invoice-doc__sign">
          <div className="invoice-doc__party-label">مهر و امضای فروشنده</div>
          <div className="invoice-doc__sign-line">امضا و تاریخ</div>
          {status === 'paid' ? (
            <div className="invoice-doc__stamp">تسویه شده — {meta.label}</div>
          ) : null}
          <p className="faint" style={{ marginTop: 'var(--s-5)' }}>
            {settings?.invoiceFooter || 'از اعتماد شما سپاسگزاریم.'}
          </p>
        </div>
      </div>
    </article>
  );
}
