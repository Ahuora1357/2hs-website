/* Contact + newsletter forms with client-side validation in Persian. */

const FA = '۰۱۲۳۴۵۶۷۸۹';
const AR = '٠١٢٣٤٥٦٧٨٩';

const toEnglishDigits = (value) =>
  value
    .replace(/[۰-۹]/g, (d) => String(FA.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(AR.indexOf(d)));

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^(?:\+98|0098|98|0)?9\d{9}$/;

function setError(input, message) {
  const box = document.getElementById(`${input.id}-error`);
  if (message) {
    input.setAttribute('aria-invalid', 'true');
    if (box) {
      box.textContent = message;
      box.hidden = false;
    }
  } else {
    input.removeAttribute('aria-invalid');
    if (box) {
      box.textContent = '';
      box.hidden = true;
    }
  }
  return !message;
}

/* Validation rules, keyed by field id. */
const RULES = {
  'cf-name': (v) =>
    !v.trim() ? 'لطفاً نام و نام خانوادگی خود را وارد کنید.' : v.trim().length < 3 ? 'نام باید حداقل ۳ حرف باشد.' : '',
  'cf-phone': (v) =>
    !v.trim()
      ? 'لطفاً شماره تماس خود را وارد کنید.'
      : !PHONE_RE.test(toEnglishDigits(v).replace(/[\s-]/g, ''))
        ? 'شماره تماس معتبر وارد کنید (مثال: ۰۹۱۲۳۴۵۶۷۸۹).'
        : '',
  'cf-email': (v) =>
    !v.trim() ? 'لطفاً ایمیل خود را وارد کنید.' : !EMAIL_RE.test(toEnglishDigits(v).trim()) ? 'ایمیل معتبر وارد کنید.' : '',
  'cf-subject': (v) => (!v.trim() ? 'لطفاً موضوع پیام را وارد کنید.' : ''),
  'cf-message': (v) =>
    !v.trim() ? 'لطفاً متن پیام را وارد کنید.' : v.trim().length < 10 ? 'متن پیام باید حداقل ۱۰ حرف باشد.' : '',
};

function attachFieldBehaviour(input) {
  const rule = RULES[input.id];
  input.addEventListener('input', () => {
    if (input.getAttribute('aria-invalid') === 'true') setError(input, rule(input.value));
  });
  input.addEventListener('blur', () => {
    if (input.value.trim()) setError(input, rule(input.value));
  });
}

/* ---------------------------------------------------------------
   Contact form
   --------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const status = document.getElementById('contact-status');
  const submit = form.querySelector('button[type="submit"]');
  const fields = Array.from(form.querySelectorAll('input[name], textarea[name]'));
  fields.forEach(attachFieldBehaviour);

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    let firstInvalid = null;
    fields.forEach((input) => {
      const rule = RULES[input.id];
      const ok = rule ? setError(input, rule(input.value)) : true;
      if (!ok && !firstInvalid) firstInvalid = input;
    });

    if (firstInvalid) {
      status.textContent = 'لطفاً خطاهای مشخص‌شده را اصلاح کنید.';
      status.className = 'form-status is-error';
      firstInvalid.focus();
      return;
    }

    /* No backend on this landing page — simulate the send locally. */
    status.textContent = '';
    status.className = 'form-status';
    submit.disabled = true;
    const original = submit.textContent;
    submit.textContent = 'در حال ارسال…';

    window.setTimeout(() => {
      submit.disabled = false;
      submit.textContent = original;
      form.reset();
      fields.forEach((input) => setError(input, ''));
      status.textContent = 'پیام شما با موفقیت ارسال شد. به‌زودی با شما تماس می‌گیریم.';
      status.className = 'form-status is-success';
    }, 750);
  });
}

/* ---------------------------------------------------------------
   Newsletter form
   --------------------------------------------------------------- */
function initNewsletterForm() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;

  const input = document.getElementById('nl-email');
  const status = document.getElementById('nl-status');

  const submit = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = toEnglishDigits(input.value).trim();

    if (!value) {
      status.textContent = 'لطفاً ایمیل خود را وارد کنید.';
      status.className = 'form-status form-status-light is-error';
      input.focus();
      return;
    }
    if (!EMAIL_RE.test(value)) {
      status.textContent = 'ایمیل معتبر وارد کنید.';
      status.className = 'form-status form-status-light is-error';
      input.focus();
      return;
    }

    submit.disabled = true;
    window.setTimeout(() => {
      submit.disabled = false;
      form.reset();
      status.textContent = 'عضویت شما با موفقیت ثبت شد.';
      status.className = 'form-status form-status-light is-success';
    }, 600);
  });

  input.addEventListener('input', () => {
    if (status.classList.contains('is-error')) {
      status.textContent = '';
      status.className = 'form-status form-status-light';
    }
  });
}

export function initForms() {
  initContactForm();
  initNewsletterForm();
}
