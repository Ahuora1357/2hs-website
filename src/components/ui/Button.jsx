import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

/**
 * Button — one reusable control for the whole product.
 * variant: primary | accent | secondary | outline | ghost | danger | success
 * size: sm | md | lg | icon
 */
const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    block = false,
    loading = false,
    disabled = false,
    icon: Icon = null,
    iconEnd: IconEnd = null,
    children,
    className = '',
    type = 'button',
    ...rest
  },
  ref
) {
  const isLink = Boolean(rest.to || rest.href);
  const Comp = rest.to ? Link : rest.href ? 'a' : 'button';
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    block ? 'btn--block' : '',
    loading ? 'is-loading' : '',
    Icon && !children ? 'btn--icon-only' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {loading ? <Loader2 className="btn__spinner" size={16} aria-hidden="true" /> : null}
      {Icon && !loading ? <Icon size={size === 'sm' ? 15 : 17} aria-hidden="true" /> : null}
      {children ? <span className="btn__label">{children}</span> : null}
      {IconEnd ? <IconEnd size={size === 'sm' ? 15 : 17} aria-hidden="true" /> : null}
    </>
  );

  if (isLink) {
    return (
      <Comp ref={ref} className={classes} aria-disabled={disabled || loading} {...rest}>
        {content}
      </Comp>
    );
  }

  return (
    <Comp
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      {...rest}
    >
      {content}
    </Comp>
  );
});

export default Button;
