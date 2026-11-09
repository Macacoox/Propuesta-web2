"use client"

// Barra superior compartida por los dos apartados:
//   /             → información (portada, cómo funciona, servicios)
//   /presupuesto  → herramienta para generar el presupuesto

import Link from "next/link"
import { useTheme } from "next-themes"
import { FileText, Moon, Sun } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"

function BotonTema() {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Cambiar tema"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {/* Los dos iconos se renderizan siempre y el CSS decide: evita errores de hidratación */}
      <Sun className="hidden dark:block" />
      <Moon className="dark:hidden" />
    </Button>
  )
}

const ENLACES = [
  { href: "/", texto: "Inicio", id: "inicio" },
  { href: "/#como-funciona", texto: "Cómo funciona", id: "como" },
  { href: "/#servicios", texto: "Servicios", id: "servicios" },
  { href: "/presupuesto", texto: "Pedir presupuesto", id: "presupuesto" },
] as const

export function BarraNavegacion({
  actual,
}: {
  actual: "inicio" | "presupuesto"
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-xl backdrop-saturate-150">
      <nav className="mx-auto flex h-12 max-w-6xl items-center justify-between gap-4 px-4 text-[13px]">
        <Link
          href="/"
          className="flex items-center gap-2 font-heading text-[15px] font-semibold tracking-tight"
        >
          <span className="flex size-6 items-center justify-center rounded-md bg-foreground text-background">
            <FileText className="size-3.5" />
          </span>
          Presupuesta mi web
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {ENLACES.map((e) => (
            <Link
              key={e.id}
              href={e.href}
              aria-current={e.id === actual ? "page" : undefined}
              className={`transition-colors hover:text-foreground ${
                e.id === actual
                  ? "font-medium text-foreground"
                  : "text-foreground/70"
              }`}
            >
              {e.texto}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <BotonTema />
          {actual === "inicio" ? (
            <Link
              href="/presupuesto"
              className={buttonVariants({ size: "sm" })}
            >
              Empezar
            </Link>
          ) : (
            <Link
              href="/"
              className={`${buttonVariants({ size: "sm", variant: "ghost" })} md:hidden`}
            >
              Inicio
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
