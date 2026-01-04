import * as THREE from 'three'
import GUI from 'lil-gui'
import { GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'

/**
 * Base
 */
// Debug
const gui = new GUI()
gui.hide()

window.addEventListener('keydown', (event) => {
    if (event.key === 'h' || event.key === 'H') {
        if (gui._hidden) {
            gui.show()
        } else {
            gui.hide()
        }
    }
})
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Color de fondo inicial
scene.background = new THREE.Color('#DFEFED')

// Colores de fondo para cada libro
const bookBackgroundColors = [
    0xDFEFED, 
    0xFFE5E5, 
    0xE5FFE5, 
    0xFFFFF5, 
    0xFFF5E5  
]

// URLs para cada libro
const bookUrls = [
    'https://example.com/book1',
    'https://example.com/book2',
    'https://example.com/book3',
    'https://example.com/book4',
    'https://example.com/book5'
]


// Textures
const textureLoader = new THREE.TextureLoader()

const textureBook1 = textureLoader.load('./book-covers/book1.jpg')
const textureBook2 = textureLoader.load('./book-covers/book2.jpg')
const textureBook3 = textureLoader.load('./book-covers/book3.jpg')
const textureBook4 = textureLoader.load('./book-covers/book4.jpg')
const textureBook5 = textureLoader.load('./book-covers/book5.jpg')

// Configurar flipY para todas las texturas
textureBook1.flipY = false
textureBook2.flipY = false
textureBook3.flipY = false
textureBook4.flipY = false
textureBook5.flipY = false

// Para que se vea bien las texturas
textureBook1.colorSpace = THREE.SRGBColorSpace
textureBook2.colorSpace = THREE.SRGBColorSpace
textureBook3.colorSpace = THREE.SRGBColorSpace
textureBook4.colorSpace = THREE.SRGBColorSpace
textureBook5.colorSpace = THREE.SRGBColorSpace

//Models
const gltfLoader = new GLTFLoader()

var books = new THREE.Group()

let bookGeometry = new THREE.BufferGeometry()

gltfLoader.load('./book.glb', (gltf) => {
    const textures = [textureBook1, textureBook2, textureBook3, textureBook4, textureBook5]
    
    gltf.scene.traverse((child) => {
        if(child.isMesh){
            bookGeometry = child.geometry.clone()
            
            // Crear 5 libros con diferentes texturas
            for(let i = 0; i < 5; i++){
                const bookMesh = new THREE.Mesh(
                    bookGeometry.clone(), 
                    new THREE.MeshPhysicalMaterial({
                        map: textures[i],
                        roughness: 0.3,      
                        metalness: 0.1,      
                        clearcoat: 0.5,      
                        clearcoatRoughness: 0.2
                    })
                )
                bookMesh.rotateX(Math.PI / 2)
                bookMesh.userData.baseRotationX = Math.PI / 2

                // Guardar el índice relativo (para poder recalcular con bookSpacing)
                bookMesh.userData.indexOffset = i - 2
                bookMesh.userData.baseX = bookMesh.userData.indexOffset * carouselConfig.bookSpacing
                bookMesh.userData.bookIndex = i 
                bookMesh.userData.url = bookUrls[i] 
                
                // Posición inicial (se actualizará en tick)
                bookMesh.position.x = bookMesh.userData.baseX
                bookMesh.position.y = Math.cos(bookMesh.userData.baseX) * carouselConfig.curveHeight
                bookMesh.rotateY(0.01)
                bookMesh.position.z = 0
                
                books.add(bookMesh)
            }
            
            // Calcular límites del carrusel después de crear todos los libros
            const firstBookBaseX = (0 - 2) * carouselConfig.bookSpacing
            const lastBookBaseX = (4 - 2) * carouselConfig.bookSpacing
            
            carouselMaxOffset = -firstBookBaseX 
            carouselMinOffset = -lastBookBaseX   
            
        }
    })
    
scene.add(books)
})


/**
 * Ligth
 * */
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5)
scene.add(ambientLight)

// Directional Light 
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
directionalLight.position.set(2, 3, 2)
scene.add(directionalLight)

// PointLight para reflejitos en el libro
const pointLight = new THREE.PointLight(0xffffff, 0.5, 8)
pointLight.position.set(0, 1, 3)
scene.add(pointLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

/**
 * Cursor
 */
const cursor = {
    x: 0,
    y: 0
}

let mouse = new THREE.Vector2(cursor)

//Posición del cursor en la escena
const cursorWorldPosition = new THREE.Vector3(0, 0, 0)

window.addEventListener('mousemove', (event) => {
    cursor.x = (event.clientX / sizes.width) * 2 - 1
    cursor.y = - (event.clientY / sizes.height) * 2 + 1

    cursorWorldPosition.x = 0
    cursorWorldPosition.y = cursor.y
    cursorWorldPosition.z = 1

    // Drag del carrusel
    if(isDragging){
        const deltaX = event.clientX - lastDragX
        const newOffset = targetCarouselOffset + deltaX * carouselConfig.dragSensitivity
        targetCarouselOffset = Math.max(carouselMinOffset, Math.min(carouselMaxOffset, newOffset))
        lastDragX = event.clientX
        console.log('Drag:', { deltaX, newOffset, targetCarouselOffset, limits: { min: carouselMinOffset, max: carouselMaxOffset } })
    }
})

// Detectar cuando el mouse entra/sale del canvas
canvas.addEventListener('mouseenter', () => {
    isMouseOverCanvas = true
})

canvas.addEventListener('mouseleave', () => {
    isMouseOverCanvas = false
    isDragging = false
})

// Drag del carrusel (mouse)
canvas.addEventListener('mousedown', (event) => {
    isDragging = true
    lastDragX = event.clientX
    canvas.style.cursor = 'grabbing'
})

canvas.addEventListener('mouseup', () => {
    isDragging = false
    canvas.style.cursor = 'default'
})

// Drag del carrusel (touch)
canvas.addEventListener('touchstart', (event) => {
    event.preventDefault()
    isDragging = true
    lastDragX = event.touches[0].clientX
})

canvas.addEventListener('touchmove', (event) => {
    if(isDragging){
        event.preventDefault()
        const deltaX = event.touches[0].clientX - lastDragX
        const newOffset = targetCarouselOffset + deltaX * carouselConfig.dragSensitivity
        targetCarouselOffset = Math.max(carouselMinOffset, Math.min(carouselMaxOffset, newOffset))
        lastDragX = event.touches[0].clientX
    }
})

canvas.addEventListener('touchend', (event) => {
    event.preventDefault()
    isDragging = false
})

// Scroll del mouse (solo cuando está sobre el canvas)
canvas.addEventListener('wheel', (event) => {
    if(isMouseOverCanvas){
        event.preventDefault()
        const newOffset = targetCarouselOffset - event.deltaY * carouselConfig.scrollSensitivity
        targetCarouselOffset = Math.max(carouselMinOffset, Math.min(carouselMaxOffset, newOffset))
    }
}, { passive: false })

// Flechas de navegación
const prevButton = document.getElementById('carousel-prev')
const nextButton = document.getElementById('carousel-next')

if(prevButton && nextButton) {
    prevButton.addEventListener('click', () => {
        const newOffset = targetCarouselOffset + carouselConfig.buttonStep
        targetCarouselOffset = Math.max(carouselMinOffset, Math.min(carouselMaxOffset, newOffset))
    })

    nextButton.addEventListener('click', () => {
        const newOffset = targetCarouselOffset - carouselConfig.buttonStep
        targetCarouselOffset = Math.max(carouselMinOffset, Math.min(carouselMaxOffset, newOffset))
    })
} else {
    console.warn('Botones del carrusel no encontrados')
}

/**
 * RayCaster
 */
const raycaster = new THREE.Raycaster()

/**
 * Parámetros para el seguimiento del cursor
 */
const parameters = {
    lookAtSmoothness: 0.03, 
    cursorRangeY: 3, 
    maxTiltAngle: 15 * Math.PI / 180,
}

/**
 * Carousel Configuration
 */
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768

const carouselConfig = {
    smoothness: 0.03,         
    rotationSmoothness: 0.01,  
    dragSensitivity: isMobile ? 0.002 : 0.001,    
    scrollSensitivity: 0.001,  
    buttonStep: isMobile ? 0.3 : 0.5,           
    rotationStartDistance: 0.1, 
    rotationFullDistance: 0.5,  
    bookSpacing: isMobile ? 0.3 : 0.5,         
    curveHeight: isMobile ? 0.30 : 0.2         
}

// Offset inicial para que el primer libro esté en el centro
let initialBookX = (0 - 2) * carouselConfig.bookSpacing 
let carouselOffset = -initialBookX 
let targetCarouselOffset = carouselOffset 

// Límites del carrusel (se calcularán después de crear los libros)
let carouselMinOffset = -Infinity
let carouselMaxOffset = Infinity

// Variables para drag
let isDragging = false
let lastDragX = 0
let isMouseOverCanvas = false

// Carousel GUI controls
gui.add(parameters, 'lookAtSmoothness', 0.01, 0.3, 0.01).name('Look At Smoothness')
gui.add(parameters, 'cursorRangeY', 1, 10, 0.5).name('Cursor Range Y')
gui.add(parameters, 'maxTiltAngle', 5 * Math.PI / 180, 45 * Math.PI / 180, Math.PI / 180).name('Max Tilt Angle (deg)')


gui.add(carouselConfig, 'smoothness', 0.01, 0.2, 0.01).name('Carousel Smoothness')
gui.add(carouselConfig, 'rotationSmoothness', 0.01, 0.1, 0.01).name('Rotation Smoothness')
gui.add(carouselConfig, 'dragSensitivity', 0.001, 0.02, 0.001).name('Drag Sensitivity')
gui.add(carouselConfig, 'scrollSensitivity', 0.0001, 0.005, 0.0001).name('Scroll Sensitivity')
gui.add(carouselConfig, 'buttonStep', 0.1, 1.5, 0.1).name('Button Step')
gui.add(carouselConfig, 'bookSpacing', 0.1, 1.5, 0.05).name('Book Spacing').onChange(() => {
    // Recalcular posiciones base y límites cuando cambie el spacing
    books.children.forEach((book) => {
        book.userData.baseX = book.userData.indexOffset * carouselConfig.bookSpacing
    })
    const firstBookBaseX = (0 - 2) * carouselConfig.bookSpacing
    const lastBookBaseX = (4 - 2) * carouselConfig.bookSpacing
    carouselMaxOffset = -firstBookBaseX
    carouselMinOffset = -lastBookBaseX
    // Recalcular offset inicial
    const initialBookX = (0 - 2) * carouselConfig.bookSpacing
    if(carouselOffset === -initialBookX || Math.abs(carouselOffset + initialBookX) < 0.1) {
        carouselOffset = -initialBookX
        targetCarouselOffset = carouselOffset
    }
})
gui.add(carouselConfig, 'curveHeight', 0, 0.5, 0.01).name('Curve Height')

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Re-detectar si es móvil y ajustar cámara
    const isMobileNow = isMobile || window.innerWidth < 768
    if(isMobileNow){
        camera.position.set(0, 0.3, 0.7)
    } else {
        camera.position.set(0, 0.2, 0.5)
    }

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)

// Ajustar la cámara según si es móvil
if(isMobile){
    camera.position.set(0, 0.3, 0.7) 
} else {
    camera.position.set(0, 0.2, 0.5)
}
scene.add(camera)


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const tick = () =>
{
    // Limitar el offset
    targetCarouselOffset = Math.max(carouselMinOffset, Math.min(carouselMaxOffset, targetCarouselOffset))
    
    // Animar el offset del carrusel suavemente
    carouselOffset = THREE.MathUtils.lerp(
        carouselOffset,
        targetCarouselOffset,
        carouselConfig.smoothness
    )

    // Encontrar qué libro está en el centro para cambiar el fondo
    let centerBookIndex = null
    let closestToCenter = Infinity

    // Actualizar posiciones y rotaciones de los libros
    books.children.forEach((book) => {
        // Calcular nueva posición X
        const newX = book.userData.baseX + carouselOffset
        book.position.x = newX
        
        // Detectar qué libro está más cerca del centro
        const distanceFromCenter = Math.abs(newX)
        if(distanceFromCenter < closestToCenter){
            closestToCenter = distanceFromCenter
            centerBookIndex = book.userData.bookIndex
    }

        // Recalcular Y basado en la nueva X (curva con coseno)
        book.position.y = Math.cos(newX) * carouselConfig.curveHeight
        
        // Calcular dirección para la rotación 
        const isLeft = newX < 0
        
        // Interpolación para la rotación Z basada en distancia al centro
        let targetRotationZ = 0
        if(distanceFromCenter > carouselConfig.rotationStartDistance) {
            // Calcular interpolación basada en la distancia
            const rotationProgress = Math.min(1, 
                (distanceFromCenter - carouselConfig.rotationStartDistance) / 
                (carouselConfig.rotationFullDistance - carouselConfig.rotationStartDistance)
            )
            targetRotationZ = rotationProgress * Math.PI * (isLeft ? 1 : -1)
        }
        
        book.rotation.z = THREE.MathUtils.lerp(
            book.rotation.z,
            targetRotationZ,
            carouselConfig.rotationSmoothness
        )
        
        let targetRotationX = book.userData.baseRotationX
        targetRotationX += -cursor.y * parameters.maxTiltAngle
        
        book.rotation.x = THREE.MathUtils.lerp(
            book.rotation.x, 
            targetRotationX, 
            parameters.lookAtSmoothness
        )
    })

    // Cambiar el color de fondo según el libro en el centro
    if(centerBookIndex !== null){
        const targetColor = new THREE.Color(bookBackgroundColors[centerBookIndex])
        scene.background.lerp(targetColor, 0.05)
    }

    mouse.x = cursor.x
    mouse.y = cursor.y

    //Cast a Ray
    raycaster.setFromCamera(mouse, camera)

    const intersects = raycaster.intersectObjects(books.children)

    // Cambiar el cursor si hay intersecciones
    if(!isDragging){
        if(intersects.length > 0){
            canvas.style.cursor = 'pointer'
        } else {
            canvas.style.cursor = 'default'
        }
    }

    // Actualizar posición 3D del cursor con los parámetros
    cursorWorldPosition.y = (cursor.y) * parameters.cursorRangeY

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

// Click en los libros para redirigir
canvas.addEventListener('click', (event) => {
    if(!isDragging) {
        mouse.x = (event.clientX / sizes.width) * 2 - 1
        mouse.y = -(event.clientY / sizes.height) * 2 + 1
        
        raycaster.setFromCamera(mouse, camera)
        const intersects = raycaster.intersectObjects(books.children)
        
        if(intersects.length > 0){
            const clickedBook = intersects[0].object
            const bookUrl = clickedBook.userData.url
            if(bookUrl){
                window.location.href = bookUrl
            }
        }
    }
})

tick()