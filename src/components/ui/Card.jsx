/** Surface primitives used across the app shell and marketing pages. */

export function Card({ children, className = '', as: Comp = 'div', ...rest }) {
  return (
    <Comp className={`card ${className}`} {...rest}>
      {children}
    </Comp>
  );
}

export function CardHead({ title, subtitle, actions, icon: Icon }) {
  return (
    <div className="card__head">
      <div className="card__head-main">
        {Icon ? (
          <span className="card__head-icon" aria-hidden="true">
            <Icon size={18} />
          </span>
        ) : null}
        <div>
          <h3 className="card__title">{title}</h3>
          {subtitle ? <p className="card__subtitle">{subtitle}</p> : null}
        </div>
      </div>
      {actions ? <div className="card__actions">{actions}</div> : null}
    </div>
  );
}

export function CardBody({ children, className = '', flush = false }) {
  return <div className={`card__body ${flush ? 'card__body--flush' : ''} ${className}`}>{children}</div>;
}

export function PageHeader({ title, subtitle, actions, breadcrumbs }) {
  return (
    <header className="page-head">
      <div className="page-head__text">
        {breadcrumbs?.length ? (
          <nav className="crumbs" aria-label="مسیر صفحه">
            {breadcrumbs.map((c, i) => (
              <span key={c.label} className="crumbs__item">
                {c.to ? <a href={c.to}>{c.label}</a> : <span>{c.label}</span>}
                {i < breadcrumbs.length - 1 ? <span className="crumbs__sep" aria-hidden="true">/</span> : null}
              </span>
            ))}
          </nav>
        ) : null}
        <h1 className="page-head__title">{title}</h1>
        {subtitle ? <p className="page-head__subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="page-head__actions">{actions}</div> : null}
    </header>
  );
}
