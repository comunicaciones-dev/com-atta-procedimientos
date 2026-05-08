"use client";

import { useState } from "react";

type Props = {
  /** Si está, se usa como ?id=<id>; si no, se usa ?numero=<numero>. */
  id?: string;
  numero?: number;
  align?: "left" | "right";
};

const FORMATOS: Array<{
  key: "html" | "pdf" | "png" | "pptx";
  label: string;
  hint: string;
}> = [
  { key: "pdf", label: "PDF", hint: "Página única, fidelidad institucional · server-side" },
  { key: "html", label: "HTML autocontenido", hint: "Archivo con CSS y assets embebidos · botón propio para PDF" },
  { key: "png", label: "PNG portada", hint: "Imagen de portada (header + hero + audiencia) a 1600 px" },
  { key: "pptx", label: "PowerPoint (.pptx)", hint: "Portada + 1 slide por sección + slide de flujo" },
];

/**
 * Botón con menú desplegable para exportar el boletín. Cada formato es
 * una descarga directa via window.location (Content-Disposition lo
 * convierte en download). Toast/inline state mientras tarda.
 */
export function ExportarMenu({ id, numero, align = "right" }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  function descargar(formato: "html" | "pdf" | "png" | "pptx") {
    const params = new URLSearchParams();
    if (id) params.set("id", id);
    else if (numero != null) params.set("numero", String(numero));
    const url = `/api/export/${formato}?${params.toString()}`;

    setBusy(formato);
    setAbierto(false);

    const a = document.createElement("a");
    a.href = url;
    a.rel = "noopener";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // No tenemos forma de saber cuándo termina la descarga real. Damos
    // 4 segundos para PDFs/PPTs y luego liberamos el estado.
    setTimeout(() => setBusy(null), formato === "pdf" || formato === "pptx" ? 4000 : 1500);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Exportar ▾
      </button>
      {abierto && (
        <>
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setAbierto(false)}
            className="fixed inset-0 z-10 cursor-default"
          />
          <div
            className={
              "absolute z-20 mt-1 w-72 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg " +
              (align === "right" ? "right-0" : "left-0")
            }
          >
            <ul className="divide-y divide-slate-100">
              {FORMATOS.map((f) => (
                <li key={f.key}>
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => descargar(f.key)}
                    className="block w-full px-4 py-3 text-left hover:bg-slate-50 disabled:opacity-60"
                  >
                    <span className="block text-sm font-medium text-slate-900">
                      {f.label}
                      {busy === f.key && (
                        <span className="ml-2 text-xs text-slate-500">
                          generando…
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-slate-500">
                      {f.hint}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
