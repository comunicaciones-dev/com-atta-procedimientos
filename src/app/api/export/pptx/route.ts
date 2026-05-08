import { NextResponse, type NextRequest } from "next/server";
import { generarPptx } from "@/lib/exportPptx";
import { leer, leerPorNumero } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * GET /api/export/pptx?id=<id> | ?numero=<numero>
 *
 * Genera un .pptx con portada institucional + una slide por sección
 * numerada + slide del flujo (si existe).
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
      { error: "requiere ?id=<id> o ?numero=<numero>" },
      { status: 400 },
    );
  }

  if (!boletin) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const buffer = await generarPptx(boletin);
  const filename = `boletin-uatta-${String(boletin.numero).padStart(2, "0")}-${boletin.fecha.anio}-${slugMes(boletin.fecha.mes)}.pptx`;

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

function slugMes(mes: string): string {
  return mes
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
}
