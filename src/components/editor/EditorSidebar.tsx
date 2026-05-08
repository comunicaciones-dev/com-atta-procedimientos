"use client";

import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Boletin, Seccion, SeccionBloque } from "@/lib/schema";

export type Selection =
  | { kind: "metadata" }
  | { kind: "hero" }
  | { kind: "audiencia" }
  | { kind: "seccion"; seccionId: string }
  | { kind: "bloque"; seccionId: string; bloqueIdx: number }
  | { kind: "flujo" }
  | { kind: "cierre" }
  | { kind: "footer" };

type Props = {
  boletin: Boletin;
  selection: Selection;
  onSelect: (s: Selection) => void;
  onReorderSecciones: (next: Seccion[]) => void;
  onReorderBloques: (seccionId: string, next: SeccionBloque[]) => void;
  onAddSeccion: () => void;
  onDeleteSeccion: (seccionId: string) => void;
  onAddBloque: (seccionId: string, tipo: SeccionBloque["tipo"]) => void;
  onDeleteBloque: (seccionId: string, bloqueIdx: number) => void;
};

export function EditorSidebar({
  boletin,
  selection,
  onSelect,
  onReorderSecciones,
  onReorderBloques,
  onAddSeccion,
  onDeleteSeccion,
  onAddBloque,
  onDeleteBloque,
}: Props) {
  return (
    <aside className="flex h-full w-[280px] shrink-0 flex-col gap-4 overflow-y-auto border-r border-slate-200 bg-slate-50 p-4">
      <NavItem
        label="Metadata"
        active={selection.kind === "metadata"}
        onClick={() => onSelect({ kind: "metadata" })}
      />
      <NavItem
        label="Hero"
        active={selection.kind === "hero"}
        onClick={() => onSelect({ kind: "hero" })}
      />
      <NavItem
        label="Audiencia"
        active={selection.kind === "audiencia"}
        onClick={() => onSelect({ kind: "audiencia" })}
      />

      <SeccionesNav
        secciones={boletin.secciones}
        selection={selection}
        onSelect={onSelect}
        onReorderSecciones={onReorderSecciones}
        onReorderBloques={onReorderBloques}
        onAddSeccion={onAddSeccion}
        onDeleteSeccion={onDeleteSeccion}
        onAddBloque={onAddBloque}
        onDeleteBloque={onDeleteBloque}
      />

      <NavItem
        label="Flujo"
        active={selection.kind === "flujo"}
        onClick={() => onSelect({ kind: "flujo" })}
      />
      <NavItem
        label="Cierre"
        active={selection.kind === "cierre"}
        onClick={() => onSelect({ kind: "cierre" })}
      />
      <NavItem
        label="Footer"
        active={selection.kind === "footer"}
        onClick={() => onSelect({ kind: "footer" })}
      />
    </aside>
  );
}

function NavItem({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "block w-full rounded-md px-3 py-2 text-left text-sm font-medium transition " +
        (active
          ? "bg-u-navy-deep text-white shadow-sm"
          : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100")
      }
    >
      {label}
    </button>
  );
}

function SeccionesNav({
  secciones,
  selection,
  onSelect,
  onReorderSecciones,
  onReorderBloques,
  onAddSeccion,
  onDeleteSeccion,
  onAddBloque,
  onDeleteBloque,
}: {
  secciones: Seccion[];
  selection: Selection;
  onSelect: (s: Selection) => void;
  onReorderSecciones: (next: Seccion[]) => void;
  onReorderBloques: (seccionId: string, next: SeccionBloque[]) => void;
  onAddSeccion: () => void;
  onDeleteSeccion: (id: string) => void;
  onAddBloque: (id: string, tipo: SeccionBloque["tipo"]) => void;
  onDeleteBloque: (id: string, idx: number) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = secciones.findIndex((s) => s.id === active.id);
    const newIdx = secciones.findIndex((s) => s.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    onReorderSecciones(arrayMove(secciones, oldIdx, newIdx));
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Secciones
        </span>
        <button
          type="button"
          onClick={onAddSeccion}
          className="rounded border border-slate-300 px-1.5 py-0.5 text-xs font-medium text-slate-600 hover:bg-white"
          title="Agregar sección"
        >
          + Sección
        </button>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={secciones.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-1">
            {secciones.map((s, idx) => (
              <SortableSeccion
                key={s.id}
                seccion={s}
                numero={idx + 1}
                selection={selection}
                onSelect={onSelect}
                onReorderBloques={onReorderBloques}
                onDeleteSeccion={onDeleteSeccion}
                onAddBloque={onAddBloque}
                onDeleteBloque={onDeleteBloque}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableSeccion({
  seccion,
  numero,
  selection,
  onSelect,
  onReorderBloques,
  onDeleteSeccion,
  onAddBloque,
  onDeleteBloque,
}: {
  seccion: Seccion;
  numero: number;
  selection: Selection;
  onSelect: (s: Selection) => void;
  onReorderBloques: (id: string, next: SeccionBloque[]) => void;
  onDeleteSeccion: (id: string) => void;
  onAddBloque: (id: string, tipo: SeccionBloque["tipo"]) => void;
  onDeleteBloque: (id: string, idx: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: seccion.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isSelected =
    selection.kind === "seccion" && selection.seccionId === seccion.id;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="rounded-md bg-white ring-1 ring-slate-200"
    >
      <div className="flex items-center gap-1 px-1.5 py-1.5">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab rounded px-1 text-slate-400 hover:bg-slate-100 active:cursor-grabbing"
          title="Arrastrar para reordenar"
          aria-label="Arrastrar para reordenar sección"
        >
          ⋮⋮
        </button>
        <button
          type="button"
          onClick={() => onSelect({ kind: "seccion", seccionId: seccion.id })}
          className={
            "flex flex-1 items-center gap-2 rounded px-2 py-1 text-left text-sm font-medium " +
            (isSelected
              ? "bg-u-red/10 text-u-red"
              : "text-slate-800 hover:bg-slate-100")
          }
        >
          <span className="text-xs font-bold tabular-nums text-u-red">
            {String(numero).padStart(2, "0")}
          </span>
          <span className="line-clamp-1 flex-1">
            {seccion.titulo.replace(/\[\[|\]\]|\/\//g, "") || "(sin título)"}
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            if (
              confirm(
                `¿Eliminar la sección "${seccion.titulo.replace(/\[\[|\]\]|\/\//g, "")}"?`,
              )
            ) {
              onDeleteSeccion(seccion.id);
            }
          }}
          className="rounded px-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
          title="Eliminar sección"
          aria-label="Eliminar sección"
        >
          ✕
        </button>
      </div>
      <BloquesList
        seccion={seccion}
        selection={selection}
        onSelect={onSelect}
        onReorderBloques={onReorderBloques}
        onAddBloque={onAddBloque}
        onDeleteBloque={onDeleteBloque}
      />
    </li>
  );
}

function BloquesList({
  seccion,
  selection,
  onSelect,
  onReorderBloques,
  onAddBloque,
  onDeleteBloque,
}: {
  seccion: Seccion;
  selection: Selection;
  onSelect: (s: Selection) => void;
  onReorderBloques: (id: string, next: SeccionBloque[]) => void;
  onAddBloque: (id: string, tipo: SeccionBloque["tipo"]) => void;
  onDeleteBloque: (id: string, idx: number) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  // Para drag-drop necesitamos ids estables. Usamos índice por ahora —
  // en una versión futura se podría agregar id propio a cada bloque del
  // schema. Mientras los bloques no se borren durante un drag, funciona.
  const ids = seccion.bloques.map((_, i) => `${seccion.id}::${i}`);

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = parseInt((active.id as string).split("::")[1], 10);
    const newIdx = parseInt((over.id as string).split("::")[1], 10);
    if (Number.isNaN(oldIdx) || Number.isNaN(newIdx)) return;
    onReorderBloques(seccion.id, arrayMove(seccion.bloques, oldIdx, newIdx));
  }

  return (
    <div className="space-y-0.5 border-t border-slate-100 px-1.5 py-1.5">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {seccion.bloques.map((b, i) => (
            <SortableBloque
              key={`${seccion.id}::${i}`}
              id={`${seccion.id}::${i}`}
              bloque={b}
              isSelected={
                selection.kind === "bloque" &&
                selection.seccionId === seccion.id &&
                selection.bloqueIdx === i
              }
              onSelect={() =>
                onSelect({
                  kind: "bloque",
                  seccionId: seccion.id,
                  bloqueIdx: i,
                })
              }
              onDelete={() => onDeleteBloque(seccion.id, i)}
            />
          ))}
        </SortableContext>
      </DndContext>
      <AddBloqueMenu seccionId={seccion.id} onAdd={onAddBloque} />
    </div>
  );
}

function SortableBloque({
  id,
  bloque,
  isSelected,
  onSelect,
  onDelete,
}: {
  id: string;
  bloque: SeccionBloque;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-1 rounded-md text-xs"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab rounded px-1 text-slate-400 hover:bg-slate-100 active:cursor-grabbing"
        title="Arrastrar para reordenar"
        aria-label="Arrastrar bloque"
      >
        ⋮⋮
      </button>
      <button
        type="button"
        onClick={onSelect}
        className={
          "flex-1 truncate rounded px-2 py-1 text-left " +
          (isSelected
            ? "bg-u-blue/10 text-u-blue"
            : "text-slate-600 hover:bg-slate-100")
        }
      >
        {labelDeBloque(bloque)}
      </button>
      <button
        type="button"
        onClick={() => {
          if (confirm("¿Eliminar este bloque?")) onDelete();
        }}
        className="rounded px-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
        title="Eliminar bloque"
        aria-label="Eliminar bloque"
      >
        ✕
      </button>
    </div>
  );
}

function labelDeBloque(b: SeccionBloque): string {
  switch (b.tipo) {
    case "parrafo":
      return "Párrafo";
    case "leadbar":
      return b.compacto ? "Leadbar (compacto)" : "Leadbar";
    case "tarjetas-grid": {
      const v = b.variante ?? "simple";
      const labels = {
        simple: "Tarjetas (simple)",
        resp: "Tarjetas (resp.)",
        gasto: "Tarjetas (gasto)",
        caso: "Tarjetas (caso)",
      } as const;
      return labels[v];
    }
    case "lista-check":
      return "Lista ✓";
    case "lista-x":
      return "Lista ✕";
    case "callout-naranja":
      return "Callout naranja";
    case "detalle-resaltado":
      return "Detalle resaltado";
  }
}

function AddBloqueMenu({
  seccionId,
  onAdd,
}: {
  seccionId: string;
  onAdd: (id: string, tipo: SeccionBloque["tipo"]) => void;
}) {
  const tipos: Array<{ tipo: SeccionBloque["tipo"]; label: string }> = [
    { tipo: "parrafo", label: "Párrafo" },
    { tipo: "leadbar", label: "Leadbar" },
    { tipo: "tarjetas-grid", label: "Tarjetas grid" },
    { tipo: "lista-check", label: "Lista ✓" },
    { tipo: "lista-x", label: "Lista ✕" },
    { tipo: "callout-naranja", label: "Callout" },
    { tipo: "detalle-resaltado", label: "Detalle" },
  ];

  return (
    <details className="ml-5 rounded">
      <summary className="cursor-pointer rounded px-2 py-1 text-[11px] text-slate-500 hover:bg-slate-100">
        + Agregar bloque
      </summary>
      <div className="mt-1 grid grid-cols-2 gap-1 px-1 pb-1">
        {tipos.map((t) => (
          <button
            key={t.tipo}
            type="button"
            onClick={(e) => {
              onAdd(seccionId, t.tipo);
              e.currentTarget.closest("details")?.removeAttribute("open");
            }}
            className="rounded border border-slate-200 bg-white px-2 py-1 text-left text-[11px] text-slate-700 hover:bg-slate-100"
          >
            {t.label}
          </button>
        ))}
      </div>
    </details>
  );
}
