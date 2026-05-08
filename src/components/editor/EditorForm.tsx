"use client";

import type {
  AudienciaItem,
  Boletin,
  Cierre,
  Footer as FooterModel,
  Flujo,
  Hero,
  HeroEncaje,
  HeroOverlay,
  HeroPosicion,
  Icono,
  Seccion,
  SeccionBloque,
  TarjetaGrid,
  TarjetaGridTipo,
  TarjetasGridVariante,
} from "@/lib/schema";

const ICONOS_OPCIONES: Array<{ value: Icono; label: string }> = [
  { value: "bus", label: "Bus" },
  { value: "colectivo", label: "Locomoción colectiva" },
  { value: "taxi", label: "Taxi" },
  { value: "vehiculo", label: "Vehículo particular" },
  { value: "documento", label: "Documento" },
  { value: "archivo", label: "Archivo / carpeta" },
  { value: "personas", label: "Personas / equipo" },
  { value: "calendario", label: "Calendario" },
  { value: "dinero", label: "Dinero" },
  { value: "pago", label: "Pago / tarjeta" },
  { value: "email", label: "Correo" },
  { value: "telefono", label: "Teléfono" },
  { value: "edificio", label: "Edificio / institución" },
  { value: "checklist", label: "Checklist" },
  { value: "alerta", label: "Alerta" },
  { value: "info", label: "Info" },
  { value: "estrella", label: "Estrella / destacado" },
  { value: "candado", label: "Candado / privacidad" },
  { value: "globo", label: "Globo / web" },
  { value: "engranaje", label: "Engranaje / ajustes" },
  { value: "libro", label: "Libro / manual" },
  { value: "enlace", label: "Enlace" },
  { value: "descarga", label: "Descarga" },
  { value: "impresora", label: "Impresora" },
];
import { ImagenFondoField } from "./ImagenFondoField";
import {
  CheckboxField,
  ItemsListField,
  NumberField,
  SectionTitle,
  SelectField,
  TextAreaField,
  TextField,
  INLINE_EMPHASIS_HINT,
} from "./widgets";
import type { Selection } from "./EditorSidebar";

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

type Props = {
  boletin: Boletin;
  selection: Selection;
  setBoletin: (b: Boletin) => void;
};

export function EditorForm({ boletin, selection, setBoletin }: Props) {
  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto bg-white p-6">
      {selection.kind === "metadata" && (
        <MetadataForm boletin={boletin} setBoletin={setBoletin} />
      )}
      {selection.kind === "hero" && (
        <HeroForm
          hero={boletin.hero}
          onChange={(hero) => setBoletin({ ...boletin, hero })}
        />
      )}
      {selection.kind === "audiencia" && (
        <AudienciaForm
          items={boletin.audiencia}
          onChange={(audiencia) => setBoletin({ ...boletin, audiencia })}
        />
      )}
      {selection.kind === "seccion" && (
        <SeccionForm
          boletin={boletin}
          seccionId={selection.seccionId}
          setBoletin={setBoletin}
        />
      )}
      {selection.kind === "bloque" && (
        <BloqueForm
          boletin={boletin}
          seccionId={selection.seccionId}
          bloqueIdx={selection.bloqueIdx}
          setBoletin={setBoletin}
        />
      )}
      {selection.kind === "flujo" && (
        <FlujoForm
          flujo={boletin.flujo}
          onChange={(flujo) => setBoletin({ ...boletin, flujo })}
        />
      )}
      {selection.kind === "cierre" && (
        <CierreForm
          cierre={boletin.cierre}
          onChange={(cierre) => setBoletin({ ...boletin, cierre })}
        />
      )}
      {selection.kind === "footer" && (
        <FooterForm
          footer={boletin.footer}
          onChange={(footer) => setBoletin({ ...boletin, footer })}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// Metadata · número y fecha
// ---------------------------------------------------------------------

function MetadataForm({
  boletin,
  setBoletin,
}: {
  boletin: Boletin;
  setBoletin: (b: Boletin) => void;
}) {
  return (
    <div className="space-y-5">
      <SectionTitle>Metadata</SectionTitle>
      <NumberField
        label="Número de edición"
        value={boletin.numero}
        min={1}
        onChange={(numero) => setBoletin({ ...boletin, numero })}
        hint="Override manual. Al publicar, si choca con un publicado existente, el sistema asigna el siguiente disponible."
      />
      <SelectField
        label="Mes"
        value={boletin.fecha.mes}
        onChange={(mes) =>
          setBoletin({ ...boletin, fecha: { ...boletin.fecha, mes } })
        }
        options={MESES.map((m) => ({ value: m, label: m }))}
      />
      <NumberField
        label="Año"
        value={boletin.fecha.anio}
        min={2000}
        max={2100}
        onChange={(anio) =>
          setBoletin({ ...boletin, fecha: { ...boletin.fecha, anio } })
        }
      />
      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
        <p>
          <strong>ID:</strong>{" "}
          <code className="text-slate-700">{boletin.id}</code>
        </p>
        <p className="mt-1">
          <strong>Estado:</strong> {boletin.status}
        </p>
        <p className="mt-1">
          <strong>Creado:</strong>{" "}
          {new Date(boletin.createdAt).toLocaleString("es-CL")}
        </p>
        <p className="mt-1">
          <strong>Actualizado:</strong>{" "}
          {new Date(boletin.updatedAt).toLocaleString("es-CL")}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------

function HeroForm({
  hero,
  onChange,
}: {
  hero: Hero;
  onChange: (h: Hero) => void;
}) {
  return (
    <div className="space-y-5">
      <SectionTitle>Hero</SectionTitle>
      <TextField
        label="Eyebrow"
        value={hero.eyebrow}
        onChange={(eyebrow) => onChange({ ...hero, eyebrow })}
        hint="Línea pequeña arriba del título (uppercase rojo)."
      />
      <TextAreaField
        label="Título"
        value={hero.titulo}
        onChange={(titulo) => onChange({ ...hero, titulo })}
        rows={3}
        hint={INLINE_EMPHASIS_HINT}
      />
      <TextAreaField
        label="Subtítulo"
        value={hero.subtitulo}
        onChange={(subtitulo) => onChange({ ...hero, subtitulo })}
        rows={3}
        hint={INLINE_EMPHASIS_HINT}
      />
      <ImagenFondoField
        value={hero.imagenFondo}
        onChange={(imagenFondo) => onChange({ ...hero, imagenFondo })}
      />
      <SelectField<HeroEncaje>
        label="Encaje de la imagen"
        value={hero.imagenEncaje ?? "cover"}
        onChange={(imagenEncaje) => onChange({ ...hero, imagenEncaje })}
        options={[
          { value: "cover", label: "Cover (rellena el hero, puede recortar)" },
          { value: "contain", label: "Contenida (imagen completa, puede dejar fondo)" },
          { value: "ancho-completo", label: "Ancho completo (100% horizontal, sin recorte)" },
        ]}
      />
      <SelectField<HeroPosicion>
        label="Posición de la imagen"
        value={hero.imagenPosicion ?? "right"}
        onChange={(imagenPosicion) =>
          onChange({ ...hero, imagenPosicion })
        }
        options={[
          { value: "left", label: "Izquierda" },
          { value: "center", label: "Centro" },
          { value: "right", label: "Derecha (default histórico)" },
        ]}
        hint='Útil con "cover" para decidir qué parte queda visible cuando hay recorte. Con "contenida" se ignora.'
      />
      <SelectField<HeroOverlay>
        label="Overlay sobre la imagen"
        value={hero.overlayIntensidad ?? "institucional"}
        onChange={(overlayIntensidad) =>
          onChange({ ...hero, overlayIntensidad })
        }
        options={[
          { value: "institucional", label: "Institucional (gradiente navy/azul)" },
          { value: "tenue", label: "Tenue (velo sutil)" },
          { value: "ninguno", label: "Ninguno (imagen sin gradiente)" },
        ]}
        hint='Recomendado "institucional" si la imagen es muy variada — mantiene legibilidad del texto blanco.'
      />
      <div className="rounded-md bg-slate-50 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-600">
          Caja REX
        </p>
        <div className="space-y-3">
          <TextField
            label="Número REX"
            value={hero.rex.numero}
            onChange={(numero) =>
              onChange({ ...hero, rex: { ...hero.rex, numero } })
            }
          />
          <NumberField
            label="Año"
            value={hero.rex.anio}
            onChange={(anio) =>
              onChange({ ...hero, rex: { ...hero.rex, anio } })
            }
          />
          <TextField
            label="URL del PDF"
            value={hero.rex.url}
            onChange={(url) =>
              onChange({ ...hero, rex: { ...hero.rex, url } })
            }
          />
          <TextField
            label="Descripción"
            value={hero.rex.descripcion}
            onChange={(descripcion) =>
              onChange({ ...hero, rex: { ...hero.rex, descripcion } })
            }
            hint="Subtexto pequeño debajo del CTA REX."
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Audiencia
// ---------------------------------------------------------------------

function AudienciaForm({
  items,
  onChange,
}: {
  items: AudienciaItem[];
  onChange: (items: AudienciaItem[]) => void;
}) {
  function update(i: number, next: Partial<AudienciaItem>) {
    onChange(items.map((it, j) => (j === i ? { ...it, ...next } : it)));
  }
  function remove(i: number) {
    onChange(items.filter((_, j) => j !== i));
  }
  function add() {
    onChange([
      ...items,
      { color: "blue", titulo: "Nueva audiencia", descripcion: "" },
    ]);
  }

  return (
    <div className="space-y-5">
      <SectionTitle>Audiencia</SectionTitle>
      {items.map((item, i) => (
        <div
          key={i}
          className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Item {i + 1}
            </span>
            <button
              type="button"
              onClick={() => remove(i)}
              className="rounded border border-red-200 px-2 py-0.5 text-[11px] text-red-600 hover:bg-red-50"
            >
              Eliminar
            </button>
          </div>
          <SelectField
            label="Color"
            value={item.color}
            onChange={(color) => update(i, { color })}
            options={[
              { value: "red", label: "Rojo (UA)" },
              { value: "orange", label: "Naranja (TTA)" },
              { value: "blue", label: "Azul (TCP)" },
            ]}
          />
          <TextField
            label="Título"
            value={item.titulo}
            onChange={(titulo) => update(i, { titulo })}
          />
          <TextAreaField
            label="Descripción"
            value={item.descripcion}
            onChange={(descripcion) => update(i, { descripcion })}
            rows={2}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="rounded-md border border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
      >
        + Agregar item de audiencia
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------
// Sección (titulo + intro)
// ---------------------------------------------------------------------

function SeccionForm({
  boletin,
  seccionId,
  setBoletin,
}: {
  boletin: Boletin;
  seccionId: string;
  setBoletin: (b: Boletin) => void;
}) {
  const seccion = boletin.secciones.find((s) => s.id === seccionId);
  if (!seccion) return null;

  function update(next: Partial<Seccion>) {
    setBoletin({
      ...boletin,
      secciones: boletin.secciones.map((s) =>
        s.id === seccionId ? { ...s, ...next } : s,
      ),
    });
  }

  return (
    <div className="space-y-5">
      <SectionTitle>Sección</SectionTitle>
      <TextField
        label="Título"
        value={seccion.titulo}
        onChange={(titulo) => update({ titulo })}
        hint={INLINE_EMPHASIS_HINT}
      />
      <TextField
        label="ID (slug interno)"
        value={seccion.id}
        onChange={() => {}}
        hint="Solo lectura — el id es estable y no se edita."
      />
      <TextAreaField
        label="Intro (opcional)"
        value={seccion.intro ?? ""}
        onChange={(intro) => update({ intro: intro || undefined })}
        rows={3}
        hint={
          "Párrafo opcional debajo del título y antes del primer bloque. " +
          INLINE_EMPHASIS_HINT
        }
      />
      <p className="rounded-md bg-slate-50 p-3 text-xs text-slate-500">
        Los bloques de esta sección se editan desde la barra lateral
        (click en un bloque para abrir su formulario).
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------
// Bloque dispatcher
// ---------------------------------------------------------------------

function BloqueForm({
  boletin,
  seccionId,
  bloqueIdx,
  setBoletin,
}: {
  boletin: Boletin;
  seccionId: string;
  bloqueIdx: number;
  setBoletin: (b: Boletin) => void;
}) {
  const seccion = boletin.secciones.find((s) => s.id === seccionId);
  const bloque = seccion?.bloques[bloqueIdx];
  if (!seccion || !bloque) return null;

  function actualizarBloque(next: SeccionBloque) {
    setBoletin({
      ...boletin,
      secciones: boletin.secciones.map((s) => {
        if (s.id !== seccionId) return s;
        const bloques = [...s.bloques];
        bloques[bloqueIdx] = next;
        return { ...s, bloques };
      }),
    });
  }

  return (
    <div className="space-y-5">
      <SectionTitle>
        Bloque · {tipoLabel(bloque.tipo)}
      </SectionTitle>

      {bloque.tipo === "parrafo" && (
        <TextAreaField
          label="Contenido"
          value={bloque.contenido}
          onChange={(contenido) =>
            actualizarBloque({ tipo: "parrafo", contenido })
          }
          rows={4}
          hint={INLINE_EMPHASIS_HINT}
        />
      )}

      {bloque.tipo === "leadbar" && (
        <>
          <TextAreaField
            label="Contenido"
            value={bloque.contenido}
            onChange={(contenido) =>
              actualizarBloque({ ...bloque, contenido })
            }
            rows={3}
            hint={INLINE_EMPHASIS_HINT}
          />
          <CheckboxField
            label="Compacto"
            checked={bloque.compacto ?? false}
            onChange={(compacto) =>
              actualizarBloque({ ...bloque, compacto })
            }
            hint="Usar el estilo .uatta-tram-resp (padding/font reducidos), ideal antes de un grid de variante 'caso'."
          />
        </>
      )}

      {bloque.tipo === "tarjetas-grid" && (
        <TarjetasGridFormBody
          bloque={bloque}
          onChange={actualizarBloque}
        />
      )}

      {bloque.tipo === "lista-check" && (
        <ListaSimpleForm
          bloque={bloque}
          onChange={actualizarBloque}
          tipo="lista-check"
        />
      )}

      {bloque.tipo === "lista-x" && (
        <ListaSimpleForm
          bloque={bloque}
          onChange={actualizarBloque}
          tipo="lista-x"
        />
      )}

      {bloque.tipo === "callout-naranja" && (
        <TextAreaField
          label="Contenido"
          value={bloque.contenido}
          onChange={(contenido) =>
            actualizarBloque({ tipo: "callout-naranja", contenido })
          }
          rows={4}
          hint={INLINE_EMPHASIS_HINT}
        />
      )}

      {bloque.tipo === "detalle-resaltado" && (
        <>
          <TextField
            label="Título"
            value={bloque.titulo}
            onChange={(titulo) => actualizarBloque({ ...bloque, titulo })}
            hint={INLINE_EMPHASIS_HINT}
          />
          <TextField
            label="Subtítulo (opcional)"
            value={bloque.subtitulo ?? ""}
            onChange={(subtitulo) =>
              actualizarBloque({
                ...bloque,
                subtitulo: subtitulo || undefined,
              })
            }
          />
          <ItemsListField
            label="Incluye"
            values={bloque.incluye}
            onChange={(incluye) => actualizarBloque({ ...bloque, incluye })}
            hint={INLINE_EMPHASIS_HINT}
          />
        </>
      )}
    </div>
  );
}

function ListaSimpleForm({
  bloque,
  onChange,
  tipo,
}: {
  bloque: Extract<SeccionBloque, { tipo: "lista-check" | "lista-x" }>;
  onChange: (b: SeccionBloque) => void;
  tipo: "lista-check" | "lista-x";
}) {
  return (
    <>
      <TextField
        label="Título (opcional)"
        value={bloque.titulo ?? ""}
        onChange={(titulo) =>
          onChange({ ...bloque, tipo, titulo: titulo || undefined })
        }
        hint={INLINE_EMPHASIS_HINT}
      />
      <ItemsListField
        label="Items"
        values={bloque.items}
        onChange={(items) => onChange({ ...bloque, tipo, items })}
        hint={INLINE_EMPHASIS_HINT}
      />
    </>
  );
}

function tipoLabel(tipo: SeccionBloque["tipo"]): string {
  switch (tipo) {
    case "parrafo":
      return "Párrafo";
    case "leadbar":
      return "Leadbar";
    case "tarjetas-grid":
      return "Tarjetas grid";
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

// ---------------------------------------------------------------------
// Tarjetas grid (4 variantes)
// ---------------------------------------------------------------------

function TarjetasGridFormBody({
  bloque,
  onChange,
}: {
  bloque: Extract<SeccionBloque, { tipo: "tarjetas-grid" }>;
  onChange: (b: SeccionBloque) => void;
}) {
  const v: TarjetasGridVariante = bloque.variante ?? "simple";

  function setVariante(next: TarjetasGridVariante) {
    onChange({ ...bloque, variante: next });
  }
  function setColumnas(next: 2 | 3) {
    onChange({ ...bloque, columnas: next });
  }
  function setTarjeta(i: number, t: TarjetaGrid) {
    const next = [...bloque.tarjetas];
    next[i] = t;
    onChange({ ...bloque, tarjetas: next });
  }
  function addTarjeta() {
    onChange({
      ...bloque,
      tarjetas: [...bloque.tarjetas, { titulo: "Nueva tarjeta" }],
    });
  }
  function removeTarjeta(i: number) {
    onChange({
      ...bloque,
      tarjetas: bloque.tarjetas.filter((_, j) => j !== i),
    });
  }
  function moveTarjeta(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= bloque.tarjetas.length) return;
    const next = [...bloque.tarjetas];
    [next[i], next[j]] = [next[j], next[i]];
    onChange({ ...bloque, tarjetas: next });
  }

  return (
    <>
      <SelectField
        label="Variante visual"
        value={v}
        onChange={setVariante}
        options={[
          { value: "simple", label: "Simple (.uatta-req) — sec. 02" },
          { value: "resp", label: "Responsabilidad (.uatta-resp-card) — sec. 01" },
          { value: "gasto", label: "Gasto (.uatta-gasto) — sec. 03" },
          { value: "caso", label: "Caso (.uatta-tram__card) — sec. 05" },
        ]}
      />
      <SelectField
        label="Columnas"
        value={String(bloque.columnas) as "2" | "3"}
        onChange={(s) => setColumnas(parseInt(s, 10) as 2 | 3)}
        options={[
          { value: "2", label: "2 columnas" },
          { value: "3", label: "3 columnas" },
        ]}
      />

      <div className="space-y-4">
        {bloque.tarjetas.map((t, i) => (
          <div
            key={i}
            className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Tarjeta {i + 1}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => moveTarjeta(i, -1)}
                  disabled={i === 0}
                  className="rounded border border-slate-300 px-1.5 py-0.5 text-xs text-slate-600 hover:bg-white disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveTarjeta(i, 1)}
                  disabled={i === bloque.tarjetas.length - 1}
                  className="rounded border border-slate-300 px-1.5 py-0.5 text-xs text-slate-600 hover:bg-white disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeTarjeta(i)}
                  className="rounded border border-red-200 px-2 py-0.5 text-[11px] text-red-600 hover:bg-red-50"
                >
                  Eliminar
                </button>
              </div>
            </div>
            <TarjetaFields
              variante={v}
              tarjeta={t}
              onChange={(next) => setTarjeta(i, next)}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addTarjeta}
        className="rounded-md border border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
      >
        + Agregar tarjeta
      </button>
    </>
  );
}

function TarjetaFields({
  variante,
  tarjeta,
  onChange,
}: {
  variante: TarjetasGridVariante;
  tarjeta: TarjetaGrid;
  onChange: (t: TarjetaGrid) => void;
}) {
  const tipo = tarjeta.tipo ?? "normal";

  return (
    <>
      <SelectField<TarjetaGridTipo>
        label="Tipo de tarjeta"
        value={tipo}
        onChange={(t) =>
          onChange({ ...tarjeta, tipo: t === "normal" ? undefined : t })
        }
        options={[
          { value: "normal", label: `Normal (${variante})` },
          { value: "media", label: "Imagen — rellena espacios vacíos" },
          { value: "cta", label: "CTA — botón con descripción" },
        ]}
        hint='Las tarjetas "media" y "cta" funcionan en cualquier variante de grid; útiles para llenar slots vacíos.'
      />

      <CheckboxField
        label="Ocupar fila completa (full-width)"
        checked={tarjeta.full ?? false}
        onChange={(full) => onChange({ ...tarjeta, full: full || undefined })}
        hint='Aplica grid-column: 1 / -1. Útil en grids de 3 columnas con menos cards o para resaltar una tarjeta.'
      />

      {tipo === "media" && (
        <>
          <ImagenFondoField
            value={tarjeta.src}
            onChange={(src) => onChange({ ...tarjeta, src })}
          />
          <TextField
            label='Texto alt (accesibilidad)'
            value={tarjeta.alt ?? ""}
            onChange={(alt) => onChange({ ...tarjeta, alt })}
            hint='Descripción breve de la imagen para lectores de pantalla.'
          />
          <TextField
            label="Caption (opcional)"
            value={tarjeta.caption ?? ""}
            onChange={(caption) =>
              onChange({ ...tarjeta, caption: caption || undefined })
            }
            hint={"Pie de imagen, debajo del thumbnail. " + INLINE_EMPHASIS_HINT}
          />
        </>
      )}

      {tipo === "cta" && (
        <>
          <TextField
            label="Título del CTA"
            value={tarjeta.titulo ?? ""}
            onChange={(titulo) => onChange({ ...tarjeta, titulo })}
            hint={INLINE_EMPHASIS_HINT}
          />
          <TextAreaField
            label="Descripción"
            value={tarjeta.descripcion ?? ""}
            onChange={(descripcion) =>
              onChange({ ...tarjeta, descripcion: descripcion || undefined })
            }
            rows={2}
            hint={INLINE_EMPHASIS_HINT}
          />
          <TextField
            label="URL del botón"
            value={tarjeta.url ?? ""}
            onChange={(url) => onChange({ ...tarjeta, url })}
            placeholder="https://..."
          />
          <TextField
            label="Texto del botón"
            value={tarjeta.label ?? ""}
            onChange={(label) => onChange({ ...tarjeta, label })}
            placeholder="Descargar formulario"
          />
          <SelectField<Icono | "">
            label="Ícono del botón (opcional)"
            value={tarjeta.ctaIcono ?? ""}
            onChange={(ctaIcono) =>
              onChange({
                ...tarjeta,
                ctaIcono: ctaIcono === "" ? undefined : (ctaIcono as Icono),
              })
            }
            options={[
              { value: "" as Icono | "", label: "(sin ícono)" },
              ...(ICONOS_OPCIONES as Array<{ value: Icono | ""; label: string }>),
            ]}
          />
        </>
      )}

      {tipo === "normal" && (
        <>
          {variante === "resp" && (
            <TextField
              label="Etiqueta superior"
              value={tarjeta.etiqueta ?? ""}
              onChange={(etiqueta) => onChange({ ...tarjeta, etiqueta })}
              hint='Ej: "Etapa 1 · Solicitud" — uppercase azul.'
            />
          )}

          {variante === "gasto" && (
            <SelectField<Icono>
              label="Ícono"
              value={tarjeta.icono ?? "bus"}
              onChange={(icono) => onChange({ ...tarjeta, icono })}
              options={ICONOS_OPCIONES}
              hint='taxi y vehiculo se renderizan como tarjetas full-width por convención visual.'
            />
          )}

          {variante === "caso" && (
            <>
              <SelectField
                label="Tono superior"
                value={(tarjeta.tono ?? "navy") as "navy" | "azul"}
                onChange={(tono) => onChange({ ...tarjeta, tono })}
                options={[
                  { value: "navy", label: "Navy (caso A)" },
                  { value: "azul", label: "Azul (caso B)" },
                ]}
              />
              <TextField
                label="Etiqueta superior"
                value={tarjeta.etiqueta ?? ""}
                onChange={(etiqueta) => onChange({ ...tarjeta, etiqueta })}
                hint='Texto a la izquierda en la franja superior.'
              />
              <TextField
                label="Badge"
                value={tarjeta.badge ?? ""}
                onChange={(badge) => onChange({ ...tarjeta, badge })}
                hint='Pill a la derecha, ej: "Caso A".'
              />
            </>
          )}

          <TextField
            label="Título"
            value={tarjeta.titulo ?? ""}
            onChange={(titulo) => onChange({ ...tarjeta, titulo })}
            hint={INLINE_EMPHASIS_HINT}
          />

          {variante === "gasto" && (
            <TextField
              label="Subtítulo (opcional)"
              value={tarjeta.subtitulo ?? ""}
              onChange={(subtitulo) =>
                onChange({ ...tarjeta, subtitulo: subtitulo || undefined })
              }
              hint='Ej: "uso excepcional" — texto pequeño al lado del título.'
            />
          )}

          {variante === "resp" && (
            <TextField
              label='"Responsable:" (opcional)'
              value={tarjeta.who ?? ""}
              onChange={(who) =>
                onChange({ ...tarjeta, who: who || undefined })
              }
              hint={INLINE_EMPHASIS_HINT}
            />
          )}

          {(variante === "simple" ||
            variante === "resp" ||
            variante === "gasto") &&
            !(variante === "gasto" && tarjeta.incluye) && (
              <ItemsListField
                label="Items"
                values={tarjeta.items ?? []}
                onChange={(items) => onChange({ ...tarjeta, items })}
                hint={INLINE_EMPHASIS_HINT}
              />
            )}

          {variante === "caso" && (
            <ItemsListField
              label="Párrafos"
              values={tarjeta.parrafos ?? []}
              onChange={(parrafos) => onChange({ ...tarjeta, parrafos })}
              hint={INLINE_EMPHASIS_HINT}
            />
          )}

          {variante === "gasto" && tarjeta.icono === "vehiculo" && (
            <>
              <TextAreaField
                label="Párrafo izquierdo (vehiculo)"
                value={tarjeta.parrafos?.[0] ?? ""}
                onChange={(p) =>
                  onChange({
                    ...tarjeta,
                    parrafos: [p],
                  })
                }
                rows={3}
                hint='Solo se usa cuando hay "Incluye".'
              />
              <ItemsListField
                label='Caja "Incluye" (derecha)'
                values={tarjeta.incluye ?? []}
                onChange={(incluye) =>
                  onChange({
                    ...tarjeta,
                    incluye: incluye.length > 0 ? incluye : undefined,
                  })
                }
                hint='Si está vacío, se renderiza la lista de items normal.'
              />
            </>
          )}
        </>
      )}
    </>
  );
}

// ---------------------------------------------------------------------
// Flujo
// ---------------------------------------------------------------------

function FlujoForm({
  flujo,
  onChange,
}: {
  flujo?: Flujo;
  onChange: (f: Flujo | undefined) => void;
}) {
  if (!flujo) {
    return (
      <div className="space-y-4">
        <SectionTitle>Flujo</SectionTitle>
        <p className="text-sm text-slate-600">
          Este boletín no tiene flujo. Agregalo si querés mostrar la grilla
          de pasos por rol.
        </p>
        <button
          type="button"
          onClick={() =>
            onChange({
              intro: "",
              pasos: [{ rol: "Rol", descripcion: "Descripción del paso." }],
            })
          }
          className="rounded-md bg-u-blue px-3 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          + Agregar flujo
        </button>
      </div>
    );
  }

  function update(next: Partial<Flujo>) {
    onChange({ ...flujo!, ...next });
  }
  function setPaso(i: number, p: Partial<Flujo["pasos"][number]>) {
    update({
      pasos: flujo!.pasos.map((x, j) => (j === i ? { ...x, ...p } : x)),
    });
  }
  function removePaso(i: number) {
    update({ pasos: flujo!.pasos.filter((_, j) => j !== i) });
  }
  function addPaso() {
    update({
      pasos: [
        ...flujo!.pasos,
        { rol: "Nuevo rol", descripcion: "" },
      ],
    });
  }
  function movePaso(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= flujo!.pasos.length) return;
    const next = [...flujo!.pasos];
    [next[i], next[j]] = [next[j], next[i]];
    update({ pasos: next });
  }

  return (
    <div className="space-y-5">
      <SectionTitle>Flujo de responsabilidades</SectionTitle>
      <TextAreaField
        label="Intro"
        value={flujo.intro}
        onChange={(intro) => update({ intro })}
        rows={3}
        hint={INLINE_EMPHASIS_HINT}
      />
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-600">
          Pasos ({flujo.pasos.length})
        </p>
        <p className="mb-3 text-[11px] text-slate-500">
          Los primeros 5 se renderizan en la columna izquierda con borde
          rojo, los siguientes 4 en la columna derecha con borde azul.
        </p>
        <div className="space-y-3">
          {flujo.pasos.map((p, i) => (
            <div
              key={i}
              className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Paso {i + 1}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => movePaso(i, -1)}
                    disabled={i === 0}
                    className="rounded border border-slate-300 px-1.5 py-0.5 text-xs text-slate-600 hover:bg-white disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => movePaso(i, 1)}
                    disabled={i === flujo.pasos.length - 1}
                    className="rounded border border-slate-300 px-1.5 py-0.5 text-xs text-slate-600 hover:bg-white disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removePaso(i)}
                    className="rounded border border-red-200 px-2 py-0.5 text-[11px] text-red-600 hover:bg-red-50"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
              <TextField
                label="Rol"
                value={p.rol}
                onChange={(rol) => setPaso(i, { rol })}
              />
              <TextAreaField
                label="Descripción"
                value={p.descripcion}
                onChange={(descripcion) => setPaso(i, { descripcion })}
                rows={2}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addPaso}
          className="mt-3 rounded-md border border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          + Agregar paso
        </button>
      </div>
      <button
        type="button"
        onClick={() => {
          if (confirm("¿Eliminar todo el bloque de flujo?")) onChange(undefined);
        }}
        className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
      >
        Eliminar bloque flujo
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------
// Cierre
// ---------------------------------------------------------------------

function CierreForm({
  cierre,
  onChange,
}: {
  cierre: Cierre;
  onChange: (c: Cierre) => void;
}) {
  return (
    <div className="space-y-5">
      <SectionTitle>Cierre</SectionTitle>
      <TextAreaField
        label="Texto"
        value={cierre.texto}
        onChange={(texto) => onChange({ ...cierre, texto })}
        rows={4}
        hint={INLINE_EMPHASIS_HINT}
      />
      <ItemsListField
        label="Principios (pills)"
        values={cierre.principios}
        onChange={(principios) => onChange({ ...cierre, principios })}
        rowsPerItem={1}
        hint='Ej: "Eficiencia", "Austeridad", "Probidad", "Transparencia".'
      />
    </div>
  );
}

// ---------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------

function FooterForm({
  footer,
  onChange,
}: {
  footer: FooterModel;
  onChange: (f: FooterModel) => void;
}) {
  return (
    <div className="space-y-5">
      <SectionTitle>Footer</SectionTitle>
      <TextField
        label="Título de la consulta"
        value={footer.contactoTitulo}
        onChange={(contactoTitulo) =>
          onChange({ ...footer, contactoTitulo })
        }
      />
      <div className="space-y-3 rounded-md bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
          Contacto
        </p>
        <TextField
          label="Nombre"
          value={footer.contacto.nombre}
          onChange={(nombre) =>
            onChange({ ...footer, contacto: { ...footer.contacto, nombre } })
          }
        />
        <TextField
          label="Cargo"
          value={footer.contacto.cargo}
          onChange={(cargo) =>
            onChange({ ...footer, contacto: { ...footer.contacto, cargo } })
          }
        />
        <TextField
          label="Email"
          value={footer.contacto.email}
          onChange={(email) =>
            onChange({ ...footer, contacto: { ...footer.contacto, email } })
          }
        />
      </div>
      <TextAreaField
        label="Nota adicional"
        value={footer.notaAdicional}
        onChange={(notaAdicional) => onChange({ ...footer, notaAdicional })}
        rows={2}
      />
      <div className="space-y-3 rounded-md bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
          Créditos
        </p>
        <TextField
          label="Desarrolla · unidad"
          value={footer.creditos.desarrolla.unidad}
          onChange={(unidad) =>
            onChange({
              ...footer,
              creditos: {
                ...footer.creditos,
                desarrolla: { ...footer.creditos.desarrolla, unidad },
              },
            })
          }
        />
        <TextField
          label="Desarrolla · email"
          value={footer.creditos.desarrolla.email}
          onChange={(email) =>
            onChange({
              ...footer,
              creditos: {
                ...footer.creditos,
                desarrolla: { ...footer.creditos.desarrolla, email },
              },
            })
          }
        />
        <TextField
          label="En conjunto con · unidad"
          value={footer.creditos.enConjuntoCon.unidad}
          onChange={(unidad) =>
            onChange({
              ...footer,
              creditos: {
                ...footer.creditos,
                enConjuntoCon: { unidad },
              },
            })
          }
        />
      </div>
    </div>
  );
}
