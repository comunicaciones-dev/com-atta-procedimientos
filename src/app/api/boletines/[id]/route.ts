import { NextResponse, type NextRequest } from "next/server";
import { esBoletin } from "@/lib/schema";
import { eliminar, escribir, leer } from "@/lib/storage";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const boletin = await leer(id);
  if (!boletin) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(boletin);
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);

  if (!esBoletin(body) || body.id !== id) {
    return NextResponse.json(
      { error: "boletín inválido o id no coincide" },
      { status: 400 },
    );
  }

  const existente = await leer(id);
  if (!existente) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  // Un publicado es inmutable: no se permiten PUT.
  if (existente.status === "published") {
    return NextResponse.json(
      { error: "los boletines publicados son inmutables" },
      { status: 409 },
    );
  }

  const saved = await escribir(body);
  return NextResponse.json(saved);
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const existente = await leer(id);
  if (!existente) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (existente.status === "published") {
    return NextResponse.json(
      { error: "los boletines publicados no pueden eliminarse" },
      { status: 409 },
    );
  }
  await eliminar(id);
  return NextResponse.json({ ok: true });
}
