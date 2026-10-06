# Verificación — 2026-10-03

- Instalación propia con npm ci: correcta.
- Validación JSON, Astro check y compilación estática: correctas.
- Cinco pruebas del contrato de contenido: correctas.
- Navegador Chromium a 320, 375, 414, 768 y 1440 px: sin desbordamiento horizontal, enlaces internos rotos, imágenes faltantes ni errores de JavaScript.
- Un h1 y cinco secciones principales como máximo.
- Axe WCAG 2 A/AA y 2.1 AA: sin infracciones detectadas en la revisión automática de escritorio.
- Formulario: errores de validación y confirmación local correctos; no envía datos.
- HTML sin JavaScript: contenido visible y envío deshabilitado.
- GSAP: carga y anima correctamente.
- Three.js: canvas activo, cambio de geometría/despiece, pausa y retorno al recurso estático al activar movimiento reducido comprobados.

Capturas en `docs/previews/`. Informe de tamaños en el directorio de herramientas del espacio de trabajo. Estas comprobaciones automáticas no sustituyen ensayos en dispositivos físicos.

La compilación informa un módulo de escena superior a 500 kB minificado. Se carga dinámicamente al aproximarse a la escena; el HTML y las fotografías no requieren WebGL. Hay respaldo estático y límite de densidad de píxeles a 1.5.
