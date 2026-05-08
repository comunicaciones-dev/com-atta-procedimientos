import "@/styles/uatta.css";
import "@/styles/uatta-extensions.css";
import { Boletin } from "@/components/boletin/Boletin";
import { crearDraftSeed } from "@/lib/seed";

export const metadata = {
  title: "Seed · Boletín UATTA",
  description:
    "Render parametrizado del seed REX 71/2026 — validación de paridad con /render/demo.",
};

/**
 * /render/seed — Validación de Hito 2.
 *
 * Render del Boletin parametrizado aplicado al seed. El boletín debe
 * tener las mismas dimensiones (980 × 4404.765625 px) que /render/demo.
 * Si no coinciden, hay drift entre el seed y BoletinDemo.tsx.
 */
export default function RenderSeedPage() {
  const boletin = crearDraftSeed();
  return (
    <div className="uatta-page">
      <Boletin boletin={boletin} />
    </div>
  );
}
