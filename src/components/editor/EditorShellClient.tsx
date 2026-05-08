"use client";

import dynamic from "next/dynamic";
import type { Boletin } from "@/lib/schema";

/**
 * Carga el EditorShell sin SSR.
 *
 * Razón: dnd-kit genera IDs internos para accesibilidad
 * (`DndDescribedBy-N`) que cambian entre el render del server y el del
 * client, lo que rompe la hidratación. Además, el panel Metadata muestra
 * `new Date(...).toLocaleString("es-CL")` y la formación de fecha
 * difiere sutilmente entre Node y el browser (NBSP en el formato AM/PM).
 *
 * Skip SSR resuelve ambos. El usuario ve un placeholder mínimo unos ms
 * mientras el bundle del editor se carga; eso es aceptable para un
 * editor interno que el usuario abre conscientemente.
 */
const EditorShell = dynamic(
  () => import("./EditorShell").then((m) => m.EditorShell),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 font-sans text-slate-500">
        Cargando editor…
      </div>
    ),
  },
);

export function EditorShellClient({ initial }: { initial: Boletin }) {
  return <EditorShell initial={initial} />;
}
