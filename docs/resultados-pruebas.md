# Resultados de las pruebas automáticas

- Fecha: 9/11/2026, 18:42:54
- Servidor: http://localhost:3000
- Resultado: **15/15 correctas**

Generado con `npm run probar`. Las propuestas se generan con llamadas reales a OpenAI,
así que los textos pueden variar entre ejecuciones.

| | Caso | Detalle |
|---|---|---|
| ✅ | 1. Solicitud clara | HTTP 200 · servicios: web-basica, carta-menu, formulario-reservas, idioma-extra |
| ✅ | 2. Solicitud ambigua | HTTP 200 · 2 dudas: ¿Qué tipo de negocio tiene Juan Pérez? / ¿Cuántas páginas adicionales necesita? |
| ✅ | 3. Servicio que no ofrecemos | HTTP 200 · pendiente de valorar: Aplicación móvil nativa · ningún id inventado: true |
| ✅ | 4. Descripción vacía | HTTP 400 · "La descripción del proyecto no puede estar vacía." |
| ✅ | 4. Descripción solo espacios | HTTP 400 · "La descripción del proyecto no puede estar vacía." |
| ✅ | 4. Descripción demasiado corta | HTTP 400 · "Describe tu proyecto con algo más de detalle (mínimo 20 caracteres)." |
| ✅ | 4. Descripción demasiado larga | HTTP 400 · "La descripción no puede superar 2000 caracteres." |
| ✅ | 5. Fallo OpenAI (red) | HTTP 502 · "No se ha podido contactar con el servicio de IA. Inténtalo de nuevo." · reintentable: true |
| ✅ | 5. Fallo OpenAI (timeout) | HTTP 502 · "El servicio de IA está tardando demasiado. Inténtalo de nuevo." · reintentable: true |
| ✅ | 5. Fallo OpenAI (saturado) | HTTP 502 · "El servicio de IA está saturado o sin saldo. Espera un momento e inténtalo de nuevo." · reintentable: true |
| ✅ | 5. Fallo OpenAI (clave) | HTTP 502 · "La clave de la API de OpenAI no es válida." · reintentable: false |
| ✅ | 5. Reintento tras el fallo | HTTP 200 · 3 servicios |
| ✅ | 6. Cálculo de la selección modificada | HTTP 200 · total 1367.3 € |
| ✅ | 6. PDF refleja la selección final | quitado "carta-menu", añadido "seo-basico" · en el PDF: web-basicax1,formulario-reservasx1,idioma-extrax1,seo-basicox1 |
| ✅ | 6. PDF con importes del servidor | total PDF 1367.3 € = total calculado 1367.3 € (se enviaron precios falsos de 1 €) |
