import { Star, Quote } from 'lucide-react';
import Reveal from './Reveal.jsx';
import { Avatar } from '../ui/Badge.jsx';

const QUOTES = [
  {
    text: 'قبلاً فاکتورها را در اکسل مدیریت می‌کردیم و همیشه چند فاکتور از قلم می‌افتاد. با 2HS مانده حساب هر مشتری دقیقاً مشخص است و پیگیری مطالبات بسیار ساده‌تر شده.',
    name: 'مریم شریفی',
    role: 'مدیر مالی، شرکت بازرگانی آریا',
    tone: 'brand',
  },
  {
    text: 'بخش گزارش سود و زیان واقعاً کار ما را راحت کرد. گزارش‌ها را ماهانه چاپ می‌کنیم و برای حسابرس می‌فرستیم؛ بدون هیچ دردسری.',
    name: 'حسین نوری',
    role: 'حسابدار ارشد، گروه صنعتی سپاهان',
    tone: 'indigo',
  },
  {
    text: 'چون خودم حسابدار نیستم، سادگی رابط برایم مهم بود. صدور فاکتور در چند دقیقه انجام می‌شود و مشتریان هم فاکتور را خیلی سریع دریافت می‌کنند.',
    name: 'زهرا اکبری',
    role: 'مدیر فروش، کلینیک تخصصی مهر',
    tone: 'gold',
  },
];

export default function Testimonials() {
  return (
    <section className="section section--tint">
      <div className="container">
        <Reveal className="section__head">
          <span className="section__eyebrow">تجربه کاربران</span>
          <h2 className="section__title">کسب‌وکارهایی که با 2HS کار می‌کنند</h2>
        </Reveal>

        <div className="quotes">
          {QUOTES.map((q, i) => (
            <Reveal key={q.name} delay={i * 80}>
              <figure className="quote">
                <div className="quote__stars" aria-label="امتیاز ۵ از ۵">
                  {[0, 1, 2, 3, 4].map((n) => <Star key={n} size={16} fill="currentColor" />)}
                </div>
                <Quote size={26} style={{ color: 'var(--blue-200)' }} aria-hidden="true" />
                <blockquote className="quote__text">{q.text}</blockquote>
                <figcaption className="quote__author">
                  <Avatar name={q.name} tone={q.tone} size={42} />
                  <div>
                    <div className="quote__name">{q.name}</div>
                    <div className="quote__role">{q.role}</div>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
