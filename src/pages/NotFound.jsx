import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import Button from '../components/ui/Button.jsx';

export default function NotFound() {
  return (
    <div className="section" style={{ minHeight: '70vh', display: 'grid', placeItems: 'center' }}>
      <div className="container center" style={{ maxWidth: 560 }}>
        <span className="empty__icon" style={{ margin: '0 auto var(--s-5)' }} aria-hidden="true">
          <Compass size={30} />
        </span>
        <h1 style={{ fontSize: 'var(--fs-5xl)', fontWeight: 800 }}>صفحه پیدا نشد</h1>
        <p className="muted" style={{ marginTop: 'var(--s-3)' }}>
          آدرسی که دنبال آن هستید وجود ندارد یا جابه‌جا شده است.
        </p>
        <div className="row gap-3" style={{ justifyContent: 'center', marginTop: 'var(--s-6)' }}>
          <Button as={Link} to="/" variant="accent" icon={Home}>صفحه اصلی</Button>
          <Button as={Link} to="/app" variant="outline">داشبورد</Button>
        </div>
      </div>
    </div>
  );
}
