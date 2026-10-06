# Órbita — Estudio creativo

Proyecto Astro independiente de Lumux Esencial. Siete capítulos con una identidad lavanda/lima: escultura ambiental, manifiesto SVG, muro asimétrico de proyectos, laboratorio de partículas, capacidades interactivas, publicación y brief.

```sh
npm install
npm run dev
npm run build
npm run preview
```

Vista local: http://127.0.0.1:4333

- Texto principal y navegación: `src/content/site.es.json`.
- Manifiesto, laboratorio y publicación: `src/content/experience.json`.
- Paleta y fuentes: `src/content/theme.json`; escalas: `tokens.css`.
- Ritmo Lenis: `src/content/motion.json`.
- Fotografía conceptual local: `public/images`; créditos y prompts en la documentación general.
- Diseño: `src/styles/site.css`; coreografía: `src/scripts/motion.ts`.
- Escultura y 4,600 partículas: `src/scripts/scene.ts`. La cámara adapta el encuadre y la transformación conserva el mismo recorrido en móvil, tablet y escritorio.

El control de movimiento pausa Three.js, GSAP y Lenis. Se incluyen respaldos SVG para WebGL no disponible, ahorro de datos y movimiento reducido. Marca, proyectos e imágenes son de demostración. El formulario valida en el navegador y no envía ni guarda datos.
