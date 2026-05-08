"use client";

import { type ReactNode } from "react";

export const inputBase =
  "block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-u-blue focus:outline-none focus:ring-2 focus:ring-u-blue/20";

export const labelBase =
  "block text-xs font-semibold uppercase tracking-wider text-slate-600";

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      {label && <span className={labelBase}>{label}</span>}
      {children}
      {hint && <span className="block text-[11px] text-slate-500">{hint}</span>}
      {error && <span className="block text-[11px] text-red-600">{error}</span>}
    </label>
  );
}

export function TextField({
  label,
  value,
  onChange,
  hint,
  placeholder,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  placeholder?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <input
        type="text"
        className={inputBase}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  hint,
  min,
  max,
}: {
  label?: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
  min?: number;
  max?: number;
}) {
  return (
    <Field label={label} hint={hint}>
      <input
        type="number"
        className={inputBase}
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </Field>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  hint,
  rows = 3,
  placeholder,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <textarea
        className={inputBase + " font-mono text-[13px] leading-snug"}
        rows={rows}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label?: string;
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <select
        className={inputBase}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function CheckboxField({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2">
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-u-blue focus:ring-u-blue/20"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>
        <span className="block text-sm font-medium text-slate-700">{label}</span>
        {hint && (
          <span className="block text-[11px] text-slate-500">{hint}</span>
        )}
      </span>
    </label>
  );
}

/**
 * Lista editable de strings: textarea por línea, botones agregar/eliminar.
 * Usa el separador \n para mantener el form simple — cada línea es un item.
 */
export function ItemsListField({
  label,
  values,
  onChange,
  hint,
  rowsPerItem = 2,
}: {
  label?: string;
  values: string[];
  onChange: (v: string[]) => void;
  hint?: string;
  rowsPerItem?: number;
}) {
  function update(i: number, v: string) {
    const next = [...values];
    next[i] = v;
    onChange(next);
  }
  function remove(i: number) {
    const next = values.filter((_, j) => j !== i);
    onChange(next);
  }
  function add() {
    onChange([...values, ""]);
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= values.length) return;
    const next = [...values];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div className="space-y-2">
      {label && <span className={labelBase}>{label}</span>}
      {values.length === 0 && (
        <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-slate-500">
          Sin items todavía.
        </p>
      )}
      {values.map((v, i) => (
        <div key={i} className="flex gap-2">
          <textarea
            className={inputBase + " font-mono text-[13px] leading-snug"}
            rows={rowsPerItem}
            value={v}
            onChange={(e) => update(i, e.target.value)}
          />
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => move(i, -1)}
              disabled={i === 0}
              className="rounded border border-slate-300 px-1.5 py-0.5 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-30"
              title="Subir"
              aria-label="Subir item"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => move(i, 1)}
              disabled={i === values.length - 1}
              className="rounded border border-slate-300 px-1.5 py-0.5 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-30"
              title="Bajar"
              aria-label="Bajar item"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => remove(i)}
              className="rounded border border-red-200 px-1.5 py-0.5 text-xs text-red-600 hover:bg-red-50"
              title="Eliminar"
              aria-label="Eliminar item"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="rounded-md border border-dashed border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
      >
        + Agregar item
      </button>
      {hint && <p className="text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}

export const INLINE_EMPHASIS_HINT =
  "Inline: [[texto]] → negrita · //texto// → énfasis (rojo en el hero, itálica en el cuerpo).";

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="border-b border-slate-200 pb-2 text-sm font-semibold uppercase tracking-wider text-u-navy-deep">
      {children}
    </h2>
  );
}
