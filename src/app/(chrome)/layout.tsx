import "@/app/globals.css";

/**
 * Layout del CHROME del editor: home, listado, editor, vista pública.
 *
 * Importa globals.css (Tailwind base + utilidades). Las rutas de render
 * puro del boletín NO viven aquí — están bajo /render/* y /n/* y traen
 * solo uatta.css para evitar que el preflight de Tailwind resetee los
 * estilos institucionales (list-style, padding de ul, etc.).
 */
export default function ChromeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
