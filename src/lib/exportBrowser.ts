import "server-only";

import type { Browser } from "playwright-core";

const HAS_VERCEL = process.env.VERCEL === "1" || !!process.env.VERCEL_URL;

/**
 * Lanza una instancia headless de Chromium adecuada al entorno:
 *  - En Vercel: usa @sparticuz/chromium (binario optimizado para Lambda).
 *  - En dev local: prefiere el Chrome del sistema (channel: "chrome").
 *    Si el usuario no tiene Chrome, falla con mensaje claro.
 *
 * El caller es responsable de cerrar el browser.
 */
export async function lanzarBrowser(): Promise<Browser> {
  const { chromium } = await import("playwright-core");

  if (HAS_VERCEL) {
    // En Vercel runtime, sparticuz provee un chromium ARM64 optimizado.
    const sparticuz = (await import("@sparticuz/chromium")).default;
    return chromium.launch({
      args: sparticuz.args,
      executablePath: await sparticuz.executablePath(),
      headless: true,
    });
  }

  // Dev local: usar Chrome del sistema. Si no está, sugerimos al usuario
  // instalarlo o instalar @playwright/test (fallback bundle).
  try {
    return await chromium.launch({ channel: "chrome", headless: true });
  } catch (err) {
    throw new Error(
      `No se pudo lanzar Chromium en dev. Asegurate de tener Chrome instalado. Error original: ${(err as Error).message}`,
    );
  }
}

/**
 * Devuelve el origen base para construir URLs absolutas que apunten al
 * mismo deploy/dev server desde el que se hizo la request.
 */
export function originDe(req: Request): string {
  return new URL(req.url).origin;
}
