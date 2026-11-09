import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // react-pdf usa dependencias de Node (fontkit, pdfkit): no se empaqueta en el servidor
  serverExternalPackages: ["@react-pdf/renderer"],
  // Las fuentes del PDF se leen del disco en tiempo de ejecución: hay que
  // incluirlas explícitamente en la función de /api/pdf al desplegar (Vercel).
  outputFileTracingIncludes: {
    "/api/pdf": ["./lib/pdf/fuentes/*.woff"],
  },
}

export default nextConfig
