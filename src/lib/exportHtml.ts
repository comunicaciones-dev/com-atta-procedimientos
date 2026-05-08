/**
 * Construye el HTML autocontenido del boletín a partir de un objeto
 * Boletin del schema. El output:
 *  - tiene CSS embebido (uatta.css verbatim + uatta-extensions.css);
 *  - tiene los assets de imagen inlineados como base64 (logo + fondo
 *    del hero + cualquier imagen subida que sea local /uploads/);
 *  - trae html2pdf.js bundleado y un botón "Descargar PDF" funcional
 *    en una toolbar sticky superior, replicando la referencia;
 *  - es 100% offline-capable (sin recursos externos).
 *
 * Diseñado para correr server-side. Usa node:fs para leer los assets;
 * cualquier <img src="https://..."> ajeno se mantiene como URL externa
 * (caso típico: imágenes subidas a Vercel Blob).
 *
 * El Boletin se renderiza con renderToStaticMarkup. Como la convención
 * de "rutas /render/* y /n/* solo cargan uatta.css + uatta-extensions"
 * (sin Tailwind), el HTML resultante también queda libre de Tailwind.
 */

import "server-only";

import { get as blobGet } from "@vercel/blob";
import { promises as fs } from "node:fs";
import path from "node:path";
import { createElement, type ReactElement } from "react";
import { Boletin as BoletinView } from "@/components/boletin/Boletin";
import type { Boletin } from "./schema";

// Next 15 bloquea con un check estático cualquier import directo de
// "react-dom/server" desde Route Handlers (los considera RSC). Un
// dynamic require al runtime se salta el check sin perder funcionalidad
// — los Route Handlers SÍ corren en Node.js y react-dom/server.node es
// válido ahí. Esto se evalúa una sola vez en cold start.
const requireFn: NodeRequire = eval("require");
const reactDomServer = requireFn("react-dom/server.node") as {
  renderToStaticMarkup: (el: ReactElement) => string;
};
const { renderToStaticMarkup } = reactDomServer;

// ---------------------------------------------------------------------
// Cargas de assets server-side
// ---------------------------------------------------------------------

const CACHE: Record<string, string> = {};

async function leerArchivo(ruta: string, key: string): Promise<string> {
  if (CACHE[key]) return CACHE[key];
  const txt = await fs.readFile(ruta, "utf8");
  CACHE[key] = txt;
  return txt;
}

async function leerArchivoB64(ruta: string, key: string): Promise<string> {
  if (CACHE[key]) return CACHE[key];
  const buf = await fs.readFile(ruta);
  const b64 = buf.toString("base64");
  CACHE[key] = b64;
  return b64;
}

function mimeDe(ruta: string): string {
  const ext = path.extname(ruta).toLowerCase();
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".avif":
      return "image/avif";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}

async function leerCss(): Promise<string> {
  const root = process.cwd();
  const u1 = await leerArchivo(
    path.join(root, "src", "styles", "uatta.css"),
    "uatta",
  );
  const u2 = await leerArchivo(
    path.join(root, "src", "styles", "uatta-extensions.css"),
    "uatta-ext",
  );
  // Después de embeber, el url("/uatta-hero-bg.jpg") del CSS es relativo
  // a la página exportada (file:// o blob:). El reemplazo de la imagen
  // de fondo por su data: URI ocurre en compose() vía inline style del
  // elemento .uatta-hero, así que no tocamos el CSS acá.
  return u1 + "\n\n" + u2;
}

async function leerHtml2pdf(): Promise<string> {
  return leerArchivo(
    path.join(
      process.cwd(),
      "node_modules",
      "html2pdf.js",
      "dist",
      "html2pdf.bundle.min.js",
    ),
    "html2pdf",
  );
}

async function dataUriDe(ruta: string, key: string): Promise<string> {
  const b64 = await leerArchivoB64(ruta, key);
  return `data:${mimeDe(ruta)};base64,${b64}`;
}

async function leerLogoDataUri(): Promise<string> {
  return dataUriDe(
    path.join(process.cwd(), "public", "uatta-logo.png"),
    "logo",
  );
}

async function leerHeroBgDataUri(): Promise<string> {
  return dataUriDe(
    path.join(process.cwd(), "public", "uatta-hero-bg.jpg"),
    "hero-bg",
  );
}

// ---------------------------------------------------------------------
// Composición del HTML autocontenido
// ---------------------------------------------------------------------

function escaparHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Reemplaza referencias a assets locales (`/uatta-logo.png`, /uatta-hero-bg.jpg,
 * y URLs `/uploads/...`) por sus data URI equivalentes, para que el HTML
 * resultante no dependa del servidor de origen.
 */
async function inlineAssets(html: string): Promise<string> {
  const logoDataUri = await leerLogoDataUri();
  const heroBgDataUri = await leerHeroBgDataUri();

  let out = html;
  // Logo (header + footer comparten el mismo asset).
  out = out.replaceAll('src="/uatta-logo.png"', `src="${logoDataUri}"`);
  // Imagen de fondo del hero — aparece como url("/uatta-hero-bg.jpg")
  // en inline style del <section className="uatta-hero">.
  out = out.replaceAll(
    'url("/uatta-hero-bg.jpg")',
    `url("${heroBgDataUri}")`,
  );

  // Imágenes subidas localmente (dev) que viven en /uploads/.
  const localUploads = [...out.matchAll(/(?:src|url\()(?:["']?)(\/uploads\/[^"')]+)/g)];
  for (const m of localUploads) {
    const ruta = m[1];
    try {
      const abs = path.join(process.cwd(), "public", ruta);
      const dataUri = await dataUriDe(abs, "upload:" + ruta);
      out = out.replaceAll(ruta, dataUri);
    } catch (err) {
      console.warn(`[exportHtml] no se pudo inlinear ${ruta}:`, (err as Error).message);
    }
  }

  // Imágenes proxied via /api/image/<pathname> en producción (Blob
  // privado). Las leemos con la SDK y las embebemos como data:URI.
  const blobUploads = [
    ...out.matchAll(/(?:src|url\()(?:["']?)\/api\/image\/([^"')]+)/g),
  ];
  for (const m of blobUploads) {
    const blobPath = m[1];
    try {
      const res = await blobGet(blobPath, {
        access: "private",
        useCache: true,
      });
      if (!res || res.statusCode !== 200) continue;
      const buf = Buffer.from(await new Response(res.stream).arrayBuffer());
      const ct = res.blob.contentType ?? "application/octet-stream";
      const dataUri = `data:${ct};base64,${buf.toString("base64")}`;
      out = out.replaceAll(`/api/image/${blobPath}`, dataUri);
    } catch (err) {
      console.warn(
        `[exportHtml] no se pudo inlinear /api/image/${blobPath}:`,
        (err as Error).message,
      );
    }
  }

  return out;
}

export async function generarHtmlAutocontenido(
  boletin: Boletin,
): Promise<{ html: string; filename: string }> {
  const css = await leerCss();
  const html2pdfJs = await leerHtml2pdf();

  // Render del componente a HTML estático.
  const articleHtml = renderToStaticMarkup(
    createElement(BoletinView, { boletin }),
  );

  // Reemplazar referencias a assets locales por data URIs.
  const articleInline = await inlineAssets(articleHtml);

  const titulo = `Boletín N° ${String(boletin.numero).padStart(2, "0")} · ${boletin.fecha.mes} ${boletin.fecha.anio}`;
  const filename = `boletin-uatta-${String(boletin.numero).padStart(2, "0")}-${boletin.fecha.anio}-${slugMes(boletin.fecha.mes)}.html`;

  const doc = `<!DOCTYPE html>
<html lang="es-CL">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escaparHtml(titulo)}</title>
<style>
  /* Toolbar de exportación (no parte del boletín) */
  html, body { margin: 0; padding: 0; }
  body {
    background: #eef0f4;
    font-family: 'Segoe UI', 'Work Sans', Arial, Helvetica, sans-serif;
    color: #1a1d27;
    -webkit-font-smoothing: antialiased;
  }
  .uatta-toolbar {
    position: sticky;
    top: 0;
    z-index: 100;
    background: #1c2557;
    color: #ffffff;
    padding: 10px clamp(16px, 3vw, 32px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    box-shadow: 0 2px 8px rgba(13,16,24,0.18);
    flex-wrap: wrap;
  }
  .uatta-toolbar__brand { display:flex; align-items:center; gap:10px; font-size:12px; letter-spacing:0.06em; text-transform:uppercase; font-weight:600; }
  .uatta-toolbar__brand-mark { width:6px; height:22px; background:#e73439; border-radius:2px; }
  .uatta-toolbar__btn {
    appearance: none; background: rgba(255,255,255,0.08); color: #ffffff;
    border: 1px solid rgba(255,255,255,0.22); border-radius: 8px;
    padding: 9px 16px; font: 600 13px/1 'Segoe UI', Arial, sans-serif;
    letter-spacing: 0.02em; cursor: pointer;
    display: inline-flex; align-items: center; gap: 8px;
    transition: background 160ms ease, border-color 160ms ease, transform 160ms ease;
  }
  .uatta-toolbar__btn:hover { background: rgba(255,255,255,0.16); border-color: rgba(255,255,255,0.4); }
  .uatta-toolbar__btn--primary { background:#e73439; border-color:#e73439; }
  .uatta-toolbar__btn--primary:hover { background:#c52a2f; border-color:#c52a2f; }
  .uatta-toolbar__btn svg { width:16px; height:16px; flex-shrink:0; }
  .uatta-toast {
    position: fixed; bottom: 24px; left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: #1a1d27; color: #ffffff; padding: 10px 18px;
    border-radius: 8px; font: 500 13px/1.4 'Segoe UI', Arial, sans-serif;
    box-shadow: 0 8px 24px rgba(13,16,24,0.25);
    opacity: 0; pointer-events: none;
    transition: opacity 220ms ease, transform 220ms ease; z-index: 200;
  }
  .uatta-toast.is-visible { opacity:1; transform: translateX(-50%) translateY(0); }
  .uatta-export-page { padding: 32px clamp(0px,3vw,48px); display:flex; justify-content:center; }

  @media print {
    .uatta-toolbar, .uatta-toast { display: none !important; }
    .uatta-export-page { padding: 0 !important; }
  }

  /* Sistema de diseño institucional */
${css}
</style>
</head>
<body>

<div class="uatta-toolbar" data-uatta-noexport>
  <div class="uatta-toolbar__brand">
    <span class="uatta-toolbar__brand-mark" aria-hidden="true"></span>
    <span>${escaparHtml(titulo)}</span>
  </div>
  <button class="uatta-toolbar__btn uatta-toolbar__btn--primary" id="uattaDownloadPdf" type="button">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    Descargar PDF
  </button>
</div>

<div class="uatta-export-page">
${articleInline}
</div>

<div class="uatta-toast" id="uattaToast" role="status" aria-live="polite"></div>

<script>
${html2pdfJs}
</script>

<script>
(function(){
  'use strict';
  var boletinEl = document.querySelector('.uatta-boletin');
  var toastEl   = document.getElementById('uattaToast');

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function(){ toastEl.classList.remove('is-visible'); }, 2400);
  }

  document.getElementById('uattaDownloadPdf').addEventListener('click', async function(){
    showToast('Generando PDF...');
    try {
      var stamp        = new Date().toISOString().slice(0,10);
      var marginMm     = 6;
      var pageWidthMm  = 210;
      var safetyMm     = 10;

      var worker = window.html2pdf().from(boletinEl).set({
        filename: ${JSON.stringify(filename.replace(/\.html$/, ".pdf"))},
        image: { type: 'jpeg', quality: 0.96 },
        html2canvas: { scale: 2, useCORS: true, logging: false, letterRendering: true, backgroundColor: '#ffffff', windowWidth: 980 }
      });

      await worker.toCanvas();
      var canvas = worker.prop.canvas;
      var ratio  = canvas.height / canvas.width;

      var contentWidthMm  = pageWidthMm - 2*marginMm;
      var contentHeightMm = contentWidthMm * ratio;
      var pageHeightMm    = contentHeightMm + 2*marginMm + safetyMm;

      worker = worker.set({
        margin: marginMm,
        jsPDF: { unit:'mm', format:[pageWidthMm, pageHeightMm], orientation:'portrait', compress:true },
        pagebreak: { mode: [] }
      });

      await worker.toPdf();
      await worker.save();
      showToast('PDF descargado correctamente');
    } catch(err) {
      console.error('[boletin] html2pdf failed, falling back to print():', err);
      showToast('Usando diálogo de impresión...');
      setTimeout(function(){ window.print(); }, 250);
    }
  });
})();
</script>

</body>
</html>
`;

  return { html: doc, filename };
}

function slugMes(mes: string): string {
  return mes
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
}
