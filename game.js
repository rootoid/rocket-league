// ============================================
// ROCKET LEAGUE 3D CLONE - MULTI-ARENA
// ============================================

// Audio system
let audioCtx = null;
let musicPlaying = false;
let musicOsc = null;
let musicGain = null;

function initAudio() {
    if (audioCtx) {
        audioCtx.close();
    }
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    startThemeMusic();
}

function resetInput() {
    Object.keys(keys).forEach(k => keys[k] = false);
}

// Addictive theme song - energetic looping melody
function startThemeMusic() {
    if (musicPlaying || !audioCtx) return;
    musicPlaying = true;

    // Create master gain for music
    musicGain = audioCtx.createGain();
    musicGain.connect(audioCtx.destination);
    musicGain.gain.value = 0.15;

    // Bass line pattern - driving beat
    const bassNotes = [65, 65, 82, 82, 73, 73, 98, 82]; // Low pumping bass
    const melodyNotes = [330, 392, 440, 392, 330, 294, 330, 392]; // Catchy hook

    let beatIndex = 0;
    const bpm = 140;
    const beatTime = 60 / bpm;

    function playBeat() {
        if (!musicPlaying || !audioCtx) return;

        // Bass hit
        const bass = audioCtx.createOscillator();
        const bassG = audioCtx.createGain();
        bass.connect(bassG);
        bassG.connect(musicGain);
        bass.type = 'sawtooth';
        bass.frequency.value = bassNotes[beatIndex % bassNotes.length];
        bassG.gain.value = 0.3;
        bassG.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + beatTime * 0.8);
        bass.start();
        bass.stop(audioCtx.currentTime + beatTime * 0.8);

        // Melody on even beats
        if (beatIndex % 2 === 0) {
            const mel = audioCtx.createOscillator();
            const melG = audioCtx.createGain();
            mel.connect(melG);
            melG.connect(musicGain);
            mel.type = 'square';
            mel.frequency.value = melodyNotes[Math.floor(beatIndex / 2) % melodyNotes.length];
            melG.gain.value = 0.12;
            melG.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + beatTime * 1.5);
            mel.start();
            mel.stop(audioCtx.currentTime + beatTime * 1.5);
        }

        // Hi-hat
        const noise = audioCtx.createOscillator();
        const noiseG = audioCtx.createGain();
        noise.connect(noiseG);
        noiseG.connect(musicGain);
        noise.type = 'triangle';
        noise.frequency.value = 8000 + Math.random() * 2000;
        noiseG.gain.value = 0.05;
        noiseG.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
        noise.start();
        noise.stop(audioCtx.currentTime + 0.05);

        beatIndex++;
        setTimeout(playBeat, beatTime * 1000);
    }

    playBeat();
}

function playSound(type, volume = 0.4) {
    if (!audioCtx) return;

    switch (type) {
        case 'engine':
            {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.type = 'sawtooth';
                osc.frequency.value = 80 + Math.random() * 30;
                gain.gain.value = volume * 0.5;
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
                osc.start(); osc.stop(audioCtx.currentTime + 0.15);
            }
            break;
        case 'boost':
            {
                // Whooshing boost sound
                const osc = audioCtx.createOscillator();
                const osc2 = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                osc2.connect(gain);
                gain.connect(audioCtx.destination);
                osc.type = 'sawtooth';
                osc2.type = 'triangle';
                osc.frequency.value = 150;
                osc2.frequency.value = 200;
                osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.2);
                osc2.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.2);
                gain.gain.value = volume * 0.4;
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
                osc.start(); osc.stop(audioCtx.currentTime + 0.2);
                osc2.start(); osc2.stop(audioCtx.currentTime + 0.2);
            }
            break;
        case 'hit':
            {
                // Satisfying ball hit - punchy with reverb feel
                const osc = audioCtx.createOscillator();
                const osc2 = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                osc2.connect(gain);
                gain.connect(audioCtx.destination);
                osc.type = 'sine';
                osc2.type = 'triangle';
                osc.frequency.value = 400;
                osc2.frequency.value = 600;
                osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.3);
                osc2.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.25);
                gain.gain.value = volume * 0.6;
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
                osc.start(); osc.stop(audioCtx.currentTime + 0.35);
                osc2.start(); osc2.stop(audioCtx.currentTime + 0.3);
            }
            break;
        case 'goal':
            {
                // EPIC goal celebration - fanfare!
                const notes = [392, 494, 587, 784, 988, 784, 988, 1175]; // G4 to D6 triumph
                notes.forEach((freq, i) => {
                    const o = audioCtx.createOscillator();
                    const o2 = audioCtx.createOscillator();
                    const g = audioCtx.createGain();
                    o.connect(g); o2.connect(g); g.connect(audioCtx.destination);
                    o.type = 'square';
                    o2.type = 'sawtooth';
                    o.frequency.value = freq;
                    o2.frequency.value = freq * 1.005; // Slight detune for richness
                    g.gain.value = 0.25;
                    g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6 + i * 0.08);
                    o.start(audioCtx.currentTime + i * 0.08);
                    o.stop(audioCtx.currentTime + 0.6 + i * 0.08);
                    o2.start(audioCtx.currentTime + i * 0.08);
                    o2.stop(audioCtx.currentTime + 0.6 + i * 0.08);
                });
                // Bass drop
                const bass = audioCtx.createOscillator();
                const bassG = audioCtx.createGain();
                bass.connect(bassG); bassG.connect(audioCtx.destination);
                bass.type = 'sawtooth';
                bass.frequency.value = 80;
                bassG.gain.value = 0.4;
                bassG.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.2);
                bass.start(); bass.stop(audioCtx.currentTime + 1.2);
            }
            break;
        case 'jump':
            {
                // Satisfying whoosh-up jump
                const osc = audioCtx.createOscillator();
                const osc2 = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                osc2.connect(gain);
                gain.connect(audioCtx.destination);
                osc.type = 'sine';
                osc2.type = 'triangle';
                osc.frequency.value = 180;
                osc2.frequency.value = 220;
                osc.frequency.exponentialRampToValueAtTime(500, audioCtx.currentTime + 0.15);
                osc2.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.12);
                gain.gain.value = volume * 0.35;
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
                osc.start(); osc.stop(audioCtx.currentTime + 0.2);
                osc2.start(); osc2.stop(audioCtx.currentTime + 0.15);
            }
            break;
        case 'countdown':
            {
                // Tick sound
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.type = 'sine';
                osc.frequency.value = 880;
                gain.gain.value = 0.3;
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
                osc.start(); osc.stop(audioCtx.currentTime + 0.1);
            }
            break;
        case 'wallhit':
            {
                // Thud for wall collision
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.type = 'sine';
                osc.frequency.value = 100;
                osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.15);
                gain.gain.value = volume * 0.3;
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
                osc.start(); osc.stop(audioCtx.currentTime + 0.15);
            }
            break;
    }
}

// Arena configurations - 50% BIGGER arenas
const ARENAS = {
    stadium: {
        name: 'Stadium',
        width: 450, length: 765, height: 120,
        goalWidth: 146, goalHeight: 72, goalDepth: 57,
        floorColor: 0x2d5a27, wallColor: 0x1a3d5c,
        skyColor: 0x1a1a2e, fogColor: 0x1a1a2e,
        goalColors: [0x4fa8ff, 0xff8c42],
        carColors: [0x4fa8ff, 0xff8c42],
        ballColor: 0xffffff, ballGlow: 0xffff00, ballPattern: 0x333333,
        carStyle: 'muscle', ballStyle: 'classic'
    },
    neon: {
        name: 'Neon City',
        width: 450, length: 765, height: 120,
        goalWidth: 146, goalHeight: 72, goalDepth: 57,
        floorColor: 0x0a0a15, wallColor: 0x1a0a2e,
        skyColor: 0x05051a, fogColor: 0x0a0a20,
        goalColors: [0x00ffff, 0xff00ff],
        carColors: [0x00ffff, 0xff00ff],
        ballColor: 0x111111, ballGlow: 0x00ff88, ballPattern: 0x00ff88,
        carStyle: 'cyber', ballStyle: 'neon'
    },
    ice: {
        name: 'Ice World',
        width: 450, length: 765, height: 120,
        goalWidth: 146, goalHeight: 72, goalDepth: 57,
        floorColor: 0x1a3a4a, wallColor: 0x0a2a3a,
        skyColor: 0x0a1520, fogColor: 0x102030,
        goalColors: [0x00ddff, 0xff4466],
        carColors: [0x00ddff, 0xff4466],
        ballColor: 0xccffff, ballGlow: 0x00ffff, ballPattern: 0x88ffff,
        carStyle: 'sled', ballStyle: 'ice'
    },
    volcanic: {
        name: 'Volcanic Fury',
        width: 450, length: 765, height: 120,
        goalWidth: 146, goalHeight: 72, goalDepth: 57,
        floorColor: 0x1a0a08, wallColor: 0x2a0f0a,
        skyColor: 0x0a0505, fogColor: 0x1a0808,
        goalColors: [0xff3300, 0xff6600],
        carColors: [0xff4400, 0xffaa00],
        ballColor: 0x221111, ballGlow: 0xff4400, ballPattern: 0xff2200,
        carStyle: 'volcanic', ballStyle: 'lava'
    },
    candycane: {
        name: 'Candy Cane Land',
        width: 450, length: 765, height: 120,
        goalWidth: 146, goalHeight: 72, goalDepth: 57,
        floorColor: 0xffeeee, wallColor: 0xffdddd,
        skyColor: 0x331122, fogColor: 0x442233,
        goalColors: [0xff0000, 0xffffff],
        carColors: [0xff2222, 0xffffff],
        ballColor: 0xffffff, ballGlow: 0xff4444, ballPattern: 0xff0000,
        carStyle: 'candycane', ballStyle: 'candy'
    }
};

let currentArena = null;
const CONFIG = {
    carWidth: 5, carHeight: 2.5, carLength: 7,
    carMaxSpeed: 4.0, carBoostMaxSpeed: 6.5, carAcceleration: 0.09,
    carFriction: 0.98, carTurnSpeed: 0.05, carAirControl: 0.5,
    jumpForce: 0.35, jumpMaxVelocity: 2.0, jumpBoostTime: 12, gravity: 0.055, doubleJumpForce: 1.6,
    flipForce: 2.8, flipTorque: 0.2,
    boostAcceleration: 0.18, boostMax: 100, boostConsumption: 0.5, boostRegenRate: 0.25,
    ballRadius: 6.5, ballFriction: 0.995, ballBounce: 0.75, ballGravity: 0.06,
    gameDuration: 300, goalResetDelay: 2500,
    cameraDistance: 55, cameraHeight: 22, cameraSmoothing: 0.1
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
    resetInput();
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
        backNet.position.set(0, A.goalHeight / 2, side * A.goalDepth);
        goalG.add(backNet);

        // Side nets
        [-1, 1].forEach(s => {
            const sideNet = new THREE.Mesh(new THREE.PlaneGeometry(A.goalDepth, A.goalHeight, 6, 8), netMat);
            sideNet.rotation.y = Math.PI / 2;
            sideNet.position.set(s * A.goalWidth / 2, A.goalHeight / 2, side * A.goalDepth / 2);
            goalG.add(sideNet);
        });

        // Top net
        const topNet = new THREE.Mesh(new THREE.PlaneGeometry(A.goalWidth, A.goalDepth, 12, 6), netMat);
        topNet.rotation.x = -Math.PI / 2;
        topNet.position.set(0, A.goalHeight, side * A.goalDepth / 2);
        goalG.add(topNet);

        goalG.position.z = side * A.length / 2;
        g.add(goalG);
    });

    // THEME-SPECIFIC DECORATIONS
    if (A.carStyle === 'muscle') {
        // STADIUM THEME - Enhanced with detailed stands, roof, and lighting
        const lightMat = new THREE.MeshBasicMaterial({ color: 0xffee88 });
        const poleMat = new THREE.MeshBasicMaterial({ color: 0x444444 });
        const standMat = new THREE.MeshBasicMaterial({ color: 0x2a2a3e });
        const seatMat1 = new THREE.MeshBasicMaterial({ color: 0x4fa8ff });
        const seatMat2 = new THREE.MeshBasicMaterial({ color: 0xff8c42 });
        const roofMat = new THREE.MeshBasicMaterial({ color: 0x1a1a2a, transparent: true, opacity: 0.8 });
        const grassLineMat = new THREE.MeshBasicMaterial({ color: 0x3a7a37 });

        // Grass stripes on field
        for (let i = -6; i <= 6; i++) {
            if (i % 2 === 0) {
                const stripe = new THREE.Mesh(new THREE.PlaneGeometry(A.width * 0.9, 50), grassLineMat);
                stripe.rotation.x = -Math.PI / 2;
                stripe.position.set(0, 0.05, i * 55);
                g.add(stripe);
            }
        }

        // Eight corner floodlight towers (taller, more detailed)
        [[-1, -1], [1, -1], [-1, 1], [1, 1], [-1, 0], [1, 0]].forEach(([x, z]) => {
            const pole = new THREE.Mesh(new THREE.CylinderGeometry(3, 4, 120, 12), poleMat);
            pole.position.set(x * (A.width / 2 + 50), 60, z * (A.length / 2));
            g.add(pole);
            // Multiple light banks
            for (let j = 0; j < 3; j++) {
                const lightBox = new THREE.Mesh(new THREE.BoxGeometry(18, 6, 6), lightMat);
                lightBox.position.set(x * (A.width / 2 + 50), 115 + j * 8, z * (A.length / 2));
                lightBox.rotation.y = x > 0 ? -0.3 : 0.3;
                g.add(lightBox);
            }
        });

        // Multi-tier stadium stands
        [-1, 1].forEach(side => {
            // Lower tier
            const lower = new THREE.Mesh(new THREE.BoxGeometry(80, 40, A.length + 80), standMat);
            lower.position.set(side * (A.width / 2 + 60), 20, 0);
            g.add(lower);
            // Upper tier
            const upper = new THREE.Mesh(new THREE.BoxGeometry(60, 35, A.length + 60), standMat);
            upper.position.set(side * (A.width / 2 + 85), 55, 0);
            g.add(upper);
            // Seat rows (colored by team side)
            for (let row = 0; row < 8; row++) {
                const seatRow = new THREE.Mesh(
                    new THREE.BoxGeometry(8, 3, A.length * 0.7),
                    side > 0 ? seatMat2 : seatMat1
                );
                seatRow.position.set(side * (A.width / 2 + 30 + row * 8), 10 + row * 5, 0);
                g.add(seatRow);
            }
        });

        // End stands
        [-1, 1].forEach(side => {
            const endStand = new THREE.Mesh(new THREE.BoxGeometry(A.width * 0.6, 30, 50), standMat);
            endStand.position.set(0, 15, side * (A.length / 2 + 50));
            g.add(endStand);
        });

        // Stadium roof canopy
        const roofSpan = new THREE.Mesh(new THREE.BoxGeometry(A.width + 180, 5, A.length + 100), roofMat);
        roofSpan.position.set(0, 100, 0);
        g.add(roofSpan);

        // Scoreboard structures
        [-1, 1].forEach(side => {
            const board = new THREE.Mesh(new THREE.BoxGeometry(60, 25, 5), new THREE.MeshBasicMaterial({ color: 0x111122 }));
            board.position.set(0, 85, side * (A.length / 2 + 60));
            g.add(board);
            const screen = new THREE.Mesh(new THREE.BoxGeometry(55, 20, 1), new THREE.MeshBasicMaterial({ color: 0x333366 }));
            screen.position.set(0, 85, side * (A.length / 2 + 57));
            g.add(screen);
        });

    } else if (A.carStyle === 'cyber') {
        // NEON CITY - Enhanced with more neon elements
        const neonMat1 = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.7 });
        const neonMat2 = new THREE.MeshBasicMaterial({ color: 0xff00ff, transparent: true, opacity: 0.7 });
        const neonMat3 = new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.6 });

        // Enhanced grid lines on floor
        for (let i = -8; i <= 8; i++) {
            const lineH = new THREE.Mesh(new THREE.BoxGeometry(A.width, 0.8, 1.5), neonMat1);
            lineH.position.set(0, 0.4, i * 50);
            g.add(lineH);
            const lineV = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.8, A.length), neonMat2);
            lineV.position.set(i * 30, 0.4, 0);
            g.add(lineV);
        }

        // Glowing pillars around arena
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const r = A.width / 2 + 60;
            const pillar = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 100, 8), i % 2 === 0 ? neonMat1 : neonMat2);
            pillar.position.set(Math.cos(angle) * r, 50, Math.sin(angle) * r * 1.4);
            g.add(pillar);
            // Light beams
            const beam = new THREE.Mesh(new THREE.CylinderGeometry(1, 8, 60, 8), neonMat3);
            beam.position.set(Math.cos(angle) * r, 130, Math.sin(angle) * r * 1.4);
            g.add(beam);
        }

        // Multiple floating rings
        [60, 90, 120].forEach((y, idx) => {
            const ring = new THREE.Mesh(new THREE.TorusGeometry(100 - idx * 15, 2 + idx, 8, 48), idx % 2 === 0 ? neonMat1 : neonMat2);
            ring.rotation.x = Math.PI / 2;
            ring.position.y = y;
            g.add(ring);
        });

        // Holographic cube structures
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => {
            const cube = new THREE.Mesh(new THREE.BoxGeometry(25, 25, 25), neonMat3);
            cube.position.set(x * (A.width / 2 + 80), 40, z * (A.length / 2 + 40));
            cube.rotation.set(Math.PI / 6, Math.PI / 4, 0);
            g.add(cube);
        });

    } else if (A.carStyle === 'sled') {
        // ICE WORLD - Enhanced with aurora, ice palace, and snow
        const iceMat = new THREE.MeshBasicMaterial({ color: 0xcceeFF, transparent: true, opacity: 0.5 });
        const crystalMat = new THREE.MeshBasicMaterial({ color: 0x88ddff, transparent: true, opacity: 0.7 });
        const auroraMat1 = new THREE.MeshBasicMaterial({ color: 0x44ffaa, transparent: true, opacity: 0.4 });
        const auroraMat2 = new THREE.MeshBasicMaterial({ color: 0xaa88ff, transparent: true, opacity: 0.4 });
        const auroraMat3 = new THREE.MeshBasicMaterial({ color: 0xff88aa, transparent: true, opacity: 0.4 });
        const snowMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const palaceMat = new THREE.MeshBasicMaterial({ color: 0x99ccdd, transparent: true, opacity: 0.6 });

        // Ice floor cracks/patterns
        for (let i = 0; i < 15; i++) {
            const crack = new THREE.Mesh(new THREE.PlaneGeometry(3, A.length * (0.3 + Math.random() * 0.5)), iceMat);
            crack.rotation.x = -Math.PI / 2;
            crack.rotation.z = (Math.random() - 0.5) * 0.5;
            crack.position.set((Math.random() - 0.5) * A.width * 0.8, 0.1, (Math.random() - 0.5) * A.length * 0.6);
            g.add(crack);
        }

        // Large ice crystal formations
        for (let i = 0; i < 30; i++) {
            const angle = (i / 30) * Math.PI * 2;
            const r = A.width / 2 + 40 + Math.random() * 50;
            const height = 25 + Math.random() * 50;
            const crystal = new THREE.Mesh(new THREE.ConeGeometry(5 + Math.random() * 5, height, 6), crystalMat);
            crystal.position.set(Math.cos(angle) * r, height / 2, Math.sin(angle) * r * 1.3);
            g.add(crystal);
            // Secondary smaller crystals
            if (Math.random() > 0.5) {
                const small = new THREE.Mesh(new THREE.ConeGeometry(3, height * 0.6, 6), crystalMat);
                small.position.set(Math.cos(angle) * r + 8, height * 0.3, Math.sin(angle) * r * 1.3 + 5);
                small.rotation.z = 0.3;
                g.add(small);
            }
        }

        // Aurora borealis pillars (multiple colors)
        const auroraMats = [auroraMat1, auroraMat2, auroraMat3];
        for (let i = 0; i < 12; i++) {
            const mat = auroraMats[i % 3];
            const pillar = new THREE.Mesh(new THREE.CylinderGeometry(10, 15, 150, 8), mat);
            pillar.position.set((i - 5.5) * 50, 75, A.length / 2 + 100);
            g.add(pillar);
            // Mirrored on other side
            const pillar2 = new THREE.Mesh(new THREE.CylinderGeometry(10, 15, 150, 8), mat);
            pillar2.position.set((i - 5.5) * 50, 75, -(A.length / 2 + 100));
            g.add(pillar2);
        }

        // Ice palace structures on sides
        [-1, 1].forEach(side => {
            // Main palace wall
            const wall = new THREE.Mesh(new THREE.BoxGeometry(30, 80, A.length * 0.8), palaceMat);
            wall.position.set(side * (A.width / 2 + 60), 40, 0);
            g.add(wall);
            // Towers
            for (let t = -2; t <= 2; t++) {
                const tower = new THREE.Mesh(new THREE.CylinderGeometry(12, 15, 100, 8), palaceMat);
                tower.position.set(side * (A.width / 2 + 60), 50, t * 120);
                g.add(tower);
                // Spire
                const spire = new THREE.Mesh(new THREE.ConeGeometry(10, 40, 8), crystalMat);
                spire.position.set(side * (A.width / 2 + 60), 120, t * 120);
                g.add(spire);
            }
        });

        // Floating snowflakes
        for (let i = 0; i < 60; i++) {
            const flake = new THREE.Mesh(new THREE.OctahedronGeometry(1.5 + Math.random() * 2), snowMat);
            flake.position.set(
                (Math.random() - 0.5) * A.width * 1.8,
                15 + Math.random() * 100,
                (Math.random() - 0.5) * A.length * 1.4
            );
            g.add(flake);
        }

        // Frozen waterfall structures
        [-1, 1].forEach(side => {
            const waterfall = new THREE.Mesh(new THREE.BoxGeometry(40, 60, 8), crystalMat);
            waterfall.position.set(side * (A.width / 2 + 40), 30, 0);
            g.add(waterfall);
            // Icicles
            for (let j = 0; j < 8; j++) {
                const icicle = new THREE.Mesh(new THREE.ConeGeometry(2, 15 + Math.random() * 10, 6), iceMat);
                icicle.rotation.x = Math.PI;
                icicle.position.set(side * (A.width / 2 + 35 + j * 5), 5, 0);
                g.add(icicle);
            }
        });

    } else if (A.carStyle === 'volcanic') {
        // VOLCANIC FURY - Lava, volcanoes, fire, and destruction
        const lavaMat = new THREE.MeshBasicMaterial({ color: 0xff4400, transparent: true, opacity: 0.8 });
        const magmaMat = new THREE.MeshBasicMaterial({ color: 0xff6600 });
        const rockMat = new THREE.MeshBasicMaterial({ color: 0x2a1a15 });
        const darkRockMat = new THREE.MeshBasicMaterial({ color: 0x1a0a08 });
        const emberMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
        const smokeMat = new THREE.MeshBasicMaterial({ color: 0x333333, transparent: true, opacity: 0.4 });
        const glowMat = new THREE.MeshBasicMaterial({ color: 0xff3300, transparent: true, opacity: 0.6 });

        // Lava cracks on floor
        for (let i = 0; i < 20; i++) {
            const crack = new THREE.Mesh(new THREE.PlaneGeometry(4, A.length * (0.2 + Math.random() * 0.4)), lavaMat);
            crack.rotation.x = -Math.PI / 2;
            crack.rotation.z = (Math.random() - 0.5) * 0.8;
            crack.position.set((Math.random() - 0.5) * A.width * 0.9, 0.15, (Math.random() - 0.5) * A.length * 0.7);
            g.add(crack);
        }

        // Lava rivers around edges
        [-1, 1].forEach(side => {
            const river = new THREE.Mesh(new THREE.PlaneGeometry(30, A.length * 0.9), lavaMat);
            river.rotation.x = -Math.PI / 2;
            river.position.set(side * (A.width / 2 + 25), 0.2, 0);
            g.add(river);
        });

        // Massive volcano structures
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z], idx) => {
            // Volcano cone
            const volcano = new THREE.Mesh(new THREE.ConeGeometry(80, 140, 12), rockMat);
            volcano.position.set(x * (A.width / 2 + 120), 70, z * (A.length / 2 + 100));
            g.add(volcano);
            // Crater rim
            const rim = new THREE.Mesh(new THREE.TorusGeometry(25, 8, 8, 16), darkRockMat);
            rim.rotation.x = Math.PI / 2;
            rim.position.set(x * (A.width / 2 + 120), 135, z * (A.length / 2 + 100));
            g.add(rim);
            // Lava glow inside
            const glow = new THREE.Mesh(new THREE.CylinderGeometry(20, 25, 30, 12), glowMat);
            glow.position.set(x * (A.width / 2 + 120), 125, z * (A.length / 2 + 100));
            g.add(glow);
            // Eruption particles
            for (let e = 0; e < 8; e++) {
                const ember = new THREE.Mesh(new THREE.SphereGeometry(3 + Math.random() * 3, 8, 8), emberMat);
                ember.position.set(
                    x * (A.width / 2 + 120) + (Math.random() - 0.5) * 40,
                    140 + Math.random() * 60,
                    z * (A.length / 2 + 100) + (Math.random() - 0.5) * 40
                );
                g.add(ember);
            }
        });

        // Rock pillars with magma veins
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const r = A.width / 2 + 50;
            const height = 40 + Math.random() * 40;
            const pillar = new THREE.Mesh(new THREE.CylinderGeometry(6, 10, height, 8), rockMat);
            pillar.position.set(Math.cos(angle) * r, height / 2, Math.sin(angle) * r * 1.4);
            g.add(pillar);
            // Magma veins
            const vein = new THREE.Mesh(new THREE.CylinderGeometry(2, 3, height * 0.8, 6), magmaMat);
            vein.position.set(Math.cos(angle) * r + 4, height / 2, Math.sin(angle) * r * 1.4);
            g.add(vein);
        }

        // Smoke clouds
        for (let i = 0; i < 30; i++) {
            const smoke = new THREE.Mesh(new THREE.SphereGeometry(15 + Math.random() * 20, 8, 8), smokeMat);
            smoke.position.set(
                (Math.random() - 0.5) * A.width * 2,
                80 + Math.random() * 80,
                (Math.random() - 0.5) * A.length * 1.5
            );
            g.add(smoke);
        }

        // Floating embers/sparks
        for (let i = 0; i < 50; i++) {
            const spark = new THREE.Mesh(new THREE.SphereGeometry(0.8 + Math.random() * 1.5, 6, 6), emberMat);
            spark.position.set(
                (Math.random() - 0.5) * A.width * 1.5,
                10 + Math.random() * 100,
                (Math.random() - 0.5) * A.length * 1.3
            );
            g.add(spark);
        }

    } else if (A.carStyle === 'candycane') {
        // CANDY CANE LAND - Festive sweets paradise
        const redMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const pinkMat = new THREE.MeshBasicMaterial({ color: 0xff88aa });
        const mintMat = new THREE.MeshBasicMaterial({ color: 0x88ffaa });
        const goldMat = new THREE.MeshBasicMaterial({ color: 0xffdd44 });

        // Red and white striped floor
        for (let i = -8; i <= 8; i++) {
            const stripe = new THREE.Mesh(
                new THREE.PlaneGeometry(A.width, A.length * 0.05),
                i % 2 === 0 ? redMat : whiteMat
            );
            stripe.rotation.x = -Math.PI / 2;
            stripe.position.set(0, 0.05, i * A.length * 0.05);
            g.add(stripe);
        }

        // Giant candy cane pillars around arena
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const r = A.width / 2 + 60;
            // Candy cane post
            for (let j = 0; j < 12; j++) {
                const segment = new THREE.Mesh(
                    new THREE.CylinderGeometry(6, 6, 12, 12),
                    j % 2 === 0 ? redMat : whiteMat
                );
                segment.position.set(Math.cos(angle) * r, j * 12 + 6, Math.sin(angle) * r * 1.4);
                g.add(segment);
            }
            // Curved top
            const hook = new THREE.Mesh(
                new THREE.TorusGeometry(15, 5, 8, 12, Math.PI),
                i % 2 === 0 ? redMat : whiteMat
            );
            hook.rotation.y = angle + Math.PI / 2;
            hook.position.set(Math.cos(angle) * (r - 15), 140, Math.sin(angle) * (r - 15) * 1.4);
            g.add(hook);
        }

        // Giant lollipops
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z], idx) => {
            // Stick
            const stick = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 100, 8), whiteMat);
            stick.position.set(x * (A.width / 2 + 100), 50, z * (A.length / 2 + 80));
            g.add(stick);
            // Candy top - spiral swirl
            const candyMats = [redMat, pinkMat, mintMat, goldMat];
            const candy = new THREE.Mesh(
                new THREE.SphereGeometry(35, 24, 24),
                candyMats[idx]
            );
            candy.position.set(x * (A.width / 2 + 100), 115, z * (A.length / 2 + 80));
            g.add(candy);
            // Swirl pattern
            const swirl = new THREE.Mesh(
                new THREE.TorusGeometry(25, 3, 8, 32, Math.PI * 3),
                whiteMat
            );
            swirl.position.copy(candy.position);
            swirl.rotation.set(Math.random(), Math.random(), Math.random());
            g.add(swirl);
        });

        // Gumdrops scattered around
        const gumdropColors = [0xff0000, 0x00ff00, 0xffff00, 0xff00ff, 0x00ffff, 0xff8800];
        for (let i = 0; i < 30; i++) {
            const col = gumdropColors[i % gumdropColors.length];
            const mat = new THREE.MeshBasicMaterial({ color: col });
            const gumdrop = new THREE.Mesh(new THREE.SphereGeometry(8 + Math.random() * 8, 12, 8), mat);
            gumdrop.scale.y = 0.7;
            gumdrop.position.set(
                (Math.random() - 0.5) * A.width * 1.6,
                6,
                (Math.random() - 0.5) * A.length * 1.3
            );
            g.add(gumdrop);
        }

        // Peppermint platforms
        for (let i = 0; i < 8; i++) {
            const peppermint = new THREE.Mesh(new THREE.CylinderGeometry(25, 25, 5, 24), whiteMat);
            peppermint.position.set(
                (Math.random() - 0.5) * A.width * 1.5,
                40 + Math.random() * 60,
                (Math.random() - 0.5) * A.length * 1.2
            );
            g.add(peppermint);
            // Red swirl
            const swirlRed = new THREE.Mesh(new THREE.TorusGeometry(18, 3, 4, 16, Math.PI * 2), redMat);
            swirlRed.rotation.x = Math.PI / 2;
            swirlRed.position.copy(peppermint.position);
            swirlRed.position.y += 3;
            g.add(swirlRed);
        }

        // Snowflake sparkles (winter candy theme)
        for (let i = 0; i < 60; i++) {
            const sparkle = new THREE.Mesh(new THREE.OctahedronGeometry(2 + Math.random() * 2), whiteMat);
            sparkle.position.set(
                (Math.random() - 0.5) * A.width * 2,
                20 + Math.random() * 100,
                (Math.random() - 0.5) * A.length * 1.6
            );
            g.add(sparkle);
        }

        // Ribbon arches
        [-1, 1].forEach(side => {
            for (let r = 0; r < 3; r++) {
                const ribbon = new THREE.Mesh(
                    new THREE.TorusGeometry(100 - r * 20, 4, 8, 32, Math.PI),
                    r % 2 === 0 ? redMat : whiteMat
                );
                ribbon.rotation.z = Math.PI / 2;
                ribbon.rotation.y = Math.PI / 2;
                ribbon.position.set(0, 0, side * (A.length / 2 + 50));
                g.add(ribbon);
            }
        });
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
    } else if (A.carStyle === 'volcanic') {
        // Glowing magma accents
        const magmaGlow = new THREE.Mesh(
            new THREE.BoxGeometry(CONFIG.carWidth * 1.1, 0.15, CONFIG.carLength * 1.05),
            new THREE.MeshBasicMaterial({ color: 0xff4400, transparent: true, opacity: 0.5 })
        );
        magmaGlow.position.y = CONFIG.carHeight * 0.1;
        g.add(magmaGlow);
        // Flame exhaust
        const flame = new THREE.Mesh(
            new THREE.ConeGeometry(1.5, 4, 8),
            new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.7 })
        );
        flame.rotation.x = Math.PI / 2;
        flame.position.set(0, CONFIG.carHeight * 0.3, CONFIG.carLength * 0.6);
        g.add(flame);
    } else if (A.carStyle === 'candycane') {
        // Candy cane stripes
        const candyRed = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const candyWhite = new THREE.MeshBasicMaterial({ color: 0xffffff });
        for (let i = 0; i < 6; i++) {
            const stripe = new THREE.Mesh(
                new THREE.BoxGeometry(CONFIG.carWidth * 1.02, 0.2, CONFIG.carLength * 0.15),
                i % 2 === 0 ? candyRed : candyWhite
            );
            stripe.position.set(0, CONFIG.carHeight * 0.65, (i - 2.5) * CONFIG.carLength * 0.15);
            g.add(stripe);
        }
        // Peppermint wheel
        const mint = new THREE.Mesh(
            new THREE.CylinderGeometry(1, 1, 0.3, 16),
            new THREE.MeshBasicMaterial({ color: 0xff4444 })
        );
        mint.rotation.x = Math.PI / 2;
        mint.position.set(0, CONFIG.carHeight * 0.8, -CONFIG.carLength * 0.3);
        g.add(mint);
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
    g.isJumping = false;
    g.jumpTimer = 0;
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
    } else if (A.ballStyle === 'lava') {
        // Glowing magma ball
        const lavaGlow = new THREE.Mesh(
            new THREE.SphereGeometry(CONFIG.ballRadius * 1.2, 16, 16),
            new THREE.MeshBasicMaterial({ color: A.ballGlow, transparent: true, opacity: 0.3 })
        );
        g.add(lavaGlow);
        const cracks = new THREE.Mesh(
            new THREE.SphereGeometry(CONFIG.ballRadius * 1.02, 12, 12),
            new THREE.MeshBasicMaterial({ color: A.ballPattern, wireframe: true, transparent: true, opacity: 0.6 })
        );
        g.add(cracks);
    } else if (A.ballStyle === 'candy') {
        // Red and white candy swirl ball
        for (let i = 0; i < 6; i++) {
            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(CONFIG.ballRadius * 0.85, 0.5, 8, 16),
                new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xff0000 : 0xffffff })
            );
            ring.rotation.x = i * (Math.PI / 6);
            ring.rotation.z = i * (Math.PI / 4);
            g.add(ring);
        }
        const glow = new THREE.Mesh(
            new THREE.SphereGeometry(CONFIG.ballRadius * 1.1, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0xff8888, transparent: true, opacity: 0.2 })
        );
        g.add(glow);
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


let inputSetupDone = false;

function setupInput() {
    if (inputSetupDone) return;
    inputSetupDone = true;
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
        case 'Escape': if (pressed) returnToMenu(); break;
    }
}


let replayIntervalId = null;

function returnToMenu() {
    // Stop music
    musicPlaying = false;

    // Stop loop
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    // Stop replay
    if (replayIntervalId) {
        clearInterval(replayIntervalId);
        replayIntervalId = null;
    }

    // Reset game state
    gameStarted = false;
    isGameOver = false;
    isPaused = false;
    isReplaying = false;
    replayBuffer = [];
    blueScore = 0;
    orangeScore = 0;
    gameTime = CONFIG.gameDuration;
    // Clear scene
    while (scene && scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }
    if (renderer && renderer.domElement) {
        renderer.domElement.remove();
    }
    // Show menu
    document.getElementById('map-select').classList.remove('hidden');
    document.getElementById('controls').classList.add('hidden');
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('goal-notification').classList.add('hidden');
    document.getElementById('replay-indicator').classList.add('hidden');
}

function performJump(c) {
    if (c.isGrounded && c.canJump) {
        // Start jump with initial boost
        c.velocity.y = CONFIG.jumpForce * 2;
        c.isGrounded = false;
        c.canDoubleJump = true;
        c.canJump = false;
        c.isJumping = true; // Track that we're in initial jump
        if (c === car) playSound('jump');
    } else if (c.canDoubleJump && !c.isGrounded) {
        c.velocity.y = CONFIG.doubleJumpForce;
        c.canDoubleJump = false;
        c.isJumping = false;
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
        c.jumpTimer = 0; // Reset jump timer on landing
        c.rotation.x *= 0.9;
        c.rotation.z *= 0.9;
        if (!keys.jump || !isPlayer) c.canJump = true;
    } else {
        c.isGrounded = false;
    }

    if (!c.isGrounded) {
        c.velocity.y -= CONFIG.gravity;
        // Gradual jump boost with time limit
        if (c.isJumping && c.velocity.y < CONFIG.jumpMaxVelocity && c.jumpTimer < CONFIG.jumpBoostTime) {
            // For player: only boost while holding jump key
            // For bot: always boost until timer expires
            if (!isPlayer || keys.jump) {
                c.velocity.y += CONFIG.jumpForce;
                c.jumpTimer++;
            }
        }
        // Stop boosting jump when time expired, or player releases key
        if (c.jumpTimer >= CONFIG.jumpBoostTime || (isPlayer && !keys.jump)) {
            c.isJumping = false;
        }
    }

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

    if (isPaused || isReplaying) return;

    if (Math.abs(ball.position.x) < A.goalWidth / 2 && ball.position.y < A.goalHeight) {
        if (ball.position.z < -goalZ + A.goalDepth) scoreGoal('orange');
        else if (ball.position.z > goalZ - A.goalDepth) scoreGoal('blue');
    }
}

function scoreGoal(team) {
    if (isPaused) return;
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

    replayIntervalId = setInterval(() => {
        if (replayIndex >= replayBuffer.length) {
            clearInterval(replayIntervalId);
            replayIntervalId = null;

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


let animationId = null;

function gameLoop(ts) {
    animationId = requestAnimationFrame(gameLoop);
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
