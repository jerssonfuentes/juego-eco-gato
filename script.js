// === VARIABLES GLOBALES ===
let game = {
    // Estado del juego
    isRunning: false,
    isPaused: false,
    startTime: 0,
    
    // Elementos del DOM
    cat: null,
    gameWorld: null,
    gameContainer: null,
    objectsContainer: null,
    
    // Estadísticas
    score: 0,
    lives: 3,
    recycledItems: 0,
    distance: 0,
    currentLevel: 1,
    
    // Configuración base
    config: {
        catSpeed: 3,
        jumpPower: 22,  // Salto más alto
        gravity: 0.6,   // Gravedad un poco menor para salto más suave
        autoScrollSpeed: 1.8,  // Velocidad más lenta para mayor duración
        groundHeight: 120,
        maxLives: 3
    },
    
    // Estado del gato
    catState: {
        x: 150,
        y: 0,
        velocityY: 0,
        isJumping: false,
        isOnGround: true,
        jumpCooldown: 0
    },
    
    // Gestión de objetos
    gameObjects: [],
    
    // Configuración de niveles - Juego de ~10 minutos
    levels: [
        {
            level: 1,
            name: "Patio Trasero",
            description: "Primeros obstáculos en casa...",
            targetDistance: 800,
            spawnRate: 0.012,
            scrollSpeed: 1.5,
            obstacleTypes: ['trash-can', 'recyclable'],
            difficultyMultiplier: 1
        },
        {
            level: 2,
            name: "Vecindario Tranquilo",
            description: "Saliendo del barrio seguro",
            targetDistance: 1200,
            spawnRate: 0.015,
            scrollSpeed: 1.8,
            obstacleTypes: ['trash-can', 'recyclable', 'small-obstacle'],
            difficultyMultiplier: 1.1
        },
        {
            level: 3,
            name: "Parque Local",
            description: "Primeros charcos contaminados",
            targetDistance: 1600,
            spawnRate: 0.018,
            scrollSpeed: 2.0,
            obstacleTypes: ['trash-can', 'pollution-puddle', 'recyclable', 'power-up'],
            difficultyMultiplier: 1.2
        },
        {
            level: 4,
            name: "Zona Comercial",
            description: "Más basura y obstáculos",
            targetDistance: 2000,
            spawnRate: 0.020,
            scrollSpeed: 2.2,
            obstacleTypes: ['trash-can', 'pollution-puddle', 'fallen-tree', 'recyclable', 'power-up'],
            difficultyMultiplier: 1.3
        },
        {
            level: 5,
            name: "Bosque Contaminado",
            description: "Troncos caídos bloquean el paso",
            targetDistance: 2400,
            spawnRate: 0.022,
            scrollSpeed: 2.4,
            obstacleTypes: ['fallen-tree', 'trash-can', 'pollution-puddle', 'recyclable', 'power-up', 'high-obstacle'],
            difficultyMultiplier: 1.4
        },
        {
            level: 6,
            name: "Zona Industrial",
            description: "Contaminación intensa",
            targetDistance: 2800,
            spawnRate: 0.025,
            scrollSpeed: 2.6,
            obstacleTypes: ['fallen-tree', 'trash-can', 'pollution-puddle', 'recyclable', 'power-up', 'high-obstacle', 'moving-obstacle'],
            difficultyMultiplier: 1.6
        },
        {
            level: 7,
            name: "Río Contaminado",
            description: "Obstáculos acuáticos peligrosos",
            targetDistance: 3200,
            spawnRate: 0.028,
            scrollSpeed: 2.8,
            obstacleTypes: ['pollution-puddle', 'fallen-tree', 'trash-can', 'recyclable', 'power-up', 'water-obstacle', 'high-obstacle'],
            difficultyMultiplier: 1.8
        },
        {
            level: 8,
            name: "Ciudad Abandonada",
            description: "Escombros y basura por doquier",
            targetDistance: 3600,
            spawnRate: 0.030,
            scrollSpeed: 3.0,
            obstacleTypes: ['fallen-tree', 'trash-can', 'pollution-puddle', 'recyclable', 'power-up', 'high-obstacle', 'moving-obstacle', 'debris'],
            difficultyMultiplier: 2.0
        },
        {
            level: 9,
            name: "Último Tramo",
            description: "¡Casa a la vista! Último esfuerzo",
            targetDistance: 4000,
            spawnRate: 0.032,
            scrollSpeed: 3.2,
            obstacleTypes: ['fallen-tree', 'trash-can', 'pollution-puddle', 'recyclable', 'power-up', 'high-obstacle', 'moving-obstacle', 'final-obstacle'],
            difficultyMultiplier: 2.2
        },
        {
            level: 10,
            name: "¡Llegada a Casa!",
            description: "¡El hogar está muy cerca!",
            targetDistance: 4500,
            spawnRate: 0.035,
            scrollSpeed: 3.5,
            obstacleTypes: ['fallen-tree', 'trash-can', 'pollution-puddle', 'recyclable', 'power-up', 'high-obstacle', 'moving-obstacle', 'final-obstacle'],
            difficultyMultiplier: 2.5
        }
    ],
    
    // Control del scroll
    worldOffset: 0,
    lastSpawnX: 0
};

// Consejos ecológicos expandidos para 10 minutos de juego
const ecoTips = [
    "¡Separar la basura correctamente ayuda al medio ambiente!",
    "Reciclar una lata de aluminio ahorra energía suficiente para ver TV por 3 horas.",
    "Los árboles caídos pueden convertirse en compost natural si se manejan bien.",
    "Evitar los charcos contaminados protege la vida acuática.",
    "¡Cada acción ecológica cuenta para un planeta más limpio!",
    "Reducir, reutilizar y reciclar: las 3 R's del cuidado ambiental.",
    "Un gato feliz vive en un planeta limpio y saludable.",
    "Las botellas de plástico tardan 450 años en descomponerse naturalmente.",
    "Plantar un árbol puede absorber hasta 22kg de CO2 al año.",
    "Usar transporte público reduce tu huella de carbono significativamente.",
    "Los océanos contienen más de 5 billones de piezas de plástico.",
    "Apagar las luces cuando no las uses ahorra energía y dinero.",
    "El agua es un recurso limitado: ¡úsala conscientemente!",
    "Los animales salvajes necesitan hábitats limpios para sobrevivir.",
    "Compostar residuos orgánicos reduce la basura en un 30%.",
    "Las energías renovables son el futuro de nuestro planeta.",
    "Cada minuto se compran 1 millón de botellas plásticas en el mundo.",
    "Los bosques producen el oxígeno que respiramos: ¡protégelos!",
    "Caminar o usar bicicleta es saludable para ti y el planeta.",
    "Elegir productos locales reduce la contaminación del transporte."
];

// Configuración de objetos del juego
const objectConfig = {
    'trash-can': {
        width: 40,
        height: 60,
        damage: true,
        points: 0,
        type: 'obstacle'
    },
    'small-obstacle': {
        width: 30,
        height: 40,
        damage: true,
        points: 0,
        type: 'obstacle'
    },
    'fallen-tree': {
        width: 80,
        height: 30,
        damage: true,
        points: 0,
        type: 'obstacle'
    },
    'high-obstacle': {
        width: 40,
        height: 80,
        damage: true,
        points: 0,
        type: 'obstacle'
    },
    'moving-obstacle': {
        width: 50,
        height: 50,
        damage: true,
        points: 0,
        type: 'obstacle'
    },
    'water-obstacle': {
        width: 100,
        height: 25,
        damage: true,
        points: 0,
        type: 'obstacle'
    },
    'debris': {
        width: 60,
        height: 45,
        damage: true,
        points: 0,
        type: 'obstacle'
    },
    'final-obstacle': {
        width: 90,
        height: 70,
        damage: true,
        points: 0,
        type: 'obstacle'
    },
    'pollution-puddle': {
        width: 60,
        height: 20,
        damage: true,
        points: 0,
        type: 'obstacle'
    },
    'recyclable': {
        width: 35,
        height: 35,
        damage: false,
        points: 50,
        type: 'collectible'
    },
    'power-up': {
        width: 30,
        height: 30,
        damage: false,
        points: 100,
        type: 'powerup'
    }
};

// === INICIALIZACIÓN ===
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
    setupEventListeners();
    detectMobile();
});

function initializeGame() {
    game.cat = document.getElementById('cat');
    game.gameWorld = document.getElementById('gameWorld');
    game.gameContainer = document.getElementById('gameContainer');
    game.objectsContainer = document.getElementById('objectsContainer');
    
    updateCatPosition();
    updateHUD();
}

function detectMobile() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
                     || window.innerWidth <= 768;
    
    if (isMobile) {
        document.getElementById('mobileControls').style.display = 'flex';
        setupMobileControls();
    }
}

// === GESTIÓN DE EVENTOS ===
function setupEventListeners() {
    // Controles de teclado
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Controles táctiles
    game.gameContainer.addEventListener('touchstart', handleTouch);
    game.gameContainer.addEventListener('click', handleClick);
    
    // Prevenir scroll en móviles
    document.addEventListener('touchmove', function(e) {
        if (game.isRunning) {
            e.preventDefault();
        }
    }, { passive: false });
}

function setupMobileControls() {
    const jumpBtn = document.getElementById('jumpBtn');
    
    jumpBtn.addEventListener('touchstart', (e) => {
        jump();
        jumpBtn.style.background = 'rgba(76, 175, 80, 0.6)';
        e.preventDefault();
    });
    
    jumpBtn.addEventListener('touchend', (e) => {
        jumpBtn.style.background = 'rgba(76, 175, 80, 0.3)';
        e.preventDefault();
    });
}

function handleKeyDown(e) {
    if (!game.isRunning || game.isPaused) return;
    
    switch(e.code) {
        case 'Space':
        case 'ArrowUp':
        case 'KeyW':
            jump();
            e.preventDefault();
            break;
        case 'Escape':
            togglePause();
            e.preventDefault();
            break;
    }
}

function handleKeyUp(e) {
    // Actualmente solo usamos salto, no necesitamos manejar keyup
}

function handleTouch(e) {
    if (game.isRunning && !game.isPaused) {
        jump();
        e.preventDefault();
    }
}

function handleClick(e) {
    if (game.isRunning && !game.isPaused) {
        jump();
        e.preventDefault();
    }
}

// === FUNCIONES PRINCIPALES DEL JUEGO ===
function startGame() {
    // Ocultar pantalla de inicio
    document.getElementById('startScreen').style.display = 'none';
    
    // Mostrar contenedor del juego
    game.gameContainer.style.display = 'block';
    
    // Mostrar controles móviles si es necesario
    if (document.getElementById('mobileControls').style.display === 'flex') {
        document.getElementById('mobileControls').style.display = 'flex';
    }
    
    // Reiniciar estado del juego
    resetGameState();
    
    // Iniciar el bucle del juego
    game.isRunning = true;
    game.startTime = Date.now();
    
    // Añadir clase de correr al gato
    game.cat.classList.add('running');
    
    gameLoop();
    
    // Mostrar mensaje de inicio
    showMessage("¡Corre y salta para llegar a casa!", 2500);
}

function resetGameState() {
    game.score = 0;
    game.lives = game.config.maxLives;
    game.recycledItems = 0;
    game.distance = 0;
    game.currentLevel = 1;
    game.isPaused = false;
    
    game.catState = {
        x: 150,
        y: 0,
        velocityY: 0,
        isJumping: false,
        isOnGround: true,
        jumpCooldown: 0
    };
    
    game.gameObjects = [];
    game.worldOffset = 0;
    game.lastSpawnX = 0;
    
    // Limpiar objetos del DOM
    clearGameObjects();
    
    // Actualizar interfaz
    updateCatPosition();
    updateHUD();
    updateLevelProgress();
}

function clearGameObjects() {
    if (game.objectsContainer) {
        game.objectsContainer.innerHTML = '';
    }
}

function gameLoop() {
    if (!game.isRunning || game.isPaused) return;
    
    // Actualizar lógica del juego
    updateCat();
    updateWorldScroll();
    spawnObjects();
    updateObjects();
    checkCollisions();
    checkLevelProgress();
    updateHUD();
    updateLevelProgress();
    
    // Verificar condiciones de fin de juego
    if (game.lives <= 0) {
        endGame(false, "¡El gato se quedó sin vidas! La contaminación fue demasiada.");
        return;
    }
    
    if (game.currentLevel > game.levels.length) {
        endGame(true, "¡El gato llegó a casa sano y salvo después de atravesar todos los niveles!");
        return;
    }
    
    // Continuar el bucle
    requestAnimationFrame(gameLoop);
}

function updateCat() {
    // Reducir cooldown de salto
    if (game.catState.jumpCooldown > 0) {
        game.catState.jumpCooldown--;
    }
    
    // Aplicar gravedad
    if (!game.catState.isOnGround) {
        game.catState.velocityY += game.config.gravity;
        game.catState.y += game.catState.velocityY;
        
        // Comprobar si ha aterrizado
        if (game.catState.y >= 0) {
            game.catState.y = 0;
            game.catState.velocityY = 0;
            game.catState.isOnGround = true;
            game.catState.isJumping = false;
            game.cat.classList.remove('jumping');
        }
    }
    
    // Mantener al gato corriendo
    if (game.catState.isOnGround && !game.cat.classList.contains('running')) {
        game.cat.classList.add('running');
    }
    
    // Actualizar posición visual
    updateCatPosition();
}

function updateCatPosition() {
    game.cat.style.left = game.catState.x + 'px';
    game.cat.style.bottom = (game.config.groundHeight + game.catState.y) + 'px';
}

function jump() {
    if (game.catState.isOnGround && game.catState.jumpCooldown <= 0 && game.isRunning && !game.isPaused) {
        game.catState.velocityY = -game.config.jumpPower;
        game.catState.isJumping = true;
        game.catState.isOnGround = false;
        game.catState.jumpCooldown = 8; // Cooldown reducido para saltos más fluidos
        
        game.cat.classList.add('jumping');
        game.cat.classList.remove('running');
        
        // Efecto visual de salto más dramático
        createJumpEffect();
        
        // Mensaje ocasional de aliento
        if (Math.random() < 0.1) { // 10% de probabilidad
            const encouragements = ["¡Buen salto!", "¡Sigue así!", "¡Perfecto!", "¡Vuela alto!"];
            const message = encouragements[Math.floor(Math.random() * encouragements.length)];
            showMessage(message, 800);
        }
    }
}

function createJumpEffect() {
    const effect = document.createElement('div');
    effect.style.cssText = `
        position: absolute;
        left: ${game.catState.x + 25}px;
        bottom: ${game.config.groundHeight}px;
        width: 20px;
        height: 20px;
        background: rgba(255, 255, 255, 0.6);
        border-radius: 50%;
        pointer-events: none;
        z-index: 40;
    `;
    
    game.gameWorld.appendChild(effect);
    
    // Animar y remover el efecto
    effect.animate([
        { transform: 'scale(1)', opacity: 1 },
        { transform: 'scale(2)', opacity: 0 }
    ], {
        duration: 300,
        easing: 'ease-out'
    }).onfinish = () => effect.remove();
}

function updateWorldScroll() {
    const currentLevel = getCurrentLevelConfig();
    const scrollSpeed = currentLevel.scrollSpeed;
    
    // Incrementar distancia y offset del mundo
    game.distance += scrollSpeed;
    game.worldOffset += scrollSpeed;
    
    // Mover todos los objetos hacia la izquierda
    game.gameObjects.forEach(obj => {
        obj.x -= scrollSpeed;
        if (obj.element) {
            obj.element.style.left = obj.x + 'px';
        }
    });
    
    // Remover objetos que salieron de la pantalla
    game.gameObjects = game.gameObjects.filter(obj => {
        if (obj.x < -100) {
            if (obj.element && obj.element.parentNode) {
                obj.element.remove();
            }
            return false;
        }
        return true;
    });
}

function spawnObjects() {
    const currentLevel = getCurrentLevelConfig();
    const spawnChance = currentLevel.spawnRate;
    
    // Crear patrones más interesantes basados en la distancia
    const patternModifier = Math.sin(game.distance * 0.001) * 0.5 + 1; // Ondas de dificultad
    const adjustedSpawnChance = spawnChance * patternModifier;
    
    // Verificar si es momento de generar un nuevo objeto
    const minDistance = game.currentLevel <= 3 ? 150 : 120; // Menos espacio en niveles avanzados
    const maxDistance = game.currentLevel <= 3 ? 300 : 250;
    const requiredDistance = minDistance + Math.random() * (maxDistance - minDistance);
    
    if (Math.random() < adjustedSpawnChance && game.worldOffset > game.lastSpawnX + requiredDistance) {
        
        // Ocasionalmente crear grupos de obstáculos/coleccionables
        if (Math.random() < 0.15) { // 15% probabilidad de grupo
            createObjectGroup(currentLevel);
        } else {
            const objectType = getRandomObjectType(currentLevel);
            const spawnX = window.innerWidth + 50;
            createGameObject(objectType, spawnX);
        }
        
        game.lastSpawnX = game.worldOffset;
    }
    
    // Spawn especial de power-ups cada cierta distancia
    if (game.distance > 0 && game.distance % 400 === 0 && game.worldOffset > game.lastSpawnX + 200) {
        if (Math.random() < 0.7) { // 70% probabilidad
            createGameObject('power-up', window.innerWidth + 100);
        }
    }
}

// Nueva función para crear grupos de objetos
function createObjectGroup(levelConfig) {
    const groupTypes = [
        ['recyclable', 'recyclable', 'recyclable'], // Línea de reciclables
        ['trash-can', 'recyclable', 'trash-can'],   // Intercalado
        ['pollution-puddle', 'recyclable'],         // Salto y recompensa
        ['small-obstacle', 'small-obstacle'],       // Doble salto
        ['high-obstacle', 'power-up']               // Desafío y recompensa
    ];
    
    const availableGroups = groupTypes.filter(group => 
        group.every(type => levelConfig.obstacleTypes.includes(type))
    );
    
    if (availableGroups.length === 0) return;
    
    const selectedGroup = availableGroups[Math.floor(Math.random() * availableGroups.length)];
    let spawnX = window.innerWidth + 50;
    
    selectedGroup.forEach((type, index) => {
        createGameObject(type, spawnX + (index * 80)); // Separación de 80px entre objetos
    });
}

function getRandomObjectType(levelConfig) {
    const types = levelConfig.obstacleTypes;
    const weights = {
        'trash-can': 0.20,
        'small-obstacle': 0.15,
        'fallen-tree': 0.15,
        'high-obstacle': 0.12,
        'moving-obstacle': 0.08,
        'water-obstacle': 0.10,
        'debris': 0.10,
        'final-obstacle': 0.08,
        'pollution-puddle': 0.12,
        'recyclable': 0.25,  // Más coleccionables para mantener el interés
        'power-up': 0.08
    };
    
    const availableTypes = types.filter(type => weights[type]);
    const random = Math.random();
    let accumulated = 0;
    
    for (const type of availableTypes) {
        accumulated += weights[type];
        if (random <= accumulated) {
            return type;
        }
    }
    
    return availableTypes[0];
}

function createGameObject(type, x) {
    const config = objectConfig[type];
    const element = document.createElement('div');
    
    // Configurar elemento visual
    element.className = `obstacle ${type}`;
    
    // Posición especial según el tipo de obstáculo
    let y = game.config.groundHeight;
    
    switch(type) {
        case 'pollution-puddle':
        case 'water-obstacle':
            y = game.config.groundHeight - 20;
            break;
        case 'high-obstacle':
            y = game.config.groundHeight;
            break;
        case 'moving-obstacle':
            y = game.config.groundHeight;
            // Añadir animación de movimiento vertical
            element.style.animation = 'moving-obstacle 2s ease-in-out infinite alternate';
            break;
        case 'final-obstacle':
            y = game.config.groundHeight;
            break;
        default:
            y = game.config.groundHeight;
    }
    
    element.style.left = x + 'px';
    element.style.bottom = y + 'px';
    
    // Añadir al contenedor
    game.objectsContainer.appendChild(element);
    
    // Crear objeto de juego
    const gameObject = {
        element: element,
        type: type,
        x: x,
        y: y,
        width: config.width,
        height: config.height,
        damage: config.damage,
        points: config.points,
        objectType: config.type,
        originalY: y  // Para obstáculos móviles
    };
    
    game.gameObjects.push(gameObject);
    
    // Efectos especiales para coleccionables
    if (type === 'recyclable') {
        addCollectibleVariant(element);
    }
    
    // Efectos especiales para obstáculos específicos
    if (type === 'power-up') {
        element.style.animation = 'powerup-spin 3s linear infinite';
    }
}

function addCollectibleVariant(element) {
    const variants = ['bottle', 'can'];
    const variant = variants[Math.floor(Math.random() * variants.length)];
    element.classList.add(variant);
}

function updateObjects() {
    // Los objetos ya se mueven en updateWorldScroll
    // Aquí podemos añadir animaciones adicionales si es necesario
    game.gameObjects.forEach(obj => {
        if (obj.type === 'power-up' && obj.element) {
            // Mantener animación de power-up
            obj.element.style.animation = 'powerup-spin 3s linear infinite';
        }
    });
}

function checkCollisions() {
    const catRect = {
        x: game.catState.x + 5, // Margen de colisión
        y: game.config.groundHeight + game.catState.y + 5,
        width: 50,
        height: 50
    };
    
    game.gameObjects.forEach((obj, index) => {
        if (isColliding(catRect, obj)) {
            handleCollision(obj, index);
        }
    });
}

function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function handleCollision(obj, index) {
    if (obj.damage && obj.objectType === 'obstacle') {
        // Colisión dañina
        game.lives--;
        
        // Efecto visual de daño
        game.cat.style.filter = 'brightness(0.5) hue-rotate(0deg)';
        setTimeout(() => {
            if (game.cat) game.cat.style.filter = 'brightness(1)';
        }, 300);
        
        // Mensaje de daño
        showMessage("¡Auch! Perdiste una vida 💔", 1500);
        
        // Crear efecto de impacto
        createImpactEffect(obj.x, obj.y);
        
    } else if (obj.objectType === 'collectible') {
        // Coleccionable recogido
        game.score += obj.points;
        game.recycledItems++;
        
        // Mensaje de éxito
        showMessage(`+${obj.points} puntos ♻️`, 1000);
        
        // Efecto de recolección
        createCollectEffect(obj.x, obj.y);
        
    } else if (obj.objectType === 'powerup') {
        // Power-up recogido
        game.score += obj.points;
        if (game.lives < game.config.maxLives) {
            game.lives++;
            showMessage(`¡Power-up! +1 Vida ⭐`, 1500);
        } else {
            showMessage(`¡Power-up! +${obj.points} puntos ⭐`, 1500);
        }
        
        // Efecto de power-up
        createPowerUpEffect(obj.x, obj.y);
    }
    
    // Remover objeto
    if (obj.element && obj.element.parentNode) {
        obj.element.remove();
    }
    game.gameObjects.splice(index, 1);
}

function createImpactEffect(x, y) {
    const effect = document.createElement('div');
    effect.style.cssText = `
        position: absolute;
        left: ${x}px;
        bottom: ${y}px;
        width: 30px;
        height: 30px;
        background: radial-gradient(circle, #ff4444, transparent);
        border-radius: 50%;
        pointer-events: none;
        z-index: 60;
    `;
    
    game.gameWorld.appendChild(effect);
    
    effect.animate([
        { transform: 'scale(0.5)', opacity: 1 },
        { transform: 'scale(2)', opacity: 0 }
    ], {
        duration: 400,
        easing: 'ease-out'
    }).onfinish = () => effect.remove();
}

function createCollectEffect(x, y) {
    const effect = document.createElement('div');
    effect.style.cssText = `
        position: absolute;
        left: ${x}px;
        bottom: ${y}px;
        width: 25px;
        height: 25px;
        background: radial-gradient(circle, #4CAF50, transparent);
        border-radius: 50%;
        pointer-events: none;
        z-index: 60;
    `;
    
    game.gameWorld.appendChild(effect);
    
    effect.animate([
        { transform: 'scale(1) translateY(0px)', opacity: 1 },
        { transform: 'scale(1.5) translateY(-30px)', opacity: 0 }
    ], {
        duration: 500,
        easing: 'ease-out'
    }).onfinish = () => effect.remove();
}

function createPowerUpEffect(x, y) {
    const effect = document.createElement('div');
    effect.style.cssText = `
        position: absolute;
        left: ${x}px;
        bottom: ${y}px;
        width: 40px;
        height: 40px;
        background: radial-gradient(circle, #FFD700, transparent);
        border-radius: 50%;
        pointer-events: none;
        z-index: 60;
    `;
    
    game.gameWorld.appendChild(effect);
    
    effect.animate([
        { transform: 'scale(1) rotate(0deg)', opacity: 1 },
        { transform: 'scale(2) rotate(360deg)', opacity: 0 }
    ], {
        duration: 600,
        easing: 'ease-out'
    }).onfinish = () => effect.remove();
}

function checkLevelProgress() {
    const currentLevel = getCurrentLevelConfig();
    const levelDistance = currentLevel.targetDistance;
    
    if (game.distance >= levelDistance && game.currentLevel <= game.levels.length) {
        nextLevel();
    }
}

function nextLevel() {
    if (game.currentLevel < game.levels.length) {
        game.currentLevel++;
        showLevelTransition();
    }
}

function showLevelTransition() {
    const currentLevel = getCurrentLevelConfig();
    const transition = document.getElementById('levelTransition');
    const levelNumber = document.getElementById('newLevelNumber');
    const levelDescription = document.getElementById('levelDescription');
    
    levelNumber.textContent = currentLevel.level;
    levelDescription.textContent = currentLevel.description;
    
    transition.style.display = 'flex';
    
    // Pausar temporalmente el juego
    game.isPaused = true;
    
    setTimeout(() => {
        transition.style.display = 'none';
        game.isPaused = false;
        gameLoop(); // Reiniciar el bucle
        
        // Mensaje de nuevo nivel
        showMessage(`¡Nivel ${currentLevel.level}: ${currentLevel.name}!`, 2500);
    }, 3000);
}

function getCurrentLevelConfig() {
    return game.levels[game.currentLevel - 1] || game.levels[game.levels.length - 1];
}

function updateHUD() {
    document.getElementById('currentLevel').textContent = game.currentLevel;
    document.getElementById('score').textContent = game.score;
    document.getElementById('lives').textContent = game.lives;
    document.getElementById('recycledCount').textContent = game.recycledItems;
    document.getElementById('distance').textContent = Math.floor(game.distance);
    
    // Mostrar tiempo de juego
    const survivalTime = Math.floor((Date.now() - game.startTime) / 1000);
    const minutes = Math.floor(survivalTime / 60);
    const seconds = survivalTime % 60;
    document.getElementById('gameTime').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Bonificación por tiempo de supervivencia
    if (survivalTime > 0 && survivalTime % 30 === 0) { // Cada 30 segundos
        game.score += 10; // Bonificación por supervivencia
    }
    
    // Mensajes de aliento periódicos
    const gameTimeMinutes = Math.floor(survivalTime / 60);
    if (survivalTime > 0 && survivalTime % 120 === 0) { // Cada 2 minutos
        const encouragements = [
            `¡Llevas ${gameTimeMinutes} minutos corriendo!`,
            "¡Sigue adelante, estás haciendo genial!",
            "¡El gato confía en ti!",
            "¡Cada salto cuenta para llegar a casa!"
        ];
        const message = encouragements[Math.floor(Math.random() * encouragements.length)];
        showMessage(message, 2500);
    }
}

function updateLevelProgress() {
    const currentLevel = getCurrentLevelConfig();
    const progress = Math.min(100, (game.distance / currentLevel.targetDistance) * 100);
    document.getElementById('levelProgressFill').style.width = progress + '%';
}

function showMessage(text, duration = 2000) {
    const messageEl = document.getElementById('gameMessage');
    messageEl.textContent = text;
    messageEl.classList.add('show');
    
    setTimeout(() => {
        messageEl.classList.remove('show');
    }, duration);
}

function togglePause() {
    if (!game.isRunning) return;
    
    game.isPaused = !game.isPaused;
    
    const pauseScreen = document.getElementById('pauseScreen');
    const pauseIcon = document.getElementById('pauseIcon');
    
    if (game.isPaused) {
        pauseScreen.style.display = 'flex';
        pauseIcon.className = 'fas fa-play';
        
        // Actualizar estadísticas en pausa
        document.getElementById('pauseLevel').textContent = game.currentLevel;
        document.getElementById('pauseScore').textContent = game.score;
        document.getElementById('pauseDistance').textContent = Math.floor(game.distance);
        
        // Pausar animaciones del gato
        game.cat.classList.remove('running');
    } else {
        pauseScreen.style.display = 'none';
        pauseIcon.className = 'fas fa-pause';
        
        // Reanudar animaciones del gato
        if (game.catState.isOnGround) {
            game.cat.classList.add('running');
        }
        
        gameLoop(); // Reiniciar el bucle
    }
}

function endGame(success, message) {
    game.isRunning = false;
    
    // Parar animaciones del gato
    game.cat.classList.remove('running', 'jumping');
    
    // Calcular estadísticas finales
    const timeElapsed = Math.floor((Date.now() - game.startTime) / 1000);
    
    // Mostrar pantalla de fin de juego
    const gameOverScreen = document.getElementById('gameOverScreen');
    const resultIcon = document.getElementById('resultIcon');
    const gameOverTitle = document.getElementById('gameOverTitle');
    const gameOverMessage = document.getElementById('gameOverMessage');
    const finalLevel = document.getElementById('finalLevel');
    const finalScore = document.getElementById('finalScore');
    const finalRecycled = document.getElementById('finalRecycled');
    const finalDistance = document.getElementById('finalDistance');
    const ecoTipText = document.getElementById('ecoTipText');
    
    // Configurar contenido según el resultado
    if (success) {
        resultIcon.innerHTML = '<i class="fas fa-trophy"></i>';
        resultIcon.className = 'result-icon success';
        gameOverTitle.textContent = '¡Misión Cumplida!';
        gameOverMessage.textContent = message;
    } else {
        resultIcon.innerHTML = '<i class="fas fa-heart-broken"></i>';
        resultIcon.className = 'result-icon failure';
        gameOverTitle.textContent = '¡Inténtalo de nuevo!';
        gameOverMessage.textContent = message;
    }
    
    // Actualizar estadísticas
    finalLevel.textContent = game.currentLevel;
    finalScore.textContent = game.score;
    finalRecycled.textContent = game.recycledItems;
    finalDistance.textContent = Math.floor(game.distance) + 'm';
    
    // Mostrar consejo ecológico aleatorio
    const randomTip = ecoTips[Math.floor(Math.random() * ecoTips.length)];
    ecoTipText.textContent = randomTip;
    
    // Mostrar pantalla
    gameOverScreen.style.display = 'flex';
    
    // Ocultar controles móviles
    document.getElementById('mobileControls').style.display = 'none';
}

function resetGame() {
    // Ocultar todas las pantallas
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('pauseScreen').style.display = 'none';
    document.getElementById('levelTransition').style.display = 'none';
    game.gameContainer.style.display = 'none';
    
    // Mostrar pantalla de inicio
    document.getElementById('startScreen').style.display = 'flex';
    
    // Resetear estado
    game.isRunning = false;
    game.isPaused = false;
    
    // Limpiar objetos y animaciones
    clearGameObjects();
    game.cat.classList.remove('running', 'jumping');
}

function showMainMenu() {
    resetGame();
}

// === FUNCIONES DE UTILIDAD ===
function getRandomEcoTip() {
    return ecoTips[Math.floor(Math.random() * ecoTips.length)];
}

// === CONFIGURACIÓN INICIAL ===
window.addEventListener('load', function() {
    console.log('EcoCat Adventure - Plataformero Ecológico cargado correctamente');
    
    // Verificar compatibilidad
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback) {
            return setTimeout(callback, 1000 / 60);
        };
    }
});

// === PREVENCIÓN DE ERRORES ===
window.addEventListener('error', function(e) {
    console.error('Error en el juego:', e.error);
    if (game.isRunning) {
        showMessage('¡Error detectado! Reintentando...', 3000);
    }
});

// Prevenir salida accidental
window.addEventListener('beforeunload', function(e) {
    if (game.isRunning && !game.isPaused) {
        e.preventDefault();
        e.returnValue = '¿Estás seguro? Tu progreso se perderá.';
        return e.returnValue;
    }
});

// === EXPORTAR FUNCIONES PRINCIPALES ===
window.startGame = startGame;
window.resetGame = resetGame;
window.togglePause = togglePause;
window.showMainMenu = showMainMenu;