# com-atta-procedimientos

Aplicativo web para que la **Unidad Administradora TTA-TCP** (Ministerio de
Hacienda, Chile) edite y publique **Boletines de Procedimientos** con cajas
tipadas, persistencia simple y exportadores (PDF, HTML autocontenido, PNG,
PPT).

Reemplaza el flujo manual de editar HTML a mano por un editor con preview
en vivo y publicación con URL canónica.

---

## Estado actual

**Hito 1 · Scaffolding + design system — completado.**

- Next.js 15.5 + React 19 + TypeScript + Tailwind CSS.
- Sistema de diseño institucional UATTA embebido verbatim
  ([src/styles/uatta.css](src/styles/uatta.css), 708 líneas) extraído de
  [referencia/boletin-sistema-diseno.html](referencia/boletin-sistema-diseno.html).
- Logos y fondo del hero extraídos a [public/](public/) como binarios.
- [`/render/demo`](src/app/render/demo/page.tsx) renderiza el boletín de
  referencia hardcodeado, **pixel-idéntico** al original.
- Tailwind aislado al chrome del editor (route group
  [`(chrome)`](src/app/(chrome)/)) para que el preflight no afecte al
  render del boletín.

**Hito 2 · Schema tipado + storage local — completado.**

- [`src/lib/schema.ts`](src/lib/schema.ts): tipos `Boletin`, `Seccion`,
  `SeccionBloque` (union discriminado) y `TarjetaGrid` con 4 variantes
  visuales (`simple`, `resp`, `gasto`, `caso`) que cubren las 5 secciones
  del REX 71/2026.
- [`src/lib/seed.ts`](src/lib/seed.ts): `crearDraftSeed()` produce un
  draft con todo el contenido del REX 71/2026.
- [`src/lib/inline.ts`](src/lib/inline.ts): parser determinista para
  inline emphasis: `[[texto]]` → `<strong>`, `//texto//` → `<em>`.
- [`src/components/boletin/Boletin.tsx`](src/components/boletin/Boletin.tsx):
  render parametrizado contra el schema. **Misma altura exacta que el
  demo** (980 × 4404.765625 px) — validado en
  [`/render/seed`](src/app/render/seed/page.tsx).
- [`src/lib/storage.ts`](src/lib/storage.ts): CRUD con backend dual.
  En dev local guarda archivos JSON en `data/boletines/<id>.json`. En
  producción usa **Vercel Blob** bajo el prefijo `boletines/<id>.json`
  (cuando `BLOB_READ_WRITE_TOKEN` está presente). Si Vercel corre sin
  el token configurado, cae a `/tmp/data/boletines/` ephemeral y el
  home muestra un banner pidiendo configurar Blob.
- API Route Handlers: `GET/POST /api/boletines`, `GET/PUT/DELETE
  /api/boletines/[id]`, `POST /api/boletines/[id]/publish`.
- [`src/styles/uatta-shield.css`](src/styles/uatta-shield.css): shield
  CSS que restaura `list-style: disc` solo en las listas de `.uatta-req`,
  `.uatta-gasto__body`, `.uatta-incluye` (las únicas que dependen del
  default del browser) cuando coexisten con Tailwind preflight en `/edit`.
- Rutas: `/` (listado), `/edit/new` (crea + redirige), `/edit/[id]`
  (preview en vivo del draft, editor real en Hito 3), `/n/[numero]`
  (vista pública canónica).
- Flujo end-to-end probado: crear → editar → publicar → ver en `/n/1`,
  todas mantienen las dimensiones pixel-perfect.

**Hito 3 · Editor con cajas tipadas — completado.**

- [`EditorShell`](src/components/editor/EditorShell.tsx) carga el draft
  y mantiene el `Boletin` en un único `useState`. Cargado vía
  `dynamic(..., { ssr: false })` desde
  [`EditorShellClient`](src/components/editor/EditorShellClient.tsx)
  para evitar mismatch de hidratación de los IDs internos de dnd-kit y
  del formato de fecha localizado.
- [`EditorSidebar`](src/components/editor/EditorSidebar.tsx): nav con
  Metadata / Hero / Audiencia, secciones numeradas con drag-handle
  ([@dnd-kit/sortable](https://github.com/clauderic/dnd-kit)) para
  reordenar, lista de bloques de cada sección con drag-handle propio,
  menú "+ Agregar bloque" con los 7 tipos del schema, eliminar con
  confirm; y nav para Flujo / Cierre / Footer.
- [`EditorForm`](src/components/editor/EditorForm.tsx): formularios
  tipados para cada selección — Metadata (numero + fecha override),
  Hero (eyebrow, título, subtítulo, REX), Audiencia (3 ítems con color),
  Sección (título + intro), cada uno de los 7 tipos de bloque con sus
  campos específicos (incluyendo las 4 variantes de tarjetas-grid),
  Flujo, Cierre, Footer, todo con la convención inline `[[bold]] //em//`
  documentada en cada hint.
- [`EditorPreview`](src/components/editor/EditorPreview.tsx): render
  vivo del `<Boletin/>` con `transform: scale` dinámico para encajar el
  artículo de 980 px en el panel disponible.
- [`useAutosave`](src/components/editor/useAutosave.ts): debounce de
  800 ms desde el último cambio, PUT a `/api/boletines/[id]`, comparación
  por JSON.stringify para evitar requests redundantes, abort de
  in-flight requests cuando llega un cambio nuevo. Indicador en el
  topbar: "Sin cambios" / "Guardando…" / "Guardado · hace Xs" / "Error:
  ...".
- **Botón Publicar** con validación (numero positivo, hero título y
  subtítulo no vacíos, todas las secciones con título, email del footer
  con @), confirm, y redirect a `/n/[numero]` al confirmar.

**Lo que sigue**: Hito 4 (exportadores PDF, HTML autocontenido, PNG, PPT).

---

## Lectura del HTML de referencia

[referencia/boletin-sistema-diseno.html](referencia/boletin-sistema-diseno.html)
es la única fuente de verdad para la presentación. Notas tomadas durante la
lectura:

### Tokens institucionales (CSS vars en `.uatta-boletin`)

| Variable | Valor | Uso |
| --- | --- | --- |
| `--u-red` | `#e73439` | Acentos primarios, borde de hero, REX, CTAs, num de sección |
| `--u-blue` | `#0063af` | Etapa, badges Caso B, líneas de :marker |
| `--u-navy` | `#25306b` | Texto de títulos h2/h3/h4 |
| `--u-navy-deep` | `#1c2557` | Topbar, footer, gradiente |
| `--u-tta` | `#FB9A27` | 2.º item de audiencia (Personal TTA) |
| `--u-tcp` | `#004995` | 3.er item de audiencia (Personal TCP) |
| `--u-grad-1`, `--u-grad-2` | `#2c3a8c`, `#1c2557` | Gradiente del hero / closing |
| `--u-bg-1..3` | `#fff`, `#f7f8fa`, `#eaeef5` | Fondos blancos y grises |
| `--u-bd-1`, `--u-bd-2` | `#dcdfe6`, `#c1c6d1` | Bordes neutros |
| `--u-fg-1..3` | `#1a1d27`, `#4a5060`, `#6b7180` | Jerarquía de texto |
| `--u-danger-bg`, `--u-danger-bd` | `#fde7e8`, `#f6c6c8` | Bloque de exclusiones |
| `--u-r-md`, `--u-r-sm`, `--u-r-pill` | `8px`, `4px`, `999px` | Radios |

### Catálogo de clases reutilizadas verbatim

- Estructura: `uatta-boletin`, `uatta-topbar`, `uatta-header`, `uatta-hero`, `uatta-ribbon`, `uatta-section`, `uatta-section-head`, `uatta-num`, `uatta-closing`, `uatta-footer`.
- Hero: `uatta-hero__eyebrow`, `uatta-hero__sub`, `uatta-hero__rex`, `uatta-rex-tag`, `uatta-rex-meta`.
- Audiencia: `uatta-audience`, `uatta-audience__title`, `uatta-audience__list`, `uatta-dot`. Colores por `:nth-child(1|2|3)`.
- Bloques de sección: `uatta-leadblock`, `uatta-grid-2`, `uatta-resp-card` (+ `uatta-step`, `uatta-who`), `uatta-grid-req`, `uatta-req`, `uatta-gastos`, `uatta-gasto` (+ `--full`, `--vehiculo`), `uatta-gasto__head`/`__body`, `uatta-icon`, `uatta-vehiculo-detail`, `uatta-incluye`, `uatta-deny`, `uatta-tram`, `uatta-tram__card` (+ `.alt`), `uatta-tram__top`/`__body`, `uatta-badge`, `uatta-tram-resp`.
- Flujo: `uatta-flow`, `uatta-flow__intro`, `uatta-flow__list`, `uatta-flow__step`, `uatta-flow__num`, `uatta-flow__body`. Colores por `:nth-child(n+6)` (items 6-9 azul-navy).
- Cierre: `uatta-closing`, `uatta-principles`.
- Footer: `uatta-footer__brand`, `uatta-footer__logo`, `uatta-contact`, `uatta-contact__role`, `uatta-footer__credits`, `uatta-cred-label`.

### SVGs y assets

- Cuatro SVGs inline en los `uatta-icon` (bus, locomoción colectiva, taxi,
  vehículo). Reusados verbatim en [BoletinDemo.tsx](src/components/boletin/BoletinDemo.tsx).
- Logo único compartido entre header y footer (la línea 737 y 1017 de la
  referencia contienen exactamente la misma cadena base64). Decodificado a
  [public/uatta-logo.png](public/uatta-logo.png) (43 KB).
- Imagen de fondo del hero (línea 183 de la referencia). Decodificada a
  [public/uatta-hero-bg.jpg](public/uatta-hero-bg.jpg) (94 KB).

### Lógica de exportación de la referencia

La referencia tiene dos botones (que **no** forman parte del `<article>`):

- **Descargar PDF**: usa `html2pdf.js` con técnica de altura dinámica —
  renderiza a canvas, mide ratio, fija página A4 ancho con altura =
  `contentWidthMm * ratio + márgenes + colchón`. Resultado: PDF de página
  única sin saltos.
- **Exportar HTML**: copia todos los `<style>` del head y el outerHTML del
  artículo a un documento autocontenido, lo descarga como blob.

Esa lógica se replicará en Hito 4 con dos variantes:

- Server-side (Vercel Functions + Playwright + `@sparticuz/chromium`)
  para PDF y PNG generados desde la URL canónica.
- Client-side embebido en el HTML autocontenido descargable (`html2pdf.js`
  inline + botón "Descargar PDF" propio, idéntico a la referencia).

---

## Arquitectura propuesta

```
src/
├── app/
│   ├── layout.tsx              # Layout raíz minimalista (sin Tailwind)
│   ├── globals.css             # Tailwind base + utilidades del chrome
│   │
│   ├── (chrome)/               # Route group: chrome del editor
│   │   ├── layout.tsx          # Importa globals.css → Tailwind activo
│   │   └── page.tsx            # Home / listado (Hito 2)
│   │   # Futuro: edit/[id]/page.tsx, edit/new/page.tsx
│   │
│   ├── render/
│   │   └── demo/
│   │       └── page.tsx        # Hito 1: render hardcodeado (uatta.css)
│   │
│   ├── n/                      # Hito 2: vista pública
│   │   └── [numero]/page.tsx
│   │
│   └── api/                    # Hito 2-4: CRUD + exportadores
│       ├── boletines/
│       └── export/
│
├── components/
│   ├── boletin/
│   │   ├── BoletinDemo.tsx     # Hito 1: render hardcodeado
│   │   └── Boletin.tsx         # Hito 2: render parametrizado (toma Boletin)
│   │   # Futuro: bloques individuales, formularios del editor
│   │
│   └── editor/                 # Hito 3: chrome del editor
│
├── lib/
│   ├── schema.ts               # Hito 2: tipos TypeScript del modelo
│   ├── seed.ts                 # Hito 2: defaults del REX 71/2026
│   └── storage.ts              # Hito 2: CRUD en archivos JSON
│
└── styles/
    └── uatta.css               # Sistema de diseño verbatim (Hito 1 ✅)
```

Decisiones clave:

- **Tailwind aislado al chrome**: para evitar que `@tailwind base` resetee
  los `<ul>`, `<h1..6>`, etc. del boletín. El render del boletín solo
  carga `uatta.css`.
- **Modelo de bloques tipados** (Hito 2): cada `SeccionBloque` es un union
  type discriminado por `tipo`. Patrones visuales genéricos (`tarjetas-grid`,
  `lista-check`, etc.) que se reusan entre boletines, no acoplados al
  contenido del REX 71.
- **Storage en archivos JSON**: simple, versionable, suficiente para uso
  interno. Si Vercel serverless lo limita (FS efímero en producción), se
  migra a un KV o Blob Storage.
- **Exportadores en `/api/export/*`** con Playwright + sparticuz para
  PDF/PNG (server) y `html2pdf.js` embebido en el HTML autocontenido
  (client).

---

## Confirmación del stack y hitos

Sin ajustes al brief. Stack y plan de 5 hitos confirmados como vienen:

1. **Hito 1** ✅ Scaffolding + design system. `/render/demo` pixel-idéntico
   a la referencia. Validado.
2. **Hito 2** Schema tipado + storage local + listado en `/`.
3. **Hito 3** Editor con cajas tipadas, drag-and-drop, autoguardado, publicar.
4. **Hito 4** Exportadores: PDF/PNG (server), HTML autocontenido, PPT.
5. **Hito 5** Deploy Vercel + tuning serverless de los exportadores.

---

## Setup local

```bash
npm install
npm run dev          # http://localhost:3000
npm run build
npm run typecheck
```

### Validación de fidelidad (manual)

1. `npm run dev`.
2. Copiar `referencia/boletin-sistema-diseno.html` a
   `public/_validation/reference.html` (gitignored).
3. Abrir `http://localhost:3000/render/demo` y
   `http://localhost:3000/_validation/reference.html` en pestañas
   contiguas, scroll sincronizado.
4. Verificar dimensiones con DevTools:
   `document.querySelector('.uatta-boletin').getBoundingClientRect()` debe
   dar el mismo `width` y `height` en ambos.

---

## Despliegue

Conectado a Vercel desde `main`: cada push genera deploy automático.

### Setup de storage en producción

Para que el editor funcione end-to-end en producción:

1. Vercel dashboard → tu proyecto → **Storage** tab → **Create
   Database** → **Blob**.
2. Nombre: `boletines`. Region: la que use el proyecto.
3. **Connect to Project** → seleccioná el proyecto. Vercel inyecta
   `BLOB_READ_WRITE_TOKEN` como env var automáticamente.
4. Trigger un redeploy (push cualquier cambio o "Redeploy" en el
   dashboard).

A partir de ahí, los drafts persisten entre cold starts. El home deja
de mostrar el banner amarillo.

---

## Estructura del repo

```
.
├── README.md
├── BRIEF.md                            # Especificación del producto
├── package.json, tsconfig.json, ...    # Configuración
├── src/                                # Código fuente
├── public/                             # Assets binarios extraídos
├── scripts/
│   └── extract-uatta-css.mjs           # Reproduce src/styles/uatta.css
└── referencia/
    ├── boletin-sistema-diseno.html     # Sistema de diseño (única fuente de verdad)
    └── boletin-uatta-2026-05-08.pdf    # Output de PDF esperado
```

`scripts/extract-uatta-css.mjs` reproduce `src/styles/uatta.css` desde la
referencia. Si la referencia cambia, correr `node
scripts/extract-uatta-css.mjs` y validar de nuevo.
