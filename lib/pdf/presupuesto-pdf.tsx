// Plantilla del PDF con @react-pdf/renderer.
// La vista previa HTML (components/documento-preview.tsx) replica esta misma estructura:
// si cambias una, cambia la otra.

import path from "node:path"

import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer"

import {
  formatoEuros,
  IVA,
  unidadesTexto,
  type Presupuesto,
} from "@/lib/presupuesto"

export type DatosPDF = {
  cliente: string
  fecha: string
  validoHasta: string
  numero: string
  resumen: string
  presupuesto: Presupuesto
  justificaciones: Record<string, string>
  /** Preguntas o datos por concretar con el cliente. */
  dudas: string[]
  /** Necesidades fuera del catálogo: no incluidas en el importe. */
  pendientes: string[]
}

/* ------------------------------------------------------------------ */
/* Tipografías: las mismas que la web (archivos en lib/pdf/fuentes)    */
/* ------------------------------------------------------------------ */

const fuente = (archivo: string) =>
  path.join(process.cwd(), "lib", "pdf", "fuentes", archivo)

Font.register({
  family: "DM Sans",
  fonts: [
    { src: fuente("dm-sans-latin-400-normal.woff") },
    { src: fuente("dm-sans-latin-400-italic.woff"), fontStyle: "italic" },
    { src: fuente("dm-sans-latin-500-normal.woff"), fontWeight: 500 },
    { src: fuente("dm-sans-latin-700-normal.woff"), fontWeight: 700 },
  ],
})
Font.register({
  family: "Space Grotesk",
  fonts: [
    { src: fuente("space-grotesk-latin-600-normal.woff"), fontWeight: 600 },
    { src: fuente("space-grotesk-latin-700-normal.woff"), fontWeight: 700 },
  ],
})
// Sin partición automática de palabras con guiones (en castellano parte mal)
Font.registerHyphenationCallback((palabra) => [palabra])

/* ------------------------------------------------------------------ */
/* Estilos                                                             */
/* ------------------------------------------------------------------ */

const TINTA = "#1d1d1f"
const GRIS = "#6e6e73"
const GRIS_CLARO = "#a1a1a6"
const LINEA = "#e5e5ea"
const FONDO = "#f5f5f7"
const ACENTO = "#0071e3"
const AMBAR = "#b45309"

const s = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingHorizontal: 48,
    paddingBottom: 64,
    fontFamily: "DM Sans",
    fontSize: 9.5,
    color: TINTA,
    lineHeight: 1.45,
  },

  // Cabecera
  cabecera: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  marca: { flexDirection: "row", alignItems: "center", gap: 8 },
  logo: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: TINTA,
    alignItems: "center",
    justifyContent: "center",
  },
  logoLetra: {
    fontFamily: "Space Grotesk",
    fontWeight: 700,
    fontSize: 14,
    color: "#fff",
    lineHeight: 1,
  },
  marcaNombre: {
    fontFamily: "Space Grotesk",
    fontWeight: 700,
    fontSize: 12.5,
    lineHeight: 1.1,
  },
  marcaSub: { fontSize: 8, color: GRIS },
  titulo: {
    fontFamily: "Space Grotesk",
    fontWeight: 700,
    fontSize: 24,
    letterSpacing: 1,
    textAlign: "right",
    lineHeight: 1,
  },
  numero: { fontSize: 9, color: GRIS, textAlign: "right", marginTop: 4 },
  barra: {
    height: 3,
    width: 48,
    backgroundColor: ACENTO,
    borderRadius: 2,
    marginTop: 14,
    marginBottom: 14,
  },

  // Fichas de datos
  fichas: { flexDirection: "row", gap: 8 },
  ficha: {
    flex: 1,
    backgroundColor: FONDO,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  fichaAncha: { flex: 2 },
  etiqueta: {
    fontSize: 7,
    fontWeight: 700,
    color: GRIS,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  fichaValor: { fontSize: 10.5, fontWeight: 500 },

  // Secciones
  seccion: { marginTop: 18 },
  h2: {
    fontFamily: "Space Grotesk",
    fontWeight: 600,
    fontSize: 12,
    marginBottom: 6,
  },
  parrafo: { color: "#3a3a3c" },

  // Tabla
  filaCab: {
    flexDirection: "row",
    borderBottom: `1pt solid ${TINTA}`,
    paddingBottom: 5,
  },
  th: {
    fontSize: 7,
    fontWeight: 700,
    color: GRIS,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  fila: {
    flexDirection: "row",
    borderBottom: `0.5pt solid ${LINEA}`,
    paddingVertical: 6,
  },
  cNum: { width: 22, color: GRIS_CLARO, fontSize: 8.5 },
  cConcepto: { flex: 1, paddingRight: 10 },
  cCant: { width: 58, textAlign: "center" },
  cPrecio: { width: 70, textAlign: "right" },
  cImporte: { width: 74, textAlign: "right", fontWeight: 500 },
  concepto: { fontWeight: 700, fontSize: 10 },
  desc: { fontSize: 8.5, color: GRIS, marginTop: 1 },
  just: { fontSize: 8, color: ACENTO, fontStyle: "italic", marginTop: 3 },

  // Totales
  totales: { marginTop: 12, marginLeft: "auto", width: 230 },
  totalFila: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  totalTexto: { color: GRIS },
  totalFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: TINTA,
    color: "#fff",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 6,
  },
  totalEtiqueta: {
    lineHeight: 1,
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  totalImporte: {
    lineHeight: 1,
    fontFamily: "Space Grotesk",
    fontWeight: 700,
    fontSize: 15,
  },
  totalNota: {
    fontSize: 7.5,
    color: GRIS,
    textAlign: "right",
    marginTop: 4,
    paddingRight: 2,
  },

  // Notas
  item: { flexDirection: "row", marginBottom: 3 },
  vineta: { width: 10, color: GRIS_CLARO },
  pendiente: {
    borderLeft: `2pt solid ${AMBAR}`,
    backgroundColor: "#fff8eb",
    paddingVertical: 7,
    paddingHorizontal: 10,
    marginTop: 8,
  },
  pendienteTitulo: {
    fontSize: 7,
    fontWeight: 700,
    color: AMBAR,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 3,
  },

  // Condiciones y aceptación
  condiciones: { fontSize: 8, color: GRIS },
  firmas: { flexDirection: "row", gap: 12, marginTop: 10 },
  firma: {
    flex: 1,
    border: `0.75pt solid ${LINEA}`,
    borderRadius: 6,
    padding: 10,
    height: 64,
    justifyContent: "space-between",
  },
  firmaLinea: {
    borderTop: `0.5pt solid ${GRIS_CLARO}`,
    paddingTop: 3,
    fontSize: 7.5,
    color: GRIS,
  },

  // Pie: anclado con top (A4 = 841.89 pt). Con bottom, react-pdf deja el
  // texto dinámico (nº de página) fuera de la página.
  pieIzq: {
    position: "absolute",
    top: 800,
    left: 48,
    right: 48,
    borderTop: `0.5pt solid ${LINEA}`,
    paddingTop: 6,
    fontSize: 7.5,
    color: GRIS_CLARO,
  },
  pieDer: {
    position: "absolute",
    top: 806.5,
    left: 48,
    right: 48,
    textAlign: "right",
    fontSize: 7.5,
    color: GRIS_CLARO,
  },
})

function Lista({ items }: { items: string[] }) {
  return (
    <>
      {items.map((a, i) => (
        <View key={i} style={s.item} wrap={false}>
          <Text style={s.vineta}>•</Text>
          <Text style={{ flex: 1 }}>{a}</Text>
        </View>
      ))}
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Documento                                                           */
/* ------------------------------------------------------------------ */

export function PresupuestoPDF({
  cliente,
  fecha,
  validoHasta,
  numero,
  resumen,
  presupuesto,
  justificaciones,
  dudas,
  pendientes,
}: DatosPDF) {
  return (
    <Document
      title={`Presupuesto ${numero} · ${cliente}`}
      author="Presupuesta mi web"
      subject="Presupuesto de desarrollo web"
      language="es"
    >
      <Page size="A4" style={s.page}>
        {/* Cabecera */}
        <View style={s.cabecera}>
          <View style={s.marca}>
            <View style={s.logo}>
              <Text style={s.logoLetra}>P</Text>
            </View>
            <View>
              <Text style={s.marcaNombre}>Presupuesta mi web</Text>
              <Text style={s.marcaSub}>Estudio de desarrollo web</Text>
            </View>
          </View>
          <View>
            <Text style={s.titulo}>PRESUPUESTO</Text>
            <Text style={s.numero}>Nº {numero}</Text>
          </View>
        </View>
        <View style={s.barra} />

        {/* 1. Cliente y fechas */}
        <View style={s.fichas}>
          <View style={[s.ficha, s.fichaAncha]}>
            <Text style={s.etiqueta}>Preparado para</Text>
            <Text style={s.fichaValor}>{cliente}</Text>
          </View>
          <View style={s.ficha}>
            <Text style={s.etiqueta}>Fecha de emisión</Text>
            <Text style={s.fichaValor}>{fecha}</Text>
          </View>
          <View style={s.ficha}>
            <Text style={s.etiqueta}>Válido hasta</Text>
            <Text style={s.fichaValor}>{validoHasta}</Text>
          </View>
        </View>

        {/* 2. Resumen */}
        <View style={s.seccion}>
          <Text style={s.h2}>Resumen del proyecto</Text>
          <Text style={s.parrafo}>{resumen || "—"}</Text>
        </View>

        {/* 3 y 4. Servicios y desglose */}
        <View style={s.seccion}>
          <Text style={s.h2}>Servicios incluidos</Text>
          <View style={s.filaCab}>
            <Text style={[s.th, s.cNum]}>#</Text>
            <Text style={[s.th, s.cConcepto]}>Concepto</Text>
            <Text style={[s.th, s.cCant]}>Cant.</Text>
            <Text style={[s.th, s.cPrecio]}>Precio</Text>
            <Text style={[s.th, s.cImporte]}>Importe</Text>
          </View>
          {presupuesto.lineas.map((l, i) => (
            <View key={l.id} style={s.fila} wrap={false}>
              <Text style={s.cNum}>{String(i + 1).padStart(2, "0")}</Text>
              <View style={s.cConcepto}>
                <Text style={s.concepto}>{l.nombre}</Text>
                <Text style={s.desc}>{l.descripcion}</Text>
                {justificaciones[l.id] ? (
                  <Text style={s.just}>{justificaciones[l.id]}</Text>
                ) : null}
              </View>
              <Text style={s.cCant}>
                {l.cantidad}
                {l.unidad ? ` ${unidadesTexto(l.cantidad, l.unidad)}` : ""}
              </Text>
              <Text style={s.cPrecio}>{formatoEuros(l.precioUnitario)}</Text>
              <Text style={s.cImporte}>{formatoEuros(l.importe)}</Text>
            </View>
          ))}

          <View style={s.totales} wrap={false}>
            <View style={s.totalFila}>
              <Text style={s.totalTexto}>Base imponible</Text>
              <Text>{formatoEuros(presupuesto.baseImponible)}</Text>
            </View>
            <View style={s.totalFila}>
              <Text style={s.totalTexto}>IVA ({Math.round(IVA * 100)} %)</Text>
              <Text>{formatoEuros(presupuesto.iva)}</Text>
            </View>
            <View style={s.totalFinal}>
              <Text style={s.totalEtiqueta}>Total</Text>
              <Text style={s.totalImporte}>
                {formatoEuros(presupuesto.total)}
              </Text>
            </View>
            <Text style={s.totalNota}>Importe en euros, IVA incluido</Text>
          </View>
        </View>

        {/* 5. Aclaraciones y pendientes */}
        <View style={s.seccion}>
          <Text style={s.h2} minPresenceAhead={50}>
            Aclaraciones y aspectos pendientes
          </Text>
          {dudas.length === 0 && pendientes.length === 0 && (
            <Text style={s.parrafo}>
              No hay aspectos pendientes de concretar.
            </Text>
          )}
          {dudas.length > 0 && (
            <View>
              <Text style={[s.etiqueta, { marginBottom: 4 }]}>
                Por concretar con el cliente
              </Text>
              <Lista items={dudas} />
            </View>
          )}
          {pendientes.length > 0 && (
            <View style={s.pendiente} wrap={false}>
              <Text style={s.pendienteTitulo}>
                Pendiente de valorar · no incluido en el importe
              </Text>
              <Lista items={pendientes} />
            </View>
          )}
        </View>

        {/* Condiciones y aceptación */}
        <View style={s.seccion} wrap={false}>
          <Text style={s.h2}>Condiciones</Text>
          <Text style={s.condiciones}>
            Presupuesto orientativo y sin compromiso, válido hasta el{" "}
            {validoHasta}. Los importes incluyen IVA. Los aspectos pendientes de
            valorar no están incluidos y se presupuestarán aparte una vez
            concretados.
          </Text>
          <View style={s.firmas}>
            <View style={s.firma}>
              <Text style={s.etiqueta}>Conforme del cliente</Text>
              <Text style={s.firmaLinea}>Firma</Text>
            </View>
            <View style={s.firma}>
              <Text style={s.etiqueta}>Fecha de aceptación</Text>
              <Text style={s.firmaLinea}>Fecha</Text>
            </View>
          </View>
        </View>

        {/* Pie en todas las páginas */}
        <Text style={s.pieIzq} fixed>
          Presupuesta mi web · Presupuesto {numero}
        </Text>
        <Text
          style={s.pieDer}
          fixed
          render={({ pageNumber, totalPages }) =>
            `Página ${pageNumber} de ${totalPages}`
          }
        />
      </Page>
    </Document>
  )
}
