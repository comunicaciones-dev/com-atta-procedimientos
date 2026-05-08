import { NextResponse } from "next/server";
import { crearDraftSeed } from "@/lib/seed";
import { escribir, listar, STORAGE_INFO } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const items = await listar();
    return NextResponse.json({ items, _backend: STORAGE_INFO.backend });
  } catch (err) {
    return NextResponse.json(
      {
        error: (err as Error).message,
        stack: (err as Error).stack?.split("\n").slice(0, 5),
        _backend: STORAGE_INFO.backend,
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/boletines → crea un draft nuevo precargado con el seed del
 * REX 71/2026. Devuelve el boletín completo (incluido el id generado).
 */
export async function POST() {
  try {
    const draft = crearDraftSeed();
    const saved = await escribir(draft);
    return NextResponse.json(saved, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      {
        error: (err as Error).message,
        stack: (err as Error).stack?.split("\n").slice(0, 5),
        _backend: STORAGE_INFO.backend,
      },
      { status: 500 },
    );
  }
}
