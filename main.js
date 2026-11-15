/**
 * ============================================================================
 * VIRAL 3D MUSEUM OF MEMORIES & WISHES
 * A 3D interactive virtual gallery experience for Sister's Birthday
 * Powered by Three.js & GSAP
 * ============================================================================
 */

/* ============================================================================
   1. CUSTOMIZABLE CONFIGURATION & MEMORIES DATA
   👉 YOU CAN EASILY CUSTOMIZE HER NAME, PHOTOS, AND STORIES HERE!
   ============================================================================ */

const SISTER_CONFIG = {
    // 👑 Put your sister's name here:
    name: "Sister",
    
    // 🎂 Header subtitle
    subtitle: "A Timeless Journey Through Your Greatest Moments",

    // 📸 The Museum Exhibits featuring all 4 of your cherished photos!
    memories: [
        {
            title: "Little Steps, Pure Smiles",
            date: "Childhood Days",
            tag: "Childhood",
            desc: "Holding hands since day one. From that cute flower garland to innocent childhood giggles, this is where our eternal sibling journey began. The sweetest memory of us growing up together.",
            img: "images/memory1_childhood.jpg"
        },
        {
            title: "Growing Up Side-by-Side",
            date: "School & Youth",
            tag: "Growing Years",
            desc: "Standing proud and stylish together through all the awkward, funny, and beautiful growing up years. No matter how much we teased each other, we always stood as an unbreakable team.",
            img: "images/memory2_growing_up.jpg"
        },
        {
            title: "Bond That Lasts Forever",
            date: "Present Day",
            tag: "Always Together",
            desc: "Years have passed and life has changed, but having you as my sister is the greatest blessing. Always by your side, cheering for your dreams, and celebrating you today and every day!",
            img: "images/memory3_today_always.jpg"
        },
        {
            title: "Sweet Memories & Celebrations",
            date: "Celebration Moments",
            tag: "Sweetness",
            desc: "Sharing sweets, contagious smiles, and pure happiness together. You’ve always been the sweetest part of my life, celebrating every milestone together. Now let's celebrate YOU!",
            img: "images/memory4_celebration.jpg"
        }
    ],

    // Default starting wishes for the 3D Wish Wall
    defaultWishes: [
        { author: "Family", text: "Happy Birthday to the most amazing sister in the universe! May this year bring you endless happiness!", color: "#ffb703" },
        { author: "Your Best Brother", text: "Proud of you always! Keep shining brighter than the stars. Drinks and cake on me!", color: "#ff006e" },
        { author: "Friends Squad", text: "Happy Birthday queen! Never stop dancing, smiling, and being your fabulous self!", color: "#3a86ff" }
    ]
};

/* ============================================================================
   2. THREE.JS 3D WORLD ENGINE & SCENE SETUP
   ============================================================================ */

let scene, camera, renderer;
let exhibits = [];
let lanterns = [];
let currentExhibitIndex = -1; // -1 means at entrance
let isTransitioning = false;
let autoTourActive = false;
let autoTourTimer = null;

// Birthday Cake & Interactive Candle State
let cakeGroup = null;
let candleFlames = [];
let candleLights = [];
let candlesBlownOut = false;

// Mouse Interaction & Parallax
const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// World Spatial Coordinates
const HALL_WIDTH = 22;
const EXHIBIT_SPACING = 18;
const FRAME_Y = 5.2;
const FRAME_WIDTH = 6.4;
const FRAME_HEIGHT = 4.8;

function init3D() {
    const container = document.getElementById('webgl-container');

    // 1. Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0c16);
    scene.fog = new THREE.FogExp2(0x0a0c16, 0.015);

    // 2. Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 16);

    // 3. Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 4. Lights
    setupLighting();

    // 5. Build Museum Architecture & Exhibits
    buildMuseumArchitecture();
    buildExhibits();
    buildFloatingStardust();
    buildWishSanctuary();

    // 6. Event Listeners
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onCanvasClick);

    // Start render loop
    animate();
}

/* ============================================================================
   3. LIGHTING SYSTEM (Atmospheric Art Gallery Lighting)
   ============================================================================ */

function setupLighting() {
    // Ambient light with soft blue-night tone
    const ambientLight = new THREE.AmbientLight(0x1a1e36, 1.2);
    scene.add(ambientLight);

    // Warm golden directional wash
    const dirLight = new THREE.DirectionalLight(0xfff1cf, 0.8);
    dirLight.position.set(0, 30, 20);
    scene.add(dirLight);

    // Grand Entrance Spotlight
    const entranceSpot = new THREE.SpotLight(0xf5c542, 3.5, 40, Math.PI / 4, 0.4);
    entranceSpot.position.set(0, 18, 18);
    entranceSpot.target.position.set(0, 3, 5);
    scene.add(entranceSpot);
    scene.add(entranceSpot.target);
}

/* ============================================================================
   4. ARCHITECTURE: LUXURY MARBLE HALL & ORNATE PILLARS
   ============================================================================ */

function buildMuseumArchitecture() {
    const totalExhibits = SISTER_CONFIG.memories.length;
    const hallLength = (totalExhibits + 3) * EXHIBIT_SPACING;

    // --- Floor: Glossy Dark Marble with subtle reflections ---
    const floorGeo = new THREE.PlaneGeometry(HALL_WIDTH + 10, hallLength + 60, 64, 64);
    
    // Procedural marble-like canvas texture for high-end look
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 512;
    floorCanvas.height = 512;
    const fctx = floorCanvas.getContext('2d');
    fctx.fillStyle = '#0f111a';
    fctx.fillRect(0, 0, 512, 512);
    // Subtle luxury tile grid
    fctx.strokeStyle = 'rgba(245, 197, 66, 0.12)';
    fctx.lineWidth = 2;
    for (let i = 0; i < 512; i += 64) {
        fctx.beginPath();
        fctx.moveTo(i, 0); fctx.lineTo(i, 512);
        fctx.moveTo(0, i); fctx.lineTo(512, i);
        fctx.stroke();
    }
    const floorTexture = new THREE.CanvasTexture(floorCanvas);
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(10, hallLength / 10);

    const floorMat = new THREE.MeshStandardMaterial({
        map: floorTexture,
        roughness: 0.18,
        metalness: 0.5,
        color: 0x121422
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, -hallLength / 2 + 15);
    floor.receiveShadow = true;
    scene.add(floor);

    // --- Ceiling: Grand Museum Vault ---
    const ceilingMat = new THREE.MeshStandardMaterial({
        color: 0x07080f,
        roughness: 0.8
    });
    const ceiling = new THREE.Mesh(floorGeo, ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, 14, -hallLength / 2 + 15);
    scene.add(ceiling);

    // --- Walls (Left & Right Corridor) ---
    const wallGeo = new THREE.PlaneGeometry(hallLength + 60, 16);
    const wallMat = new THREE.MeshStandardMaterial({
        color: 0x0f1120,
        roughness: 0.6,
        metalness: 0.2
    });

    // Left Wall
    const leftWall = new THREE.Mesh(wallGeo, wallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-HALL_WIDTH / 2, 7, -hallLength / 2 + 15);
    scene.add(leftWall);

    // Right Wall
    const rightWall = new THREE.Mesh(wallGeo, wallMat);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(HALL_WIDTH / 2, 7, -hallLength / 2 + 15);
    scene.add(rightWall);

    // --- Golden Floor Edge Trim Lines ---
    const trimGeo = new THREE.BoxGeometry(0.3, 0.4, hallLength + 60);
    const goldTrimMat = new THREE.MeshStandardMaterial({
        color: 0xf5c542,
        roughness: 0.3,
        metalness: 0.8,
        emissive: 0x735712,
        emissiveIntensity: 0.3
    });

    const leftTrim = new THREE.Mesh(trimGeo, goldTrimMat);
    leftTrim.position.set(-HALL_WIDTH / 2 + 0.2, 0.2, -hallLength / 2 + 15);
    scene.add(leftTrim);

    const rightTrim = new THREE.Mesh(trimGeo, goldTrimMat);
    rightTrim.position.set(HALL_WIDTH / 2 - 0.2, 0.2, -hallLength / 2 + 15);
    scene.add(rightTrim);

    // --- Architectural Pillars along the hall ---
    const pillarGeo = new THREE.CylinderGeometry(0.5, 0.6, 14, 16);
    const pillarMat = new THREE.MeshStandardMaterial({
        color: 0x181c2d,
        roughness: 0.4,
        metalness: 0.3
    });

    for (let z = 10; z >= -hallLength; z -= EXHIBIT_SPACING) {
        // Left pillar
        const pLeft = new THREE.Mesh(pillarGeo, pillarMat);
        pLeft.position.set(-HALL_WIDTH / 2 + 0.8, 7, z);
        scene.add(pLeft);

        // Right pillar
        const pRight = new THREE.Mesh(pillarGeo, pillarMat);
        pRight.position.set(HALL_WIDTH / 2 - 0.8, 7, z);
        scene.add(pRight);
    }
}

/* ============================================================================
   5. 3D EXHIBIT FRAMES & DYNAMIC PHOTO TEXTURES
   ============================================================================ */

function buildExhibits() {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');

    // Pre-calculated aspect ratios so frames are immediately shaped to each photo:
    // Photo 1: 664x1024 (portrait ~0.65)
    // Photo 2: 551x1024 (portrait ~0.54)
    // Photo 3: 1024x763 (landscape ~1.34)
    // Photo 4: 1024x576 (widescreen landscape ~1.78)
    const aspectRatios = [
        664 / 1024,
        551 / 1024,
        1024 / 763,
        1024 / 576
    ];

    SISTER_CONFIG.memories.forEach((mem, index) => {
        // Alternate exhibits left and right along the corridor
        const isLeft = index % 2 === 0;
        const xPos = isLeft ? -HALL_WIDTH / 2 + 1.2 : HALL_WIDTH / 2 - 1.2;
        const zPos = -index * EXHIBIT_SPACING;
        const rotY = isLeft ? Math.PI / 2 : -Math.PI / 2;

        const exhibitGroup = new THREE.Group();
        exhibitGroup.position.set(xPos, FRAME_Y, zPos);
        exhibitGroup.rotation.y = rotY;

        // Calculate initial frame dimensions
        const aspect = aspectRatios[index] || 1.33;
        let initialW, initialH;
        if (aspect >= 1) {
            initialW = 6.4;
            initialH = 6.4 / aspect;
        } else {
            initialH = 5.6;
            initialW = initialH * aspect;
        }

        // --- Ornate Golden Outer Frame ---
        const frameMat = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            roughness: 0.25,
            metalness: 0.85,
            emissive: 0x3d300b,
            emissiveIntensity: 0.2
        });
        const frameMesh = new THREE.Mesh(
            new THREE.BoxGeometry(initialW + 0.6, initialH + 0.6, 0.35),
            frameMat
        );
        frameMesh.castShadow = true;
        exhibitGroup.add(frameMesh);

        // --- Inner Photo Mesh & Material ---
        const photoMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide
        });

        const photoMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(initialW, initialH),
            photoMat
        );
        photoMesh.position.z = 0.2;
        exhibitGroup.add(photoMesh);

        // --- Golden Museum Plaque under frame ---
        const plaqueCanvas = document.createElement('canvas');
        plaqueCanvas.width = 512;
        plaqueCanvas.height = 128;
        const pctx = plaqueCanvas.getContext('2d');
        pctx.fillStyle = '#1c1b17';
        pctx.fillRect(0, 0, 512, 128);
        pctx.strokeStyle = '#d4af37';
        pctx.lineWidth = 6;
        pctx.strokeRect(6, 6, 500, 116);
        pctx.fillStyle = '#f5c542';
        pctx.font = 'bold 28px "Cinzel", Georgia';
        pctx.textAlign = 'center';
        pctx.fillText(`EXHIBIT #${index + 1}: ${mem.title.toUpperCase()}`, 256, 55);
        pctx.font = '20px sans-serif';
        pctx.fillStyle = '#e2e8f0';
        pctx.fillText(mem.date, 256, 95);

        const plaqueMat = new THREE.MeshStandardMaterial({
            map: new THREE.CanvasTexture(plaqueCanvas),
            roughness: 0.3,
            metalness: 0.7
        });
        const plaqueMesh = new THREE.Mesh(
            new THREE.BoxGeometry(3.6, 0.9, 0.1),
            plaqueMat
        );
        plaqueMesh.position.set(0, -initialH / 2 - 0.7, 0.15);
        exhibitGroup.add(plaqueMesh);

        // --- Load Photo Texture (Applies immediately) ---
        loader.load(
            mem.img,
            (loadedTex) => {
                loadedTex.generateMipmaps = true;
                loadedTex.minFilter = THREE.LinearMipmapLinearFilter;
                photoMat.map = loadedTex;
                photoMat.needsUpdate = true;

                // Adjust geometry dynamically if natural dimensions differ
                const imgObj = loadedTex.image;
                if (imgObj && imgObj.naturalWidth && imgObj.naturalHeight) {
                    const natAspect = imgObj.naturalWidth / imgObj.naturalHeight;
                    let targetW, targetH;
                    if (natAspect >= 1) {
                        targetW = 6.4;
                        targetH = 6.4 / natAspect;
                    } else {
                        targetH = 5.6;
                        targetW = targetH * natAspect;
                    }

                    photoMesh.geometry.dispose();
                    photoMesh.geometry = new THREE.PlaneGeometry(targetW, targetH);

                    frameMesh.geometry.dispose();
                    frameMesh.geometry = new THREE.BoxGeometry(targetW + 0.6, targetH + 0.6, 0.35);

                    plaqueMesh.position.y = -targetH / 2 - 0.7;
                }
            },
            undefined,
            (err) => {
                console.error('Error loading exhibit image:', mem.img, err);
            }
        );

        // --- Dedicated Overhead Gallery Spotlight ---
        const spot = new THREE.SpotLight(0xfffaed, 2.8, 22, Math.PI / 4, 0.5);
        spot.position.set(isLeft ? -4 : 4, 12, zPos);
        spot.target = photoMesh;
        scene.add(spot);
        scene.add(spot.target);

        // Subtle glow point light right in front of frame
        const pointGlow = new THREE.PointLight(0xf5c542, 0.8, 8);
        pointGlow.position.set(0, 0, 1.5);
        exhibitGroup.add(pointGlow);

        scene.add(exhibitGroup);

        // Store reference for raycasting & camera travel
        photoMesh.userData = { exhibitIndex: index };
        frameMesh.userData = { exhibitIndex: index };

        // Camera viewpoint when viewing this specific exhibit
        const camViewX = isLeft ? -HALL_WIDTH / 2 + 7.5 : HALL_WIDTH / 2 - 7.5;
        const camViewZ = zPos;

        exhibits.push({
            group: exhibitGroup,
            photoMesh: photoMesh,
            index: index,
            camPosition: new THREE.Vector3(camViewX, FRAME_Y, camViewZ),
            lookAtPosition: new THREE.Vector3(xPos, FRAME_Y, zPos),
            data: mem
        });
    });
}

/* ============================================================================
   6. 3D FLOATING STARDUST & FAIRY LIGHTS
   ============================================================================ */

let stardustParticles;

function buildFloatingStardust() {
    const particleCount = 600;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const totalZ = (SISTER_CONFIG.memories.length + 4) * EXHIBIT_SPACING;

    for (let i = 0; i < particleCount; i++) {
        // Spatial spread throughout the grand museum hall
        positions[i * 3] = (Math.random() - 0.5) * HALL_WIDTH * 1.2;
        positions[i * 3 + 1] = Math.random() * 12 + 0.5;
        positions[i * 3 + 2] = 20 - Math.random() * (totalZ + 40);

        // Golden & Rose color tones
        const isGold = Math.random() > 0.4;
        colors[i * 3] = isGold ? 0.98 : 1.0;
        colors[i * 3 + 1] = isGold ? 0.82 : 0.4;
        colors[i * 3 + 2] = isGold ? 0.35 : 0.8;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle sprite
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pctx = pCanvas.getContext('2d');
    const grad = pctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(255, 230, 120, 0.8)');
    grad.addColorStop(1, 'rgba(255, 200, 50, 0)');
    pctx.fillStyle = grad;
    pctx.fillRect(0, 0, 32, 32);

    const pTexture = new THREE.CanvasTexture(pCanvas);

    const pMaterial = new THREE.PointsMaterial({
        size: 0.45,
        map: pTexture,
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    stardustParticles = new THREE.Points(geometry, pMaterial);
    scene.add(stardustParticles);
}

/* ============================================================================
   7. 3D CELESTIAL WISH SANCTUARY & FLOATING LANTERNS
   ============================================================================ */

let sanctuaryZ = 0;

function buildWishSanctuary() {
    const totalExhibits = SISTER_CONFIG.memories.length;
    sanctuaryZ = -totalExhibits * EXHIBIT_SPACING - 15;

    // Glowing Birthday Monument / Altar at the end of the hall
    const altarGroup = new THREE.Group();
    altarGroup.position.set(0, 0, sanctuaryZ);

    // Glowing base pedestal
    const pedestalGeo = new THREE.CylinderGeometry(4.5, 5.2, 1.2, 32);
    const pedestalMat = new THREE.MeshStandardMaterial({
        color: 0x181a28,
        roughness: 0.3,
        metalness: 0.8,
        emissive: 0x735712,
        emissiveIntensity: 0.3
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = 0.6;
    altarGroup.add(pedestal);

    // 3D Glowing Birthday Crown / Halo in the sky
    const ringGeo = new THREE.TorusGeometry(3.2, 0.2, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({
        color: 0xf5c542,
        emissive: 0xf5c542,
        emissiveIntensity: 0.8,
        metalness: 0.9,
        roughness: 0.1
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 7.8;
    ring.rotation.x = Math.PI / 2;
    altarGroup.add(ring);

    // Light beam shooting up
    const beamSpot = new THREE.SpotLight(0xffb703, 5.0, 50, Math.PI / 6, 0.3);
    beamSpot.position.set(0, 0.5, 0);
    beamSpot.target.position.set(0, 30, 0);
    altarGroup.add(beamSpot);
    altarGroup.add(beamSpot.target);

    scene.add(altarGroup);

    // Build the 3D Birthday Cake directly on top of the circle altar
    buildBirthdayCake(sanctuaryZ);

    // Load initial wishes from localStorage or defaults
    loadStoredWishes();
}

/**
 * Builds the 3D Royal Birthday Cake with 2 frosted tiers, cherries & candles
 */
function buildBirthdayCake(zPos) {
    cakeGroup = new THREE.Group();
    // Sitting directly on top of the circular altar pedestal (y = 1.22)
    cakeGroup.position.set(0, 1.22, zPos);

    // 1. Golden Pedestal Plate
    const standMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.85,
        roughness: 0.25,
        emissive: 0x4a3c10,
        emissiveIntensity: 0.2
    });
    const standPlate = new THREE.Mesh(new THREE.CylinderGeometry(2.9, 3.1, 0.25, 32), standMat);
    standPlate.position.y = 0.12;
    standPlate.castShadow = true;
    cakeGroup.add(standPlate);

    // 2. Bottom Tier (Soft Strawberry Cream)
    const tier1Mat = new THREE.MeshStandardMaterial({
        color: 0xffd1dc,
        roughness: 0.35,
        metalness: 0.1
    });
    const tier1 = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 1.4, 32), tier1Mat);
    tier1.position.y = 0.95;
    tier1.castShadow = true;
    cakeGroup.add(tier1);

    // White pearl icing around bottom tier
    const pearlMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    for (let i = 0; i < 22; i++) {
        const angle = (i / 22) * Math.PI * 2;
        const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), pearlMat);
        pearl.position.set(Math.cos(angle) * 2.32, 0.35, Math.sin(angle) * 2.32);
        cakeGroup.add(pearl);
    }

    // 3. Top Tier (Velvet Rosy Glaze)
    const tier2Mat = new THREE.MeshStandardMaterial({
        color: 0xff4d6d,
        roughness: 0.3,
        metalness: 0.15
    });
    const tier2 = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 1.15, 32), tier2Mat);
    tier2.position.y = 2.22;
    tier2.castShadow = true;
    cakeGroup.add(tier2);

    // Top tier decorative cherries
    const cherryMat = new THREE.MeshStandardMaterial({
        color: 0xc1121f,
        roughness: 0.15,
        metalness: 0.3
    });
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const cherry = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 12), cherryMat);
        cherry.position.set(Math.cos(angle) * 1.35, 2.85, Math.sin(angle) * 1.35);
        cakeGroup.add(cherry);
    }

    // 4. Five Birthday Candles with warm golden flames
    candleFlames = [];
    candleLights = [];
    const candleCount = 5;
    const candleRadius = 0.85;

    const candleStickMat = new THREE.MeshStandardMaterial({
        color: 0xf5c542,
        roughness: 0.3,
        metalness: 0.6
    });

    const flameMat = new THREE.MeshBasicMaterial({
        color: 0xffdd55
    });

    for (let i = 0; i < candleCount; i++) {
        const angle = (i / candleCount) * Math.PI * 2;
        const cx = Math.cos(angle) * candleRadius;
        const cz = Math.sin(angle) * candleRadius;

        // Stick
        const candleStick = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.8, 12), candleStickMat);
        candleStick.position.set(cx, 3.2, cz);
        cakeGroup.add(candleStick);

        // Wick
        const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.14, 6), new THREE.MeshBasicMaterial({ color: 0x111111 }));
        wick.position.set(cx, 3.67, cz);
        cakeGroup.add(wick);

        // Flame mesh
        const flameMesh = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.32, 12), flameMat);
        flameMesh.position.set(cx, 3.88, cz);
        flameMesh.userData = { baseY: 3.88 };
        cakeGroup.add(flameMesh);
        candleFlames.push(flameMesh);

        // Warm candlelight
        const candleLight = new THREE.PointLight(0xffa200, 2.0, 7);
        candleLight.position.set(cx, 4.0, cz);
        cakeGroup.add(candleLight);
        candleLights.push(candleLight);
    }

    scene.add(cakeGroup);
}

/**
 * Elevates the 3D Birthday Cake onto the circle pedestal when visiting the sanctuary
 */
function riseBirthdayCake() {
    if (!cakeGroup) return;

    // Reset candles if needed
    relightCandles();

    // Immediately show prompt to blow candles
    const promptCard = document.getElementById('cake-prompt-card');
    if (promptCard) promptCard.classList.add('visible');

    // Celebratory bounce and rotation
    gsap.fromTo(cakeGroup.position, 
        { y: 0.7 }, 
        { y: 1.22, duration: 1.2, ease: "back.out(1.5)" }
    );
    gsap.to(cakeGroup.rotation, {
        y: cakeGroup.rotation.y + Math.PI * 2,
        duration: 2.0,
        ease: "power2.out"
    });
}

/**
 * Interactive Candle Blowing & Grand Birthday Celebration
 */
function blowOutCandles() {
    candlesBlownOut = true;

    // 1. Play realistic blow sound
    playBlowSound();

    // 2. Hide prompt card
    const promptCard = document.getElementById('cake-prompt-card');
    if (promptCard) promptCard.classList.remove('visible');

    // 3. Extinguish candle flames with animation
    candleFlames.forEach((flame) => {
        gsap.to(flame.scale, {
            x: 0,
            y: 0,
            z: 0,
            duration: 0.35,
            ease: "power2.in"
        });
    });

    candleLights.forEach((light) => {
        gsap.to(light, {
            intensity: 0,
            duration: 0.4
        });
    });

    // 4. Trigger Grand Celebration Surprise & Warm Birthday Wish!
    setTimeout(() => {
        // Multi-stage confetti fireworks
        fireBirthdayConfetti();
        playCelebrationSound();

        setTimeout(() => fireBirthdayConfetti(), 350);
        setTimeout(() => fireBirthdayConfetti(), 700);

        // Display the Warm Birthday Letter Modal
        const letterModal = document.getElementById('celebration-letter-modal');
        if (letterModal) letterModal.classList.add('visible');
    }, 450);
}

function relightCandles() {
    candlesBlownOut = false;
    candleFlames.forEach((flame) => {
        flame.scale.set(1, 1, 1);
    });
    candleLights.forEach((light) => {
        light.intensity = 1.8;
    });
}

/**
 * Creates an interactive 3D glowing sky lantern floating in the museum sanctuary
 */
function create3DLantern(wish, initialY = null) {
    const lanternGroup = new THREE.Group();

    // Lantern cylinder / bell body
    const bodyGeo = new THREE.CylinderGeometry(0.55, 0.75, 1.2, 16);
    const hexColor = parseInt(wish.color.replace('#', '0x')) || 0xffb703;

    const bodyMat = new THREE.MeshStandardMaterial({
        color: hexColor,
        emissive: hexColor,
        emissiveIntensity: 0.85,
        roughness: 0.3,
        transparent: true,
        opacity: 0.92
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    lanternGroup.add(bodyMesh);

    // Inner warm flame light
    const flameLight = new THREE.PointLight(hexColor, 1.6, 6);
    flameLight.position.set(0, 0, 0);
    lanternGroup.add(flameLight);

    // Placement within the Wish Sanctuary area
    const isNew = initialY !== null;
    const posX = isNew ? (Math.random() - 0.5) * 4 : (Math.random() - 0.5) * 14;
    const startY = isNew ? initialY : Math.random() * 6 + 6;
    const posZ = isNew ? sanctuaryZ + (Math.random() - 0.5) * 4 : sanctuaryZ + (Math.random() - 0.5) * 16;

    lanternGroup.position.set(posX, startY, posZ);

    // Attach wish data for raycast click
    bodyMesh.userData = {
        isLantern: true,
        author: wish.author,
        text: wish.text,
        color: wish.color
    };

    scene.add(lanternGroup);

    const lanternItem = {
        group: lanternGroup,
        mesh: bodyMesh,
        floatSpeed: 0.008 + Math.random() * 0.006,
        rotSpeed: 0.01 + Math.random() * 0.01,
        baseY: startY,
        timeOffset: Math.random() * 10
    };

    // If freshly released, animate it floating up into the sky
    if (isNew) {
        const targetSkyY = 7.5 + Math.random() * 4;
        gsap.to(lanternGroup.position, {
            y: targetSkyY,
            duration: 4.5,
            ease: "power1.out",
            onComplete: () => {
                lanternItem.baseY = targetSkyY;
            }
        });
    }

    lanterns.push(lanternItem);
}

function loadStoredWishes() {
    let wishes = [];
    try {
        const stored = localStorage.getItem('museum_birthday_wishes');
        if (stored) {
            wishes = JSON.parse(stored);
        } else {
            wishes = SISTER_CONFIG.defaultWishes;
            localStorage.setItem('museum_birthday_wishes', JSON.stringify(wishes));
        }
    } catch (e) {
        wishes = SISTER_CONFIG.defaultWishes;
    }

    // Spawn 3D lanterns
    wishes.forEach((w) => create3DLantern(w));
    renderWishesModalList(wishes);
}

/* ============================================================================
   8. CAMERA NAVIGATION & GSAP SMOOTH TRAVEL ANIMATIONS
   ============================================================================ */

/**
 * Smoothly flies the 3D camera to any target position & lookAt target
 */
function travelCameraTo(targetCamPos, targetLookAt, duration = 2.2, onComplete = null) {
    gsap.killTweensOf(camera.position);
    isTransitioning = true;

    // Current camera lookAt target helper
    const currentLookAt = new THREE.Vector3();
    camera.getWorldDirection(currentLookAt);
    currentLookAt.multiplyScalar(10).add(camera.position);

    // Animate camera position
    gsap.to(camera.position, {
        x: targetCamPos.x,
        y: targetCamPos.y,
        z: targetCamPos.z,
        duration: duration,
        ease: "power3.inOut"
    });

    // Animate camera lookAt vector
    const lookProxy = {
        x: currentLookAt.x,
        y: currentLookAt.y,
        z: currentLookAt.z
    };

    gsap.to(lookProxy, {
        x: targetLookAt.x,
        y: targetLookAt.y,
        z: targetLookAt.z,
        duration: duration,
        ease: "power3.inOut",
        onUpdate: () => {
            camera.lookAt(lookProxy.x, lookProxy.y, lookProxy.z);
        },
        onComplete: () => {
            isTransitioning = false;
            if (onComplete) onComplete();
        }
    });
}

/**
 * Navigate to a specific exhibit by index (-1 is Entrance, -2 is Wish Sanctuary)
 */
function goToExhibit(index) {
    currentExhibitIndex = index;

    // Hide active info card during flight
    hideExhibitCard();
    hideLanternPopup();
    const promptCard = document.getElementById('cake-prompt-card');
    if (promptCard && index !== -2) promptCard.classList.remove('visible');

    if (index === -1) {
        // Entrance Rotunda
        travelCameraTo(
            new THREE.Vector3(0, 5, 16),
            new THREE.Vector3(0, 5, 0),
            2.0,
            () => {
                updateHUD(index);
            }
        );
    } else if (index === -2) {
        // Birthday Cake & Wish Sanctuary directly at the circle altar
        riseBirthdayCake();
        travelCameraTo(
            new THREE.Vector3(0, 4.2, sanctuaryZ + 7.8),
            new THREE.Vector3(0, 2.6, sanctuaryZ),
            2.2,
            () => {
                updateHUD(index);
                const promptCard = document.getElementById('cake-prompt-card');
                if (promptCard) promptCard.classList.add('visible');
            }
        );
    } else if (index >= 0 && index < exhibits.length) {
        const exh = exhibits[index];
        travelCameraTo(
            exh.camPosition,
            exh.lookAtPosition,
            2.0,
            () => {
                updateHUD(index);
                showExhibitCard(exh.data, `EXHIBIT #${index + 1}`);
            }
        );
    }
}

/* ============================================================================
   9. INTERACTIVE HUD, MODALS & EVENT HANDLERS
   ============================================================================ */

function setupUI() {
    // Populate Sister's Name in DOM
    document.getElementById('sister-name-display').innerText = SISTER_CONFIG.name;
    document.getElementById('welcome-name').innerText = SISTER_CONFIG.name;
    document.getElementById('header-subtitle').innerHTML = `Curated for <span class="highlight-name">${SISTER_CONFIG.name}</span>'s Birthday`;

    // Entrance Gate Buttons
    document.getElementById('btn-start-tour').addEventListener('click', () => {
        document.getElementById('entrance-gate').classList.remove('visible');
        startAutoTour();
    });

    document.getElementById('btn-free-roam').addEventListener('click', () => {
        document.getElementById('entrance-gate').classList.remove('visible');
        goToExhibit(0);
    });

    // Next / Prev Buttons
    document.getElementById('btn-prev').addEventListener('click', () => {
        stopAutoTour();
        if (currentExhibitIndex > -1) {
            goToExhibit(currentExhibitIndex - 1);
        } else {
            goToExhibit(exhibits.length - 1);
        }
    });

    document.getElementById('btn-next').addEventListener('click', () => {
        stopAutoTour();
        advanceNextExhibit();
    });

    document.getElementById('btn-next-exhibit').addEventListener('click', () => {
        stopAutoTour();
        advanceNextExhibit();
    });

    // Auto Tour Toggle
    document.getElementById('btn-auto-tour-toggle').addEventListener('click', () => {
        if (autoTourActive) {
            stopAutoTour();
        } else {
            startAutoTour();
        }
    });

    // Celebrate Confetti Blast
    document.getElementById('btn-celebrate').addEventListener('click', () => {
        fireBirthdayConfetti();
        playCelebrationSound();
    });

    // Audio Toggle
    document.getElementById('btn-audio').addEventListener('click', toggleAudio);

    // Wish Modal Open/Close
    const wishModal = document.getElementById('wish-modal');
    document.getElementById('btn-open-wish').addEventListener('click', () => {
        wishModal.classList.add('visible');
    });
    document.getElementById('btn-close-wish').addEventListener('click', () => {
        wishModal.classList.remove('visible');
    });
    document.getElementById('wish-modal-close-backdrop').addEventListener('click', () => {
        wishModal.classList.remove('visible');
    });

    // Photo Lightbox Modal Open/Close
    const photoModal = document.getElementById('photo-modal');
    document.getElementById('btn-view-large').addEventListener('click', () => {
        if (currentExhibitIndex >= 0 && currentExhibitIndex < exhibits.length) {
            const data = exhibits[currentExhibitIndex].data;
            document.getElementById('photo-modal-img').src = data.img;
            document.getElementById('photo-modal-title').innerText = data.title;
            document.getElementById('photo-modal-text').innerText = data.desc;
            photoModal.classList.add('visible');
        }
    });
    document.getElementById('btn-close-photo').addEventListener('click', () => {
        photoModal.classList.remove('visible');
    });
    document.getElementById('photo-modal-close-backdrop').addEventListener('click', () => {
        photoModal.classList.remove('visible');
    });

    // Close Lantern Popup
    document.getElementById('btn-close-lantern').addEventListener('click', hideLanternPopup);

    // Candle Blowing Interactive Button
    const blowBtn = document.getElementById('btn-blow-candles');
    if (blowBtn) blowBtn.addEventListener('click', blowOutCandles);

    // Celebration Letter Modal Buttons
    const letterModal = document.getElementById('celebration-letter-modal');
    const closeLetterBtn = document.getElementById('btn-close-letter');
    if (closeLetterBtn) {
        closeLetterBtn.addEventListener('click', () => {
            if (letterModal) letterModal.classList.remove('visible');
        });
    }
    const letterBackdrop = document.getElementById('letter-modal-backdrop');
    if (letterBackdrop) {
        letterBackdrop.addEventListener('click', () => {
            if (letterModal) letterModal.classList.remove('visible');
        });
    }
    const reCelebrateBtn = document.getElementById('btn-re-celebrate');
    if (reCelebrateBtn) {
        reCelebrateBtn.addEventListener('click', () => {
            fireBirthdayConfetti();
            playCelebrationSound();
        });
    }
    const relightBtn = document.getElementById('btn-relight-candles');
    if (relightBtn) {
        relightBtn.addEventListener('click', () => {
            if (letterModal) letterModal.classList.remove('visible');
            riseBirthdayCake();
        });
    }
    const openWishesFromLetterBtn = document.getElementById('btn-open-wishes-from-letter');
    if (openWishesFromLetterBtn) {
        openWishesFromLetterBtn.addEventListener('click', () => {
            if (letterModal) letterModal.classList.remove('visible');
            wishModal.classList.add('visible');
        });
    }

    // Wish Form Submit
    document.getElementById('wish-form').addEventListener('submit', onWishFormSubmit);

    // Build Waypoints
    buildWaypoints();
    updateHUD(-1);
}

function advanceNextExhibit() {
    if (currentExhibitIndex < exhibits.length - 1) {
        goToExhibit(currentExhibitIndex + 1);
    } else if (currentExhibitIndex === exhibits.length - 1) {
        // Go to Celestial Wish Sanctuary
        goToExhibit(-2);
    } else {
        // Loop back to Entrance
        goToExhibit(0);
    }
}

function buildWaypoints() {
    const container = document.getElementById('waypoints-container');
    container.innerHTML = '';

    // Entrance dot
    const entranceDot = document.createElement('div');
    entranceDot.className = 'waypoint-dot active';
    entranceDot.innerText = '🏛️';
    entranceDot.title = 'Entrance';
    entranceDot.addEventListener('click', () => { stopAutoTour(); goToExhibit(-1); });
    container.appendChild(entranceDot);

    // Exhibits dots
    exhibits.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = 'waypoint-dot';
        dot.innerText = `${i + 1}`;
        dot.title = `Exhibit #${i + 1}`;
        dot.addEventListener('click', () => { stopAutoTour(); goToExhibit(i); });
        container.appendChild(dot);
    });

    // Birthday Cake & Wish Sanctuary dot
    const wishDot = document.createElement('div');
    wishDot.className = 'waypoint-dot';
    wishDot.innerText = '🎂';
    wishDot.title = 'Birthday Cake & Wishes';
    wishDot.addEventListener('click', () => { stopAutoTour(); goToExhibit(-2); });
    container.appendChild(wishDot);
}

function updateHUD(index) {
    const counter = document.getElementById('hud-index-display');
    const title = document.getElementById('hud-title-display');
    const dots = document.querySelectorAll('.waypoint-dot');

    dots.forEach(d => d.classList.remove('active'));

    if (index === -1) {
        counter.innerText = `0 / ${exhibits.length}`;
        title.innerText = "Grand Entrance";
        if (dots[0]) dots[0].classList.add('active');
    } else if (index === -2) {
        counter.innerText = `🎂 / ${exhibits.length}`;
        title.innerText = "Birthday Cake & Wishes";
        if (dots[dots.length - 1]) dots[dots.length - 1].classList.add('active');
    } else if (index >= 0 && index < exhibits.length) {
        counter.innerText = `${index + 1} / ${exhibits.length}`;
        title.innerText = exhibits[index].data.title;
        if (dots[index + 1]) dots[index + 1].classList.add('active');
    }
}

function showExhibitCard(data, badgeText = "EXHIBIT") {
    const card = document.getElementById('exhibit-card');
    document.getElementById('exhibit-number').innerText = badgeText;
    document.getElementById('exhibit-title').innerText = data.title;
    document.getElementById('exhibit-date').innerText = `📅 ${data.date}`;
    document.getElementById('exhibit-tag').innerText = data.tag;
    document.getElementById('exhibit-desc').innerText = data.desc;
    card.classList.add('visible');
}

function hideExhibitCard() {
    document.getElementById('exhibit-card').classList.remove('visible');
}

function showLanternPopup(author, text) {
    const popup = document.getElementById('lantern-popup');
    document.getElementById('lantern-wish-author').innerText = author;
    document.getElementById('lantern-wish-text').innerText = `"${text}"`;
    popup.classList.add('visible');
}

function hideLanternPopup() {
    document.getElementById('lantern-popup').classList.remove('visible');
}

/* ============================================================================
   10. AUTO TOUR ENGINE
   ============================================================================ */

function startAutoTour() {
    autoTourActive = true;
    document.getElementById('tour-play-icon').innerText = '⏸';
    document.getElementById('tour-play-text').innerText = 'Pause';
    
    // Start from current or first
    if (currentExhibitIndex < 0 || currentExhibitIndex >= exhibits.length) {
        goToExhibit(0);
    }

    scheduleNextAutoTourStep();
}

function stopAutoTour() {
    autoTourActive = false;
    if (autoTourTimer) clearTimeout(autoTourTimer);
    document.getElementById('tour-play-icon').innerText = '▶';
    document.getElementById('tour-play-text').innerText = 'Auto Tour';
}

function scheduleNextAutoTourStep() {
    if (autoTourTimer) clearTimeout(autoTourTimer);
    if (!autoTourActive) return;

    // Stay at each memory for 6.5 seconds before soaring smoothly to the next
    autoTourTimer = setTimeout(() => {
        if (!autoTourActive) return;
        advanceNextExhibit();
        scheduleNextAutoTourStep();
    }, 6500);
}

/* ============================================================================
   11. WISH FORM SUBMISSION & REAL-TIME 3D RELEASING
   ============================================================================ */

function showWishToast(msg) {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;
    toast.innerText = msg;
    toast.classList.add('visible');
    setTimeout(() => {
        toast.classList.remove('visible');
    }, 4000);
}

function onWishFormSubmit(e) {
    e.preventDefault();
    const authorInput = document.getElementById('wish-author');
    const messageInput = document.getElementById('wish-message');
    const colorInput = document.querySelector('input[name="lantern-color"]:checked');

    const author = authorInput.value.trim() || 'Well Wisher';
    const text = messageInput.value.trim();
    const color = colorInput ? colorInput.value : '#ffb703';

    if (!text) return;

    const newWish = { author, text, color };

    // Save to localStorage
    let wishes = [];
    try {
        const stored = localStorage.getItem('museum_birthday_wishes');
        wishes = stored ? JSON.parse(stored) : [];
    } catch (err) {
        wishes = [];
    }
    wishes.unshift(newWish);
    localStorage.setItem('museum_birthday_wishes', JSON.stringify(wishes));

    // Spawn 3D glowing lantern starting right from cake altar and ascending!
    create3DLantern(newWish, 2.5);

    // Refresh modal list
    renderWishesModalList(wishes);

    // Reset form and close modal
    authorInput.value = '';
    messageInput.value = '';
    document.getElementById('wish-modal').classList.remove('visible');

    // Show floating on-screen success notification
    showWishToast(`✨ Wish from "${author}" released into the 3D sky! 🏮`);

    // Trigger celebration & fly to Wish Sanctuary to watch the lantern float!
    fireBirthdayConfetti();
    playCelebrationSound();
    goToExhibit(-2);
}

function renderWishesModalList(wishes) {
    const list = document.getElementById('wishes-list');
    const countDisplay = document.getElementById('wish-count');
    if (!list) return;

    countDisplay.innerText = wishes.length;
    list.innerHTML = '';

    wishes.slice(0, 15).forEach((w) => {
        const item = document.createElement('div');
        item.className = 'wish-item-card';
        item.innerHTML = `
            <div class="wish-item-author" style="color: ${w.color};">🏮 ${w.author}</div>
            <div class="wish-item-text">"${w.text}"</div>
        `;
        list.appendChild(item);
    });
}

/* ============================================================================
   12. CLICK & HOVER RAYCASTING (Inspect Frames & Floating Lanterns)
   ============================================================================ */

function onCanvasClick(e) {
    // Prevent clicking during modals or UI clicks
    if (e.target.closest('button') || e.target.closest('.glass-btn') || e.target.closest('.entrance-modal') || e.target.closest('.wish-modal') || e.target.closest('.photo-modal') || e.target.closest('#exhibit-card')) {
        return;
    }

    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    for (let hit of intersects) {
        // Did click a 3D Picture Frame?
        if (hit.object.userData && hit.object.userData.exhibitIndex !== undefined) {
            stopAutoTour();
            goToExhibit(hit.object.userData.exhibitIndex);
            return;
        }

        // Did click a floating 3D Wish Lantern?
        if (hit.object.userData && hit.object.userData.isLantern) {
            showLanternPopup(hit.object.userData.author, hit.object.userData.text);
            return;
        }
    }
}

function onMouseMove(e) {
    mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

/* ============================================================================
   13. WEB AUDIO API SYNTHESIZER (Magical Ambient Birthday Soundtrack)
   ============================================================================ */

let audioCtx = null;
let isAudioPlaying = false;
let ambientInterval = null;

function initAudio() {
    if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playNote(freq, type = 'sine', duration = 1.8, gainVal = 0.08) {
    if (!audioCtx || !isAudioPlaying) return;
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(gainVal, audioCtx.currentTime + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
}

function startAmbientMusic() {
    initAudio();
    isAudioPlaying = true;
    document.getElementById('audio-icon').innerText = '🔊';
    document.getElementById('audio-label').innerText = 'Music: On';

    // Dreamy acoustic lofi chord progression (Cmaj7 -> Am7 -> Fmaj7 -> G)
    const chords = [
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [220.00, 261.63, 329.63, 392.00], // Am7
        [174.61, 220.00, 261.63, 329.63], // Fmaj7
        [196.00, 246.94, 293.66, 392.00]  // G
    ];

    let chordStep = 0;
    ambientInterval = setInterval(() => {
        if (!isAudioPlaying) return;
        const currentChord = chords[chordStep % chords.length];
        currentChord.forEach((note, idx) => {
            setTimeout(() => {
                playNote(note, 'sine', 3.0, 0.04);
            }, idx * 180);
        });
        chordStep++;
    }, 2800);
}

function stopAmbientMusic() {
    isAudioPlaying = false;
    if (ambientInterval) clearInterval(ambientInterval);
    document.getElementById('audio-icon').innerText = '🎵';
    document.getElementById('audio-label').innerText = 'Music: Off';
}

function toggleAudio() {
    if (isAudioPlaying) {
        stopAmbientMusic();
    } else {
        startAmbientMusic();
    }
}

function playCelebrationSound() {
    initAudio();
    if (!audioCtx) return;
    // Chime harp cascade
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
    notes.forEach((freq, idx) => {
        setTimeout(() => {
            try {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
                gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(audioCtx.currentTime + 1.2);
            } catch (err) {}
        }, idx * 80);
    });
}

function playBlowSound() {
    initAudio();
    if (!audioCtx) return;
    try {
        const bufferSize = audioCtx.sampleRate * 0.75;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, audioCtx.currentTime);
        filter.frequency.linearRampToValueAtTime(80, audioCtx.currentTime + 0.75);

        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.01, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.75);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        noise.start();
    } catch (e) {}
}

/* ============================================================================
   14. CELEBRATION CONFETTI FIREWORKS
   ============================================================================ */

function fireBirthdayConfetti() {
    if (typeof confetti === 'function') {
        const count = 200;
        const defaults = { origin: { y: 0.7 } };

        function fire(particleRatio, opts) {
            confetti(Object.assign({}, defaults, opts, {
                particleCount: Math.floor(count * particleRatio)
            }));
        }

        fire(0.25, { spread: 26, startVelocity: 55, colors: ['#f5c542', '#ff006e', '#8338ec'] });
        fire(0.2, { spread: 60, colors: ['#ffb703', '#ffffff', '#3a86ff'] });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, colors: ['#ffd166', '#06d6a0'] });
        fire(0.1, { spread: 120, startVelocity: 45 });
    }
}

/* ============================================================================
   15. ANIMATION & RENDER LOOP
   ============================================================================ */

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Smooth Mouse Parallax
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    // Apply subtle camera tilt sway only when not in hard animation
    if (!isTransitioning) {
        camera.rotation.y += mouse.x * 0.0008;
        camera.rotation.x += mouse.y * 0.0005;
    }

    // Animate Cake Candle Flames flickering
    if (!candlesBlownOut && candleFlames && candleFlames.length > 0) {
        candleFlames.forEach((flame, idx) => {
            const flicker = Math.sin(elapsedTime * 18 + idx * 2) * 0.12 + 1;
            flame.scale.set(flicker, flicker * (1 + Math.sin(elapsedTime * 20 + idx) * 0.1), flicker);
            flame.position.y = flame.userData.baseY + Math.sin(elapsedTime * 14 + idx) * 0.02;
        });
        candleLights.forEach((light, idx) => {
            light.intensity = 1.4 + Math.sin(elapsedTime * 16 + idx * 2) * 0.4;
        });
    }

    // Animate Floating Stardust Particles
    if (stardustParticles) {
        const positions = stardustParticles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length / 3; i++) {
            // Gentle drifting upward & shimmering
            positions[i * 3 + 1] += Math.sin(elapsedTime + i) * 0.004;
        }
        stardustParticles.geometry.attributes.position.needsUpdate = true;
    }

    // Animate Floating 3D Wish Lanterns
    lanterns.forEach((item, idx) => {
        // Floating up and gentle bobbing
        item.group.position.y = item.baseY + Math.sin(elapsedTime * 1.5 + item.timeOffset) * 0.45;
        // Slow majestic rotation
        item.group.rotation.y += item.rotSpeed;
    });

    renderer.render(scene, camera);
}

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
    init3D();
    setupUI();
});
