"use client"

// Portada (apartado de información): sencilla y directa.
// Título + llamada a la acción, cómo funciona en tres pasos y el catálogo.

import { useEffect, useRef, useState, type ReactNode } from "react"
import Link from "next/link"
import {
  ChevronRight,
  FileCheck2,
  MessageSquareText,
  SlidersHorizontal,
} from "lucide-react"

import { buttonVariants } from "@/components/ui/button"

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

export function Hero() {
  return (
    <section className="bg-background py-20 sm:py-28">
      <Aparecer className="mx-auto flex max-w-3xl flex-col items-center px-4 text-center">
        <h1 className="text-5xl leading-[1.05] font-semibold tracking-[-0.03em] text-balance sm:text-7xl">
          Tu web, <span className="text-primary">presupuestada.</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-balance text-muted-foreground sm:text-xl">
          Cuéntanos qué necesitas. Te proponemos los servicios, tú decides y te
          llevas el presupuesto en PDF.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <Link href="/presupuesto" className={buttonVariants({ size: "xl" })}>
            Pedir presupuesto
          </Link>
          <a
            href="#servicios"
            className="group inline-flex items-center gap-0.5 text-[17px] text-primary hover:underline"
          >
            Ver tarifas
            <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </Aparecer>
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
                <span className="flex size-12 items-center justify-center rounded-full bg-background text-primary shadow-sm">
                  <Icono className="size-5" />
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
