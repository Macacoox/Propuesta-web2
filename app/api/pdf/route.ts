// POST /api/pdf
// Recibe la selección FINAL revisada por el usuario, recalcula los importes
// en el servidor y devuelve el PDF. Así el PDF siempre refleja las tarifas
// programadas, aunque alguien manipule la petición desde el navegador.

import { createElement, type ReactElement } from "react"
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer"

import { PresupuestoPDF } from "@/lib/pdf/presupuesto-pdf"
import { calcularPresupuesto, formatoFechaCorta } from "@/lib/presupuesto"

export const maxDuration = 30

const texto = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : ""
const lista = (v: unknown) =>
  (Array.isArray(v) ? v : [])
    .map((x) => texto(x, 500))
    .filter(Boolean)
    .slice(0, 30)

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return Response.json(
      { error: "La petición no es un JSON válido." },
      { status: 400 }
    )
  }

  const cliente = texto(body.cliente, 100)
  if (!cliente)
    return Response.json(
      { error: "Falta el nombre del cliente." },
      { status: 400 }
    )

  const resultado = calcularPresupuesto(body.servicios)
  if (!resultado.ok)
    return Response.json(
      { error: resultado.error, id: resultado.id },
      { status: 400 }
    )

  const justificaciones: Record<string, string> = {}
  for (const s of Array.isArray(body.servicios) ? body.servicios : []) {
    const j = texto((s as { justificacion?: unknown })?.justificacion, 300)
    if (j) justificaciones[(s as { id: string }).id] = j
  }

  const ahora = new Date()
  const datos = {
    cliente,
    // Vercel funciona en UTC: fijamos la zona horaria para que la fecha sea la de España
    fecha: formatoFechaCorta(ahora),
    validoHasta: formatoFechaCorta(
      new Date(ahora.getTime() + 30 * 24 * 60 * 60 * 1000)
    ),
    numero: `P-${ahora.toISOString().slice(0, 10).replaceAll("-", "")}-${String(ahora.getTime()).slice(-4)}`,
    resumen: texto(body.resumen, 2000),
    presupuesto: resultado.presupuesto,
    justificaciones,
    dudas: lista(body.dudas),
    pendientes: lista(body.pendientes),
  }

  try {
    const pdf = await renderToBuffer(
      createElement(
        PresupuestoPDF,
        datos
      ) as unknown as ReactElement<DocumentProps>
    )
    const nombre = `presupuesto-${
      cliente
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "cliente"
    }.pdf`
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${nombre}"`,
        // Datos con los que se ha generado el PDF (permite verificarlo en las pruebas)
        "X-Presupuesto-Numero": datos.numero,
        "X-Presupuesto-Servicios": resultado.presupuesto.lineas
          .map((l) => `${l.id}x${l.cantidad}`)
          .join(","),
        "X-Presupuesto-Total": String(resultado.presupuesto.total),
      },
    })
  } catch (e) {
    console.error("Error generando el PDF:", e)
    return Response.json(
      { error: "No se ha podido generar el PDF. Inténtalo de nuevo." },
      { status: 500 }
    )
  }
}
