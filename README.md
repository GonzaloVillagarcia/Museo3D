# Museo3D - The Vault (Homenaje a Alfredo Di Stéfano)

Una aplicación interactiva en 3D desarrollada con React, Three.js y React Three Fiber que recrea una galería de museo virtual. El espacio rinde homenaje a grandes figuras del fútbol, centrándose principalmente en la legendaria carrera de Alfredo Di Stéfano ("La Saeta Rubia") e incorporando camisetas históricas, audios explicativos y detalles interactivos.

## 🚀 Características
- **Experiencia Inmersiva en 3D:** Recorrido virtual interactivo en tiempo real por diferentes salas de exhibición.
- **Cinemática de Entrada Fluida:** Animación de cámara cinematográfica inicial sin fricción.
- **Audios Interactivos:** Explicaciones en audio para cada exhibición (camisetas de Jordania, Sri Lanka, Palestina, Kuwait, Boccini y la Bruja Verón).
- **Rendimiento de GPU Optimizado:** Pre-renderizado inteligente de mapas de sombras (shadow maps) y compilación de shaders en la pantalla de carga para eliminar microcortes y spikes de fotogramas (frame drops) durante el recorrido.
- **Interfaz Moderna:** Paneles interactivos de información con diseño premium y animaciones fluidas.

## 🛠️ Tecnologías
- **Core:** [React 18](https://react.dev/) + [Vite](https://vite.dev/)
- **Gráficos 3D:** [Three.js](https://threejs.org/) + [@react-three/fiber](https://r3f.docs.pmnd.rs/) + [@react-three/drei](https://github.com/pmndrs/drei)
- **Despliegue:** GitHub Pages + GitHub Actions para integración continua y despliegue automático.
