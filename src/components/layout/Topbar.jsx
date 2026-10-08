import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Info, Menu, X, Plus, Settings, LogOut, User, FileText, Users as UsersIcon, Package } from 'lucide-react';
import Button from '../ui/Button.jsx';
import { Avatar } from '../ui/Badge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useData } from '../../context/DataContext.jsx';
import { formatMoney } from '../../lib/format.js';
import { formatJalali, relativeDay } from '../../lib/date.js';
import { invoiceTotals } from '../../lib/calc.js';
import { useMoney } from '../../hooks/useMoney.js';

export default function Topbar({ onOpenMenu }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { invoices, customers, products, notifications, markAllNotificationsRead, markNotificationRead, customerById } = useData();
  const { currency } = useMoney();

  const [query, setQuery] = useState('');
  const [panel, setPanel] = useState(null); // 'notifications' | 'user' | 'help'
  const wrapRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setPanel(null);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  const results = useMemo(() => {
    const q = query.trim();
    if (q.length < 2) return [];
    const match = (s) => String(s || '').includes(q);
    const out = [];
    invoices.filter((i) => match(i.number) || match(customerById[i.customerId]?.name)).slice(0, 4)
      .forEach((i) => out.push({
        id: i.id, type: 'فاکتور', title: `فاکتور ${i.number}`,
        sub: customerById[i.customerId]?.name || '', to: `/app/invoices/${i.id}`, icon: FileText,
      }));
    customers.filter((c) => match(c.name) || match(c.phone)).slice(0, 4)
      .forEach((c) => out.push({
        id: c.id, type: 'مشتری', title: c.name, sub: c.phone || c.city || '',
        to: `/app/customers/${c.id}`, icon: UsersIcon,
      }));
    products.filter((p) => match(p.name) || match(p.sku)).slice(0, 4)
      .forEach((p) => out.push({
        id: p.id, type: 'کالا/خدمت', title: p.name, sub: p.sku || '', to: '/app/products', icon: Package,
      }));
    return out;
  }, [query, invoices, customers, products, customerById]);

  const go = (to) => {
    setPanel(null);
    setQuery('');
    navigate(to);
  };

  return (
    <header className="topbar" ref={wrapRef}>
      <button type="button" className="topbar__menu" onClick={onOpenMenu} aria-label="باز کردن منو">
        <Menu size={18} />
      </button>

      <div className="topbar__search">
        <Search size={17} className="topbar__search-icon" aria-hidden="true" />
        <label className="sr-only" htmlFor="global-search">جست‌وجوی سراسری</label>
        <input
          id="global-search"
          className="input"
          placeholder="جست‌وجو در فاکتورها، مشتریان و کالاها…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />
        {query.trim().length >= 2 ? (
          <div className="popover popover--end" style={{ insetInlineStart: 0, insetInlineEnd: 'auto' }} role="listbox">
            <div className="popover__head">
              <span className="popover__title">نتایج جست‌وجو</span>
              <button type="button" className="icon-btn" onClick={() => setQuery('')} aria-label="پاک کردن"><X size={15} /></button>
            </div>
            <div className="popover__list">
              {results.length === 0 ? (
                <div className="popover__item" style={{ color: 'var(--text-muted)' }}>نتیجه‌ای یافت نشد.</div>
              ) : (
                results.map((r) => (
                  <button key={`${r.type}-${r.id}`} type="button" className="popover__item" onClick={() => go(r.to)}>
                    <span className="report-tile__icon" style={{ width: 32, height: 32, flex: 'none' }} aria-hidden="true">
                      <r.icon size={15} />
                    </span>
                    <span className="grow">
                      <span className="popover__item-title">{r.title}</span>
                      <span className="popover__item-body">{r.type}{r.sub ? ` — ${r.sub}` : ''}</span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        ) : null}
      </div>

      <div className="topbar__spacer" />

      <div className="topbar__actions">
        <Button variant="accent" size="sm" icon={Plus} onClick={() => navigate('/app/invoices/new')}>
          ایجاد فاکتور
        </Button>

        {/* help */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setPanel(panel === 'help' ? null : 'help')}
            aria-label="راهنما"
            aria-expanded={panel === 'help'}
          >
            <Info size={18} />
          </button>
          {panel === 'help' ? (
            <div className="popover popover--end">
              <div className="popover__head"><span className="popover__title">راهنمای سریع</span></div>
              <div className="menu-list">
                <button type="button" className="menu-list__item" onClick={() => go('/app/invoices/new')}>
                  <FileText size={17} /> چگونه فاکتور صادر کنم؟
                </button>
                <button type="button" className="menu-list__item" onClick={() => go('/app/receipts')}>
                  <Plus size={17} /> ثبت دریافت از مشتری
                </button>
                <button type="button" className="menu-list__item" onClick={() => go('/app/reports')}>
                  <Info size={17} /> مشاهده گزارش سود و زیان
                </button>
                <div className="menu-list__sep" />
                <div style={{ padding: '8px 12px', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>
                  پشتیبانی: <span className="num">۰۳۱-۳۶۶۶۱۱۲۲</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* notifications */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setPanel(panel === 'notifications' ? null : 'notifications')}
            aria-label={`اعلان‌ها${unread ? ` — ${unread} خوانده‌نشده` : ''}`}
            aria-expanded={panel === 'notifications'}
          >
            <Bell size={18} />
            {unread ? <span className="icon-btn__dot" /> : null}
          </button>
          {panel === 'notifications' ? (
            <div className="popover popover--end" style={{ width: 380 }}>
              <div className="popover__head">
                <span className="popover__title">مرکز اعلان‌ها</span>
                {unread ? (
                  <button type="button" className="faint" style={{ background: 'none', border: 0, cursor: 'pointer', color: 'var(--brand)' }} onClick={markAllNotificationsRead}>
                    خواندن همه
                  </button>
                ) : null}
              </div>
              <div className="popover__list">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    className={`popover__item ${n.read ? '' : 'is-unread'}`}
                    onClick={() => {
                      markNotificationRead(n.id);
                      if (n.type === 'danger' || n.type === 'warning') go('/app/invoices');
                    }}
                  >
                    <span className={`popover__dot popover__dot--${n.type}`} aria-hidden="true" />
                    <span className="grow">
                      <span className="popover__item-title">{n.title}</span>
                      <span className="popover__item-body">{n.body}</span>
                      <span className="faint">{relativeDay(n.date)}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* user */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="topbar__user"
            onClick={() => setPanel(panel === 'user' ? null : 'user')}
            aria-label="منوی کاربر"
            aria-expanded={panel === 'user'}
          >
            <Avatar name={user?.name || 'کاربر'} size={30} />
            <span className="topbar__user-name">{user?.name || 'کاربر'}</span>
          </button>
          {panel === 'user' ? (
            <div className="popover popover--end">
              <div className="popover__head">
                <div>
                  <div className="popover__title">{user?.name}</div>
                  <div className="faint">{user?.email}</div>
                </div>
              </div>
              <div className="menu-list">
                <button type="button" className="menu-list__item" onClick={() => go('/app/settings')}>
                  <User size={17} /> پروفایل کاربری
                </button>
                <button type="button" className="menu-list__item" onClick={() => go('/app/settings')}>
                  <Settings size={17} /> تنظیمات کسب‌وکار
                </button>
                <div className="menu-list__sep" />
                <button
                  type="button"
                  className="menu-list__item is-danger"
                  onClick={() => { logout(); navigate('/'); }}
                >
                  <LogOut size={17} /> خروج از حساب
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
