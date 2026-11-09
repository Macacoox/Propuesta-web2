// Catálogo de servicios y tarifas.
// ⚠️ Sustituye estos datos por el catálogo de vuestro ejercicio anterior.
// Es la ÚNICA fuente de verdad: la IA solo puede elegir estos IDs y
// los precios se calculan siempre en el servidor a partir de aquí.

export type Servicio = {
  id: string
  nombre: string
  descripcion: string
  /** "fijo": precio único. "por_unidad": precio × cantidad (páginas, idiomas...). */
  tipo: "fijo" | "por_unidad"
  precio: number
  /** Solo para tipo "por_unidad": qué se cuenta (p. ej. "página", "idioma"). */
  unidad?: string
}

export const CATALOGO: Servicio[] = [
  {
    id: "web-basica",
    nombre: "Web corporativa básica",
    descripcion:
      "Diseño responsive, hasta 5 secciones, formulario de contacto y alojamiento el primer año.",
    tipo: "fijo",
    precio: 600,
  },
  {
    id: "pagina-extra",
    nombre: "Página adicional",
    descripcion: "Sección o página adicional con el mismo diseño de la web.",
    tipo: "por_unidad",
    precio: 80,
    unidad: "página",
  },
  {
    id: "idioma-extra",
    nombre: "Idioma adicional",
    descripcion:
      "Versión del sitio en otro idioma con selector de idioma (traducción aportada por el cliente).",
    tipo: "por_unidad",
    precio: 150,
    unidad: "idioma",
  },
  {
    id: "carta-menu",
    nombre: "Carta / catálogo de productos",
    descripcion:
      "Sección con listado de productos o platos, categorías, precios y fotos, editable por el cliente.",
    tipo: "fijo",
    precio: 250,
  },
  {
    id: "formulario-reservas",
    nombre: "Formulario de reservas",
    descripcion:
      "Formulario de reservas con fecha, hora y número de personas, con aviso por correo electrónico.",
    tipo: "fijo",
    precio: 200,
  },
  {
    id: "blog",
    nombre: "Blog",
    descripcion:
      "Sección de noticias o blog con gestor de contenidos para publicar entradas.",
    tipo: "fijo",
    precio: 300,
  },
  {
    id: "tienda-online",
    nombre: "Tienda online",
    descripcion:
      "Carrito de compra, pasarela de pago y gestión de pedidos (hasta 50 productos).",
    tipo: "fijo",
    precio: 1200,
  },
  {
    id: "seo-basico",
    nombre: "SEO básico",
    descripcion:
      "Optimización on-page, metaetiquetas, sitemap y alta en Google Search Console.",
    tipo: "fijo",
    precio: 180,
  },
  {
    id: "mantenimiento",
    nombre: "Mantenimiento mensual",
    descripcion:
      "Actualizaciones, copias de seguridad y pequeños cambios de contenido.",
    tipo: "por_unidad",
    precio: 40,
    unidad: "mes",
  },
]

export const IDS_CATALOGO = CATALOGO.map((s) => s.id)

export function buscarServicio(id: string): Servicio | undefined {
  return CATALOGO.find((s) => s.id === id)
}
