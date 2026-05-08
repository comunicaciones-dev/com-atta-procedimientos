/**
 * BoletinDemo — Render hardcodeado del boletín de referencia.
 *
 * Este componente es una traducción fiel del <article class="uatta-boletin">
 * de referencia/boletin-sistema-diseno.html (líneas 732-1028). Ningún valor
 * proviene de un schema; todo está literal. Sirve para validar que el CSS
 * institucional está bien embebido y que la fidelidad pixel-perfect se
 * mantiene en Next.js antes de empezar a parametrizar (Hito 2).
 *
 * Reglas:
 *  - Texto institucional verbatim (con caracteres Unicode en lugar de
 *    entidades HTML donde aplica: ¿ · ° é, etc.).
 *  - SVGs inline verbatim de la referencia.
 *  - Imagen del logo y de fondo del hero apuntan a assets en /public que
 *    son los mismos base64 de la referencia decodificados a binario.
 */
export function BoletinDemo() {
  return (
    <article
      className="uatta-boletin"
      lang="es-CL"
      role="region"
      aria-label="Boletín de Procedimientos · procedimiento de reembolso"
    >
      <div className="uatta-topbar">
        <b>Gobierno de Chile</b> · Ministerio de Hacienda · Unidad Administradora TTA-TCP
      </div>

      <header className="uatta-header">
        <img
          className="uatta-header__logo"
          src="/uatta-logo.png"
          alt="Unidad Administradora TTA-TCP — Ministerio de Hacienda · Gobierno de Chile"
        />
        <div className="uatta-header__meta">
          <b>Boletín de Procedimientos</b>Edición N° 01 · Mayo 2026
        </div>
      </header>

      <section className="uatta-hero">
        <span className="uatta-hero__eyebrow">Nuevo procedimiento institucional</span>
        <h1>
          Reembolso de gastos de <em>traslado y movilización</em> por comisiones de servicio y cometidos funcionarios
        </h1>
        <p className="uatta-hero__sub">
          Esta Unidad informa los aspectos más relevantes del nuevo procedimiento aplicable al personal de los Tribunales Tributarios y Aduaneros (TTA) y del Tribunal de Contratación Pública (TCP).
        </p>
        <a
          className="uatta-hero__rex"
          href="https://www.atta.gov.cl/wp-content/uploads/2026/04/REX-GR-2026-71-Procedimiento-de-reembolso-de-gastos-de-traslado-por-comisiones-o-cometidos-Tribunales.pdf"
          target="_blank"
          rel="noopener"
        >
          <span className="uatta-rex-tag">REX</span>
          <span>
            Descargar Resolución Exenta General N° 71 de 2026
            <span className="uatta-rex-meta">Unidad Administradora · PDF</span>
          </span>
        </a>
      </section>

      <div className="uatta-ribbon"></div>

      <div className="uatta-audience">
        <h3 className="uatta-audience__title">¿A quién aplica este procedimiento?</h3>
        <ul className="uatta-audience__list">
          <li>
            <span className="uatta-dot"></span>
            <span>
              <strong>Unidad Administradora</strong>
              <span className="subtle">Administradora o Administrador del Tribunal y funcionarias y funcionarios indicados en la REX.</span>
            </span>
          </li>
          <li>
            <span className="uatta-dot"></span>
            <span>
              <strong>Personal de los TTA</strong>
              <span className="subtle">Tribunales Tributarios y Aduaneros.</span>
            </span>
          </li>
          <li>
            <span className="uatta-dot"></span>
            <span>
              <strong>Personal del TCP</strong>
              <span className="subtle">Tribunal de Contratación Pública.</span>
            </span>
          </li>
        </ul>
      </div>

      {/* 01 ¿Quién es responsable de qué? */}
      <section className="uatta-section">
        <div className="uatta-section-head">
          <span className="uatta-num">01</span>
          <h2>¿Quién es responsable de qué?</h2>
        </div>
        <p className="uatta-leadblock">
          El procedimiento distingue dos instancias: <strong>la elaboración de la solicitud</strong>, a cargo del personal del Tribunal, y <strong>la tramitación del reembolso</strong>, a cargo de la Administradora o el Administrador del Tribunal.
        </p>
        <div className="uatta-grid-2">
          <article className="uatta-resp-card">
            <span className="uatta-step">Etapa 1 · Solicitud</span>
            <h3>Elaboración de la solicitud</h3>
            <p className="uatta-who">
              Responsable: <b>Personal del Tribunal</b>
            </p>
            <ul>
              <li>Elaborar la solicitud de reembolso conforme con el formato establecido.</li>
              <li>Reunir y completar toda la documentación de respaldo requerida.</li>
              <li>Verificar que los gastos cumplan con las condiciones y fechas autorizadas.</li>
              <li>Entregar la solicitud y los respaldos a la Administradora o Administrador del Tribunal.</li>
            </ul>
          </article>
          <article className="uatta-resp-card">
            <span className="uatta-step">Etapa 2 · Tramitación</span>
            <h3>Tramitación del reembolso</h3>
            <p className="uatta-who">
              Responsable: <b>Administradora o Administrador del Tribunal</b>
            </p>
            <ul>
              <li>Revisar, validar y gestionar la solicitud.</li>
              <li>Solicitar subsanaciones cuando corresponda.</li>
              <li>Tramitar el reembolso según se trate de comisión de servicio o cometido funcionario, con o sin pago de viático.</li>
            </ul>
          </article>
        </div>
      </section>

      {/* 02 ¿Qué debe contener la solicitud de reembolso? */}
      <section className="uatta-section">
        <div className="uatta-section-head">
          <span className="uatta-num">02</span>
          <h2>¿Qué debe contener la solicitud de reembolso?</h2>
        </div>
        <div className="uatta-grid-req">
          <div className="uatta-req">
            <h4>Documentos obligatorios</h4>
            <ul>
              <li>Solicitud de reembolso (Anexo N° 1).</li>
              <li>Copia del acto administrativo que autorizó la comisión de servicio o cometido funcionario.</li>
              <li>Copia del acto administrativo que autorizó el reembolso.</li>
              <li>Boletas o comprobantes según el tipo de traslado.</li>
            </ul>
          </div>
          <div className="uatta-req">
            <h4>Condiciones relevantes</h4>
            <ul>
              <li>Las boletas deben corresponder al período autorizado.</li>
              <li>Deben presentarse ordenadas para su correcta digitalización.</li>
              <li>Los gastos deben ser de carácter personal y no de terceros.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 03 ¿Qué gastos se reembolsan? */}
      <section className="uatta-section">
        <div className="uatta-section-head">
          <span className="uatta-num">03</span>
          <h2>¿Qué gastos se reembolsan?</h2>
        </div>
        <p>
          De acuerdo con el Anexo N° 2 — <em>&quot;Consideraciones para la presentación de una solicitud de reembolso por gastos de traslado y/o movilización&quot;</em>, se reembolsan los siguientes conceptos:
        </p>
        <div className="uatta-gastos">
          <article className="uatta-gasto">
            <div className="uatta-gasto__head">
              <span className="uatta-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6c0-2 1-3 3-3h11c1 0 2 1 2 3v12H3V6Z" />
                  <path d="M2 12h19" />
                  <circle cx="7" cy="17" r="1.4" />
                  <circle cx="17" cy="17" r="1.4" />
                </svg>
              </span>
              <h4>Traslado en bus</h4>
            </div>
            <div className="uatta-gasto__body">
              <ul>
                <li>Entre domicilio, terminal, ciudad de origen y destino.</li>
                <li>Entre terminal, hospedaje y lugar de comisión o cometido.</li>
              </ul>
            </div>
          </article>
          <article className="uatta-gasto">
            <div className="uatta-gasto__head">
              <span className="uatta-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M3 12h18M12 3v18" />
                </svg>
              </span>
              <h4>Locomoción colectiva urbana</h4>
            </div>
            <div className="uatta-gasto__body">
              <ul>
                <li>Máximo dos pasajes diarios (ida y vuelta).</li>
                <li>Solo gastos efectivamente utilizados.</li>
              </ul>
            </div>
          </article>
          <article className="uatta-gasto uatta-gasto--full">
            <div className="uatta-gasto__head">
              <span className="uatta-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
                  <circle cx="6.5" cy="16.5" r="2" />
                  <circle cx="16.5" cy="16.5" r="2" />
                </svg>
              </span>
              <h4>Taxi regulado por ley</h4>
            </div>
            <div className="uatta-gasto__body">
              <ul>
                <li>
                  Si el trayecto pudo realizarse mediante locomoción colectiva urbana, se reembolsará el menor valor entre el costo pagado y el valor estimado del mismo trayecto utilizando otra alternativa de locomoción colectiva urbana.
                </li>
                <li>Uso justificado en zonas rurales o situaciones excepcionales, según lo descrito en el procedimiento.</li>
              </ul>
            </div>
          </article>
          <article className="uatta-gasto uatta-gasto--full uatta-gasto--vehiculo">
            <div className="uatta-gasto__head">
              <span className="uatta-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 17h2v-3.5L18 9H6L3 13.5V17h2" />
                  <circle cx="7" cy="17" r="2" />
                  <circle cx="17" cy="17" r="2" />
                </svg>
              </span>
              <h4>
                Vehículo particular{" "}
                <span style={{ fontWeight: 500, color: "var(--u-fg-3)", fontSize: "12px" }}>
                  · uso excepcional
                </span>
              </h4>
            </div>
            <div className="uatta-gasto__body">
              <div className="uatta-vehiculo-detail">
                <p>Su uso es excepcional y se autoriza cuando no exista locomoción colectiva urbana disponible o existan condiciones que lo justifiquen.</p>
                <div className="uatta-incluye">
                  <h5>Incluye</h5>
                  <ul>
                    <li>Peajes</li>
                    <li>Estacionamientos</li>
                    <li>TAG o pase diario</li>
                    <li>Combustible (según cálculo del procedimiento)</li>
                  </ul>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* 04 ¿Qué gastos NO se reembolsan? */}
      <section className="uatta-section">
        <div className="uatta-section-head">
          <span className="uatta-num">04</span>
          <h2>¿Qué gastos NO se reembolsan?</h2>
        </div>
        <div className="uatta-deny">
          <h3>Exclusiones del reembolso</h3>
          <ul>
            <li>Gastos fuera del período autorizado.</li>
            <li>Gastos no asociados a la comisión o cometido.</li>
            <li>Pasajes no utilizados.</li>
            <li>Recargas completas de tarjetas de transporte.</li>
            <li>Valor del plástico de tarjetas.</li>
            <li>Beneficios por puntos, millas u otros (carga de combustible).</li>
            <li>Gastos de terceros.</li>
            <li>Uso de taxi cuando exista alternativa más económica.</li>
            <li>Combustible que exceda el cálculo máximo permitido.</li>
          </ul>
        </div>
      </section>

      {/* 05 ¿Cómo se tramita el reembolso? */}
      <section className="uatta-section">
        <div className="uatta-section-head">
          <span className="uatta-num">05</span>
          <h2>¿Cómo se tramita el reembolso?</h2>
        </div>
        <p className="uatta-tram-resp">
          Responsable de la tramitación: <strong>la Administradora o el Administrador del Tribunal.</strong>
        </p>
        <div className="uatta-tram">
          <article className="uatta-tram__card">
            <div className="uatta-tram__top">
              Sin pago de viático <span className="uatta-badge">Caso A</span>
            </div>
            <div className="uatta-tram__body">
              <h4>Comisiones o cometidos sin pago de viático</h4>
              <p>
                El reembolso se efectúa mediante el <strong>Fondo Fijo del Tribunal</strong>.
              </p>
              <p>En caso de que dicho fondo resulte insuficiente, debe gestionarse previamente la resolución que autoriza el reembolso.</p>
            </div>
          </article>
          <article className="uatta-tram__card alt">
            <div className="uatta-tram__top">
              Con pago de viático <span className="uatta-badge">Caso B</span>
            </div>
            <div className="uatta-tram__body">
              <h4>Comisiones o cometidos con pago de viático</h4>
              <p>
                El reembolso se tramita mediante <strong>memorándum</strong>, según lo descrito en el procedimiento.
              </p>
              <p>Considera instancias sucesivas de revisión y validación.</p>
            </div>
          </article>
        </div>

        <div className="uatta-flow">
          <p className="uatta-flow__intro">
            A continuación se presenta el <strong>flujo de responsabilidades</strong> que sigue cada solicitud de reembolso, desde su elaboración en el Tribunal hasta su pago.
          </p>
          <ol className="uatta-flow__list">
            <li className="uatta-flow__step">
              <span className="uatta-flow__num">1</span>
              <div className="uatta-flow__body">
                <h4>Personal del Tribunal</h4>
                <p>Elabora la solicitud de reembolso y reúne la documentación de respaldo.</p>
              </div>
            </li>
            <li className="uatta-flow__step">
              <span className="uatta-flow__num">2</span>
              <div className="uatta-flow__body">
                <h4>Administrador/a del Tribunal</h4>
                <p>Recibe, valida y deriva la solicitud a la Unidad Administradora.</p>
              </div>
            </li>
            <li className="uatta-flow__step">
              <span className="uatta-flow__num">3</span>
              <div className="uatta-flow__body">
                <h4>Profesional Gestión y Operaciones</h4>
                <p>Revisa y valida la solicitud y sus antecedentes.</p>
              </div>
            </li>
            <li className="uatta-flow__step">
              <span className="uatta-flow__num">4</span>
              <div className="uatta-flow__body">
                <h4>Jefatura Departamento Gestión y Operaciones</h4>
                <p>Valida y supervisa el cumplimiento del procedimiento.</p>
              </div>
            </li>
            <li className="uatta-flow__step">
              <span className="uatta-flow__num">5</span>
              <div className="uatta-flow__body">
                <h4>Encargado/a Abastecimiento y Contratos</h4>
                <p>Valida la solicitud y supervisa la gestión de la Unidad.</p>
              </div>
            </li>
            <li className="uatta-flow__step">
              <span className="uatta-flow__num">6</span>
              <div className="uatta-flow__body">
                <h4>Profesional Abastecimiento y Contratos</h4>
                <p>Registra el compromiso en SIGFE y deriva a Contabilidad.</p>
              </div>
            </li>
            <li className="uatta-flow__step">
              <span className="uatta-flow__num">7</span>
              <div className="uatta-flow__body">
                <h4>Jefatura de Finanzas</h4>
                <p>Autoriza montos y supervisa la ejecución financiera.</p>
              </div>
            </li>
            <li className="uatta-flow__step">
              <span className="uatta-flow__num">8</span>
              <div className="uatta-flow__body">
                <h4>Unidad de Contabilidad</h4>
                <p>Verifica los antecedentes y deriva a Tesorería para pago.</p>
              </div>
            </li>
            <li className="uatta-flow__step">
              <span className="uatta-flow__num">9</span>
              <div className="uatta-flow__body">
                <h4>Unidad de Tesorería</h4>
                <p>Verifica, registra y ejecuta el pago en SIGFE.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <aside className="uatta-closing">
        <p>
          El cumplimiento de este procedimiento permite asegurar la correcta tramitación de las solicitudes de reembolso, resguardando los principios de eficiencia, austeridad y adecuada administración de los recursos públicos.
        </p>
        <div className="uatta-principles">
          <span>Eficiencia</span>
          <span>Austeridad</span>
          <span>Probidad</span>
          <span>Transparencia</span>
        </div>
      </aside>

      <div style={{ height: "32px" }}></div>
      <div className="uatta-ribbon"></div>

      <footer className="uatta-footer">
        <div>
          <h4>¿Consultas sobre este procedimiento?</h4>
          <div className="uatta-contact">
            <strong>Priscila Valladares</strong>
            <span className="uatta-contact__role">Encargada de Procesos y Control de Gestión</span>
            <a href="mailto:pvalladares@atta.gov.cl">pvalladares@atta.gov.cl</a>
          </div>
          <p>El texto íntegro de la REX N° 71/2026 está disponible en el enlace al inicio de este boletín.</p>
        </div>
        <div className="uatta-footer__brand">
          <img
            className="uatta-footer__logo"
            src="/uatta-logo.png"
            alt="Unidad Administradora TTA-TCP"
          />
          <strong>Unidad Administradora TTA-TCP</strong>
          Ministerio de Hacienda · Gobierno de Chile
        </div>
        <div className="uatta-footer__credits">
          <span>
            <span className="uatta-cred-label">Desarrolla</span> <b>Unidad de Comunicaciones</b> ·{" "}
            <a href="mailto:comunicaciones@atta.gov.cl">comunicaciones@atta.gov.cl</a>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            <span className="uatta-cred-label">En conjunto con</span> <b>Unidad de Procesos y Control de Gestión</b>
          </span>
        </div>
      </footer>
    </article>
  );
}
