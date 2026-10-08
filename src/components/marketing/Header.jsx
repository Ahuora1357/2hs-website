import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, PhoneCall } from 'lucide-react';
import Logo from '../brand/Logo.jsx';
import Button from '../ui/Button.jsx';

const NAV = [
  { label: 'صفحه اصلی', to: '/' },
  { label: 'امکانات', to: '/#features' },
  { label: 'راهکارها', to: '/solutions' },
  { label: 'قیمت‌گذاری', to: '/#pricing' },
  { label: 'درباره ما', to: '/about' },
  { label: 'تماس با ما', to: '/contact' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (to) => {
    if (to.startsWith('/#')) return pathname === '/';
    return pathname === to;
  };

  return (
    <header className={`mk-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container mk-header__inner">
        <Link to="/" aria-label="۲اچ‌اس — صفحه اصلی">
          <Logo size={40} />
        </Link>

        <nav className="mk-nav" aria-label="ناوبری اصلی">
          {NAV.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`mk-nav__link ${isActive(item.to) ? 'is-active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mk-header__actions">
          <Button as={Link} to="/login" variant="ghost" size="sm">ورود</Button>
          <Button as={Link} to="/register" variant="accent" size="sm">ثبت‌نام رایگان</Button>
          <Button as={Link} to="/contact" variant="outline" size="sm" icon={PhoneCall}>
            تماس با ما
          </Button>
          <button
            type="button"
            className="mk-burger"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mk-mobile-menu"
            aria-label={open ? 'بستن منو' : 'باز کردن منو'}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <div id="mk-mobile-menu" className={`mk-mobile ${open ? 'is-open' : ''}`}>
        <nav aria-label="ناوبری موبایل">
          {NAV.map((item) => (
            <Link key={item.label} to={item.to} className="mk-mobile__link" onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mk-mobile__cta">
          <Button as={Link} to="/login" variant="outline">ورود</Button>
          <Button as={Link} to="/register" variant="accent">ثبت‌نام رایگان</Button>
        </div>
      </div>
    </header>
  );
}
