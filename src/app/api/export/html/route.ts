import { NextResponse, type NextRequest } from "next/server";
import { generarHtmlAutocontenido } from "@/lib/exportHtml";
import { leer, leerPorNumero } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * GET /api/export/html?id=<id>
 *      /api/export/html?numero=<numero>
 *
 * Devuelve el HTML autocontenido del boletín:
 *   - CSS institucional embebido
 *   - logo y fondo del hero como data:URI
 *   - html2pdf.js bundleado + botón "Descargar PDF" funcional
 *   - sin recursos externos: el archivo se puede compartir y abrir
 *     offline manteniendo la fidelidad institucional
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const numeroParam = searchParams.get("numero");

  let boletin;
  if (id) {
    boletin = await leer(id);
  } else if (numeroParam) {
    const n = parseInt(numeroParam, 10);
    if (Number.isNaN(n)) {
      return NextResponse.json({ error: "numero inválido" }, { status: 400 });
    }
    boletin = await leerPorNumero(n);
  } else {
    return NextResponse.json(
      { error: 'requiere ?id=<id> o ?numero=<numero>' },
      { status: 400 },
    );
  }

  if (!boletin) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const { html, filename } = await generarHtmlAutocontenido(boletin);

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
