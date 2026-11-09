// Vista previa en HTML del presupuesto, con la misma estructura y estilo que el
// PDF (lib/pdf/presupuesto-pdf.tsx): si cambias uno, cambia el otro.
// Permite revisar el contenido ANTES de generar el documento y funciona en
// móvil, donde los PDF dentro de un iframe no se ven.
// Se pinta siempre como un folio blanco, también en modo oscuro.

import {
  formatoEuros,
  formatoFechaCorta,
  IVA,
  unidadesTexto,
  type Presupuesto,
} from "@/lib/presupuesto"

type Props = {
  cliente: string
  resumen: string
  presupuesto: Presupuesto
  justificaciones: Record<string, string>
  dudas: string[]
  pendientes: string[]
}

const DIAS_VALIDEZ = 30

const etiqueta =
  "text-[9px] font-bold tracking-[0.08em] text-[#6e6e73] uppercase"
const h2 = "font-heading text-[15px] font-semibold text-[#1d1d1f]"

export function DocumentoPreview({
  cliente,
  resumen,
  presupuesto,
  justificaciones,
  dudas,
  pendientes,
}: Props) {
  const hoy = new Date()
  const fecha = formatoFechaCorta(hoy)
  const validoHasta = formatoFechaCorta(
    new Date(hoy.getTime() + DIAS_VALIDEZ * 24 * 60 * 60 * 1000)
  )

  return (
    <article
      aria-label="Vista previa del presupuesto"
      className="mx-auto w-full max-w-[210mm] rounded-sm bg-white px-5 py-7 text-[12.5px] leading-relaxed text-[#1d1d1f] shadow-lg ring-1 ring-black/5 sm:px-12 sm:py-11"
    >
      {/* Cabecera */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-md bg-[#1d1d1f] font-heading text-lg font-bold text-white">
            P
          </span>
          <div className="leading-tight">
            <p className="font-heading text-[15px] font-bold">
              Presupuesta mi web
            </p>
            <p className="text-[10px] text-[#6e6e73]">
              Estudio de desarrollo web
            </p>
          </div>
        </div>
        <div className="sm:text-right">
          <p className="font-heading text-[28px] leading-none font-bold tracking-wider">
            PRESUPUESTO
          </p>
          <p className="mt-1.5 text-[11px] text-[#6e6e73]">
            Nº asignado al generar el PDF
          </p>
        </div>
      </header>
      <div className="mt-4 mb-4 h-[3px] w-12 rounded bg-[#0071e3]" />

      {/* 1. Cliente y fechas */}
      <div className="grid gap-2 sm:grid-cols-[2fr_1fr_1fr]">
        <div className="rounded-md bg-[#f5f5f7] px-3 py-2">
          <p className={etiqueta}>Preparado para</p>
          <p className="text-[13px] font-medium">{cliente}</p>
        </div>
        <div className="rounded-md bg-[#f5f5f7] px-3 py-2">
          <p className={etiqueta}>Fecha de emisión</p>
          <p className="text-[13px] font-medium tabular-nums">{fecha}</p>
        </div>
        <div className="rounded-md bg-[#f5f5f7] px-3 py-2">
          <p className={etiqueta}>Válido hasta</p>
          <p className="text-[13px] font-medium tabular-nums">{validoHasta}</p>
        </div>
      </div>

      {/* 2. Resumen */}
      <section className="mt-6">
        <h2 className={`${h2} mb-1.5`}>Resumen del proyecto</h2>
        <p className="text-[#3a3a3c]">{resumen || "—"}</p>
      </section>

      {/* 3 y 4. Servicios y desglose */}
      <section className="mt-6">
        <h2 className={`${h2} mb-1.5`}>Servicios incluidos</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse">
            <thead>
              <tr className="border-b border-[#1d1d1f] text-left">
                <th className={`${etiqueta} w-7 pb-1.5`}>#</th>
                <th className={`${etiqueta} pb-1.5`}>Concepto</th>
                <th className={`${etiqueta} px-2 pb-1.5 text-center`}>Cant.</th>
                <th className={`${etiqueta} pb-1.5 pl-4 text-right`}>Precio</th>
                <th className={`${etiqueta} pb-1.5 pl-4 text-right`}>
                  Importe
                </th>
              </tr>
            </thead>
            <tbody>
              {presupuesto.lineas.map((l, i) => (
                <tr key={l.id} className="border-b border-[#e5e5ea] align-top">
                  <td className="py-2 text-[11px] text-[#a1a1a6] tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </td>
                  <td className="py-2 pr-3">
                    <p className="text-[13px] font-bold">{l.nombre}</p>
                    <p className="text-[11px] text-[#6e6e73]">
                      {l.descripcion}
                    </p>
                    {justificaciones[l.id] && (
                      <p className="mt-0.5 text-[10.5px] text-[#0071e3] italic">
                        {justificaciones[l.id]}
                      </p>
                    )}
                  </td>
                  <td className="px-2 py-2 text-center whitespace-nowrap">
                    {l.cantidad}
                    {l.unidad ? ` ${unidadesTexto(l.cantidad, l.unidad)}` : ""}
                  </td>
                  <td className="py-2 pl-4 text-right whitespace-nowrap tabular-nums">
                    {formatoEuros(l.precioUnitario)}
                  </td>
                  <td className="py-2 pl-4 text-right font-medium whitespace-nowrap tabular-nums">
                    {formatoEuros(l.importe)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 ml-auto w-full max-w-72 tabular-nums">
          <div className="flex justify-between px-3 py-0.5">
            <span className="text-[#6e6e73]">Base imponible</span>
            <span>{formatoEuros(presupuesto.baseImponible)}</span>
          </div>
          <div className="flex justify-between px-3 py-0.5">
            <span className="text-[#6e6e73]">
              IVA ({Math.round(IVA * 100)} %)
            </span>
            <span>{formatoEuros(presupuesto.iva)}</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between rounded-md bg-[#1d1d1f] px-3 py-2 text-white">
            <span className="text-[10px] font-bold tracking-[0.08em] uppercase">
              Total
            </span>
            <span className="font-heading text-xl font-bold">
              {formatoEuros(presupuesto.total)}
            </span>
          </div>
          <p className="mt-1 pr-0.5 text-right text-[10px] text-[#6e6e73]">
            Importe en euros, IVA incluido
          </p>
        </div>
      </section>

      {/* 5. Aclaraciones y pendientes */}
      <section className="mt-6">
        <h2 className={`${h2} mb-1.5`}>Aclaraciones y aspectos pendientes</h2>
        {dudas.length === 0 && pendientes.length === 0 && (
          <p className="text-[#3a3a3c]">
            No hay aspectos pendientes de concretar.
          </p>
        )}
        {dudas.length > 0 && (
          <>
            <p className={`${etiqueta} mb-1`}>Por concretar con el cliente</p>
            <ul className="list-disc space-y-0.5 pl-4 marker:text-[#a1a1a6]">
              {dudas.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </>
        )}
        {pendientes.length > 0 && (
          <div className="mt-2.5 border-l-2 border-[#b45309] bg-[#fff8eb] px-3 py-2">
            <p className="mb-1 text-[9px] font-bold tracking-[0.08em] text-[#b45309] uppercase">
              Pendiente de valorar · no incluido en el importe
            </p>
            <ul className="list-disc space-y-0.5 pl-4 marker:text-[#a1a1a6]">
              {pendientes.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Condiciones y aceptación */}
      <section className="mt-6">
        <h2 className={`${h2} mb-1.5`}>Condiciones</h2>
        <p className="text-[11px] text-[#6e6e73]">
          Presupuesto orientativo y sin compromiso, válido hasta el{" "}
          {validoHasta}. Los importes incluyen IVA. Los aspectos pendientes de
          valorar no están incluidos y se presupuestarán aparte una vez
          concretados.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {["Conforme del cliente", "Fecha de aceptación"].map((t, i) => (
            <div
              key={t}
              className="flex h-20 flex-col justify-between rounded-md border border-[#e5e5ea] p-3"
            >
              <p className={etiqueta}>{t}</p>
              <p className="border-t border-[#a1a1a6] pt-1 text-[10px] text-[#6e6e73]">
                {i === 0 ? "Firma" : "Fecha"}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-8 flex justify-between border-t border-[#e5e5ea] pt-2 text-[10px] text-[#a1a1a6]">
        <span>Presupuesta mi web · Presupuesto</span>
        <span>Página 1</span>
      </footer>
    </article>
  )
}
