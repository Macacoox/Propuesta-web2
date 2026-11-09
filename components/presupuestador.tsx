"use client"

import { useEffect, useRef, useState } from "react"
import {
  AlertCircle,
  ChevronDown,
  Circle,
  CircleCheck,
  ListChecks,
  Undo2,
  ArrowLeft,
  Calculator,
  Check,
  Download,
  Eye,
  Loader2,
  MessageCircleQuestion,
  Minus,
  Package,
  Plus,
  RotateCcw,
  Sparkles,
  TriangleAlert,
  Trash2,
  X,
} from "lucide-react"

import { BarraNavegacion } from "@/components/barra-navegacion"
import { DocumentoPreview } from "@/components/documento-preview"
import { PanelPruebas } from "@/components/panel-pruebas"
import { PieSitio } from "@/components/pie-sitio"
import { Button } from "@/components/ui/button"
import { CATALOGO, buscarServicio } from "@/lib/catalogo"
import {
  MAX_CLIENTE,
  MAX_DESCRIPCION,
  MIN_DESCRIPCION,
  validarSolicitud,
  type CampoSolicitud,
} from "@/lib/limites"
import { CABECERA_SIMULAR_FALLO, type TipoFallo } from "@/lib/modo-pruebas"
import {
  formatoEuros,
  formatoFecha,
  IVA,
  MAX_CANTIDAD,
  unidadesTexto,
  type Presupuesto,
} from "@/lib/presupuesto"

/** Pistas para ayudar al cliente a escribir una buena descripción. */
const PISTAS = [
  {
    texto: "Tipo de negocio",
    patron:
      /restaurante|tienda|bar|cl[ií]nica|academia|empresa|negocio|despacho|hotel|gimnasio|asociaci[oó]n|portfolio/i,
  },
  {
    texto: "Secciones o páginas",
    patron:
      /p[aá]gina|secci[oó]n|carta|men[uú]|cat[aá]logo|galer[ií]a|blog|contacto/i,
  },
  {
    texto: "Funcionalidades",
    patron:
      /formulario|reserva|venta|vender|pago|tienda|registro|buscador|newsletter/i,
  },
  {
    texto: "Idiomas",
    patron: /idioma|ingl[eé]s|catal[aá]n|franc[eé]s|biling|multiling/i,
  },
]

type Linea = {
  id: string
  justificacion: string
  cantidad: number | null
  origen: "ia" | "manual"
  /** Los servicios sugeridos por la IA empiezan "pendiente": el usuario debe aceptarlos o quitarlos. */
  estado: "pendiente" | "aceptado"
}
type Paso = "solicitud" | "revision" | "vista"

const PASOS: { id: Paso; titulo: string }[] = [
  { id: "solicitud", titulo: "Describe tu proyecto" },
  { id: "revision", titulo: "Revisa y calcula" },
  { id: "vista", titulo: "Revisa y descarga" },
]

const EJEMPLOS = [
  {
    etiqueta: "Restaurante",
    cliente: "Restaurante La Prueba S.L.",
    texto:
      "Necesito una web para un restaurante. Quiero mostrar la carta, tener un formulario para solicitar reservas y ofrecer el contenido en dos idiomas.",
  },
  {
    etiqueta: "Tienda online",
    cliente: "Moda Ficticia",
    texto:
      "Quiero vender ropa por internet, con pagos con tarjeta. También me gustaría tener un blog y aparecer en Google.",
  },
  {
    etiqueta: "Idea vaga",
    cliente: "Juan Pérez",
    texto:
      "Quiero algo en internet para mi negocio, que sea moderno y con varias páginas.",
  },
]

const inputCls =
  "w-full rounded-xl border border-input bg-background px-4 py-3 text-[15px] outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15 aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/15"
const cardCls =
  "rounded-[24px] bg-card text-card-foreground shadow-[0_2px_20px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.04] dark:ring-white/10"

async function leerError(res: Response) {
  try {
    return (await res.json()).error ?? `Error ${res.status}`
  } catch {
    return `Error ${res.status}`
  }
}

/* ------------------------------------------------------------------ */
/* Piezas de interfaz                                                  */
/* ------------------------------------------------------------------ */

function Stepper({ paso }: { paso: Paso }) {
  const actual = PASOS.findIndex((p) => p.id === paso)
  return (
    <ol className="grid grid-cols-3 gap-2 sm:gap-4" aria-label="Progreso">
      {PASOS.map((p, i) => {
        const hecho = i < actual
        const activo = i === actual
        return (
          <li
            key={p.id}
            aria-current={activo ? "step" : undefined}
            className="flex flex-col gap-2"
          >
            <span
              className={`h-1 rounded-full transition-colors duration-500 ${hecho || activo ? "bg-primary" : "bg-border"}`}
            />
            <span
              className={`flex items-center gap-1.5 text-xs sm:text-sm ${activo ? "font-semibold" : "text-muted-foreground"}`}
            >
              {hecho && <Check className="size-3.5 text-primary" />}
              <span className="hidden sm:inline">{i + 1}.</span> {p.titulo}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function SelectorCantidad({
  valor,
  unidad,
  invalido,
  onChange,
}: {
  valor: number | null
  unidad?: string
  invalido: boolean
  onChange: (v: number | null) => void
}) {
  const v = valor ?? 0
  return (
    <div className="flex flex-col gap-1">
      <span
        className={`text-xs ${invalido ? "font-medium text-destructive" : "text-muted-foreground"}`}
      >
        {invalido
          ? `Indica nº de ${unidadesTexto(2, unidad)}`
          : `Nº de ${unidadesTexto(2, unidad)}`}
      </span>
      <div
        className={`flex h-9 items-center rounded-lg border bg-background ${invalido ? "border-destructive ring-3 ring-destructive/15" : "border-input"}`}
      >
        <button
          type="button"
          aria-label="Restar"
          className="flex h-full w-8 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
          disabled={v <= 1}
          onClick={() => onChange(Math.max(1, v - 1))}
        >
          <Minus className="size-3.5" />
        </button>
        <input
          type="number"
          min={1}
          max={MAX_CANTIDAD}
          aria-label={`Número de ${unidadesTexto(2, unidad)}`}
          aria-invalid={invalido}
          value={valor ?? ""}
          placeholder="–"
          onChange={(e) =>
            onChange(
              e.target.value === "" ? null : Math.trunc(Number(e.target.value))
            )
          }
          className="h-full w-12 [appearance:textfield] bg-transparent text-center text-sm font-medium outline-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          type="button"
          aria-label="Sumar"
          className="flex h-full w-8 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
          disabled={v >= MAX_CANTIDAD}
          onClick={() => onChange(Math.min(MAX_CANTIDAD, v + 1))}
        >
          <Plus className="size-3.5" />
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Componente principal                                                */
/* ------------------------------------------------------------------ */

export function Presupuestador() {
  const [paso, setPaso] = useState<Paso>("solicitud")
  const [cliente, setCliente] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [cargando, setCargando] = useState<null | "ia" | "calculo" | "pdf">(
    null
  )
  const [error, setError] = useState<{
    mensaje: string
    reintentar?: () => void
  } | null>(null)
  const [erroresCampo, setErroresCampo] = useState<
    Partial<Record<CampoSolicitud, string>>
  >({})

  const [resumen, setResumen] = useState("")
  const [lineas, setLineas] = useState<Linea[]>([])
  const [dudas, setDudas] = useState<string[]>([])
  const [pendientes, setPendientes] = useState<string[]>([])
  const [nuevaNota, setNuevaNota] = useState("")
  const [descartados, setDescartados] = useState<Linea[]>([])
  const [verCatalogo, setVerCatalogo] = useState(false)
  const [destacado, setDestacado] = useState<string | null>(null)

  // Modo pruebas: fallo simulado de un solo uso (ref para que «Reintentar» lea el valor actual)
  const [simularFallo, setSimularFallo] = useState<TipoFallo | "">("")
  const simularFalloRef = useRef<TipoFallo | "">("")
  function cambiarSimulacion(v: TipoFallo | "") {
    simularFalloRef.current = v
    setSimularFallo(v)
  }

  const [presupuesto, setPresupuesto] = useState<Presupuesto | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pestana, setPestana] = useState<"contenido" | "pdf">("contenido")
  const [revisado, setRevisado] = useState(false)
  const [descargado, setDescargado] = useState(false)

  // Liberar la URL del PDF anterior cuando cambia
  useEffect(() => () => void (pdfUrl && URL.revokeObjectURL(pdfUrl)), [pdfUrl])

  /** Cualquier cambio en la revisión invalida el cálculo y el PDF anteriores. */
  function invalidar() {
    setPresupuesto(null)
    setPdfUrl(null)
  }

  // ---------- 1. Pedir propuesta a la IA ----------
  async function pedirPropuesta() {
    setError(null)
    setErroresCampo({})
    // Validación previa en el navegador (feedback inmediato). El servidor vuelve a validar.
    const invalido = validarSolicitud(cliente, descripcion)
    if (invalido) {
      setErroresCampo({ [invalido.campo]: invalido.error })
      document.getElementById(`campo-${invalido.campo}`)?.focus()
      return
    }

    setCargando("ia")
    const simular = simularFalloRef.current
    if (simular) cambiarSimulacion("") // de un solo uso: el reintento irá normal
    try {
      const res = await fetch("/api/propuesta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(simular ? { [CABECERA_SIMULAR_FALLO]: simular } : {}),
        },
        body: JSON.stringify({ cliente, descripcion }),
      })
      if (res.status === 400) {
        // Error de validación del servidor: se muestra junto al campo afectado
        const data = await res.json().catch(() => ({}))
        if (data.campo === "cliente" || data.campo === "descripcion") {
          setErroresCampo({ [data.campo]: data.error })
          return
        }
        return setError({ mensaje: data.error ?? "Solicitud no válida." })
      }
      if (!res.ok) {
        // El servidor indica si tiene sentido reintentar (timeout, 429...) o no (clave inválida...)
        const data = await res.json().catch(() => ({}))
        return setError({
          mensaje: data.error ?? `Error ${res.status}`,
          reintentar: data.reintentable !== false ? pedirPropuesta : undefined,
        })
      }
      const data = await res.json()
      setResumen(data.resumen)
      setLineas(
        data.servicios.map(
          (s: Pick<Linea, "id" | "justificacion" | "cantidad">) => ({
            ...s,
            origen: "ia",
            estado: "pendiente",
          })
        )
      )
      setDescartados([])
      setVerCatalogo(data.servicios.length === 0)
      setDudas(data.dudas)
      setPendientes(data.noIncluidos)
      invalidar()
      setPaso("revision")
    } catch {
      setError({
        mensaje: "No se ha podido conectar con el servidor.",
        reintentar: pedirPropuesta,
      })
    } finally {
      setCargando(null)
    }
  }

  // ---------- 2. Edición de la selección ----------
  function aceptarLinea(id: string) {
    setLineas((ls) =>
      ls.map((l) => (l.id === id ? { ...l, estado: "aceptado" } : l))
    )
    invalidar()
  }
  function aceptarTodos() {
    setLineas((ls) => ls.map((l) => ({ ...l, estado: "aceptado" })))
    invalidar()
  }
  /** Quitar no borra: el servicio pasa a "descartados" y se puede recuperar. */
  function quitarLinea(id: string) {
    const linea = lineas.find((l) => l.id === id)
    if (!linea) return
    setLineas((ls) => ls.filter((l) => l.id !== id))
    setDescartados((d) => [linea, ...d.filter((x) => x.id !== id)])
    invalidar()
  }
  function recuperarLinea(id: string) {
    const linea = descartados.find((l) => l.id === id)
    if (!linea) return
    setDescartados((d) => d.filter((l) => l.id !== id))
    setLineas((ls) => [...ls, { ...linea, estado: "aceptado" }])
    invalidar()
  }
  function cambiarCantidad(id: string, n: number | null) {
    setLineas((ls) =>
      ls.map((l) =>
        l.id === id
          ? { ...l, cantidad: n !== null && Number.isFinite(n) ? n : null }
          : l
      )
    )
    invalidar()
  }
  function anadirServicio(id: string) {
    if (!id || lineas.some((l) => l.id === id)) return
    // Lo que añade el usuario ya cuenta como aceptado
    setLineas((ls) => [
      ...ls,
      {
        id,
        justificacion: "",
        cantidad: null,
        origen: "manual",
        estado: "aceptado",
      },
    ])
    setDescartados((d) => d.filter((l) => l.id !== id))
    invalidar()
  }
  function anadirNota() {
    if (!nuevaNota.trim()) return
    setDudas((d) => [...d, nuevaNota.trim()])
    setNuevaNota("")
    invalidar()
  }

  const faltanCantidades = lineas.filter((l) => {
    const s = buscarServicio(l.id)
    return (
      s?.tipo === "por_unidad" &&
      (l.cantidad === null || l.cantidad < 1 || l.cantidad > MAX_CANTIDAD)
    )
  })
  const porRevisar = lineas.filter((l) => l.estado === "pendiente")
  const disponibles = CATALOGO.filter(
    (s) =>
      !lineas.some((l) => l.id === s.id) &&
      !descartados.some((l) => l.id === s.id)
  )
  const puedeCalcular =
    lineas.length > 0 &&
    porRevisar.length === 0 &&
    faltanCantidades.length === 0
  const justificaciones = Object.fromEntries(
    lineas.filter((l) => l.justificacion).map((l) => [l.id, l.justificacion])
  )

  // ---------- 3. Cálculo en el servidor ----------
  async function calcular() {
    setError(null)
    setCargando("calculo")
    try {
      const res = await fetch("/api/presupuesto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          servicios: lineas.map(({ id, cantidad }) => ({ id, cantidad })),
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError({ mensaje: data.error ?? `Error ${res.status}` })
        // El servidor indica qué partida falla: la resaltamos y la llevamos a la vista
        if (data.id) {
          setDestacado(data.id)
          document
            .getElementById(`servicio-${data.id}`)
            ?.scrollIntoView({ behavior: "smooth", block: "center" })
          setTimeout(() => setDestacado(null), 2500)
        }
        return
      }
      setPresupuesto(await res.json())
    } catch {
      setError({
        mensaje: "No se ha podido conectar con el servidor.",
        reintentar: calcular,
      })
    } finally {
      setCargando(null)
    }
  }

  // ---------- 4. Revisión del documento y PDF ----------
  function irARevisarDocumento() {
    setRevisado(false)
    setDescargado(false)
    setPestana("contenido")
    setPaso("vista")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  /** Genera el PDF en el servidor (recalcula importes) y lo guarda para no repetir la petición. */
  async function obtenerPdf(): Promise<string | null> {
    if (pdfUrl) return pdfUrl
    setError(null)
    setCargando("pdf")
    try {
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente,
          resumen,
          servicios: lineas.map(({ id, cantidad, justificacion }) => ({
            id,
            cantidad,
            justificacion,
          })),
          dudas,
          pendientes,
        }),
      })
      if (!res.ok) {
        setError({ mensaje: await leerError(res), reintentar: obtenerPdf })
        return null
      }
      const url = URL.createObjectURL(await res.blob())
      setPdfUrl(url)
      return url
    } catch {
      setError({
        mensaje: "No se ha podido generar el PDF.",
        reintentar: obtenerPdf,
      })
      return null
    } finally {
      setCargando(null)
    }
  }

  async function verPdf() {
    setPestana("pdf")
    await obtenerPdf()
  }

  async function descargarPdf() {
    const url = await obtenerPdf()
    if (!url) return
    const a = document.createElement("a")
    a.href = url
    a.download = nombreArchivo
    document.body.appendChild(a)
    a.click()
    a.remove()
    setDescargado(true)
  }

  function empezarDeNuevo() {
    window.scrollTo({ top: 0 })
    setPaso("solicitud")
    setError(null)
    setLineas([])
    setDescartados([])
    setDudas([])
    setPendientes([])
    setResumen("")
    invalidar()
  }

  const nombreArchivo = `presupuesto-${
    cliente
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") || "cliente"
  }.pdf`

  return (
    <div className="relative min-h-svh bg-background">
      <BarraNavegacion actual="presupuesto" />

      <main
        className={`mx-auto flex max-w-6xl flex-col gap-6 px-4 pt-6 sm:pt-8 ${paso === "revision" ? "pb-32 lg:pb-12" : "pb-12"}`}
      >
        <Stepper paso={paso} />

        {error && (
          <div
            role="alert"
            className="flex animate-in items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive fade-in slide-in-from-top-1"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <p className="flex-1 font-medium">{error.mensaje}</p>
            {error.reintentar && (
              <Button
                size="sm"
                variant="outline"
                onClick={error.reintentar}
                disabled={cargando !== null}
              >
                {cargando ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <RotateCcw />
                )}{" "}
                Reintentar
              </Button>
            )}
            <button
              aria-label="Cerrar"
              onClick={() => setError(null)}
              className="opacity-70 hover:opacity-100"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* =========================== PASO 1 =========================== */}
        {paso === "solicitud" && (
          <div className="grid animate-in items-start gap-6 fade-in lg:grid-cols-[1fr_340px]">
            <div className="flex min-w-0 flex-col gap-5">
              <header>
                <h1 className="text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">
                  Cuéntanos tu proyecto.
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Con tus palabras. Cuanto más detalle, mejor será la propuesta.
                </p>
              </header>
              <form
                noValidate
                className={`${cardCls} relative flex flex-col gap-5 p-5 sm:p-7`}
                onSubmit={(e) => {
                  e.preventDefault()
                  pedirPropuesta()
                }}
              >
                <fieldset
                  disabled={cargando !== null}
                  className="flex flex-col gap-5 disabled:opacity-70"
                >
                  {/* Cliente */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="campo-cliente"
                      className="text-sm font-medium"
                    >
                      Cliente o empresa{" "}
                      <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="campo-cliente"
                      className={inputCls}
                      value={cliente}
                      maxLength={MAX_CLIENTE}
                      autoComplete="organization"
                      aria-invalid={!!erroresCampo.cliente}
                      aria-describedby={
                        erroresCampo.cliente ? "error-cliente" : undefined
                      }
                      onChange={(e) => {
                        setCliente(e.target.value)
                        if (erroresCampo.cliente)
                          setErroresCampo((x) => ({
                            ...x,
                            cliente: undefined,
                          }))
                      }}
                      placeholder="Ej.: Restaurante La Prueba S.L."
                    />
                    {erroresCampo.cliente && (
                      <p
                        id="error-cliente"
                        className="flex items-center gap-1.5 text-xs font-medium text-destructive"
                      >
                        <AlertCircle className="size-3.5" />{" "}
                        {erroresCampo.cliente}
                      </p>
                    )}
                  </div>

                  {/* Descripción */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="campo-descripcion"
                      className="text-sm font-medium"
                    >
                      ¿Qué necesitas?{" "}
                      <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      id="campo-descripcion"
                      className={`${inputCls} min-h-40 resize-y leading-relaxed`}
                      value={descripcion}
                      maxLength={MAX_DESCRIPCION}
                      aria-invalid={!!erroresCampo.descripcion}
                      aria-describedby="ayuda-descripcion"
                      onChange={(e) => {
                        setDescripcion(e.target.value)
                        if (erroresCampo.descripcion)
                          setErroresCampo((x) => ({
                            ...x,
                            descripcion: undefined,
                          }))
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                          e.preventDefault()
                          pedirPropuesta()
                        }
                      }}
                      placeholder="Ej.: Necesito una web para mi restaurante. Quiero mostrar la carta, que los clientes puedan reservar mesa y que esté en castellano e inglés."
                    />

                    {/* Barra de longitud */}
                    {(() => {
                      const len = descripcion.trim().length
                      const pct = Math.min(100, (len / MAX_DESCRIPCION) * 100)
                      const corto = len > 0 && len < MIN_DESCRIPCION
                      const casiLleno = len > MAX_DESCRIPCION * 0.9
                      return (
                        <div
                          id="ayuda-descripcion"
                          className="flex flex-col gap-1.5"
                        >
                          <div className="h-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className={`h-full rounded-full transition-all ${corto || casiLleno ? "bg-amber-500" : "bg-primary"}`}
                              style={{
                                width: `${Math.max(pct, len > 0 ? 2 : 0)}%`,
                              }}
                            />
                          </div>
                          <div className="flex items-start justify-between gap-3 text-xs">
                            {erroresCampo.descripcion ? (
                              <p className="flex items-center gap-1.5 font-medium text-destructive">
                                <AlertCircle className="size-3.5 shrink-0" />{" "}
                                {erroresCampo.descripcion}
                              </p>
                            ) : (
                              <p className="text-muted-foreground">
                                {corto
                                  ? `Faltan ${MIN_DESCRIPCION - len} caracteres como mínimo.`
                                  : "Ctrl + Enter para enviar"}
                              </p>
                            )}
                            <span
                              className={`shrink-0 tabular-nums ${casiLleno ? "text-amber-600" : "text-muted-foreground"}`}
                            >
                              {descripcion.length}/{MAX_DESCRIPCION}
                            </span>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </fieldset>

                <div className="flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-muted-foreground">
                    <span className="text-destructive">*</span> Campos
                    obligatorios
                  </p>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={cargando !== null}
                    className="h-11 px-5 text-base"
                  >
                    {cargando === "ia" ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Sparkles />
                    )}
                    {cargando === "ia"
                      ? "Analizando tu solicitud…"
                      : "Obtener propuesta"}
                  </Button>
                </div>

                {cargando === "ia" && (
                  <div
                    role="status"
                    className="absolute inset-0 flex animate-in flex-col items-center justify-center gap-3 rounded-[24px] bg-card/85 backdrop-blur-sm fade-in"
                  >
                    <span className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                      <Sparkles className="size-6 animate-pulse text-primary" />
                    </span>
                    <p className="font-medium">Analizando tu solicitud…</p>
                    <p className="text-sm text-muted-foreground">
                      Buscando los servicios de nuestro catálogo que encajan
                    </p>
                  </div>
                )}
              </form>
            </div>

            {/* Columna de ayuda: ejemplos, pistas y modo pruebas */}
            <aside className="flex flex-col gap-4 lg:sticky lg:top-16">
              <div className={`${cardCls} p-5`}>
                <h2 className="text-sm font-semibold">Probar con un ejemplo</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Datos ficticios. Rellenan el formulario.
                </p>
                <ul className="mt-3 flex flex-col gap-2">
                  {EJEMPLOS.map((e) => (
                    <li key={e.etiqueta}>
                      <button
                        type="button"
                        disabled={cargando !== null}
                        onClick={() => {
                          setCliente(e.cliente)
                          setDescripcion(e.texto)
                          setErroresCampo({})
                        }}
                        className="w-full rounded-xl border px-3 py-2 text-left transition-colors hover:border-primary/50 hover:bg-primary/5 disabled:opacity-50"
                      >
                        <span className="block text-sm font-medium">
                          {e.etiqueta}
                        </span>
                        <span className="line-clamp-1 text-xs text-muted-foreground">
                          {e.texto}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`${cardCls} p-5`}>
                <h2 className="text-sm font-semibold">
                  Para una mejor propuesta, menciona
                </h2>
                <ul className="mt-3 flex flex-col gap-2 text-sm">
                  {PISTAS.map((p) => {
                    const ok = p.patron.test(descripcion)
                    return (
                      <li
                        key={p.texto}
                        className={`flex items-center gap-2 transition-colors ${ok ? "" : "text-muted-foreground"}`}
                      >
                        {ok ? (
                          <CircleCheck className="size-4 shrink-0 text-primary" />
                        ) : (
                          <Circle className="size-4 shrink-0" />
                        )}
                        {p.texto}
                      </li>
                    )
                  })}
                </ul>
              </div>

              <PanelPruebas valor={simularFallo} onChange={cambiarSimulacion} />
            </aside>
          </div>
        )}

        {/* =========================== PASO 2 =========================== */}
        {paso === "revision" && (
          <>
            <header className="max-w-3xl animate-in fade-in">
              <h1 className="text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">
                Revisa tu propuesta.
              </h1>
              <p className="mt-2 text-muted-foreground">
                Para {cliente.trim().replace(/\.$/, "")}: acepta, quita o añade
                servicios y calcula el presupuesto.
              </p>
            </header>
            <div className="grid animate-in items-start gap-6 fade-in lg:grid-cols-[1fr_380px]">
              <div className="flex flex-col gap-5">
                {/* Resumen */}
                <section className={`${cardCls} p-4`}>
                  <div className="mb-2 flex items-center justify-between">
                    <h2 className="font-semibold">Resumen del proyecto</h2>
                    <span className="text-xs text-muted-foreground">
                      {cliente}
                    </span>
                  </div>
                  <textarea
                    className={`${inputCls} field-sizing-content min-h-0 resize-none py-2.5 leading-relaxed`}
                    value={resumen}
                    maxLength={2000}
                    onChange={(e) => {
                      setResumen(e.target.value)
                      invalidar()
                    }}
                  />
                </section>

                {/* Servicios */}
                <section className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-end justify-between gap-2">
                    <h2 className="text-lg font-semibold">
                      Servicios propuestos
                    </h2>
                    {porRevisar.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={aceptarTodos}
                      >
                        <ListChecks /> Aceptar todos ({porRevisar.length})
                      </Button>
                    )}
                  </div>

                  {lineas.length === 0 && (
                    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                      <Package className="size-8 opacity-40" />
                      No hay servicios seleccionados. Añade alguno del catálogo.
                    </div>
                  )}

                  {lineas.map((l) => {
                    const s = buscarServicio(l.id)!
                    const falta = faltanCantidades.includes(l)
                    const pendiente = l.estado === "pendiente"
                    return (
                      <article
                        key={l.id}
                        id={`servicio-${l.id}`}
                        className={`${cardCls} flex flex-col gap-3 p-4 transition-all lg:flex-row lg:items-center lg:gap-5 ${
                          pendiente
                            ? "border-dashed border-primary/40 bg-primary/[0.02]"
                            : ""
                        } ${falta ? "border-destructive/50" : ""} ${destacado === l.id ? "ring-4 ring-destructive/30" : ""}`}
                      >
                        <div className="flex min-w-0 flex-1 gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <h3 className="font-medium">{s.nombre}</h3>
                              <span className="text-sm text-muted-foreground tabular-nums">
                                · {formatoEuros(s.precio)}
                                {s.unidad ? ` / ${s.unidad}` : ""}
                              </span>
                              {pendiente ? (
                                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                                  Pendiente de revisar
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                                  <Check className="size-3" /> Aceptado
                                </span>
                              )}
                              {l.origen === "ia" ? (
                                <span
                                  title="Sugerido por la IA"
                                  aria-label="Sugerido por la IA"
                                  className="text-primary"
                                >
                                  <Sparkles className="size-3.5" />
                                </span>
                              ) : (
                                <span className="text-[11px] text-muted-foreground">
                                  Añadido por ti
                                </span>
                              )}
                            </div>
                            <p
                              className="mt-0.5 line-clamp-1 text-sm text-muted-foreground"
                              title={s.descripcion}
                            >
                              {s.descripcion}
                            </p>
                            {l.justificacion && (
                              <p className="mt-1.5 border-l-2 border-primary/40 pl-2.5 text-[13px] text-foreground/80 italic">
                                <span className="font-medium text-primary not-italic">
                                  ¿Por qué?{" "}
                                </span>
                                {l.justificacion}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-end justify-between gap-3 border-t pt-3 lg:shrink-0 lg:flex-nowrap lg:items-center lg:border-t-0 lg:pt-0">
                          <div className="flex items-end gap-4">
                            {s.tipo === "por_unidad" && (
                              <SelectorCantidad
                                valor={l.cantidad}
                                unidad={s.unidad}
                                invalido={falta}
                                onChange={(n) => cambiarCantidad(l.id, n)}
                              />
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="lg"
                              aria-label={`Quitar ${s.nombre}`}
                              title="Quitar"
                              onClick={() => quitarLinea(l.id)}
                              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 />
                              <span className="lg:sr-only">Quitar</span>
                            </Button>
                            {pendiente && (
                              <Button
                                size="lg"
                                onClick={() => aceptarLinea(l.id)}
                              >
                                <Check /> Aceptar
                              </Button>
                            )}
                          </div>
                        </div>
                      </article>
                    )
                  })}

                  {/* Descartados: se pueden recuperar */}
                  {descartados.length > 0 && (
                    <div className="flex flex-col gap-2 rounded-2xl bg-muted/40 p-4">
                      <p className="text-xs font-medium text-muted-foreground">
                        Servicios quitados
                      </p>
                      <ul className="flex flex-wrap gap-2">
                        {descartados.map((l) => (
                          <li key={l.id}>
                            <button
                              onClick={() => recuperarLinea(l.id)}
                              className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                            >
                              <span className="line-through">
                                {buscarServicio(l.id)!.nombre}
                              </span>
                              <Undo2 className="size-3" /> Recuperar
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Catálogo para añadir servicios */}
                  {disponibles.length > 0 && (
                    <div className="rounded-2xl border border-dashed">
                      <button
                        onClick={() => setVerCatalogo((v) => !v)}
                        aria-expanded={verCatalogo}
                        className="flex w-full items-center justify-between gap-2 p-4 text-sm font-medium"
                      >
                        <span className="flex items-center gap-2">
                          <Plus className="size-4 text-primary" /> Añadir otro
                          servicio del catálogo
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                            {disponibles.length}
                          </span>
                        </span>
                        <ChevronDown
                          className={`size-4 transition-transform ${verCatalogo ? "rotate-180" : ""}`}
                        />
                      </button>
                      {verCatalogo && (
                        <ul className="grid animate-in gap-2 px-4 pb-4 fade-in sm:grid-cols-2">
                          {disponibles.map((s) => (
                            <li
                              key={s.id}
                              className="flex flex-col gap-2 rounded-xl border bg-card p-3"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-medium">
                                  {s.nombre}
                                </p>
                                <span className="shrink-0 text-xs font-medium tabular-nums">
                                  {formatoEuros(s.precio)}
                                  {s.unidad ? (
                                    <span className="font-normal text-muted-foreground">
                                      {" "}
                                      / {s.unidad}
                                    </span>
                                  ) : null}
                                </span>
                              </div>
                              <p className="line-clamp-2 flex-1 text-xs text-muted-foreground">
                                {s.descripcion}
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="self-start"
                                onClick={() => anadirServicio(s.id)}
                              >
                                <Plus /> Añadir
                              </Button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </section>

                {/* Aclaraciones */}
                <section className={`${cardCls} flex flex-col gap-4 p-5`}>
                  <h2 className="flex items-center gap-2 font-semibold">
                    <MessageCircleQuestion className="size-4 text-primary" />{" "}
                    Aclaraciones y aspectos pendientes
                  </h2>

                  {pendientes.length > 0 && (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
                      <p className="mb-2 flex items-center gap-2 font-medium text-amber-700 dark:text-amber-400">
                        <TriangleAlert className="size-4" /> Fuera de catálogo ·
                        pendiente de valorar
                      </p>
                      <ul className="flex flex-col gap-1.5">
                        {pendientes.map((p, i) => (
                          <li
                            key={i}
                            className="flex items-start justify-between gap-2"
                          >
                            <span>{p}</span>
                            <button
                              aria-label="Eliminar"
                              className="opacity-60 hover:opacity-100"
                              onClick={() => (
                                setPendientes((x) =>
                                  x.filter((_, j) => j !== i)
                                ),
                                invalidar()
                              )}
                            >
                              <X className="size-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {dudas.length > 0 ? (
                    <ul className="flex flex-col gap-2 text-sm">
                      {dudas.map((d, i) => (
                        <li
                          key={i}
                          className="group flex items-start justify-between gap-2 rounded-lg bg-muted/60 px-3 py-2.5"
                        >
                          <span>{d}</span>
                          <button
                            aria-label="Eliminar"
                            className="opacity-50 hover:opacity-100"
                            onClick={() => (
                              setDudas((x) => x.filter((_, j) => j !== i)),
                              invalidar()
                            )}
                          >
                            <X className="size-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    pendientes.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No hay dudas pendientes.
                      </p>
                    )
                  )}

                  <div className="flex gap-2">
                    <input
                      className={inputCls}
                      value={nuevaNota}
                      maxLength={500}
                      onChange={(e) => setNuevaNota(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && anadirNota()}
                      placeholder="Añadir una aclaración para el PDF…"
                    />
                    <Button
                      variant="outline"
                      size="icon-lg"
                      aria-label="Añadir aclaración"
                      onClick={anadirNota}
                      disabled={!nuevaNota.trim()}
                    >
                      <Plus />
                    </Button>
                  </div>
                </section>
              </div>

              {/* Panel lateral: presupuesto */}
              <aside className="flex flex-col gap-3 lg:sticky lg:top-20">
                <div className={`${cardCls} overflow-hidden`}>
                  <div className="border-b bg-muted/40 px-5 py-4">
                    <h2 className="flex items-center gap-2 font-semibold">
                      <Calculator className="size-4 text-primary" /> Tu
                      presupuesto
                    </h2>
                  </div>

                  <div className="flex flex-col gap-4 p-5">
                    {!presupuesto ? (
                      <>
                        {/* Lista de requisitos para poder calcular */}
                        <ul className="flex flex-col gap-2 text-sm">
                          {[
                            {
                              ok: lineas.length > 0,
                              texto:
                                lineas.length > 0
                                  ? `${lineas.length} servicios seleccionados`
                                  : "Selecciona al menos un servicio",
                            },
                            {
                              ok: porRevisar.length === 0,
                              texto:
                                porRevisar.length === 0
                                  ? "Sugerencias revisadas"
                                  : `${porRevisar.length} ${porRevisar.length === 1 ? "sugerencia" : "sugerencias"} por aceptar o quitar`,
                            },
                            {
                              ok: faltanCantidades.length === 0,
                              texto:
                                faltanCantidades.length === 0
                                  ? "Cantidades completas"
                                  : `Falta la cantidad de: ${faltanCantidades.map((l) => buscarServicio(l.id)!.nombre).join(", ")}`,
                            },
                          ].map((r) => (
                            <li
                              key={r.texto}
                              className={`flex items-start gap-2 ${r.ok ? "" : "text-muted-foreground"}`}
                            >
                              {r.ok ? (
                                <CircleCheck className="mt-px size-4 shrink-0 text-primary" />
                              ) : (
                                <Circle className="mt-px size-4 shrink-0" />
                              )}
                              {r.texto}
                            </li>
                          ))}
                        </ul>

                        <Button
                          size="lg"
                          className="h-11 w-full text-base"
                          onClick={calcular}
                          disabled={cargando !== null || !puedeCalcular}
                        >
                          {cargando === "calculo" ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            <Calculator />
                          )}
                          Confirmar y calcular
                        </Button>
                        <p className="text-center text-xs text-muted-foreground">
                          Los importes se calculan en nuestro servidor con las
                          tarifas vigentes.
                        </p>
                      </>
                    ) : (
                      <div className="flex animate-in flex-col gap-4 fade-in">
                        <ul className="flex flex-col divide-y text-sm">
                          {presupuesto.lineas.map((l) => (
                            <li
                              key={l.id}
                              className="flex justify-between gap-3 py-2 first:pt-0"
                            >
                              <div className="min-w-0">
                                <p className="truncate">{l.nombre}</p>
                                <p className="text-xs text-muted-foreground tabular-nums">
                                  {l.cantidad} ×{" "}
                                  {formatoEuros(l.precioUnitario)}
                                </p>
                              </div>
                              <span className="shrink-0 font-medium tabular-nums">
                                {formatoEuros(l.importe)}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <dl className="flex flex-col gap-1 border-t pt-3 text-sm tabular-nums">
                          <div className="flex justify-between text-muted-foreground">
                            <dt>Base imponible</dt>
                            <dd>{formatoEuros(presupuesto.baseImponible)}</dd>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <dt>IVA ({Math.round(IVA * 100)}%)</dt>
                            <dd>{formatoEuros(presupuesto.iva)}</dd>
                          </div>
                          <div className="mt-2 flex items-baseline justify-between">
                            <dt className="font-semibold">Total</dt>
                            <dd className="text-2xl font-bold text-primary">
                              {formatoEuros(presupuesto.total)}
                            </dd>
                          </div>
                        </dl>
                        <Button
                          size="lg"
                          className="h-11 w-full text-base"
                          onClick={irARevisarDocumento}
                          disabled={cargando !== null}
                        >
                          <Eye /> Revisar documento
                        </Button>
                        <p className="text-center text-xs text-muted-foreground">
                          Si modificas algo, tendrás que volver a calcular.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  onClick={empezarDeNuevo}
                  className="self-center text-muted-foreground"
                >
                  <RotateCcw /> Empezar una nueva solicitud
                </Button>
              </aside>
            </div>
          </>
        )}

        {/* Barra fija inferior en móvil: en pantallas pequeñas el panel lateral
            queda al final de la página, así que la acción principal va aquí */}
        {paso === "revision" && (
          <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur lg:hidden">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
              <div className="min-w-0 text-sm">
                {presupuesto ? (
                  <>
                    <p className="text-xs text-muted-foreground">
                      Total (IVA incl.)
                    </p>
                    <p className="text-lg font-bold text-primary tabular-nums">
                      {formatoEuros(presupuesto.total)}
                    </p>
                  </>
                ) : (
                  <p
                    className={`truncate ${puedeCalcular ? "font-medium" : "text-muted-foreground"}`}
                  >
                    {lineas.length === 0
                      ? "Añade al menos un servicio"
                      : porRevisar.length > 0
                        ? `${porRevisar.length} ${porRevisar.length === 1 ? "sugerencia" : "sugerencias"} por revisar`
                        : faltanCantidades.length > 0
                          ? `Falta la cantidad de ${faltanCantidades.length} ${faltanCantidades.length === 1 ? "servicio" : "servicios"}`
                          : "Listo para calcular"}
                  </p>
                )}
              </div>
              {presupuesto ? (
                <Button
                  size="lg"
                  className="h-11 shrink-0"
                  onClick={irARevisarDocumento}
                >
                  <Eye /> Revisar documento
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="h-11 shrink-0"
                  onClick={calcular}
                  disabled={cargando !== null || !puedeCalcular}
                >
                  {cargando === "calculo" ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Calculator />
                  )}
                  Calcular
                </Button>
              )}
            </div>
          </div>
        )}

        {/* =========================== PASO 3 =========================== */}
        {paso === "vista" && presupuesto && (
          <div className="grid animate-in items-start gap-6 fade-in lg:grid-cols-[1fr_340px]">
            <div className="flex min-w-0 flex-col gap-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h1 className="text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">
                    Tu presupuesto.
                  </h1>
                  <p className="mt-3 text-lg text-muted-foreground">
                    Así quedará el documento. Comprueba que todo es correcto
                    antes de generarlo.
                  </p>
                </div>
                <div
                  role="tablist"
                  aria-label="Modo de vista previa"
                  className="inline-flex rounded-lg bg-muted p-1 text-sm"
                >
                  {(
                    [
                      ["contenido", "Contenido", () => setPestana("contenido")],
                      ["pdf", "PDF final", verPdf],
                    ] as const
                  ).map(([id, etiqueta, accion]) => (
                    <button
                      key={id}
                      role="tab"
                      aria-selected={pestana === id}
                      onClick={accion}
                      className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
                        pestana === id
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {etiqueta}
                    </button>
                  ))}
                </div>
              </div>

              {pestana === "contenido" ? (
                <div className="rounded-2xl bg-muted/60 p-2 sm:p-6 lg:max-h-[calc(100svh-17rem)] lg:overflow-y-auto">
                  <DocumentoPreview
                    cliente={cliente}
                    resumen={resumen}
                    presupuesto={presupuesto}
                    justificaciones={justificaciones}
                    dudas={dudas}
                    pendientes={pendientes}
                  />
                </div>
              ) : (
                <div className={`${cardCls} overflow-hidden bg-muted/40 p-2`}>
                  {pdfUrl ? (
                    <>
                      <iframe
                        src={pdfUrl}
                        title="PDF del presupuesto"
                        className="h-[calc(100svh-17rem)] min-h-96 w-full rounded-xl bg-white"
                      />
                      <p className="px-2 pt-2 text-xs text-muted-foreground">
                        ¿No se ve? Algunos navegadores móviles no muestran PDF
                        incrustados: revisa la pestaña «Contenido» o descárgalo.
                      </p>
                    </>
                  ) : (
                    <div className="flex h-[60vh] flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                      {cargando === "pdf" ? (
                        <>
                          <Loader2 className="size-5 animate-spin" /> Generando
                          PDF…
                        </>
                      ) : (
                        <Button variant="outline" onClick={verPdf}>
                          <RotateCcw /> Generar vista del PDF
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Panel lateral: comprobación y descarga */}
            <aside className="flex flex-col gap-3 lg:sticky lg:top-20">
              <div className={`${cardCls} overflow-hidden`}>
                <div className="border-b bg-muted/40 px-5 py-4">
                  <h2 className="flex items-center gap-2 font-semibold">
                    <ListChecks className="size-4 text-primary" /> Contenido del
                    documento
                  </h2>
                </div>

                <div className="flex flex-col gap-4 p-5">
                  <ul className="flex flex-col gap-3 text-sm">
                    {[
                      {
                        ok: !!cliente.trim(),
                        titulo: "Cliente y fecha",
                        detalle: `${cliente} · ${formatoFecha(new Date())}`,
                      },
                      {
                        ok: !!resumen.trim(),
                        titulo: "Resumen del proyecto",
                        detalle: resumen.trim()
                          ? `${resumen.trim().split(/\s+/).length} palabras`
                          : "Está vacío: vuelve a editar para añadirlo",
                      },
                      {
                        ok: presupuesto.lineas.length > 0,
                        titulo: "Servicios confirmados",
                        detalle: `${presupuesto.lineas.length} ${presupuesto.lineas.length === 1 ? "servicio" : "servicios"} con su descripción`,
                      },
                      {
                        ok: true,
                        titulo: "Desglose de importes y total",
                        detalle: `${formatoEuros(presupuesto.total)} IVA incluido`,
                      },
                      {
                        ok: true,
                        titulo: "Aclaraciones y pendientes",
                        detalle:
                          dudas.length + pendientes.length > 0
                            ? `${dudas.length} por concretar · ${pendientes.length} pendientes de valorar`
                            : "Sin aspectos pendientes",
                      },
                    ].map((r) => (
                      <li key={r.titulo} className="flex items-start gap-2.5">
                        {r.ok ? (
                          <CircleCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                        ) : (
                          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium">{r.titulo}</p>
                          <p
                            className={`truncate text-xs ${r.ok ? "text-muted-foreground" : "text-amber-700 dark:text-amber-400"}`}
                          >
                            {r.detalle}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {!descargado ? (
                    <>
                      <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition-colors has-[:checked]:border-primary/50 has-[:checked]:bg-primary/5">
                        <input
                          type="checkbox"
                          checked={revisado}
                          onChange={(e) => setRevisado(e.target.checked)}
                          className="mt-0.5 size-4 shrink-0 accent-primary"
                        />
                        <span>
                          He revisado el contenido del presupuesto y es
                          correcto.
                        </span>
                      </label>
                      <Button
                        size="lg"
                        className="h-11 w-full text-base"
                        disabled={!revisado || cargando !== null}
                        onClick={descargarPdf}
                      >
                        {cargando === "pdf" ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <Download />
                        )}
                        Aceptar y descargar PDF
                      </Button>
                    </>
                  ) : (
                    <div className="flex animate-in flex-col gap-2 rounded-xl bg-primary/10 p-4 text-sm fade-in">
                      <p className="flex items-center gap-2 font-semibold text-primary">
                        <CircleCheck className="size-4" /> Presupuesto
                        descargado
                      </p>
                      <p className="text-xs break-all text-muted-foreground">
                        {nombreArchivo}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="self-start"
                        onClick={descargarPdf}
                      >
                        <Download /> Descargar de nuevo
                      </Button>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="lg"
                    className="h-10 w-full"
                    onClick={() => setPaso("revision")}
                  >
                    <ArrowLeft /> Volver a editar
                  </Button>
                </div>
              </div>

              {descargado && (
                <Button
                  variant="ghost"
                  onClick={empezarDeNuevo}
                  className="self-center text-muted-foreground"
                >
                  <RotateCcw /> Empezar una nueva solicitud
                </Button>
              )}
            </aside>
          </div>
        )}
      </main>

      <PieSitio />
    </div>
  )
}
