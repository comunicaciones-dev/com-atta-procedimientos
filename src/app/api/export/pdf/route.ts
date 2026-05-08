import { NextResponse, type NextRequest } from "next/server";
import { lanzarBrowser, originDe } from "@/lib/exportBrowser";
import { leer, leerPorNumero } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * GET /api/export/pdf?id=<id> | ?numero=<numero>
 *
 * Genera un PDF de página única con altura dinámica (sin saltos),
 * replicando la técnica de la referencia: medir altura real del
 * artículo renderizado y hacer page.pdf con dimensiones exactas.
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
      viewport: { width: 980, height: 1200 },
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();
    // Forzar media "screen" para ignorar las reglas @page size:A4 de
    // uatta.css (sección @media print). Sin esto, page.pdf pagina en
    // tamaño A4 sin importar las dimensiones que pasemos.
    await page.emulateMedia({ media: "screen" });
    await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForSelector(".uatta-boletin", { state: "visible" });
    await page.waitForLoadState("load");
    await page.waitForTimeout(300);

    // Medir el alto real del artículo
    const altoPx = await page.evaluate(() => {
      const a = document.querySelector(".uatta-boletin") as HTMLElement | null;
      return a ? Math.ceil(a.getBoundingClientRect().height) : 0;
    });

    // Estrategia "viewport-perfect": el PDF tiene exactamente las
    // dimensiones del render (980 px de ancho × alto medido). Esto
    // produce un PDF de página única, idéntico al render web. No se
    // ajusta a A4 — para imprimir, el usuario activa "fit to page".
    //
    // (Una versión A4-compliant con scale produjo paginación incorrecta
    // en pruebas; el viewport-perfect es más predecible y cumple la
    // promesa de "indistinguible del render".)
    // Safety colchón: chromium ocasionalmente reporta el alto unos
    // pixels antes de pintar el último gradient/sombra. Damos margen
    // generoso para evitar paginación.
    const safetyPx = 80;
    const buffer = await page.pdf({
      width: "980px",
      height: `${altoPx + safetyPx}px`,
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
      preferCSSPageSize: false,
    });

    const filename = `boletin-uatta-${String(boletin.numero).padStart(2, "0")}-${boletin.fecha.anio}-${slugMes(boletin.fecha.mes)}.pdf`;
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
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
