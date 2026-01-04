# 3D Book Carousel - Three.js Project

Un carrusel interactivo de libros en 3D construido con Three.js, donde los libros rotan suavemente siguiendo el cursor del usuario y ofrecen una experiencia visual inmersiva.

## 🎨 Características

- **Carrusel 3D interactivo**: Navega entre 5 libros con animaciones suaves
- **Controles múltiples**: 
  - Drag & drop con el ratón o dedo (touch)
  - Scroll del mouse sobre el canvas
  - Botones de navegación laterales
- **Rotación dinámica**: Los libros giran automáticamente mostrando su parte trasera cuando no están en el centro
- **Fondos adaptativos**: El color de fondo cambia suavemente según el libro seleccionado
- **Responsive**: Optimizado para móviles y desktop con diferentes configuraciones
- **Clickeable**: Cada libro es clickeable y redirige a una URL personalizada
- **Efectos visuales**: Luces direccionales para reflejos realistas en las portadas de los libros

## 🚀 Setup

### Requisitos previos
Descarga e instala [Node.js](https://nodejs.org/en/download/).

### Instalación

```bash
# Instalar dependencias (solo la primera vez)
npm install

# Ejecutar servidor de desarrollo en localhost:5173
npm run dev

# Construir para producción en el directorio dist/
npm run build
```

## 📁 Estructura del proyecto

```
├── src/
│   ├── index.html          # HTML principal
│   ├── script.js           # Lógica principal del carrusel
│   ├── style.css           # Estilos CSS
├── static/
│   ├── book.glb            # Modelo 3D del libro
│   └── book-covers/        # Texturas de las portadas
└── package.json            # Dependencias del proyecto
```

## 🎮 Controles

- **H**: Mostrar/ocultar panel de control (GUI)
- **Click en libro**: Redirige a la URL configurada
- **Arrastrar**: Mueve el carrusel horizontalmente
- **Scroll**: Navega el carrusel (solo cuando el mouse está sobre el canvas)
- **Flechas laterales**: Navega entre libros

## 🛠️ Tecnologías utilizadas

- **Three.js**: Biblioteca 3D para WebGL
- **Vite**: Build tool y dev server
- **lil-gui**: Panel de control para ajustar parámetros en tiempo real

## 📝 Notas

- Los libros deben estar en formato `.glb` en la carpeta `static/`
- Las texturas de las portadas deben estar en `static/book-covers/`
- Puedes ajustar todos los parámetros del carrusel desde el panel de control (presiona 'H' para mostrarlo)
