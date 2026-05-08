import "@/styles/uatta.css";
import "@/styles/uatta-extensions.css";
import { notFound } from "next/navigation";
import { Boletin } from "@/components/boletin/Boletin";
import { leer } from "@/lib/storage";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ id?: string }> };

export const metadata = {
  title: "Exporter · Boletín UATTA",
  robots: { index: false, follow: false },
};

/**
 * /render/exporter?id=<id>
 *
 * Render bare-bones del boletín indicado por id. Usada por los
 * endpoints de export PDF y PNG: Playwright navega acá, espera la
 * fonts/imagenes, y genera el output.
 *
 * Funciona para drafts y publicados. No verifica autorización (la
 * app es link-shared sin auth).
 */
export default async function ExporterPage({ searchParams }: Props) {
  const { id } = await searchParams;
  if (!id) notFound();
  const boletin = await leer(id);
  if (!boletin) notFound();

  return (
    <div className="uatta-page">
      <Boletin boletin={boletin} />
    </div>
  );
}
