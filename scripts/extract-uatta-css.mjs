// Extrae el bloque <style> de referencia/boletin-sistema-diseno.html y lo
// guarda como src/styles/uatta.css, reemplazando solo el url(data:...) del
// hero por una referencia a /uatta-hero-bg.jpg (asset extraído del mismo
// HTML). Cero modificaciones más.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const src = readFileSync(
  resolve(root, "referencia", "boletin-sistema-diseno.html"),
  "utf8",
);
const lines = src.split(/\r?\n/);

// Líneas 9..705 contienen el bloque <style> (la línea 706 ya es </style>).
// La línea 183 contiene un url("data:image/jpeg;base64,...") que
// reemplazamos por el archivo extraído en /uatta-hero-bg.jpg.
const out = [];
for (let i = 9; i <= 705; i++) {
  const raw = lines[i - 1] ?? "";
  if (i === 183) {
    out.push('      url("/uatta-hero-bg.jpg") center right / cover no-repeat,');
  } else {
    out.push(raw);
  }
}

const header = [
  "/* ============================================================",
  "   Sistema de diseño institucional UATTA — verbatim de",
  "   referencia/boletin-sistema-diseno.html (líneas 9-706).",
  "",
  "   REGLA: cero modificaciones. Única sustitución permitida:",
  "   el url(data:image/jpeg;base64,...) del hero (línea 183 de",
  "   la referencia) se reemplaza por /uatta-hero-bg.jpg, que es",
  "   ese mismo asset extraído como archivo binario. Para el HTML",
  "   autocontenido exportado se vuelve a inlinear como base64.",
  "   ============================================================ */",
  "",
  "",
].join("\n");

const dest = resolve(root, "src", "styles", "uatta.css");
mkdirSync(dirname(dest), { recursive: true });
writeFileSync(dest, header + out.join("\n") + "\n", "utf8");

console.log("uatta.css generado:", dest);
