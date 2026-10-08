import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import { TextField, Checkbox } from '../../components/ui/Form.jsx';
import { useAuth, DEMO_CREDENTIALS } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '', remember: true });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectTo = location.state?.from || '/app';

  const submit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    window.setTimeout(() => {
      const res = login(form);
      setLoading(false);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      toast.success('خوش آمدید! به 2HS وارد شدید.', { title: 'ورود موفق' });
      navigate(redirectTo, { replace: true });
    }, 550);
  };

  const fillDemo = () => {
    setForm({ email: DEMO_CREDENTIALS.email, password: DEMO_CREDENTIALS.password, remember: true });
    setError('');
  };

  return (
    <div className="auth__card">
      <h1 className="auth__title">ورود به حساب کاربری</h1>
      <p className="auth__sub">برای مدیریت فاکتورها و امور مالی کسب‌وکارتان وارد شوید.</p>

      <form className="auth__form" onSubmit={submit} noValidate>
        <TextField
          label="ایمیل"
          type="email"
          required
          dir="ltr"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          error={error && !form.email ? 'ایمیل را وارد کنید.' : undefined}
        />

        <div style={{ position: 'relative' }}>
          <TextField
            label="رمز عبور"
            type={showPassword ? 'text' : 'password'}
            required
            dir="ltr"
            autoComplete="current-password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
          <button
            type="button"
            className="icon-btn"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'پنهان کردن رمز عبور' : 'نمایش رمز عبور'}
            style={{ position: 'absolute', insetInlineEnd: 4, bottom: 4 }}
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>

        {error ? (
          <p className="field__error" role="alert">{error}</p>
        ) : null}

        <div className="auth__row">
          <Checkbox
            label="مرا به خاطر بسپار"
            checked={form.remember}
            onChange={(e) => setForm((f) => ({ ...f, remember: e.target.checked }))}
          />
          <Link to="/forgot-password" style={{ fontSize: 'var(--fs-sm)' }}>
            رمز عبور را فراموش کرده‌اید؟
          </Link>
        </div>

        <Button type="submit" variant="primary" size="lg" block loading={loading} icon={LogIn}>
          ورود به 2HS
        </Button>
      </form>

      <div className="auth__divider">حساب کاربری ندارید؟</div>

      <Button as={Link} to="/register" variant="outline" size="lg" block>
        ساخت حساب کاربری رایگان
      </Button>

      <div className="auth__hint">
        <strong>حساب نمونه:</strong> برای مشاهده سریع محصول، از دکمه زیر استفاده کنید.
        <div style={{ marginTop: 'var(--s-3)' }}>
          <Button variant="ghost" size="sm" onClick={fillDemo}>
            پر کردن با حساب نمونه
          </Button>
        </div>
      </div>
    </div>
  );
}
