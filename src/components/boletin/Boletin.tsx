/**
 * <Boletin/> — render parametrizado del boletín contra el schema tipado.
 *
 * Genera el mismo HTML institucional que <BoletinDemo/> (Hito 1) pero a
 * partir de un objeto Boletin. La validación de cierre del Hito 2
 * confirma que aplicado al seed produce las mismas dimensiones
 * (980 × 4404.765625 px).
 *
 * Reglas:
 *  - Cero clases Tailwind dentro del boletín. Solo uatta-* del CSS
 *    institucional para mantener fidelidad pixel-perfect.
 *  - Cualquier string del schema pasa por parseInline para soportar la
 *    convención [[bold]] // italic //.
 *  - El SVG de cada icono está aquí inline, copia verbatim de la
 *    referencia.
 */

import { parseInline } from "@/lib/inline";
import type {
  AudienciaItem,
  Boletin as BoletinModel,
  Hero,
  Icono,
  Seccion,
  SeccionBloque,
  TarjetaGrid,
} from "@/lib/schema";

/**
 * Compone el background-shorthand del hero respetando los cuatro
 * controles del schema:
 *  - hero.imagenFondo (URL custom o default)
 *  - hero.overlayIntensidad (gradiente arriba de la imagen)
 *  - hero.imagenEncaje (cover/contain/ancho-completo)
 *  - hero.imagenPosicion (left/center/right; solo afecta a cover)
 *
 * Override por inline style sobre la regla CSS base de .uatta-hero —
 * uatta.css se mantiene verbatim según la regla del Hito 1. El último
 * gradiente del shorthand actúa como fallback si la imagen no carga:
 * replica la regla original.
 */
function computeHeroBackground(hero: Hero): string {
  const url = hero.imagenFondo ?? "/uatta-hero-bg.jpg";
  const fallback = "linear-gradient(135deg, var(--u-grad-1), var(--u-grad-2))";

  const encaje = hero.imagenEncaje ?? "cover";
  // El default histórico era center right / cover. Lo mantenemos como
  // fallback cuando posicion no está seteada y encaje es cover.
  const posicion = hero.imagenPosicion ?? (encaje === "cover" ? "right" : "center");

  let posSize: string;
  if (encaje === "cover") {
    posSize = `${posicion} center / cover`;
  } else if (encaje === "contain") {
    posSize = "center center / contain";
  } else if (encaje === "natural") {
    // background-size: auto → la imagen se renderiza en su tamaño
    // natural en pixels. Sin upscale ni downscale. La posición se
    // respeta para decidir qué parte cae en el hero cuando la imagen
    // es más grande, o dónde se ancla cuando es más chica.
    posSize = `${posicion} center / auto`;
  } else {
    // ancho-completo: imagen ocupa el 100% del ancho, alto auto.
    posSize = `${posicion} center / 100% auto`;
  }
  const layerImagen = `url("${url}") ${posSize} no-repeat`;

  const overlay = hero.overlayIntensidad ?? "institucional";
  switch (overlay) {
    case "ninguno":
      return `${layerImagen}, ${fallback}`;
    case "tenue":
      return `linear-gradient(135deg, rgba(28,37,87,0.45) 0%, rgba(37,48,107,0.40) 55%, rgba(0,99,175,0.35) 100%), ${layerImagen}, ${fallback}`;
    case "institucional":
    default:
      return `linear-gradient(135deg, rgba(28,37,87,0.94) 0%, rgba(37,48,107,0.84) 55%, rgba(0,99,175,0.78) 100%), ${layerImagen}, ${fallback}`;
  }
}

type Props = {
  boletin: BoletinModel;
  /**
   * Si true, agrega atributos `data-edit="<target>"` a los elementos
   * editables del boletín. EditorPreview los usa para implementar
   * "click en el preview para editar el campo correspondiente". El
   * valor del atributo se parsea a Selection en el editor.
   * Off por default: el render de /n/[numero], /render/demo y export
   * no llevan estos atributos para mantener el HTML limpio.
   */
  editTargets?: boolean;
};

/** Devuelve { 'data-edit': target } solo cuando editTargets es true. */
function ed(target: string, on?: boolean): { "data-edit"?: string } {
  return on ? { "data-edit": target } : {};
}

export function Boletin({ boletin, editTargets }: Props) {
  const numeroEdicion = String(boletin.numero).padStart(2, "0");
  const fechaLabel = `Edición N° ${numeroEdicion} · ${boletin.fecha.mes} ${boletin.fecha.anio}`;

  return (
    <article
      className="uatta-boletin"
      lang="es-CL"
      role="region"
      aria-label="Boletín de Procedimientos"
    >
      <div className="uatta-topbar">
        <b>Gobierno de Chile</b> · Ministerio de Hacienda · Unidad Administradora TTA-TCP
      </div>

      <header className="uatta-header">
        <img
          className="uatta-header__logo"
          src="/uatta-logo.png"
          alt="Unidad Administradora TTA-TCP — Ministerio de Hacienda · Gobierno de Chile"
        />
        <div
          className="uatta-header__meta"
          {...ed("metadata", editTargets)}
        >
          <b>Boletín de Procedimientos</b>
          {fechaLabel}
        </div>
      </header>

      <HeroBlock boletin={boletin} editTargets={editTargets} />

      <div className="uatta-ribbon"></div>

      <AudienciaBlock items={boletin.audiencia} editTargets={editTargets} />

      {boletin.secciones.map((seccion, idx) => (
        <SeccionView
          key={seccion.id}
          seccion={seccion}
          numero={idx + 1}
          flujo={
            // Por convención del REX 71/2026, el flujo va dentro de la
            // última sección. Si hay flujo, lo enganchamos a la última.
            idx === boletin.secciones.length - 1 ? boletin.flujo : undefined
          }
          editTargets={editTargets}
        />
      ))}

      <CierreBlock cierre={boletin.cierre} editTargets={editTargets} />

      <div style={{ height: "32px" }}></div>
      <div className="uatta-ribbon"></div>

      <FooterBlock footer={boletin.footer} editTargets={editTargets} />
    </article>
  );
}

// ---------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------

function HeroBlock({ boletin, editTargets }: Props) {
  const rexLabel = `Descargar Resolución Exenta General N° ${boletin.hero.rex.numero} de ${boletin.hero.rex.anio}`;
  const heroBg = computeHeroBackground(boletin.hero);

  return (
    <section
      className="uatta-hero"
      style={{ background: heroBg }}
      {...ed("hero", editTargets)}
    >
      <span className="uatta-hero__eyebrow">{boletin.hero.eyebrow}</span>
      <h1>{parseInline(boletin.hero.titulo)}</h1>
      <p className="uatta-hero__sub">{parseInline(boletin.hero.subtitulo)}</p>
      <a
        className="uatta-hero__rex"
        href={boletin.hero.rex.url}
        target="_blank"
        rel="noopener"
      >
        <span className="uatta-rex-tag">REX</span>
        <span>
          {rexLabel}
          <span className="uatta-rex-meta">{boletin.hero.rex.descripcion}</span>
        </span>
      </a>
    </section>
  );
}

// ---------------------------------------------------------------------
// Audiencia
// ---------------------------------------------------------------------

function AudienciaBlock({
  items,
  editTargets,
}: {
  items: AudienciaItem[];
  editTargets?: boolean;
}) {
  return (
    <div className="uatta-audience" {...ed("audiencia", editTargets)}>
      <h3 className="uatta-audience__title">¿A quién aplica este procedimiento?</h3>
      <ul className="uatta-audience__list">
        {items.map((item, i) => (
          <li key={i}>
            <span className="uatta-dot"></span>
            <span>
              <strong>{parseInline(item.titulo)}</strong>
              <span className="subtle">{parseInline(item.descripcion)}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------
// Sección + bloques
// ---------------------------------------------------------------------

function SeccionView({
  seccion,
  numero,
  flujo,
  editTargets,
}: {
  seccion: Seccion;
  numero: number;
  flujo?: BoletinModel["flujo"];
  editTargets?: boolean;
}) {
  return (
    <section className="uatta-section">
      <div
        className="uatta-section-head"
        {...ed(`seccion:${seccion.id}`, editTargets)}
      >
        <span className="uatta-num">{String(numero).padStart(2, "0")}</span>
        <h2>{parseInline(seccion.titulo)}</h2>
      </div>
      {seccion.intro && (
        <p {...ed(`seccion:${seccion.id}`, editTargets)}>
          {parseInline(seccion.intro)}
        </p>
      )}
      {seccion.bloques.map((bloque, i) =>
        editTargets ? (
          <div key={i} data-edit={`bloque:${seccion.id}:${i}`}>
            <BloqueView bloque={bloque} />
          </div>
        ) : (
          <BloqueView key={i} bloque={bloque} />
        ),
      )}
      {flujo &&
        (editTargets ? (
          <div data-edit="flujo">
            <FlujoBlock flujo={flujo} />
          </div>
        ) : (
          <FlujoBlock flujo={flujo} />
        ))}
    </section>
  );
}

function BloqueView({ bloque }: { bloque: SeccionBloque }) {
  switch (bloque.tipo) {
    case "parrafo":
      return <p>{parseInline(bloque.contenido)}</p>;

    case "leadbar":
      return (
        <p className={bloque.compacto ? "uatta-tram-resp" : "uatta-leadblock"}>
          {parseInline(bloque.contenido)}
        </p>
      );

    case "tarjetas-grid":
      return <TarjetasGrid {...bloque} />;

    case "lista-check":
      return (
        <ListaCheck titulo={bloque.titulo} items={bloque.items} />
      );

    case "lista-x":
      return <ListaX titulo={bloque.titulo} items={bloque.items} />;

    case "callout-naranja":
      return (
        <div className="uatta-callout-naranja">
          {parseInline(bloque.contenido)}
        </div>
      );

    case "detalle-resaltado":
      return <DetalleResaltado {...bloque} />;
  }
}

// ---------------------------------------------------------------------
// Bloques específicos
// ---------------------------------------------------------------------

function TarjetasGrid({
  columnas,
  variante,
  tarjetas,
}: Extract<SeccionBloque, { tipo: "tarjetas-grid" }>) {
  const v = variante ?? "simple";
  const gridStyle =
    columnas === 3 ? { gridTemplateColumns: "repeat(3, 1fr)" } : undefined;

  // Wrapper común que respeta `full` por tarjeta.
  const wrap = (i: number, t: TarjetaGrid, child: React.ReactNode) => (
    <CardWrapper key={i} t={t}>
      {child}
    </CardWrapper>
  );

  function renderTarjeta(t: TarjetaGrid): React.ReactNode {
    if (t.tipo === "media") return <MediaCard tarjeta={t} />;
    if (t.tipo === "cta") return <CtaCard tarjeta={t} />;
    // tipo === "normal" o undefined → sigue el render de la variante.
    return null;
  }

  if (v === "resp") {
    return (
      <div className="uatta-grid-2" style={gridStyle}>
        {tarjetas.map((t, i) => {
          const especial = renderTarjeta(t);
          if (especial) return wrap(i, t, especial);
          return wrap(
            i,
            t,
            <article className="uatta-resp-card">
              {t.etiqueta && (
                <span className="uatta-step">{parseInline(t.etiqueta)}</span>
              )}
              <h3>{parseInline(t.titulo ?? "")}</h3>
              {t.who && (
                <p className="uatta-who">{parseInline(t.who)}</p>
              )}
              <ul>
                {(t.items ?? []).map((it, j) => (
                  <li key={j}>{parseInline(it)}</li>
                ))}
              </ul>
            </article>,
          );
        })}
      </div>
    );
  }

  if (v === "simple") {
    return (
      <div className="uatta-grid-req" style={gridStyle}>
        {tarjetas.map((t, i) => {
          const especial = renderTarjeta(t);
          if (especial) return wrap(i, t, especial);
          return wrap(
            i,
            t,
            <div className="uatta-req">
              <h4>{parseInline(t.titulo ?? "")}</h4>
              <ul>
                {(t.items ?? []).map((it, j) => (
                  <li key={j}>{parseInline(it)}</li>
                ))}
              </ul>
            </div>,
          );
        })}
      </div>
    );
  }

  if (v === "gasto") {
    return (
      <div className="uatta-gastos" style={gridStyle}>
        {tarjetas.map((t, i) => {
          const especial = renderTarjeta(t);
          if (especial) return wrap(i, t, especial);
          return wrap(i, t, <GastoCard tarjeta={t} />);
        })}
      </div>
    );
  }

  // v === "caso"
  return (
    <div className="uatta-tram" style={gridStyle}>
      {tarjetas.map((t, i) => {
        const especial = renderTarjeta(t);
        if (especial) return wrap(i, t, especial);
        return wrap(
          i,
          t,
          <article
            className={`uatta-tram__card${t.tono === "azul" ? " alt" : ""}`}
          >
            <div className="uatta-tram__top">
              {parseInline(t.etiqueta ?? "")}
              {t.badge && (
                <span className="uatta-badge">{parseInline(t.badge)}</span>
              )}
            </div>
            <div className="uatta-tram__body">
              <h4>{parseInline(t.titulo ?? "")}</h4>
              {(t.parrafos ?? []).map((p, j) => (
                <p key={j}>{parseInline(p)}</p>
              ))}
            </div>
          </article>,
        );
      })}
    </div>
  );
}

/**
 * Wrapper que aplica `grid-column: 1/-1` cuando la tarjeta es full.
 * El wrapper es un fragment de React si no hay full, o un div con
 * className uatta-grid-full si sí.
 *
 * Tomamos esta estrategia (wrapper) en lugar de pasar la prop al hijo
 * porque las tarjetas tienen elementos ya tipados (article, div) que no
 * siempre podemos modificar sin romper el styling. Un wrapper extra es
 * el mínimo cambio en DOM con el efecto deseado.
 *
 * Excepto para tarjetas .uatta-gasto donde la regla --full ya existe en
 * uatta.css con la misma especificidad — para esas, no envolvemos.
 */
function CardWrapper({
  t,
  children,
}: {
  t: TarjetaGrid;
  children: React.ReactNode;
}) {
  if (!t.full) return <>{children}</>;
  return <div className="uatta-grid-full">{children}</div>;
}

function MediaCard({ tarjeta }: { tarjeta: TarjetaGrid }) {
  if (!tarjeta.src) return null;
  return (
    <figure className="uatta-media-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={tarjeta.src} alt={tarjeta.alt ?? ""} />
      {tarjeta.caption && (
        <figcaption>{parseInline(tarjeta.caption)}</figcaption>
      )}
    </figure>
  );
}

function CtaCard({ tarjeta }: { tarjeta: TarjetaGrid }) {
  return (
    <article className="uatta-cta-card">
      {tarjeta.titulo && <h4>{parseInline(tarjeta.titulo)}</h4>}
      {tarjeta.descripcion && (
        <p>{parseInline(tarjeta.descripcion)}</p>
      )}
      {tarjeta.url && tarjeta.label && (
        <a href={tarjeta.url} target="_blank" rel="noopener">
          {tarjeta.ctaIcono && (
            <span className="uatta-cta-card__icon" aria-hidden="true">
              <IconoSvg icono={tarjeta.ctaIcono} />
            </span>
          )}
          {parseInline(tarjeta.label)}
        </a>
      )}
    </article>
  );
}

function GastoCard({ tarjeta }: { tarjeta: TarjetaGrid }) {
  // Las cards de "Taxi" y "Vehículo particular" son full-width en la
  // referencia (1 columna). Detectamos por icono porque es la regla
  // visual fija del REX 71/2026 — para futuros boletines, se podría
  // promover full a un campo del schema.
  const isFull = tarjeta.icono === "taxi" || tarjeta.icono === "vehiculo";
  const isVehiculo = tarjeta.icono === "vehiculo";
  const cls = [
    "uatta-gasto",
    isFull ? "uatta-gasto--full" : "",
    isVehiculo ? "uatta-gasto--vehiculo" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={cls}>
      <div className="uatta-gasto__head">
        <span className="uatta-icon" aria-hidden="true">
          <IconoSvg icono={tarjeta.icono!} />
        </span>
        <h4>
          {parseInline(tarjeta.titulo ?? "")}
          {tarjeta.subtitulo && (
            <span
              style={{
                fontWeight: 500,
                color: "var(--u-fg-3)",
                fontSize: "12px",
              }}
            >
              {" · "}
              {parseInline(tarjeta.subtitulo)}
            </span>
          )}
        </h4>
      </div>
      <div className="uatta-gasto__body">
        {tarjeta.incluye ? (
          // Layout especial vehículo: párrafo izq + caja "Incluye" der.
          <div className="uatta-vehiculo-detail">
            <p>{parseInline(tarjeta.parrafos?.[0] ?? "")}</p>
            <div className="uatta-incluye">
              <h5>Incluye</h5>
              <ul>
                {tarjeta.incluye.map((it, j) => (
                  <li key={j}>{parseInline(it)}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <ul>
            {(tarjeta.items ?? []).map((it, j) => (
              <li key={j}>{parseInline(it)}</li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

/**
 * Catálogo de íconos. Trazos basados en Lucide / Heroicons (MIT).
 * 18×18 viewBox 0 0 24 24, stroke 2, line-cap round.
 */
function IconoSvg({ icono }: { icono: Icono }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (icono) {
    case "bus":
      return (
        <svg {...common}>
          <path d="M3 6c0-2 1-3 3-3h11c1 0 2 1 2 3v12H3V6Z" />
          <path d="M2 12h19" />
          <circle cx="7" cy="17" r="1.4" />
          <circle cx="17" cy="17" r="1.4" />
        </svg>
      );
    case "colectivo":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3v18" />
        </svg>
      );
    case "taxi":
      return (
        <svg {...common}>
          <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
          <circle cx="6.5" cy="16.5" r="2" />
          <circle cx="16.5" cy="16.5" r="2" />
        </svg>
      );
    case "vehiculo":
      return (
        <svg {...common}>
          <path d="M19 17h2v-3.5L18 9H6L3 13.5V17h2" />
          <circle cx="7" cy="17" r="2" />
          <circle cx="17" cy="17" r="2" />
        </svg>
      );
    case "documento":
      return (
        <svg {...common}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M9 13h6M9 17h6" />
        </svg>
      );
    case "archivo":
      return (
        <svg {...common}>
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      );
    case "personas":
      return (
        <svg {...common}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "calendario":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      );
    case "dinero":
      return (
        <svg {...common}>
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    case "pago":
      return (
        <svg {...common}>
          <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      );
    case "email":
      return (
        <svg {...common}>
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      );
    case "telefono":
      return (
        <svg {...common}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      );
    case "edificio":
      return (
        <svg {...common}>
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
          <path d="M9 22v-4h6v4" />
          <path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
        </svg>
      );
    case "checklist":
      return (
        <svg {...common}>
          <path d="M9 11l3 3 8-8" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      );
    case "alerta":
      return (
        <svg {...common}>
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case "info":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      );
    case "estrella":
      return (
        <svg {...common}>
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      );
    case "candado":
      return (
        <svg {...common}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    case "globo":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case "engranaje":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    case "libro":
      return (
        <svg {...common}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
    case "enlace":
      return (
        <svg {...common}>
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.71" />
        </svg>
      );
    case "descarga":
      return (
        <svg {...common}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7,10 12,15 17,10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      );
    case "impresora":
      return (
        <svg {...common}>
          <polyline points="6,9 6,2 18,2 18,9" />
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
          <rect x="6" y="14" width="12" height="8" />
        </svg>
      );
  }
}

function ListaCheck({ titulo, items }: { titulo?: string; items: string[] }) {
  // No hay clase específica en uatta.css para lista-check (el REX 71 no
  // la usa). Reusamos el patrón de uatta-deny pero con check verde si
  // el día de mañana hace falta — por ahora cae en el callout estándar.
  return (
    <div className="uatta-deny" data-variante="check">
      {titulo && <h3>{parseInline(titulo)}</h3>}
      <ul>
        {items.map((it, i) => (
          <li key={i}>{parseInline(it)}</li>
        ))}
      </ul>
    </div>
  );
}

function ListaX({ titulo, items }: { titulo?: string; items: string[] }) {
  return (
    <div className="uatta-deny">
      {titulo && <h3>{parseInline(titulo)}</h3>}
      <ul>
        {items.map((it, i) => (
          <li key={i}>{parseInline(it)}</li>
        ))}
      </ul>
    </div>
  );
}

function DetalleResaltado({
  titulo,
  subtitulo,
  incluye,
}: Extract<SeccionBloque, { tipo: "detalle-resaltado" }>) {
  return (
    <div className="uatta-gastos">
      <article className="uatta-gasto uatta-gasto--full uatta-gasto--vehiculo">
        <div className="uatta-gasto__head">
          <span className="uatta-icon" aria-hidden="true">
            <IconoSvg icono="vehiculo" />
          </span>
          <h4>
            {parseInline(titulo)}
            {subtitulo && (
              <span
                style={{
                  fontWeight: 500,
                  color: "var(--u-fg-3)",
                  fontSize: "12px",
                }}
              >
                {" · "}
                {parseInline(subtitulo)}
              </span>
            )}
          </h4>
        </div>
        <div className="uatta-gasto__body">
          <div className="uatta-vehiculo-detail">
            <p>
              Su uso es excepcional y se autoriza cuando no exista locomoción colectiva urbana disponible o existan condiciones que lo justifiquen.
            </p>
            <div className="uatta-incluye">
              <h5>Incluye</h5>
              <ul>
                {incluye.map((it, i) => (
                  <li key={i}>{parseInline(it)}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

// ---------------------------------------------------------------------
// Flujo
// ---------------------------------------------------------------------

function FlujoBlock({ flujo }: { flujo: NonNullable<BoletinModel["flujo"]> }) {
  return (
    <div className="uatta-flow">
      <p className="uatta-flow__intro">{parseInline(flujo.intro)}</p>
      <ol className="uatta-flow__list">
        {flujo.pasos.map((p, i) => (
          <li key={i} className="uatta-flow__step">
            <span className="uatta-flow__num">{i + 1}</span>
            <div className="uatta-flow__body">
              <h4>{parseInline(p.rol)}</h4>
              <p>{parseInline(p.descripcion)}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ---------------------------------------------------------------------
// Cierre + footer
// ---------------------------------------------------------------------

function CierreBlock({
  cierre,
  editTargets,
}: {
  cierre: BoletinModel["cierre"];
  editTargets?: boolean;
}) {
  return (
    <aside className="uatta-closing" {...ed("cierre", editTargets)}>
      <p>{parseInline(cierre.texto)}</p>
      <div className="uatta-principles">
        {cierre.principios.map((p, i) => (
          <span key={i}>{parseInline(p)}</span>
        ))}
      </div>
    </aside>
  );
}

function FooterBlock({
  footer,
  editTargets,
}: {
  footer: BoletinModel["footer"];
  editTargets?: boolean;
}) {
  return (
    <footer className="uatta-footer" {...ed("footer", editTargets)}>
      <div>
        <h4>{parseInline(footer.contactoTitulo)}</h4>
        <div className="uatta-contact">
          <strong>{parseInline(footer.contacto.nombre)}</strong>
          <span className="uatta-contact__role">
            {parseInline(footer.contacto.cargo)}
          </span>
          <a href={`mailto:${footer.contacto.email}`}>{footer.contacto.email}</a>
        </div>
        <p>{parseInline(footer.notaAdicional)}</p>
      </div>
      <div className="uatta-footer__brand">
        <img
          className="uatta-footer__logo"
          src="/uatta-logo.png"
          alt="Unidad Administradora TTA-TCP"
        />
        <strong>Unidad Administradora TTA-TCP</strong>
        Ministerio de Hacienda · Gobierno de Chile
      </div>
      <div className="uatta-footer__credits">
        <span>
          <span className="uatta-cred-label">Desarrolla</span>{" "}
          <b>{parseInline(footer.creditos.desarrolla.unidad)}</b> ·{" "}
          <a href={`mailto:${footer.creditos.desarrolla.email}`}>
            {footer.creditos.desarrolla.email}
          </a>
        </span>
        <span aria-hidden="true">·</span>
        <span>
          <span className="uatta-cred-label">En conjunto con</span>{" "}
          <b>{parseInline(footer.creditos.enConjuntoCon.unidad)}</b>
        </span>
      </div>
    </footer>
  );
}
