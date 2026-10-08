import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import Reveal from './Reveal.jsx';
import Button from '../ui/Button.jsx';

export default function FinalCta() {
  return (
    <section className="section">
      <div className="container">
        <Reveal>
          <div className="final-cta">
            <h2 className="final-cta__title">کسب‌وکار خود را هوشمندتر مدیریت کنید</h2>
            <p className="final-cta__desc">
              همین امروز با 2HS امور مالی، فروش و فاکتورهای خود را ساده‌تر کنید.
            </p>
            <Button as={Link} to="/register" variant="accent" size="lg" icon={Sparkles}>
              شروع رایگان
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
