import "server-only";

import PptxGenJS from "pptxgenjs";
import type { Boletin, SeccionBloque, TarjetaGrid } from "./schema";

/**
 * Genera un PPTX del boletín. Estructura:
 *   - Slide 1: portada (eyebrow + título + fecha + número + REX label)
 *   - Slide N: una por sección numerada, con el título y un bullet
 *     list construido a partir de los bloques de esa sección.
 *   - Slide final (si hay flujo): los 9 pasos del flujo.
 *
 * Paleta institucional: rojo #E73439, navy #1C2557, azul #0063AF,
 * tipografías Calibri/Segoe UI. La regla pixel-perfect del HTML/PDF NO
 * aplica al PPT — es un formato distinto donde lo importante es que el
 * contenido y la marca queden coherentes.
 *
 * Devuelve un Buffer con el binario PPTX listo para mandar como
 * application/vnd.openxmlformats-officedocument.presentationml.presentation.
 */

const RED = "E73439";
const NAVY = "1C2557";
const BLUE = "0063AF";
const NAVY_DEEP = "25306B";
const FG_1 = "1A1D27";
const FG_2 = "4A5060";
const FG_3 = "6B7180";
const BG_GRIS = "F7F8FA";

export async function generarPptx(boletin: Boletin): Promise<Buffer> {
  const pres = new PptxGenJS();
  pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5"
  pres.author = "Unidad Administradora TTA-TCP";
  pres.company = "Ministerio de Hacienda · Gobierno de Chile";
  pres.title = `Boletín N° ${String(boletin.numero).padStart(2, "0")}`;

  slidePortada(pres, boletin);
  for (let i = 0; i < boletin.secciones.length; i++) {
    slideSeccion(pres, boletin, i);
  }
  if (boletin.flujo) slideFlujo(pres, boletin.flujo);

  const out = (await pres.write({ outputType: "nodebuffer" })) as Buffer;
  return out;
}

function slidePortada(pres: PptxGenJS, b: Boletin): void {
  const slide = pres.addSlide();
  slide.background = { color: NAVY_DEEP };

  // Barra roja institucional al borde superior izquierdo
  slide.addShape("rect", {
    x: 0.5, y: 0.5, w: 0.08, h: 0.6,
    fill: { color: RED }, line: { color: RED },
  });

  slide.addText(stripInline(b.hero.eyebrow).toUpperCase(), {
    x: 0.7, y: 0.55, w: 12, h: 0.5,
    fontFace: "Calibri", fontSize: 12, bold: true, color: "FFFFFF",
    charSpacing: 18,
  });

  // Título: 4 líneas de espacio, autoFit reduce font si es muy largo.
  slide.addText(stripInline(b.hero.titulo), {
    x: 0.7, y: 1.2, w: 12, h: 3.2,
    fontFace: "Calibri", fontSize: 36, bold: true, color: "FFFFFF",
    valign: "top",
    autoFit: true,
  });

  slide.addText(stripInline(b.hero.subtitulo), {
    x: 0.7, y: 4.55, w: 11, h: 1.3,
    fontFace: "Calibri", fontSize: 14, color: "DDE0E8",
    valign: "top",
    paraSpaceBefore: 4, paraSpaceAfter: 4,
    autoFit: true,
  });

  // Caja REX inferior — botón en una sola pieza (rect con texto adentro).
  slide.addText(
    [
      {
        text: "REX  ",
        options: { bold: true, fontSize: 11, color: "FFFFFF" },
      },
      {
        text: `N° ${b.hero.rex.numero}/${b.hero.rex.anio} · ${stripInline(b.hero.rex.descripcion)}`,
        options: { bold: true, fontSize: 14, color: "FFFFFF" },
      },
    ],
    {
      x: 0.7, y: 5.95, w: 7, h: 0.85,
      shape: "rect",
      fill: { color: RED },
      line: { color: RED },
      fontFace: "Calibri",
      valign: "middle",
      margin: 0.18,
    },
  );

  // Pie con metadata
  slide.addText(
    `Edición N° ${String(b.numero).padStart(2, "0")} · ${b.fecha.mes} ${b.fecha.anio}`,
    {
      x: 0.7, y: 7.05, w: 12, h: 0.3,
      fontFace: "Calibri", fontSize: 11, color: "AAB0BB",
      charSpacing: 12,
    },
  );
  slide.addText(
    "Gobierno de Chile · Ministerio de Hacienda · Unidad Administradora TTA-TCP",
    {
      x: 0.7, y: 7.3, w: 12, h: 0.25,
      fontFace: "Calibri", fontSize: 10, color: "8088A0",
      charSpacing: 10,
    },
  );
}

function slideSeccion(pres: PptxGenJS, b: Boletin, idx: number): void {
  const seccion = b.secciones[idx];
  const slide = pres.addSlide();
  slide.background = { color: "FFFFFF" };

  const numero = String(idx + 1).padStart(2, "0");

  // Encabezado: número rojo + título navy en línea base alineada.
  slide.addText(numero, {
    x: 0.5, y: 0.45, w: 1.1, h: 1.1,
    fontFace: "Calibri", fontSize: 54, bold: true, color: RED,
    valign: "middle", align: "left",
  });
  slide.addText(stripInline(seccion.titulo), {
    x: 1.65, y: 0.45, w: 11.2, h: 1.1,
    fontFace: "Calibri", fontSize: 26, bold: true, color: NAVY,
    valign: "middle",
    autoFit: true,
  });

  // Línea separadora
  slide.addShape("line", {
    x: 0.5, y: 1.65, w: 12.3, h: 0,
    line: { color: "DCDFE6", width: 1 },
  });

  // Cuerpo: bullets a partir de los bloques de la sección. autoFit
  // reduce el font si hay muchos items para que no haya overflow.
  const bullets = bulletsDeBloques(seccion.bloques);
  if (bullets.length > 0) {
    slide.addText(
      bullets.map((bl) => ({
        text: bl.text,
        options: {
          bullet: bl.bullet,
          indentLevel: bl.level,
          paraSpaceBefore: 2,
          paraSpaceAfter: 2,
        },
      })),
      {
        x: 0.6, y: 1.85, w: 12.2, h: 5.2,
        fontFace: "Calibri", fontSize: 14, color: FG_2,
        valign: "top",
        autoFit: true,
      },
    );
  }

  // Footer institucional
  slide.addText(
    `Boletín de Procedimientos · N° ${String(b.numero).padStart(2, "0")} · ${b.fecha.mes} ${b.fecha.anio}`,
    {
      x: 0.5, y: 7.2, w: 12, h: 0.25,
      fontFace: "Calibri", fontSize: 9, color: FG_3,
    },
  );
}

function slideFlujo(pres: PptxGenJS, flujo: NonNullable<Boletin["flujo"]>): void {
  const slide = pres.addSlide();
  slide.background = { color: BG_GRIS };

  slide.addText("Flujo de responsabilidades", {
    x: 0.5, y: 0.4, w: 12, h: 0.6,
    fontFace: "Calibri", fontSize: 24, bold: true, color: NAVY,
    valign: "middle",
  });

  slide.addText(stripInline(flujo.intro), {
    x: 0.5, y: 1.05, w: 12, h: 0.8,
    fontFace: "Calibri", fontSize: 12, color: FG_2,
    italic: true,
    valign: "top",
    autoFit: true,
  });

  // Pasos en 2 columnas (5 izq + 4 der), igual que el render web.
  const cols = 2;
  const rows = 5;
  const startX = 0.5;
  const startY = 2.05;
  const colW = 6.15;
  const rowH = 1.05;
  const gapX = 0.2;

  flujo.pasos.forEach((paso, i) => {
    const col = Math.floor(i / rows);
    const row = i % rows;
    if (col >= cols) return; // si hay más de 10 pasos los truncamos
    const x = startX + col * (colW + gapX);
    const y = startY + row * rowH;
    const accent = i < 5 ? RED : NAVY;

    // Círculo numerado: shape + texto integrados en un solo elemento
    // (addText con shape: "ellipse"). Esto garantiza centrado vertical
    // perfecto del número, vs el approach anterior con shape y text
    // separados que solían quedar 1-2 px desfasados.
    slide.addText(String(i + 1), {
      x, y: y + 0.12, w: 0.5, h: 0.5,
      shape: "ellipse",
      fill: { color: accent }, line: { color: accent },
      fontFace: "Calibri", fontSize: 14, bold: true, color: "FFFFFF",
      align: "center", valign: "middle",
    });

    // Bloque texto al lado del círculo, valign middle para alinear con
    // el centro del círculo independiente del largo del rol.
    slide.addText(
      [
        { text: stripInline(paso.rol), options: { bold: true, color: NAVY, fontSize: 13, breakLine: true } },
        { text: stripInline(paso.descripcion), options: { color: FG_2, fontSize: 11 } },
      ],
      {
        x: x + 0.6, y: y, w: colW - 0.65, h: rowH - 0.05,
        fontFace: "Calibri",
        valign: "middle",
      },
    );
  });
}

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------

/** Quita los marcadores de inline emphasis ([[..]] y //..//) — el PPT
 *  no soporta inline mixto en runs simples sin más complejidad. */
function stripInline(s: string | undefined): string {
  if (!s) return "";
  return s.replace(/\[\[([^\]]+)\]\]/g, "$1").replace(/\/\/([^\/]+)\/\//g, "$1");
}

type BulletLine = { text: string; bullet: boolean; level: number };

/** Aplana los bloques de una sección a líneas con bullet/indent para
 *  el formato de PowerPoint. */
function bulletsDeBloques(bloques: SeccionBloque[]): BulletLine[] {
  const out: BulletLine[] = [];
  for (const b of bloques) {
    switch (b.tipo) {
      case "parrafo":
      case "leadbar":
      case "callout-naranja":
        out.push({ text: stripInline(b.contenido), bullet: false, level: 0 });
        break;
      case "tarjetas-grid":
        for (const t of b.tarjetas) {
          out.push(...bulletsDeTarjeta(t));
        }
        break;
      case "lista-check":
      case "lista-x":
        if (b.titulo) out.push({ text: stripInline(b.titulo), bullet: false, level: 0 });
        for (const it of b.items) {
          out.push({ text: stripInline(it), bullet: true, level: 0 });
        }
        break;
      case "detalle-resaltado":
        out.push({ text: stripInline(b.titulo), bullet: false, level: 0 });
        for (const it of b.incluye) {
          out.push({ text: stripInline(it), bullet: true, level: 0 });
        }
        break;
    }
  }
  return out;
}

function bulletsDeTarjeta(t: TarjetaGrid): BulletLine[] {
  const out: BulletLine[] = [];
  if (t.tipo === "media") {
    if (t.caption)
      out.push({
        text: "[Imagen] " + stripInline(t.caption),
        bullet: false,
        level: 0,
      });
    return out;
  }
  if (t.tipo === "cta") {
    if (t.titulo) out.push({ text: stripInline(t.titulo), bullet: false, level: 0 });
    if (t.descripcion) out.push({ text: stripInline(t.descripcion), bullet: false, level: 1 });
    if (t.url && t.label)
      out.push({
        text: `${t.label} → ${t.url}`,
        bullet: false,
        level: 1,
      });
    return out;
  }
  // normal
  if (t.etiqueta) out.push({ text: stripInline(t.etiqueta), bullet: false, level: 0 });
  if (t.titulo) out.push({ text: stripInline(t.titulo), bullet: false, level: 0 });
  if (t.who) out.push({ text: stripInline(t.who), bullet: false, level: 1 });
  for (const it of t.items ?? []) {
    out.push({ text: stripInline(it), bullet: true, level: 1 });
  }
  for (const p of t.parrafos ?? []) {
    out.push({ text: stripInline(p), bullet: false, level: 1 });
  }
  for (const it of t.incluye ?? []) {
    out.push({ text: stripInline(it), bullet: true, level: 2 });
  }
  return out;
}
