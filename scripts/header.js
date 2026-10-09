/* Sticky header, mobile navigation and scroll spy. */
export function initHeader() {
  const header = document.getElementById('site-header');
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('primary-navigation');
  const backdrop = document.getElementById('nav-backdrop');
  if (!header || !toggle || !nav) return;

  /* Header shadow once the page is scrolled. */
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Mobile menu (dropdown panel). */
  const mobile = window.matchMedia('(max-width: 980px)');

  const setOpen = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'بستن منو' : 'باز کردن منو');

    if (backdrop) {
      if (open) {
        backdrop.hidden = false;
        requestAnimationFrame(() => backdrop.classList.add('is-open'));
      } else {
        backdrop.classList.remove('is-open');
        window.setTimeout(() => {
          if (!nav.classList.contains('is-open')) backdrop.hidden = true;
        }, 260);
      }
    }
    document.body.style.overflow = open ? 'hidden' : '';
  };

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  if (backdrop) backdrop.addEventListener('click', () => setOpen(false));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });

  /* Close the panel after choosing a destination. */
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });

  mobile.addEventListener('change', (event) => {
    if (!event.matches) setOpen(false);
  });

  /* Scroll spy — highlight the section currently in view. */
  const links = Array.from(document.querySelectorAll('.nav-link'));
  const targets = new Map();

  links.forEach((link) => {
    const id = link.getAttribute('href')?.slice(1);
    const section = id && document.getElementById(id);
    if (section) targets.set(section, link);
  });

  if (!targets.size || !('IntersectionObserver' in window)) return;

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          link.classList.remove('is-active');
          link.removeAttribute('aria-current');
        });
        const active = targets.get(entry.target);
        if (active) {
          active.classList.add('is-active');
          active.setAttribute('aria-current', 'true');
        }
      });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );

  targets.forEach((_link, section) => spy.observe(section));
}
