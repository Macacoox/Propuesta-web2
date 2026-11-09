# Pruebas de funcionamiento (apartado 6)

Todas las pruebas usan **datos ficticios**.

Hay dos formas de comprobar la aplicación:

1. **Automática:** `npm run probar` lanza los 6 casos contra la API (con llamadas reales a OpenAI) y guarda el resultado en [`resultados-pruebas.md`](./resultados-pruebas.md).
2. **Manual en la interfaz:** los pasos de la tabla de abajo.

```bash
npm run dev          # terminal 1
npm run probar       # terminal 2  (o: npm run probar -- https://tu-app.vercel.app)
```

## Casos

| # | Situación | Cómo probarlo en la interfaz | Resultado esperado |
|---|---|---|---|
| 1 | **Solicitud clara** | Botón de ejemplo «Restaurante» → *Obtener propuesta* | Propone web base, carta, reservas e idioma adicional (cantidad 1), cada uno con su justificación. |
| 2 | **Solicitud ambigua** | Ejemplo «Idea vaga» → *Obtener propuesta* | Aparecen dudas concretas (tipo de negocio, nº de páginas…) en «Aclaraciones». |
| 3 | **Servicio que no ofrecemos** | Ejemplo «Restaurante» y añadir «…y una app móvil» | La app móvil aparece en el aviso ámbar «Fuera de catálogo · pendiente de valorar». No se inventa ningún servicio ni se suma al importe. |
| 4 | **Descripción vacía** | Dejar la descripción vacía (o solo espacios) y enviar | Error junto al campo: «La descripción del proyecto no puede estar vacía.» El servidor también lo valida (HTTP 400), aunque se salte el formulario. |
| 5 | **Fallo de OpenAI** | En el panel *Modo pruebas*, elegir un fallo → *Obtener propuesta* | Aviso rojo con el motivo y botón **Reintentar**. Al pulsarlo, la petición va normal y funciona. Con «clave no válida» no se ofrece reintentar (no serviría). |
| 6 | **Modificar servicios antes del PDF** | En la revisión: quitar un servicio, añadir otro del catálogo, cambiar cantidades → *Confirmar y calcular* → *Revisar documento* → *Aceptar y descargar* | El PDF contiene exactamente la selección final y los importes calculados por el servidor. Cualquier cambio tras calcular obliga a recalcular. |

## Modo pruebas (simular fallos de OpenAI)

Se activa automáticamente con `npm run dev`. En Vercel solo si se define `NEXT_PUBLIC_MODO_PRUEBAS=1`.

El fallo simulado **recorre el mismo código que un fallo real**, no es un atajo:

| Simulación | Qué se hace de verdad | Mensaje al usuario | ¿Reintentar? |
|---|---|---|---|
| Sin conexión | Se llama a un dominio inexistente | «No se ha podido contactar con el servicio de IA…» | Sí |
| Tarda demasiado | Timeout de 1 ms | «El servicio de IA está tardando demasiado…» | Sí |
| Saturado (429) | Respuesta HTTP 429 | «El servicio de IA está saturado o sin saldo…» | Sí |
| Clave no válida | Llamada real a OpenAI con una clave falsa (401) | «La clave de la API de OpenAI no es válida.» | No |

El fallo es de un solo uso: el botón *Reintentar* lanza una petición normal.

## Garantías comprobadas

- **Los importes solo los calcula el servidor.** El script envía al generar el PDF precios falsos de 1 € y comprueba que el total del PDF coincide con el calculado por `/api/presupuesto`.
- **El PDF refleja la selección final.** `/api/pdf` devuelve en las cabeceras `X-Presupuesto-Servicios` y `X-Presupuesto-Total` los datos con los que se ha generado, y el script los compara con la selección modificada.
- **La IA no inventa servicios.** En todos los casos se comprueba que los `id` devueltos existen en `lib/catalogo.ts`.
