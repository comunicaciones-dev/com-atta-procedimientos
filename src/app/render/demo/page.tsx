import "@/styles/uatta.css";
import { BoletinDemo } from "@/components/boletin/BoletinDemo";

export const metadata = {
  title: "Demo · Boletín UATTA",
  description: "Render hardcodeado del boletín de referencia para validar fidelidad pixel-perfect.",
};

/**
 * /render/demo — Hito 1.
 *
 * Render hardcodeado del boletín de referencia. La validación de fidelidad
 * (pixel-perfect contra referencia/boletin-sistema-diseno.html) ocurre en
 * esta ruta. No usa el schema de bloques ni storage; eso llega en Hito 2.
 *
 * El wrapper `.uatta-page` reproduce el contenedor centrado de la
 * referencia: padding lateral responsive y fondo gris claro.
 */
export default function RenderDemoPage() {
  return (
    <div className="uatta-page">
      <BoletinDemo />
    </div>
  );
}
