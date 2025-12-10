// ============================================
// ROCKET LEAGUE 3D CLONE - MULTI-ARENA
// ============================================

// Audio system
let audioCtx = null;
const sounds = {};

function initAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playSound(type, volume = 0.3) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    gain.gain.value = volume;

    switch (type) {
        case 'engine':
            osc.type = 'sawtooth';
            osc.frequency.value = 80 + Math.random() * 20;
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            osc.start(); osc.stop(audioCtx.currentTime + 0.1);
            break;
        case 'boost':
            osc.type = 'sawtooth';
            osc.frequency.value = 150 + Math.random() * 50;
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
            osc.start(); osc.stop(audioCtx.currentTime + 0.15);
            break;
        case 'hit':
            osc.type = 'sine';
            osc.frequency.value = 300;
            osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            osc.start(); osc.stop(audioCtx.currentTime + 0.2);
            break;
        case 'goal':
            const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
            notes.forEach((freq, i) => {
                const o = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                o.connect(g); g.connect(audioCtx.destination);
                o.type = 'sine';
                o.frequency.value = freq;
                g.gain.value = 0.2;
                g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5 + i * 0.1);
                o.start(audioCtx.currentTime + i * 0.1);
                o.stop(audioCtx.currentTime + 0.5 + i * 0.1);
            });
            break;
        case 'jump':
            osc.type = 'sine';
            osc.frequency.value = 200;
            osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
            osc.start(); osc.stop(audioCtx.currentTime + 0.15);
            break;
    }
}

// Arena configurations - 50% BIGGER arenas, 30% bigger goals
const ARENAS = {
    stadium: {
        name: 'Stadium',
        width: 300, length: 510, height: 80,
        goalWidth: 65, goalHeight: 32, goalDepth: 25,
        floorColor: 0x2d5a27, wallColor: 0x1a3d5c,
        skyColor: 0x1a1a2e, fogColor: 0x1a1a2e,
        goalColors: [0x4fa8ff, 0xff8c42],
        carColors: [0x4fa8ff, 0xff8c42],
        ballColor: 0xffffff, ballGlow: 0xffff00, ballPattern: 0x333333,
        carStyle: 'muscle', ballStyle: 'classic'
    },
    neon: {
        name: 'Neon City',
        width: 300, length: 510, height: 80,
        goalWidth: 65, goalHeight: 32, goalDepth: 25,
        floorColor: 0x0a0a15, wallColor: 0x1a0a2e,
        skyColor: 0x05051a, fogColor: 0x0a0a20,
        goalColors: [0x00ffff, 0xff00ff],
        carColors: [0x00ffff, 0xff00ff],
        ballColor: 0x111111, ballGlow: 0x00ff88, ballPattern: 0x00ff88,
        carStyle: 'cyber', ballStyle: 'neon'
    },
    ice: {
        name: 'Ice World',
        width: 300, length: 510, height: 80,
        goalWidth: 65, goalHeight: 32, goalDepth: 25,
        floorColor: 0xaaddee, wallColor: 0x6aa8bb,
        skyColor: 0xd0e8f0, fogColor: 0xd8ecf2,
        goalColors: [0x4fa8ff, 0xff6b6b],
        carColors: [0x4fa8ff, 0xff6b6b],
        ballColor: 0xe8f4f8, ballGlow: 0x88ddff, ballPattern: 0x66aacc,
        carStyle: 'sled', ballStyle: 'ice'
    }
};

let currentArena = null;
const CONFIG = {
    carWidth: 5, carHeight: 2.5, carLength: 7,
    carMaxSpeed: 4.0, carBoostMaxSpeed: 6.5, carAcceleration: 0.09,
    carFriction: 0.98, carTurnSpeed: 0.05, carAirControl: 0.5,
    jumpForce: 1.8, gravity: 0.055, doubleJumpForce: 1.4,
    flipForce: 2.8, flipTorque: 0.2,
    boostAcceleration: 0.18, boostMax: 100, boostConsumption: 0.5, boostRegenRate: 0.25,
    ballRadius: 6.5, ballFriction: 0.995, ballBounce: 0.75, ballGravity: 0.06,
    gameDuration: 300, goalResetDelay: 2500,
    cameraDistance: 45, cameraHeight: 18, cameraSmoothing: 0.1
};

let scene, camera, renderer, car, bot, ball;
let particles = [], boostParticles = [];
let blueScore = 0, orangeScore = 0, gameTime = CONFIG.gameDuration;
let isGameOver = false, isPaused = false, gameStarted = false, lastTime = 0;
const keys = { forward: false, backward: false, left: false, right: false, jump: false, boost: false };

// Replay system
const replayBuffer = [];
const REPLAY_BUFFER_SIZE = 180; // ~3 seconds at 60fps
let isReplaying = false;
let replayIndex = 0;
let replayCamera = null;

// ============================================
// INITIALIZATION
// ============================================

function setupMapSelection() {
    document.querySelectorAll('.map-btn').forEach(btn => {
        btn.addEventListener('click', () => startGame(btn.dataset.map));
    });
}

function startGame(mapId) {
    currentArena = ARENAS[mapId];
    document.getElementById('map-select').classList.add('hidden');
    document.getElementById('controls').classList.remove('hidden');
    initAudio();
    init();
}

function init() {
    const A = currentArena;
    scene = new THREE.Scene();
    scene.background = new THREE.Color(A.skyColor);
    scene.fog = new THREE.Fog(A.fogColor, 200, 600);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(1);
    document.body.appendChild(renderer.domElement);

    setupLighting();
    createArena();

    // Offset spawn positions diagonally so cars can't go straight to ball
    const spawnOffset = 35; // Lateral offset from center
    const spawnSide = Math.random() > 0.5 ? 1 : -1; // Random side

    car = createCar(A.carColors[0], 1);
    car.position.set(spawnSide * spawnOffset, 2.5, A.length / 2 - 60);
    car.rotation.y = -spawnSide * 0.3; // Angle toward center

    bot = createCar(A.carColors[1], -1);
    bot.position.set(-spawnSide * spawnOffset, 2.5, -(A.length / 2 - 60));
    bot.rotation.y = Math.PI + spawnSide * 0.3; // Angle toward center
    bot.isBot = true;
    bot.kickoffDelay = 1.2; // Short delay before bot starts

    ball = createBall();
    setupInput();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    document.getElementById('restart-btn').addEventListener('click', restartGame);

    gameStarted = true;
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function setupLighting() {
    scene.add(new THREE.AmbientLight(0x8899aa, 1.2));
    const light = new THREE.DirectionalLight(0xffffff, 1.0);
    light.position.set(50, 100, 30);
    scene.add(light);
    scene.add(new THREE.HemisphereLight(0x87ceeb, 0x362f2d, 0.5));
}

// ============================================
// ARENA CREATION
// ============================================

function createArena() {
    const A = currentArena;
    const g = new THREE.Group();

    // Floor with enhanced visuals
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(A.width, A.length, 20, 30),
        new THREE.MeshBasicMaterial({ color: A.floorColor })
    );
    floor.rotation.x = -Math.PI / 2;
    g.add(floor);

    // Field markings (center circle, lines)
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });

    // Center circle
    const circle = new THREE.Mesh(new THREE.RingGeometry(25, 27, 48), lineMat);
    circle.rotation.x = -Math.PI / 2;
    circle.position.y = 0.1;
    g.add(circle);

    // Center line
    const centerLine = new THREE.Mesh(new THREE.PlaneGeometry(A.width, 3), lineMat);
    centerLine.rotation.x = -Math.PI / 2;
    centerLine.position.y = 0.1;
    g.add(centerLine);

    // Walls
    const wallMat = new THREE.MeshBasicMaterial({ color: A.wallColor, transparent: true, opacity: 0.8 });

    // Side walls
    [-1, 1].forEach(s => {
        const w = new THREE.Mesh(new THREE.BoxGeometry(3, A.height, A.length), wallMat);
        w.position.set(s * (A.width / 2 + 1.5), A.height / 2, 0);
        g.add(w);
    });

    // End walls with goal cutouts
    [-1, 1].forEach(side => {
        const sideW = (A.width - A.goalWidth) / 2;
        [-1, 1].forEach(s => {
            const w = new THREE.Mesh(new THREE.BoxGeometry(sideW, A.height, 3), wallMat);
            w.position.set(s * (A.width / 4 + A.goalWidth / 4), A.height / 2, side * (A.length / 2 + 1.5));
            g.add(w);
        });
        const top = new THREE.Mesh(new THREE.BoxGeometry(A.goalWidth, A.height - A.goalHeight, 3), wallMat);
        top.position.set(0, A.goalHeight + (A.height - A.goalHeight) / 2, side * (A.length / 2 + 1.5));
        g.add(top);
    });

    // Goals with glowing effects
    [-1, 1].forEach((side, i) => {
        const goalG = new THREE.Group();
        const col = A.goalColors[i];
        const mat = new THREE.MeshBasicMaterial({ color: col });
        const glowMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.3 });

        // Thicker posts
        [-1, 1].forEach(ps => {
            const post = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, A.goalHeight, 16), mat);
            post.position.set(ps * A.goalWidth / 2, A.goalHeight / 2, 0);
            goalG.add(post);
            // Glow
            const glow = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, A.goalHeight, 16), glowMat);
            glow.position.copy(post.position);
            goalG.add(glow);
        });

        // Crossbar
        const bar = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, A.goalWidth + 2.4, 16), mat);
        bar.rotation.z = Math.PI / 2;
        bar.position.y = A.goalHeight;
        goalG.add(bar);

        // Goal floor glow
        const goalFloor = new THREE.Mesh(new THREE.PlaneGeometry(A.goalWidth, A.goalDepth), glowMat);
        goalFloor.rotation.x = -Math.PI / 2;
        goalFloor.position.set(0, 0.2, -side * A.goalDepth / 2);
        goalG.add(goalFloor);

        // Net
        const netMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.4 });
        const backNet = new THREE.Mesh(new THREE.PlaneGeometry(A.goalWidth, A.goalHeight, 12, 8), netMat);
        backNet.position.set(0, A.goalHeight / 2, -side * A.goalDepth);
        goalG.add(backNet);

        // Side nets
        [-1, 1].forEach(s => {
            const sideNet = new THREE.Mesh(new THREE.PlaneGeometry(A.goalDepth, A.goalHeight, 6, 8), netMat);
            sideNet.rotation.y = Math.PI / 2;
            sideNet.position.set(s * A.goalWidth / 2, A.goalHeight / 2, -side * A.goalDepth / 2);
            goalG.add(sideNet);
        });

        // Top net
        const topNet = new THREE.Mesh(new THREE.PlaneGeometry(A.goalWidth, A.goalDepth, 12, 6), netMat);
        topNet.rotation.x = -Math.PI / 2;
        topNet.position.set(0, A.goalHeight, -side * A.goalDepth / 2);
        goalG.add(topNet);

        goalG.position.z = side * A.length / 2;
        g.add(goalG);
    });

    // THEME-SPECIFIC DECORATIONS
    if (A.carStyle === 'muscle') {
        // Stadium theme: Floodlights, corner flags, stands
        const lightMat = new THREE.MeshBasicMaterial({ color: 0xffee88 });
        const poleMat = new THREE.MeshBasicMaterial({ color: 0x444444 });

        // Four corner floodlight towers
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => {
            const pole = new THREE.Mesh(new THREE.CylinderGeometry(2, 3, 70, 8), poleMat);
            pole.position.set(x * (A.width / 2 + 25), 35, z * (A.length / 2 + 25));
            g.add(pole);
            // Light box
            const lightBox = new THREE.Mesh(new THREE.BoxGeometry(15, 8, 8), lightMat);
            lightBox.position.set(x * (A.width / 2 + 25), 72, z * (A.length / 2 + 25));
            g.add(lightBox);
        });

        // Stadium stands (big blocks around arena)
        const standMat = new THREE.MeshBasicMaterial({ color: 0x2a2a3e });
        [-1, 1].forEach(s => {
            const stand = new THREE.Mesh(new THREE.BoxGeometry(50, 50, A.length + 60), standMat);
            stand.position.set(s * (A.width / 2 + 45), 20, 0);
            g.add(stand);
        });

    } else if (A.carStyle === 'cyber') {
        // Neon theme: Glowing grid, pillars, rings
        const neonMat1 = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.6 });
        const neonMat2 = new THREE.MeshBasicMaterial({ color: 0xff00ff, transparent: true, opacity: 0.6 });

        // Grid lines on floor
        for (let i = -5; i <= 5; i++) {
            const lineH = new THREE.Mesh(new THREE.BoxGeometry(A.width, 0.5, 1), neonMat1);
            lineH.position.set(0, 0.3, i * 40);
            g.add(lineH);
            const lineV = new THREE.Mesh(new THREE.BoxGeometry(1, 0.5, A.length), neonMat1);
            lineV.position.set(i * 25, 0.3, 0);
            g.add(lineV);
        }

        // Glowing pillars around arena
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const r = A.width / 2 + 40;
            const pillar = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 80, 8), i % 2 === 0 ? neonMat1 : neonMat2);
            pillar.position.set(Math.cos(angle) * r, 40, Math.sin(angle) * r * 1.4);
            g.add(pillar);
        }

        // Floating ring above arena
        const ring = new THREE.Mesh(new THREE.TorusGeometry(80, 2, 8, 48), neonMat1);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 60;
        g.add(ring);

    } else if (A.carStyle === 'sled') {
        // Ice theme: Crystal formations, aurora pillars, snowflakes
        const iceMat = new THREE.MeshBasicMaterial({ color: 0xaaddff, transparent: true, opacity: 0.6 });
        const crystalMat = new THREE.MeshBasicMaterial({ color: 0x88ccee, transparent: true, opacity: 0.7 });

        // Ice crystals around the arena
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const r = A.width / 2 + 30 + Math.random() * 30;
            const height = 15 + Math.random() * 25;
            const crystal = new THREE.Mesh(new THREE.ConeGeometry(4, height, 6), crystalMat);
            crystal.position.set(Math.cos(angle) * r, height / 2, Math.sin(angle) * r * 1.3);
            g.add(crystal);
        }

        // Aurora pillars (gradient effect)
        const auroraMat = new THREE.MeshBasicMaterial({ color: 0x66ffaa, transparent: true, opacity: 0.3 });
        for (let i = 0; i < 6; i++) {
            const pillar = new THREE.Mesh(new THREE.CylinderGeometry(8, 12, 100, 8), auroraMat);
            pillar.position.set((i - 2.5) * 50, 50, A.length / 2 + 80);
            g.add(pillar);
        }

        // Snowflake decorations
        for (let i = 0; i < 30; i++) {
            const flake = new THREE.Mesh(new THREE.OctahedronGeometry(2), iceMat);
            flake.position.set(
                (Math.random() - 0.5) * A.width * 1.5,
                20 + Math.random() * 60,
                (Math.random() - 0.5) * A.length * 1.2
            );
            g.add(flake);
        }
    }

    // Crowd (enhanced)
    const colors = A.goalColors;
    for (let i = 0; i < 60; i++) {
        const c = new THREE.Mesh(
            new THREE.BoxGeometry(3, 4, 3),
            new THREE.MeshBasicMaterial({ color: colors[i % 2] })
        );
        const ang = Math.random() * Math.PI * 2;
        const r = A.width / 2 + 50 + Math.random() * 30;
        c.position.set(Math.cos(ang) * r, 22 + Math.random() * 18, Math.sin(ang) * r * 1.3);
        g.add(c);
    }

    scene.add(g);
}

// ============================================
// CAR CREATION
// ============================================

function createCar(color, team) {
    const A = currentArena;
    const g = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ color });

    // Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(CONFIG.carWidth, CONFIG.carHeight * 0.6, CONFIG.carLength), mat);
    body.position.y = CONFIG.carHeight * 0.3;
    g.add(body);

    // Cabin
    const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(CONFIG.carWidth * 0.8, CONFIG.carHeight * 0.4, CONFIG.carLength * 0.45),
        new THREE.MeshBasicMaterial({ color: 0x222233 })
    );
    cabin.position.set(0, CONFIG.carHeight * 0.7, CONFIG.carLength * 0.05);
    g.add(cabin);

    // Special styling per arena
    if (A.carStyle === 'cyber') {
        // Neon glow strips
        const glow = new THREE.Mesh(
            new THREE.BoxGeometry(CONFIG.carWidth * 1.05, 0.1, CONFIG.carLength * 1.02),
            new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6 })
        );
        glow.position.y = CONFIG.carHeight * 0.6;
        g.add(glow);
    } else if (A.carStyle === 'sled') {
        // Ski runners
        [-1, 1].forEach(s => {
            const ski = new THREE.Mesh(
                new THREE.BoxGeometry(0.4, 0.2, CONFIG.carLength * 1.2),
                new THREE.MeshBasicMaterial({ color: 0x888888 })
            );
            ski.position.set(s * CONFIG.carWidth * 0.4, 0.1, 0);
            g.add(ski);
        });
    }

    // Wheels
    g.wheels = [];
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => {
        const wg = new THREE.Group();
        const w = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.6, 12), new THREE.MeshBasicMaterial({ color: 0x222222 }));
        w.rotation.z = Math.PI / 2;
        wg.add(w);
        wg.position.set(x * CONFIG.carWidth / 2, 0.8, z * CONFIG.carLength * 0.35);
        g.add(wg);
        g.wheels.push(wg);
    });

    g.boostEmitter = new THREE.Object3D();
    g.boostEmitter.position.set(0, CONFIG.carHeight * 0.3, CONFIG.carLength * 0.55);
    g.add(g.boostEmitter);

    g.velocity = new THREE.Vector3();
    g.boost = CONFIG.boostMax;
    g.isGrounded = true;
    g.canDoubleJump = false;
    g.canJump = true;
    g.isFlipping = false;
    g.flipRotation = new THREE.Vector3();
    g.teamSide = team;

    scene.add(g);
    return g;
}

// ============================================
// BALL CREATION
// ============================================

function createBall() {
    const A = currentArena;
    const g = new THREE.Group();

    const ballMesh = new THREE.Mesh(
        new THREE.SphereGeometry(CONFIG.ballRadius, 24, 24),
        new THREE.MeshBasicMaterial({ color: A.ballColor })
    );
    g.add(ballMesh);

    // Style variations
    if (A.ballStyle === 'neon') {
        const glow = new THREE.Mesh(
            new THREE.SphereGeometry(CONFIG.ballRadius * 1.15, 16, 16),
            new THREE.MeshBasicMaterial({ color: A.ballGlow, transparent: true, opacity: 0.4, wireframe: true })
        );
        g.add(glow);
    } else if (A.ballStyle === 'ice') {
        const pattern = new THREE.Mesh(
            new THREE.SphereGeometry(CONFIG.ballRadius * 1.01, 16, 16),
            new THREE.MeshBasicMaterial({ color: A.ballPattern, wireframe: true, transparent: true, opacity: 0.5 })
        );
        g.add(pattern);
    } else {
        const pattern = new THREE.Mesh(
            new THREE.SphereGeometry(CONFIG.ballRadius * 1.01, 20, 20),
            new THREE.MeshBasicMaterial({ color: A.ballPattern, wireframe: true, transparent: true, opacity: 0.3 })
        );
        g.add(pattern);
    }

    g.velocity = new THREE.Vector3();
    g.position.set(0, CONFIG.ballRadius + 1, 0);
    scene.add(g);
    return g;
}

// ============================================
// INPUT
// ============================================

function setupInput() {
    document.addEventListener('keydown', e => { if (!e.repeat) handleKey(e.code, true); e.preventDefault(); });
    document.addEventListener('keyup', e => handleKey(e.code, false));
}

function handleKey(code, pressed) {
    switch (code) {
        case 'KeyW': case 'ArrowUp': keys.forward = pressed; break;
        case 'KeyS': case 'ArrowDown': keys.backward = pressed; break;
        case 'KeyA': case 'ArrowLeft': keys.left = pressed; break;
        case 'KeyD': case 'ArrowRight': keys.right = pressed; break;
        case 'Space': keys.jump = pressed; if (pressed) performJump(car); break;
        case 'ShiftLeft': case 'ShiftRight': keys.boost = pressed; break;
    }
}

function performJump(c) {
    if (c.isGrounded && c.canJump) {
        c.velocity.y = CONFIG.jumpForce;
        c.isGrounded = false;
        c.canDoubleJump = true;
        c.canJump = false;
        if (c === car) playSound('jump');
    } else if (c.canDoubleJump && !c.isGrounded) {
        c.velocity.y = CONFIG.doubleJumpForce;
        c.canDoubleJump = false;
        if (c === car) playSound('jump');
    }
}

// ============================================
// PHYSICS
// ============================================

function updatePhysics(dt) {
    updateCarPhysics(car, true);
    updateCarPhysics(bot, false);
    updateBotAI();
    updateBallPhysics();
    checkCollisions();
    checkGoals();
}

function updateCarPhysics(c, isPlayer) {
    const A = currentArena;
    const groundY = 2.5;

    if (c.position.y <= groundY + 0.1) {
        c.position.y = groundY;
        if (c.velocity.y < 0) c.velocity.y = 0;
        c.isGrounded = true;
        c.isFlipping = false;
        c.rotation.x *= 0.9;
        c.rotation.z *= 0.9;
        if (!keys.jump || !isPlayer) c.canJump = true;
    } else {
        c.isGrounded = false;
    }

    if (!c.isGrounded) c.velocity.y -= CONFIG.gravity;

    if (isPlayer) {
        const speed = c.velocity.length();
        const turn = c.isGrounded ? 1 : CONFIG.carAirControl;
        const sf = Math.min(speed / 1.5, 1);

        if (keys.left) c.rotation.y += CONFIG.carTurnSpeed * sf * turn;
        if (keys.right) c.rotation.y -= CONFIG.carTurnSpeed * sf * turn;

        const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(c.quaternion);
        fwd.y = 0; fwd.normalize();

        if (c.isGrounded) {
            let maxSpd = CONFIG.carMaxSpeed, acc = CONFIG.carAcceleration;
            if (keys.boost && c.boost > 0) {
                maxSpd = CONFIG.carBoostMaxSpeed;
                acc = CONFIG.boostAcceleration;
                c.boost -= CONFIG.boostConsumption;
                createBoostParticle(c);
            } else if (!keys.boost) {
                c.boost = Math.min(c.boost + CONFIG.boostRegenRate, CONFIG.boostMax);
            }
            if (keys.forward) c.velocity.add(fwd.clone().multiplyScalar(acc));
            if (keys.backward) c.velocity.add(fwd.clone().multiplyScalar(-acc * 0.7));

            const hv = new THREE.Vector2(c.velocity.x, c.velocity.z);
            if (hv.length() > maxSpd) {
                hv.normalize().multiplyScalar(maxSpd);
                c.velocity.x = hv.x; c.velocity.z = hv.y;
            }
            c.velocity.x *= CONFIG.carFriction;
            c.velocity.z *= CONFIG.carFriction;
        }

        document.getElementById('boost-fill').style.width = c.boost + '%';
        document.getElementById('boost-value').textContent = Math.floor(c.boost);
    }

    c.position.add(c.velocity);
    c.wheels.forEach(w => w.children[0].rotation.x += c.velocity.length() * 0.3);

    // Wall collisions
    const hw = A.width / 2 - 3, hl = A.length / 2 - 3;
    if (c.position.x < -hw) { c.position.x = -hw; c.velocity.x *= -0.5; }
    if (c.position.x > hw) { c.position.x = hw; c.velocity.x *= -0.5; }
    if (c.position.z < -hl) { c.position.z = -hl; c.velocity.z *= -0.5; }
    if (c.position.z > hl) { c.position.z = hl; c.velocity.z *= -0.5; }
}

function updateBallPhysics() {
    const A = currentArena;
    ball.velocity.y -= CONFIG.ballGravity;

    if (ball.position.y < CONFIG.ballRadius) {
        ball.position.y = CONFIG.ballRadius;
        ball.velocity.y *= -CONFIG.ballBounce;
        ball.velocity.x *= 0.98;
        ball.velocity.z *= 0.98;
    }
    if (ball.position.y > A.height - CONFIG.ballRadius) {
        ball.position.y = A.height - CONFIG.ballRadius;
        ball.velocity.y *= -CONFIG.ballBounce;
    }

    const hw = A.width / 2 - CONFIG.ballRadius;
    const hl = A.length / 2 - CONFIG.ballRadius;

    if (ball.position.x < -hw) { ball.position.x = -hw; ball.velocity.x *= -CONFIG.ballBounce; }
    if (ball.position.x > hw) { ball.position.x = hw; ball.velocity.x *= -CONFIG.ballBounce; }

    const inGoalX = Math.abs(ball.position.x) < A.goalWidth / 2;
    const inGoalY = ball.position.y < A.goalHeight;

    if (ball.position.z < -hl && !(inGoalX && inGoalY)) { ball.position.z = -hl; ball.velocity.z *= -CONFIG.ballBounce; }
    if (ball.position.z > hl && !(inGoalX && inGoalY)) { ball.position.z = hl; ball.velocity.z *= -CONFIG.ballBounce; }

    ball.velocity.multiplyScalar(CONFIG.ballFriction);
    ball.position.add(ball.velocity);
    ball.rotation.x += ball.velocity.z * 0.04;
    ball.rotation.z -= ball.velocity.x * 0.04;
}

function checkCollisions() {
    [car, bot].forEach(c => {
        const dist = c.position.distanceTo(ball.position);
        const colDist = CONFIG.ballRadius + CONFIG.carLength / 2;
        if (dist < colDist) {
            const n = new THREE.Vector3().subVectors(ball.position, c.position).normalize();
            ball.position.add(n.clone().multiplyScalar(colDist - dist + 0.5));
            const power = Math.max(c.velocity.length() * 2, 1);
            ball.velocity.copy(c.velocity.clone().multiplyScalar(0.6));
            ball.velocity.add(n.multiplyScalar(power));
            if (ball.velocity.y < 0.3) ball.velocity.y = 0.3;
            createHitParticles(ball.position.clone());
            playSound('hit', 0.4);
        }
    });

    const carDist = car.position.distanceTo(bot.position);
    if (carDist < CONFIG.carLength) {
        const n = new THREE.Vector3().subVectors(bot.position, car.position).normalize();
        car.position.add(n.clone().multiplyScalar(-(CONFIG.carLength - carDist) / 2));
        bot.position.add(n.clone().multiplyScalar((CONFIG.carLength - carDist) / 2));
    }
}

function checkGoals() {
    const A = currentArena;
    const goalZ = A.length / 2 + A.goalDepth / 2;

    if (Math.abs(ball.position.x) < A.goalWidth / 2 && ball.position.y < A.goalHeight) {
        if (ball.position.z < -goalZ + A.goalDepth) scoreGoal('orange');
        else if (ball.position.z > goalZ - A.goalDepth) scoreGoal('blue');
    }
}

function scoreGoal(team) {
    if (team === 'blue') {
        blueScore++;
        document.getElementById('blue-score').textContent = blueScore;
        document.getElementById('goal-scorer').textContent = 'Blue Scores!';
        document.getElementById('goal-scorer').style.color = '#4fa8ff';
    } else {
        orangeScore++;
        document.getElementById('orange-score').textContent = orangeScore;
        document.getElementById('goal-scorer').textContent = 'Orange Scores!';
        document.getElementById('goal-scorer').style.color = '#ff8c42';
    }

    isPaused = true;
    playSound('goal', 0.5);
    createGoalExplosion();

    // Start cinematic replay
    startReplay(() => {
        document.getElementById('goal-notification').classList.remove('hidden');
        setTimeout(() => {
            document.getElementById('goal-notification').classList.add('hidden');
            resetPositions();
            isPaused = false;
        }, 1500);
    });
}

// Record game state for replay
function recordFrame() {
    if (isReplaying || isPaused || !ball || !car || !bot) return;

    replayBuffer.push({
        ball: { pos: ball.position.clone(), rot: ball.rotation.clone() },
        car: { pos: car.position.clone(), rot: car.rotation.clone() },
        bot: { pos: bot.position.clone(), rot: bot.rotation.clone() }
    });

    if (replayBuffer.length > REPLAY_BUFFER_SIZE) {
        replayBuffer.shift();
    }
}

// Start cinematic replay
function startReplay(onComplete) {
    if (replayBuffer.length < 30) {
        onComplete();
        return;
    }

    isReplaying = true;
    replayIndex = 0;
    document.getElementById('replay-indicator').classList.remove('hidden');

    // Store original positions
    const origBall = { pos: ball.position.clone(), rot: ball.rotation.clone() };
    const origCar = { pos: car.position.clone(), rot: car.rotation.clone() };
    const origBot = { pos: bot.position.clone(), rot: bot.rotation.clone() };

    const replayInterval = setInterval(() => {
        if (replayIndex >= replayBuffer.length) {
            clearInterval(replayInterval);

            // Restore positions
            ball.position.copy(origBall.pos);
            ball.rotation.copy(origBall.rot);
            car.position.copy(origCar.pos);
            car.rotation.copy(origCar.rot);
            bot.position.copy(origBot.pos);
            bot.rotation.copy(origBot.rot);

            isReplaying = false;
            replayBuffer.length = 0;
            document.getElementById('replay-indicator').classList.add('hidden');
            onComplete();
            return;
        }

        // Apply recorded frame
        const frame = replayBuffer[replayIndex];
        ball.position.copy(frame.ball.pos);
        ball.rotation.copy(frame.ball.rot);
        car.position.copy(frame.car.pos);
        car.rotation.copy(frame.car.rot);
        bot.position.copy(frame.bot.pos);
        bot.rotation.copy(frame.bot.rot);

        // Cinematic camera - orbit around ball
        const t = replayIndex / replayBuffer.length;
        const angle = t * Math.PI * 0.8 - Math.PI * 0.4;
        const camDist = 50 + Math.sin(t * Math.PI) * 20;
        const camHeight = 15 + Math.sin(t * Math.PI) * 25;

        camera.position.set(
            ball.position.x + Math.sin(angle) * camDist,
            ball.position.y + camHeight,
            ball.position.z + Math.cos(angle) * camDist
        );
        camera.lookAt(ball.position);

        replayIndex++;
    }, 25); // Slightly slower playback for drama
}

function resetPositions() {
    const A = currentArena;
    ball.position.set(0, CONFIG.ballRadius + 1, 0);
    ball.velocity.set(0, 0, 0);

    // Random diagonal spawn positions
    const spawnOffset = 35;
    const spawnSide = Math.random() > 0.5 ? 1 : -1;

    car.position.set(spawnSide * spawnOffset, 2.5, A.length / 2 - 60);
    car.rotation.set(0, -spawnSide * 0.3, 0);
    car.velocity.set(0, 0, 0);
    car.boost = CONFIG.boostMax;
    car.isGrounded = true;
    car.canJump = true;

    bot.position.set(-spawnSide * spawnOffset, 2.5, -(A.length / 2 - 60));
    bot.rotation.set(0, Math.PI + spawnSide * 0.3, 0);
    bot.velocity.set(0, 0, 0);
    bot.boost = CONFIG.boostMax;
    bot.isGrounded = true;
    bot.kickoffDelay = 0.8; // Short delay before bot moves
}

// ============================================
// BOT AI
// ============================================

function updateBotAI() {
    if (isPaused || isGameOver) return;

    // Shorter kickoff delay for faster reactions
    if (bot.kickoffDelay > 0) {
        bot.kickoffDelay -= 0.016;
        bot.velocity.x *= 0.95;
        bot.velocity.z *= 0.95;
        return;
    }

    const A = currentArena;
    const ballDist = bot.position.distanceTo(ball.position);
    const ballToBotGoal = ball.position.z + A.length / 2; // Distance from ball to bot's goal
    const ballToPlayerGoal = A.length / 2 - ball.position.z; // Distance from ball to player's goal

    // Predict ball position
    const predictTime = Math.min(ballDist / 4, 15); // Prediction based on distance
    const predictedBall = ball.position.clone().add(ball.velocity.clone().multiplyScalar(predictTime));
    predictedBall.y = Math.max(predictedBall.y, CONFIG.ballRadius);

    // Determine target based on game situation
    let target;
    let urgency = 1.0; // How fast bot should move

    // CRITICAL: Ball heading toward bot's goal fast
    if (ball.velocity.z < -1.5 && ball.position.z < 50) {
        target = predictedBall.clone();
        target.z = Math.max(target.z, -A.length / 2 + 40); // Don't go too deep
        urgency = 1.3;
    }
    // ATTACK: Ball in player's half, go for shot
    else if (ball.position.z > 30) {
        // Position to hit ball toward player's goal
        target = ball.position.clone();
        target.z -= 15; // Get behind ball
        target.x *= 0.5; // Stay more central for better shots
        urgency = 1.2;
    }
    // DEFEND: Ball in bot's half
    else if (ball.position.z < -30) {
        // Get between ball and goal
        target = ball.position.clone();
        target.z += 20; // Stay behind ball
        urgency = 1.1;
    }
    // MIDFIELD: Contest the ball
    else {
        target = predictedBall.clone();
        // Aim to hit it toward player's goal
        const shotAngle = Math.atan2(ball.position.x, A.length / 2 - ball.position.z);
        target.x -= Math.sin(shotAngle) * 10;
        target.z -= Math.cos(shotAngle) * 10;
        urgency = 1.0;
    }

    // Clamp target
    target.x = Math.max(-A.width / 2 + 20, Math.min(A.width / 2 - 20, target.x));
    target.z = Math.max(-A.length / 2 + 25, Math.min(A.length / 2 - 25, target.z));

    const toTarget = new THREE.Vector3().subVectors(target, bot.position);
    toTarget.y = 0;
    const dist = toTarget.length();
    toTarget.normalize();

    const botFwd = new THREE.Vector3(0, 0, -1).applyQuaternion(bot.quaternion);
    botFwd.y = 0; botFwd.normalize();

    const cross = new THREE.Vector3().crossVectors(botFwd, toTarget);
    const dot = botFwd.dot(toTarget);
    const angle = Math.atan2(cross.y, dot);

    // Fast turning - almost as good as player
    const turnSpeed = CONFIG.carTurnSpeed * 0.95;
    if (angle > 0.1) bot.rotation.y -= turnSpeed;
    else if (angle < -0.1) bot.rotation.y += turnSpeed;

    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(bot.quaternion);
    fwd.y = 0; fwd.normalize();

    if (bot.isGrounded) {
        // Bot is now 90% as fast as player
        let acc = CONFIG.carAcceleration * 0.9 * urgency;
        let maxSpd = CONFIG.carMaxSpeed * 0.9;

        // Boost aggressively when chasing ball or defending
        const shouldBoost = (ballDist > 30 || urgency > 1.0) &&
            bot.boost > 15 &&
            Math.abs(angle) < 0.5;

        if (shouldBoost) {
            maxSpd = CONFIG.carBoostMaxSpeed * 0.9;
            acc = CONFIG.boostAcceleration * 0.9;
            bot.boost -= CONFIG.boostConsumption;
            createBoostParticle(bot);
        } else {
            bot.boost = Math.min(bot.boost + CONFIG.boostRegenRate, CONFIG.boostMax);
        }

        // Accelerate when roughly facing target
        if (dist > 8 && Math.abs(angle) < Math.PI / 3) {
            bot.velocity.add(fwd.clone().multiplyScalar(acc));
        }

        // Reverse if target is behind (quick recovery)
        if (dist > 15 && Math.abs(angle) > Math.PI * 0.7) {
            bot.velocity.add(fwd.clone().multiplyScalar(-acc * 0.6));
        }

        const hv = new THREE.Vector2(bot.velocity.x, bot.velocity.z);
        if (hv.length() > maxSpd) {
            hv.normalize().multiplyScalar(maxSpd);
            bot.velocity.x = hv.x;
            bot.velocity.z = hv.y;
        }
        bot.velocity.x *= CONFIG.carFriction;
        bot.velocity.z *= CONFIG.carFriction;

        // Jump for aerial balls
        if (ball.position.y > 8 && ballDist < 25 && ballDist > 5) {
            performJump(bot);
        }
    }
}

// ============================================
// PARTICLES
// ============================================

function createBoostParticle(c) {
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.5, 4, 4), new THREE.MeshBasicMaterial({ color: c === car ? 0x4488ff : 0xff8844, transparent: true, opacity: 1 }));
    const wp = new THREE.Vector3(); c.boostEmitter.getWorldPosition(wp);
    p.position.copy(wp);
    const bk = new THREE.Vector3(0, 0, 1).applyQuaternion(c.quaternion);
    p.velocity = bk.multiplyScalar(0.3);
    p.life = 1; p.decay = 0.06;
    scene.add(p); boostParticles.push(p);
}

function createHitParticles(pos) {
    for (let i = 0; i < 5; i++) {
        const p = new THREE.Mesh(new THREE.SphereGeometry(0.3, 4, 4), new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 1 }));
        p.position.copy(pos);
        p.velocity = new THREE.Vector3((Math.random() - 0.5) * 0.5, Math.random() * 0.5, (Math.random() - 0.5) * 0.5);
        p.life = 1; p.decay = 0.1;
        scene.add(p); particles.push(p);
    }
}

function createGoalExplosion() {
    for (let i = 0; i < 20; i++) {
        const cols = [0xffdd00, 0xff8800, 0xffffff];
        const p = new THREE.Mesh(new THREE.SphereGeometry(0.6, 4, 4), new THREE.MeshBasicMaterial({ color: cols[i % 3], transparent: true, opacity: 1 }));
        p.position.copy(ball.position);
        p.velocity = new THREE.Vector3((Math.random() - 0.5) * 1.5, Math.random() * 1.5, (Math.random() - 0.5) * 1.5);
        p.life = 1; p.decay = 0.03;
        scene.add(p); particles.push(p);
    }
}

function updateParticles() {
    [boostParticles, particles].forEach(arr => {
        for (let i = arr.length - 1; i >= 0; i--) {
            const p = arr[i];
            p.position.add(p.velocity);
            if (arr === particles) p.velocity.y -= 0.02;
            p.life -= p.decay;
            p.material.opacity = p.life;
            if (p.life <= 0) { scene.remove(p); arr.splice(i, 1); }
        }
    });
}

// ============================================
// CAMERA & GAME LOOP
// ============================================

function updateCamera() {
    const offset = new THREE.Vector3(0, CONFIG.cameraHeight, CONFIG.cameraDistance).applyQuaternion(car.quaternion);
    const target = car.position.clone().add(offset);
    target.y = Math.max(target.y, 10);
    camera.position.lerp(target, CONFIG.cameraSmoothing);
    const look = car.position.clone();
    look.y += 4;
    camera.lookAt(look);
}

function gameLoop(ts) {
    requestAnimationFrame(gameLoop);
    if (!gameStarted) return;

    const dt = Math.min((ts - lastTime) / 1000, 0.1);
    lastTime = ts;

    if (!isGameOver && !isPaused && !isReplaying) {
        gameTime -= dt;
        if (gameTime <= 0) { gameTime = 0; endGame(); }
        const m = Math.floor(gameTime / 60), s = Math.floor(gameTime % 60);
        document.getElementById('timer').textContent = m + ':' + s.toString().padStart(2, '0');
        updatePhysics(dt);
        recordFrame(); // Record for replay
    }
    updateParticles();
    if (!isReplaying) updateCamera(); // Don't override replay camera
    renderer.render(scene, camera);
}

function endGame() {
    isGameOver = true;
    document.getElementById('final-score').textContent = blueScore > orangeScore ? `You Win! ${blueScore}-${orangeScore}` : orangeScore > blueScore ? `You Lose! ${orangeScore}-${blueScore}` : `Draw! ${blueScore}-${orangeScore}`;
    document.getElementById('game-over').classList.remove('hidden');
}

function restartGame() {
    blueScore = 0; orangeScore = 0; gameTime = CONFIG.gameDuration; isGameOver = false;
    document.getElementById('blue-score').textContent = '0';
    document.getElementById('orange-score').textContent = '0';
    document.getElementById('game-over').classList.add('hidden');
    resetPositions();
}

// Start
setupMapSelection();
