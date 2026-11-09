// POST /api/propuesta
// 1. Valida la solicitud del cliente.
// 2. Llama a OpenAI DESDE EL SERVIDOR (la clave está en process.env, nunca en el navegador).
// 3. Valida la respuesta del modelo antes de devolverla.
//
// Piezas:  lib/ia/instrucciones.ts      → prompt + esquema JSON
//          lib/ia/openai.ts             → llamada y gestión de errores
//          lib/ia/validar-propuesta.ts  → comprobación de IDs, cantidades y textos

import { ErrorIA, pedirPropuestaIA } from "@/lib/ia/openai"
import { validarPropuesta } from "@/lib/ia/validar-propuesta"
import { validarSolicitud } from "@/lib/limites"
import {
  CABECERA_SIMULAR_FALLO,
  MODO_PRUEBAS,
  TIPOS_FALLO,
  type TipoFallo,
} from "@/lib/modo-pruebas"

export const maxDuration = 30

export async function POST(request: Request) {
  // 1. Leer y validar la entrada
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json(
      { error: "La petición no es un JSON válido." },
      { status: 400 }
    )
  }

  const datos = (body ?? {}) as Record<string, unknown>

  // Vacío, solo espacios, demasiado corto o demasiado largo → 400 con el campo afectado
  const invalido = validarSolicitud(datos.cliente, datos.descripcion)
  if (invalido) return Response.json(invalido, { status: 400 })

  const cliente = (datos.cliente as string).trim()
  const descripcion = (datos.descripcion as string).trim()

  // 2. Llamar a OpenAI
  let bruta: unknown
  try {
    // Modo pruebas: el navegador puede pedir un fallo simulado (ignorado en producción)
    const pedido = request.headers.get(CABECERA_SIMULAR_FALLO)
    const simular =
      MODO_PRUEBAS && pedido && pedido in TIPOS_FALLO
        ? (pedido as TipoFallo)
        : undefined
    if (simular) console.warn(`[propuesta] Simulando fallo: ${simular}`)

    bruta = await pedirPropuestaIA(cliente, descripcion, simular)
  } catch (e) {
    if (e instanceof ErrorIA) {
      console.error("[propuesta] Error IA:", e.detalle)
      return Response.json(
        { error: e.mensajeUsuario, reintentable: e.reintentable },
        { status: 502 }
      )
    }
    console.error("[propuesta] Error inesperado:", e)
    return Response.json(
      { error: "Error inesperado. Inténtalo de nuevo.", reintentable: true },
      { status: 500 }
    )
  }

  // 3. Validar la respuesta del modelo
  const { avisos, ...propuesta } = validarPropuesta(bruta)
  if (avisos.length)
    console.warn(
      "[propuesta] Correcciones sobre la respuesta de la IA:",
      avisos
    )

  return Response.json({ cliente, ...propuesta })
}
