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
    x: 0.5, y: 0.4, w: 0.08, h: 1,
    fill: { color: RED }, line: { color: RED },
  });

  slide.addText(stripInline(b.hero.eyebrow).toUpperCase(), {
    x: 0.7, y: 0.5, w: 12, h: 0.4,
    fontFace: "Calibri", fontSize: 12, bold: true, color: "FFFFFF",
    charSpacing: 18,
  });

  slide.addText(stripInline(b.hero.titulo), {
    x: 0.7, y: 1.1, w: 12, h: 2.5,
    fontFace: "Calibri", fontSize: 38, bold: true, color: "FFFFFF",
  });

  slide.addText(stripInline(b.hero.subtitulo), {
    x: 0.7, y: 4, w: 11, h: 1.5,
    fontFace: "Calibri", fontSize: 16, color: "DDE0E8",
    paraSpaceBefore: 8, paraSpaceAfter: 8,
  });

  // Caja REX inferior
  slide.addShape("rect", {
    x: 0.7, y: 5.8, w: 6.5, h: 0.9,
    fill: { color: RED }, line: { color: RED },
  });
  slide.addText("REX", {
    x: 0.95, y: 5.95, w: 0.7, h: 0.6,
    fontFace: "Calibri", fontSize: 11, bold: true, color: "FFFFFF",
    align: "center",
  });
  slide.addText(
    `N° ${b.hero.rex.numero}/${b.hero.rex.anio} · ${stripInline(b.hero.rex.descripcion)}`,
    {
      x: 1.7, y: 5.95, w: 5.4, h: 0.6,
      fontFace: "Calibri", fontSize: 14, bold: true, color: "FFFFFF",
    },
  );

  // Pie con metadata
  slide.addText(
    `Edición N° ${String(b.numero).padStart(2, "0")} · ${b.fecha.mes} ${b.fecha.anio}`,
    {
      x: 0.7, y: 6.95, w: 12, h: 0.3,
      fontFace: "Calibri", fontSize: 11, color: "AAB0BB",
      charSpacing: 12,
    },
  );
  slide.addText(
    "Gobierno de Chile · Ministerio de Hacienda · Unidad Administradora TTA-TCP",
    {
      x: 0.7, y: 7.2, w: 12, h: 0.25,
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

  // Encabezado: número rojo + título navy
  slide.addText(numero, {
    x: 0.5, y: 0.5, w: 1, h: 1,
    fontFace: "Calibri", fontSize: 56, bold: true, color: RED,
  });
  slide.addText(stripInline(seccion.titulo), {
    x: 1.6, y: 0.55, w: 11, h: 1.1,
    fontFace: "Calibri", fontSize: 28, bold: true, color: NAVY,
  });

  // Línea separadora
  slide.addShape("line", {
    x: 0.5, y: 1.65, w: 12.3, h: 0,
    line: { color: "DCDFE6", width: 1 },
  });

  // Cuerpo: bullets a partir de los bloques de la sección
  const bullets = bulletsDeBloques(seccion.bloques);
  if (bullets.length > 0) {
    slide.addText(
      bullets.map((b) => ({
        text: b.text,
        options: { bullet: b.bullet, indentLevel: b.level },
      })),
      {
        x: 0.7, y: 1.95, w: 12, h: 5,
        fontFace: "Calibri", fontSize: 16, color: FG_2,
        paraSpaceBefore: 4, paraSpaceAfter: 4,
        valign: "top",
      },
    );
  }

  // Footer institucional
  slide.addText(
    `Boletín de Procedimientos · N° ${String(b.numero).padStart(2, "0")} · ${b.fecha.mes} ${b.fecha.anio}`,
    {
      x: 0.5, y: 7.15, w: 12, h: 0.3,
      fontFace: "Calibri", fontSize: 9, color: FG_3,
    },
  );
}

function slideFlujo(pres: PptxGenJS, flujo: NonNullable<Boletin["flujo"]>): void {
  const slide = pres.addSlide();
  slide.background = { color: BG_GRIS };

  slide.addText("Flujo de responsabilidades", {
    x: 0.5, y: 0.5, w: 12, h: 0.7,
    fontFace: "Calibri", fontSize: 24, bold: true, color: NAVY,
  });

  slide.addText(stripInline(flujo.intro), {
    x: 0.5, y: 1.3, w: 12, h: 0.8,
    fontFace: "Calibri", fontSize: 13, color: FG_2,
    italic: true,
  });

  // Pasos en 2 columnas (5 izq + 4 der), igual que el render
  const cols = 2;
  const rows = 5;
  const startX = 0.5;
  const startY = 2.3;
  const colW = 6.15;
  const rowH = 0.95;
  const gapX = 0.2;

  flujo.pasos.forEach((paso, i) => {
    const col = Math.floor(i / rows);
    const row = i % rows;
    if (col >= cols) return; // si hay más de 10 pasos los truncamos
    const x = startX + col * (colW + gapX);
    const y = startY + row * rowH;
    const accent = i < 5 ? RED : NAVY;

    // Círculo numerado
    slide.addShape("ellipse", {
      x, y: y + 0.15, w: 0.45, h: 0.45,
      fill: { color: accent }, line: { color: accent },
    });
    slide.addText(String(i + 1), {
      x, y: y + 0.18, w: 0.45, h: 0.45,
      fontFace: "Calibri", fontSize: 14, bold: true, color: "FFFFFF",
      align: "center",
    });

    // Bloque texto
    slide.addText(
      [
        { text: stripInline(paso.rol) + "\n", options: { bold: true, color: NAVY, fontSize: 13 } },
        { text: stripInline(paso.descripcion), options: { color: FG_2, fontSize: 11 } },
      ],
      {
        x: x + 0.55, y: y, w: colW - 0.6, h: rowH - 0.05,
        fontFace: "Calibri",
        valign: "top",
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
    if (t.caption) out.push({ text: "🖼  " + stripInline(t.caption), bullet: false, level: 0 });
    return out;
  }
  if (t.tipo === "cta") {
    if (t.titulo) out.push({ text: stripInline(t.titulo), bullet: false, level: 0 });
    if (t.descripcion) out.push({ text: stripInline(t.descripcion), bullet: false, level: 1 });
    if (t.url && t.label) out.push({ text: `🔗 ${t.label} → ${t.url}`, bullet: false, level: 1 });
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
