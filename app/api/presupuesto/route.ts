// POST /api/presupuesto
// Recibe { servicios: [{ id, cantidad }] } y devuelve los importes calculados
// con las tarifas del catálogo. El navegador nunca envía precios.

import { calcularPresupuesto } from "@/lib/presupuesto"

export async function POST(request: Request) {
  let body: { servicios?: unknown }
  try {
    body = await request.json()
  } catch {
    return Response.json(
      { error: "La petición no es un JSON válido." },
      { status: 400 }
    )
  }

  const resultado = calcularPresupuesto(body?.servicios)
  if (!resultado.ok)
    return Response.json(
      { error: resultado.error, id: resultado.id },
      { status: 400 }
    )

  return Response.json(resultado.presupuesto)
}
