"use client"

// Portada (apartado de información).
// Hero con demo animada + llamada a la acción, cómo funciona en tres pasos y el catálogo.

import { useEffect, useRef, useState, type ReactNode } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Check,
  ChevronRight,
  FileCheck2,
  MessageSquareText,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { buscarServicio } from "@/lib/catalogo"
import { formatoEuros, IVA } from "@/lib/presupuesto"

/* ------------------------------------------------------------------ */
/* Animación discreta de aparición al hacer scroll                     */
/* ------------------------------------------------------------------ */

export function Aparecer({
  children,
  retraso = 0,
  className = "",
}: {
  children: ReactNode
  retraso?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { rootMargin: "0px 0px -5% 0px" }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${retraso}ms` }}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100"
      } ${className}`}
    >
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Cabecera principal                                                  */
/* ------------------------------------------------------------------ */

// Ejemplo de la demo animada del hero (los precios salen del catálogo real).
const TEXTO_DEMO =
  "Tengo un restaurante y quiero una web con la carta, reservas online y versión en inglés."

const SERVICIOS_DEMO = [
  "web-basica",
  "carta-menu",
  "formulario-reservas",
  "idioma-extra",
]
  .map((id) => buscarServicio(id))
  .filter((s) => s !== undefined)

const TOTAL_DEMO =
  SERVICIOS_DEMO.reduce((suma, s) => suma + s.precio, 0) * (1 + IVA)

/** Escribe el texto letra a letra y luego va mostrando los servicios, en bucle. */
function useDemo() {
  const [letras, setLetras] = useState(0)
  const [servicios, setServicios] = useState(0)

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      t = setTimeout(() => {
        setLetras(TEXTO_DEMO.length)
        setServicios(SERVICIOS_DEMO.length)
      }, 0)
      return () => clearTimeout(t)
    }

    const ciclo = (l: number, sv: number) => {
      if (l < TEXTO_DEMO.length) {
        setLetras(l + 1)
        t = setTimeout(() => ciclo(l + 1, sv), 32)
      } else if (sv < SERVICIOS_DEMO.length) {
        setServicios(sv + 1)
        t = setTimeout(() => ciclo(l, sv + 1), sv === 0 ? 700 : 420)
      } else {
        // Pausa con el presupuesto completo y vuelta a empezar
        t = setTimeout(() => {
          setLetras(0)
          setServicios(0)
          ciclo(0, 0)
        }, 4500)
      }
    }
    t = setTimeout(() => ciclo(0, 0), 600)
    return () => clearTimeout(t)
  }, [])

  return { letras, servicios }
}

function DemoPresupuesto() {
  const { letras, servicios } = useDemo()
  const escribiendo = letras < TEXTO_DEMO.length
  const completo = servicios === SERVICIOS_DEMO.length

  return (
    <div className="relative mx-auto w-full max-w-xl animate-flotar">
      {/* Halo de color detrás de la tarjeta */}
      <div
        aria-hidden
        className="absolute -inset-4 -z-10 rounded-[2rem] bg-linear-to-tr from-primary/40 via-fuchsia-500/30 to-pink-500/30 opacity-70 blur-2xl"
      />
      <div
        role="img"
        aria-label="Ejemplo: un restaurante describe su web y recibe un presupuesto con web básica, carta, reservas e idioma adicional."
        className="overflow-hidden rounded-2xl border bg-card/90 text-left shadow-2xl shadow-primary/10 backdrop-blur-xl"
      >
        {/* Barra de ventana */}
        <div className="flex items-center gap-1.5 border-b bg-muted/60 px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-3 truncate font-mono text-[11px] text-muted-foreground">
            presupuesta-mi-web / presupuesto
          </span>
        </div>

        <div className="space-y-4 p-5" aria-hidden>
          {/* Descripción del cliente */}
          <div className="rounded-xl border bg-background px-4 py-3 text-sm leading-relaxed">
            <p className="mb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Tu proyecto
            </p>
            <p className="min-h-[3lh] sm:min-h-[2lh]">
              {TEXTO_DEMO.slice(0, letras)}
              {escribiendo && (
                <span className="ml-px inline-block h-4 w-0.5 translate-y-0.5 animate-cursor bg-primary" />
              )}
            </p>
          </div>

          {/* Propuesta */}
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              <Sparkles
                className={`size-3.5 text-primary ${!escribiendo && !completo ? "animate-pulse" : ""}`}
              />
              {escribiendo
                ? "Esperando descripción…"
                : completo
                  ? "Propuesta lista"
                  : "Analizando…"}
            </p>
            <ul className="min-h-[10.5rem] space-y-1.5">
              {SERVICIOS_DEMO.slice(0, servicios).map((s) => (
                <li
                  key={s.id}
                  className="flex animate-entrar items-center justify-between gap-3 rounded-lg bg-muted px-3 py-2 text-sm"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Check className="size-3.5 shrink-0 text-emerald-500" />
                    <span className="truncate">{s.nombre}</span>
                  </span>
                  <span className="shrink-0 font-medium tabular-nums">
                    {formatoEuros(s.precio)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between border-t pt-4">
            <span className="text-sm text-muted-foreground">
              Total (IVA incl.)
            </span>
            <span
              className={`font-heading text-2xl font-semibold tabular-nums transition-opacity duration-500 ${
                completo ? "opacity-100" : "opacity-25"
              }`}
            >
              {completo ? formatoEuros(TOTAL_DEMO) : "— €"}
            </span>
          </div>
        </div>
      </div>

      {/* Etiqueta flotante del PDF */}
      <div
        aria-hidden
        className={`absolute -right-2 -bottom-4 flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs font-medium shadow-lg transition-all duration-500 sm:-right-6 ${
          completo ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        <FileCheck2 className="size-3.5 text-primary" />
        presupuesto.pdf
      </div>
    </div>
  )
}

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-16 pb-24 sm:pt-24 sm:pb-32">
      {/* Fondo: rejilla difuminada + manchas de color animadas */}
      <div aria-hidden className="fondo-rejilla absolute inset-0 -z-10" />
      <div
        aria-hidden
        className="absolute -top-40 left-1/2 -z-10 h-[36rem] w-[60rem] -translate-x-1/2 animate-aurora rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--primary)_35%,transparent),transparent)] blur-3xl"
      />
      <div
        aria-hidden
        className="absolute top-40 -right-40 -z-10 h-[28rem] w-[28rem] animate-aurora rounded-full bg-[radial-gradient(closest-side,rgb(217_70_239/0.22),transparent)] blur-3xl [animation-delay:-7s]"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-16 px-4 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        <Aparecer className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border bg-background/70 py-1 pr-3 pl-1 text-[13px] shadow-sm backdrop-blur">
            <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
              Nuevo
            </span>
            Propuestas generadas con IA
            <Sparkles className="size-3.5 text-primary" />
          </span>

          <h1 className="mt-6 text-5xl leading-[1.02] font-semibold tracking-[-0.035em] text-balance sm:text-7xl">
            Tu web,{" "}
            <span className="texto-degradado animate-brillo">
              presupuestada
            </span>{" "}
            en minutos.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-balance text-muted-foreground sm:text-xl">
            Cuéntanos qué necesitas con tus palabras. Te proponemos los
            servicios, tú decides y te llevas el presupuesto en PDF.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 lg:justify-start">
            <Link
              href="/presupuesto"
              className={`${buttonVariants({ size: "xl" })} group shadow-lg shadow-primary/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40`}
            >
              Pedir presupuesto gratis
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#servicios"
              className="group inline-flex items-center gap-0.5 text-[17px] text-primary hover:underline"
            >
              Ver tarifas
              <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>

          <ul className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground lg:justify-start">
            {["Sin registro", "Precios cerrados", "PDF al instante"].map(
              (v) => (
                <li key={v} className="flex items-center gap-1.5">
                  <Check className="size-4 text-emerald-500" />
                  {v}
                </li>
              )
            )}
          </ul>
        </Aparecer>

        <Aparecer retraso={150}>
          <DemoPresupuesto />
        </Aparecer>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Cómo funciona                                                       */
/* ------------------------------------------------------------------ */

const PASOS_PORTADA = [
  {
    icono: MessageSquareText,
    titulo: "Descríbelo",
    texto: "Escribe qué necesitas con tus palabras, sin tecnicismos.",
  },
  {
    icono: SlidersHorizontal,
    titulo: "Ajústalo",
    texto: "Revisa los servicios propuestos y acepta, quita o añade.",
  },
  {
    icono: FileCheck2,
    titulo: "Descárgalo",
    texto: "Comprueba el documento y llévate el presupuesto en PDF.",
  },
]

export function ComoFunciona() {
  return (
    <section
      id="como-funciona"
      className="scroll-mt-12 border-y bg-muted py-16"
    >
      <div className="mx-auto max-w-5xl px-4">
        <Aparecer>
          <h2 className="text-center text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
            Cómo funciona
          </h2>
        </Aparecer>

        <ol className="mt-10 grid gap-8 sm:grid-cols-3">
          {PASOS_PORTADA.map(({ icono: Icono, titulo, texto }, i) => (
            <li key={titulo}>
              <Aparecer
                retraso={i * 80}
                className="flex flex-col items-center text-center"
              >
                <span className="flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-fuchsia-500 text-white shadow-lg shadow-primary/25">
                  <Icono className="size-6" />
                </span>
                <h3 className="mt-4 font-semibold">
                  {i + 1}. {titulo}
                </h3>
                <p className="mt-1 max-w-64 text-sm leading-relaxed text-muted-foreground">
                  {texto}
                </p>
              </Aparecer>
            </li>
          ))}
        </ol>

        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-muted-foreground">
          La IA solo sugiere servicios de nuestro catálogo. Los precios los
          calcula nuestro servidor con tarifas fijas.
        </p>
      </div>
    </section>
  )
}
