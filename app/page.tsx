// Apartado 1 · Información: qué es, cómo funciona y qué servicios ofrecemos.
// La herramienta para generar el presupuesto está en /presupuesto.

import { BarraNavegacion } from "@/components/barra-navegacion"
import { CatalogoServicios } from "@/components/catalogo-servicios"
import { PieSitio } from "@/components/pie-sitio"
import { ComoFunciona, Hero } from "@/components/portada"

export default function Inicio() {
  return (
    <div className="min-h-svh bg-background">
      <BarraNavegacion actual="inicio" />
      <main>
        <Hero />
        <ComoFunciona />
        <CatalogoServicios />
      </main>
      <PieSitio />
    </div>
  )
}
