import Link from "next/link";
import { listar, STORAGE_INFO } from "@/lib/storage";
import { CrearDraftButton } from "@/components/editor/CrearDraftButton";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const boletines = await listar();
  const drafts = boletines.filter((b) => b.status === "draft");
  const publicados = boletines.filter((b) => b.status === "published");
  const isProd = !STORAGE_INFO.isDev;

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 font-sans">
      <header className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-u-red">
          Unidad Administradora TTA-TCP · Ministerio de Hacienda
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-u-navy-deep">
          Boletines de Procedimientos
        </h1>
      </header>

      {isProd && (
        <div className="mb-8 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong className="font-semibold">Aviso:</strong> en producción
          el storage corre sobre filesystem efímero de Vercel — los drafts
          creados acá se pueden perder. Para edición persistente usar la
          versión local (<code>npm run dev</code>) hasta Hito 5.
        </div>
      )}

      <section className="mb-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-u-navy-deep">
            Drafts ({drafts.length})
          </h2>
          <CrearDraftButton />
        </div>
        {drafts.length === 0 ? (
          <p className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-500">
            No hay drafts. Click en <strong>Nuevo draft</strong> para crear
            uno precargado con el contenido del REX 71/2026.
          </p>
        ) : (
          <ul className="divide-y divide-slate-200 rounded-md border border-slate-200 bg-white">
            {drafts.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">
                    {b.hero.titulo
                      .replace(/\[\[|\]\]|\/\//g, "")
                      .slice(0, 80)}
                  </p>
                  <p className="text-xs text-slate-500">
                    Edición N° {String(b.numero).padStart(2, "0")} ·{" "}
                    {b.fecha.mes} {b.fecha.anio} · actualizado{" "}
                    {new Date(b.updatedAt).toLocaleString("es-CL")}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Link
                    href={`/edit/${b.id}`}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Editar
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-lg font-semibold text-u-navy-deep">
          Publicados ({publicados.length})
        </h2>
        {publicados.length === 0 ? (
          <p className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-500">
            Aún no hay boletines publicados.
          </p>
        ) : (
          <ul className="divide-y divide-slate-200 rounded-md border border-slate-200 bg-white">
            {publicados.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">
                    {b.hero.titulo
                      .replace(/\[\[|\]\]|\/\//g, "")
                      .slice(0, 80)}
                  </p>
                  <p className="text-xs text-slate-500">
                    N° {String(b.numero).padStart(2, "0")} · {b.fecha.mes}{" "}
                    {b.fecha.anio}
                    {b.publishedAt &&
                      ` · publicado ${new Date(b.publishedAt).toLocaleDateString("es-CL")}`}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Link
                    href={`/n/${b.numero}`}
                    className="rounded-md bg-u-navy-deep px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
                  >
                    Ver
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="mt-16 border-t border-slate-200 pt-6 text-xs text-slate-500">
        <p>
          Pruebas de fidelidad:{" "}
          <Link
            href="/render/demo"
            className="font-medium text-u-blue underline-offset-2 hover:underline"
          >
            /render/demo
          </Link>
          {" · "}
          <Link
            href="/render/seed"
            className="font-medium text-u-blue underline-offset-2 hover:underline"
          >
            /render/seed
          </Link>
        </p>
      </footer>
    </main>
  );
}
