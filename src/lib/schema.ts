/**
 * Modelo de datos del Boletín de Procedimientos.
 *
 * Espejo 1:1 del schema cerrado en BRIEF.md. Las decisiones tomadas:
 *
 * - `flujo` es top-level opcional (no es un bloque de sección). En la
 *   referencia aparece dentro de la sección 05 "¿Cómo se tramita el
 *   reembolso?", pero acá está separado para que futuros boletines puedan
 *   tenerlo o no sin tocar el array de secciones.
 *
 * - `audiencia` viene con un set fijo de tres colores (red | orange | blue)
 *   que mapea a las variantes de `uatta-dot` por nth-child en uatta.css.
 *
 * - Los bloques son patrones visuales genéricos, no acoplados al contenido
 *   del REX 71. Un boletín de otro procedimiento puede usar los mismos
 *   bloques con otro contenido.
 *
 * Cualquier cambio en este archivo obliga a:
 *   1. Bump de SCHEMA_VERSION.
 *   2. Migración de los JSON existentes en data/boletines/.
 *   3. Re-validación pixel-perfect del render.
 */

export const SCHEMA_VERSION = 1 as const;

export type AudienciaColor = "red" | "orange" | "blue";

export type AudienciaItem = {
  color: AudienciaColor;
  titulo: string;
  descripcion: string;
};

/**
 * Convención de inline emphasis dentro de strings:
 *   [[texto]] → <strong>  (color institucional --u-fg-1, navy en h4)
 *   //texto// → <em>      (en hero h1: highlight rojo; en body: itálica)
 *
 * El editor muestra una nota debajo de cada textarea recordando esta
 * convención. El parser está en src/lib/inline.ts.
 */

/**
 * Catálogo de íconos disponibles para tarjetas (variantes "gasto" y
 * "cta"). Renombrado de IconoGasto en Hito 3.5 cuando se amplió el
 * universo más allá de transporte. Cada uno mapea a un SVG inline en
 * Boletin.tsx → IconoSvg().
 */
export type Icono =
  | "bus"
  | "colectivo"
  | "taxi"
  | "vehiculo"
  | "documento"
  | "archivo"
  | "personas"
  | "calendario"
  | "dinero"
  | "pago"
  | "email"
  | "telefono"
  | "edificio"
  | "checklist"
  | "alerta"
  | "info"
  | "estrella"
  | "candado"
  | "globo"
  | "engranaje"
  | "libro"
  | "enlace"
  | "descarga"
  | "impresora";

/** Compatibilidad hacia atrás del nombre anterior. */
export type IconoGasto = Icono;

/**
 * Variantes visuales del tarjetas-grid:
 *
 * - "simple" (default): clase uatta-req. Solo titulo + items. Sección 02.
 * - "resp":   clase uatta-resp-card. etiqueta + titulo + who + items. Sección 01.
 * - "gasto":  clase uatta-gasto. icono + titulo (+ subtitulo) + items. Sección 03.
 * - "caso":   clase uatta-tram__card. tono + etiqueta + badge + titulo + parrafos. Sección 05.
 *
 * Un único tipo de bloque para mantener el schema simple. El editor muestra
 * el form apropiado según la variante elegida; los campos no aplicables se
 * ignoran al guardar.
 */
export type TarjetasGridVariante = "simple" | "resp" | "gasto" | "caso";

/**
 * Tipo de tarjeta dentro de un tarjetas-grid:
 *  - "normal" (default): la tarjeta tradicional con titulo + items
 *    (estilo definido por la variante del grid).
 *  - "media": tarjeta de imagen para rellenar espacios vacíos del grid.
 *  - "cta":   tarjeta de call-to-action con título, descripción y botón
 *    enlazado (ej. "Descargar formulario").
 *
 * Las tres conviven en el mismo array `tarjetas` del bloque. El render
 * dispatcha por `tipo`. Ambos "media" y "cta" honran el flag `full`.
 */
export type TarjetaGridTipo = "normal" | "media" | "cta";

export type TarjetaGrid = {
  /** Tipo de tarjeta (default "normal"). */
  tipo?: TarjetaGridTipo;
  /** Si true, la tarjeta ocupa el ancho completo del grid (1/-1). */
  full?: boolean;

  // --- normal & cta ---
  etiqueta?: string;
  titulo?: string;
  subtitulo?: string;

  // --- normal ---
  who?: string;
  icono?: Icono;
  badge?: string;
  tono?: "navy" | "azul";
  items?: string[];
  parrafos?: string[];
  /**
   * Cuando está presente y la variante es "gasto", el render usa el
   * layout uatta-vehiculo-detail (párrafo izq + caja "Incluye" der).
   * El párrafo viene de parrafos[0]; el items list se ignora.
   */
  incluye?: string[];

  // --- media ---
  src?: string;
  alt?: string;
  caption?: string;

  // --- cta ---
  url?: string;
  label?: string;
  descripcion?: string;
  ctaIcono?: Icono;
};

export type SeccionBloque =
  | { tipo: "parrafo"; contenido: string }
  /**
   * leadbar: navy bg + blue left border + emphasis text.
   * Si compacto: padding y font reducidos (uatta-tram-resp), ideal antes
   * de un tarjetas-grid variante "caso".
   */
  | { tipo: "leadbar"; contenido: string; compacto?: boolean }
  | {
      tipo: "tarjetas-grid";
      columnas: 2 | 3;
      variante?: TarjetasGridVariante;
      tarjetas: TarjetaGrid[];
    }
  | { tipo: "lista-check"; titulo?: string; items: string[] }
  | { tipo: "lista-x"; titulo?: string; items: string[] }
  | { tipo: "callout-naranja"; contenido: string }
  | {
      tipo: "detalle-resaltado";
      titulo: string;
      subtitulo?: string;
      incluye: string[];
    };

export type Seccion = {
  id: string;
  titulo: string;
  intro?: string;
  bloques: SeccionBloque[];
};

export type FlujoPaso = {
  rol: string;
  descripcion: string;
};

export type Flujo = {
  intro: string;
  pasos: FlujoPaso[];
};

/**
 * Intensidad del overlay institucional sobre la imagen del hero.
 *
 *  - "institucional" (default): gradiente navy/azul que oscurece la
 *    imagen para que el texto blanco resalte. Mismas alphas que la
 *    referencia (0.94, 0.84, 0.78).
 *  - "tenue": overlay sutil — solo un velo para legibilidad. Alphas
 *    0.45, 0.40, 0.35.
 *  - "ninguno": sin gradiente sobre la imagen. La imagen se ve en sus
 *    colores naturales. El usuario asume que el texto puede tener menor
 *    contraste según la imagen.
 */
export type HeroOverlay = "institucional" | "tenue" | "ninguno";

/**
 * Cómo encaja la imagen del hero en su contenedor:
 *  - "cover" (default): la imagen llena el hero, recortando lo que sobre.
 *  - "contain": la imagen entra entera, puede haber espacio sólido alrededor.
 *  - "ancho-completo": la imagen ocupa el 100% del ancho, alto auto. Puede
 *    dejar espacio arriba o abajo si la proporción de la imagen es más
 *    apaisada que la del hero.
 */
export type HeroEncaje = "cover" | "contain" | "ancho-completo";

/**
 * Posición horizontal de la imagen cuando el encaje recorta o no la centra.
 * Solo aplica con encaje "cover" (con "contain" la imagen está siempre
 * centrada por construcción; con "ancho-completo" no hay desplazamiento
 * horizontal porque ya ocupa todo el ancho).
 */
export type HeroPosicion = "left" | "center" | "right";

export type Hero = {
  eyebrow: string;
  titulo: string;
  subtitulo: string;
  imagenFondo?: string;
  overlayIntensidad?: HeroOverlay;
  imagenEncaje?: HeroEncaje;
  imagenPosicion?: HeroPosicion;
  rex: {
    numero: string;
    anio: number;
    url: string;
    descripcion: string;
  };
};

export type Cierre = {
  texto: string;
  principios: string[];
};

export type Footer = {
  contactoTitulo: string;
  contacto: {
    nombre: string;
    cargo: string;
    email: string;
  };
  notaAdicional: string;
  creditos: {
    desarrolla: { unidad: string; email: string };
    enConjuntoCon: { unidad: string };
  };
};

export type BoletinFecha = {
  mes: string;
  anio: number;
};

export type BoletinStatus = "draft" | "published";

export type Boletin = {
  id: string;
  status: BoletinStatus;
  schemaVersion: typeof SCHEMA_VERSION;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  numero: number;
  fecha: BoletinFecha;
  hero: Hero;
  audiencia: AudienciaItem[];
  secciones: Seccion[];
  flujo?: Flujo;
  cierre: Cierre;
  footer: Footer;
};

// ---------------------------------------------------------------------
// Helpers de validación liviana — no es JSON Schema pleno, alcanza para
// detectar drift cuando se carga un JSON de disco.
// ---------------------------------------------------------------------

const TIPOS_BLOQUE: ReadonlyArray<SeccionBloque["tipo"]> = [
  "parrafo",
  "leadbar",
  "tarjetas-grid",
  "lista-check",
  "lista-x",
  "callout-naranja",
  "detalle-resaltado",
];

export function esBoletin(value: unknown): value is Boletin {
  if (!value || typeof value !== "object") return false;
  const b = value as Partial<Boletin>;
  return (
    typeof b.id === "string" &&
    (b.status === "draft" || b.status === "published") &&
    b.schemaVersion === SCHEMA_VERSION &&
    typeof b.numero === "number" &&
    typeof b.fecha === "object" &&
    typeof b.hero === "object" &&
    Array.isArray(b.audiencia) &&
    Array.isArray(b.secciones) &&
    typeof b.cierre === "object" &&
    typeof b.footer === "object" &&
    b.secciones.every(
      (s) =>
        typeof s.id === "string" &&
        typeof s.titulo === "string" &&
        Array.isArray(s.bloques) &&
        s.bloques.every(
          (bl) =>
            typeof bl === "object" &&
            bl !== null &&
            "tipo" in bl &&
            TIPOS_BLOQUE.includes((bl as SeccionBloque).tipo),
        ),
    )
  );
}
