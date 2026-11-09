// Cálculo del presupuesto. Se ejecuta SOLO en el servidor (route handlers):
// el cliente envía ids + cantidades y aquí se aplican las tarifas del catálogo.

import { buscarServicio, type Servicio } from "@/lib/catalogo"

export const IVA = 0.21
export const MAX_CANTIDAD = 100

export type SeleccionServicio = { id: string; cantidad: number | null }

export type LineaPresupuesto = {
  id: string
  nombre: string
  descripcion: string
  tipo: Servicio["tipo"]
  unidad?: string
  cantidad: number
  precioUnitario: number
  importe: number
}

export type Presupuesto = {
  lineas: LineaPresupuesto[]
  baseImponible: number
  iva: number
  total: number
}

const redondear = (n: number) => Math.round(n * 100) / 100

/** Devuelve el presupuesto o un mensaje de error si la selección no es válida. */
export function calcularPresupuesto(
  seleccion: unknown
):
  | { ok: true; presupuesto: Presupuesto }
  | { ok: false; error: string; id?: string } {
  if (!Array.isArray(seleccion) || seleccion.length === 0) {
    return { ok: false, error: "Selecciona al menos un servicio." }
  }

  const vistos = new Set<string>()
  const lineas: LineaPresupuesto[] = []

  for (const item of seleccion) {
    const id = (item as SeleccionServicio)?.id
    const servicio = typeof id === "string" ? buscarServicio(id) : undefined
    if (!servicio)
      return {
        ok: false,
        id: String(id),
        error: `El servicio "${String(id)}" no existe en el catálogo.`,
      }
    if (vistos.has(servicio.id))
      return {
        ok: false,
        id: servicio.id,
        error: `El servicio "${servicio.nombre}" está repetido.`,
      }
    vistos.add(servicio.id)

    let cantidad = 1
    if (servicio.tipo === "por_unidad") {
      const c = (item as SeleccionServicio).cantidad
      if (
        typeof c !== "number" ||
        !Number.isInteger(c) ||
        c < 1 ||
        c > MAX_CANTIDAD
      ) {
        return {
          ok: false,
          id: servicio.id,
          error: `Indica cuántas unidades (${servicio.unidad}) necesitas de "${servicio.nombre}" (entre 1 y ${MAX_CANTIDAD}).`,
        }
      }
      cantidad = c
    }

    lineas.push({
      id: servicio.id,
      nombre: servicio.nombre,
      descripcion: servicio.descripcion,
      tipo: servicio.tipo,
      unidad: servicio.unidad,
      cantidad,
      precioUnitario: servicio.precio,
      importe: redondear(servicio.precio * cantidad),
    })
  }

  const baseImponible = redondear(lineas.reduce((s, l) => s + l.importe, 0))
  const iva = redondear(baseImponible * IVA)
  return {
    ok: true,
    presupuesto: {
      lineas,
      baseImponible,
      iva,
      total: redondear(baseImponible + iva),
    },
  }
}

/** Misma fecha en el PDF (servidor, UTC en Vercel) y en la vista previa (navegador). */
export const formatoFecha = (d: Date) =>
  d.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Madrid",
  })

/** "1 página", "3 páginas", "12 meses", "2 idiomas". */
export const unidadesTexto = (cantidad: number, unidad?: string) =>
  !unidad
    ? ""
    : cantidad === 1
      ? unidad
      : /[aeiouáéíóú]$/i.test(unidad)
        ? `${unidad}s`
        : `${unidad}es`

/** Fecha corta para fichas y tablas: "09/11/2026". */
export const formatoFechaCorta = (d: Date) =>
  d.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Madrid",
  })

export const formatoEuros = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(
    n
  )
