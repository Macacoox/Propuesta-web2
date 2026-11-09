// Apartado 2 · Herramienta: rellenar la solicitud, revisar la propuesta,
// calcular el presupuesto y descargar el PDF.

import type { Metadata } from "next"

import { Presupuestador } from "@/components/presupuestador"

export const metadata: Metadata = {
  title: "Pedir presupuesto · Presupuesta mi web",
  description:
    "Describe tu proyecto, revisa la propuesta y descarga el presupuesto en PDF.",
}

export default function PaginaPresupuesto() {
  return <Presupuestador />
}
