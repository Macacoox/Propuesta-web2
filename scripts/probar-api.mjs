// Pruebas automáticas del apartado 6 contra la API.
//
// Uso:  npm run dev            (en otra terminal)
//       npm run probar         → prueba http://localhost:3000
//       npm run probar -- https://tu-app.vercel.app
//
// Hace llamadas REALES a OpenAI (unas 5-6 peticiones con gpt-4o-mini).
// Escribe el resultado en docs/resultados-pruebas.md.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs"

const BASE = (
  process.argv[2] ||
  process.env.BASE_URL ||
  "http://localhost:3000"
).replace(/\/$/, "")

// IDs del catálogo leídos del propio código (fuente de verdad)
const IDS_CATALOGO = [
  ...readFileSync("lib/catalogo.ts", "utf8").matchAll(/^\s*id: "([^"]+)"/gm),
].map((m) => m[1])

const resultados = []
let fallos = 0

function comprobar(caso, condicion, detalle) {
  resultados.push({ caso, ok: !!condicion, detalle })
  if (!condicion) fallos++
  console.log(`${condicion ? "✅" : "❌"} ${caso} — ${detalle}`)
}

async function post(ruta, cuerpo, cabeceras = {}) {
  const res = await fetch(BASE + ruta, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...cabeceras },
    body: JSON.stringify(cuerpo),
  })
  const tipo = res.headers.get("content-type") || ""
  const datos = tipo.includes("json")
    ? await res.json()
    : await res.arrayBuffer()
  return { status: res.status, datos, headers: res.headers }
}

const soloCatalogo = (servicios) =>
  servicios.every((s) => IDS_CATALOGO.includes(s.id))

console.log(`\nProbando ${BASE}\nCatálogo: ${IDS_CATALOGO.length} servicios\n`)

// ---------------------------------------------------------------- 1
{
  const r = await post("/api/propuesta", {
    cliente: "Restaurante La Prueba S.L.",
    descripcion:
      "Necesito una web para un restaurante. Quiero mostrar la carta, tener un formulario para solicitar reservas y ofrecer el contenido en dos idiomas.",
  })
  const ids = r.datos.servicios?.map((s) => s.id) ?? []
  comprobar(
    "1. Solicitud clara",
    r.status === 200 &&
      soloCatalogo(r.datos.servicios) &&
      ids.includes("carta-menu") &&
      ids.includes("formulario-reservas") &&
      r.datos.resumen,
    `HTTP ${r.status} · servicios: ${ids.join(", ") || "—"}`
  )
  globalThis.propuestaClara = r.datos
}

// ---------------------------------------------------------------- 2
{
  const r = await post("/api/propuesta", {
    cliente: "Juan Pérez",
    descripcion:
      "Quiero algo en internet para mi negocio, que sea moderno y con varias páginas.",
  })
  comprobar(
    "2. Solicitud ambigua",
    r.status === 200 && r.datos.dudas?.length > 0,
    `HTTP ${r.status} · ${r.datos.dudas?.length ?? 0} dudas: ${(r.datos.dudas ?? []).join(" | ")}`
  )
}

// ---------------------------------------------------------------- 3
{
  const r = await post("/api/propuesta", {
    cliente: "Gimnasio Ficticio",
    descripcion:
      "Necesito una web sencilla para mi gimnasio y además una aplicación móvil nativa para iOS y Android con notificaciones push.",
  })
  comprobar(
    "3. Servicio que no ofrecemos",
    r.status === 200 &&
      r.datos.noIncluidos?.length > 0 &&
      soloCatalogo(r.datos.servicios),
    `HTTP ${r.status} · pendiente de valorar: ${(r.datos.noIncluidos ?? []).join(" | ") || "—"} · ningún id inventado: ${soloCatalogo(r.datos.servicios ?? [])}`
  )
}

// ---------------------------------------------------------------- 4
for (const [nombre, descripcion] of [
  ["vacía", ""],
  ["solo espacios", "   \n  "],
  ["demasiado corta", "web"],
  ["demasiado larga", "a".repeat(2001)],
]) {
  const r = await post("/api/propuesta", { cliente: "Test S.L.", descripcion })
  comprobar(
    `4. Descripción ${nombre}`,
    r.status === 400 && r.datos.campo === "descripcion",
    `HTTP ${r.status} · "${r.datos.error}"`
  )
}

// ---------------------------------------------------------------- 5
{
  const cuerpo = {
    cliente: "Bar Ficticio",
    descripcion:
      "Una web para mi bar con la carta y un formulario de contacto.",
  }
  const esperados = { red: true, timeout: true, saturado: true, clave: false }
  for (const [tipo, reintentable] of Object.entries(esperados)) {
    const r = await post("/api/propuesta", cuerpo, { "x-simular-fallo": tipo })
    if (r.status === 200) {
      comprobar(
        `5. Fallo OpenAI (${tipo})`,
        false,
        "el servidor no tiene el modo pruebas activo (npm run dev o NEXT_PUBLIC_MODO_PRUEBAS=1)"
      )
      break
    }
    comprobar(
      `5. Fallo OpenAI (${tipo})`,
      r.status === 502 &&
        r.datos.error &&
        r.datos.reintentable === reintentable,
      `HTTP ${r.status} · "${r.datos.error}" · reintentable: ${r.datos.reintentable}`
    )
  }
  const reintento = await post("/api/propuesta", cuerpo)
  comprobar(
    "5. Reintento tras el fallo",
    reintento.status === 200,
    `HTTP ${reintento.status} · ${reintento.datos.servicios?.length ?? 0} servicios`
  )
}

// ---------------------------------------------------------------- 6
{
  const p = globalThis.propuestaClara
  if (!p?.servicios) {
    comprobar(
      "6. Modificación antes del PDF",
      false,
      "no hay propuesta del caso 1"
    )
  } else {
    // Quitamos un servicio propuesto, añadimos SEO y completamos cantidades
    const quitado = p.servicios.find((s) => s.id !== "web-basica")?.id
    const seleccion = p.servicios
      .filter((s) => s.id !== quitado)
      .map((s) => ({ ...s, cantidad: s.cantidad ?? 2 }))
    seleccion.push({ id: "seo-basico", justificacion: "", cantidad: null })

    const calc = await post("/api/presupuesto", {
      servicios: seleccion.map(({ id, cantidad }) => ({ id, cantidad })),
    })
    comprobar(
      "6. Cálculo de la selección modificada",
      calc.status === 200,
      `HTTP ${calc.status} · total ${calc.datos.total} €`
    )

    // Intento de manipulación: precios falsos en la petición del PDF
    const pdf = await post("/api/pdf", {
      cliente: "Restaurante La Prueba S.L.",
      resumen: p.resumen,
      servicios: seleccion.map((s) => ({ ...s, precio: 1, importe: 1 })),
      total: 1,
      dudas: p.dudas,
      pendientes: p.noIncluidos,
    })
    const servPdf = pdf.headers.get("x-presupuesto-servicios") ?? ""
    const totalPdf = Number(pdf.headers.get("x-presupuesto-total"))
    const esPdf =
      pdf.status === 200 &&
      Buffer.from(pdf.datos).subarray(0, 5).toString() === "%PDF-"
    if (esPdf) {
      mkdirSync("docs", { recursive: true })
      writeFileSync("docs/presupuesto-prueba.pdf", Buffer.from(pdf.datos))
    }
    comprobar(
      "6. PDF refleja la selección final",
      esPdf &&
        !servPdf.includes(`${quitado}x`) &&
        servPdf.includes("seo-basicox1"),
      `quitado "${quitado}", añadido "seo-basico" · en el PDF: ${servPdf}`
    )
    comprobar(
      "6. PDF con importes del servidor",
      esPdf && totalPdf === calc.datos.total && totalPdf !== 1,
      `total PDF ${totalPdf} € = total calculado ${calc.datos.total} € (se enviaron precios falsos de 1 €)`
    )
  }
}

// ---------------------------------------------------------------- informe
const fecha = new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" })
const md = [
  "# Resultados de las pruebas automáticas",
  "",
  `- Fecha: ${fecha}`,
  `- Servidor: ${BASE}`,
  `- Resultado: **${resultados.length - fallos}/${resultados.length} correctas**`,
  "",
  "Generado con `npm run probar`. Las propuestas se generan con llamadas reales a OpenAI,",
  "así que los textos pueden variar entre ejecuciones.",
  "",
  "| | Caso | Detalle |",
  "|---|---|---|",
  ...resultados.map(
    (r) =>
      `| ${r.ok ? "✅" : "❌"} | ${r.caso} | ${String(r.detalle).replaceAll("|", "/")} |`
  ),
  "",
].join("\n")
mkdirSync("docs", { recursive: true })
writeFileSync("docs/resultados-pruebas.md", md)

console.log(
  `\n${resultados.length - fallos}/${resultados.length} correctas → docs/resultados-pruebas.md\n`
)
process.exit(fallos ? 1 : 0)
