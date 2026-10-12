// Small form-validation helpers shared by the checkout, quote and contact forms.

export type FieldErrors = Record<string, string>;

export class FormReader {
  errors: FieldErrors = {};
  constructor(private data: FormData) {}

  text(name: string, opts: { required?: boolean; max?: number; label?: string } = {}) {
    const raw = this.data.get(name);
    const value = typeof raw === "string" ? raw.trim().replace(/\s+/g, " ") : "";
    const label = opts.label ?? "This field";
    if (opts.required && !value) this.errors[name] = `${label} is required.`;
    else if (value.length > (opts.max ?? 200)) this.errors[name] = `${label} is too long.`;
    return value;
  }

  /** Multi-line text: keeps line breaks. */
  longText(name: string, opts: { required?: boolean; max?: number; label?: string } = {}) {
    const raw = this.data.get(name);
    const value = typeof raw === "string" ? raw.trim().replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n") : "";
    if (opts.required && !value) this.errors[name] = `${opts.label ?? "This field"} is required.`;
    else if (value.length > (opts.max ?? 3000)) this.errors[name] = `${opts.label ?? "This field"} is too long.`;
    return value;
  }

  email(name: string) {
    const value = this.text(name, { required: true, max: 200, label: "Email" }).toLowerCase();
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) this.errors[name] = "Enter a valid email address.";
    return value;
  }

  phone(name: string, required = true) {
    const value = this.text(name, { required, max: 40, label: "Phone" });
    if (value && !/^\+?[\d\s()./-]{6,}$/.test(value)) this.errors[name] = "Enter a valid phone number, e.g. +383 44 123 456.";
    return value;
  }

  oneOf<T extends string>(name: string, options: readonly T[], label = "This field"): T {
    const value = this.text(name) as T;
    if (!options.includes(value)) this.errors[name] = `${label} is required.`;
    return value;
  }

  checked(name: string, message: string) {
    const on = this.data.get(name) === "on";
    if (!on) this.errors[name] = message;
    return on;
  }

  get ok() {
    return Object.keys(this.errors).length === 0;
  }
}
