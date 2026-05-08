/**
 * Storage de boletines con backend dual:
 *
 *  - Producción (Vercel con BLOB_READ_WRITE_TOKEN): Vercel Blob bajo
 *    el prefijo "boletines/<id>.json". Persistente entre cold starts.
 *  - Dev local: archivos JSON en <repo>/data/boletines/<id>.json.
 *  - Vercel sin token (transitorio durante setup): /tmp/data/boletines/
 *    como fallback, ephemeral. El home muestra el banner correspondiente.
 *
 * Misma API exportada en las tres rutas para que el resto del código
 * (Route Handlers, Server Components) no tenga que saber qué backend
 * está activo.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { del, get as blobGet, list, put } from "@vercel/blob";
import { esBoletin, type Boletin } from "./schema";

// ---------------------------------------------------------------------
// Detección de backend
// ---------------------------------------------------------------------

const HAS_BLOB = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const IS_VERCEL = process.env.VERCEL === "1" || !!process.env.VERCEL_URL;

const FS_DIR = IS_VERCEL
  ? "/tmp/data/boletines"
  : path.join(process.cwd(), "data", "boletines");

const BLOB_PREFIX = "boletines/";

export const STORAGE_INFO = {
  backend: HAS_BLOB ? ("blob" as const) : ("fs" as const),
  isDev: !IS_VERCEL,
  isEphemeral: IS_VERCEL && !HAS_BLOB,
};

// ---------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------

export async function listar(): Promise<Boletin[]> {
  const items = HAS_BLOB ? await listarBlob() : await listarFs();
  // Drafts arriba (más reciente primero), publicados abajo (numero desc).
  return items.sort((a, b) => {
    if (a.status !== b.status) return a.status === "draft" ? -1 : 1;
    if (a.status === "published") return b.numero - a.numero;
    return b.updatedAt.localeCompare(a.updatedAt);
  });
}

export async function leer(id: string): Promise<Boletin | null> {
  validarId(id);
  return HAS_BLOB ? leerBlob(id) : leerFs(id);
}

export async function leerPorNumero(numero: number): Promise<Boletin | null> {
  const all = await listar();
  return (
    all.find((b) => b.status === "published" && b.numero === numero) ?? null
  );
}

export async function escribir(boletin: Boletin): Promise<Boletin> {
  validarId(boletin.id);
  const next: Boletin = { ...boletin, updatedAt: new Date().toISOString() };
  if (HAS_BLOB) await escribirBlob(next);
  else await escribirFs(next);
  return next;
}

export async function eliminar(id: string): Promise<boolean> {
  validarId(id);
  return HAS_BLOB ? eliminarBlob(id) : eliminarFs(id);
}

export async function publicar(id: string): Promise<Boletin | null> {
  const boletin = await leer(id);
  if (!boletin) return null;
  if (boletin.status === "published") return boletin;

  const all = await listar();
  const publicados = all.filter((b) => b.status === "published");
  const numerosUsados = new Set(publicados.map((b) => b.numero));

  let numero = boletin.numero;
  if (numerosUsados.has(numero)) {
    const maxN = publicados.reduce((m, b) => Math.max(m, b.numero), 0);
    numero = maxN + 1;
  }

  return escribir({
    ...boletin,
    status: "published",
    numero,
    publishedAt: new Date().toISOString(),
  });
}

function validarId(id: string) {
  if (!/^[a-z0-9-]+$/i.test(id)) {
    throw new Error(`id de boletín inválido: ${id}`);
  }
}

// ---------------------------------------------------------------------
// Backend: Vercel Blob
// ---------------------------------------------------------------------

function pathnameDe(id: string): string {
  return `${BLOB_PREFIX}${id}.json`;
}

/**
 * Lee un blob private vía la SDK con useCache: false. Devuelve el JSON
 * parseado o null si no existe / no es un Boletin válido.
 */
async function fetchBlobJson(pathname: string): Promise<Boletin | null> {
  try {
    const res = await blobGet(pathname, {
      access: "private",
      useCache: false,
    });
    if (!res || res.statusCode !== 200) return null;
    const text = await new Response(res.stream).text();
    const data = JSON.parse(text);
    return esBoletin(data) ? data : null;
  } catch (err) {
    console.warn(`[storage:blob] error leyendo ${pathname}: ${(err as Error).message}`);
    return null;
  }
}

async function listarBlob(): Promise<Boletin[]> {
  const out: Boletin[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: BLOB_PREFIX, cursor, limit: 100 });
    for (const blob of page.blobs) {
      const data = await fetchBlobJson(blob.pathname);
      if (data) out.push(data);
    }
    cursor = page.cursor;
  } while (cursor);
  return out;
}

async function leerBlob(id: string): Promise<Boletin | null> {
  return fetchBlobJson(pathnameDe(id));
}

async function escribirBlob(boletin: Boletin): Promise<void> {
  // El store está configurado como private (creado así en el dashboard).
  // Eso hace que los blobs sean accesibles solo via SDK autenticado.
  // Para nuestra app interna sin auth está OK — la app es la única que
  // habla con el storage. Si en el futuro se quiere exponer URLs
  // públicas (p.ej. para CDN-backed delivery), recreamos el store como
  // public.
  await put(pathnameDe(boletin.id), JSON.stringify(boletin, null, 2), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60,
  });
}

async function eliminarBlob(id: string): Promise<boolean> {
  const page = await list({ prefix: pathnameDe(id), limit: 1 });
  if (page.blobs.length === 0) return false;
  await del(page.blobs.map((b) => b.url));
  return true;
}

// ---------------------------------------------------------------------
// Backend: filesystem (dev local + fallback ephemeral en Vercel sin token)
// ---------------------------------------------------------------------

async function ensureFsDir() {
  try {
    await fs.mkdir(FS_DIR, { recursive: true });
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "EROFS" || code === "EACCES" || code === "EPERM") return;
    throw err;
  }
}

function archivoFs(id: string): string {
  return path.join(FS_DIR, `${id}.json`);
}

async function listarFs(): Promise<Boletin[]> {
  await ensureFsDir();
  let archivos: string[] = [];
  try {
    archivos = await fs.readdir(FS_DIR);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
  const out: Boletin[] = [];
  for (const f of archivos) {
    if (!f.endsWith(".json")) continue;
    try {
      const raw = await fs.readFile(path.join(FS_DIR, f), "utf8");
      const parsed = JSON.parse(raw);
      if (esBoletin(parsed)) out.push(parsed);
    } catch (err) {
      console.warn(`[storage:fs] saltando ${f}: ${(err as Error).message}`);
    }
  }
  return out;
}

async function leerFs(id: string): Promise<Boletin | null> {
  await ensureFsDir();
  try {
    const raw = await fs.readFile(archivoFs(id), "utf8");
    const parsed = JSON.parse(raw);
    return esBoletin(parsed) ? parsed : null;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

async function escribirFs(boletin: Boletin): Promise<void> {
  await ensureFsDir();
  await fs.writeFile(
    archivoFs(boletin.id),
    JSON.stringify(boletin, null, 2) + "\n",
    "utf8",
  );
}

async function eliminarFs(id: string): Promise<boolean> {
  await ensureFsDir();
  try {
    await fs.unlink(archivoFs(id));
    return true;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw err;
  }
}
