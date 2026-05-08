import { put } from "@vercel/blob";
import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp", "image/avif"];

const HAS_BLOB = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

/**
 * POST /api/upload
 *
 * Body: multipart/form-data con un campo "file".
 * Devuelve: { url: string } — URL pública de la imagen subida.
 *
 * Backend dual:
 *  - Vercel Blob si BLOB_READ_WRITE_TOKEN está presente. Path:
 *    "imagenes/<random>-<filename>".
 *  - Filesystem (public/uploads/) en dev local. URL relativa
 *    /uploads/<random>-<filename>.
 *
 * Usado por la subida de imagen de fondo del hero. Pensado como
 * upload-y-listo: no hay listado, edición ni borrado de uploads
 * desde la UI por ahora — si la imagen queda huérfana no afecta el
 * boletín. Limpieza manual en Vercel Blob dashboard si se acumula.
 */
export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: 'campo "file" no provisto o inválido' },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `archivo demasiado grande (max ${MAX_BYTES / 1024 / 1024} MB)` },
      { status: 413 },
    );
  }
  if (!TIPOS_PERMITIDOS.includes(file.type)) {
    return NextResponse.json(
      {
        error: `tipo no permitido: ${file.type}. Solo: ${TIPOS_PERMITIDOS.join(", ")}.`,
      },
      { status: 415 },
    );
  }

  const ext = extDe(file.name) || extDelTipo(file.type);
  const stem = randomStem();
  const filename = `${stem}${ext}`;

  if (HAS_BLOB) {
    // @vercel/blob acepta File directamente; le pasamos el File del
    // multipart sin re-bufferear.
    const blob = await put(`imagenes/${filename}`, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
      allowOverwrite: false,
      cacheControlMaxAge: 60 * 60 * 24 * 30, // 30 días
    });
    return NextResponse.json({ url: blob.url });
  }

  // Dev fallback: public/uploads/. Sirve via Next static.
  const dest = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dest, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dest, filename), bytes);
  return NextResponse.json({ url: `/uploads/${filename}` });
}

function randomStem(): string {
  return (
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 8)
  );
}

function extDe(name: string): string {
  const idx = name.lastIndexOf(".");
  if (idx <= 0) return "";
  const candidato = name.slice(idx).toLowerCase();
  return /^\.[a-z0-9]{2,5}$/.test(candidato) ? candidato : "";
}

function extDelTipo(tipo: string): string {
  switch (tipo) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/avif":
      return ".avif";
    default:
      return "";
  }
}
