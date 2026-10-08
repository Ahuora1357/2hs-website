import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, Eye, EyeOff } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import { TextField } from '../../components/ui/Form.jsx';
import { ProgressBar } from '../../components/ui/Misc.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function ResetPassword() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = (() => {
    const p = form.password;
    let s = 0;
    if (p.length >= 6) s += 34;
    if (/[A-Za-z]/.test(p) && /\d/.test(p)) s += 33;
    if (p.length >= 10) s += 33;
    return Math.min(100, s);
  })();

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (form.password.length < 6) next.password = 'رمز عبور باید حداقل ۶ کاراکتر باشد.';
    if (form.password !== form.confirm) next.confirm = 'تکرار رمز عبور مطابقت ندارد.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      toast.success('رمز عبور شما با موفقیت تغییر کرد.', { title: 'تغییر موفق' });
      navigate('/login', { replace: true });
    }, 600);
  };

  return (
    <div className="auth__card">
      <h1 className="auth__title">تعیین رمز عبور جدید</h1>
      <p className="auth__sub">یک رمز عبور قوی انتخاب کنید تا حساب شما امن بماند.</p>

      <form className="auth__form" onSubmit={submit} noValidate>
        <div style={{ position: 'relative' }}>
          <TextField
            label="رمز عبور جدید"
            type={show ? 'text' : 'password'}
            required
            dir="ltr"
            autoComplete="new-password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            error={errors.password}
          />
          <button
            type="button"
            className="icon-btn"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? 'پنهان کردن رمز عبور' : 'نمایش رمز عبور'}
            style={{ position: 'absolute', insetInlineEnd: 4, bottom: 4 }}
          >
            {show ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>

        {form.password ? (
          <div className="row gap-3">
            <ProgressBar value={strength} label="قدرت رمز عبور" tone={strength < 50 ? 'danger' : strength < 80 ? 'gold' : 'success'} />
            <span className="faint" style={{ whiteSpace: 'nowrap' }}>
              {strength < 50 ? 'ضعیف' : strength < 80 ? 'متوسط' : 'قوی'}
            </span>
          </div>
        ) : null}

        <TextField
          label="تکرار رمز عبور جدید"
          type={show ? 'text' : 'password'}
          required
          dir="ltr"
          autoComplete="new-password"
          placeholder="••••••••"
          value={form.confirm}
          onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
          error={errors.confirm}
        />

        <Button type="submit" variant="primary" size="lg" block loading={loading} icon={KeyRound}>
          ذخیره رمز عبور جدید
        </Button>
      </form>

      <p className="auth__alt">
        <Link to="/login">بازگشت به صفحه ورود</Link>
      </p>
    </div>
  );
}
