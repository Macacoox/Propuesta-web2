// Pie de página sobrio: notas en letra pequeña, como en las webs de producto.

import Link from "next/link"

export function PieSitio() {
  return (
    <footer className="border-t bg-muted text-xs leading-relaxed text-muted-foreground">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <ol className="flex flex-col gap-2 border-b pb-6">
          <li>
            1. Las propuestas las genera un modelo de inteligencia artificial
            (OpenAI) a partir de tu descripción y solo pueden incluir servicios
            de nuestro catálogo. Tú decides qué se incluye en el presupuesto.
          </li>
          <li>
            2. Los importes se calculan en nuestro servidor con tarifas fijas e
            incluyen IVA del 21 %. El presupuesto es orientativo y válido
            durante 30 días.
          </li>
          <li>
            3. Proyecto académico. Todos los datos de ejemplo son ficticios.
          </li>
        </ol>
        <div className="flex flex-col gap-2 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Copyright © {new Date().getFullYear()} Presupuesta mi web.
            Desarrollo Web en Entorno Cliente.
          </p>
          <nav className="flex gap-4">
            <Link
              href="/#como-funciona"
              className="hover:text-foreground hover:underline"
            >
              Cómo funciona
            </Link>
            <Link
              href="/#servicios"
              className="hover:text-foreground hover:underline"
            >
              Servicios
            </Link>
            <Link
              href="/presupuesto"
              className="hover:text-foreground hover:underline"
            >
              Pedir presupuesto
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
