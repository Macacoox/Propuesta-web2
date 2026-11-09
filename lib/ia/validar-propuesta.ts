// Validación de la respuesta del modelo. NUNCA nos fiamos de lo que devuelve la IA:
// aunque el esquema sea estricto, aquí se comprueba todo antes de usarlo.

import { buscarServicio } from "../catalogo"

export type ServicioPropuesto = {
  id: string
  justificacion: string
  cantidad: number | null
}

export type PropuestaValidada = {
  resumen: string
  servicios: ServicioPropuesto[]
  dudas: string[]
  noIncluidos: string[]
  /** Correcciones aplicadas (para el log del servidor; útil en la defensa del ejercicio). */
  avisos: string[]
}

const MAX_TEXTO = 600
const MAX_ITEMS = 15

// Menciones a dinero o compromisos de entrega que el modelo no debe hacer
// (no basta con buscar "precio": "mostrar la carta con sus precios" es legítimo)
const PATRON_PRECIO =
  /\d[\d.,]*\s*(€|eur\b|euros?)|€\s*\d|\b(cuesta|costar[áa]|coste total|precio (total|final|aproximado|estimado)|importe total|tiene un coste)\b/i
const PATRON_PLAZO =
  /\b(en|plazo de|entrega en|listo en|tarda(rá)?)\s+\d+\s*(d[ií]as?|semanas?|mes(es)?)|\bplazo de entrega|\bfecha de entrega|\bgarantiza/i

const texto = (v: unknown) =>
  typeof v === "string" ? v.trim().slice(0, MAX_TEXTO) : ""

/** Elimina las frases que hablen de precios o plazos. */
function quitarCompromisos(t: string, campo: string, avisos: string[]) {
  const frases = t.split(/(?<=[.!?])\s+/)
  const limpias = frases.filter(
    (f) => !PATRON_PRECIO.test(f) && !PATRON_PLAZO.test(f)
  )
  if (limpias.length !== frases.length)
    avisos.push(`Eliminada mención a precio/plazo en ${campo}`)
  return limpias.join(" ").trim()
}

function listaTextos(v: unknown, campo: string, avisos: string[]) {
  if (!Array.isArray(v)) {
    if (v !== undefined) avisos.push(`"${campo}" no era una lista`)
    return []
  }
  const vistos = new Set<string>()
  return v
    .map(texto)
    .filter((t) => {
      const clave = t.toLowerCase()
      if (!t || vistos.has(clave) || /^pendiente de valorar\.?$/i.test(t))
        return false
      vistos.add(clave)
      return true
    })
    .slice(0, MAX_ITEMS)
}

/**
 * Recibe el JSON ya parseado de la IA y devuelve una propuesta segura:
 * - solo IDs que existen en el catálogo, sin duplicados
 * - cantidades enteras y positivas, y solo en servicios por unidad
 * - textos recortados y sin menciones a precios o plazos
 */
export function validarPropuesta(raw: unknown): PropuestaValidada {
  const avisos: string[] = []
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >

  const resumen = quitarCompromisos(texto(obj.resumen), "resumen", avisos)
  if (!resumen) avisos.push("Resumen vacío")

  const vistos = new Set<string>()
  const servicios: ServicioPropuesto[] = []
  for (const item of Array.isArray(obj.servicios) ? obj.servicios : []) {
    const s = (item ?? {}) as Record<string, unknown>
    const id = typeof s.id === "string" ? s.id : ""
    const servicio = buscarServicio(id)
    if (!servicio) {
      avisos.push(`Descartado id fuera del catálogo: "${String(s.id)}"`)
      continue
    }
    if (vistos.has(id)) {
      avisos.push(`Descartado id duplicado: "${id}"`)
      continue
    }
    vistos.add(id)

    let cantidad: number | null = null
    if (
      servicio.tipo === "por_unidad" &&
      typeof s.cantidad === "number" &&
      Number.isInteger(s.cantidad) &&
      s.cantidad > 0
    ) {
      cantidad = Math.min(s.cantidad, 100)
    } else if (s.cantidad !== null && s.cantidad !== undefined) {
      avisos.push(
        `Cantidad no válida ignorada en "${id}": ${String(s.cantidad)}`
      )
    }

    servicios.push({
      id,
      justificacion: quitarCompromisos(
        texto(s.justificacion),
        `justificación de ${id}`,
        avisos
      ),
      cantidad,
    })
  }

  return {
    resumen,
    servicios,
    dudas: listaTextos(obj.dudas, "dudas", avisos),
    noIncluidos: listaTextos(obj.noIncluidos, "noIncluidos", avisos),
    avisos,
  }
}
