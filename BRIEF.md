# Aplicativo Editor de Boletines — Unidad Administradora TTA-TCP

## Contexto

Estoy construyendo un aplicativo web para que la Unidad Administradora TTA-TCP (Ministerio de Hacienda, Chile) edite y publique **Boletines de Procedimientos**. El diseño visual está cerrado y vive en `boletin-sistema-diseno.html` (te lo entrego adjunto). Ese archivo es la **única fuente de verdad** para todo lo visual, junto con `boletin-uatta-2026-05-08.pdf` que es el output esperado del exportador PDF.

El aplicativo reemplaza el flujo manual de editar HTML a mano por un editor con cajas tipadas, persistencia, y exportadores.

## Repo y deploy

- **GitHub:** crea el repo `com-atta-procedimientos` (público, README mínimo, sin licencia).
- **Deploy:** Vercel, conectado al `main`. Cada push genera preview deploy.
- **Dominio:** el por defecto de Vercel está bien para esta etapa.

## Alcance (cerrado, no negociar)

- **Sin autenticación.** App pública en lectura y escritura. Es uso interno, link-shared.
- **Persistencia:** dos estados — `draft` (editable, autoguardado) y `published` (inmutable, URL canónica).
- **5 secciones numeradas precargadas** por defecto al crear un draft nuevo, replicando el contenido del REX 71/2026 que está en el HTML de referencia.
- **Agregar / eliminar / reordenar** secciones funciona en el editor; numeración recalculada automáticamente.
- **Footer** con bloque de contacto editable. Default: `Priscila Valladares · Encargada de Procesos y Control de Gestión · pvalladares@atta.gov.cl`.
- **Numeración y fecha:** automáticas con override manual.
- **Sin IA / sin LLM en runtime.** Contenido extraído 100% determinista desde formularios tipados.
- **Exportadores:** PDF, HTML autocontenido, PNG de portada, PPT.

## Regla crítica: fidelidad pixel-perfect

El renderizado del boletín — tanto en el preview del editor como en el HTML autocontenido exportado — debe ser **pixel-idéntico** al `boletin-sistema-diseno.html` de referencia para el mismo contenido.

Cómo lograrlo:

- Extraer los tokens del CSS de referencia (colores, tipografía, espaciados, sombras, bordes, anchos máximos) a **variables CSS institucionales** (`:root { --u-navy: #1c2557; --u-red: #e73439; ... }`). Cero cambios de valor.
- Replicar las clases `uatta-*` del CSS de referencia, con la misma estructura DOM.
- Reusar **verbatim** los SVGs inline de los íconos.
- Reusar **verbatim** los strings base64 de los logos del header y footer.
- Validación obligatoria al final del Hito 1: render lado a lado con la referencia, idénticos.

El HTML autocontenido descargable debe llevar su CSS embebido completo (sin recursos externos) y replicar exactamente la presentación del referencial.

El chrome del editor (sidebar, formularios, botones del CMS) usa Tailwind libremente; ahí no aplica la regla.

## Stack acordado

- **Next.js 15 + TypeScript + Tailwind**
- **Variables CSS institucionales** extraídas del HTML de referencia (no reescribir en utilidades Tailwind, no consolidar reglas, no "modernizar")
- **Storage local en archivos JSON** (un archivo por boletín en una carpeta del repo, vía API CRUD). Decisión consciente para esta etapa; si serverless lo limita, se migra después.
- **Exportadores:**
  - PDF y PNG: `Playwright` + `@sparticuz/chromium` server-side en Vercel Functions
  - HTML autocontenido: el HTML descargable trae embebido `html2pdf.js` con su propio botón "Descargar PDF" (igual que la referencia)
  - PPT: `pptxgenjs`

## Modelo de bloques tipados

```typescript
type Boletin = {
  id: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  numero: number;
  fecha: { mes: string; anio: number };
  hero: {
    eyebrow: string;
    titulo: string;
    subtitulo: string;
    imagenFondo?: string;
    rex: { numero: string; anio: number; url: string; descripcion: string };
  };
  audiencia: Array<{
    color: 'red' | 'orange' | 'blue';
    titulo: string;
    descripcion: string;
  }>;
  secciones: Array<{
    id: string;
    titulo: string;
    intro?: string;
    bloques: Array<SeccionBloque>;
  }>;
  flujo?: {
    intro: string;
    pasos: Array<{ rol: string; descripcion: string }>;
  };
  cierre: { texto: string; principios: Array<string> };
  footer: {
    contactoTitulo: string;
    contacto: { nombre: string; cargo: string; email: string };
    notaAdicional: string;
    creditos: {
      desarrolla: { unidad: string; email: string };
      enConjuntoCon: { unidad: string };
    };
  };
};

type SeccionBloque =
  | { tipo: 'parrafo'; contenido: string }
  | { tipo: 'leadbar'; contenido: string }
  | { tipo: 'tarjetas-grid'; columnas: 2 | 3; tarjetas: Array<{ etiqueta?: string; titulo: string; items: string[] }> }
  | { tipo: 'lista-check'; titulo?: string; items: string[] }
  | { tipo: 'lista-x'; titulo?: string; items: string[] }
  | { tipo: 'callout-naranja'; contenido: string }
  | { tipo: 'detalle-resaltado'; titulo: string; subtitulo?: string; incluye: string[] };
```

Notas sobre el schema:

- `flujo` es **top-level opcional**, no un bloque dentro de una sección. En la referencia aparece dentro de la sección 05, pero acá se separa para reusabilidad — otros boletines pueden o no tener flujo.
- `audiencia` viene con un set fijo de tres colores (`red | orange | blue`) que mapean a variantes de `uatta-dot`.
- Los bloques son patrones visuales **genéricos**, no acoplados al contenido del REX 71. Esto es intencional: el aplicativo debe poder usarse para futuros procedimientos.

## UX del editor

- Sidebar izquierdo con la lista de bloques (drag handle para reordenar `secciones`), panel principal con el formulario del bloque seleccionado en **acordeones**, **preview en vivo** a la derecha.
- Cada `tipo` de `SeccionBloque` tiene su propio formulario. Al agregar un bloque a una sección, el usuario primero elige el tipo, luego rellena los campos.
- `hero`, `audiencia`, `cierre`, `footer` son únicos y editables, no eliminables.
- `secciones` y `flujo`: agregar / eliminar / reordenar. Numeración (`01`, `02`...) recalculada al reordenar.
- **Autoguardado** del draft (cada N segundos o al perder foco). Indicador visible de estado de guardado.
- Botón **"Publicar"**: valida campos requeridos, crea registro `published`, redirige a `/n/[numero]`.

## Rutas

- `/` — listado de drafts y publicados (tabla simple)
- `/edit/new` — crea draft nuevo precargado con el contenido del REX 71/2026
- `/edit/[id]` — editor de un draft existente
- `/n/[numero]` — vista pública canónica del boletín publicado (sin chrome del editor)
- `/render/demo` — render hardcodeado del boletín de referencia, sin schema, sin storage (Hito 1)
- `/api/...` — CRUD y endpoints de export

## Contenido seed (precarga del draft nuevo)

Al crear un draft nuevo, precargar:

- `hero`, `audiencia`, `cierre`, `footer` con el contenido de la referencia
- 5 secciones numeradas con el contenido del REX 71/2026:
  1. **¿Quién es responsable de qué?** — `tarjetas-grid` columnas:2 (Etapa 1 / Etapa 2)
  2. **¿Qué debe contener la solicitud de reembolso?** — `tarjetas-grid` columnas:2 (Documentos obligatorios / Condiciones relevantes)
  3. **¿Qué gastos se reembolsan?** — `tarjetas-grid` columnas:2 + `detalle-resaltado` para el bloque de vehículo particular
  4. **¿Qué gastos NO se reembolsan?** — `lista-x`
  5. **¿Cómo se tramita el reembolso?** — `parrafo` + `tarjetas-grid` columnas:2 (Caso A / Caso B)
- `flujo` con los 9 pasos del proceso de reembolso

## Exportadores

### PDF (server-side, Playwright + @sparticuz/chromium)

Endpoint que renderiza `/n/[numero]` en headless Chromium y devuelve el PDF. Replicar la técnica de altura dinámica del HTML de referencia: medir altura real del contenido, generar PDF de página única con dimensiones `[210mm, contentHeight + márgenes]`. Sin saltos de página.

El archivo `boletin-uatta-2026-05-08.pdf` adjunto es la referencia visual del output esperado — el PDF generado por el aplicativo debe ser indistinguible de éste para el mismo contenido.

### PNG de portada (server-side, Playwright)

Screenshot del topbar + header + hero + audiencia + primer ribbon. Output 1600px de ancho, fondo blanco. Nombre: `boletin-uatta-{numero}-portada.png`.

### HTML autocontenido (client-side)

Replicar el bloque "Exportar HTML autocontenido" de la referencia. Inline todo CSS y todas las imágenes base64. El HTML descargado debe traer embebido `html2pdf.js` con un botón "Descargar PDF" funcional, que use la misma técnica de altura dinámica. El usuario abre el HTML, presiona descargar PDF, y obtiene el mismo PDF que el endpoint server-side.

### PPT (`pptxgenjs`)

Slide de portada (título, número, fecha, paleta institucional) + una slide por sección numerada (título numerado + bullets). Paleta y tipografía on-brand (rojo `#e73439`, navy `#1c2557`, Calibri/Segoe UI). La regla de pixel-perfect **no aplica al PPT** — es su propio formato.

## Plan de ejecución (5 hitos)

### Hito 1 · Scaffolding + design system

- Setup Next.js 15 + TS + Tailwind
- Extracción de tokens del CSS de referencia a variables CSS institucionales
- Página `/render/demo` con un boletín **hardcodeado** idéntico al de referencia
- **Validación obligatoria:** captura lado a lado con el HTML de referencia, idénticos. No avanzar al Hito 2 hasta que esto sea sí.

### Hito 2 · Schema + storage local

- Tipos TypeScript completos (el schema de arriba)
- Función de defaults que produce el draft seed con las 5 secciones del REX 71/2026
- Storage en archivos JSON (un archivo por boletín)
- API CRUD (Route Handlers o Server Actions)
- Listado de boletines en `/`

### Hito 3 · Editor

- Cajas tipadas en acordeones, una por bloque
- Preview en vivo a la derecha
- Drag-and-drop para reordenar secciones y bloques dentro de secciones
- Autoguardado de draft
- Botón Publicar con validación
- Numeración y fecha automáticas con override

### Hito 4 · Exportadores

- Playwright + @sparticuz/chromium en Vercel Functions para PDF y PNG
- HTML autocontenido con html2pdf.js embebido
- pptxgenjs para PPT
- Validar que los exportadores funcionen tanto en dev como en preview de Vercel

### Hito 5 · Deploy a Vercel

- Repo conectado, env vars configuradas
- Validar que los exportadores corren bien en serverless (Playwright + sparticuz suele requerir tuning de memoria y timeout)
- Probar el ciclo completo en preview: crear draft → editar → publicar → exportar PDF/HTML/PNG/PPT

## Checklist de aceptación

- [ ] Repo `com-atta-procedimientos` en GitHub, deploy en Vercel funcional desde `main`
- [ ] `/render/demo` renderiza pixel-idéntico a `boletin-sistema-diseno.html`
- [ ] `/edit/new` produce draft que renderiza pixel-idéntico a la referencia
- [ ] El export HTML del seed draft es funcionalmente equivalente al `boletin-sistema-diseno.html` original
- [ ] El export PDF del seed draft es indistinguible del `boletin-uatta-2026-05-08.pdf`
- [ ] Agregar/eliminar/reordenar secciones funciona, numeración recalculada
- [ ] Override manual de número y fecha funciona
- [ ] Footer de contacto editable, persiste en draft y publicado
- [ ] Drafts persisten entre sesiones; publicados tienen URL estable en `/n/[numero]`
- [ ] PNG de portada exporta a 1600px, fondo blanco, sin chrome
- [ ] PPT exporta con cover + una slide por sección numerada
- [ ] Exportadores funcionan en preview de Vercel, no solo en dev local

## Fuera de alcance

- Autenticación, RBAC, roles
- Asistencia de IA / sugerencias automáticas
- Comentarios, historial de versiones más allá de draft → published
- Notificaciones por email
- i18n (solo español de Chile)
- Editor rich text libre

## Acuerdos de trabajo

- **Lee `boletin-sistema-diseno.html` completo antes de escribir una línea.** La referencia es el spec.
- Cuando dudes sobre estilo, **copia desde la referencia**. No inventes valores.
- Todo el copy de UI y del boletín en español (Chile), tono institucional.
- Commits frecuentes con mensajes claros. Push a GitHub después de cada build verde.
- **No avanzar de hito sin validar el anterior.** El Hito 1 es especialmente importante: si la fidelidad visual no está, el resto no sirve.
- Si necesitas decisiones que no estén resueltas acá, pregúntame antes de improvisar.

## Lo primero que espero ver

1. Tu lectura del HTML de referencia: resumen de qué clases, tokens y estructuras vas a reutilizar.
2. Plan de archivos / arquitectura propuesto (rutas de carpetas, dónde vive el modelo de bloques, dónde vive el render del boletín).
3. Confirmación del stack y de los 5 hitos, o propuesta de ajustes con fundamento.
4. Primer commit con scaffolding del repo + Hito 1 completo: `/render/demo` renderizando pixel-idéntico a la referencia. Validación lado a lado antes de avanzar.
