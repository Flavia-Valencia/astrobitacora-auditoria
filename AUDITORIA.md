# Auditoría y optimización de AstroBitácora

- **Repositorio:** https://github.com/Flavia-Valencia/astrobitacora-auditoria
- **URL pública:** https://astrobitacora-auditoria.vercel.app/
- **Autora:** Flavia Valencia

> Los campos marcados con `[completar]` se llenan después de optimizar y volver a medir.

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

1. **Improve image delivery (ahorro estimado: 30,785 KiB).** Casi todo el peso de la página viene de las 6 imágenes JPEG, que no están redimensionadas ni comprimidas ni en un formato moderno.
2. **LCP request discovery.** La imagen que define el LCP no se descubre ni se prioriza a tiempo. Se relaciona con la ausencia de `fetchpriority="high"` en el hero y con la competencia de las otras 5 imágenes por el ancho de banda.
3. **Avoid enormous network payloads (31,119 KiB)** junto con **Image elements do not have explicit width and height**. El primero confirma el problema de peso y el segundo confirma que las 6 `<img>` no declaran dimensiones.

Otros diagnósticos observados: *Render-blocking requests* (script sin `defer` en el `<head>`), *Minimize main-thread work* (3.3 s) y *Avoid long main-thread tasks* (6 tareas largas).

**Elemento LCP antes de optimizar:** `[completar: revisar el desplegable "LCP breakdown" de Lighthouse]`

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
| **Total** | **≈ 37.8 MB** |

El total transferido medido por Lighthouse (≈ 30.4 MB) es menor porque Cloudinary sirve las imágenes con algo de compresión.

**¿Todas las imágenes necesitan descargarse inmediatamente?**
No. Solo el hero está en el primer viewport. Las 5 imágenes de la galería están más abajo y no usan `loading="lazy"`, por lo que el navegador las descarga todas al cargar la página.

**¿Hay imágenes sin dimensiones explícitas?**
Sí. Las 6 etiquetas `<img>` no tienen `width` ni `height`. Aun así el CLS medido fue 0, probablemente porque el CSS ya reserva el espacio `[confirmar revisando styles.css]`.

**¿El recurso visual principal tiene un formato y tamaño razonables?**
No. El hero es un JPEG de unos 8 MB, sin formato moderno y con un tamaño muy superior al que se muestra en pantalla.

**¿Cómo se carga el JavaScript?**
Con `<script src="script.js"></script>` en el `<head>`, sin `defer` ni `async`. Bloquea el parseo del HTML mientras se descarga y ejecuta. El archivo es muy pequeño (799 bytes), por lo que se espera un impacto limitado.

**¿Hay recursos que podrían entregarse en un formato más eficiente?**
Las 6 imágenes: de JPEG a WebP (o AVIF).

### Hipótesis

1. **Si convierto el hero a WebP y lo redimensiono al tamaño con que realmente se muestra, espero mejorar el LCP, porque** el hero es la imagen principal visible al cargar y pasar de unos 8 MB a unos pocos cientos de KB reduce mucho su tiempo de descarga.
2. **Si agrego `loading="lazy"` a las 5 imágenes de la galería, espero reducir los bytes iniciales y mejorar el LCP, porque** esas imágenes (más de 30 MB) dejan de competir por el ancho de banda con el hero durante la carga inicial.
3. **Si agrego `width` y `height` a todas las imágenes, espero que el CLS se mantenga en 0 (o no empeore) al cambiar las imágenes, porque** el navegador reserva el espacio antes de que cada imagen termine de descargarse.
4. **Si agrego `defer` al script y `fetchpriority="high"` al hero, espero una mejora pequeña en FCP y en la detección del LCP, porque** el parseo del HTML ya no se detiene y el navegador prioriza la imagen principal. Como `script.js` usa `DOMContentLoaded`, `defer` es seguro.
5. **Si reduzco el peso de las imágenes, espero que baje el TBT, porque** decodificar imágenes enormes ocupa el hilo principal, mientras que el script propio es demasiado pequeño para explicarlo.

---

## Fase 3. Optimizaciones aplicadas

| Prioridad | Commit | Cambio | Problema observable que resuelve |
|---|---|---|---|
| 1 | `perf: optimizar imagen hero` | `[completar]` hero a WebP, ancho ___ px, sin `loading="lazy"`, con `fetchpriority="high"` | Hero de ≈ 8 MB; LCP 4.2 s |
| 2 | `perf: convertir imagenes de galeria a webp` | `[completar]` 5 imágenes a WebP, ancho ___ px | "Improve image delivery": 30,785 KiB de ahorro estimado |
| 3 | `perf: diferir imagenes fuera del viewport` | `loading="lazy"` en las 5 imágenes de la galería | Se descargaban todas al inicio |
| 4 | `perf: agregar width y height a imagenes` | `width` y `height` en las 6 `<img>` | Diagnóstico "Image elements do not have explicit width and height" |
| 5 | `perf: evitar bloqueo del script principal` | `defer` en `<script src="script.js">` | "Render-blocking requests" |
| 6 | `docs: registrar resultados finales` | Esta bitácora y evidencias finales | Documentar el antes y el después |

Optimización secundaria (opcional): minificar CSS y JS. Se espera poco impacto porque pesan unos pocos KB.

### Peso de las imágenes antes y después

| Imagen | JPEG original | WebP final | Ahorro |
|---|---|---|---|
| hero-cosmos | 7.80 MB | `[completar]` | `[completar]` |
| andromeda | 6.05 MB | `[completar]` | `[completar]` |
| exoplanet | 6.01 MB | `[completar]` | `[completar]` |
| lunar-horizon | 6.00 MB | `[completar]` | `[completar]` |
| orion | 6.00 MB | `[completar]` | `[completar]` |
| deep-field | 5.93 MB | `[completar]` | `[completar]` |
| **Total** | **≈ 37.8 MB** | `[completar]` | `[completar]` |

---

## Fase 4. Medición final

Condiciones iguales a las de la medición inicial: mismo navegador (Edge), misma emulación móvil, misma herramienta y configuración.

| Métrica | Antes | Después | Cambio |
|---|---|---|---|
| Fecha y hora | 01/10/2026 18:24:11 | `[completar]` | |
| Puntaje de desempeño | 74 | `[completar]` | |
| FCP | 1.1 s | `[completar]` | |
| LCP | 4.2 s | `[completar]` | |
| CLS | 0 | `[completar]` | |
| TBT | 470 ms | `[completar]` | |
| Speed Index | 1.4 s | `[completar]` | |
| Bytes transferidos | 31,119 KiB | `[completar]` | |

Evidencias: `evidencias/final-metricas.png` y `evidencias/final-insights.png`.

### Análisis

- **¿Qué métrica cambió más?** `[completar]`
- **¿Qué optimización redujo más bytes?** `[completar]` (hipótesis: la conversión a WebP con redimensionado)
- **¿Qué cambio tuvo poco impacto?** `[completar]` (hipótesis: `defer`, por el tamaño mínimo del script)
- **¿Apareció algún problema nuevo?** `[completar]`
- **¿Conservaría todos los cambios en producción? ¿Por qué?** `[completar]`

---

## Preguntas finales

**1. ¿Qué significa LCP y cuál fue el elemento LCP antes y después?**
LCP (Largest Contentful Paint) mide cuánto tarda en mostrarse el elemento visible más grande del primer viewport. Un buen valor es de 2.5 s o menos.
- Antes: `[completar]`
- Después: `[completar]`

**2. ¿Cómo puede una imagen sin dimensiones explícitas contribuir a CLS?**
Sin `width` y `height`, el navegador no sabe cuánto espacio reservar hasta que la imagen se descarga. Al llegar, el contenido de abajo se desplaza, lo que genera un cambio de diseño inesperado. Con las dimensiones declaradas, el navegador calcula la proporción y reserva el espacio desde el inicio. En esta página el CLS inicial fue 0, probablemente porque el CSS ya reserva el espacio `[confirmar con styles.css]`, pero declarar las dimensiones sigue siendo una buena práctica.

**3. ¿Por qué `loading="lazy"` es útil en una galería, pero puede ser mala idea en una imagen principal?**
En una galería, las imágenes están fuera del primer viewport, así que diferir su descarga ahorra bytes y ancho de banda para lo que sí se ve primero. En la imagen principal ocurre lo contrario: es visible al cargar y suele ser el elemento LCP, y con `lazy` el navegador espera a calcular el layout antes de pedirla, lo que retrasa el LCP. Para el hero conviene cargarla de inmediato, incluso con `fetchpriority="high"`.

**4. Diferencia entre `defer` y `async`. ¿Cuál elegí y por qué?**
Ambos descargan el script sin bloquear el parseo del HTML. `async` lo ejecuta apenas termina de descargarse, en cualquier momento y sin garantizar el orden entre scripts. `defer` lo ejecuta después de terminar de parsear el HTML, antes de `DOMContentLoaded`, y respeta el orden. Elegí `defer` porque `script.js` depende del DOM (botones, contador, año) y usa `DOMContentLoaded`, y porque es un único script propio sin dependencias externas.

**5. ¿Qué formato de imagen elegí y qué comparación de peso obtuve?**
`[completar: formato elegido (WebP), calidad usada y comparación total de pesos con la tabla de la Fase 3]`

**6. Si el puntaje sube, pero el LCP sigue por encima del objetivo, ¿la optimización está terminada?**
No. El puntaje es una combinación ponderada de varias métricas, y un buen puntaje puede ocultar un LCP malo, que es lo que más percibe el usuario al cargar la página. Habría que investigar qué retrasa el elemento LCP (tamaño de la imagen, descubrimiento tardío, bloqueo de render, servidor o red) y seguir optimizando hasta cumplir el objetivo, o justificar por qué no es posible.

**7.** El enunciado deja esta pregunta en blanco (solo aparece un punto). `[completar si el docente indica cuál es]`

---

## Evidencias

```
evidencias/
├── inicial-puntaje.png
├── inicial-metricas.png
├── inicial-insights.png
├── final-puntaje.png       (pendiente)
├── final-metricas.png      (pendiente)
└── final-insights.png      (pendiente)
```