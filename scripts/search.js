/* Search modal — filters the page's sections and jumps to the match. */
const INDEX = [
  { id: 'home', title: 'خانه', desc: 'معرفی 2HS و نرم‌افزار آنلاین صدور فاکتور و صورتحساب', keywords: 'خانه اصلی شروع استاد فاکتور' },
  { id: 'features', title: 'ویژگی‌ها', desc: 'صدور آسان فاکتور، دسترسی ابری، امنیت و رشد کسب‌وکار', keywords: 'ویژگی امکانات ابری امنیت رشد صدور' },
  { id: 'services', title: 'خدمات', desc: 'مدیریت فاکتورها، گزارش‌های مالی، مشتریان و کنترل فروش', keywords: 'خدمات مدیریت فاکتور گزارش مالی مشتری فروش درآمد' },
  { id: 'pricing', title: 'قیمت‌گذاری', desc: 'پلن‌های شروع، حرفه‌ای و سازمانی', keywords: 'قیمت پلن تعرفه اشتراک ماهانه حرفه‌ای سازمانی' },
  { id: 'about', title: 'درباره ما', desc: 'درباره 2HS و راهکار مدیریت بهتر کسب‌وکار', keywords: 'درباره ما شرکت تیم امنیت پشتیبانی' },
  { id: 'contact', title: 'تماس با ما', desc: 'فرم تماس و راه‌های ارتباط با تیم 2HS', keywords: 'تماس ارتباط فرم پشتیبانی ایمیل تلفن' },
];

export function initSearch() {
  const modal = document.getElementById('search-modal');
  const openBtn = document.getElementById('search-open');
  const closeBtn = document.getElementById('search-close');
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  if (!modal || !openBtn || !input || !results) return;

  let lastFocused = null;

  const render = (query) => {
    const q = query.trim().toLowerCase();
    const matches = INDEX.filter((item) =>
      !q || `${item.title} ${item.desc} ${item.keywords}`.toLowerCase().includes(q)
    );

    if (!matches.length) {
      results.innerHTML = '<li class="search-empty">نتیجه‌ای یافت نشد.</li>';
      return;
    }

    results.innerHTML = matches
      .map(
        (item) =>
          `<li><button type="button" class="search-result" data-target="${item.id}">` +
          `<span class="search-result-title">${item.title}</span>` +
          `<span class="search-result-desc">${item.desc}</span>` +
          '</button></li>'
      )
      .join('');
  };

  const open = () => {
    lastFocused = document.activeElement;
    modal.hidden = false;
    render('');
    input.value = '';
    input.focus();
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  };

  openBtn.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);

  modal.addEventListener('click', (event) => {
    if (event.target.closest('[data-close-modal]')) close();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.hidden) close();
    if (event.key === 'Tab' && !modal.hidden) trapFocus(event);
  });

  input.addEventListener('input', () => render(input.value));

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      const first = results.querySelector('.search-result');
      if (first) first.click();
    }
  });

  results.addEventListener('click', (event) => {
    const button = event.target.closest('.search-result');
    if (!button) return;
    const target = document.getElementById(button.dataset.target);
    close();
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
  });

  const trapFocus = (event) => {
    const focusables = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
}
