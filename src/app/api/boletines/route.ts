import { NextResponse } from "next/server";
import { crearDraftSeed } from "@/lib/seed";
import { escribir, listar } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await listar();
  return NextResponse.json({ items });
}

/**
 * POST /api/boletines → crea un draft nuevo precargado con el seed del
 * REX 71/2026. Devuelve el boletín completo (incluido el id generado).
 */
export async function POST() {
  const draft = crearDraftSeed();
  const saved = await escribir(draft);
  return NextResponse.json(saved, { status: 201 });
}
