# AstroBitácora — laboratorio de desempeño web

Proyecto base para una práctica de **Diseño Web Adaptable** centrada en auditoría y optimización del tiempo de carga.

> **Importante:** el sitio contiene problemas de desempeño **intencionales**. No optimices nada antes de obtener y guardar una medición inicial.

## Objetivo de la práctica

Publicar una versión inicial del sitio, medirla con Lighthouse y PageSpeed Insights, identificar oportunidades de mejora y aplicar cambios justificables usando HTML, CSS y una cantidad mínima de JavaScript.

La meta no es obtener un número perfecto, sino demostrar un proceso: **medir → formular una hipótesis → cambiar → volver a medir → comparar**.

## Estructura

```text
astro-performance-lab/
├── index.html
├── styles.css
├── script.js
├── GUIA_PRACTICA.md
├── AUDITORIA.md
└── assets/
    └── img/
        ├── hero-cosmos.jpg 
        https://res.cloudinary.com/dkeu1rgrm/image/upload/v1789673898/hero-cosmos_tczcix.jpg
        ├── andromeda.jpg
        https://res.cloudinary.com/dkeu1rgrm/image/upload/v1789673889/andromeda_yw826t.jpg
        ├── orion.jpg
        https://res.cloudinary.com/dkeu1rgrm/image/upload/v1789673891/orion_kfemi7.jpg
        ├── lunar-horizon.jpg 
        https://res.cloudinary.com/dkeu1rgrm/image/upload/v1789673886/lunar-horizon_cu8glp.jpg
        ├── exoplanet.jpg
        https://res.cloudinary.com/dkeu1rgrm/image/upload/v1789673893/exoplanet_njwv79.jpg
        └── deep-field.jpg 
        https://res.cloudinary.com/dkeu1rgrm/image/upload/v1789673886/deep-field_grr0me.jpg
```

## Antes de comenzar

1. Abre el proyecto localmente y verifica que todas las imágenes carguen.
2. No conviertas imágenes, no agregues `loading="lazy"`, no cambies el `<script>` y no agregues dimensiones todavía.
3. Haz un commit inicial. Ejemplo:

```bash
git init
git add .
git commit -m "chore: sitio base para auditoria"
```

## Publicación en Netlify

### Opción A — desde GitHub

1. Sube este proyecto a un repositorio de GitHub.
2. En Netlify, crea un nuevo sitio desde un repositorio existente.
3. Selecciona el repositorio.
4. Este proyecto no tiene build: deja vacío el comando de construcción.
5. Usa la raíz del repositorio como directorio de publicación.
6. Publica y copia la URL pública.

### Opción B — despliegue manual

También puedes arrastrar la carpeta del proyecto al área de despliegue manual de Netlify. Para la práctica es preferible GitHub porque permite documentar los cambios con commits.

## Publicación en Vercel

1. Sube el proyecto a GitHub.
2. En Vercel, importa el repositorio.
3. Selecciona **Other** o un proyecto estático si solicita framework.
4. No se necesita comando de build ni carpeta especial de salida.
5. Despliega y copia la URL pública.

## Herramientas de medición

- **Lighthouse**: Chrome → DevTools → Lighthouse → Analyze.
- **PageSpeed Insights**: analiza la URL pública del sitio.
- Conserva evidencia de la medición inicial y final.

Lee `GUIA_PRACTICA.md` antes de modificar el proyecto y usa `AUDITORIA.md` como bitácora de resultados.
