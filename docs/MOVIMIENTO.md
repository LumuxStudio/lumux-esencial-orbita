# Desplazamiento y escenas

Portada fijada mientras la escultura rota, se aleja y modifica sutilmente su superficie mediante un shader; el portafolio entra con un encuadre expansivo y las letras del estudio se desplazan al atravesar la sección.

## Ajustes

`src/content/motion.json` es independiente por proyecto.

| Campo | Efecto | Rango admitido |
| --- | --- | --- |
| lerp | Mayor valor: rueda más directa; menor: más inercia | 0.04–0.2 |
| wheelMultiplier | Cantidad de avance por rueda | 0.5–1.5 |
| heroScroll | Duración del recorrido fijado, en alturas de pantalla | 0.2–1.5 |
| featureScroll | Duración del recorrido secundario, en alturas de pantalla | 0.2–1.5 |
| parallax | Profundidad fotográfica | 0–0.2 |

Los valores se validan antes de compilar. Lenis comparte reloj con GSAP mediante su ticker y actualiza ScrollTrigger; no se crea un segundo bucle para el desplazamiento. El tacto móvil es nativo (`syncTouch: false`). La rueda conserva navegación normal sobre áreas de texto. Los enlaces internos actualizan el hash y llevan el foco al destino al terminar.

El modo de movimiento reducido no inicializa Lenis ni los recorridos GSAP. Las escenas Three.js conservan su respaldo estático. Pausar movimiento destruye Lenis y revierte fijaciones y transformaciones; al reanudar se reconstruyen, conservando la posición de la escena visible.

Las fijaciones se usan únicamente desde 1024 px de ancho y 680 px de alto. En móvil se reemplazan por desplazamientos y profundidad suaves, con los proyectos en su distribución normal.

## Verificación de esta revisión

- Build independiente, validación de contenido y Astro check: correctos.
- Siete pruebas por proyecto (21 en total): correctas; incluyen límites de configuración de movimiento.
- Navegador real a 320, 375, 414, 768 y 1280 px: sin desbordamiento horizontal ni enlaces internos rotos; un h1 por sitio.
- Comprobados visualmente: orientación 3D ligada al scroll, galería de Norte, despiece progresivo, expansión de cocina, navegación por anclas y pausa/reanudación sin salto de escena.
- La escena de Órbita deja de renderizar al salir de pantalla; no se detectaron errores de shader en las escenas revisadas.

El informe de anchos está en `tools/scroll-browser-results.json` del espacio de trabajo. La revisión previa de accesibilidad se conserva en `docs/VERIFICACION.md`; no es un informe nuevo de axe para estos recorridos.

## Referencias consultadas en desplazamiento

[Illoca](https://illoca.unseen.co/), [Imersion](https://www.imersion.io/), [h2a](https://www.h2a.lu/), [Extrafazant](https://www.extrafazant.nl/) y [Cerebrium](https://cerebrium.ai/). Se observaron cambios de escala y encuadre, entrada del contenido y profundidad durante el recorrido. Se aplicaron a las identidades existentes sin copiar sus recursos.

Integración basada en la [documentación oficial de Lenis](https://github.com/darkroomengineering/lenis#gsap-scrolltrigger) y la [documentación de ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/).
