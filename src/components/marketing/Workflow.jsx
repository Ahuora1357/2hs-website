import { UserPlus, FileText, Send, CircleCheckBig } from 'lucide-react';
import Reveal from './Reveal.jsx';

const STEPS = [
  { icon: UserPlus, title: 'مشتری را ثبت کنید', desc: 'اطلاعات مشتری و شرایط پرداخت را در چند ثانیه وارد کنید.' },
  { icon: FileText, title: 'اقلام فاکتور را اضافه کنید', desc: 'کالا یا خدمت را انتخاب کنید؛ قیمت و مالیات خودکار اعمال می‌شود.' },
  { icon: Send, title: 'فاکتور را ارسال یا چاپ کنید', desc: 'خروجی PDF با برند شما، چاپ مستقیم یا ارسال به مشتری.' },
  { icon: CircleCheckBig, title: 'دریافت را ثبت کنید', desc: 'با ثبت دریافت، مانده فاکتور و وضعیت پرداخت به‌روز می‌شود.' },
];

export default function Workflow() {
  return (
    <section className="section section--deep">
      <div className="container">
        <Reveal className="section__head">
          <span className="section__eyebrow">گردش کار</span>
          <h2 className="section__title">از مشتری تا دریافت، در چهار گام ساده</h2>
          <p className="section__desc">
            مسیر صدور فاکتور در 2HS کوتاه و روشن است؛ نیازی به دانش تخصصی حسابداری نیست.
          </p>
        </Reveal>

        <div className="steps">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 80}>
              <article className="step">
                <span className="step__num num" aria-hidden="true">
                  {['۱', '۲', '۳', '۴'][i]}
                </span>
                <h3 className="step__title">{s.title}</h3>
                <p className="step__desc">{s.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
