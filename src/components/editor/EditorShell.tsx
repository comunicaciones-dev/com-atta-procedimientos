"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Boletin, Seccion, SeccionBloque } from "@/lib/schema";
import { EditorForm } from "./EditorForm";
import { EditorPreview } from "./EditorPreview";
import { EditorSidebar, type Selection } from "./EditorSidebar";
import { ExportarMenu } from "./ExportarMenu";
import { useAutosave } from "./useAutosave";

/**
 * EditorShell — cliente raíz del editor /edit/[id].
 *
 * Responsabilidades:
 *  - Holds estado del Boletin (single useState con el objeto completo).
 *  - Coordina autoguardado (useAutosave).
 *  - Layout de 3 paneles + barra superior con indicador de guardado y
 *    botón "Publicar".
 *  - Operaciones estructurales: agregar/eliminar/reordenar secciones y
 *    bloques (la edición de campos vive dentro de EditorForm).
 */
export function EditorShell({ initial }: { initial: Boletin }) {
  const router = useRouter();
  const [boletin, setBoletin] = useState(initial);
  const [selection, setSelection] = useState<Selection>({ kind: "metadata" });
  const saveState = useAutosave(boletin);
  const [publishing, setPublishing] = useState(false);

  function reorderSecciones(next: Seccion[]) {
    setBoletin({ ...boletin, secciones: next });
  }

  function reorderBloques(seccionId: string, next: SeccionBloque[]) {
    setBoletin({
      ...boletin,
      secciones: boletin.secciones.map((s) =>
        s.id === seccionId ? { ...s, bloques: next } : s,
      ),
    });
  }

  function addSeccion() {
    const id = `seccion-${Math.random().toString(36).slice(2, 8)}`;
    const nueva: Seccion = {
      id,
      titulo: "Nueva sección",
      bloques: [],
    };
    setBoletin({ ...boletin, secciones: [...boletin.secciones, nueva] });
    setSelection({ kind: "seccion", seccionId: id });
  }

  function deleteSeccion(seccionId: string) {
    setBoletin({
      ...boletin,
      secciones: boletin.secciones.filter((s) => s.id !== seccionId),
    });
    if (
      (selection.kind === "seccion" && selection.seccionId === seccionId) ||
      (selection.kind === "bloque" && selection.seccionId === seccionId)
    ) {
      setSelection({ kind: "metadata" });
    }
  }

  function addBloque(seccionId: string, tipo: SeccionBloque["tipo"]) {
    const nuevo = nuevoBloque(tipo);
    let nuevoIdx = 0;
    setBoletin((() => {
      const next = {
        ...boletin,
        secciones: boletin.secciones.map((s) => {
          if (s.id !== seccionId) return s;
          nuevoIdx = s.bloques.length;
          return { ...s, bloques: [...s.bloques, nuevo] };
        }),
      };
      return next;
    })());
    // Seleccionamos el nuevo bloque para edición inmediata.
    setSelection({
      kind: "bloque",
      seccionId,
      bloqueIdx: nuevoIdx,
    });
  }

  function deleteBloque(seccionId: string, bloqueIdx: number) {
    setBoletin({
      ...boletin,
      secciones: boletin.secciones.map((s) =>
        s.id === seccionId
          ? { ...s, bloques: s.bloques.filter((_, i) => i !== bloqueIdx) }
          : s,
      ),
    });
    if (
      selection.kind === "bloque" &&
      selection.seccionId === seccionId &&
      selection.bloqueIdx === bloqueIdx
    ) {
      setSelection({ kind: "seccion", seccionId });
    }
  }

  async function publish() {
    const errs = validar(boletin);
    if (errs.length > 0) {
      alert(
        "No se puede publicar todavía:\n\n• " + errs.join("\n• "),
      );
      return;
    }
    if (!confirm("¿Publicar este boletín? Una vez publicado es inmutable.")) {
      return;
    }
    setPublishing(true);
    try {
      const res = await fetch(`/api/boletines/${boletin.id}/publish`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result: Boletin = await res.json();
      router.push(`/n/${result.numero}`);
    } catch (err) {
      console.error(err);
      alert("No se pudo publicar. Revisar consola.");
      setPublishing(false);
    }
  }

  return (
    <div className="flex h-screen flex-col bg-slate-100 font-sans">
      <Topbar
        boletin={boletin}
        saveState={saveState}
        publishing={publishing}
        onPublish={publish}
      />
      <div className="grid flex-1 grid-cols-[280px_minmax(380px,440px)_minmax(0,1fr)] overflow-hidden">
        <EditorSidebar
          boletin={boletin}
          selection={selection}
          onSelect={setSelection}
          onReorderSecciones={reorderSecciones}
          onReorderBloques={reorderBloques}
          onAddSeccion={addSeccion}
          onDeleteSeccion={deleteSeccion}
          onAddBloque={addBloque}
          onDeleteBloque={deleteBloque}
        />
        <EditorForm
          boletin={boletin}
          selection={selection}
          setBoletin={setBoletin}
        />
        <EditorPreview
          boletin={boletin}
          selection={selection}
          onSelect={setSelection}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Topbar
// ---------------------------------------------------------------------

function Topbar({
  boletin,
  saveState,
  publishing,
  onPublish,
}: {
  boletin: Boletin;
  saveState: ReturnType<typeof useAutosave>;
  publishing: boolean;
  onPublish: () => void;
}) {
  return (
    <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-3">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-u-red">
          Editor de boletín
        </p>
        <h1 className="truncate text-base font-bold text-u-navy-deep">
          Edición N° {String(boletin.numero).padStart(2, "0")} ·{" "}
          {boletin.fecha.mes} {boletin.fecha.anio}
        </h1>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <SaveIndicator state={saveState} />
        <ExportarMenu id={boletin.id} />
        <Link
          href="/"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          ← Listado
        </Link>
        <button
          type="button"
          onClick={onPublish}
          disabled={publishing}
          className="rounded-md bg-u-red px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#c52a2f] disabled:opacity-60"
        >
          {publishing ? "Publicando…" : "Publicar"}
        </button>
      </div>
    </header>
  );
}

function SaveIndicator({
  state,
}: {
  state: ReturnType<typeof useAutosave>;
}) {
  let text = "Sin cambios";
  let cls = "text-slate-500";
  if (state.status === "guardando") {
    text = "Guardando…";
    cls = "text-slate-600";
  } else if (state.status === "guardado") {
    const seg = Math.round((Date.now() - state.at) / 1000);
    text = seg < 5 ? "Guardado" : `Guardado · hace ${seg}s`;
    cls = "text-emerald-600";
  } else if (state.status === "error") {
    text = `Error: ${state.message.slice(0, 40)}`;
    cls = "text-red-600";
  }
  return (
    <span className={"text-[12px] tabular-nums " + cls}>{text}</span>
  );
}

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------

function nuevoBloque(tipo: SeccionBloque["tipo"]): SeccionBloque {
  switch (tipo) {
    case "parrafo":
      return { tipo, contenido: "Nuevo párrafo." };
    case "leadbar":
      return { tipo, contenido: "Nuevo leadbar." };
    case "tarjetas-grid":
      return {
        tipo,
        columnas: 2,
        variante: "simple",
        tarjetas: [{ titulo: "Tarjeta", items: [""] }],
      };
    case "lista-check":
      return { tipo, items: [""] };
    case "lista-x":
      return { tipo, items: [""] };
    case "callout-naranja":
      return { tipo, contenido: "" };
    case "detalle-resaltado":
      return { tipo, titulo: "Detalle", incluye: [""] };
  }
}

/**
 * Validación previa a publicar. Por ahora chequeamos lo mínimo:
 *  - Numero entero positivo.
 *  - Hero con título y subtítulo no vacíos.
 *  - Cada sección con título no vacío.
 *  - Footer con email de contacto.
 */
function validar(b: Boletin): string[] {
  const errs: string[] = [];
  if (!Number.isInteger(b.numero) || b.numero < 1) {
    errs.push("Metadata: número de edición debe ser entero positivo.");
  }
  if (!b.hero.titulo.trim()) errs.push("Hero: título vacío.");
  if (!b.hero.subtitulo.trim()) errs.push("Hero: subtítulo vacío.");
  b.secciones.forEach((s, i) => {
    if (!s.titulo.trim())
      errs.push(`Sección ${i + 1}: título vacío.`);
  });
  if (!b.footer.contacto.email.includes("@"))
    errs.push("Footer: email de contacto inválido.");
  return errs;
}
