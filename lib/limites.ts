// Límites de la solicitud, compartidos por el formulario (feedback inmediato)
// y por el servidor (validación real: el cliente se puede saltar).

export const MAX_CLIENTE = 100
export const MIN_DESCRIPCION = 20
export const MAX_DESCRIPCION = 2000

export type CampoSolicitud = "cliente" | "descripcion"

/** Devuelve el primer error encontrado o null si la solicitud es válida. */
export function validarSolicitud(
  cliente: unknown,
  descripcion: unknown
): { campo: CampoSolicitud; error: string } | null {
  if (typeof cliente !== "string" || cliente.trim() === "") {
    return {
      campo: "cliente",
      error: "Indica el nombre del cliente o empresa.",
    }
  }
  if (cliente.trim().length > MAX_CLIENTE) {
    return {
      campo: "cliente",
      error: `El nombre no puede superar ${MAX_CLIENTE} caracteres.`,
    }
  }
  if (typeof descripcion !== "string" || descripcion.trim() === "") {
    return {
      campo: "descripcion",
      error: "La descripción del proyecto no puede estar vacía.",
    }
  }
  if (descripcion.trim().length < MIN_DESCRIPCION) {
    return {
      campo: "descripcion",
      error: `Describe tu proyecto con algo más de detalle (mínimo ${MIN_DESCRIPCION} caracteres).`,
    }
  }
  if (descripcion.trim().length > MAX_DESCRIPCION) {
    return {
      campo: "descripcion",
      error: `La descripción no puede superar ${MAX_DESCRIPCION} caracteres.`,
    }
  }
  return null
}
