import { get as blobGet } from "@vercel/blob";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * GET /api/image/<...pathname>
 *
 * Proxy de imágenes guardadas en un Vercel Blob store de acceso privado.
 * Las imágenes se uploadean por /api/upload con access: "private" y este
 * endpoint expone un URL estable, server-side, que las sirve.
 *
 * Si el store fuera público, podríamos guardar la URL del blob
 * directamente y skip este proxy. La privacidad del store la decide
 * el setup en Vercel — adaptamos el código a lo que haya.
 *
 * El cache-control devuelto es agresivo (30 días) porque las URLs son
 * efectivamente immutable: cada upload genera un random suffix así que
 * la URL nunca cambia su contenido.
 */
type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  if (!path || path.length === 0) {
    return NextResponse.json({ error: "missing path" }, { status: 400 });
  }
  const pathname = path.join("/");

  try {
    const res = await blobGet(pathname, { access: "private", useCache: true });
    if (!res || res.statusCode !== 200) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const contentType = res.blob.contentType ?? "application/octet-stream";
    return new NextResponse(res.stream, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(res.blob.size),
        "Cache-Control": "public, max-age=2592000, immutable",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}
