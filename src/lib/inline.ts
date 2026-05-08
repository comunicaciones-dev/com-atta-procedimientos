import { Fragment, type ReactNode, createElement } from "react";

/**
 * Parser determinista para inline emphasis dentro de strings del schema.
 *
 * Convención:
 *   [[texto]] → <strong>
 *   //texto// → <em>
 *
 * No anidable (un par no puede contener al otro). El usuario que necesite
 * emphasis combinada debe re-estructurar el texto (la regla "sin editor
 * rich text libre" del brief).
 *
 * Implementación: split por la regex que captura ambos marcadores en
 * orden de aparición. Usado por el render del boletín en cualquier campo
 * de texto del schema (parrafo, leadbar, hero.titulo, etc.).
 */
const PATRON = /\[\[(.+?)\]\]|\/\/(.+?)\/\//g;

export function parseInline(text: string): ReactNode {
  if (!text) return text;

  const partes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  for (const match of text.matchAll(PATRON)) {
    const idx = match.index;
    if (idx === undefined) continue;

    if (idx > lastIndex) {
      partes.push(text.slice(lastIndex, idx));
    }

    const strongContent = match[1];
    const emContent = match[2];

    if (strongContent !== undefined) {
      partes.push(
        createElement("strong", { key: key++ }, strongContent),
      );
    } else if (emContent !== undefined) {
      partes.push(createElement("em", { key: key++ }, emContent));
    }

    lastIndex = idx + match[0].length;
  }

  if (lastIndex < text.length) {
    partes.push(text.slice(lastIndex));
  }

  if (partes.length === 0) return text;
  if (partes.length === 1) return partes[0];

  return createElement(Fragment, null, ...partes);
}
