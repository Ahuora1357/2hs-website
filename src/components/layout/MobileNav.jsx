import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, TrendingUp, Plus } from 'lucide-react';

const ITEMS = [
  { to: '/app', label: 'داشبورد', icon: LayoutDashboard, end: true },
  { to: '/app/invoices', label: 'فاکتورها', icon: FileText },
  { to: '/app/customers', label: 'مشتریان', icon: Users },
  { to: '/app/reports', label: 'گزارش‌ها', icon: TrendingUp },
];

export default function MobileNav() {
  const navigate = useNavigate();
  return (
    <nav className="mobile-nav" aria-label="ناوبری موبایل">
      <div className="mobile-nav__list">
        {ITEMS.slice(0, 2).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `mobile-nav__item ${isActive ? 'is-active' : ''}`}
          >
            <item.icon size={20} aria-hidden="true" />
            <span>{item.label}</span>
          </NavLink>
        ))}

        <button
          type="button"
          className="mobile-nav__fab"
          onClick={() => navigate('/app/invoices/new')}
          aria-label="ایجاد فاکتور"
        >
          <Plus size={24} />
        </button>

        {ITEMS.slice(2).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `mobile-nav__item ${isActive ? 'is-active' : ''}`}
          >
            <item.icon size={20} aria-hidden="true" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
