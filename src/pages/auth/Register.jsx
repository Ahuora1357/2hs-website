import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import { TextField, Checkbox } from '../../components/ui/Form.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { ProgressBar } from '../../components/ui/Misc.jsx';

export default function Register() {
  const navigate = useNavigate();
  const toast = useToast();
  const { register } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', terms: false });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const strength = (() => {
    const p = form.password;
    let s = 0;
    if (p.length >= 6) s += 34;
    if (/[A-Za-z]/.test(p) && /\d/.test(p)) s += 33;
    if (p.length >= 10) s += 33;
    return Math.min(100, s);
  })();

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = 'نام و نام خانوادگی را وارد کنید.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'ایمیل معتبر وارد کنید.';
    if (form.password.length < 6) next.password = 'رمز عبور باید حداقل ۶ کاراکتر باشد.';
    if (form.password !== form.confirm) next.confirm = 'تکرار رمز عبور مطابقت ندارد.';
    if (!form.terms) next.terms = 'برای ادامه باید قوانین را بپذیرید.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    window.setTimeout(() => {
      const res = register(form);
      setLoading(false);
      if (!res.ok) {
        setErrors({ email: res.error });
        return;
      }
      toast.success('حساب شما ساخته شد. بیایید کسب‌وکارتان را راه‌اندازی کنیم.', { title: 'خوش آمدید' });
      navigate('/onboarding', { replace: true });
    }, 650);
  };

  return (
    <div className="auth__card">
      <h1 className="auth__title">ساخت حساب کاربری</h1>
      <p className="auth__sub">۱۴ روز استفاده آزمایشی رایگان — بدون نیاز به کارت بانکی.</p>

      <form className="auth__form" onSubmit={submit} noValidate>
        <TextField
          label="نام و نام خانوادگی"
          required
          autoComplete="name"
          placeholder="مثلاً مریم شریفی"
          value={form.name}
          onChange={set('name')}
          error={errors.name}
        />

        <TextField
          label="ایمیل"
          type="email"
          required
          dir="ltr"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={set('email')}
          error={errors.email}
        />

        <div style={{ position: 'relative' }}>
          <TextField
            label="رمز عبور"
            type={showPassword ? 'text' : 'password'}
            required
            dir="ltr"
            autoComplete="new-password"
            placeholder="••••••••"
            value={form.password}
            onChange={set('password')}
            error={errors.password}
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

        {form.password ? (
          <div className="row gap-3">
            <ProgressBar
              value={strength}
              label="قدرت رمز عبور"
              tone={strength < 50 ? 'danger' : strength < 80 ? 'gold' : 'success'}
            />
            <span className="faint" style={{ whiteSpace: 'nowrap' }}>
              {strength < 50 ? 'ضعیف' : strength < 80 ? 'متوسط' : 'قوی'}
            </span>
          </div>
        ) : null}

        <TextField
          label="تکرار رمز عبور"
          type={showPassword ? 'text' : 'password'}
          required
          dir="ltr"
          autoComplete="new-password"
          placeholder="••••••••"
          value={form.confirm}
          onChange={set('confirm')}
          error={errors.confirm}
        />

        <div>
          <Checkbox
            label="قوانین استفاده و سیاست حریم خصوصی 2HS را می‌پذیرم."
            checked={form.terms}
            onChange={(e) => setForm((f) => ({ ...f, terms: e.target.checked }))}
          />
          {errors.terms ? <p className="field__error" role="alert">{errors.terms}</p> : null}
        </div>

        <Button type="submit" variant="accent" size="lg" block loading={loading} icon={UserPlus}>
          ساخت حساب و شروع
        </Button>
      </form>

      <p className="auth__alt">
        قبلاً ثبت‌نام کرده‌اید؟ <Link to="/login">وارد شوید</Link>
      </p>
    </div>
  );
}
