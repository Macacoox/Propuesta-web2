// Catálogo en la portada: qué ofrecemos y a qué precio.
// Los datos salen de lib/catalogo.ts (la misma fuente que usa el servidor).

import { Aparecer } from "@/components/portada"
import { CATALOGO } from "@/lib/catalogo"
import { formatoEuros } from "@/lib/presupuesto"

export function CatalogoServicios() {
  return (
    <section
      id="servicios"
      aria-labelledby="titulo-catalogo"
      className="scroll-mt-12 bg-background py-16 sm:py-20"
    >
      <div className="mx-auto max-w-5xl px-4">
        <Aparecer>
          <h2
            id="titulo-catalogo"
            className="text-center text-3xl font-semibold tracking-[-0.02em] sm:text-4xl"
          >
            Servicios y tarifas
          </h2>
          <p className="mt-2 text-center text-muted-foreground">
            Precios sin IVA.
          </p>
        </Aparecer>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CATALOGO.map((s, i) => (
            <li key={s.id}>
              <Aparecer retraso={(i % 3) * 60} className="h-full">
                <article className="flex h-full flex-col gap-1 rounded-2xl border bg-card p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-medium">{s.nombre}</h3>
                    <p className="shrink-0 font-semibold tabular-nums">
                      {formatoEuros(s.precio)}
                      {s.unidad && (
                        <span className="text-sm font-normal text-muted-foreground">
                          {" "}
                          /{s.unidad}
                        </span>
                      )}
                    </p>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {s.descripcion}
                  </p>
                </article>
              </Aparecer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
