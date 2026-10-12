import clsx from "clsx";

// Labelled form controls with inline errors (aria-invalid + aria-describedby).

const control =
  "block w-full rounded-md border bg-white px-3.5 text-[15px] text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-ink focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-brand";

type Base = { name: string; label: string; error?: string; hint?: string; optional?: boolean; className?: string };

export function Field({
  name,
  label,
  error,
  hint,
  optional,
  className,
  children,
}: Base & { children: (props: { id: string; "aria-invalid"?: true; "aria-describedby"?: string; className: string }) => React.ReactNode }) {
  const id = `f-${name}`;
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-semibold">
        {label}
        {optional && <span className="ml-1.5 font-normal text-muted">(optional)</span>}
      </label>
      <div className="mt-1.5">
        {children({
          id,
          "aria-invalid": error ? true : undefined,
          "aria-describedby": describedBy,
          className: clsx(control, error ? "border-brand-strong" : "border-line hover:border-ink/40"),
        })}
      </div>
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-medium text-brand-strong">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextField(
  props: Base & { type?: string; autoComplete?: string; defaultValue?: string; placeholder?: string; inputMode?: "text" | "tel" | "email" | "numeric" },
) {
  const { name, type = "text", autoComplete, defaultValue, placeholder, inputMode, optional } = props;
  return (
    <Field {...props}>
      {(p) => (
        <input
          {...p}
          name={name}
          type={type}
          autoComplete={autoComplete}
          defaultValue={defaultValue}
          placeholder={placeholder}
          inputMode={inputMode}
          required={!optional}
          className={clsx(p.className, "h-12")}
        />
      )}
    </Field>
  );
}

export function TextArea(props: Base & { rows?: number; defaultValue?: string; placeholder?: string }) {
  const { name, rows = 4, defaultValue, placeholder, optional } = props;
  return (
    <Field {...props}>
      {(p) => (
        <textarea
          {...p}
          name={name}
          rows={rows}
          defaultValue={defaultValue}
          placeholder={placeholder}
          required={!optional}
          className={clsx(p.className, "py-3 leading-relaxed")}
        />
      )}
    </Field>
  );
}

export function SelectField(
  props: Base & {
    value?: string;
    defaultValue?: string;
    onChange?: (v: string) => void;
    autoComplete?: string;
    options: { value: string; label: string }[];
    groups?: { label: string; options: { value: string; label: string }[] }[];
  },
) {
  const { name, value, defaultValue, onChange, autoComplete, options, groups } = props;
  return (
    <Field {...props}>
      {(p) => (
        <select
          {...p}
          name={name}
          value={value}
          defaultValue={defaultValue}
          autoComplete={autoComplete}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          className={clsx(p.className, "h-12")}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
          {groups?.map((g) => (
            <optgroup key={g.label} label={g.label}>
              {g.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      )}
    </Field>
  );
}
