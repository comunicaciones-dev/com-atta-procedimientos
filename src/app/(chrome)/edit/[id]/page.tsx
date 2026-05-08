import "@/styles/uatta.css";
import "@/styles/uatta-extensions.css";
import "@/styles/uatta-shield.css";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditorShellClient } from "@/components/editor/EditorShellClient";
import { leer } from "@/lib/storage";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

/**
 * /edit/[id] — Editor de un draft.
 *
 * Server Component que carga el boletín desde storage y delega el
 * trabajo interactivo a <EditorShell/> (client). Si el boletín está
 * publicado, redirige a la vista pública para evitar edición indebida.
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
            Ver versión pública →
          </Link>
        </p>
      </main>
    );
  }

  return <EditorShellClient initial={boletin} />;
}
