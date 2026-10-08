import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Reveal from './Reveal.jsx';

const FAQS = [
  {
    q: 'برای استفاده از 2HS به دانش حسابداری نیاز دارم؟',
    a: 'خیر. رابط 2HS با زبان ساده طراحی شده است؛ اگر با فاکتور و مشتری کار می‌کنید، می‌توانید بدون دانش تخصصی حسابداری از آن استفاده کنید. برای تیم‌های مالی نیز گزارش‌ها و ساختار حساب‌ها کامل و دقیق است.',
  },
  {
    q: 'آیا اطلاعات مالی من امن است؟',
    a: 'بله. دسترسی‌ها بر اساس نقش کاربری کنترل می‌شود، ارتباط‌ها رمزنگاری شده‌اند و پشتیبان‌گیری منظم انجام می‌شود. شما می‌توانید در هر زمان از داده‌های خود خروجی بگیرید.',
  },
  {
    q: 'می‌توانم فاکتورها را با لوگو و سربرگ شرکت خودم صادر کنم؟',
    a: 'بله. در بخش تنظیمات می‌توانید نام، لوگو، اطلاعات تماس، مالیات و پاورقی فاکتور را تنظیم کنید تا فاکتورهای چاپی دقیقاً با هویت برند شما منتشر شوند.',
  },
  {
    q: 'آیا امکان کار چندکاربره وجود دارد؟',
    a: 'در پلن حرفه‌ای و سازمانی، چند کاربر با نقش‌های مدیر اصلی، حسابدار، فروشنده و مشاهده‌گر می‌توانند هم‌زمان کار کنند و هر کاربر فقط به بخش‌های مجاز دسترسی دارد.',
  },
  {
    q: 'آیا گزارش‌ها قابل خروجی گرفتن هستند؟',
    a: 'بله. تمام گزارش‌ها قابلیت چاپ، خروجی PDF و خروجی Excel دارند و می‌توانید بازه تاریخ شمسی و فیلترهای دلخواه را اعمال کنید.',
  },
  {
    q: 'آیا می‌توانم قبل از خرید، نسخه آزمایشی را امتحان کنم؟',
    a: 'بله. ۱۴ روز استفاده آزمایشی رایگان بدون نیاز به کارت بانکی فعال است. در این مدت به همه امکانات پلن حرفه‌ای دسترسی دارید.',
  },
];

export default function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <section className="section section--tint" id="faq">
      <div className="container">
        <Reveal className="section__head">
          <span className="section__eyebrow">سوالات متداول</span>
          <h2 className="section__title">پاسخ پرسش‌های پرتکرار</h2>
        </Reveal>

        <div className="faq">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={item.q} delay={i * 40}>
                <div className={`faq__item ${isOpen ? 'is-open' : ''}`}>
                  <h3>
                    <button
                      type="button"
                      className="faq__q"
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${i}`}
                      onClick={() => setOpen(isOpen ? -1 : i)}
                    >
                      <span>{item.q}</span>
                      <ChevronDown size={20} className="faq__icon" aria-hidden="true" />
                    </button>
                  </h3>
                  <div id={`faq-panel-${i}`} hidden={!isOpen}>
                    <p className="faq__a">{item.a}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
