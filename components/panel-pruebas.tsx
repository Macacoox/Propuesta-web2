"use client"

// Panel visible solo en modo pruebas (npm run dev o NEXT_PUBLIC_MODO_PRUEBAS=1).
// Permite provocar un fallo de OpenAI en la PRÓXIMA petición para comprobar
// que la aplicación avisa al usuario y deja reintentar. El fallo es de un solo
// uso: al pulsar «Reintentar», la petición ya va normal.

import { FlaskConical } from "lucide-react"

import { MODO_PRUEBAS, TIPOS_FALLO, type TipoFallo } from "@/lib/modo-pruebas"

type Props = {
  valor: TipoFallo | ""
  onChange: (v: TipoFallo | "") => void
}

export function PanelPruebas({ valor, onChange }: Props) {
  if (!MODO_PRUEBAS) return null
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-violet-500/40 bg-violet-500/5 p-4 text-sm">
      <span className="flex items-center gap-2 font-medium text-violet-700 dark:text-violet-300">
        <FlaskConical className="size-4" /> Modo pruebas
      </span>
      <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
        Simular en la próxima petición:
        <select
          value={valor}
          onChange={(e) => onChange(e.target.value as TipoFallo | "")}
          className="w-full rounded-lg border border-input bg-background px-2 py-1.5 text-xs text-foreground"
        >
          <option value="">Nada (petición normal)</option>
          {Object.entries(TIPOS_FALLO).map(([id, texto]) => (
            <option key={id} value={id}>
              Fallo: {texto}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
