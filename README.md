# ♟️ Chess Fantasy - Pixel Art Chess

Un juego de ajedrez pixel-art con temática de fantasía, construido con **Astro 5.17** y **SASS**.

![Astro](https://img.shields.io/badge/Astro-5.17-FF5D01?logo=astro)
![SASS](https://img.shields.io/badge/SASS-1.83-CC6699?logo=sass)

## ✨ Características

- 🎨 **Pixel-art 16-bit** con estética JRPG colorida
- 🎮 **Dos modos de juego**: Jugador vs IA y 2 Jugadores locales
- 🧠 **IA inteligente** con algoritmo Minimax y poda alfa-beta (3 niveles de dificultad)
- 📱 **Responsive design** optimizado para móvil
- 🎵 **Audio** con efectos de sonido sintetizados y música (desactivable)
- 🎭 **5 temas visuales**:
  - Bosque Encantado
  - Fortaleza Oscura
  - Cielo Celestial
  - Tierras Volcánicas
  - Reino de Hielo
- ⚔️ **Reglas completas**: enroque, captura al paso, promoción, jaque mate, tablas

## 🚀 Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd astro-chess-fantasy

# Instalar dependencias
bun install
# o
npm install

# Iniciar servidor de desarrollo
bun run dev
# o
npm run dev
```

## 🛠️ Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `bun run dev` | Inicia servidor de desarrollo |
| `bun run build` | Construye para producción |
| `bun run preview` | Previsualiza build de producción |

## 📁 Estructura del Proyecto

```
astro-chess-fantasy/
├── src/
│   ├── components/          # Componentes Astro
│   │   ├── Board.astro      # Tablero 8x8
│   │   ├── Piece.astro      # Piezas individuales
│   │   ├── Menu.astro       # Menú principal
│   │   ├── GameUI.astro     # Panel de control
│   │   ├── PromotionModal   # Modal de promoción
│   │   └── AudioControl     # Control de audio
│   ├── layouts/
│   │   └── Layout.astro     # Layout base
│   ├── pages/
│   │   └── index.astro      # Página principal
│   ├── styles/              # Estilos SASS
│   │   ├── _variables.scss  # Variables globales
│   │   ├── _mixins.scss     # Mixins
│   │   ├── _animations.scss # Animaciones
│   │   ├── _themes.scss     # Temas de tablero
│   │   ├── components/      # Estilos de componentes
│   │   └── main.scss        # Archivo principal
│   ├── scripts/
│   │   ├── chess/           # Lógica del juego
│   │   │   ├── Board.js     # Tablero
│   │   │   ├── Game.js      # Control del juego
│   │   │   ├── AI.js        # Inteligencia artificial
│   │   │   ├── Piece.js     # Clase base de piezas
│   │   │   └── pieces/      # Tipos de piezas
│   │   └── audio/
│   │       └── AudioManager.js
│   └── assets/              # Recursos estáticos
└── public/
    └── favicon.svg
```

## 🎨 Sistema de Piezas (Fantasía)

| Pieza | Blanco (Celestial) | Negro (Oscuro) |
|-------|-------------------|----------------|
| Peón | Soldado dorado | Guerrero orco |
| Caballo | Pegaso | Lobo sombrío |
| Alfil | Mago | Nigromante |
| Torre | Torre del castillo | Fortaleza obsidiana |
| Reina | Reina paladín | Reina vampiresa |
| Rey | Rey celestial | Rey demonio |

## 🧠 Algoritmo de IA

La IA utiliza el algoritmo **Minimax** con **poda alfa-beta**:

- **Fácil**: Profundidad 2
- **Medio**: Profundidad 3
- **Difícil**: Profundidad 4

Incluye:
- Ordenamiento de movimientos (capturas primero)
- Tablas de posición para evaluación
- Control del centro
- Desarrollo de piezas menores

## 📱 Responsive Design

- **Desktop**: Tablero 600px
- **Tablet**: Tablero 500px  
- **Móvil**: Tablero 100% viewport (máx 500px)

Con soporte para:
- Touch events
- Prevenir zoom no deseado
- Interfaz adaptativa

## 🔧 Configuración Astro 5.17

El proyecto aprovecha características de Astro 5.17:

- **Dev Toolbar**: Posicionamiento configurable
- **Image Service**: Sharp con kernel 'nearest' para pixel-art nítido
- **Vite**: Preprocesador SASS con variables globales

## 📝 Licencia

MIT License - Siéntete libre de usar, modificar y distribuir.

---

Hecho con ❤️ y mucho ☕
