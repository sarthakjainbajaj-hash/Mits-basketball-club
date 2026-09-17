import * as THREE from "three";
import { rageSound } from "./rageAudio";

export const WEAPONS = [
  { id: "foam_bat", name: "Foam Bat", icon: "🏏", color: "#facc15", damage: 15, power: 1.2, speed: 0.18, desc: "Classic cartoon yellow foam bat. Boing!" },
  { id: "boxing_glove", name: "Spring Boxing Glove", icon: "🥊", color: "#ef4444", damage: 22, power: 1.6, speed: 0.22, desc: "Spring-loaded red leather puncher with heavy knockback." },
  { id: "rubber_hammer", name: "Giant Rubber Hammer", icon: "🔨", color: "#f97316", damage: 28, power: 2.2, speed: 0.32, desc: "Oversized squeaky cartoon mallet with overhead slam." },
  { id: "energy_hammer", name: "Cyber Energy Hammer", icon: "⚡", color: "#06b6d4", damage: 35, power: 2.5, speed: 0.28, desc: "High-tech plasma pulse hammer that emits cyan arcs." },
  { id: "tennis_launcher", name: "Tennis Ball Launcher", icon: "🎾", color: "#84cc16", damage: 12, power: 0.9, speed: 0.14, isRanged: true, desc: "Rapid-fire neon tennis balls that bounce off walls." },
  { id: "paint_blaster", name: "Paint Blaster", icon: "🎨", color: "#ec4899", damage: 16, power: 1.1, speed: 0.16, isRanged: true, desc: "Splatters colorful neon paint balls everywhere." },
  { id: "confetti_cannon", name: "Party Confetti Cannon", icon: "🎉", color: "#a855f7", damage: 20, power: 1.5, speed: 0.25, isRanged: true, desc: "Celebratory blast of rainbow paper confetti and sparkles." },
  { id: "shockwave_glove", name: "Sonic Shockwave Glove", icon: "🌀", color: "#3b82f6", damage: 40, power: 3.2, speed: 0.4, desc: "Emits a radial concussive blast launching everything." },
];

export class RageRoomEngine {
  constructor(container, options = {}) {
    this.container = container;
    this.options = options;
    this.onStatsChange = options.onStatsChange || (() => {});
    this.onModeEnd = options.onModeEnd || (() => {});

    this.width = container.clientWidth || window.innerWidth;
    this.height = container.clientHeight || window.innerHeight;

    // Core Three.js setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0c16);
    this.scene.fog = new THREE.FogExp2(0x0a0c16, 0.02);

    this.camera = new THREE.PerspectiveCamera(70, this.width / this.height, 0.1, 100);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Player State
    this.player = {
      x: 0,
      y: 1.7, // First-person eye height
      z: 3.2,
      yaw: 0,
      pitch: -0.05,
      speed: 8.8,
      sprintSpeed: 13.5,
    };

    // Game Mode & Rules
    this.mode = options.mode || "free"; // 'free', 'timed', 'combo', 'target', 'zen'
    this.timeRemaining = 60;
    this.score = 0;
    this.rage = 0; // 0 to 100
    this.combo = 0;
    this.maxCombo = 0;
    this.comboTimer = 0;
    this.hits = 0;
    this.isPaused = false;
    this.isGameOver = false;

    // Input State
    this.keys = {};
    this.isMouseDown = false;
    this.prevMouseX = 0;
    this.prevMouseY = 0;
    this.isDragging = false;
    this.joystickInput = { dx: 0, dy: 0 };

    // Active Equipment
    this.activeWeaponIndex = 0;
    this.weaponSwingTimer = 0;
    this.isAttacking = false;

    // Collections
    this.projectiles = [];
    this.particles = [];
    this.floatingTexts = [];
    this.props = [];
    this.screenshake = 0;
    this.timeScale = 1.0;
    this.targetPracticeZone = "chest"; // 'head', 'chest', 'belly'
    this.targetTimer = 0;

    // Dummy Movement & Fleeing AI (runs away scared when player hits or gets close!)
    this.dummy = {
      x: 0,
      y: 0,
      z: -1.2,
      vx: 0,
      vz: 0,
      rotY: 0,
      speed: 7.2,
      isFleeing: false,
      fleeTimer: 0,
      animTime: 0,
    };

    // Dummy Animation Physics
    this.dummyWobbleX = 0;
    this.dummyWobbleZ = 0;
    this.dummyVelX = 0;
    this.dummyVelZ = 0;
    this.dummyHitFlash = 0;
    this.dummyExpression = "happy";

    // Bindings
    this.handleResize = this.handleResize.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.loop = this.loop.bind(this);

    this.buildRoom();
    this.buildDummy();
    this.buildProps();
    this.buildWeaponViewModel();
    this.initEvents();

    this.clock = new THREE.Clock();
    this.isRunning = true;
    this.animId = requestAnimationFrame(this.loop);
  }

  initEvents() {
    window.addEventListener("resize", this.handleResize);
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
    this.container.addEventListener("pointerdown", this.handlePointerDown);
    window.addEventListener("pointermove", this.handlePointerMove);
    window.addEventListener("pointerup", this.handlePointerUp);
    this.container.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  destroy() {
    this.isRunning = false;
    if (this.animId) cancelAnimationFrame(this.animId);
    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    this.container.removeEventListener("pointerdown", this.handlePointerDown);
    window.removeEventListener("pointermove", this.handlePointerMove);
    window.removeEventListener("pointerup", this.handlePointerUp);
    if (document.pointerLockElement === this.container) {
      try {
        document.exitPointerLock?.();
      } catch (_) {}
    }
    if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }

  handleResize() {
    this.width = this.container.clientWidth || window.innerWidth;
    this.height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  handleKeyDown(e) {
    const k = e.key.toLowerCase();
    this.keys[k] = true;

    // Number keys 1-8 to switch weapon
    if (k >= "1" && k <= "8") {
      const idx = parseInt(k, 10) - 1;
      if (idx < WEAPONS.length) {
        this.selectWeapon(idx);
      }
    }

    // Space to strike/attack
    if (e.key === " " || k === "enter") {
      this.attack();
    }

    // R to reset dummy & props
    if (k === "r") {
      this.resetDummy();
    }
  }

  handleKeyUp(e) {
    this.keys[e.key.toLowerCase()] = false;
  }

  handlePointerDown(e) {
    if (e.button === 0) {
      if (document.pointerLockElement !== this.container) {
        try {
          this.container.requestPointerLock?.();
        } catch (_) {}
      }
      this.isDragging = true;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
      // Strike with selected weapon
      this.attack();
    } else if (e.button === 2) {
      this.attack();
    }
  }

  handlePointerMove(e) {
    // When pointer locked, movementX/Y give smooth 360-degree FPS mouse-look
    if (document.pointerLockElement === this.container) {
      const movementX = e.movementX || 0;
      const movementY = e.movementY || 0;
      this.player.yaw -= movementX * 0.0028;
      this.player.pitch = Math.max(-0.65, Math.min(0.68, this.player.pitch - movementY * 0.0025));
      return;
    }

    if (this.isDragging) {
      const deltaX = e.clientX - this.prevMouseX;
      const deltaY = e.clientY - this.prevMouseY;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;

      this.player.yaw -= deltaX * 0.004;
      this.player.pitch = Math.max(-0.65, Math.min(0.68, this.player.pitch - deltaY * 0.0035));
    }
  }

  handlePointerUp() {
    this.isDragging = false;
  }

  setJoystickInput(dx, dy) {
    this.joystickInput = { dx, dy };
  }

  selectWeapon(index) {
    if (index >= 0 && index < WEAPONS.length) {
      this.activeWeaponIndex = index;
      this.updateWeaponViewModelMesh();
      rageSound.playSwing();
      this.broadcastStats();
    }
  }

  setMode(mode) {
    this.mode = mode;
    this.timeRemaining = mode === "timed" ? 60 : 999;
    this.score = 0;
    this.rage = 0;
    this.combo = 0;
    this.hits = 0;
    this.isGameOver = false;
    this.resetDummy();

    if (mode === "zen") {
      rageSound.playZenCalm();
    }
    this.broadcastStats();
  }

  // 1. BUILD THE 3D NEON ARCADE ROOM
  buildRoom() {
    // Room Dimensions: 16m x 16m x 5.5m
    const roomW = 16;
    const roomD = 16;
    const roomH = 5.5;

    // Floor with glowing neon cyber grid
    const floorCanvas = document.createElement("canvas");
    floorCanvas.width = 512;
    floorCanvas.height = 512;
    const fctx = floorCanvas.getContext("2d");
    fctx.fillStyle = "#0c101c";
    fctx.fillRect(0, 0, 512, 512);

    // Neon grid lines
    fctx.strokeStyle = "rgba(14, 165, 233, 0.35)";
    fctx.lineWidth = 2;
    for (let i = 0; i <= 512; i += 64) {
      fctx.beginPath();
      fctx.moveTo(i, 0);
      fctx.lineTo(i, 512);
      fctx.stroke();
      fctx.beginPath();
      fctx.moveTo(0, i);
      fctx.lineTo(512, i);
      fctx.stroke();
    }

    // Center circular target ring on floor
    fctx.strokeStyle = "rgba(244, 63, 94, 0.7)";
    fctx.lineWidth = 6;
    fctx.beginPath();
    fctx.arc(256, 256, 170, 0, Math.PI * 2);
    fctx.stroke();

    fctx.strokeStyle = "rgba(250, 204, 21, 0.8)";
    fctx.lineWidth = 4;
    fctx.beginPath();
    fctx.arc(256, 256, 110, 0, Math.PI * 2);
    fctx.stroke();

    const floorTex = new THREE.CanvasTexture(floorCanvas);
    floorTex.wrapS = THREE.RepeatWrapping;
    floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(4, 4);

    const floorGeo = new THREE.PlaneGeometry(roomW, roomD);
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.65,
      metalness: 0.3,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Ceiling
    const ceilMat = new THREE.MeshStandardMaterial({ color: 0x080b14, roughness: 0.9 });
    const ceiling = new THREE.Mesh(floorGeo, ceilMat);
    ceiling.position.y = roomH;
    ceiling.rotation.x = Math.PI / 2;
    this.scene.add(ceiling);

    // Walls
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x131a29,
      roughness: 0.85,
      metalness: 0.15,
    });

    // North Wall (front facing dummy)
    const wallN = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomH), wallMat);
    wallN.position.set(0, roomH / 2, -roomD / 2);
    wallN.receiveShadow = true;
    this.scene.add(wallN);

    // South Wall
    const wallS = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomH), wallMat);
    wallS.position.set(0, roomH / 2, roomD / 2);
    wallS.rotation.y = Math.PI;
    wallS.receiveShadow = true;
    this.scene.add(wallS);

    // West Wall
    const wallW = new THREE.Mesh(new THREE.PlaneGeometry(roomD, roomH), wallMat);
    wallW.position.set(-roomW / 2, roomH / 2, 0);
    wallW.rotation.y = Math.PI / 2;
    wallW.receiveShadow = true;
    this.scene.add(wallW);

    // East Wall
    const wallE = new THREE.Mesh(new THREE.PlaneGeometry(roomD, roomH), wallMat);
    wallE.position.set(roomW / 2, roomH / 2, 0);
    wallE.rotation.y = -Math.PI / 2;
    wallE.receiveShadow = true;
    this.scene.add(wallE);

    // Neon Wall Posters with Sarthak's Real Portfolio Branding
    this.createPoster("🚀 SOLVESPHERE AI 🚀", "SIH-26043 • CROWDSOURCING INNOVATION", 0, 3.2, -roomD / 2 + 0.05, 0, "#06b6d4");
    this.createPoster("⚡ TECH ARSENAL ⚡", "REACT • PYTHON • NODE.JS • THREE.JS", -roomW / 2 + 0.05, 3.2, 0, Math.PI / 2, "#f43f5e");
    this.createPoster("🎬 AI VIDEO CREATOR 🎬", "YOUTUBE SHORTS • AI VISUAL STORYTELLING", roomW / 2 - 0.05, 3.2, 0, -Math.PI / 2, "#ef4444");
    this.createPoster("🥊 RAGE ROOM ARCADE 🥊", "SMASH STRESS • FORGED BY SARTHAK", 0, 3.2, roomD / 2 - 0.05, Math.PI, "#a855f7");

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    this.scene.add(ambientLight);

    // Center Spotlight focused on dummy
    const spot = new THREE.SpotLight(0xffedd5, 2.5);
    spot.position.set(0, roomH - 0.2, 0);
    spot.target.position.set(0, 1.2, 0);
    spot.angle = Math.PI / 3.8;
    spot.penumbra = 0.5;
    spot.castShadow = true;
    spot.shadow.mapSize.width = 1024;
    spot.shadow.mapSize.height = 1024;
    this.scene.add(spot);
    this.scene.add(spot.target);

    // Neon Accent Point Lights (Cyan & Magenta for arcade glow)
    const neonCyan = new THREE.PointLight(0x06b6d4, 1.8, 14);
    neonCyan.position.set(-5, 3.8, -4);
    this.scene.add(neonCyan);

    const neonPink = new THREE.PointLight(0xf43f5e, 1.8, 14);
    neonPink.position.set(5, 3.8, -4);
    this.scene.add(neonPink);

    const neonAmber = new THREE.PointLight(0xf59e0b, 1.4, 12);
    neonAmber.position.set(0, 3.8, 5);
    this.scene.add(neonAmber);

    // Neon ceiling perimeter trim lines
    const trimMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const trimGeoH = new THREE.BoxGeometry(roomW, 0.08, 0.08);
    const trimGeoV = new THREE.BoxGeometry(0.08, 0.08, roomD);

    const trimN = new THREE.Mesh(trimGeoH, trimMat);
    trimN.position.set(0, roomH - 0.05, -roomD / 2 + 0.05);
    this.scene.add(trimN);

    const trimS = new THREE.Mesh(trimGeoH, trimMat);
    trimS.position.set(0, roomH - 0.05, roomD / 2 - 0.05);
    this.scene.add(trimS);

    const trimW = new THREE.Mesh(trimGeoV, trimMat);
    trimW.position.set(-roomW / 2 + 0.05, roomH - 0.05, 0);
    this.scene.add(trimW);

    const trimE = new THREE.Mesh(trimGeoV, trimMat);
    trimE.position.set(roomW / 2 - 0.05, roomH - 0.05, 0);
    this.scene.add(trimE);
  }

  createPoster(title, sub, x, y, z, rotY, glowColor) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#070a12";
    ctx.fillRect(0, 0, 512, 256);

    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, 492, 236);

    ctx.font = "bold 34px 'Impact', sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 18;
    ctx.fillText(title, 256, 110);

    ctx.font = "bold 20px sans-serif";
    ctx.fillStyle = glowColor;
    ctx.shadowBlur = 8;
    ctx.fillText(sub, 256, 160);

    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      emissive: new THREE.Color(glowColor),
      emissiveIntensity: 0.35,
      roughness: 0.5,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.8), mat);
    mesh.position.set(x, y, z);
    mesh.rotation.y = rotY;
    this.scene.add(mesh);
  }

  // 2. BUILD THE HUMANOID CARTOON TRAINING DUMMY
  buildDummy() {
    this.dummyGroup = new THREE.Group();
    this.dummyGroup.position.set(this.dummy.x, 0, this.dummy.z);

    // Legs & Cute Running Shoes Assembly (for funny fleeing animation!)
    const legGeo = new THREE.CylinderGeometry(0.09, 0.11, 0.42, 12);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.7 });
    const shoeGeo = new THREE.BoxGeometry(0.2, 0.14, 0.36);
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 });

    // Left Leg
    const legLGroup = new THREE.Group();
    legLGroup.position.set(-0.24, 0.44, 0);
    const legLMesh = new THREE.Mesh(legGeo, legMat);
    legLMesh.position.y = -0.21;
    legLMesh.castShadow = true;
    legLGroup.add(legLMesh);

    const shoeL = new THREE.Mesh(shoeGeo, shoeMat);
    shoeL.position.set(0, -0.38, 0.08);
    shoeL.castShadow = true;
    legLGroup.add(shoeL);
    this.dummyGroup.add(legLGroup);
    this.dummyLegL = legLGroup;

    // Right Leg
    const legRGroup = new THREE.Group();
    legRGroup.position.set(0.24, 0.44, 0);
    const legRMesh = new THREE.Mesh(legGeo, legMat);
    legRMesh.position.y = -0.21;
    legRMesh.castShadow = true;
    legRGroup.add(legRMesh);

    const shoeR = new THREE.Mesh(shoeGeo, shoeMat);
    shoeR.position.set(0, -0.38, 0.08);
    shoeR.castShadow = true;
    legRGroup.add(shoeR);
    this.dummyGroup.add(legRGroup);
    this.dummyLegR = legRGroup;

    // Hip joint plate
    const hip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 0.15, 16),
      new THREE.MeshStandardMaterial({ color: 0x78350f })
    );
    hip.position.y = 0.45;
    this.dummyGroup.add(hip);

    // Spring Spine Assembly
    const springPivot = new THREE.Group();
    springPivot.position.set(0, 0.52, 0);
    this.dummyGroup.add(springPivot);
    this.dummySpring = springPivot;

    // Coiled Spring Graphics
    const springGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.6, 16);
    const springMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const springMesh = new THREE.Mesh(springGeo, springMat);
    springMesh.position.y = 0.3;
    springPivot.add(springMesh);

    // Upper Dummy Body Group (tilts and wobbles upon impact)
    const upperBody = new THREE.Group();
    upperBody.position.set(0, 0.6, 0);
    springPivot.add(upperBody);
    this.dummyUpper = upperBody;

    // Lower Torso / Belly
    const bellyGeo = new THREE.CylinderGeometry(0.55, 0.45, 0.65, 20);
    this.bellyMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 });
    const bellyMesh = new THREE.Mesh(bellyGeo, this.bellyMat);
    bellyMesh.position.y = 0.35;
    bellyMesh.castShadow = true;
    upperBody.add(bellyMesh);

    // Chest with Bullseye Target Rings
    const chestGeo = new THREE.CylinderGeometry(0.68, 0.55, 0.85, 20);
    this.chestMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.6 });
    const chestMesh = new THREE.Mesh(chestGeo, this.chestMat);
    chestMesh.position.y = 1.05;
    chestMesh.castShadow = true;
    upperBody.add(chestMesh);

    // Target Bullseye Decal on Chest Front
    const targetCanvas = document.createElement("canvas");
    targetCanvas.width = 256;
    targetCanvas.height = 256;
    const tctx = targetCanvas.getContext("2d");
    tctx.fillStyle = "#ef4444";
    tctx.beginPath();
    tctx.arc(128, 128, 120, 0, Math.PI * 2);
    tctx.fill();

    tctx.fillStyle = "#ffffff";
    tctx.beginPath();
    tctx.arc(128, 128, 85, 0, Math.PI * 2);
    tctx.fill();

    tctx.fillStyle = "#ef4444";
    tctx.beginPath();
    tctx.arc(128, 128, 50, 0, Math.PI * 2);
    tctx.fill();

    tctx.fillStyle = "#facc15";
    tctx.beginPath();
    tctx.arc(128, 128, 22, 0, Math.PI * 2);
    tctx.fill();

    const targetTex = new THREE.CanvasTexture(targetCanvas);
    const targetMat = new THREE.MeshStandardMaterial({ map: targetTex, transparent: true });
    const targetDecal = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.75), targetMat);
    targetDecal.position.set(0, 1.05, 0.69);
    upperBody.add(targetDecal);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.2, 0.22, 0.25, 12);
    const neckMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
    const neckMesh = new THREE.Mesh(neckGeo, neckMat);
    neckMesh.position.y = 1.55;
    upperBody.add(neckMesh);

    // Head Ball
    const headGeo = new THREE.SphereGeometry(0.48, 24, 24);
    this.headMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.6 });
    const headMesh = new THREE.Mesh(headGeo, this.headMat);
    headMesh.position.y = 1.95;
    headMesh.castShadow = true;
    upperBody.add(headMesh);
    this.dummyHeadMesh = headMesh;

    // Cartoon Animated Face Texture
    this.updateDummyFace("happy");

    // Face Decal in front of head
    const faceMat = new THREE.MeshStandardMaterial({ map: this.faceTex, transparent: true });
    this.faceMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.65), faceMat);
    this.faceMesh.position.set(0, 1.95, 0.49);
    upperBody.add(this.faceMesh);

    // Two Padded Flailing Boxing Arms
    this.armL = this.createPaddedArm(-0.75, 1.35, upperBody);
    this.armR = this.createPaddedArm(0.75, 1.35, upperBody);

    this.scene.add(this.dummyGroup);
  }

  createPaddedArm(xOffset, yOffset, parent) {
    const armPivot = new THREE.Group();
    armPivot.position.set(xOffset, yOffset, 0);

    const armGeo = new THREE.CylinderGeometry(0.14, 0.16, 0.75, 12);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.7 });
    const arm = new THREE.Mesh(armGeo, armMat);
    arm.position.y = -0.35;
    arm.castShadow = true;
    armPivot.add(arm);

    // Red Boxing Glove at arm tip
    const gloveGeo = new THREE.SphereGeometry(0.24, 16, 16);
    const gloveMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 });
    const glove = new THREE.Mesh(gloveGeo, gloveMat);
    glove.position.y = -0.8;
    glove.castShadow = true;
    armPivot.add(glove);

    parent.add(armPivot);
    return armPivot;
  }

  updateDummyFace(expression) {
    this.dummyExpression = expression;
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, 256, 256);
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#1e293b";
    ctx.fillStyle = "#1e293b";

    if (expression === "happy") {
      // Big cartoon eyes
      ctx.beginPath();
      ctx.arc(85, 100, 20, 0, Math.PI * 2);
      ctx.arc(171, 100, 20, 0, Math.PI * 2);
      ctx.fill();

      // White eye gleam
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(80, 95, 7, 0, Math.PI * 2);
      ctx.arc(166, 95, 7, 0, Math.PI * 2);
      ctx.fill();

      // Broad goofy smile
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(128, 145, 45, 0, Math.PI);
      ctx.fill();
      ctx.stroke();
    } else if (expression === "oof") {
      // Squeezed "> <" eyes
      ctx.beginPath();
      ctx.moveTo(65, 85);
      ctx.lineTo(95, 105);
      ctx.lineTo(65, 125);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(191, 85);
      ctx.lineTo(161, 105);
      ctx.lineTo(191, 125);
      ctx.stroke();

      // Wobbly O mouth
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.ellipse(128, 160, 26, 36, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (expression === "dizzy") {
      // Spiral eyes "@ @"
      for (let s = 0; s < 2; s++) {
        const cx = s === 0 ? 85 : 171;
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 5; a += 0.2) {
          const r = a * 4;
          const x = cx + Math.cos(a) * r;
          const y = 100 + Math.sin(a) * r;
          if (a === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Wavy mouth
      ctx.beginPath();
      ctx.moveTo(85, 165);
      ctx.bezierCurveTo(105, 150, 150, 180, 171, 165);
      ctx.stroke();
    }

    if (!this.faceTex) {
      this.faceTex = new THREE.CanvasTexture(canvas);
    } else {
      this.faceTex.image = canvas;
      this.faceTex.needsUpdate = true;
    }
  }

  // 3. BUILD BREAKABLE SCATTERABLE ROOM PROPS
  buildProps() {
    this.props = [];
    const propConfigs = [
      { type: "box", x: -4.5, z: -2.5, size: 0.9, color: 0xb45309 },
      { type: "box", x: -4.5, z: -1.5, size: 0.8, color: 0x92400e },
      { type: "box", x: -4.5, z: -2.0, y: 0.8, size: 0.75, color: 0xd97706 },
      { type: "crate", x: 4.5, z: -2.5, size: 1.1, color: 0x78350f },
      { type: "cone", x: 3.5, z: 1.5, color: 0xf97316 },
      { type: "cone", x: -3.5, z: 1.5, color: 0xf97316 },
      { type: "can", x: -2.0, z: -4.5, color: 0xef4444 },
      { type: "can", x: -1.6, z: -4.5, color: 0x3b82f6 },
      { type: "can", x: -1.8, z: -4.5, y: 0.5, color: 0x10b981 },
      { type: "box", x: 4.0, z: 2.5, size: 0.85, color: 0xca8a04 },
    ];

    propConfigs.forEach((cfg, idx) => {
      let geo, mat;
      if (cfg.type === "box" || cfg.type === "crate") {
        geo = new THREE.BoxGeometry(cfg.size, cfg.size, cfg.size);
        mat = new THREE.MeshStandardMaterial({ color: cfg.color, roughness: 0.8 });
      } else if (cfg.type === "cone") {
        geo = new THREE.ConeGeometry(0.3, 0.8, 16);
        mat = new THREE.MeshStandardMaterial({ color: cfg.color, roughness: 0.6 });
      } else {
        geo = new THREE.CylinderGeometry(0.18, 0.18, 0.45, 16);
        mat = new THREE.MeshStandardMaterial({ color: cfg.color, metalness: 0.8, roughness: 0.3 });
      }

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(cfg.x, cfg.y || cfg.size / 2 || 0.4, cfg.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);

      this.props.push({
        id: `prop_${idx}`,
        type: cfg.type,
        mesh,
        originX: mesh.position.x,
        originY: mesh.position.y,
        originZ: mesh.position.z,
        vx: 0,
        vy: 0,
        vz: 0,
        rotVx: 0,
        rotVz: 0,
        hp: 30,
        isShattered: false,
      });
    });
  }

  // 4. FIRST-PERSON WEAPON VIEWMODEL
  buildWeaponViewModel() {
    this.viewModel = new THREE.Group();
    this.camera.add(this.viewModel);
    this.scene.add(this.camera);

    this.weaponMeshGroup = new THREE.Group();
    this.weaponMeshGroup.position.set(0.36, -0.32, -0.58);
    this.weaponMeshGroup.scale.set(0.52, 0.52, 0.52);
    this.viewModel.add(this.weaponMeshGroup);

    this.updateWeaponViewModelMesh();
  }

  updateWeaponViewModelMesh() {
    // Clear previous weapon
    while (this.weaponMeshGroup.children.length > 0) {
      this.weaponMeshGroup.remove(this.weaponMeshGroup.children[0]);
    }

    const weapon = WEAPONS[this.activeWeaponIndex];
    const group = new THREE.Group();

    if (weapon.id === "foam_bat") {
      // Yellow Foam Baseball Bat
      const handle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.05, 0.35, 12),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 })
      );
      handle.position.y = -0.15;
      group.add(handle);

      const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.05, 0.7, 16),
        new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 })
      );
      barrel.position.y = 0.35;
      group.add(barrel);

      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x2563eb })
      );
      cap.position.y = 0.7;
      group.add(cap);

      group.rotation.set(-0.35, 0.4, 0.2);
    } else if (weapon.id === "boxing_glove") {
      // Spring Puncher
      const scissor = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8),
        new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9 })
      );
      scissor.rotation.x = Math.PI / 2;
      group.add(scissor);

      const glove = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 })
      );
      glove.position.z = -0.3;
      group.add(glove);

      group.rotation.set(0.1, 0, 0);
    } else if (weapon.id === "rubber_hammer") {
      // Oversized Rubber Mallet
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.75, 12),
        new THREE.MeshStandardMaterial({ color: 0x475569 })
      );
      group.add(shaft);

      const head = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.28, 16),
        new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.6 })
      );
      head.rotation.z = Math.PI / 2;
      head.position.y = 0.38;
      group.add(head);

      group.rotation.set(-0.25, 0.3, 0.1);
    } else if (weapon.id === "energy_hammer") {
      // Cyan Plasma Cyber Hammer
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.035, 0.75, 12),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 })
      );
      group.add(shaft);

      const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.14, 0.14),
        new THREE.MeshStandardMaterial({
          color: 0x06b6d4,
          emissive: 0x0891b2,
          emissiveIntensity: 0.75,
          roughness: 0.2,
        })
      );
      head.position.y = 0.38;
      group.add(head);

      group.rotation.set(-0.25, 0.3, 0.1);
    } else if (weapon.id === "tennis_launcher") {
      // Pneumatic Launcher Tube
      const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 0.65, 16),
        new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 })
      );
      barrel.rotation.x = Math.PI / 2;
      group.add(barrel);

      const ball = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0xa3e635, roughness: 0.9 })
      );
      ball.position.z = -0.32;
      group.add(ball);

      group.rotation.set(0.1, 0, 0);
    } else if (weapon.id === "paint_blaster") {
      // Paint Spray Gun
      const gunBody = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.22, 0.5),
        new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.4 })
      );
      group.add(gunBody);

      const tank = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.09, 0.28, 12),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 })
      );
      tank.position.set(0, 0.2, -0.05);
      group.add(tank);

      group.rotation.set(0.08, 0, 0);
    } else if (weapon.id === "confetti_cannon") {
      // Striped Party Cannon
      const tube = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.08, 0.6, 16),
        new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.3 })
      );
      tube.rotation.x = Math.PI / 2;
      group.add(tube);

      group.rotation.set(0.12, 0, 0);
    } else if (weapon.id === "shockwave_glove") {
      // High-Tech Cyber Gauntlet
      const gauntlet = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.24, 0.5),
        new THREE.MeshStandardMaterial({ color: 0x1d4ed8, metalness: 0.8, roughness: 0.3 })
      );
      group.add(gauntlet);

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.14, 0.03, 8, 24),
        new THREE.MeshBasicMaterial({ color: 0x60a5fa })
      );
      ring.position.z = -0.25;
      group.add(ring);

      group.rotation.set(0.1, 0, 0);
    }

    this.weaponMeshGroup.add(group);
  }

  // 5. ATTACK & IMPACT SYSTEM
  attack() {
    if (this.isAttacking || this.isPaused || this.isGameOver) return;

    const weapon = WEAPONS[this.activeWeaponIndex];
    this.isAttacking = true;
    this.weaponSwingTimer = weapon.speed;

    // Trigger weapon specific sound
    if (weapon.id === "foam_bat") rageSound.playSwing();
    else if (weapon.id === "boxing_glove") rageSound.playSwing();
    else if (weapon.id === "rubber_hammer") rageSound.playSwing();
    else if (weapon.id === "energy_hammer") rageSound.playEnergyBlast();
    else if (weapon.id === "tennis_launcher") {
      rageSound.playBallLaunch();
      this.fireTennisBall();
    } else if (weapon.id === "paint_blaster") {
      rageSound.playPaintSplat();
      this.firePaintStream();
    } else if (weapon.id === "confetti_cannon") {
      rageSound.playConfettiPop();
      this.fireConfettiBlast();
    } else if (weapon.id === "shockwave_glove") {
      rageSound.playShockwave();
      this.fireShockwave();
    }

    // If melee weapon, check hit raycast forward towards dummy and props
    if (!weapon.isRanged) {
      setTimeout(() => {
        this.checkMeleeHit(weapon);
      }, (weapon.speed * 450));
    }
  }

  checkMeleeHit(weapon) {
    // Vector from player towards dynamic fleeing dummy
    const dx = this.dummy.x - this.player.x;
    const dz = this.dummy.z - this.player.z;
    const distToDummy = Math.hypot(dx, dz);

    // Player forward direction
    const forwardX = -Math.sin(this.player.yaw);
    const forwardZ = -Math.cos(this.player.yaw);
    const dot = (dx * forwardX + dz * forwardZ) / (distToDummy || 1);

    // If facing dummy within reach (approx 3.4m)
    if (distToDummy < 3.5 && dot > 0.45) {
      this.hitDummy(weapon, { x: forwardX, z: forwardZ });
    } else {
      // Check if hitting any nearby props
      this.props.forEach((prop) => {
        if (!prop.isShattered) {
          const pdx = prop.mesh.position.x - this.player.x;
          const pdz = prop.mesh.position.z - this.player.z;
          const pDist = Math.hypot(pdx, pdz);
          const pDot = (pdx * forwardX + pdz * forwardZ) / (pDist || 1);
          if (pDist < 3.2 && pDot > 0.55) {
            this.hitProp(prop, weapon, { x: forwardX, z: forwardZ });
          }
        }
      });
    }
  }

  hitDummy(weapon, dir) {
    this.hits++;
    this.combo++;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    this.comboTimer = 3.5; // Reset combo timeout

    // Target zone accuracy check based on player pitch
    let hitZone = "chest";
    let zoneMultiplier = 1.0;
    if (this.player.pitch > 0.15) {
      hitZone = "head";
      zoneMultiplier = 1.8;
    } else if (this.player.pitch < -0.15) {
      hitZone = "belly";
      zoneMultiplier = 1.2;
    }

    // Target Practice bonus
    let isTargetMatch = false;
    if (this.mode === "target" && hitZone === this.targetPracticeZone) {
      isTargetMatch = true;
      zoneMultiplier *= 2.5;
      this.spawnComicText("🎯 BULLSEYE!", "#facc15");
      this.pickNewTargetZone();
    }

    const hitScore = Math.round(weapon.damage * zoneMultiplier * (1 + this.combo * 0.1));
    this.score += hitScore;

    // Rage meter fills
    const rageGain = weapon.power * 5.5 * (1 + this.combo * 0.05);
    this.rage = Math.min(100, this.rage + rageGain);

    // Audio reaction
    if (weapon.id === "foam_bat") rageSound.playFoamBonk();
    else if (weapon.id === "boxing_glove") rageSound.playPunchSmack();
    else if (weapon.id === "rubber_hammer") rageSound.playRubberSqueak();
    else if (weapon.id === "energy_hammer") rageSound.playEnergyBlast();
    else if (weapon.id === "shockwave_glove") rageSound.playShockwave();
    else rageSound.playDummyWobble();

    // Funny dummy spring impulse
    const impulse = weapon.power * 0.45;
    this.dummyVelX += dir.x * impulse;
    this.dummyVelZ += dir.z * impulse;
    this.dummyHitFlash = 0.2;

    // Trigger Scared Fleeing & Running Chase!
    this.dummy.isFleeing = true;
    this.dummy.fleeTimer = 4.2;

    // Cartoon facial reaction
    if (this.combo >= 8) {
      this.updateDummyFace("dizzy");
    } else {
      this.updateDummyFace("oof");
      setTimeout(() => {
        if (this.dummyExpression === "oof") this.updateDummyFace("happy");
      }, 900);
    }

    // Flail arms
    if (this.armL && this.armR) {
      this.armL.rotation.x = (Math.random() - 0.5) * 2.5;
      this.armR.rotation.x = (Math.random() - 0.5) * 2.5;
    }

    // Screenshake
    this.screenshake = Math.min(0.35, weapon.power * 0.08);

    // Comic Floating Text (Hit + Panic Phrase)
    const comicPhrases = ["BONK!", "WHAM!", "POW!", "OOF!", "SMACK!", "STRESS DRAINED!", "KABOOM!"];
    const phrase = comicPhrases[Math.floor(Math.random() * comicPhrases.length)];
    this.spawnComicText(`${phrase} +${hitScore}`, weapon.color, this.dummy.x, 2.3, this.dummy.z);

    const panicPhrases = ["AAAHHH!", "DON'T HIT ME!", "RUN AWAY!", "ZOOM!", "SCRAM!", "CATCH ME!", "CHASE ME!"];
    const panicTxt = panicPhrases[Math.floor(Math.random() * panicPhrases.length)];
    setTimeout(() => {
      if (this.dummy.isFleeing) {
        this.spawnComicText(panicTxt, "#f43f5e", this.dummy.x, 2.6, this.dummy.z);
      }
    }, 280);

    // Particle Sparks & Stars at dummy's actual location
    this.spawnImpactParticles(this.dummy.x, 1.3, this.dummy.z, weapon.color, 18);

    // Check Full Rage Frenzy
    if (this.rage >= 100) {
      this.triggerMaxRageFrenzy();
    }

    this.broadcastStats();
  }

  hitProp(prop, weapon, dir) {
    prop.hp -= weapon.damage;
    prop.vx += dir.x * weapon.power * 4.5;
    prop.vz += dir.z * weapon.power * 4.5;
    prop.vy += weapon.power * 2.5;
    prop.rotVx += (Math.random() - 0.5) * 6;
    prop.rotVz += (Math.random() - 0.5) * 6;

    rageSound.playPropSmash();
    this.spawnComicText("CRASH!", "#f97316", prop.mesh.position.x, prop.mesh.position.y + 0.8, prop.mesh.position.z);
    this.spawnImpactParticles(prop.mesh.position.x, prop.mesh.position.y, prop.mesh.position.z, "#f59e0b", 14);

    if (prop.hp <= 0 && !prop.isShattered) {
      prop.isShattered = true;
      prop.mesh.scale.set(0.01, 0.01, 0.01);
      this.score += 50;
      this.spawnComicText("DESTROYED! +50", "#ef4444");
    }
  }

  // RANGED PROJECTILES
  fireTennisBall() {
    const geo = new THREE.SphereGeometry(0.12, 16, 16);
    const mat = new THREE.MeshStandardMaterial({ color: 0xa3e635, roughness: 0.85 });
    const mesh = new THREE.Mesh(geo, mat);

    // Start at player hand
    const startPos = new THREE.Vector3(0.3, -0.2, -0.5).applyEuler(new THREE.Euler(this.player.pitch, this.player.yaw, 0));
    mesh.position.set(this.player.x + startPos.x, this.player.y + startPos.y, this.player.z + startPos.z);
    this.scene.add(mesh);

    const speed = 24;
    const forwardX = -Math.sin(this.player.yaw) * Math.cos(this.player.pitch);
    const forwardY = Math.sin(this.player.pitch);
    const forwardZ = -Math.cos(this.player.yaw) * Math.cos(this.player.pitch);

    this.projectiles.push({
      mesh,
      type: "tennis",
      vx: forwardX * speed,
      vy: forwardY * speed + 0.5,
      vz: forwardZ * speed,
      life: 3.5,
      bounces: 0,
    });
  }

  firePaintStream() {
    const colors = ["#ec4899", "#06b6d4", "#facc15", "#10b981", "#a855f7"];
    for (let i = 0; i < 4; i++) {
      const col = colors[Math.floor(Math.random() * colors.length)];
      const geo = new THREE.SphereGeometry(0.08 + Math.random() * 0.04, 12, 12);
      const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(col) });
      const mesh = new THREE.Mesh(geo, mat);

      mesh.position.set(this.player.x, this.player.y - 0.2, this.player.z);
      this.scene.add(mesh);

      const speed = 20 + Math.random() * 5;
      const spread = (Math.random() - 0.5) * 0.12;
      const forwardX = -Math.sin(this.player.yaw + spread) * Math.cos(this.player.pitch + spread);
      const forwardY = Math.sin(this.player.pitch + spread);
      const forwardZ = -Math.cos(this.player.yaw + spread) * Math.cos(this.player.pitch + spread);

      this.projectiles.push({
        mesh,
        type: "paint",
        color: col,
        vx: forwardX * speed,
        vy: forwardY * speed,
        vz: forwardZ * speed,
        life: 1.8,
      });
    }
  }

  fireConfettiBlast() {
    const colors = [0xf43f5e, 0xfacc15, 0x06b6d4, 0x10b981, 0xa855f7, 0xf97316];
    for (let i = 0; i < 45; i++) {
      const geo = new THREE.PlaneGeometry(0.08, 0.08);
      const mat = new THREE.MeshBasicMaterial({
        color: colors[Math.floor(Math.random() * colors.length)],
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(this.player.x, this.player.y - 0.1, this.player.z);
      this.scene.add(mesh);

      const spreadX = (Math.random() - 0.5) * 0.5;
      const spreadY = (Math.random() - 0.5) * 0.5;
      const forwardX = -Math.sin(this.player.yaw + spreadX);
      const forwardZ = -Math.cos(this.player.yaw + spreadX);

      this.particles.push({
        mesh,
        vx: forwardX * (10 + Math.random() * 12),
        vy: Math.sin(this.player.pitch + spreadY) * 10 + 3 + Math.random() * 3,
        vz: forwardZ * (10 + Math.random() * 12),
        rotX: Math.random() * 10,
        rotY: Math.random() * 10,
        gravity: -5,
        life: 2.2,
      });
    }

    // Confetti blast hits dummy if in front
    this.checkMeleeHit(WEAPONS[6]);
  }

  fireShockwave() {
    // Expanding Sonic Ring in front of player
    const ringGeo = new THREE.RingGeometry(0.3, 0.5, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.set(this.player.x, this.player.y - 0.2, this.player.z);
    ringMesh.rotation.y = this.player.yaw;
    this.scene.add(ringMesh);

    this.projectiles.push({
      mesh: ringMesh,
      type: "shockwave",
      scaleSpeed: 18,
      vx: -Math.sin(this.player.yaw) * 22,
      vy: 0,
      vz: -Math.cos(this.player.yaw) * 22,
      life: 0.65,
    });

    // Massive knockback on dummy
    const dx = 0 - this.player.x;
    const dz = 0 - this.player.z;
    if (Math.hypot(dx, dz) < 6.0) {
      this.hitDummy(WEAPONS[7], { x: -Math.sin(this.player.yaw), z: -Math.cos(this.player.yaw) });
    }
  }

  // MAX RAGE FRENZY & ZEN CALM RESET
  triggerMaxRageFrenzy() {
    rageSound.playRageFrenzy();
    this.spawnComicText("⚡ MAXIMUM RAGE UNLEASHED! ⚡", "#f43f5e", 0, 2.6, 0);

    // Confetti celebration storm
    this.spawnImpactParticles(0, 2.0, 0, "#facc15", 40);

    // After 2.5s of frenzy, trigger peaceful Zen Reset
    setTimeout(() => {
      this.triggerZenReset();
    }, 2500);
  }

  triggerZenReset() {
    rageSound.playZenCalm();
    this.rage = 0;
    this.spawnComicText("✨ ZEN RESET • STRESS PURGED ✨", "#38bdf8", 0, 2.5, 0);
    this.updateDummyFace("happy");
    this.resetDummy();
    this.broadcastStats();
  }

  resetDummy() {
    this.dummy.x = 0;
    this.dummy.y = 0;
    this.dummy.z = -1.2;
    this.dummy.vx = 0;
    this.dummy.vz = 0;
    this.dummy.rotY = 0;
    this.dummy.isFleeing = false;
    this.dummy.fleeTimer = 0;
    this.dummy.animTime = 0;
    if (this.dummyGroup) {
      this.dummyGroup.position.set(0, 0, -1.2);
      this.dummyGroup.rotation.set(0, 0, 0);
    }
    if (this.dummyLegL && this.dummyLegR) {
      this.dummyLegL.rotation.set(0, 0, 0);
      this.dummyLegR.rotation.set(0, 0, 0);
    }
    if (this.armL && this.armR) {
      this.armL.rotation.set(0, 0, 0);
      this.armR.rotation.set(0, 0, 0);
    }
    this.dummyWobbleX = 0;
    this.dummyWobbleZ = 0;
    this.dummyVelX = 0;
    this.dummyVelZ = 0;
    if (this.dummySpring) {
      this.dummySpring.rotation.set(0, 0, 0);
    }
    this.updateDummyFace("happy");

    // Reset props back to origin
    this.props.forEach((prop) => {
      prop.isShattered = false;
      prop.hp = 30;
      prop.mesh.scale.set(1, 1, 1);
      prop.mesh.position.set(prop.originX, prop.originY, prop.originZ);
      prop.vx = 0;
      prop.vy = 0;
      prop.vz = 0;
    });
  }

  pickNewTargetZone() {
    const zones = ["head", "chest", "belly"];
    this.targetPracticeZone = zones[Math.floor(Math.random() * zones.length)];
    this.targetTimer = 5.0;
  }

  // 6. VISUAL PARTICLES & COMIC TEXT SPRITES
  spawnComicText(text, colorHex, x = 0, y = 2.2, z = 0.5) {
    const canvas = document.createElement("canvas");
    canvas.width = 384;
    canvas.height = 96;
    const ctx = canvas.getContext("2d");

    ctx.font = "bold 32px 'Impact', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Text shadow / outline
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 6;
    ctx.strokeText(text, 192, 48);

    ctx.fillStyle = colorHex;
    ctx.shadowColor = colorHex;
    ctx.shadowBlur = 12;
    ctx.fillText(text, 192, 48);

    const tex = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.set(x + (Math.random() - 0.5) * 0.6, y + (Math.random() - 0.5) * 0.4, z);
    sprite.scale.set(1.8, 0.45, 1);
    this.scene.add(sprite);

    this.floatingTexts.push({
      sprite,
      vy: 1.2,
      life: 1.1,
      maxLife: 1.1,
    });
  }

  spawnImpactParticles(x, y, z, colorHex, count = 16) {
    const geo = new THREE.SphereGeometry(0.045, 8, 8);
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(colorHex) });

    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      this.scene.add(mesh);

      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 4.5;

      this.particles.push({
        mesh,
        vx: Math.cos(angle) * speed,
        vy: 1.5 + Math.random() * 3.5,
        vz: Math.sin(angle) * speed,
        gravity: -9.8,
        life: 0.85,
      });
    }
  }

  // 7. BROADCAST STATS TO REACT UI
  broadcastStats() {
    this.onStatsChange({
      mode: this.mode,
      timeRemaining: Math.max(0, Math.ceil(this.timeRemaining)),
      score: this.score,
      rage: Math.round(this.rage),
      combo: this.combo,
      maxCombo: this.maxCombo,
      hits: this.hits,
      activeWeapon: WEAPONS[this.activeWeaponIndex],
      targetZone: this.mode === "target" ? this.targetPracticeZone : null,
      isPaused: this.isPaused,
      isGameOver: this.isGameOver,
    });
  }

  // 8. MAIN ANIMATION LOOP
  loop() {
    if (!this.isRunning) return;
    this.animId = requestAnimationFrame(this.loop);

    const rawDelta = Math.min(this.clock.getDelta(), 0.1);
    const delta = rawDelta * this.timeScale;

    if (!this.isPaused && !this.isGameOver) {
      this.update(delta);
    }

    this.renderer.render(this.scene, this.camera);
  }

  update(delta) {
    // 1. Game Mode Timer
    if (this.mode === "timed") {
      this.timeRemaining -= delta;
      if (this.timeRemaining <= 0) {
        this.timeRemaining = 0;
        this.isGameOver = true;
        this.onModeEnd({
          score: this.score,
          maxCombo: this.maxCombo,
          hits: this.hits,
        });
      }
      this.broadcastStats();
    }

    // 2. Combo Timer Decay
    if (this.combo > 0) {
      this.comboTimer -= delta;
      if (this.comboTimer <= 0) {
        this.combo = 0;
        if (this.dummyExpression === "dizzy") {
          this.updateDummyFace("happy");
        }
        this.broadcastStats();
      }
    }

    // 3. Player Movement (WASD + Joystick)
    let moveX = 0;
    let moveZ = 0;

    if (this.keys["w"] || this.keys["arrowup"]) moveZ -= 1;
    if (this.keys["s"] || this.keys["arrowdown"]) moveZ += 1;
    if (this.keys["a"] || this.keys["arrowleft"]) moveX -= 1;
    if (this.keys["d"] || this.keys["arrowright"]) moveX += 1;

    if (this.joystickInput.dx !== 0 || this.joystickInput.dy !== 0) {
      moveX += this.joystickInput.dx;
      moveZ += this.joystickInput.dy;
    }

    if (moveX !== 0 || moveZ !== 0) {
      const len = Math.hypot(moveX, moveZ);
      const nX = moveX / len;
      const nZ = moveZ / len;

      const cosYaw = Math.cos(this.player.yaw);
      const sinYaw = Math.sin(this.player.yaw);

      // Camera forward & right vectors
      const forwardX = -sinYaw;
      const forwardZ = -cosYaw;
      const rightX = cosYaw;
      const rightZ = -sinYaw;

      const isSprinting = Boolean(this.keys["shift"]);
      const currentSpeed = isSprinting ? this.player.sprintSpeed : this.player.speed;
      const dx = (rightX * nX + forwardX * -nZ) * currentSpeed * delta;
      const dz = (rightZ * nX + forwardZ * -nZ) * currentSpeed * delta;

      // Room boundary collision clamping (-7m to 7m)
      this.player.x = Math.max(-6.5, Math.min(6.5, this.player.x + dx));
      this.player.z = Math.max(-6.5, Math.min(6.5, this.player.z + dz));
    }

    // 4. Update Camera First-Person Position & Rotation with Screenshake
    let shakeX = 0;
    let shakeY = 0;
    if (this.screenshake > 0) {
      shakeX = (Math.random() - 0.5) * this.screenshake;
      shakeY = (Math.random() - 0.5) * this.screenshake;
      this.screenshake = Math.max(0, this.screenshake - delta * 1.5);
    }

    this.camera.position.set(this.player.x + shakeX, this.player.y + shakeY, this.player.z);
    this.camera.rotation.order = "YXZ";
    this.camera.rotation.y = this.player.yaw;
    this.camera.rotation.x = this.player.pitch;

    // 5. Weapon Viewmodel Swing Animation
    if (this.isAttacking) {
      this.weaponSwingTimer -= delta;
      const pct = Math.max(0, this.weaponSwingTimer / 0.25);
      // Recoil forward and punch/swing
      this.weaponMeshGroup.position.z = -0.58 - Math.sin(pct * Math.PI) * 0.22;
      this.weaponMeshGroup.position.x = 0.38 - Math.sin(pct * Math.PI) * 0.1;
      this.weaponMeshGroup.rotation.z = Math.sin(pct * Math.PI) * 0.5;

      if (this.weaponSwingTimer <= 0) {
        this.isAttacking = false;
        this.weaponMeshGroup.position.set(0.38, -0.32, -0.58);
        this.weaponMeshGroup.rotation.set(0, 0, 0);
      }
    } else {
      // Gentle idle weapon breathing sway
      const t = this.clock.getElapsedTime();
      this.weaponMeshGroup.position.y = -0.32 + Math.sin(t * 2.5) * 0.008;
      this.weaponMeshGroup.position.x = 0.38 + Math.cos(t * 1.8) * 0.006;
    }

    // 6. Dummy Movement, Scared Fleeing AI & Wobble Physics
    const distToPlayer = Math.hypot(this.dummy.x - this.player.x, this.dummy.z - this.player.z);

    // If player approaches within 2.8m and dummy is idle, it gets startled and runs!
    if (distToPlayer < 2.8 && !this.dummy.isFleeing) {
      this.dummy.isFleeing = true;
      this.dummy.fleeTimer = 3.5;
    }

    if (this.dummy.fleeTimer > 0) {
      this.dummy.fleeTimer -= delta;
      this.dummy.isFleeing = true;
    } else {
      this.dummy.isFleeing = false;
    }

    if (this.dummy.isFleeing) {
      this.dummy.animTime += delta;

      // Escape direction away from player
      let awayX = this.dummy.x - this.player.x;
      let awayZ = this.dummy.z - this.player.z;
      let len = Math.hypot(awayX, awayZ) || 1;
      let dirX = awayX / len;
      let dirZ = awayZ / len;

      // Smart Wall Avoidance & Room Circling (bounds x: ±5.8, z: ±5.8)
      if (this.dummy.x > 4.6) dirX -= 1.8;
      if (this.dummy.x < -4.6) dirX += 1.8;
      if (this.dummy.z > 4.6) dirZ -= 1.8;
      if (this.dummy.z < -4.6) dirZ += 1.8;

      const steerLen = Math.hypot(dirX, dirZ) || 1;
      dirX /= steerLen;
      dirZ /= steerLen;

      // Apply movement speed
      this.dummy.x += dirX * this.dummy.speed * delta;
      this.dummy.z += dirZ * this.dummy.speed * delta;

      // Boundary safety clamp
      this.dummy.x = Math.max(-5.8, Math.min(5.8, this.dummy.x));
      this.dummy.z = Math.max(-5.8, Math.min(5.8, this.dummy.z));

      // Face escape direction smoothly
      const targetRotY = Math.atan2(dirX, dirZ);
      this.dummy.rotY = THREE.MathUtils.lerp(this.dummy.rotY, targetRotY, 0.16);
      this.dummyGroup.rotation.y = this.dummy.rotY;

      // Animated running legs & funny hop
      const stepRate = this.dummy.animTime * 18;
      if (this.dummyLegL && this.dummyLegR) {
        this.dummyLegL.rotation.x = Math.sin(stepRate) * 0.75;
        this.dummyLegR.rotation.x = -Math.sin(stepRate) * 0.75;
      }
      this.dummyGroup.position.y = Math.abs(Math.sin(stepRate)) * 0.14;

      // Panicking flailing arms
      if (this.armL && this.armR) {
        this.armL.rotation.z = -0.4 + Math.sin(this.dummy.animTime * 15) * 0.7;
        this.armR.rotation.z = 0.4 - Math.sin(this.dummy.animTime * 15) * 0.7;
      }
    } else {
      // Idle panting breathing bob when player is far away
      this.dummy.animTime += delta;
      const breathe = Math.sin(this.dummy.animTime * 3);
      this.dummyGroup.position.y = 0.04 + breathe * 0.03;
      if (this.dummyLegL && this.dummyLegR) {
        this.dummyLegL.rotation.x = THREE.MathUtils.lerp(this.dummyLegL.rotation.x, 0, 0.1);
        this.dummyLegR.rotation.x = THREE.MathUtils.lerp(this.dummyLegR.rotation.x, 0, 0.1);
      }
      if (this.armL && this.armR) {
        this.armL.rotation.z = THREE.MathUtils.lerp(this.armL.rotation.z, 0, 0.1);
        this.armR.rotation.z = THREE.MathUtils.lerp(this.armR.rotation.z, 0, 0.1);
      }
    }

    this.dummyGroup.position.x = this.dummy.x;
    this.dummyGroup.position.z = this.dummy.z;

    // Hooke's law spring: F = -k * x - c * v
    const springK = 38.0;
    const damping = 4.2;

    const accX = -springK * this.dummyWobbleX - damping * this.dummyVelX;
    const accZ = -springK * this.dummyWobbleZ - damping * this.dummyVelZ;

    this.dummyVelX += accX * delta;
    this.dummyVelZ += accZ * delta;

    this.dummyWobbleX += this.dummyVelX * delta;
    this.dummyWobbleZ += this.dummyVelZ * delta;

    if (this.dummySpring) {
      this.dummySpring.rotation.z = this.dummyWobbleX;
      this.dummySpring.rotation.x = -this.dummyWobbleZ;
    }

    // Dummy Hit Flash decay
    if (this.dummyHitFlash > 0) {
      this.dummyHitFlash -= delta;
      if (this.dummyHeadMesh) this.dummyHeadMesh.material.color.setHex(0xffffff);
      if (this.chestMat) this.chestMat.color.setHex(0xffffff);
    } else {
      if (this.dummyHeadMesh) this.dummyHeadMesh.material.color.setHex(0xf59e0b);
      if (this.chestMat) this.chestMat.color.setHex(0xb45309);
    }

    // 7. Update Room Props Physics
    this.props.forEach((prop) => {
      if (!prop.isShattered && (prop.vx !== 0 || prop.vy !== 0 || prop.vz !== 0)) {
        prop.mesh.position.x += prop.vx * delta;
        prop.mesh.position.y += prop.vy * delta;
        prop.mesh.position.z += prop.vz * delta;

        prop.mesh.rotation.x += prop.rotVx * delta;
        prop.mesh.rotation.z += prop.rotVz * delta;

        // Gravity
        prop.vy -= 9.8 * delta;

        // Floor bounce & friction
        const groundY = (prop.type === "cone" ? 0.4 : 0.45);
        if (prop.mesh.position.y < groundY) {
          prop.mesh.position.y = groundY;
          prop.vy = -prop.vy * 0.45;
          prop.vx *= 0.85;
          prop.vz *= 0.85;
          prop.rotVx *= 0.8;
          prop.rotVz *= 0.8;

          if (Math.abs(prop.vy) < 0.2) prop.vy = 0;
          if (Math.abs(prop.vx) < 0.05) prop.vx = 0;
          if (Math.abs(prop.vz) < 0.05) prop.vz = 0;
        }

        // Wall collisions
        if (Math.abs(prop.mesh.position.x) > 7.2) {
          prop.vx = -prop.vx * 0.6;
          prop.mesh.position.x = Math.sign(prop.mesh.position.x) * 7.2;
        }
        if (Math.abs(prop.mesh.position.z) > 7.2) {
          prop.vz = -prop.vz * 0.6;
          prop.mesh.position.z = Math.sign(prop.mesh.position.z) * 7.2;
        }
      }
    });

    // 8. Update Projectiles (Tennis Balls, Paint Drops, Shockwaves)
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.life -= delta;

      if (p.type === "shockwave") {
        p.mesh.scale.x += p.scaleSpeed * delta;
        p.mesh.scale.y += p.scaleSpeed * delta;
        p.mesh.position.x += p.vx * delta;
        p.mesh.position.z += p.vz * delta;
        p.mesh.material.opacity = Math.max(0, p.life / 0.65);
      } else {
        p.mesh.position.x += p.vx * delta;
        p.mesh.position.y += p.vy * delta;
        p.mesh.position.z += p.vz * delta;

        if (p.type === "tennis") {
          p.vy -= 9.8 * delta; // Tennis gravity
          // Floor bounce
          if (p.mesh.position.y <= 0.12) {
            p.mesh.position.y = 0.12;
            p.vy = -p.vy * 0.72;
            p.vx *= 0.88;
            p.vz *= 0.88;
            p.bounces++;
          }
        }

        // Hit detection with dummy
        const dDist = Math.hypot(p.mesh.position.x, p.mesh.position.z);
        if (dDist < 0.85 && p.mesh.position.y > 0.3 && p.mesh.position.y < 2.5) {
          const fakeWeapon = p.type === "tennis" ? WEAPONS[4] : WEAPONS[5];
          this.hitDummy(fakeWeapon, { x: p.vx > 0 ? 1 : -1, z: p.vz > 0 ? 1 : -1 });
          p.life = 0; // Destroy projectile upon impact
        }
      }

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.projectiles.splice(i, 1);
      }
    }

    // 9. Update Floating Comic Text Sprites
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= delta;
      ft.sprite.position.y += ft.vy * delta;
      ft.sprite.material.opacity = Math.max(0, ft.life / ft.maxLife);

      if (ft.life <= 0) {
        this.scene.remove(ft.sprite);
        this.floatingTexts.splice(i, 1);
      }
    }

    // 10. Update Impact Particles & Confetti
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.life -= delta;
      pt.mesh.position.x += pt.vx * delta;
      pt.mesh.position.y += pt.vy * delta;
      pt.mesh.position.z += pt.vz * delta;

      if (pt.rotX) pt.mesh.rotation.x += pt.rotX * delta;
      if (pt.rotY) pt.mesh.rotation.y += pt.rotY * delta;

      pt.vy += (pt.gravity || -9.8) * delta;

      if (pt.life <= 0) {
        this.scene.remove(pt.mesh);
        this.particles.splice(i, 1);
      }
    }
  }
}
