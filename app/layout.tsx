import type { Metadata } from "next"
import { DM_Sans, Geist_Mono, Space_Grotesk } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

// Tipografía del proyecto:
// - Space Grotesk (títulos): geométrica y con aire técnico, encaja con una herramienta de desarrollo web.
// - DM Sans (texto): limpia y muy legible en formularios y tablas.
const fontTitulos = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-titulos",
  weight: ["500", "600", "700"],
})

const fontTexto = DM_Sans({
  subsets: ["latin"],
  variable: "--font-texto",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Presupuesta mi web",
  description:
    "Describe tu proyecto web y recibe una propuesta de servicios y un presupuesto en PDF.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontTitulos.variable,
        fontTexto.variable,
        fontMono.variable,
        "font-sans"
      )}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
