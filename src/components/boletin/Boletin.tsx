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
  IconoGasto,
  Seccion,
  SeccionBloque,
  TarjetaGrid,
} from "@/lib/schema";

/**
 * Compone el background-shorthand del hero respetando hero.imagenFondo
 * (URL custom o default) y hero.overlayIntensidad (gradiente sobre la
 * imagen). Override por inline style sobre la regla CSS base de
 * .uatta-hero — uatta.css se mantiene verbatim según la regla del Hito 1.
 *
 * El último gradiente del shorthand actúa como fallback si la imagen no
 * carga: replica la regla original de uatta.css.
 */
function computeHeroBackground(hero: Hero): string {
  const url = hero.imagenFondo ?? "/uatta-hero-bg.jpg";
  const fallback = "linear-gradient(135deg, var(--u-grad-1), var(--u-grad-2))";
  const layerImagen = `url("${url}") center right / cover no-repeat`;
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

type Props = { boletin: BoletinModel };

export function Boletin({ boletin }: Props) {
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
        <div className="uatta-header__meta">
          <b>Boletín de Procedimientos</b>
          {fechaLabel}
        </div>
      </header>

      <HeroBlock boletin={boletin} />

      <div className="uatta-ribbon"></div>

      <AudienciaBlock items={boletin.audiencia} />

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
        />
      ))}

      <CierreBlock cierre={boletin.cierre} />

      <div style={{ height: "32px" }}></div>
      <div className="uatta-ribbon"></div>

      <FooterBlock footer={boletin.footer} />
    </article>
  );
}

// ---------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------

function HeroBlock({ boletin }: Props) {
  const rexLabel = `Descargar Resolución Exenta General N° ${boletin.hero.rex.numero} de ${boletin.hero.rex.anio}`;
  const heroBg = computeHeroBackground(boletin.hero);

  return (
    <section className="uatta-hero" style={{ background: heroBg }}>
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

function AudienciaBlock({ items }: { items: AudienciaItem[] }) {
  return (
    <div className="uatta-audience">
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
}: {
  seccion: Seccion;
  numero: number;
  flujo?: BoletinModel["flujo"];
}) {
  return (
    <section className="uatta-section">
      <div className="uatta-section-head">
        <span className="uatta-num">{String(numero).padStart(2, "0")}</span>
        <h2>{parseInline(seccion.titulo)}</h2>
      </div>
      {seccion.intro && <p>{parseInline(seccion.intro)}</p>}
      {seccion.bloques.map((bloque, i) => (
        <BloqueView key={i} bloque={bloque} />
      ))}
      {flujo && <FlujoBlock flujo={flujo} />}
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

  if (v === "resp") {
    return (
      <div className="uatta-grid-2">
        {tarjetas.map((t, i) => (
          <article key={i} className="uatta-resp-card">
            {t.etiqueta && (
              <span className="uatta-step">{parseInline(t.etiqueta)}</span>
            )}
            <h3>{parseInline(t.titulo)}</h3>
            {t.who && (
              <p className="uatta-who">{parseInline(t.who)}</p>
            )}
            <ul>
              {(t.items ?? []).map((it, j) => (
                <li key={j}>{parseInline(it)}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    );
  }

  if (v === "simple") {
    // uatta-grid-req es el contenedor para 02; ajustamos columnas via grid CSS.
    const gridClass = "uatta-grid-req";
    return (
      <div className={gridClass}>
        {tarjetas.map((t, i) => (
          <div key={i} className="uatta-req">
            <h4>{parseInline(t.titulo)}</h4>
            <ul>
              {(t.items ?? []).map((it, j) => (
                <li key={j}>{parseInline(it)}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }

  if (v === "gasto") {
    return (
      <div className="uatta-gastos">
        {tarjetas.map((t, i) => (
          <GastoCard key={i} tarjeta={t} />
        ))}
      </div>
    );
  }

  // v === "caso"
  return (
    <div className="uatta-tram">
      {tarjetas.map((t, i) => (
        <article
          key={i}
          className={`uatta-tram__card${t.tono === "azul" ? " alt" : ""}`}
        >
          <div className="uatta-tram__top">
            {parseInline(t.etiqueta ?? "")}
            {t.badge && (
              <span className="uatta-badge">{parseInline(t.badge)}</span>
            )}
          </div>
          <div className="uatta-tram__body">
            <h4>{parseInline(t.titulo)}</h4>
            {(t.parrafos ?? []).map((p, j) => (
              <p key={j}>{parseInline(p)}</p>
            ))}
          </div>
        </article>
      ))}
    </div>
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
          {parseInline(tarjeta.titulo)}
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

function IconoSvg({ icono }: { icono: IconoGasto }) {
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

function CierreBlock({ cierre }: { cierre: BoletinModel["cierre"] }) {
  return (
    <aside className="uatta-closing">
      <p>{parseInline(cierre.texto)}</p>
      <div className="uatta-principles">
        {cierre.principios.map((p, i) => (
          <span key={i}>{parseInline(p)}</span>
        ))}
      </div>
    </aside>
  );
}

function FooterBlock({ footer }: { footer: BoletinModel["footer"] }) {
  return (
    <footer className="uatta-footer">
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
