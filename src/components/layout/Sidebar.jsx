import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Users, Package, Receipt, Wallet,
  Banknote, Landmark, TrendingUp, Settings, LogOut, ChevronLeft, ChevronRight,
} from 'lucide-react';
import Logo from '../brand/Logo.jsx';
import Button from '../ui/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useData } from '../../context/DataContext.jsx';

export const NAV_GROUPS = [
  {
    title: '',
    items: [{ to: '/app', label: 'داشبورد', icon: LayoutDashboard, end: true }],
  },
  {
    title: 'فروش',
    items: [
      { to: '/app/invoices', label: 'فاکتورها', icon: FileText },
      { to: '/app/customers', label: 'مشتریان', icon: Users },
      { to: '/app/products', label: 'کالاها و خدمات', icon: Package },
    ],
  },
  {
    title: 'مالی',
    items: [
      { to: '/app/expenses', label: 'هزینه‌ها', icon: Receipt },
      { to: '/app/receipts', label: 'دریافت‌ها', icon: Wallet },
      { to: '/app/payments', label: 'پرداخت‌ها', icon: Banknote },
      { to: '/app/accounts', label: 'حساب‌های بانکی', icon: Landmark },
    ],
  },
  {
    title: 'تحلیل',
    items: [{ to: '/app/reports', label: 'گزارش‌های مالی', icon: TrendingUp }],
  },
  {
    title: 'سازمان',
    items: [
      { to: '/app/users', label: 'کاربران و دسترسی‌ها', icon: Users },
      { to: '/app/settings', label: 'تنظیمات', icon: Settings },
    ],
  },
];

export default function Sidebar({ collapsed, onToggleCollapse, open, onClose }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { invoices, notifications } = useData();
  const unread = notifications.filter((n) => !n.read).length;
  const openInvoices = invoices.filter((i) => i.status === 'sent').length;

  const badgeFor = (to) => {
    if (to === '/app/invoices' && openInvoices) return openInvoices;
    if (to === '/app/settings' && unread) return unread;
    return null;
  };

  return (
    <aside className={`sidebar ${open ? 'is-open' : ''}`} aria-label="ناوبری برنامه">
      <div className="sidebar__brand">
        <NavLink to="/app" aria-label="داشبورد 2HS">
          <Logo size={38} />
        </NavLink>
        <button
          type="button"
          className="sidebar__collapse"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'باز کردن نوار کناری' : 'جمع کردن نوار کناری'}
          aria-pressed={collapsed}
        >
          {collapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      <nav className="sidebar__scroll">
        {NAV_GROUPS.map((group, gi) => (
          <div className="nav-group" key={group.title || `g${gi}`}>
            {group.title ? <div className="nav-group__title">{group.title}</div> : null}
            {group.items.map((item) => {
              const badge = badgeFor(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}
                  onClick={onClose}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="nav-item__icon" aria-hidden="true"><item.icon size={19} /></span>
                  <span className="nav-item__label">{item.label}</span>
                  {badge ? <span className="nav-item__badge num">{badge}</span> : null}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar__foot">
        <div className="sidebar__plan">
          <div className="sidebar__plan-title">پلن حرفه‌ای</div>
          <div className="sidebar__plan-desc">۱۴ روز باقی‌مانده از دوره آزمایشی</div>
          <Button variant="accent" size="sm" block onClick={() => navigate('/app/settings')}>
            ارتقای پلن
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          block
          icon={LogOut}
          style={{ marginTop: 'var(--s-3)' }}
          onClick={() => {
            logout();
            navigate('/');
          }}
        >
          {collapsed ? '' : `خروج ${user?.name ? `(${user.name})` : ''}`}
        </Button>
      </div>
    </aside>
  );
}
