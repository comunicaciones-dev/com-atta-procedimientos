"use client";

import { useRef, useState } from "react";
import { labelBase } from "./widgets";

type Props = {
  value?: string;
  onChange: (url: string | undefined) => void;
};

/**
 * Subida de imagen para hero.imagenFondo. POST a /api/upload con
 * multipart/form-data; el endpoint usa Vercel Blob en producción y
 * public/uploads/ en dev local.
 *
 * Estados:
 *  - sin imagen: se muestra el default /uatta-hero-bg.jpg con un botón
 *    "Subir imagen propia".
 *  - con imagen custom: se muestra el preview, "Subir otra" y
 *    "Restaurar default" (limpia value a undefined).
 */
export function ImagenFondoField({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const urlActual = value ?? "/uatta-hero-bg.jpg";
  const esDefault = !value;

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permitir re-subir el mismo archivo
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const { url } = (await res.json()) as { url: string };
      onChange(url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <span className={labelBase}>Imagen de fondo</span>
      <div className="overflow-hidden rounded-md border border-slate-200 bg-slate-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={urlActual}
          alt="Vista previa"
          className="h-32 w-full object-cover"
        />
      </div>
      <p className="text-[11px] text-slate-500">
        {esDefault
          ? "Usando la imagen institucional por defecto."
          : "Imagen personalizada."}
      </p>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={onPick}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {busy ? "Subiendo…" : esDefault ? "Subir imagen propia" : "Subir otra"}
        </button>
        {!esDefault && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            Restaurar default
          </button>
        )}
      </div>
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-[11px] text-red-700">
          {error}
        </p>
      )}
      <p className="text-[11px] text-slate-500">
        JPG, PNG, WebP o AVIF · máx 5 MB. La imagen se sirve con cache
        público — para reemplazarla con otra basta con subir una nueva.
      </p>
    </div>
  );
}
