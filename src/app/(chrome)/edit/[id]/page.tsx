import "@/styles/uatta.css";
import "@/styles/uatta-shield.css";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Boletin } from "@/components/boletin/Boletin";
import { leer } from "@/lib/storage";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

/**
 * /edit/[id] — Editor.
 *
 * Hito 2: solo placeholder con preview en vivo del draft. El editor con
 * formularios drag-and-drop y autoguardado llega en Hito 3.
 */
export default async function EditPage({ params }: Props) {
  const { id } = await params;
  const boletin = await leer(id);
  if (!boletin) notFound();
  if (boletin.status === "published") {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16 font-sans">
        <p className="text-sm text-slate-600">
          Este boletín ya está publicado y es inmutable.{" "}
          <Link
            href={`/n/${boletin.numero}`}
            className="font-medium text-u-blue underline-offset-2 hover:underline"
          >
            Ver versión pública
          </Link>
        </p>
      </main>
    );
  }

  return (
    <div className="grid min-h-screen grid-cols-[320px_1fr] font-sans">
      <aside className="border-r border-slate-200 bg-slate-50 p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-u-red">
          Editor de boletín
        </p>
        <h1 className="mt-2 text-lg font-bold text-u-navy-deep">
          Edición N° {String(boletin.numero).padStart(2, "0")} ·{" "}
          {boletin.fecha.mes} {boletin.fecha.anio}
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          Hito 2 entrega el draft persistido y la vista previa en vivo. El
          editor con formularios tipados, drag-and-drop y autoguardado
          llega en <strong>Hito 3</strong>.
        </p>
        <div className="mt-6 space-y-2 text-sm">
          <p className="font-semibold text-slate-700">Secciones</p>
          <ol className="list-decimal pl-5 text-slate-600">
            {boletin.secciones.map((s) => (
              <li key={s.id} className="truncate">
                {s.titulo.replace(/\[\[|\]\]|\/\//g, "")}
              </li>
            ))}
          </ol>
        </div>
        <div className="mt-8 space-y-3">
          <Link
            href="/"
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-center text-sm font-medium text-slate-700 hover:bg-white"
          >
            ← Volver al listado
          </Link>
        </div>
      </aside>
      <div className="overflow-y-auto bg-[#eef0f4]">
        <div className="uatta-page">
          <Boletin boletin={boletin} />
        </div>
      </div>
    </div>
  );
}
