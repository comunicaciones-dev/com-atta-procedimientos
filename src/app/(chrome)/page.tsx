import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 font-sans">
      <header className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-u-red">
          Unidad Administradora TTA-TCP · Ministerio de Hacienda
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-u-navy-deep">
          Boletines de Procedimientos
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          Editor y publicador de boletines institucionales. Hito 1: scaffolding y
          sistema de diseño. El listado de drafts y publicados llega en Hito 2.
        </p>
      </header>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-u-navy-deep">
          Hito 1 · Validación de fidelidad
        </h2>
        <p className="mb-4 text-sm text-slate-600">
          Render hardcodeado del boletín de referencia. Comparar pixel-a-pixel con
          <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5 text-[12px]">
            referencia/boletin-sistema-diseno.html
          </code>
          para verificar que el sistema de diseño institucional se replica sin
          desviaciones.
        </p>
        <Link
          href="/render/demo"
          className="inline-flex items-center gap-2 rounded-md bg-u-red px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#c52a2f]"
        >
          Abrir /render/demo →
        </Link>
      </section>
    </main>
  );
}
