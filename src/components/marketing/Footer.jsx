import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Send } from 'lucide-react';
import { InstagramIcon, LinkedinIcon, TwitterIcon } from '../brand/SocialIcons.jsx';
import { useState } from 'react';
import Logo from '../brand/Logo.jsx';
import Button from '../ui/Button.jsx';
import { useToast } from '../../context/ToastContext.jsx';

const PRODUCT_LINKS = [
  { label: 'امکانات', to: '/#features' },
  { label: 'قیمت‌گذاری', to: '/#pricing' },
  { label: 'راهکارها', to: '/solutions' },
  { label: 'درباره ما', to: '/about' },
];

const SUPPORT_LINKS = [
  { label: 'تماس با ما', to: '/contact' },
  { label: 'سوالات متداول', to: '/#faq' },
  { label: 'مستندات کاربری', to: '/contact' },
  { label: 'پشتیبانی فنی', to: '/contact' },
];

export default function Footer() {
  const toast = useToast();
  const [email, setEmail] = useState('');

  const subscribe = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('ایمیل وارد‌شده معتبر نیست.');
      return;
    }
    toast.success('عضویت شما در خبرنامه 2HS ثبت شد.', { title: 'ثبت شد' });
    setEmail('');
  };

  return (
    <footer className="mk-footer">
      <div className="container">
        <div className="mk-footer__grid">
          <div>
            <Logo size={44} variant="light" />
            <p className="mk-footer__desc">
              2HS راهکاری حرفه‌ای برای مدیریت حسابداری، فاکتورها، مشتریان و امور مالی کسب‌وکارهاست.
            </p>
            <div className="mk-footer__socials">
              <a className="mk-footer__social" href="#!" aria-label="اینستاگرام"><InstagramIcon size={18} /></a>
              <a className="mk-footer__social" href="#!" aria-label="لینکدین"><LinkedinIcon size={18} /></a>
              <a className="mk-footer__social" href="#!" aria-label="ایکس"><TwitterIcon size={18} /></a>
            </div>
          </div>

          <nav aria-label="محصول">
            <h3 className="mk-footer__title">محصول</h3>
            {PRODUCT_LINKS.map((l) => (
              <Link key={l.label} className="mk-footer__link" to={l.to}>{l.label}</Link>
            ))}
          </nav>

          <nav aria-label="پشتیبانی">
            <h3 className="mk-footer__title">پشتیبانی</h3>
            {SUPPORT_LINKS.map((l) => (
              <Link key={l.label} className="mk-footer__link" to={l.to}>{l.label}</Link>
            ))}
          </nav>

          <nav aria-label="امکانات کلیدی">
            <h3 className="mk-footer__title">امکانات کلیدی</h3>
            <Link className="mk-footer__link" to="/#features">صدور فاکتور</Link>
            <Link className="mk-footer__link" to="/#features">مدیریت مشتریان</Link>
            <Link className="mk-footer__link" to="/#features">گزارش‌های مالی</Link>
            <Link className="mk-footer__link" to="/#features">مدیریت دریافت و پرداخت</Link>
          </nav>

          <div>
            <h3 className="mk-footer__title">تماس با ما</h3>
            <p className="mk-footer__contact"><Phone size={16} /> <span className="num">۰۳۱-۳۶۶۶۱۱۲۲</span></p>
            <p className="mk-footer__contact"><Mail size={16} /> <span className="num">info@2hs.ir</span></p>
            <p className="mk-footer__contact"><MapPin size={16} /> <span>اصفهان، خیابان چهارباغ بالا، برج فناوری، طبقه ۷</span></p>

            <form className="mk-footer__news" onSubmit={subscribe}>
              <label className="sr-only" htmlFor="news-email">ایمیل برای خبرنامه</label>
              <input
                id="news-email"
                type="email"
                className="input"
                placeholder="ایمیل شما"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit" variant="accent" icon={Send} aria-label="عضویت در خبرنامه" />
            </form>
          </div>
        </div>

        <div className="mk-footer__bottom">
          <span className="num">© ۱۴۰۵ هسین حاسب سپاهان (2HS) — تمامی حقوق محفوظ است.</span>
          <div className="mk-footer__legal">
            <Link to="/about">قوانین و مقررات</Link>
            <Link to="/about">حریم خصوصی</Link>
            <Link to="/contact">تماس</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
