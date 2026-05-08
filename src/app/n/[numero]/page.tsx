import "@/styles/uatta.css";
import "@/styles/uatta-extensions.css";
import { notFound } from "next/navigation";
import { Boletin } from "@/components/boletin/Boletin";
import { ExportarToolbar } from "@/components/boletin/ExportarToolbar";
import { leerPorNumero } from "@/lib/storage";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ numero: string }> };

export async function generateMetadata({ params }: Props) {
  const { numero } = await params;
  return {
    title: `Boletín N° ${numero} · UATTA`,
    description: `Boletín de Procedimientos N° ${numero} de la Unidad Administradora TTA-TCP.`,
  };
}

/**
 * /n/[numero] — Vista pública canónica del boletín publicado.
 * Sin chrome, solo el render institucional.
 */
export default async function PublicadoPage({ params }: Props) {
  const { numero } = await params;
  const n = parseInt(numero, 10);
  if (Number.isNaN(n) || n <= 0) notFound();

  const boletin = await leerPorNumero(n);
  if (!boletin) notFound();

  return (
    <>
      <ExportarToolbar numero={n} />
      <div className="uatta-page">
        <Boletin boletin={boletin} />
      </div>
    </>
  );
}
