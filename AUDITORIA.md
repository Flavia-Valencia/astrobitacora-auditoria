# Auditoría y optimización de AstroBitácora

- **Repositorio:** https://github.com/Flavia-Valencia/astrobitacora-auditoria
- **URL pública:** https://astrobitacora-auditoria.vercel.app/
- **Autora:** Flavia Valencia

---

## Resumen

El desempeño pasó de **74 a 100** en Lighthouse (móvil). El LCP bajó de **4.2 s a 1.3 s** y el TBT de **470 ms a 10 ms**, mientras el CLS se mantuvo en **0**. La causa principal del problema era el peso de las imágenes: seis JPEG de 6 a 8 MB que sumaban unos 37.8 MB y que, tras convertirlas a WebP y redimensionarlas, pasaron a unos 236 KB.

---

## Fase 1. Medición inicial (sitio sin optimizar)

| Dato | Valor |
|---|---|
| URL pública | https://astrobitacora-auditoria.vercel.app/ |
| Fecha y hora de la prueba | 01/10/2026, 18:24:11 |
| Herramienta | Lighthouse en DevTools de Edge |
| Dispositivo / modo | Emulación móvil (iPhone, 375 × 667) |
| Puntaje de desempeño | **74** |
| Accesibilidad / Buenas prácticas / SEO | 100 / 100 / 100 |
| FCP | 1.1 s |
| **LCP** | **4.2 s** (rojo, objetivo ≤ 2.5 s) |
| **CLS** | **0** |
| TBT | 470 ms |
| Speed Index | 1.4 s |
| INP | No lo muestra Lighthouse en laboratorio; se usa TBT como referencia |
| Bytes transferidos | 31,119 KiB (≈ 30.4 MB) |

Evidencias: `evidencias/inicial-puntaje.png`, `evidencias/inicial-metricas.png` y `evidencias/inicial-insights.png`.

### Las tres oportunidades o diagnósticos más importantes

1. **Improve image delivery (ahorro estimado: 30,785 KiB).** Casi todo el peso de la página viene de las 6 imágenes JPEG, que no están redimensionadas, comprimidas ni en un formato moderno.

2. **LCP request discovery.** La imagen que define el LCP no se descubre ni se prioriza a tiempo. Se relaciona con la ausencia de `fetchpriority="high"` en el hero y con la competencia de las otras 5 imágenes por el ancho de banda.

3. **Avoid enormous network payloads (31,119 KiB)** junto con **Image elements do not have explicit width and height**. El primero confirma el problema de peso y el segundo confirma que las 6 `<img>` no declaran dimensiones.

Otros diagnósticos observados: **Render-blocking requests** (script sin `defer` en el `<head>`), **Minimize main-thread work** (3.3 s) y **Avoid long main-thread tasks** (6 tareas largas).

**Elemento LCP antes de optimizar:** `img.hero__image`

---

## Fase 2. Hipótesis

### Inspección del proyecto

**¿Qué archivos pesan más?**

Las 6 imágenes JPEG originales. El HTML, CSS y JS juntos pesan alrededor de 16 KB, así que son irrelevantes frente a las imágenes.

| Imagen | Peso original (JPEG) |
|---|---|
| hero-cosmos.jpg | 8,183,389 B (≈ 7.80 MB) |
| andromeda.jpg | 6,344,666 B (≈ 6.05 MB) |
| exoplanet.jpg | 6,304,296 B (≈ 6.01 MB) |
| lunar-horizon.jpg | 6,297,463 B (≈ 6.00 MB) |
| orion.jpg | 6,294,800 B (≈ 6.00 MB) |
| deep-field.jpg | 6,217,453 B (≈ 5.93 MB) |
| **Total** | **39,642,067 B (≈ 37.8 MB)** |

El total transferido medido por Lighthouse (≈ 30.4 MB) es menor porque Cloudinary sirve las imágenes con algo de compresión.

**¿Todas las imágenes necesitan descargarse inmediatamente?**

No. Solo el hero está en el primer viewport. Las 5 imágenes de la galería están más abajo y no usaban `loading="lazy"`, por lo que el navegador las descargaba todas al cargar la página.

**¿Hay imágenes sin dimensiones explícitas?**

Sí. Las 6 etiquetas `<img>` no tenían `width` ni `height`. Aun así el CLS medido fue 0. Revisando `styles.css`, la explicación es que `.hero__image` tiene `min-height: 620px`, que reserva el espacio del hero aunque la imagen no haya cargado, y que las imágenes de la galería están fuera del primer viewport, donde el desplazamiento no se contabiliza en el CLS de la carga inicial.

**¿El recurso visual principal tiene un formato y tamaño razonables?**

No. El hero era un JPEG de unos 8 MB, sin formato moderno y con un tamaño muy superior al que se muestra en pantalla.

**¿Cómo se carga el JavaScript?**

Con `<script src="script.js"></script>` en el `<head>`, sin `defer` ni `async`. Bloquea el parseo del HTML mientras se descarga y ejecuta. El archivo es muy pequeño (799 bytes), por lo que se esperaba un impacto limitado.

**¿Hay recursos que podrían entregarse en un formato más eficiente?**

Las 6 imágenes: de JPEG a WebP (o AVIF).

### Hipótesis

1. **Si convierto el hero a WebP y lo redimensiono al tamaño con que realmente se muestra, espero mejorar el LCP, porque** el hero es la imagen principal visible al cargar y pasar de unos 8 MB a unos pocos cientos de KB reduce mucho su tiempo de descarga.

2. **Si agrego `loading="lazy"` a las 5 imágenes de la galería, espero reducir los bytes iniciales y mejorar el LCP, porque** esas imágenes dejan de competir por el ancho de banda con el hero durante la carga inicial.

3. **Si agrego `width` y `height` a todas las imágenes, espero que el CLS se mantenga en 0, porque** el navegador reserva el espacio antes de que cada imagen termine de descargarse.

4. **Si agrego `defer` al script y `fetchpriority="high"` al hero, espero una mejora pequeña en FCP y en la detección del LCP, porque** el parseo del HTML ya no se detiene y el navegador prioriza la imagen principal. Como `script.js` usa `DOMContentLoaded`, `defer` es seguro.

5. **Si reduzco el peso de las imágenes, espero que baje el TBT, porque** decodificar imágenes enormes ocupa el hilo principal, mientras que el script propio es demasiado pequeño para explicarlo.

---

## Fase 3. Optimizaciones aplicadas

Historial real del repositorio:

| Commit | Cambio | Problema observable que resuelve |
|---|---|---|
| `chore: sitio base para auditoria` | Sitio original sin optimizar | Punto de partida |
| `docs: registrar medicion inicial y evidencias` | Bitácora y capturas iniciales | Evidencia del antes |
| `perf: optimizar imagen hero` | Hero a WebP (1600 × 900), `fetchpriority="high"`, sin `loading="lazy"`, `height: auto` en `.hero__image` | Hero de ≈ 8 MB; LCP de 4.2 s |
| `perf: convertir imagenes de galeria a webp` | 5 imágenes a WebP (1000 × 625) | "Improve image delivery": 30,785 KiB de ahorro estimado |
| `perf: diferir imagenes fuera del viewport` | `loading="lazy"` en las 5 imágenes de la galería | Las 5 se descargaban al inicio aunque no se veían |
| `perf: evitar bloqueo del script principal` | `defer` en `<script src="script.js">` | "Render-blocking requests" |
| `perf: agregar width y height a imagenes` | Se agregaron `width="W" height="H"` **sin reemplazar los placeholders** (ver abajo) | "Image elements do not have explicit width and height" |
| `fix: corregir width y height reales de las imagenes` | Hero 1600 × 900 y galería 1000 × 625 | Corrige el commit anterior |
| `docs: registrar resultados finales` | Esta bitácora y evidencias finales | Documentar el antes y el después |

Optimización secundaria no aplicada: minificar CSS y JS. Pesan unos pocos KB, por lo que se espera un impacto mínimo.

### Un error detectado durante el proceso

En el commit de `width` y `height` quedaron los valores literales `"W"` y `"H"` en las 6 imágenes, y el navegador los ignora. Una primera medición (19:22:30, puntaje 99) todavía mostraba el diagnóstico **"Image elements do not have explicit width and height"**, y además se hizo apenas un minuto después del último commit, antes de que el despliegue estuviera publicado. Con `Select-String` sobre `index.html` se confirmó el problema, se obtuvieron las medidas reales desde la consola del navegador (`naturalWidth` y `naturalHeight`) y se corrigió en un commit aparte. Esa medición se descarta como final y se conserva solo como referencia.

### Peso de las imágenes antes y después

| Imagen | JPEG original | WebP final | Reducción |
|---|---|---|---|
| hero-cosmos | 8,183,389 B (7.80 MB) | 59,960 B (58.6 KB) | 99.3 % |
| andromeda | 6,344,666 B (6.05 MB) | 35,836 B (35.0 KB) | 99.4 % |
| exoplanet | 6,304,296 B (6.01 MB) | 36,586 B (35.7 KB) | 99.4 % |
| lunar-horizon | 6,297,463 B (6.00 MB) | 37,182 B (36.3 KB) | 99.4 % |
| orion | 6,294,800 B (6.00 MB) | 35,526 B (34.7 KB) | 99.4 % |
| deep-field | 6,217,453 B (5.93 MB) | 36,190 B (35.3 KB) | 99.4 % |
| **Total** | **39,642,067 B (37.8 MB)** | **241,280 B (235.6 KB)** | **99.4 %** |

Formato elegido: **WebP**, calidad aproximada de 75, exportado con Squoosh. El hero a 1600 px de ancho y las 5 imágenes de la galería a 1000 px.

---

## Fase 4. Medición final

Condiciones iguales a las de la medición inicial: Edge, emulación móvil de iPhone (375 × 667), Lighthouse con la categoría Performance, ventana de incógnito.

| Métrica | Antes (18:24:11) | Después (19:41:01) | Cambio |
|---|---|---|---|
| Puntaje de desempeño | 74 | **100** | +26 puntos |
| FCP | 1.1 s | 1.0 s | −0.1 s |
| LCP | 4.2 s | 1.3 s | −2.9 s (−69 %) |
| CLS | 0 | 0 | Se mantuvo |
| TBT | 470 ms | 10 ms | −460 ms (−98 %) |
| Speed Index | 1.4 s | 1.1 s | −0.3 s |
| Bytes transferidos | 31,119 KiB | 102 kB | Reducción del tráfico inicial |

### Datos de Network de la medición final

Con **Disable cache** activado:

- Requests: **5**
- Transferred: **102 kB**
- Resources: **109 kB**
- Finish: **529 ms**
- DOMContentLoaded: **454 ms**
- Load: **455 ms**

Estos 102 kB corresponden a la carga inicial. Como las imágenes de la galería usan `loading="lazy"`, no representan necesariamente todo el peso que se descargaría si el usuario recorriera toda la página.

Evidencias: `evidencias/final-puntaje.png`, `evidencias/final-metricas.png` y `evidencias/final-insights.png`.

### Medición intermedia descartada (19:22:30)

| Métrica | Valor |
|---|---|
| Puntaje | 99 |
| FCP / LCP | 1.2 s / 1.3 s |
| TBT | 130 ms |
| CLS | 0 |
| Speed Index | 1.6 s |

Se descarta porque se hizo antes de publicar la corrección de `width` y `height`. En esa corrida también apareció el diagnóstico **"Page prevented back/forward cache restoration"**, que no volvió a aparecer en la medición final.

### Insights en la medición final

- **Improve image delivery**: ahorro estimado de 139 KiB (antes: 30,785 KiB).

- **Render-blocking requests** y **Network dependency tree**: siguen apareciendo.

- **Avoid long main-thread tasks**: 3 tareas largas (antes: 6).

- Ya no aparecen **Avoid enormous network payloads** ni **Image elements do not have explicit width and height**.

### Análisis

**¿Qué métrica cambió más?**

El LCP en tiempo absoluto, de 4.2 s a 1.3 s, que pasó de rojo a verde. En porcentaje, el TBT bajó más (−98 %). Ambos se explican por el mismo cambio: dejar de descargar y decodificar imágenes de 6 a 8 MB.

**¿Qué optimización redujo más bytes?**

La conversión a WebP con redimensionado. Las seis imágenes pasaron de 37.8 MB a 235.6 KB, una reducción del 99.4 %. `loading="lazy"` no reduce el peso total de la página, solo difiere cuándo se descargan las imágenes de la galería.

**¿Qué cambio tuvo poco impacto?**

`defer` en el script. Pesa 799 bytes, así que el bloqueo que causaba era mínimo. No se midió de forma aislada, por lo que es una inferencia. Tampoco se esperaba mejora en CLS por `width` y `height`: el CLS ya era 0 y se mantuvo.

**¿Apareció algún problema nuevo?**

Sí, uno de proceso y no de rendimiento: el commit de `width` y `height` se subió con los placeholders `"W"` y `"H"` y hubo que corregirlo (ver Fase 3). En la medición final no aparecieron problemas nuevos de rendimiento y el CLS siguió en 0.

**¿Conservaría todos los cambios en producción? ¿Por qué?**

Sí. Cada cambio está justificado por evidencia y ninguno empeoró una métrica. Con una salvedad: los WebP pesan unos 35 KB, y conviene revisar a ojo que mantengan nitidez suficiente, sobre todo las dos tarjetas anchas en pantallas grandes. Si se ven blandas, se puede subir la calidad o el ancho de exportación. Los WebP están ya servidos desde el mismo origen, lo que además elimina la dependencia de Cloudinary.

---

## Preguntas finales

**1. ¿Qué significa LCP y cuál fue el elemento LCP antes y después?**

LCP (Largest Contentful Paint) mide cuánto tarda en mostrarse el elemento de contenido más grande visible en el primer viewport. Un buen valor es de 2.5 s o menos. Pasó de 4.2 s a 1.3 s.

- Antes: `img.hero__image`

- Después: `img.hero__image`

**2. ¿Cómo puede una imagen sin dimensiones explícitas contribuir a CLS?**

Sin `width` y `height`, el navegador no sabe cuánto espacio reservar hasta que la imagen se descarga. Al llegar, el contenido de abajo se desplaza, lo que genera un cambio de diseño inesperado. Con las dimensiones declaradas, el navegador calcula la proporción y reserva el espacio desde el inicio. En esta página el CLS fue 0 desde el principio porque `.hero__image` tiene `min-height: 620px` y las imágenes de la galería están fuera del primer viewport. Declarar las dimensiones sigue siendo buena práctica porque protege el diseño si el CSS cambia.

**3. ¿Por qué `loading="lazy"` es útil en una galería, pero puede ser una mala idea en una imagen principal?**

En una galería, las imágenes están fuera del primer viewport, así que diferir su descarga ahorra ancho de banda para lo que sí se ve primero. En la imagen principal ocurre lo contrario: es visible al cargar y suele ser el elemento LCP. Con `lazy`, el navegador espera a calcular el layout antes de pedirla, lo que retrasa el LCP. Por eso el hero va sin `lazy` y con `fetchpriority="high"`.

**4. Explica la diferencia entre `defer` y `async`. ¿Cuál elegiste y por qué?**

Ambos descargan el script sin bloquear el parseo del HTML. `async` lo ejecuta apenas termina de descargarse, en cualquier momento y sin garantizar orden entre scripts. `defer` lo ejecuta después de terminar de parsear el HTML, antes de `DOMContentLoaded`, y respeta el orden. Elegí `defer` porque `script.js` depende del DOM (botones, contador, año), usa `DOMContentLoaded` y es un único script propio.

**5. ¿Qué formato de imagen elegiste y qué comparación de peso obtuviste?**

WebP, con calidad aproximada de 75. Las 6 imágenes pasaron de 39,642,067 B (37.8 MB) a 241,280 B (235.6 KB), una reducción del 99.4 %. El hero pasó de 7.80 MB a 58.6 KB.

**6. Si el puntaje de desempeño sube, pero LCP sigue por encima del objetivo, ¿consideras terminada la optimización?**

No. El puntaje es una combinación ponderada de varias métricas, y un buen puntaje puede ocultar un LCP malo, que es lo que más percibe el usuario al cargar la página. Habría que investigar qué retrasa el elemento LCP (tamaño de la imagen, descubrimiento tardío, bloqueo de render, servidor o red) y seguir optimizando hasta cumplir el objetivo. En este proyecto no se da ese caso: el puntaje es 100 y el LCP es de 1.3 s, por debajo del objetivo de 2.5 s.

**7.** El enunciado deja esta pregunta en blanco (solo aparece un punto).

---

## Evidencias

```text
evidencias/

├── inicial-puntaje.png

├── inicial-metricas.png

├── inicial-insights.png

├── final-puntaje.png

├── final-metricas.png

└── final-insights.png
```