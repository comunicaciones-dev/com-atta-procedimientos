/**
 * Toolbar liviano para la vista pública /n/[numero] con 4 enlaces de
 * exportación. Usa solo las clases uatta-toolbar* que ya están en
 * uatta.css, así no requerimos Tailwind en la ruta pública.
 *
 * Server Component — no necesita interactividad: cada link es una
 * descarga directa (Content-Disposition lo convierte en download).
 */

export function ExportarToolbar({ numero }: { numero: number }) {
  const params = `?numero=${numero}`;
  return (
    <div className="uatta-toolbar" data-uatta-noexport>
      <div className="uatta-toolbar__brand">
        <span className="uatta-toolbar__brand-mark" aria-hidden="true"></span>
        <span>
          Boletín N° {String(numero).padStart(2, "0")} · Unidad
          Administradora TTA-TCP
        </span>
      </div>
      <div className="uatta-toolbar__actions">
        <span className="uatta-toolbar__hint">Exportar</span>
        <a
          className="uatta-toolbar__btn"
          href={`/api/export/html${params}`}
          download
        >
          HTML
        </a>
        <a
          className="uatta-toolbar__btn"
          href={`/api/export/png${params}`}
          download
        >
          PNG
        </a>
        <a
          className="uatta-toolbar__btn"
          href={`/api/export/pptx${params}`}
          download
        >
          PPT
        </a>
        <a
          className="uatta-toolbar__btn uatta-toolbar__btn--primary"
          href={`/api/export/pdf${params}`}
          download
        >
          PDF
        </a>
      </div>
    </div>
  );
}
