// Catálogo de servicios y tarifas de «Presupuesta mi web».
// Es la ÚNICA fuente de verdad: la IA solo puede elegir estos IDs y
// los precios se calculan siempre en el servidor a partir de aquí.
// Precios en euros, sin IVA.

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
  // --- Base del proyecto -------------------------------------------------
  {
    id: "landing-page",
    nombre: "Landing page",
    descripcion:
      "Página única de presentación con secciones de scroll, llamada a la acción y formulario de contacto. Ideal para un producto, evento o profesional.",
    tipo: "fijo",
    precio: 390,
  },
  {
    id: "web-basica",
    nombre: "Web corporativa",
    descripcion:
      "Diseño a medida y responsive con hasta 5 páginas (inicio, quiénes somos, servicios, galería y contacto), dominio y alojamiento el primer año.",
    tipo: "fijo",
    precio: 750,
  },
  {
    id: "tienda-online",
    nombre: "Tienda online",
    descripcion:
      "Venta por internet: carrito de compra, pago con tarjeta y Bizum, gestión de pedidos, envíos y stock (hasta 100 productos). Incluye la web base.",
    tipo: "fijo",
    precio: 1490,
  },

  // --- Ampliaciones ------------------------------------------------------
  {
    id: "pagina-extra",
    nombre: "Página adicional",
    descripcion:
      "Página o sección extra con el mismo diseño de la web, maquetada con el contenido que aporte el cliente.",
    tipo: "por_unidad",
    precio: 95,
    unidad: "página",
  },
  {
    id: "idioma-extra",
    nombre: "Idioma adicional",
    descripcion:
      "Versión completa del sitio en otro idioma con selector de idioma. La traducción de los textos la aporta el cliente.",
    tipo: "por_unidad",
    precio: 160,
    unidad: "idioma",
  },
  {
    id: "carta-menu",
    nombre: "Carta / menú o escaparate de productos",
    descripcion:
      "Sección para MOSTRAR (sin vender online) platos o productos por categorías, con precios, alérgenos y fotos, editable por el cliente desde un panel.",
    tipo: "fijo",
    precio: 280,
  },
  {
    id: "formulario-reservas",
    nombre: "Sistema de reservas y citas",
    descripcion:
      "Formulario para reservar mesa o pedir cita (fecha, hora y número de personas), con confirmación automática por correo al cliente y al negocio.",
    tipo: "fijo",
    precio: 240,
  },
  {
    id: "blog",
    nombre: "Blog o sección de noticias",
    descripcion:
      "Gestor de contenidos para publicar entradas con imágenes, categorías y botones para compartir en redes sociales.",
    tipo: "fijo",
    precio: 320,
  },
  {
    id: "galeria",
    nombre: "Galería de fotos y vídeos",
    descripcion:
      "Galería con filtros por categoría, vista ampliada y vídeos incrustados de YouTube o Vimeo.",
    tipo: "fijo",
    precio: 150,
  },
  {
    id: "area-clientes",
    nombre: "Área privada de clientes",
    descripcion:
      "Registro e inicio de sesión para que los clientes consulten sus datos, pedidos o documentos en una zona privada.",
    tipo: "fijo",
    precio: 450,
  },
  {
    id: "integraciones",
    nombre: "Integraciones básicas",
    descripcion:
      "Mapa de Google, botón de WhatsApp, enlaces e inserción de publicaciones de Instagram y Facebook.",
    tipo: "fijo",
    precio: 90,
  },

  // --- Contenido e imagen ------------------------------------------------
  {
    id: "logotipo",
    nombre: "Diseño de logotipo",
    descripcion:
      "Logotipo con dos propuestas iniciales y hasta dos rondas de cambios, entregado en formatos para web e impresión.",
    tipo: "fijo",
    precio: 220,
  },
  {
    id: "redaccion-textos",
    nombre: "Redacción de textos",
    descripcion:
      "Redacción profesional de los textos de una página, orientada al público del negocio y a buscadores.",
    tipo: "por_unidad",
    precio: 60,
    unidad: "página",
  },

  // --- Posicionamiento, legal y mantenimiento ----------------------------
  {
    id: "seo-basico",
    nombre: "SEO básico",
    descripcion:
      "Optimización on-page, metaetiquetas, sitemap, alta en Google Search Console y ficha de Google Business Profile.",
    tipo: "fijo",
    precio: 210,
  },
  {
    id: "legal-rgpd",
    nombre: "Adaptación legal (RGPD y cookies)",
    descripcion:
      "Aviso legal, política de privacidad y de cookies, y banner de consentimiento configurado.",
    tipo: "fijo",
    precio: 120,
  },
  {
    id: "mantenimiento",
    nombre: "Mantenimiento mensual",
    descripcion:
      "Actualizaciones de seguridad, copias de seguridad semanales y hasta 1 hora al mes de cambios de contenido.",
    tipo: "por_unidad",
    precio: 45,
    unidad: "mes",
  },
]

export const IDS_CATALOGO = CATALOGO.map((s) => s.id)

export function buscarServicio(id: string): Servicio | undefined {
  return CATALOGO.find((s) => s.id === id)
}
