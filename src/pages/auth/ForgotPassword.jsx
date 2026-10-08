import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MailCheck, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import { TextField } from '../../components/ui/Form.jsx';
import { InfoNote } from '../../components/ui/Misc.jsx';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('ایمیل معتبر وارد کنید.');
      return;
    }
    setError('');
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 600);
  };

  if (sent) {
    return (
      <div className="auth__card center">
        <div className="done-check" aria-hidden="true"><MailCheck size={34} /></div>
        <h1 className="auth__title">ایمیل بازیابی ارسال شد</h1>
        <p className="auth__sub" style={{ marginBottom: 'var(--s-5)' }}>
          لینک بازنشانی رمز عبور به <span className="num strong">{email}</span> ارسال شد. اگر ایمیل را
          نمی‌بینید، پوشه اسپم را بررسی کنید.
        </p>
        <Button as={Link} to="/reset-password" variant="primary" block icon={ArrowRight}>
          ادامه به بازنشانی رمز
        </Button>
        <p className="auth__alt">
          <Link to="/login">بازگشت به صفحه ورود</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="auth__card">
      <h1 className="auth__title">بازیابی رمز عبور</h1>
      <p className="auth__sub">
        ایمیل حساب خود را وارد کنید؛ لینک بازنشانی رمز برای شما ارسال می‌شود.
      </p>

      <form className="auth__form" onSubmit={submit} noValidate>
        <TextField
          label="ایمیل"
          type="email"
          required
          dir="ltr"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
        />
        <Button type="submit" variant="primary" size="lg" block loading={loading}>
          ارسال لینک بازیابی
        </Button>
      </form>

      <div style={{ marginTop: 'var(--s-5)' }}>
        <InfoNote tone="info">
          اگر حساب کاربری ندارید، ابتدا <Link to="/register">ثبت‌نام</Link> کنید.
        </InfoNote>
      </div>

      <p className="auth__alt">
        <Link to="/login">بازگشت به صفحه ورود</Link>
      </p>
    </div>
  );
}
