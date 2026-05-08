import Link from "next/link";

export default function EditNotFound() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 font-sans">
      <p className="text-xs font-semibold uppercase tracking-widest text-u-red">
        Editor de boletín
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-u-navy-deep">
        Este draft no existe
      </h1>
      <p className="mt-4 text-sm text-slate-600">
        El identificador del enlace no corresponde a ningún draft o boletín
        publicado en el storage. Puede haber pasado por:
      </p>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
        <li>El draft fue eliminado.</li>
        <li>El enlace es viejo (de una versión anterior del sistema).</li>
        <li>
          El draft se generó durante una ventana en la que el storage
          tenía un error transitorio y nunca llegó a persistirse.
        </li>
      </ul>
      <div className="mt-6 flex gap-3">
        <Link
          href="/"
          className="rounded-md bg-u-red px-4 py-2 text-sm font-semibold text-white hover:bg-[#c52a2f]"
        >
          Ir al listado
        </Link>
        <Link
          href="/edit/new"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Crear nuevo draft
        </Link>
      </div>
    </main>
  );
}
