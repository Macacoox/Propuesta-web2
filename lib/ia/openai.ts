// Cliente mínimo de OpenAI (Chat Completions + Structured Outputs) con fetch.
// "server-only": si alguien importa este archivo desde un componente del
// navegador, la compilación falla. La clave nunca puede acabar en el cliente.
import "server-only"

import {
  ESQUEMA_PROPUESTA,
  INSTRUCCIONES,
  mensajeUsuario,
} from "./instrucciones"
import type { TipoFallo } from "../modo-pruebas"

const URL_OPENAI = "https://api.openai.com/v1/chat/completions"
const TIMEOUT_MS = 25_000

/** Error con un mensaje apto para mostrar al usuario y si tiene sentido reintentar. */
export class ErrorIA extends Error {
  constructor(
    public mensajeUsuario: string,
    public detalle: string,
    public reintentable = true
  ) {
    super(detalle)
  }
}

/**
 * Llama a OpenAI y devuelve el JSON de la propuesta (todavía SIN validar).
 * `simular` (solo modo pruebas) provoca un fallo REAL que recorre la misma
 * gestión de errores que uno de verdad: no es un atajo.
 */
export async function pedirPropuestaIA(
  cliente: string,
  descripcion: string,
  simular?: TipoFallo
): Promise<unknown> {
  const apiKey =
    simular === "clave"
      ? "sk-clave-simulada-invalida"
      : process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new ErrorIA(
      "El servicio de propuestas no está configurado.",
      "Falta OPENAI_API_KEY",
      false
    )
  }

  const url =
    simular === "red"
      ? "https://api.openai.invalid/v1/chat/completions"
      : URL_OPENAI
  const timeout = simular === "timeout" ? 1 : TIMEOUT_MS

  let res: Response
  try {
    if (simular === "saturado") {
      res = new Response(`{"error":{"message":"Rate limit (simulado)"}}`, {
        status: 429,
      })
    } else
      res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          temperature: 0.2, // respuestas estables y poco "creativas"
          max_tokens: 1500,
          messages: [
            { role: "system", content: INSTRUCCIONES },
            { role: "user", content: mensajeUsuario(cliente, descripcion) },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "propuesta",
              strict: true,
              schema: ESQUEMA_PROPUESTA,
            },
          },
        }),
        signal: AbortSignal.timeout(timeout),
      })
  } catch (e) {
    const timeout =
      e instanceof Error &&
      (e.name === "TimeoutError" || e.name === "AbortError")
    throw new ErrorIA(
      timeout
        ? "El servicio de IA está tardando demasiado. Inténtalo de nuevo."
        : "No se ha podido contactar con el servicio de IA. Inténtalo de nuevo.",
      `Fallo de red: ${String(e)}`
    )
  }

  if (!res.ok) {
    const cuerpo = await res.text().catch(() => "")
    const mensajes: Record<number, [string, boolean]> = {
      400: ["La petición al servicio de IA no es válida.", false],
      401: ["La clave de la API de OpenAI no es válida.", false],
      403: ["La cuenta de OpenAI no tiene acceso a este modelo.", false],
      404: ["El modelo de IA configurado no existe.", false],
      429: [
        "El servicio de IA está saturado o sin saldo. Espera un momento e inténtalo de nuevo.",
        true,
      ],
    }
    const [mensaje, reintentable] = mensajes[res.status] ?? [
      "El servicio de IA ha fallado. Inténtalo de nuevo.",
      true,
    ]
    throw new ErrorIA(
      mensaje,
      `OpenAI ${res.status}: ${cuerpo.slice(0, 500)}`,
      reintentable
    )
  }

  const data = await res.json().catch(() => null)
  const eleccion = data?.choices?.[0]
  const mensaje = eleccion?.message

  if (mensaje?.refusal) {
    throw new ErrorIA(
      "La IA no ha podido procesar esta solicitud. Prueba a reformularla.",
      `Refusal: ${mensaje.refusal}`,
      false
    )
  }
  if (eleccion?.finish_reason === "length") {
    throw new ErrorIA(
      "La respuesta de la IA se ha cortado. Inténtalo de nuevo.",
      "finish_reason=length"
    )
  }
  if (typeof mensaje?.content !== "string") {
    throw new ErrorIA(
      "La respuesta de la IA no es válida. Inténtalo de nuevo.",
      "Respuesta sin content"
    )
  }

  try {
    return JSON.parse(mensaje.content)
  } catch {
    throw new ErrorIA(
      "La respuesta de la IA no es válida. Inténtalo de nuevo.",
      `JSON inválido: ${mensaje.content.slice(0, 200)}`
    )
  }
}
