// "Modo pruebas": permite simular un fallo de OpenAI para comprobar que la
// aplicación informa al usuario y deja reintentar (apartado 6 del ejercicio).
//
// Activo automáticamente en desarrollo (npm run dev). En producción (Vercel)
// solo si se define NEXT_PUBLIC_MODO_PRUEBAS=1. Se usa NEXT_PUBLIC_ para que
// tanto el servidor como el navegador sepan si está activo.

export const MODO_PRUEBAS =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_MODO_PRUEBAS === "1"

/** Cabecera que envía el navegador para pedir un fallo simulado. */
export const CABECERA_SIMULAR_FALLO = "x-simular-fallo"

export const TIPOS_FALLO = {
  red: "Sin conexión con OpenAI",
  timeout: "OpenAI tarda demasiado",
  saturado: "OpenAI saturado (429)",
  clave: "Clave de API no válida (401)",
} as const

export type TipoFallo = keyof typeof TIPOS_FALLO
