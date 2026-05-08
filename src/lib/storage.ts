/**
 * Storage local en archivos JSON. Decisión consciente para esta etapa
 * según el brief: data/boletines/<id>.json, un archivo por boletín.
 *
 * IMPORTANTE — entornos:
 *
 *  - dev local (npm run dev): el FS persiste entre invocaciones, todo
 *    funciona como un mini-CMS persistente.
 *  - producción Vercel serverless: el FS de runtime es efímero. Los
 *    drafts creados en producción se PIERDEN al rato. Mostrar un banner
 *    al usuario en producción avisando esto, hasta que en Hito 5 se
 *    migre a Vercel Blob/KV.
 *
 * El módulo es server-only (importa node:fs). Los Route Handlers y
 * Server Components lo usan. Componentes client lo consumen vía API
 * REST en /api/boletines/*.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { esBoletin, type Boletin, type BoletinStatus } from "./schema";

/**
 * Ubicación del storage:
 *  - Local dev: <repo>/data/boletines/ (persistente entre runs).
 *  - Vercel runtime: /tmp/data/boletines/ (writable pero efímero;
 *    cada cold start arranca con el directorio vacío). Hasta que se
 *    migre a Vercel Blob/KV en Hito 5, esto evita el crash que daba
 *    al intentar escribir en el FS read-only de /var/task.
 */
const DATA_DIR = process.env.VERCEL
  ? "/tmp/data/boletines"
  : path.join(process.cwd(), "data", "boletines");

async function ensureDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    // FS read-only o permiso denegado: no podemos persistir, pero el
    // resto de las operaciones de lectura caen a "no hay nada".
    if (code === "EROFS" || code === "EACCES" || code === "EPERM") return;
    throw err;
  }
}

function archivoDe(id: string): string {
  if (!/^[a-z0-9-]+$/i.test(id)) {
    throw new Error(`id de boletín inválido: ${id}`);
  }
  return path.join(DATA_DIR, `${id}.json`);
}

export async function listar(): Promise<Boletin[]> {
  await ensureDir();
  let archivos: string[] = [];
  try {
    archivos = await fs.readdir(DATA_DIR);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
  const boletines: Boletin[] = [];

  for (const f of archivos) {
    if (!f.endsWith(".json")) continue;
    try {
      const raw = await fs.readFile(path.join(DATA_DIR, f), "utf8");
      const parsed = JSON.parse(raw);
      if (esBoletin(parsed)) boletines.push(parsed);
    } catch (err) {
      console.warn(`[storage] saltando ${f}: ${(err as Error).message}`);
    }
  }

  // Drafts arriba (más reciente primero), publicados abajo (numero desc).
  return boletines.sort((a, b) => {
    if (a.status !== b.status) return a.status === "draft" ? -1 : 1;
    if (a.status === "published") return b.numero - a.numero;
    return b.updatedAt.localeCompare(a.updatedAt);
  });
}

export async function leer(id: string): Promise<Boletin | null> {
  await ensureDir();
  try {
    const raw = await fs.readFile(archivoDe(id), "utf8");
    const parsed = JSON.parse(raw);
    return esBoletin(parsed) ? parsed : null;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

export async function leerPorNumero(numero: number): Promise<Boletin | null> {
  const all = await listar();
  return (
    all.find((b) => b.status === "published" && b.numero === numero) ?? null
  );
}

export async function escribir(boletin: Boletin): Promise<Boletin> {
  await ensureDir();
  const dest = archivoDe(boletin.id);
  const next = { ...boletin, updatedAt: new Date().toISOString() };
  await fs.writeFile(dest, JSON.stringify(next, null, 2) + "\n", "utf8");
  return next;
}

export async function eliminar(id: string): Promise<boolean> {
  await ensureDir();
  try {
    await fs.unlink(archivoDe(id));
    return true;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw err;
  }
}

/**
 * Publica un draft. Asigna número automático (max(publicados.numero) + 1)
 * a menos que el draft ya tenga un override manual válido.
 */
export async function publicar(id: string): Promise<Boletin | null> {
  const boletin = await leer(id);
  if (!boletin) return null;
  if (boletin.status === "published") return boletin;

  const all = await listar();
  const publicados = all.filter((b) => b.status === "published");
  const numerosUsados = new Set(publicados.map((b) => b.numero));

  // Si el numero del draft choca con un publicado, asignamos el siguiente
  // disponible. En otro caso, respetamos el override manual.
  let numero = boletin.numero;
  if (numerosUsados.has(numero)) {
    const maxN = publicados.reduce((m, b) => Math.max(m, b.numero), 0);
    numero = maxN + 1;
  }

  const ahora = new Date().toISOString();
  return escribir({
    ...boletin,
    status: "published",
    numero,
    publishedAt: ahora,
  });
}

export const STORAGE_INFO = {
  dir: DATA_DIR,
  isDev: process.env.NODE_ENV !== "production",
};
