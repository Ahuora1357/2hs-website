import { useId } from 'react';
import { AlertCircle } from 'lucide-react';

/** Accessible labelled control wrapper with hint + error messaging. */
export function Field({ label, hint, error, required, children, className = '', id }) {
  const autoId = useId();
  const fieldId = id || autoId;
  return (
    <div className={`field ${error ? 'field--error' : ''} ${className}`}>
      {label ? (
        <label className="field__label" htmlFor={fieldId}>
          {label}
          {required ? <span className="field__req" aria-hidden="true">*</span> : null}
        </label>
      ) : null}
      {children({ id: fieldId, 'aria-invalid': Boolean(error), 'aria-describedby': error ? `${fieldId}-err` : hint ? `${fieldId}-hint` : undefined })}
      {error ? (
        <p className="field__error" id={`${fieldId}-err`} role="alert">
          <AlertCircle size={14} aria-hidden="true" /> {error}
        </p>
      ) : hint ? (
        <p className="field__hint" id={`${fieldId}-hint`}>{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({ className = '', ...rest }) {
  return <input className={`input ${className}`} {...rest} />;
}

export function Textarea({ className = '', rows = 3, ...rest }) {
  return <textarea className={`input textarea ${className}`} rows={rows} {...rest} />;
}

export function Select({ options = [], placeholder, children, className = '', ...rest }) {
  return (
    <select className={`input select ${className}`} {...rest}>
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((opt) => {
        const value = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        return (
          <option key={value} value={value}>
            {label}
          </option>
        );
      })}
      {children}
    </select>
  );
}

/** Single helper to keep form markup short and consistent. */
export function TextField({ label, hint, error, required, id, ...rest }) {
  return (
    <Field label={label} hint={hint} error={error} required={required} id={id}>
      {(props) => <Input {...props} {...rest} />}
    </Field>
  );
}

export function SelectField({ label, hint, error, required, id, options, placeholder, children, ...rest }) {
  return (
    <Field label={label} hint={hint} error={error} required={required} id={id}>
      {(props) => (
        <Select {...props} options={options} placeholder={placeholder} {...rest}>
          {children}
        </Select>
      )}
    </Field>
  );
}

export function TextareaField({ label, hint, error, required, id, ...rest }) {
  return (
    <Field label={label} hint={hint} error={error} required={required} id={id}>
      {(props) => <Textarea {...props} {...rest} />}
    </Field>
  );
}

export function Checkbox({ label, className = '', ...rest }) {
  return (
    <label className={`check ${className}`}>
      <input type="checkbox" {...rest} />
      <span>{label}</span>
    </label>
  );
}

export function Switch({ checked, onChange, label, id }) {
  return (
    <label className="switch" htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={Boolean(checked)}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span className="switch__track" aria-hidden="true">
        <span className="switch__thumb" />
      </span>
      {label ? <span className="switch__label">{label}</span> : null}
    </label>
  );
}
