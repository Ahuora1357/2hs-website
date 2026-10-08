import { Link, Outlet } from 'react-router-dom';
import { FileText, TrendingUp, ShieldCheck, Users } from 'lucide-react';
import Logo from '../brand/Logo.jsx';

const POINTS = [
  { icon: FileText, text: 'صدور فاکتور حرفه‌ای در چند دقیقه' },
  { icon: TrendingUp, text: 'گزارش‌های مالی دقیق و قابل فهم' },
  { icon: Users, text: 'مدیریت مشتریان و سوابق مالی' },
  { icon: ShieldCheck, text: 'دسترسی چندکاربره و امن' },
];

export default function AuthLayout() {
  return (
    <div className="auth">
      <aside className="auth__aside">
        <Link to="/" aria-label="بازگشت به صفحه اصلی">
          <Logo size={46} variant="light" />
        </Link>

        <div className="auth__pitch">
          <h2 className="auth__pitch-title">
            نرم‌افزار حسابداری، صدور فاکتور و مدیریت مالی تحت وب
          </h2>
          <p className="auth__pitch-desc">
            مدیریت حرفه‌ای فاکتورها و امور مالی شما — با 2HS همه‌چیز شفاف، دقیق و همیشه در دسترس است.
          </p>

          <ul className="auth__points">
            {POINTS.map((p) => (
              <li key={p.text} className="auth__point">
                <span className="auth__point-icon" aria-hidden="true"><p.icon size={15} /></span>
                <span>{p.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p style={{ position: 'relative', fontSize: 'var(--fs-sm)', opacity: 0.8 }}>
          © <span className="num">۱۴۰۵</span> هسین حاسب سپاهان — HACIN HASEB SEPAHAN
        </p>
      </aside>

      <div className="auth__form-wrap">
        <Outlet />
      </div>
    </div>
  );
}
