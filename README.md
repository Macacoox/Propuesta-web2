# Propuesta-web2

**Presupuesta mi web**: el cliente describe con sus palabras la web que necesita, la IA (OpenAI) propone servicios **solo del catálogo**, el usuario los revisa y el servidor calcula el presupuesto y genera un **PDF**.

- Demo: _(enlace de Vercel)_
- Stack: Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · `@react-pdf/renderer` · API de OpenAI

## Flujo

1. **Solicitud** (`/presupuesto`): nombre del cliente y descripción del proyecto (validada en el servidor: no vacía, 20–2000 caracteres).
2. **Propuesta**: `POST /api/propuesta` llama a OpenAI **desde el servidor** con salida estructurada (JSON Schema estricto). Se validan los IDs contra el catálogo, se descartan precios o plazos inventados y lo que no está en el catálogo queda como *pendiente de valorar*.
3. **Revisión**: el usuario acepta, quita o añade servicios y completa las cantidades. `POST /api/presupuesto` calcula los importes con las tarifas programadas (el navegador nunca envía precios).
4. **Documento**: vista previa del contenido y `POST /api/pdf`, que recalcula los importes y genera el PDF.

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # y añade tu OPENAI_API_KEY
npm run dev                  # http://localhost:3000
```

### Variables de entorno

| Variable | Obligatoria | Descripción |
|---|---|---|
| `OPENAI_API_KEY` | Sí | Clave de la API de OpenAI. Nunca se sube al repositorio (`.env*` está en `.gitignore`). |
| `OPENAI_MODEL` | No | Modelo (por defecto `gpt-4o-mini`). |
| `NEXT_PUBLIC_MODO_PRUEBAS` | No | `1` para mostrar el panel que simula fallos de OpenAI en producción. En `npm run dev` está siempre activo. |

En Vercel: *Project → Settings → Environment Variables*.

## Pruebas

```bash
npm run dev      # terminal 1
npm run probar   # terminal 2: 6 casos del enunciado contra la API (llamadas reales a OpenAI)
```

Casos, pasos manuales y resultados en [`docs/PRUEBAS.md`](docs/PRUEBAS.md) y [`docs/resultados-pruebas.md`](docs/resultados-pruebas.md).

## Estructura

| Ruta | Contenido |
|---|---|
| `app/page.tsx` | Inicio (información y catálogo) |
| `app/presupuesto/page.tsx` | Herramienta para generar el presupuesto |
| `app/api/propuesta` · `presupuesto` · `pdf` | Endpoints del servidor |
| `lib/catalogo.ts` | Catálogo de servicios y tarifas (fuente única) |
| `lib/presupuesto.ts` | Cálculo de importes |
| `lib/ia/` | Instrucciones, llamada a OpenAI y validación de la respuesta |
| `lib/pdf/` | Plantilla del PDF y sus fuentes |
| `components/` | Interfaz |

## Librería de PDF

Se usa **@react-pdf/renderer**: plantilla con componentes React, texto real y seleccionable y generación en el servidor (compatible con Vercel). Alternativas valoradas: *pdfmake* (buena, plantillas JSON), *jsPDF* (posicionamiento manual; con `html2canvas` genera imágenes borrosas), *pdf-lib* (para modificar PDF, no para maquetar) y *Puppeteer* (Chromium de más de 100 MB, problemático en Vercel).

---

Proyecto académico · Desarrollo Web en Entorno Cliente. Todos los datos de ejemplo son ficticios.
