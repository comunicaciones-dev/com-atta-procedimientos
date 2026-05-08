"use client";

import { useEffect, useRef, useState } from "react";
import { Boletin } from "@/components/boletin/Boletin";
import type { Boletin as BoletinModel } from "@/lib/schema";
import type { Selection } from "./EditorSidebar";

/**
 * Preview en vivo del boletín. El artículo mide 980 px de ancho fijo;
 * para que entre en el panel disponible (que es típicamente menor)
 * usamos transform: scale dinámico. transform-origin: top center
 * mantiene el boletín centrado horizontalmente en el panel.
 *
 * Click-to-edit: la prop onSelect dispara la selección del campo
 * cuando el usuario hace click en un elemento del preview con un
 * atributo `data-edit` (los inyecta <Boletin editTargets/>). El walk
 * usa closest() para que el target más interno gane (un click sobre
 * un párrafo dentro de un bloque selecciona el bloque, no la sección).
 */
export function EditorPreview({
  boletin,
  selection,
  onSelect,
}: {
  boletin: BoletinModel;
  selection: Selection;
  onSelect: (s: Selection) => void;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      const ideal = 1012;
      const next = Math.min(1, w / ideal);
      setScale(next);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    const node = target.closest("[data-edit]") as HTMLElement | null;
    if (!node) return;
    const raw = node.dataset.edit;
    if (!raw) return;
    const sel = parseEditTarget(raw);
    if (!sel) return;
    e.preventDefault();
    e.stopPropagation();
    onSelect(sel);
  }

  const selToken = selectionToken(selection);

  return (
    <div
      ref={wrapperRef}
      // min-w-0 es crítico: el wrapper vive en una columna 1fr de un grid
      // padre. Sin min-width:0, el contenido intrinsic (boletin 980px)
      // expande la columna y rompe el layout. Con min-w-0 la columna se
      // achica al espacio disponible y la scale se computa contra eso.
      className="h-full min-w-0 overflow-y-auto overflow-x-hidden bg-[#eef0f4]"
    >
      <div
        onClick={handleClick}
        data-selected-edit={selToken ?? undefined}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          width: "100%",
          padding: "16px 0",
        }}
        className="editor-preview-canvas"
      >
        <div className="uatta-page">
          <Boletin boletin={boletin} editTargets />
        </div>
      </div>
    </div>
  );
}

/**
 * Convierte un valor de `data-edit` (string) a una Selection del editor.
 * Formatos soportados:
 *   "metadata" | "hero" | "audiencia" | "flujo" | "cierre" | "footer"
 *   "seccion:<id>"
 *   "bloque:<seccion-id>:<index>"
 */
function parseEditTarget(raw: string): Selection | null {
  if (raw === "metadata") return { kind: "metadata" };
  if (raw === "hero") return { kind: "hero" };
  if (raw === "audiencia") return { kind: "audiencia" };
  if (raw === "flujo") return { kind: "flujo" };
  if (raw === "cierre") return { kind: "cierre" };
  if (raw === "footer") return { kind: "footer" };

  if (raw.startsWith("seccion:")) {
    const seccionId = raw.slice("seccion:".length);
    if (!seccionId) return null;
    return { kind: "seccion", seccionId };
  }
  if (raw.startsWith("bloque:")) {
    const rest = raw.slice("bloque:".length);
    const lastColon = rest.lastIndexOf(":");
    if (lastColon < 0) return null;
    const seccionId = rest.slice(0, lastColon);
    const idx = parseInt(rest.slice(lastColon + 1), 10);
    if (!seccionId || Number.isNaN(idx)) return null;
    return { kind: "bloque", seccionId, bloqueIdx: idx };
  }
  return null;
}

/**
 * Token que coincide con el data-edit del elemento seleccionado, para
 * que el CSS pueda resaltarlo via [data-selected-edit] CSS scoping.
 */
function selectionToken(s: Selection): string | null {
  switch (s.kind) {
    case "metadata":
    case "hero":
    case "audiencia":
    case "flujo":
    case "cierre":
    case "footer":
      return s.kind;
    case "seccion":
      return `seccion:${s.seccionId}`;
    case "bloque":
      return `bloque:${s.seccionId}:${s.bloqueIdx}`;
  }
}
