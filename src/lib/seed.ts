/**
 * Seed del draft inicial: replica el contenido del REX 71/2026 que está
 * hardcodeado en BoletinDemo.tsx (Hito 1) pero estructurado contra el
 * schema tipado. La validación de cierre del Hito 2 confirma que el
 * render parametrizado <Boletin/> sobre este seed produce las mismas
 * dimensiones (980 × 4404.765625 px) que <BoletinDemo/>.
 *
 * Cualquier discrepancia entre lo que dice esta función y lo que dice
 * BoletinDemo.tsx es un bug — la fuente de verdad es el HTML de
 * referencia, no este archivo.
 *
 * Convención de inline emphasis (parseada por inline.ts):
 *   [[texto]] → <strong>
 *   //texto// → <em>
 */

import { randomUUID } from "node:crypto";
import { SCHEMA_VERSION, type Boletin } from "./schema";

export function crearDraftSeed(): Boletin {
  const now = new Date().toISOString();

  return {
    id: randomUUID(),
    status: "draft",
    schemaVersion: SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
    numero: 1,
    fecha: { mes: "Mayo", anio: 2026 },

    hero: {
      eyebrow: "Nuevo procedimiento institucional",
      titulo:
        "Reembolso de gastos de //traslado y movilización// por comisiones de servicio y cometidos funcionarios",
      subtitulo:
        "Esta Unidad informa los aspectos más relevantes del nuevo procedimiento aplicable al personal de los Tribunales Tributarios y Aduaneros (TTA) y del Tribunal de Contratación Pública (TCP).",
      rex: {
        numero: "71",
        anio: 2026,
        url: "https://www.atta.gov.cl/wp-content/uploads/2026/04/REX-GR-2026-71-Procedimiento-de-reembolso-de-gastos-de-traslado-por-comisiones-o-cometidos-Tribunales.pdf",
        descripcion: "Unidad Administradora · PDF",
      },
    },

    audiencia: [
      {
        color: "red",
        titulo: "Unidad Administradora",
        descripcion:
          "Administradora o Administrador del Tribunal y funcionarias y funcionarios indicados en la REX.",
      },
      {
        color: "orange",
        titulo: "Personal de los TTA",
        descripcion: "Tribunales Tributarios y Aduaneros.",
      },
      {
        color: "blue",
        titulo: "Personal del TCP",
        descripcion: "Tribunal de Contratación Pública.",
      },
    ],

    secciones: [
      // 01 — variante "resp" (uatta-resp-card)
      {
        id: "responsabilidad",
        titulo: "¿Quién es responsable de qué?",
        bloques: [
          {
            tipo: "leadbar",
            contenido:
              "El procedimiento distingue dos instancias: [[la elaboración de la solicitud]], a cargo del personal del Tribunal, y [[la tramitación del reembolso]], a cargo de la Administradora o el Administrador del Tribunal.",
          },
          {
            tipo: "tarjetas-grid",
            columnas: 2,
            variante: "resp",
            tarjetas: [
              {
                etiqueta: "Etapa 1 · Solicitud",
                titulo: "Elaboración de la solicitud",
                who: "Responsable: [[Personal del Tribunal]]",
                items: [
                  "Elaborar la solicitud de reembolso conforme con el formato establecido.",
                  "Reunir y completar toda la documentación de respaldo requerida.",
                  "Verificar que los gastos cumplan con las condiciones y fechas autorizadas.",
                  "Entregar la solicitud y los respaldos a la Administradora o Administrador del Tribunal.",
                ],
              },
              {
                etiqueta: "Etapa 2 · Tramitación",
                titulo: "Tramitación del reembolso",
                who: "Responsable: [[Administradora o Administrador del Tribunal]]",
                items: [
                  "Revisar, validar y gestionar la solicitud.",
                  "Solicitar subsanaciones cuando corresponda.",
                  "Tramitar el reembolso según se trate de comisión de servicio o cometido funcionario, con o sin pago de viático.",
                ],
              },
            ],
          },
        ],
      },

      // 02 — variante "simple" (uatta-req)
      {
        id: "contenido-solicitud",
        titulo: "¿Qué debe contener la solicitud de reembolso?",
        bloques: [
          {
            tipo: "tarjetas-grid",
            columnas: 2,
            variante: "simple",
            tarjetas: [
              {
                titulo: "Documentos obligatorios",
                items: [
                  "Solicitud de reembolso (Anexo N° 1).",
                  "Copia del acto administrativo que autorizó la comisión de servicio o cometido funcionario.",
                  "Copia del acto administrativo que autorizó el reembolso.",
                  "Boletas o comprobantes según el tipo de traslado.",
                ],
              },
              {
                titulo: "Condiciones relevantes",
                items: [
                  "Las boletas deben corresponder al período autorizado.",
                  "Deben presentarse ordenadas para su correcta digitalización.",
                  "Los gastos deben ser de carácter personal y no de terceros.",
                ],
              },
            ],
          },
        ],
      },

      // 03 — variante "gasto" (uatta-gasto) + detalle-resaltado para vehiculo
      {
        id: "gastos-incluidos",
        titulo: "¿Qué gastos se reembolsan?",
        bloques: [
          {
            tipo: "parrafo",
            contenido:
              'De acuerdo con el Anexo N° 2 — //"Consideraciones para la presentación de una solicitud de reembolso por gastos de traslado y/o movilización"//, se reembolsan los siguientes conceptos:',
          },
          {
            tipo: "tarjetas-grid",
            columnas: 2,
            variante: "gasto",
            tarjetas: [
              {
                icono: "bus",
                titulo: "Traslado en bus",
                items: [
                  "Entre domicilio, terminal, ciudad de origen y destino.",
                  "Entre terminal, hospedaje y lugar de comisión o cometido.",
                ],
              },
              {
                icono: "colectivo",
                titulo: "Locomoción colectiva urbana",
                items: [
                  "Máximo dos pasajes diarios (ida y vuelta).",
                  "Solo gastos efectivamente utilizados.",
                ],
              },
              {
                icono: "taxi",
                titulo: "Taxi regulado por ley",
                items: [
                  "Si el trayecto pudo realizarse mediante locomoción colectiva urbana, se reembolsará el menor valor entre el costo pagado y el valor estimado del mismo trayecto utilizando otra alternativa de locomoción colectiva urbana.",
                  "Uso justificado en zonas rurales o situaciones excepcionales, según lo descrito en el procedimiento.",
                ],
              },
              {
                icono: "vehiculo",
                titulo: "Vehículo particular",
                subtitulo: "uso excepcional",
                parrafos: [
                  "Su uso es excepcional y se autoriza cuando no exista locomoción colectiva urbana disponible o existan condiciones que lo justifiquen.",
                ],
                incluye: [
                  "Peajes",
                  "Estacionamientos",
                  "TAG o pase diario",
                  "Combustible (según cálculo del procedimiento)",
                ],
              },
            ],
          },
        ],
      },

      // 04 — lista-x (uatta-deny)
      {
        id: "gastos-excluidos",
        titulo: "¿Qué gastos NO se reembolsan?",
        bloques: [
          {
            tipo: "lista-x",
            titulo: "Exclusiones del reembolso",
            items: [
              "Gastos fuera del período autorizado.",
              "Gastos no asociados a la comisión o cometido.",
              "Pasajes no utilizados.",
              "Recargas completas de tarjetas de transporte.",
              "Valor del plástico de tarjetas.",
              "Beneficios por puntos, millas u otros (carga de combustible).",
              "Gastos de terceros.",
              "Uso de taxi cuando exista alternativa más económica.",
              "Combustible que exceda el cálculo máximo permitido.",
            ],
          },
        ],
      },

      // 05 — variante "caso" (uatta-tram__card)
      {
        id: "tramitacion",
        titulo: "¿Cómo se tramita el reembolso?",
        bloques: [
          {
            tipo: "leadbar",
            compacto: true,
            contenido:
              "Responsable de la tramitación: [[la Administradora o el Administrador del Tribunal.]]",
          },
          {
            tipo: "tarjetas-grid",
            columnas: 2,
            variante: "caso",
            tarjetas: [
              {
                tono: "navy",
                etiqueta: "Sin pago de viático",
                badge: "Caso A",
                titulo: "Comisiones o cometidos sin pago de viático",
                parrafos: [
                  "El reembolso se efectúa mediante el [[Fondo Fijo del Tribunal]].",
                  "En caso de que dicho fondo resulte insuficiente, debe gestionarse previamente la resolución que autoriza el reembolso.",
                ],
              },
              {
                tono: "azul",
                etiqueta: "Con pago de viático",
                badge: "Caso B",
                titulo: "Comisiones o cometidos con pago de viático",
                parrafos: [
                  "El reembolso se tramita mediante [[memorándum]], según lo descrito en el procedimiento.",
                  "Considera instancias sucesivas de revisión y validación.",
                ],
              },
            ],
          },
        ],
      },
    ],

    flujo: {
      intro:
        "A continuación se presenta el [[flujo de responsabilidades]] que sigue cada solicitud de reembolso, desde su elaboración en el Tribunal hasta su pago.",
      pasos: [
        {
          rol: "Personal del Tribunal",
          descripcion:
            "Elabora la solicitud de reembolso y reúne la documentación de respaldo.",
        },
        {
          rol: "Administrador/a del Tribunal",
          descripcion:
            "Recibe, valida y deriva la solicitud a la Unidad Administradora.",
        },
        {
          rol: "Profesional Gestión y Operaciones",
          descripcion: "Revisa y valida la solicitud y sus antecedentes.",
        },
        {
          rol: "Jefatura Departamento Gestión y Operaciones",
          descripcion: "Valida y supervisa el cumplimiento del procedimiento.",
        },
        {
          rol: "Encargado/a Abastecimiento y Contratos",
          descripcion: "Valida la solicitud y supervisa la gestión de la Unidad.",
        },
        {
          rol: "Profesional Abastecimiento y Contratos",
          descripcion:
            "Registra el compromiso en SIGFE y deriva a Contabilidad.",
        },
        {
          rol: "Jefatura de Finanzas",
          descripcion: "Autoriza montos y supervisa la ejecución financiera.",
        },
        {
          rol: "Unidad de Contabilidad",
          descripcion:
            "Verifica los antecedentes y deriva a Tesorería para pago.",
        },
        {
          rol: "Unidad de Tesorería",
          descripcion: "Verifica, registra y ejecuta el pago en SIGFE.",
        },
      ],
    },

    cierre: {
      texto:
        "El cumplimiento de este procedimiento permite asegurar la correcta tramitación de las solicitudes de reembolso, resguardando los principios de eficiencia, austeridad y adecuada administración de los recursos públicos.",
      principios: ["Eficiencia", "Austeridad", "Probidad", "Transparencia"],
    },

    footer: {
      contactoTitulo: "¿Consultas sobre este procedimiento?",
      contacto: {
        nombre: "Priscila Valladares",
        cargo: "Encargada de Procesos y Control de Gestión",
        email: "pvalladares@atta.gov.cl",
      },
      notaAdicional:
        "El texto íntegro de la REX N° 71/2026 está disponible en el enlace al inicio de este boletín.",
      creditos: {
        desarrolla: {
          unidad: "Unidad de Comunicaciones",
          email: "comunicaciones@atta.gov.cl",
        },
        enConjuntoCon: {
          unidad: "Unidad de Procesos y Control de Gestión",
        },
      },
    },
  };
}
