import type { Metadata } from "next";

// Layout raíz minimalista. NO importa globals.css (Tailwind base/preflight)
// para que las rutas de render del boletín reciban únicamente el CSS
// institucional de uatta.css y mantengan la fidelidad pixel-perfect.
// El chrome del editor (rutas (chrome)) trae su propio Tailwind via su
// layout anidado.

export const metadata: Metadata = {
  title: "Boletines de Procedimientos · Unidad Administradora TTA-TCP",
  description:
    "Editor y publicador de Boletines de Procedimientos de la Unidad Administradora TTA-TCP, Ministerio de Hacienda.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-CL">
      <body>{children}</body>
    </html>
  );
}
