import { NextResponse, type NextRequest } from "next/server";
import { lanzarBrowser, originDe } from "@/lib/exportBrowser";
import { leer, leerPorNumero } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * GET /api/export/png?id=<id> | ?numero=<numero>
 *
 * PNG de portada: screenshot del topbar + header + hero + audiencia +
 * primer ribbon. 1600px de ancho (deviceScaleFactor=2 sobre 800px de
 * viewport visible). Fondo blanco.
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
    if (Number.isNaN(n)) return NextResponse.json({ error: "numero inválido" }, { status: 400 });
    boletin = await leerPorNumero(n);
  } else {
    return NextResponse.json({ error: "requiere ?id=<id> o ?numero=<numero>" }, { status: 400 });
  }

  if (!boletin) return NextResponse.json({ error: "not found" }, { status: 404 });

  const targetUrl = `${originDe(req)}/render/exporter?id=${encodeURIComponent(boletin.id)}`;

  const browser = await lanzarBrowser();
  try {
    const ctx = await browser.newContext({
      // viewport 800px ancho, deviceScaleFactor 2 -> imagen final ~1600px.
      viewport: { width: 800, height: 1200 },
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();
    await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForSelector(".uatta-boletin", { state: "visible" });
    await page.waitForLoadState("load");
    await page.waitForTimeout(300);

    // Calcular el bounding box: topbar + header + hero + ribbon + audiencia
    // + segundo ribbon (si lo hay). Tomamos hasta el final del bloque
    // .uatta-audience para incluir el card de audiencia y un margen.
    const clip = await page.evaluate(() => {
      const article = document.querySelector(".uatta-boletin") as HTMLElement;
      const audiencia = document.querySelector(".uatta-audience") as HTMLElement;
      if (!article || !audiencia) return null;
      const ar = article.getBoundingClientRect();
      const ad = audiencia.getBoundingClientRect();
      // Incluir el padding inferior del card de audiencia + un poco extra.
      const bottom = ad.bottom + 32;
      return {
        x: Math.round(ar.left),
        y: Math.round(ar.top),
        width: Math.round(ar.width),
        height: Math.round(bottom - ar.top),
      };
    });

    if (!clip) {
      throw new Error("No se pudo medir el bounding box del boletín.");
    }

    const buffer = await page.screenshot({
      type: "png",
      clip,
      omitBackground: false,
    });

    const filename = `boletin-uatta-${String(boletin.numero).padStart(2, "0")}-${boletin.fecha.anio}-${slugMes(boletin.fecha.mes)}-portada.png`;
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } finally {
    await browser.close();
  }
}

function slugMes(mes: string): string {
  return mes
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
}
