import * as THREE from "three";
import { sound } from "../Game/soundEngine";
import { INTERACTABLES } from "../Game/gameData";

// Expanded 3D Citadel World Configuration (260x260)
export const WORLD_3D = {
  size: 260,
  spawn: { x: 0, y: 0, z: 8 },
  landmarks: {
    citadel: { x: 0, z: -10, label: "About Sarthak", icon: "👑", id: "sarthak_avatar", title: "About Sarthak", subtitle: "AI & Full-Stack Architect", color: "#f59e0b" },
    projects: { x: 0, z: -88, label: "Projects & SolveSphere", icon: "🛠️", id: "proj_solvesphere", title: "Projects Archive", subtitle: "SolveSphere SIH-26043 & Apps", color: "#ef4444" },
    experience: { x: -88, z: -15, label: "Experience & Internships", icon: "💼", id: "yuga_yatra_master", title: "Experience Guild", subtitle: "Yuga Yatra SWE Guild", color: "#f59e0b" },
    skills: { x: 88, z: -15, label: "Technical Skills", icon: "⚡", id: "skill_altar", title: "Spire of Skills", subtitle: "AI/ML, React, Python, Node", color: "#10b981" },
    education: { x: -75, z: 75, label: "Education & Resume", icon: "🎓", id: "archive_tome", title: "Grand Archive", subtitle: "MITS & IIT Roorkee", color: "#8b5cf6" },
    contact: { x: 75, z: 75, label: "Contact & Socials", icon: "📬", id: "raven_eyrie", title: "Raven Eyrie", subtitle: "Email, GitHub, LinkedIn", color: "#06b6d4" },
    boss: { x: 0, z: -115, label: "Dragon Boss (Bonus RPG)", icon: "🐲", id: "dragon_boss_altar", title: "Glacial Arena", subtitle: "Viserion Boss Battle", color: "#ef4444" },
  },
};

// 27 Total Enemies: 1 Grand Boss + 2 Elite Guardians + 24 Diverse Roaming Hostiles
export const INITIAL_MONSTERS = [
  // GRAND BOSS: Viserion the Glacial Dragon (North Boss Arena at 0, -115)
  {
    id: "boss_dragon",
    name: "Viserion the Glacial Scourge",
    maxHp: 360,
    hp: 360,
    speed: 7.0,
    attackPower: 22,
    x: 0,
    y: 3.5,
    z: -115,
    type: "boss",
    isBoss: true,
  },

  // 2 Elite Guardians guarding the Skills Altar (East wing: x: 88, z: -15)
  { id: "guardian_bug", name: "Altar Bug Fiend", maxHp: 90, hp: 90, speed: 8.0, attackPower: 10, x: 82, y: 0, z: -18, type: "bug", isGuardian: true },
  { id: "guardian_drake", name: "Altar Glitch Drake", maxHp: 110, hp: 110, speed: 9.0, attackPower: 14, x: 94, y: 1.5, z: -10, type: "drake", isGuardian: true },

  // 6 Frost Wights in the snowy North (z: -45 to -105)
  { id: "wight_1", name: "Frost Wight Stalker", maxHp: 50, hp: 50, speed: 9.5, attackPower: 8, x: -35, y: 0, z: -60, type: "wight" },
  { id: "wight_2", name: "Frost Wight Hunter", maxHp: 55, hp: 55, speed: 9.0, attackPower: 8, x: 35, y: 0, z: -65, type: "wight" },
  { id: "wight_3", name: "Ice Walker", maxHp: 65, hp: 65, speed: 8.5, attackPower: 10, x: -20, y: 0, z: -95, type: "wight" },
  { id: "wight_4", name: "Glacial Revenant", maxHp: 70, hp: 70, speed: 8.0, attackPower: 12, x: 25, y: 0, z: -95, type: "wight" },
  { id: "wight_5", name: "Frost Wight Scout", maxHp: 45, hp: 45, speed: 10.0, attackPower: 7, x: -55, y: 0, z: -80, type: "wight" },
  { id: "wight_6", name: "Northern Wight", maxHp: 50, hp: 50, speed: 9.2, attackPower: 8, x: 55, y: 0, z: -80, type: "wight" },

  // 6 Bug Fiends in the Western Wilderness (x: -40 to -115, z: -40 to 40)
  { id: "bug_1", name: "Syntax Bug", maxHp: 45, hp: 45, speed: 8.0, attackPower: 6, x: -65, y: 0, z: -35, type: "bug" },
  { id: "bug_2", name: "Memory Leak Bug", maxHp: 60, hp: 60, speed: 7.5, attackPower: 9, x: -105, y: 0, z: -10, type: "bug" },
  { id: "bug_3", name: "NullPointer Fiend", maxHp: 50, hp: 50, speed: 8.5, attackPower: 7, x: -80, y: 0, z: 25, type: "bug" },
  { id: "bug_4", name: "Deadlock Crawler", maxHp: 65, hp: 65, speed: 7.0, attackPower: 10, x: -110, y: 0, z: 35, type: "bug" },
  { id: "bug_5", name: "Race Condition Bug", maxHp: 40, hp: 40, speed: 10.5, attackPower: 6, x: -45, y: 0, z: -5, type: "bug" },
  { id: "bug_6", name: "Stack Overflow Fiend", maxHp: 75, hp: 75, speed: 7.2, attackPower: 11, x: -95, y: 0, z: -40, type: "bug" },

  // 6 Glitch Drakes flying above Eastern Peaks (x: 40 to 115, z: -60 to 45)
  { id: "drake_1", name: "Glitch Wyvern", maxHp: 70, hp: 70, speed: 9.0, attackPower: 10, x: 60, y: 1.5, z: -45, type: "drake" },
  { id: "drake_2", name: "Fire Sprite Drake", maxHp: 65, hp: 65, speed: 9.5, attackPower: 9, x: 105, y: 1.5, z: -35, type: "drake" },
  { id: "drake_3", name: "Cinder Drake", maxHp: 80, hp: 80, speed: 8.5, attackPower: 12, x: 70, y: 1.5, z: 15, type: "drake" },
  { id: "drake_4", name: "Crimson Wyrm", maxHp: 85, hp: 85, speed: 8.8, attackPower: 13, x: 110, y: 1.5, z: 25, type: "drake" },
  { id: "drake_5", name: "Volt Wyvern", maxHp: 60, hp: 60, speed: 10.0, attackPower: 8, x: 45, y: 1.5, z: 35, type: "drake" },
  { id: "drake_6", name: "Ash Dragon", maxHp: 95, hp: 95, speed: 8.0, attackPower: 14, x: 95, y: 1.5, z: -60, type: "drake" },

  // 6 Shadow Wraiths in the Southern Ancient Ruins (z: 40 to 115)
  { id: "wraith_1", name: "Void Phantom", maxHp: 55, hp: 55, speed: 8.5, attackPower: 9, x: -40, y: 1.2, z: 65, type: "wraith" },
  { id: "wraith_2", name: "Shadow Sorcerer", maxHp: 60, hp: 60, speed: 8.0, attackPower: 11, x: 40, y: 1.2, z: 65, type: "wraith" },
  { id: "wraith_3", name: "Nether Shade", maxHp: 50, hp: 50, speed: 9.0, attackPower: 8, x: 0, y: 1.2, z: 95, type: "wraith" },
  { id: "wraith_4", name: "Crypt Spectre", maxHp: 65, hp: 65, speed: 8.2, attackPower: 10, x: -65, y: 1.2, z: 105, type: "wraith" },
  { id: "wraith_5", name: "Abyssal Horror", maxHp: 80, hp: 80, speed: 7.5, attackPower: 13, x: 65, y: 1.2, z: 105, type: "wraith" },
  { id: "wraith_6", name: "Eclipse Banshee", maxHp: 55, hp: 55, speed: 9.5, attackPower: 9, x: 15, y: 1.2, z: 75, type: "wraith" },
];

export class ThreeGameEngine {
  constructor(container, options = {}) {
    this.container = container;
    this.options = options;
    this.houseTheme = options.houseTheme || "stark";
    this.onInteract = options.onInteract || (() => {});
    this.onMonsterKill = options.onMonsterKill || (() => {});
    this.onSkillsUnlocked = options.onSkillsUnlocked || (() => {});
    this.onPlayerMove = options.onPlayerMove || (() => {});
    this.onRadarUpdate = options.onRadarUpdate || null;
    this.onPromptChange = options.onPromptChange || null;
    this.onStatsChange = options.onStatsChange || null;
    this.onLockedNotice = options.onLockedNotice || null;
    this.onLevelUp = options.onLevelUp || null;

    this.prevActiveInteractable = null;
    this.miniMapTimer = 0;
    this.statsTimer = 0;

    this.width = container.clientWidth || window.innerWidth;
    this.height = container.clientHeight || window.innerHeight;

    // Core Three.js Setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x090d19);
    this.scene.fog = new THREE.FogExp2(0x090d19, 0.007);

    this.camera = new THREE.PerspectiveCamera(50, this.width / this.height, 0.1, 450);
    this.camera.position.set(0, 14, 24);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Camera follow offset & 3D orbit rotation (supports full pitch for looking up at the sky!)
    this.cameraYaw = 0;
    this.cameraPitch = 0.38; // Elevation angle (negative = looking up at sky, positive = looking down)
    this.cameraDist = 15.0;  // Camera distance behind player
    this.isDragging = false;
    this.prevMouseX = 0;
    this.prevMouseY = 0;

    // Advanced Player RPG Stats State
    this.player = {
      x: WORLD_3D.spawn.x,
      y: 0,
      z: WORLD_3D.spawn.z,
      rotY: Math.PI,
      speed: 13,
      runSpeed: 21,
      hp: 100,
      maxHp: 100,
      mana: 100,
      maxMana: 100,
      exp: 0,
      maxExp: 100,
      level: 1,
      gold: 0,
      comboCount: 0,
      comboTimer: 0,
      isMoving: false,
      isAttacking: false,
      isSpinAttacking: false,
      isDashing: false,
      dashTimer: 0,
      dashCooldown: 0,
      dashDir: { x: 0, z: 1 },
      attackTimer: 0,
      attackCooldown: 0,
      spinTimer: 0,
      fireballCooldown: 0,
      hitFlash: 0,
      stepCycle: 0,
    };

    // Deep clone monster roster with runtime properties
    this.monsters = INITIAL_MONSTERS.map((m) => ({
      ...m,
      rotY: Math.random() * Math.PI * 2,
      isDead: false,
      hitFlash: 0,
      attackCooldown: Math.random() * 1.5,
      wanderTimer: Math.random() * 3,
      wanderAngle: Math.random() * Math.PI * 2,
      originX: m.x,
      originZ: m.z,
      specialTimer: Math.random() * 3,
    }));

    this.skillsUnlocked = false;
    this.keys = {};
    this.clock = new THREE.Clock();
    this.particles = [];
    this.projectiles = [];
    this.lootItems = [];
    this.floatingTexts = [];
    this.landmarkBanners = [];
    this.groundRings = [];
    this.driftingClouds = [];
    this.torchFlames = [];
    this.torchLights = [];
    this.fountainParticles = [];
    this.waterSurface = null;
    this.hitFreezeTimer = 0;
    this.playerTurnVelocity = 0;
    this.prevPlayerRotY = 0;
    this.footstepTimer = 0;
    this.activeInteractable = null;

    // Bindings
    this.handleResize = this.handleResize.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.handleWheel = this.handleWheel.bind(this);
    this.loop = this.loop.bind(this);

    this.buildWorld();
    this.buildSoldier();
    this.buildMonsters();
    this.initEvents();

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
    this.container.addEventListener("wheel", this.handleWheel, { passive: false });
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
    this.container.removeEventListener("wheel", this.handleWheel);
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

    // Standard Attack (Combo chain): Space, J
    if (e.key === " " || k === "j") {
      this.attack();
    }

    // Special Whirlwind Spin Attack: Q, K
    if (k === "q" || k === "k") {
      this.spinAttack();
    }

    // Magic Fireball Spell: R or F
    if (k === "r" || k === "f") {
      this.castFireball();
    }

    // Dragon Dash / Dodge Roll: Shift
    if (k === "shift") {
      this.dash();
    }

    // Interact: E or Enter
    if (k === "e" || e.key === "Enter") {
      this.triggerInteraction();
    }
  }

  handleKeyUp(e) {
    this.keys[e.key.toLowerCase()] = false;
  }

  handlePointerDown(e) {
    if (e.button === 0) {
      this.isDragging = true;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
      this.pointerDownX = e.clientX;
      this.pointerDownY = e.clientY;
      this.dragDist = 0;
    } else if (e.button === 2) {
      // Right-click performs spin attack
      this.spinAttack();
    }
  }

  handlePointerMove(e) {
    if (this.isDragging) {
      const deltaX = e.clientX - this.prevMouseX;
      const deltaY = e.clientY - this.prevMouseY;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
      this.dragDist += Math.hypot(deltaX, deltaY);
      this.cameraYaw -= deltaX * 0.006;
      // Moving mouse UP tilts camera UP towards the sky; moving mouse DOWN tilts towards top-down ground view
      this.cameraPitch = Math.max(-0.75, Math.min(1.35, this.cameraPitch + deltaY * 0.005));
    }
  }

  handleWheel(e) {
    if (this.options && this.options.isEmbedded) {
      // In embedded website view, do not trap page scroll unless Ctrl or Meta is held
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        this.cameraDist = Math.max(5.0, Math.min(32.0, this.cameraDist + e.deltaY * 0.015));
      }
      return;
    }
    e.preventDefault();
    // Zoom in or out smoothly with mouse scroll wheel
    this.cameraDist = Math.max(5.0, Math.min(32.0, this.cameraDist + e.deltaY * 0.015));
  }

  toggleSkyView() {
    if (this.cameraPitch < -0.2) {
      // Return to normal 3rd-person gameplay angle
      this.cameraPitch = 0.38;
      this.cameraDist = 15.0;
    } else {
      // Look directly up into the stars, celestial moon & sky beacons!
      this.cameraPitch = -0.68;
      this.cameraDist = 12.0;
    }
  }

  handlePointerUp(e) {
    if (e.button === 0) {
      // If user clicked without dragging (drag distance < 7px), trigger primary weapon attack!
      if (this.dragDist < 7) {
        this.attack();
      }
    }
    this.isDragging = false;
  }

  setJoystickInput(dx, dy) {
    this.joystickInput = { dx, dy };
  }

  // 1. BUILD EXPANDED 3D REALM (260x260) WITH BOSS ARENA, TREES, ROADS & BRAZIERS
  buildWorld() {
    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.72);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffedd5, 1.4);
    sunLight.position.set(70, 90, 70);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 280;
    const d = 140;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    this.scene.add(sunLight);

    // Rim light for atmospheric edge highlights
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.65);
    rimLight.position.set(-70, 50, -70);
    this.scene.add(rimLight);

    // Atmospheric Hemisphere Light (Soft Sky Blue & Warm Earth Bounce)
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x1c1917, 0.65);
    this.scene.add(hemiLight);

    // Drifting Volumetric Cloud Billboards in High Sky
    for (let c = 0; c < 18; c++) {
      const cloudGroup = new THREE.Group();
      const cloudMat = new THREE.MeshBasicMaterial({
        color: 0x94a3b8,
        transparent: true,
        opacity: 0.18 + Math.random() * 0.12,
        depthWrite: false,
      });

      const puffCount = 3 + Math.floor(Math.random() * 3);
      for (let p = 0; p < puffCount; p++) {
        const puffGeo = new THREE.SphereGeometry(7 + Math.random() * 5, 8, 8);
        const puff = new THREE.Mesh(puffGeo, cloudMat);
        puff.position.set((p - puffCount / 2) * 8 + (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 2.5, (Math.random() - 0.5) * 6);
        puff.scale.set(1.4, 0.35, 1.0);
        cloudGroup.add(puff);
      }

      const cx = (Math.random() - 0.5) * WORLD_3D.size * 1.2;
      const cy = 75 + Math.random() * 35;
      const cz = (Math.random() - 0.5) * WORLD_3D.size * 1.2;
      cloudGroup.position.set(cx, cy, cz);
      this.scene.add(cloudGroup);
      this.driftingClouds.push({
        group: cloudGroup,
        speedX: 0.6 + Math.random() * 1.4,
        speedZ: (Math.random() - 0.5) * 0.3,
      });
    }

    // 3D Celestial Skybox: 2,200 Star Particles & Glowing Moon for breathtaking sky viewing
    const starCount = 2200;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const starPalette = [
      new THREE.Color(0xffffff), // Pure white
      new THREE.Color(0x93c5fd), // Ice blue
      new THREE.Color(0xfef08a), // Soft gold
      new THREE.Color(0xc084fc), // Soft purple
      new THREE.Color(0x67e8f9), // Bright cyan
    ];

    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 0.85 + 0.15); // Upper hemisphere only
      const radius = 130 + Math.random() * 150;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = Math.max(30, radius * Math.cos(phi));
      const z = radius * Math.sin(phi) * Math.sin(theta);

      starPositions[i * 3] = x;
      starPositions[i * 3 + 1] = y;
      starPositions[i * 3 + 2] = z;

      const col = starPalette[Math.floor(Math.random() * starPalette.length)];
      starColors[i * 3] = col.r;
      starColors[i * 3 + 1] = col.g;
      starColors[i * 3 + 2] = col.b;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    this.scene.add(starPoints);

    // Glowing Celestial Moon
    const moonGroup = new THREE.Group();
    moonGroup.position.set(0, 150, -170);

    const moonGeo = new THREE.SphereGeometry(12, 32, 32);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    moonGroup.add(moonMesh);

    const haloGeo = new THREE.SphereGeometry(21, 32, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.28,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    moonGroup.add(haloMesh);

    const moonLight = new THREE.DirectionalLight(0x93c5fd, 0.45);
    moonLight.position.copy(moonGroup.position);
    this.scene.add(moonLight);
    this.scene.add(moonGroup);

    // Large Stone Tiled Ground (260x260)
    const floorGeo = new THREE.PlaneGeometry(WORLD_3D.size, WORLD_3D.size, 48, 48);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x111928,
      roughness: 0.88,
      metalness: 0.12,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Cobblestone Highway Roads
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.75 });
    
    // North Road to Arcane Forge & Dragon Arena
    const roadN = new THREE.Mesh(new THREE.PlaneGeometry(6, 120), roadMat);
    roadN.rotation.x = -Math.PI / 2;
    roadN.position.set(0, 0.05, -65);
    roadN.receiveShadow = true;
    this.scene.add(roadN);

    // South Road to Grand Gates
    const roadS = new THREE.Mesh(new THREE.PlaneGeometry(6, 90), roadMat);
    roadS.rotation.x = -Math.PI / 2;
    roadS.position.set(0, 0.05, 45);
    roadS.receiveShadow = true;
    this.scene.add(roadS);

    // West Road to War Council
    const roadW = new THREE.Mesh(new THREE.PlaneGeometry(90, 6), roadMat);
    roadW.rotation.x = -Math.PI / 2;
    roadW.position.set(-45, 0.05, -12);
    roadW.receiveShadow = true;
    this.scene.add(roadW);

    // East Road to Skills Lair
    const roadE = new THREE.Mesh(new THREE.PlaneGeometry(90, 6), roadMat);
    roadE.rotation.x = -Math.PI / 2;
    roadE.position.set(45, 0.05, -12);
    roadE.receiveShadow = true;
    this.scene.add(roadE);

    // Center Courtyard Circular Dais
    const daisGeo = new THREE.CylinderGeometry(20, 21, 0.4, 32);
    const daisMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7, metalness: 0.25 });
    const dais = new THREE.Mesh(daisGeo, daisMat);
    dais.position.set(0, 0.2, -5);
    dais.receiveShadow = true;
    this.scene.add(dais);

    // Sacred Fountain of Wisdom at Courtyard Center (0, 0, -5)
    const fountainGroup = new THREE.Group();
    fountainGroup.position.set(0, 0.4, -5);

    const basinGeo = new THREE.CylinderGeometry(5.2, 5.8, 1.1, 24);
    const basinMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7, metalness: 0.3 });
    const basin = new THREE.Mesh(basinGeo, basinMat);
    basin.position.y = 0.55;
    basin.castShadow = true;
    basin.receiveShadow = true;
    fountainGroup.add(basin);

    const waterGeo = new THREE.CylinderGeometry(4.8, 4.8, 0.1, 24);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0369a1,
      emissiveIntensity: 0.35,
      roughness: 0.08,
      metalness: 0.8,
      transparent: true,
      opacity: 0.85,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.y = 0.95;
    fountainGroup.add(waterMesh);
    this.waterSurface = waterMesh;

    const spoutSpire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.75, 2.6, 12),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 })
    );
    spoutSpire.position.y = 1.9;
    spoutSpire.castShadow = true;
    fountainGroup.add(spoutSpire);

    const spoutBowl = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 0.4, 0.5, 16),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 })
    );
    spoutBowl.position.y = 3.2;
    spoutBowl.castShadow = true;
    fountainGroup.add(spoutBowl);

    const fountainLight = new THREE.PointLight(0x38bdf8, 1.8, 18);
    fountainLight.position.set(0, 3.6, 0);
    fountainGroup.add(fountainLight);
    this.scene.add(fountainGroup);

    // Medieval Roadside Torch Posts along North, South, East, West avenues
    const torchPositions = [
      { x: -5, z: -25 }, { x: 5, z: -25 },
      { x: -5, z: -55 }, { x: 5, z: -55 },
      { x: -25, z: -9 }, { x: -55, z: -9 },
      { x: 25, z: -9 }, { x: 55, z: -9 },
      { x: -5, z: 25 }, { x: 5, z: 25 },
      { x: -5, z: 55 }, { x: 5, z: 55 },
    ];

    const torchPostGeo = new THREE.CylinderGeometry(0.16, 0.22, 3.8, 8);
    const torchPostMat = new THREE.MeshStandardMaterial({ color: 0x271c19, roughness: 0.9 });
    const flameGeo = new THREE.ConeGeometry(0.24, 0.65, 8);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });

    torchPositions.forEach((tp) => {
      const torchGroup = new THREE.Group();
      torchGroup.position.set(tp.x, 0, tp.z);

      const post = new THREE.Mesh(torchPostGeo, torchPostMat);
      post.position.y = 1.9;
      post.castShadow = true;
      torchGroup.add(post);

      const cage = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.2, 0.4, 8),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 })
      );
      cage.position.y = 3.8;
      torchGroup.add(cage);

      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.position.y = 4.15;
      torchGroup.add(flame);
      this.torchFlames.push(flame);

      const tLight = new THREE.PointLight(0xf59e0b, 1.4, 16);
      tLight.position.set(0, 4.2, 0);
      torchGroup.add(tLight);
      this.torchLights.push(tLight);

      this.scene.add(torchGroup);
    });

    // 24 Ancient Mossy Boulders & Megaliths scattered across terrain
    const boulderPositions = [
      { x: -22, z: -35, s: 2.2 }, { x: -44, z: -68, s: 3.1 }, { x: -82, z: -45, s: 2.6 },
      { x: 22, z: -35, s: 2.0 }, { x: 44, z: -68, s: 3.4 }, { x: 82, z: -45, s: 2.5 },
      { x: -28, z: 42, s: 2.8 }, { x: -62, z: 65, s: 3.5 }, { x: -92, z: 38, s: 2.2 },
      { x: 28, z: 42, s: 2.4 }, { x: 62, z: 65, s: 3.0 }, { x: 92, z: 38, s: 2.7 },
      { x: -18, z: 92, s: 3.2 }, { x: 18, z: 92, s: 2.9 }, { x: -48, z: -105, s: 3.6 },
      { x: 48, z: -105, s: 3.3 }, { x: -115, z: -40, s: 2.4 }, { x: 115, z: -40, s: 2.5 },
      { x: -95, z: 95, s: 3.1 }, { x: 95, z: 95, s: 3.0 }, { x: 0, z: -100, s: 2.8 },
      { x: 0, z: 100, s: 2.5 }, { x: -75, z: 0, s: 2.9 }, { x: 75, z: 0, s: 2.7 },
    ];

    const boulderMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85, metalness: 0.15 });
    const mossMat = new THREE.MeshStandardMaterial({ color: 0x1e3a5f, roughness: 0.9 });

    boulderPositions.forEach((bp, bIdx) => {
      const bGeo = new THREE.DodecahedronGeometry(bp.s, 1);
      const bMesh = new THREE.Mesh(bGeo, bIdx % 2 === 0 ? boulderMat : mossMat);
      bMesh.position.set(bp.x, bp.s * 0.45, bp.z);
      bMesh.rotation.set(Math.sin(bIdx) * 2, Math.cos(bIdx) * 2, Math.sin(bIdx * 1.5));
      bMesh.scale.set(1.0 + (bIdx % 3) * 0.15, 0.75, 1.1);
      bMesh.castShadow = true;
      bMesh.receiveShadow = true;
      this.scene.add(bMesh);
    });

    // Boss Arena Ring in Far North at (0, -115)
    const bossRingGeo = new THREE.RingGeometry(18, 22, 32);
    const bossRingMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0x7f1d1d, side: THREE.DoubleSide });
    const bossRing = new THREE.Mesh(bossRingGeo, bossRingMat);
    bossRing.rotation.x = -Math.PI / 2;
    bossRing.position.set(0, 0.08, -115);
    this.scene.add(bossRing);

    // Outer Fortress Castle Walls at Boundary (±130)
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x1a2333, roughness: 0.9 });
    const halfSize = WORLD_3D.size / 2;
    const wallGeoH = new THREE.BoxGeometry(WORLD_3D.size, 10, 5);
    const wallGeoV = new THREE.BoxGeometry(5, 10, WORLD_3D.size);

    const wallNorth = new THREE.Mesh(wallGeoH, wallMat);
    wallNorth.position.set(0, 5, -halfSize);
    wallNorth.castShadow = true;
    this.scene.add(wallNorth);

    const wallSouth = new THREE.Mesh(wallGeoH, wallMat);
    wallSouth.position.set(0, 5, halfSize);
    wallSouth.castShadow = true;
    this.scene.add(wallSouth);

    const wallWest = new THREE.Mesh(wallGeoV, wallMat);
    wallWest.position.set(-halfSize, 5, 0);
    wallWest.castShadow = true;
    this.scene.add(wallWest);

    const wallEast = new THREE.Mesh(wallGeoV, wallMat);
    wallEast.position.set(halfSize, 5, 0);
    wallEast.castShadow = true;
    this.scene.add(wallEast);

    // 4 Corner Great Watchtowers with Beacon Fires
    const cornerPositions = [
      { x: -halfSize + 4, z: -halfSize + 4 },
      { x: halfSize - 4, z: -halfSize + 4 },
      { x: -halfSize + 4, z: halfSize - 4 },
      { x: halfSize - 4, z: halfSize - 4 },
    ];

    this.brazierLights = [];

    cornerPositions.forEach((pos) => {
      const towerGeo = new THREE.CylinderGeometry(4.5, 5.5, 20, 16);
      const tower = new THREE.Mesh(towerGeo, wallMat);
      tower.position.set(pos.x, 10, pos.z);
      tower.castShadow = true;
      tower.receiveShadow = true;
      this.scene.add(tower);

      const bBowl = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 1.2, 1.5, 12), new THREE.MeshStandardMaterial({ color: 0xd97706 }));
      bBowl.position.set(pos.x, 20.75, pos.z);
      this.scene.add(bBowl);

      const pLight = new THREE.PointLight(0xf59e0b, 2.0, 24);
      pLight.position.set(pos.x, 22.5, pos.z);
      this.scene.add(pLight);
      this.brazierLights.push(pLight);
    });

    // 16 Flaming Pillars along the Great Roads
    const pillarPositions = [
      { x: -16, z: -16 }, { x: 16, z: -16 }, { x: -16, z: 16 }, { x: 16, z: 16 },
      { x: -45, z: -20 }, { x: -45, z: -4 }, { x: -75, z: -20 }, { x: -75, z: -4 },
      { x: 45, z: -20 }, { x: 45, z: -4 }, { x: 75, z: -20 }, { x: 75, z: -4 },
      { x: -6, z: -45 }, { x: 6, z: -45 }, { x: -6, z: -75 }, { x: 6, z: -75 },
    ];

    pillarPositions.forEach((pos) => {
      const pillarGeo = new THREE.CylinderGeometry(1.2, 1.5, 7, 12);
      const pillar = new THREE.Mesh(pillarGeo, wallMat);
      pillar.position.set(pos.x, 3.5, pos.z);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      this.scene.add(pillar);

      const bowlGeo = new THREE.CylinderGeometry(1.6, 0.8, 1, 12);
      const bowlMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.6, roughness: 0.4 });
      const bowl = new THREE.Mesh(bowlGeo, bowlMat);
      bowl.position.set(pos.x, 7.2, pos.z);
      this.scene.add(bowl);

      const pLight = new THREE.PointLight(0xf59e0b, 2.0, 24);
      pLight.position.set(pos.x, 8.5, pos.z);
      this.scene.add(pLight);
      this.brazierLights.push(pLight);
    });

    // 42 Procedural 3D Pine & Winter Trees across Wilderness with Rich 4-Tier Needle Canopies
    const treePositions = [
      { x: -30, z: -40 }, { x: -50, z: -55 }, { x: -70, z: -60 }, { x: -20, z: -75 },
      { x: -60, z: -95 }, { x: -90, z: -70 }, { x: -110, z: -90 }, { x: -40, z: -110 },
      { x: 30, z: -40 }, { x: 50, z: -55 }, { x: 70, z: -60 }, { x: 20, z: -75 },
      { x: 60, z: -95 }, { x: 90, z: -70 }, { x: 110, z: -90 }, { x: 40, z: -110 },
      { x: -35, z: 35 }, { x: -55, z: 50 }, { x: -95, z: 55 }, { x: -25, z: 85 },
      { x: -85, z: 95 }, { x: -105, z: 75 }, { x: -50, z: 105 }, { x: -115, z: 105 },
      { x: 35, z: 35 }, { x: 55, z: 50 }, { x: 95, z: 55 }, { x: 25, z: 85 },
      { x: 85, z: 95 }, { x: 105, z: 75 }, { x: 50, z: 105 }, { x: 115, z: 105 },
      { x: -110, z: 0 }, { x: 110, z: 0 }, { x: 0, z: -115 }, { x: 0, z: 115 },
      { x: -15, z: -45 }, { x: 15, z: -45 }, { x: -45, z: -15 }, { x: 45, z: -15 },
      { x: -65, z: 20 }, { x: 65, z: 20 },
    ];

    const trunkGeo = new THREE.CylinderGeometry(0.55, 0.85, 4.5, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x381e14, roughness: 0.9 });
    const foliageMat1 = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.8 });
    const foliageMat2 = new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.75 });
    const snowFoliageMat = new THREE.MeshStandardMaterial({ color: 0x1e3a5f, roughness: 0.7 });

    treePositions.forEach((pos, tIdx) => {
      const treeGroup = new THREE.Group();
      const scale = 0.85 + (tIdx % 4) * 0.15;
      treeGroup.position.set(pos.x, 0, pos.z);
      treeGroup.scale.set(scale, scale, scale);
      treeGroup.rotation.y = (tIdx * 1.7);

      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 2.25;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      const mat = pos.z < 0 ? snowFoliageMat : (tIdx % 2 === 0 ? foliageMat1 : foliageMat2);

      const cone1 = new THREE.Mesh(new THREE.ConeGeometry(3.6, 5.0, 8), mat);
      cone1.position.y = 5.5;
      cone1.castShadow = true;
      treeGroup.add(cone1);

      const cone2 = new THREE.Mesh(new THREE.ConeGeometry(2.8, 4.4, 8), mat);
      cone2.position.y = 8.4;
      cone2.castShadow = true;
      treeGroup.add(cone2);

      const cone3 = new THREE.Mesh(new THREE.ConeGeometry(1.9, 3.6, 8), mat);
      cone3.position.y = 11.0;
      cone3.castShadow = true;
      treeGroup.add(cone3);

      const cone4 = new THREE.Mesh(new THREE.ConeGeometry(1.0, 2.5, 8), mat);
      cone4.position.y = 13.0;
      cone4.castShadow = true;
      treeGroup.add(cone4);

      this.scene.add(treeGroup);
    });

    this.buildLandmarkMeshes();
  }

  createLandmarkHoloBanner(title, subtitle, icon, colorHex, x, y, z) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 140;
    const ctx = canvas.getContext("2d");

    // Dark pill background with glowing border
    ctx.fillStyle = "rgba(7, 12, 24, 0.92)";
    ctx.strokeStyle = colorHex;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(8, 8, 496, 124, 24);
    ctx.fill();
    ctx.stroke();

    // Subtle inner gradient glow
    const grad = ctx.createLinearGradient(0, 0, 512, 0);
    grad.addColorStop(0, colorHex + "33");
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.fill();

    // Main Title with Icon
    ctx.font = "bold 30px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.shadowColor = colorHex;
    ctx.shadowBlur = 10;
    ctx.fillText(`${icon} ${title}`, 24, 56);

    // Subtitle
    ctx.font = "bold 20px sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.shadowBlur = 0;
    ctx.fillText(subtitle, 26, 96);

    // Press [E] Action Tag
    ctx.font = "bold 18px monospace";
    ctx.fillStyle = "#facc15";
    ctx.textAlign = "right";
    ctx.fillText("[E] Inspect", 486, 96);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.set(x, y, z);
    sprite.scale.set(17.5, 4.8, 1);
    this.scene.add(sprite);

    this.landmarkBanners.push({
      sprite,
      baseY: y,
      speed: 1.8 + Math.random() * 0.4,
    });
  }

  createBeaconBeam(colorHex, x, z) {
    // Vertical Light Shaft
    const beamGeo = new THREE.CylinderGeometry(0.8, 1.8, 80, 16);
    const beamMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(colorHex),
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(x, 40, z);
    this.scene.add(beam);

    // Pulsing Ground Ring
    const ringGeo = new THREE.RingGeometry(3.5, 4.3, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(colorHex),
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, 0.15, z);
    this.scene.add(ring);

    this.groundRings.push({ ring, baseScale: 1.0 });
  }

  buildLandmarkMeshes() {
    this.shrineMeshes = [];

    // 1. Citadel Keep (About Sarthak)
    const dais = new THREE.Mesh(
      new THREE.CylinderGeometry(5.5, 6.2, 1.2, 16),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5, metalness: 0.4 })
    );
    dais.position.set(0, 0.6, -10);
    this.scene.add(dais);

    const holoCore = new THREE.Mesh(
      new THREE.OctahedronGeometry(1.8, 0),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, roughness: 0.2, wireframe: true })
    );
    holoCore.position.set(0, 4.0, -10);
    this.scene.add(holoCore);
    this.shrineMeshes.push({ mesh: holoCore, id: "sarthak_avatar", rotSpeed: 0.02 });

    // 2. War Council (Experience) - West wing at (-88, -15)
    const warTable = new THREE.Mesh(
      new THREE.BoxGeometry(8, 1.5, 4.5),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 })
    );
    warTable.position.set(-88, 0.75, -15);
    this.scene.add(warTable);
    const warBanner = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 6, 3),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0x92400e })
    );
    warBanner.position.set(-88, 4.5, -15);
    this.scene.add(warBanner);
    this.shrineMeshes.push({ mesh: warBanner, id: "yuga_yatra_master", rotSpeed: 0.01 });

    // 3. Arcane Forge (Featured Projects) - North wing at (0, -88)
    const forgePedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(4.5, 5.2, 1.5, 12),
      new THREE.MeshStandardMaterial({ color: 0x991b1b, metalness: 0.5, roughness: 0.5 })
    );
    forgePedestal.position.set(0, 0.75, -88);
    this.scene.add(forgePedestal);

    const forgeCrystal = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.2, 0),
      new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xb91c1c, wireframe: true })
    );
    forgeCrystal.position.set(0, 4.5, -88);
    this.scene.add(forgeCrystal);
    this.shrineMeshes.push({ mesh: forgeCrystal, id: "proj_solvesphere", rotSpeed: -0.02 });

    // 4. Skills Lair & Altar - East wing at (88, -15) (Guarded by Elite Monsters)
    const altarBase = new THREE.Mesh(
      new THREE.CylinderGeometry(6, 7, 1.4, 16),
      new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.6, metalness: 0.4 })
    );
    altarBase.position.set(88, 0.7, -15);
    this.scene.add(altarBase);

    this.skillCrystal = new THREE.Mesh(
      new THREE.DodecahedronGeometry(2.0, 0),
      new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x059669,
        roughness: 0.2,
        metalness: 0.5,
      })
    );
    this.skillCrystal.position.set(88, 4.2, -15);
    this.scene.add(this.skillCrystal);
    this.shrineMeshes.push({ mesh: this.skillCrystal, id: "skill_altar", rotSpeed: 0.025 });

    const domeGeo = new THREE.SphereGeometry(9.0, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    this.shieldDomeMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.35,
      wireframe: true,
      side: THREE.DoubleSide,
    });
    this.shieldDome = new THREE.Mesh(domeGeo, this.shieldDomeMat);
    this.shieldDome.position.set(88, 0, -15);
    this.scene.add(this.shieldDome);

    // 5. Grand Archive (Education) - South-West at (-75, 75)
    const archiveShelf = new THREE.Mesh(
      new THREE.BoxGeometry(7, 5, 2),
      new THREE.MeshStandardMaterial({ color: 0x5b21b6, roughness: 0.8 })
    );
    archiveShelf.position.set(-75, 2.5, 75);
    this.scene.add(archiveShelf);
    this.shrineMeshes.push({ mesh: archiveShelf, id: "archive_tome", rotSpeed: 0 });

    // 6. Raven Eyrie (Contact) - South-East at (75, 75)
    const ravenPerch = new THREE.Mesh(
      new THREE.CylinderGeometry(1.4, 2.0, 6, 8),
      new THREE.MeshStandardMaterial({ color: 0xbe185d, roughness: 0.6 })
    );
    ravenPerch.position.set(75, 3.0, 75);
    this.scene.add(ravenPerch);
    this.shrineMeshes.push({ mesh: ravenPerch, id: "raven_eyrie", rotSpeed: 0 });

    // Add 3D Holographic Title Banners & Beacons for each Portfolio Landmark
    this.createLandmarkHoloBanner("ABOUT SARTHAK", "AI & Full-Stack Architect", "👑", "#38bdf8", 0, 9.5, -10);
    this.createBeaconBeam("#38bdf8", 0, -10);

    this.createLandmarkHoloBanner("PROJECTS ARCHIVE", "SolveSphere SIH-26043 & Apps", "🛠️", "#ef4444", 0, 10.5, -88);
    this.createBeaconBeam("#ef4444", 0, -88);

    this.createLandmarkHoloBanner("EXPERIENCE & INTERNSHIPS", "Yuga Yatra SWE Guild", "💼", "#f59e0b", -88, 10.5, -15);
    this.createBeaconBeam("#f59e0b", -88, -15);

    this.createLandmarkHoloBanner("TECHNICAL SKILLS", "AI/ML, React, Node, Python", "⚡", "#10b981", 88, 10.5, -15);
    this.createBeaconBeam("#10b981", 88, -15);

    this.createLandmarkHoloBanner("EDUCATION & RESUME", "MITS & IIT Roorkee", "🎓", "#a855f7", -75, 10.5, 75);
    this.createBeaconBeam("#a855f7", -75, 75);

    this.createLandmarkHoloBanner("CONTACT & SOCIALS", "Email, LinkedIn, GitHub", "📬", "#06b6d4", 75, 10.5, 75);
    this.createBeaconBeam("#06b6d4", 75, 75);

    // Welcome Plaque at Spawn Portal (0, 0, 8)
    this.createLandmarkHoloBanner("SARTHAK JAIN BAJAJ", "Interactive 3D Portfolio Realm", "🌟", "#fbbf24", 0, 7.5, 8);
  }

  // 2. BUILD 3D ARMORED SOLDIER WARRIOR
  buildSoldier() {
    this.soldierGroup = new THREE.Group();
    this.soldierGroup.position.set(this.player.x, 0, this.player.z);

    const armorMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.8,
      roughness: 0.3,
    });
    const goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.7,
      roughness: 0.3,
    });

    // Torso
    const torsoGeo = new THREE.BoxGeometry(1.4, 1.7, 0.9);
    const torso = new THREE.Mesh(torsoGeo, armorMat);
    torso.position.y = 1.75;
    torso.castShadow = true;
    this.soldierGroup.add(torso);
    this.torso = torso;

    // Helmet
    const headGeo = new THREE.SphereGeometry(0.55, 12, 12);
    const head = new THREE.Mesh(headGeo, armorMat);
    head.position.y = 2.9;
    head.castShadow = true;
    this.soldierGroup.add(head);
    this.head = head;

    // Glowing Visor
    const visorGeo = new THREE.BoxGeometry(0.7, 0.14, 0.2);
    const visorMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 2.9, 0.46);
    this.soldierGroup.add(visor);

    // Helmet Crest
    const crestGeo = new THREE.BoxGeometry(0.15, 0.45, 0.9);
    const crest = new THREE.Mesh(crestGeo, goldTrimMat);
    crest.position.set(0, 3.4, 0);
    this.soldierGroup.add(crest);

    // Royal Cape
    const capeGeo = new THREE.PlaneGeometry(1.3, 1.9, 4, 4);
    this.capeMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      side: THREE.DoubleSide,
      roughness: 0.8,
    });
    this.cape = new THREE.Mesh(capeGeo, this.capeMat);
    this.cape.position.set(0, 1.7, -0.52);
    this.soldierGroup.add(this.cape);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.4, 1.2, 0.45);
    this.leftLeg = new THREE.Mesh(legGeo, armorMat);
    this.leftLeg.position.set(-0.38, 0.6, 0);
    this.leftLeg.castShadow = true;
    this.soldierGroup.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(legGeo, armorMat);
    this.rightLeg.position.set(0.38, 0.6, 0);
    this.rightLeg.castShadow = true;
    this.soldierGroup.add(this.rightLeg);

    // Left Arm + Shield
    const armGeo = new THREE.BoxGeometry(0.35, 1.1, 0.35);
    this.leftArm = new THREE.Mesh(armGeo, armorMat);
    this.leftArm.position.set(-1.0, 1.75, 0);
    this.leftArm.castShadow = true;

    const shieldGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.12, 16);
    const shieldMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 });
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    shield.rotation.z = Math.PI / 2;
    shield.position.set(-0.25, -0.2, 0.2);

    const shieldRim = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.06, 8, 16), goldTrimMat);
    shield.add(shieldRim);
    this.leftArm.add(shield);
    this.soldierGroup.add(this.leftArm);

    // Right Arm + Broadsword
    this.rightArm = new THREE.Mesh(armGeo, armorMat);
    this.rightArm.position.set(1.0, 1.75, 0);
    this.rightArm.castShadow = true;

    const swordBlade = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 2.3, 0.05),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.1 })
    );
    swordBlade.position.set(0, -0.8, 0.8);
    swordBlade.rotation.x = Math.PI / 4;

    const swordGuard = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.1, 0.15), goldTrimMat);
    swordGuard.position.set(0, 0.2, 0);
    swordBlade.add(swordGuard);
    this.rightArm.add(swordBlade);
    this.soldierGroup.add(this.rightArm);

    // 3D Curved Light Slash Arc Mesh with Additive Blending
    const slashGeo = new THREE.RingGeometry(1.8, 3.4, 18, 1, 0, Math.PI * 0.85);
    this.slashMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    this.slashMesh = new THREE.Mesh(slashGeo, this.slashMat);
    this.slashMesh.rotation.x = -Math.PI / 2;
    this.slashMesh.position.set(0, 1.4, 1.5);

    const slashCoreGeo = new THREE.RingGeometry(2.0, 2.7, 18, 1, 0, Math.PI * 0.85);
    this.slashCoreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    this.slashCoreMesh = new THREE.Mesh(slashCoreGeo, this.slashCoreMat);
    this.slashCoreMesh.position.z = 0.02;
    this.slashMesh.add(this.slashCoreMesh);
    this.soldierGroup.add(this.slashMesh);

    // 3D Whirlwind Spin Shockwave Ring
    const spinGeo = new THREE.RingGeometry(2.0, 8.5, 32);
    this.spinMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    this.spinMesh = new THREE.Mesh(spinGeo, this.spinMat);
    this.spinMesh.rotation.x = -Math.PI / 2;
    this.spinMesh.position.set(0, 0.3, 0);
    this.soldierGroup.add(this.spinMesh);

    this.scene.add(this.soldierGroup);
  }

  // 3. BUILD MONSTERS INCLUDING GRAND DRAGON BOSS
  buildMonsters() {
    this.monsterMeshes = [];

    this.monsters.forEach((data) => {
      const group = new THREE.Group();
      group.position.set(data.x, data.y, data.z);

      let mat;
      let wingL = null;
      let wingR = null;
      let legs = [];
      let orbs = [];

      // ARCHETYPE: GRAND DRAGON BOSS (VISERION)
      if (data.isBoss) {
        mat = new THREE.MeshStandardMaterial({
          color: 0x0284c7, // Cyan-Ice Dragon Scales
          roughness: 0.3,
          metalness: 0.7,
        });

        // Massive Dragon Torso
        const bBody = new THREE.Mesh(new THREE.ConeGeometry(3.0, 8.0, 12), mat);
        bBody.rotation.x = Math.PI / 2;
        bBody.position.y = 3.5;
        bBody.castShadow = true;
        group.add(bBody);

        // Long Neck & Horned Head
        const neck = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.8, 4.0, 8), mat);
        neck.rotation.x = -Math.PI / 4;
        neck.position.set(0, 5.5, 3.2);
        group.add(neck);

        const bHead = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.5, 2.8), mat);
        bHead.position.set(0, 7.2, 5.0);
        group.add(bHead);

        // Horns
        const hornMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 });
        const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.4, 2.5, 6), hornMat);
        hornL.rotation.x = -Math.PI / 3;
        hornL.position.set(-0.8, 8.5, 4.2);
        group.add(hornL);

        const hornR = new THREE.Mesh(new THREE.ConeGeometry(0.4, 2.5, 6), hornMat);
        hornR.rotation.x = -Math.PI / 3;
        hornR.position.set(0.8, 8.5, 4.2);
        group.add(hornR);

        // Glowing Blue Eyes
        const bEyeMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9 });
        const beL = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 6), bEyeMat);
        beL.position.set(-0.85, 7.6, 6.2);
        const beR = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 6), bEyeMat);
        beR.position.set(0.85, 7.6, 6.2);
        group.add(beL);
        group.add(beR);

        // Giant Wings
        const bossWingMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.9,
        });
        wingL = new THREE.Mesh(new THREE.PlaneGeometry(8, 4.5), bossWingMat);
        wingL.position.set(-5.5, 4.5, 0);
        wingL.rotation.y = Math.PI / 6;
        group.add(wingL);

        wingR = new THREE.Mesh(new THREE.PlaneGeometry(8, 4.5), bossWingMat);
        wingR.position.set(5.5, 4.5, 0);
        wingR.rotation.y = -Math.PI / 6;
        group.add(wingR);
      }

      // ARCHETYPE: BUG FIEND / CORRUPTED CRAWLER
      else if (data.type === "bug") {
        mat = new THREE.MeshStandardMaterial({
          color: data.isGuardian ? 0x991b1b : 0xdc2626,
          roughness: 0.4,
          metalness: 0.5,
        });
        const bugAbdomen = new THREE.Mesh(new THREE.SphereGeometry(1.4, 8, 8), mat);
        bugAbdomen.position.y = 1.2;
        bugAbdomen.scale.set(1, 0.8, 1.4);
        bugAbdomen.castShadow = true;
        group.add(bugAbdomen);

        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
        const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.25, 6, 6), eyeMat);
        eyeL.position.set(-0.45, 1.4, 1.3);
        const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.25, 6, 6), eyeMat);
        eyeR.position.set(0.45, 1.4, 1.3);
        group.add(eyeL);
        group.add(eyeR);

        const legMat = new THREE.MeshStandardMaterial({ color: 0x450a0a });
        [-0.8, 0.8].forEach((lx) => {
          [-0.5, 0.5].forEach((lz) => {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.0, 0.2), legMat);
            leg.position.set(lx, 0.5, lz);
            group.add(leg);
            legs.push(leg);
          });
        });
      }

      // ARCHETYPE: GLITCH DRAKE
      else if (data.type === "drake") {
        mat = new THREE.MeshStandardMaterial({
          color: data.isGuardian ? 0x581c87 : 0x7c3aed,
          roughness: 0.3,
          metalness: 0.6,
        });
        const drakeBody = new THREE.Mesh(new THREE.ConeGeometry(1.2, 3.2, 8), mat);
        drakeBody.rotation.x = Math.PI / 2;
        drakeBody.position.y = 1.6;
        drakeBody.castShadow = true;
        group.add(drakeBody);

        const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.6, 2.5, 6), mat);
        tail.rotation.x = Math.PI / 3;
        tail.position.set(0, 1.2, -2.4);
        group.add(tail);

        const drakeEyeMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });
        const dEyeL = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 6), drakeEyeMat);
        dEyeL.position.set(-0.4, 1.9, 1.2);
        const dEyeR = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 6), drakeEyeMat);
        dEyeR.position.set(0.4, 1.9, 1.2);
        group.add(dEyeL);
        group.add(dEyeR);

        const wingMat = new THREE.MeshStandardMaterial({
          color: 0x9333ea,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
        });
        wingL = new THREE.Mesh(new THREE.PlaneGeometry(3, 1.8), wingMat);
        wingL.position.set(-2, 1.8, 0);
        wingL.rotation.y = Math.PI / 8;
        group.add(wingL);

        wingR = new THREE.Mesh(new THREE.PlaneGeometry(3, 1.8), wingMat);
        wingR.position.set(2, 1.8, 0);
        wingR.rotation.y = -Math.PI / 8;
        group.add(wingR);
      }

      // ARCHETYPE: FROST WIGHT
      else if (data.type === "wight") {
        mat = new THREE.MeshStandardMaterial({
          color: 0xe0f2fe,
          roughness: 0.6,
          metalness: 0.3,
        });
        const skull = new THREE.Mesh(new THREE.SphereGeometry(0.65, 8, 8), mat);
        skull.position.y = 2.4;
        group.add(skull);

        const wEyeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const wEyeL = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), wEyeMat);
        wEyeL.position.set(-0.25, 2.45, 0.55);
        const wEyeR = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), wEyeMat);
        wEyeR.position.set(0.25, 2.45, 0.55);
        group.add(wEyeL);
        group.add(wEyeR);

        const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 1.4, 6), mat);
        spine.position.y = 1.4;
        group.add(spine);

        [-0.3, 0.3].forEach((lx) => {
          const wLeg = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.1, 0.25), mat);
          wLeg.position.set(lx, 0.55, 0);
          group.add(wLeg);
          legs.push(wLeg);
        });
      }

      // ARCHETYPE: SHADOW WRAITH
      else if (data.type === "wraith") {
        mat = new THREE.MeshStandardMaterial({
          color: 0x0f172a,
          roughness: 0.9,
        });
        const robe = new THREE.Mesh(new THREE.ConeGeometry(1.2, 2.6, 8), mat);
        robe.position.y = 1.4;
        group.add(robe);

        const coreMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
        const voidCore = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), coreMat);
        voidCore.position.set(0, 2.1, 0.2);
        group.add(voidCore);

        const orbMat = new THREE.MeshBasicMaterial({ color: 0xa855f7 });
        for (let o = 0; o < 3; o++) {
          const orb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 6, 6), orbMat);
          group.add(orb);
          orbs.push(orb);
        }
      }

      // 3D Health Bar Billboard
      const hpBgMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });
      const hpFillMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
      const barWidth = data.isBoss ? 6.0 : 2.4;
      const barHeight = data.isBoss ? 0.6 : 0.3;
      const hpBg = new THREE.Mesh(new THREE.PlaneGeometry(barWidth, barHeight), hpBgMat);
      hpBg.position.y = data.isBoss ? 9.5 : (data.type === "drake" ? 3.5 : 3.0);
      const hpFill = new THREE.Mesh(new THREE.PlaneGeometry(barWidth - 0.1, barHeight - 0.08), hpFillMat);
      hpFill.position.set(0, 0, 0.01);
      hpBg.add(hpFill);
      group.add(hpBg);

      this.scene.add(group);
      this.monsterMeshes.push({
        group,
        data,
        mat,
        wingL,
        wingR,
        legs,
        orbs,
        hpBg,
        hpFill,
        barWidth,
      });
    });
  }

  // 4. ADVANCED COMBAT & SKILLS SYSTEM
  // Light Attack Combo (3-hit chain)
  attack() {
    if (this.player.attackCooldown > 0) return;
    this.player.isAttacking = true;
    this.player.attackTimer = 0.2;
    this.player.attackCooldown = 0.24;
    sound.playSlash();

    // 3-Hit Combo Logic
    this.player.comboCount = (this.player.comboCount % 3) + 1;
    this.player.comboTimer = 1.2;

    const isFinisher = this.player.comboCount === 3;
    const baseDamage = isFinisher ? 48 : (this.player.comboCount === 2 ? 32 : 24);

    // Show 3D slash arc with combo color
    this.slashMat.opacity = 0.9;
    this.slashMat.color.setHex(isFinisher ? 0xf59e0b : 0x38bdf8);

    const forwardX = Math.sin(this.player.rotY);
    const forwardZ = Math.cos(this.player.rotY);
    const hitBoxPos = {
      x: this.player.x + forwardX * 3.5,
      z: this.player.z + forwardZ * 3.5,
    };

    this.checkHit(hitBoxPos, 6.2, baseDamage, isFinisher ? 6.0 : 4.0, isFinisher);
  }

  // Whirlwind Spin Attack (Key Q or K)
  spinAttack() {
    if (this.player.spinTimer > 0) return;
    if (this.player.mana < 20) {
      if (this.onLockedNotice) this.onLockedNotice("⚡ Need 20 Mana for Whirlwind Spin!");
      return;
    }
    this.player.mana -= 20;
    this.player.isSpinAttacking = true;
    this.player.spinTimer = 0.35;
    this.player.attackCooldown = 0.4;
    sound.playSlash();

    this.spinMat.opacity = 0.85;
    this.spinMesh.scale.set(0.2, 0.2, 0.2);

    this.checkHit({ x: this.player.x, z: this.player.z }, 9.5, 50, 7.0, true);
  }

  // Fireball Projectile Spell (Key R or F)
  castFireball() {
    if (this.player.fireballCooldown > 0) return;
    if (this.player.mana < 25) {
      if (this.onLockedNotice) this.onLockedNotice("🔥 Need 25 Mana for Fireball!");
      return;
    }
    this.player.mana -= 25;
    this.player.fireballCooldown = 0.8;
    sound.playFireball();

    // Spawn 3D Fireball Sphere
    const fbGeo = new THREE.SphereGeometry(0.55, 8, 8);
    const fbMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });
    const fbMesh = new THREE.Mesh(fbGeo, fbMat);
    fbMesh.position.set(this.player.x, 2.0, this.player.z);

    const fwdX = Math.sin(this.player.rotY);
    const fwdZ = Math.cos(this.player.rotY);
    const spd = 32.0;

    this.scene.add(fbMesh);
    this.projectiles.push({
      mesh: fbMesh,
      vx: fwdX * spd,
      vy: 0,
      vz: fwdZ * spd,
      life: 2.2,
      damage: 55,
      isEnemy: false,
    });
  }

  // Dragon Dash / Dodge Roll (Key Shift)
  dash() {
    if (this.player.dashCooldown > 0 || this.player.isDashing) return;
    if (this.player.mana < 15) {
      if (this.onLockedNotice) this.onLockedNotice("💨 Need 15 Mana to Dash!");
      return;
    }
    this.player.mana -= 15;
    this.player.isDashing = true;
    this.player.dashTimer = 0.24;
    this.player.dashCooldown = 0.7;
    sound.playDash();

    // Dash in movement direction or facing direction
    let dx = Math.sin(this.player.rotY);
    let dz = Math.cos(this.player.rotY);
    this.player.dashDir = { x: dx, z: dz };

    // Spawn shadow clone ghost mesh
    this.spawnDashGhost();
  }

  spawnDashGhost() {
    const ghostGeo = new THREE.BoxGeometry(1.4, 2.8, 0.9);
    const ghostMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.5 });
    const ghost = new THREE.Mesh(ghostGeo, ghostMat);
    ghost.position.set(this.player.x, 1.4, this.player.z);
    ghost.rotation.y = this.player.rotY;
    this.scene.add(ghost);

    this.particles.push({
      mesh: ghost,
      vx: 0,
      vy: 0,
      vz: 0,
      life: 0.25,
      maxLife: 0.25,
    });
  }

  checkHit(centerPos, reach, baseDamage, knockbackForce, isAoE = false) {
    this.monsters.forEach((m) => {
      if (m.isDead) return;
      const dist = Math.hypot(m.x - centerPos.x, m.z - centerPos.z);
      if (dist < reach) {
        const isCrit = Math.random() > 0.6 || isAoE;
        const dmg = isCrit ? Math.round(baseDamage * 1.5) : baseDamage;
        m.hp = Math.max(0, m.hp - dmg);
        m.hitFlash = 0.18;
        sound.playMonsterHit();
        this.hitFreezeTimer = isCrit ? 0.048 : 0.032;

        // Spawn 3D Floating Damage Text
        this.spawnFloatingText(m.x, m.y + (m.isBoss ? 9 : 3.5), m.z, `-${dmg}`, isCrit ? "#f59e0b" : "#ffffff");

        // Knockback physics (reduced on Boss)
        const kb = m.isBoss ? knockbackForce * 0.2 : knockbackForce;
        const angle = Math.atan2(m.z - this.player.z, m.x - this.player.x);
        m.x += Math.cos(angle) * kb;
        m.z += Math.sin(angle) * kb;

        // Death check
        if (m.hp <= 0) {
          m.isDead = true;
          sound.playMonsterDeath();
          this.onMonsterKill(m);

          // Gain EXP and check Level-Up
          const expGain = m.isBoss ? 200 : (m.isGuardian ? 80 : 35);
          this.addExp(expGain);

          // Spawn Death Particles & Drops
          this.spawnDeathParticles(m.x, m.y + 1.5, m.z, m.type);
          this.spawnLoot(m.x, m.z, m.isBoss ? 5 : 2);

          // Unlock Skills check
          const guardiansDead = this.monsters.filter((mon) => mon.isGuardian).every((mon) => mon.isDead);
          if (guardiansDead && !this.skillsUnlocked) {
            this.skillsUnlocked = true;
            sound.playFanfare();
            if (this.shieldDome) this.scene.remove(this.shieldDome);
            this.onSkillsUnlocked();
          }

          if (m.isBoss) {
            sound.playFanfare();
            this.spawnFloatingText(0, 10, -115, "🏆 REALM CONQUERED!", "#fbbf24");
          }
        }
      }
    });
  }

  addExp(amt) {
    this.player.exp += amt;
    this.spawnFloatingText(this.player.x, 3.5, this.player.z, `+${amt} EXP`, "#38bdf8");

    if (this.player.exp >= this.player.maxExp) {
      this.player.level += 1;
      this.player.exp -= this.player.maxExp;
      this.player.maxExp = Math.round(this.player.maxExp * 1.5);
      this.player.maxHp += 20;
      this.player.hp = this.player.maxHp;
      this.player.maxMana += 20;
      this.player.mana = this.player.maxMana;

      sound.playLevelUp();
      this.spawnFloatingText(this.player.x, 4.5, this.player.z, `⚡ LEVEL ${this.player.level}!`, "#fbbf24");
      if (this.onLevelUp) this.onLevelUp(this.player.level);
    }
  }

  // 3D LOOT DROPS (Gold Coins, Potions, Mana Shards)
  spawnLoot(x, z, count = 2) {
    const types = ["coin", "potion", "mana"];
    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      let color = 0xf59e0b;
      if (type === "potion") color = 0xef4444;
      if (type === "mana") color = 0x38bdf8;

      const geo = type === "coin" ? new THREE.CylinderGeometry(0.35, 0.35, 0.1, 8) : new THREE.DodecahedronGeometry(0.35, 0);
      const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.4, roughness: 0.2 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x + (Math.random() - 0.5) * 3, 0.4, z + (Math.random() - 0.5) * 3);
      this.scene.add(mesh);

      this.lootItems.push({
        mesh,
        type,
        x: mesh.position.x,
        z: mesh.position.z,
        life: 30, // 30 seconds
      });
    }
  }

  // 3D FLOATING DAMAGE TEXT SPRITES
  spawnFloatingText(x, y, z, text, color = "#ffffff") {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    ctx.font = "bold 32px sans-serif";
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.shadowColor = "#000000";
    ctx.shadowBlur = 6;
    ctx.fillText(text, 128, 44);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 1 });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.set(x, y, z);
    sprite.scale.set(3.5, 0.9, 1);
    this.scene.add(sprite);

    this.floatingTexts.push({
      sprite,
      vy: 2.2,
      life: 0.8,
      maxLife: 0.8,
    });
  }

  spawnDeathParticles(x, y, z, type) {
    const count = type === "boss" ? 60 : 18;
    const colors = {
      bug: 0xef4444,
      drake: 0xa855f7,
      wight: 0x38bdf8,
      wraith: 0xf43f5e,
      boss: 0x67e8f9,
    };
    const col = colors[type] || 0xf59e0b;

    for (let i = 0; i < count; i++) {
      const geo = new THREE.SphereGeometry(type === "boss" ? 0.35 : 0.18, 4, 4);
      const mat = new THREE.MeshBasicMaterial({ color: col });
      const p = new THREE.Mesh(geo, mat);
      p.position.set(x, y, z);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const spd = Math.random() * 9 + 4;
      const vx = spd * Math.sin(phi) * Math.cos(theta);
      const vy = spd * Math.cos(phi) + 4;
      const vz = spd * Math.sin(phi) * Math.sin(theta);

      this.scene.add(p);
      this.particles.push({ mesh: p, vx, vy, vz, life: 0.7, maxLife: 0.7 });
    }
  }

  triggerInteraction() {
    if (!this.activeInteractable) return;

    if (this.activeInteractable.id === "skill_altar" && !this.skillsUnlocked) {
      if (this.onLockedNotice) {
        this.onLockedNotice("💡 Bonus Quest: Slay the 2 Elite Guardians outside to earn +50 EXP & Gold!");
      }
    }

    sound.playInteract();
    this.onInteract(this.activeInteractable);
  }

  fastTravelTo(landmarkKey) {
    const lm = WORLD_3D.landmarks[landmarkKey];
    if (!lm) return;
    this.player.x = lm.x;
    this.player.z = lm.z + 5.5;
    this.player.rotY = Math.PI; // Face towards shrine
    this.spawnTeleportParticles(this.player.x, 1.5, this.player.z);
    sound.playInteract();

    // Auto-discover / trigger interaction
    const item = INTERACTABLES.find((i) => i.id === lm.id);
    if (item) {
      this.activeInteractable = item;
      setTimeout(() => {
        this.triggerInteraction();
      }, 250);
    }
  }

  spawnTeleportParticles(x, y, z) {
    for (let i = 0; i < 32; i++) {
      const geo = new THREE.SphereGeometry(0.2, 4, 4);
      const mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const p = new THREE.Mesh(geo, mat);
      p.position.set(x, y, z);
      const theta = Math.random() * Math.PI * 2;
      const vy = Math.random() * 8 + 3;
      this.particles.push({
        mesh: p,
        vx: Math.cos(theta) * (Math.random() * 5 + 2),
        vy,
        vz: Math.sin(theta) * (Math.random() * 5 + 2),
        life: 0.6,
        maxLife: 0.6,
      });
      this.scene.add(p);
    }
  }

  spawnDustParticle(x, y, z) {
    const geo = new THREE.SphereGeometry(0.18, 4, 4);
    const mat = new THREE.MeshBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.5 });
    const p = new THREE.Mesh(geo, mat);
    p.position.set(x + (Math.random() - 0.5) * 0.4, y, z + (Math.random() - 0.5) * 0.4);
    this.scene.add(p);
    this.particles.push({
      mesh: p,
      vx: (Math.random() - 0.5) * 0.6,
      vy: Math.random() * 0.7 + 0.3,
      vz: (Math.random() - 0.5) * 0.6,
      life: 0.35,
      maxLife: 0.35,
    });
  }

  interact() {
    this.triggerInteraction();
  }

  // 5. MAIN GAME LOOP & UPDATE
  update(delta) {
    // Micro Hit-Freeze Frame Pause (Game Feel / Crunch on Impact)
    if (this.hitFreezeTimer > 0) {
      this.hitFreezeTimer -= delta;
      this.renderer.render(this.scene, this.camera);
      return;
    }

    const t = this.clock.getElapsedTime();

    // Natural Mana Regeneration (+10/sec)
    if (this.player.mana < this.player.maxMana) {
      this.player.mana = Math.min(this.player.maxMana, this.player.mana + 10 * delta);
    }

    // Cooldown timers
    if (this.player.fireballCooldown > 0) this.player.fireballCooldown -= delta;
    if (this.player.dashCooldown > 0) this.player.dashCooldown -= delta;
    if (this.player.comboTimer > 0) {
      this.player.comboTimer -= delta;
    } else {
      this.player.comboCount = 0;
    }

    // Brazier Fire Light flicker & Flame Sizing
    this.brazierLights.forEach((light, i) => {
      light.intensity = 2.0 + Math.sin(t * 9 + i * 2) * 0.5;
    });

    // Torch Posts Flame Dance & Dynamic Point Lights
    this.torchFlames.forEach((flame, i) => {
      flame.scale.y = 1.0 + Math.sin(t * 14 + i * 2.5) * 0.25;
      flame.scale.x = 1.0 + Math.cos(t * 12 + i * 2) * 0.15;
    });
    this.torchLights.forEach((light, i) => {
      light.intensity = 1.2 + Math.sin(t * 10 + i * 1.8) * 0.35;
    });

    // Drifting Celestial Clouds in Sky
    this.driftingClouds.forEach((c) => {
      c.group.position.x += c.speedX * delta * 2.4;
      c.group.position.z += c.speedZ * delta * 2.4;
      const bound = WORLD_3D.size * 0.7;
      if (c.group.position.x > bound) c.group.position.x = -bound;
      if (c.group.position.z > bound) c.group.position.z = -bound;
      if (c.group.position.z < -bound) c.group.position.z = bound;
    });

    // Sacred Fountain Water Surface & Sparkle Droplets
    if (this.waterSurface) {
      this.waterSurface.rotation.z += delta * 0.3;
    }
    if (Math.random() < 0.35) {
      const dropGeo = new THREE.SphereGeometry(0.08, 4, 4);
      const dropMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.8 });
      const drop = new THREE.Mesh(dropGeo, dropMat);
      drop.position.set((Math.random() - 0.5) * 0.5, 3.8, -5 + (Math.random() - 0.5) * 0.5);
      this.scene.add(drop);
      const dAngle = Math.random() * Math.PI * 2;
      const dSpd = 0.8 + Math.random() * 1.6;
      this.fountainParticles.push({
        mesh: drop,
        vx: Math.cos(dAngle) * dSpd,
        vy: 2.2 + Math.random() * 1.4,
        vz: Math.sin(dAngle) * dSpd,
        life: 1.1,
        maxLife: 1.1,
      });
    }
    for (let fIdx = this.fountainParticles.length - 1; fIdx >= 0; fIdx--) {
      const fp = this.fountainParticles[fIdx];
      fp.life -= delta;
      fp.mesh.position.x += fp.vx * delta;
      fp.mesh.position.y += fp.vy * delta;
      fp.mesh.position.z += fp.vz * delta;
      fp.vy -= 9.8 * delta;
      if (fp.life <= 0 || fp.mesh.position.y < 1.0) {
        this.scene.remove(fp.mesh);
        fp.mesh.geometry.dispose();
        fp.mesh.material.dispose();
        this.fountainParticles.splice(fIdx, 1);
      }
    }

    // Rotate holographic landmarks
    this.shrineMeshes.forEach((s) => {
      if (s.rotSpeed !== 0) s.mesh.rotation.y += s.rotSpeed;
    });

    // Float Holographic 3D Landmark Banners (Gentle Sine Wave Bobbing)
    this.landmarkBanners.forEach((b, i) => {
      b.sprite.position.y = b.baseY + Math.sin(t * b.speed + i) * 0.45;
    });

    // Pulse Ground Aura Rings
    this.groundRings.forEach((gr, i) => {
      const scale = 1.0 + Math.sin(t * 2.5 + i) * 0.12;
      gr.ring.scale.set(scale, scale, 1);
    });

    // Player Input & Movement
    let moveX = 0;
    let moveZ = 0;

    if (this.keys["w"] || this.keys["arrowup"]) moveZ -= 1;
    if (this.keys["s"] || this.keys["arrowdown"]) moveZ += 1;
    if (this.keys["a"] || this.keys["arrowleft"]) moveX -= 1;
    if (this.keys["d"] || this.keys["arrowright"]) moveX += 1;

    if (this.joystickInput) {
      moveX = this.joystickInput.dx;
      moveZ = this.joystickInput.dy;
    }

    const isSprint = this.keys["shift"];
    const speed = isSprint ? this.player.runSpeed : this.player.speed;

    if (this.player.isDashing) {
      // Dash surge
      this.player.dashTimer -= delta;
      const dashSpeed = 48.0;
      this.player.x += this.player.dashDir.x * dashSpeed * delta;
      this.player.z += this.player.dashDir.z * dashSpeed * delta;
      if (this.player.dashTimer <= 0) {
        this.player.isDashing = false;
      }
    } else if (Math.abs(moveX) > 0.1 || Math.abs(moveZ) > 0.1) {
      const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.cameraYaw);
      const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.cameraYaw);

      const moveVec = new THREE.Vector3()
        .addScaledVector(forward, -moveZ)
        .addScaledVector(right, moveX)
        .normalize();

      this.player.x += moveVec.x * speed * delta;
      this.player.z += moveVec.z * speed * delta;

      this.player.rotY = Math.atan2(moveVec.x, moveVec.z);
      this.player.isMoving = true;
      this.player.stepCycle += delta * (isSprint ? 16 : 12);

      this.onPlayerMove(this.player.x, this.player.z);

      // Running Dust Particle Trail
      this.footstepTimer += delta;
      if (this.footstepTimer > (isSprint ? 0.09 : 0.14)) {
        this.footstepTimer = 0;
        this.spawnDustParticle(this.player.x, 0.12, this.player.z);
      }
    } else {
      this.player.isMoving = false;
    }

    // Boundary clamping
    const bound = WORLD_3D.size / 2 - 5;
    this.player.x = Math.max(-bound, Math.min(bound, this.player.x));
    this.player.z = Math.max(-bound, Math.min(bound, this.player.z));

    // Soldier Mesh Transforms & Dynamic Turning Lean
    this.soldierGroup.position.set(this.player.x, 0, this.player.z);

    // Calculate angular turn velocity for dynamic banking lean into turns
    let turnDiff = this.player.rotY - this.prevPlayerRotY;
    while (turnDiff > Math.PI) turnDiff -= Math.PI * 2;
    while (turnDiff < -Math.PI) turnDiff += Math.PI * 2;
    this.playerTurnVelocity = THREE.MathUtils.lerp(this.playerTurnVelocity, turnDiff / (delta || 0.016), 0.18);
    this.prevPlayerRotY = this.player.rotY;

    const bankLean = Math.max(-0.25, Math.min(0.25, -this.playerTurnVelocity * 0.035));
    this.soldierGroup.rotation.z = bankLean;

    if (this.player.spinTimer > 0) {
      this.soldierGroup.rotation.y += delta * 28;
    } else {
      this.soldierGroup.rotation.y = this.player.rotY;
    }

    // Dynamic Locomotion with Hip Bounce, Arm Swings and Cape Flutter
    if (this.player.isMoving && !this.player.isDashing) {
      const strideAmp = isSprint ? 0.85 : 0.65;
      const legAngle = Math.sin(this.player.stepCycle) * strideAmp;
      this.leftLeg.rotation.x = legAngle;
      this.rightLeg.rotation.x = -legAngle;
      this.leftArm.rotation.x = -legAngle * 0.7;
      this.rightArm.rotation.x = legAngle * 0.5;

      const bounce = Math.abs(Math.sin(this.player.stepCycle)) * (isSprint ? 0.22 : 0.14);
      this.soldierGroup.position.y = bounce;

      const windFlutter = Math.sin(t * 12 + this.player.stepCycle) * 0.18;
      this.cape.rotation.x = (isSprint ? 0.68 : 0.38) + windFlutter;
      this.cape.rotation.y = Math.sin(this.player.stepCycle) * 0.1;
      if (this.torso) this.torso.rotation.y = -Math.sin(this.player.stepCycle) * 0.08;
    } else {
      this.leftLeg.rotation.x = THREE.MathUtils.lerp(this.leftLeg.rotation.x, 0, 0.2);
      this.rightLeg.rotation.x = THREE.MathUtils.lerp(this.rightLeg.rotation.x, 0, 0.2);
      this.leftArm.rotation.x = Math.sin(t * 2.5) * 0.08;
      this.rightArm.rotation.x = Math.sin(t * 2.5) * 0.08;
      this.rightArm.rotation.z = Math.sin(t * 2.5) * 0.04;
      this.cape.rotation.x = 0.08 + Math.sin(t * 2.5) * 0.06;
      this.cape.rotation.y = 0;
      this.soldierGroup.position.y = Math.sin(t * 3) * 0.06;
      if (this.torso) this.torso.rotation.y = 0;
    }

    // Light Attack Slash animation with dual core opacity
    if (this.player.attackTimer > 0) {
      this.player.attackTimer -= delta;
      const slashPct = Math.max(0, this.player.attackTimer / 0.2);
      this.slashMat.opacity = slashPct;
      if (this.slashCoreMat) this.slashCoreMat.opacity = slashPct;
      this.rightArm.rotation.x = -Math.PI / 4 + (1 - slashPct) * (Math.PI / 2);
    } else {
      this.player.isAttacking = false;
      this.slashMat.opacity = 0;
      if (this.slashCoreMat) this.slashCoreMat.opacity = 0;
    }
    if (this.player.attackCooldown > 0) this.player.attackCooldown -= delta;

    // Whirlwind Spin Animation
    if (this.player.spinTimer > 0) {
      this.player.spinTimer -= delta;
      const progress = 1 - this.player.spinTimer / 0.35;
      this.spinMat.opacity = Math.max(0, 1 - progress);
      const s = 0.3 + progress * 1.4;
      this.spinMesh.scale.set(s, s, s);
      this.rightArm.rotation.x = -Math.PI / 2;
    } else {
      this.player.isSpinAttacking = false;
      this.spinMat.opacity = 0;
    }

    // Update Projectiles (Fireballs & Ice Breaths)
    for (let pIdx = this.projectiles.length - 1; pIdx >= 0; pIdx--) {
      const prj = this.projectiles[pIdx];
      prj.life -= delta;
      prj.mesh.position.x += prj.vx * delta;
      prj.mesh.position.y += prj.vy * delta;
      prj.mesh.position.z += prj.vz * delta;

      // Check collision with enemies (if player projectile)
      if (!prj.isEnemy) {
        for (let m of this.monsters) {
          if (m.isDead) continue;
          const dHit = Math.hypot(m.x - prj.mesh.position.x, m.z - prj.mesh.position.z);
          if (dHit < (m.isBoss ? 4.5 : 2.5)) {
            m.hp = Math.max(0, m.hp - prj.damage);
            m.hitFlash = 0.2;
            sound.playMonsterHit();
            this.spawnFloatingText(m.x, m.y + (m.isBoss ? 8 : 3), m.z, `🔥 -${prj.damage}`, "#f97316");

            // Remove projectile & spawn spark explosion
            this.scene.remove(prj.mesh);
            prj.mesh.geometry.dispose();
            prj.mesh.material.dispose();
            this.projectiles.splice(pIdx, 1);
            this.spawnDeathParticles(m.x, m.y + 1.5, m.z, "bug");
            break;
          }
        }
      } else {
        // Enemy projectile hitting player
        const dPlayer = Math.hypot(this.player.x - prj.mesh.position.x, this.player.z - prj.mesh.position.z);
        if (dPlayer < 2.5 && !this.player.isDashing) {
          this.player.hp = Math.max(10, this.player.hp - prj.damage);
          sound.playMonsterHit();
          this.spawnFloatingText(this.player.x, 3.2, this.player.z, `-${prj.damage}`, "#ef4444");

          this.scene.remove(prj.mesh);
          prj.mesh.geometry.dispose();
          prj.mesh.material.dispose();
          this.projectiles.splice(pIdx, 1);
          continue;
        }
      }

      if (prj.life <= 0) {
        this.scene.remove(prj.mesh);
        prj.mesh.geometry.dispose();
        prj.mesh.material.dispose();
        this.projectiles.splice(pIdx, 1);
      }
    }

    // Update Magnetic Loot Pickups
    for (let lIdx = this.lootItems.length - 1; lIdx >= 0; lIdx--) {
      const item = this.lootItems[lIdx];
      item.mesh.rotation.y += delta * 3.0;

      // Magnetic attraction to soldier (within 9 units)
      const distToPlayer = Math.hypot(this.player.x - item.mesh.position.x, this.player.z - item.mesh.position.z);
      if (distToPlayer < 9.0) {
        const pull = 16.0 * delta;
        item.mesh.position.x += (this.player.x - item.mesh.position.x) * (pull / distToPlayer);
        item.mesh.position.z += (this.player.z - item.mesh.position.z) * (pull / distToPlayer);
      }

      // Collect pickup (within 2 units)
      if (distToPlayer < 2.0) {
        sound.playPickup();
        if (item.type === "coin") {
          this.player.gold += 15;
          this.spawnFloatingText(this.player.x, 3.2, this.player.z, "+15 GOLD", "#fbbf24");
        } else if (item.type === "potion") {
          this.player.hp = Math.min(this.player.maxHp, this.player.hp + 35);
          this.spawnFloatingText(this.player.x, 3.2, this.player.z, "+35 HP", "#ef4444");
        } else if (item.type === "mana") {
          this.player.mana = Math.min(this.player.maxMana, this.player.mana + 35);
          this.spawnFloatingText(this.player.x, 3.2, this.player.z, "+35 MANA", "#38bdf8");
        }

        this.scene.remove(item.mesh);
        item.mesh.geometry.dispose();
        item.mesh.material.dispose();
        this.lootItems.splice(lIdx, 1);
      }
    }

    // Update Floating Damage Text
    for (let ftIdx = this.floatingTexts.length - 1; ftIdx >= 0; ftIdx--) {
      const ft = this.floatingTexts[ftIdx];
      ft.life -= delta;
      ft.sprite.position.y += ft.vy * delta;
      ft.sprite.material.opacity = Math.max(0, ft.life / ft.maxLife);

      if (ft.life <= 0) {
        this.scene.remove(ft.sprite);
        ft.sprite.material.map.dispose();
        ft.sprite.material.dispose();
        this.floatingTexts.splice(ftIdx, 1);
      }
    }

    // Update Particles
    for (let pIdx = this.particles.length - 1; pIdx >= 0; pIdx--) {
      const p = this.particles[pIdx];
      p.life -= delta;
      p.mesh.position.x += p.vx * delta;
      p.mesh.position.y += p.vy * delta;
      p.mesh.position.z += p.vz * delta;
      p.vy -= 9.8 * delta;
      p.mesh.scale.setScalar(p.life / p.maxLife);

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        this.particles.splice(pIdx, 1);
      }
    }

    // Update Monsters AI & Boss Attacks
    this.monsterMeshes.forEach(({ group, data, mat, wingL, wingR, legs, orbs, hpBg, hpFill, barWidth }) => {
      if (data.isDead) {
        group.visible = false;
        return;
      }
      group.visible = true;

      const dist = Math.hypot(this.player.x - data.x, this.player.z - data.z);

      // Boss Special Attack Loop
      if (data.isBoss) {
        data.specialTimer += delta;
        // Boss shoots Ice Blast every 3.8s if player in arena
        if (dist < 45 && data.specialTimer >= 3.8) {
          data.specialTimer = 0;
          sound.playFireball();

          const bAngle = Math.atan2(this.player.z - data.z, this.player.x - data.x);
          const iceGeo = new THREE.SphereGeometry(0.85, 8, 8);
          const iceMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
          const iceMesh = new THREE.Mesh(iceGeo, iceMat);
          iceMesh.position.set(data.x, 5.0, data.z);
          this.scene.add(iceMesh);

          this.projectiles.push({
            mesh: iceMesh,
            vx: Math.cos(bAngle) * 26.0,
            vy: 0,
            vz: Math.sin(bAngle) * 26.0,
            life: 2.5,
            damage: 20,
            isEnemy: true,
          });
        }
      }

      // Aggro Chase AI
      const aggroDist = data.isBoss ? 50 : 32;
      if (dist < aggroDist) {
        const angle = Math.atan2(this.player.z - data.z, this.player.x - data.x);
        data.x += Math.cos(angle) * data.speed * delta;
        data.z += Math.sin(angle) * data.speed * delta;
        data.rotY = Math.PI / 2 - angle;

        // Melee Attack
        const atkReach = data.isBoss ? 4.8 : 2.8;
        if (dist < atkReach && data.attackCooldown <= 0 && !this.player.isDashing) {
          data.attackCooldown = data.isBoss ? 1.4 : 1.1;
          this.player.hp = Math.max(10, this.player.hp - data.attackPower);
          sound.playMonsterHit();
          this.spawnFloatingText(this.player.x, 3.2, this.player.z, `-${data.attackPower}`, "#ef4444");
        }
      } else {
        // Idle wander
        data.wanderTimer -= delta;
        if (data.wanderTimer <= 0) {
          data.wanderTimer = Math.random() * 4 + 2;
          data.wanderAngle = Math.random() * Math.PI * 2;
        }
        data.x += Math.cos(data.wanderAngle) * (data.speed * 0.3) * delta;
        data.z += Math.sin(data.wanderAngle) * (data.speed * 0.3) * delta;
        data.rotY = Math.PI / 2 - data.wanderAngle;

        const dOrigin = Math.hypot(data.x - data.originX, data.z - data.originZ);
        if (dOrigin > (data.isBoss ? 10 : 25)) {
          data.wanderAngle = Math.atan2(data.originZ - data.z, data.originX - data.x);
        }
      }

      if (data.attackCooldown > 0) data.attackCooldown -= delta;

      let floatY = data.y;
      if (data.type === "drake" || data.isBoss) {
        floatY += Math.sin(t * 3.5 + data.x) * 0.5;
      } else if (data.type === "wraith") {
        floatY += Math.sin(t * 3 + data.z) * 0.35;
      }

      group.position.set(data.x, floatY, data.z);
      group.rotation.y = data.rotY;

      // Wing Flapping Animation
      if (wingL && wingR) {
        const flapRate = data.isBoss ? 6 : (dist < 32 ? 18 : 10);
        const flap = Math.sin(t * flapRate) * 0.5;
        wingL.rotation.z = flap;
        wingR.rotation.z = -flap;
      }

      // Legs animation
      if (legs && legs.length > 0) {
        const stepRate = t * 14;
        legs.forEach((leg, lIdx) => {
          leg.rotation.x = Math.sin(stepRate + lIdx * Math.PI) * 0.5;
        });
      }

      // Orbiting orbs
      if (orbs && orbs.length > 0) {
        orbs.forEach((orb, oIdx) => {
          const oAngle = t * 4 + (oIdx * (Math.PI * 2)) / 3;
          orb.position.set(Math.cos(oAngle) * 1.6, 1.8 + Math.sin(t * 3 + oIdx) * 0.3, Math.sin(oAngle) * 1.6);
        });
      }

      // Health Bar Billboard
      if (hpBg && hpFill) {
        hpBg.lookAt(this.camera.position);
        const hpPct = Math.max(0, data.hp / data.maxHp);
        hpFill.scale.x = hpPct;
        hpFill.position.x = (hpPct - 1) * (barWidth / 2);
        if (hpPct > 0.5) hpFill.material.color.setHex(0x22c55e);
        else if (hpPct > 0.25) hpFill.material.color.setHex(0xeab308);
        else hpFill.material.color.setHex(0xef4444);
      }

      // Hit Flash reaction
      if (data.hitFlash > 0) {
        data.hitFlash -= delta;
        mat.color.setHex(0xffffff);
      } else {
        if (data.isBoss) mat.color.setHex(0x0284c7);
        else if (data.type === "bug") mat.color.setHex(data.isGuardian ? 0x991b1b : 0xdc2626);
        else if (data.type === "drake") mat.color.setHex(data.isGuardian ? 0x581c87 : 0x7c3aed);
        else if (data.type === "wight") mat.color.setHex(0xe0f2fe);
        else if (data.type === "wraith") mat.color.setHex(0x0f172a);
      }
    });

    // 3D Third-Person Chase Camera Tracking with dynamic pitch (Sky to Ground orbit)
    const pitch = this.cameraPitch;
    const yaw = this.cameraYaw;
    const dist = this.cameraDist;

    // Horizontal and vertical distance components
    const horizDist = dist * Math.cos(Math.max(-0.25, pitch));
    const offsetX = Math.sin(yaw) * horizDist;
    const offsetZ = Math.cos(yaw) * horizDist;
    const vertDist = dist * Math.sin(pitch);

    // Ensure camera stays safely above terrain (minimum 0.75 units high)
    const camY = Math.max(0.75, this.player.y + 1.8 + vertDist);
    const desiredCamPos = new THREE.Vector3(
      this.player.x + offsetX,
      camY,
      this.player.z + offsetZ
    );

    // Dynamic Look Target: when pitch is negative (looking up), target aims high up into the celestial starry sky
    const skyLift = pitch < 0 ? -Math.sin(pitch) * 32.0 : (1.0 - Math.sin(pitch)) * 0.5;
    const camTarget = new THREE.Vector3(
      this.player.x - Math.sin(yaw) * (pitch < 0 ? 10.0 : 0.0),
      this.player.y + 1.8 + skyLift,
      this.player.z - Math.cos(yaw) * (pitch < 0 ? 10.0 : 0.0)
    );

    this.camera.position.lerp(desiredCamPos, 0.12);
    this.camera.lookAt(camTarget);

    // Landmark Proximity
    let closestLandmark = null;
    let minDistance = 8.5;

    for (const [key, val] of Object.entries(WORLD_3D.landmarks)) {
      const dist = Math.hypot(this.player.x - val.x, this.player.z - val.z);
      if (dist < minDistance) {
        const item = INTERACTABLES.find((i) => i.id === val.id);
        if (item) closestLandmark = item;
      }
    }
    this.activeInteractable = closestLandmark;

    if (this.onPromptChange && this.activeInteractable !== this.prevActiveInteractable) {
      this.prevActiveInteractable = this.activeInteractable;
      this.onPromptChange(this.activeInteractable);
    }

    // Landmark Hologram Banners & Beacons Animation
    const bannerTime = this.clock.getElapsedTime();
    this.landmarkBanners.forEach((b) => {
      b.sprite.position.y = b.baseY + Math.sin(bannerTime * b.speed) * 0.45;
    });
    this.groundRings.forEach((r) => {
      const s = 1.0 + Math.sin(bannerTime * 2.5) * 0.14;
      r.ring.scale.set(s, s, s);
    });

    // Stats Broadcast (HP, Mana, Exp, Level, Gold, Boss)
    this.statsTimer += delta;
    if (this.statsTimer >= 0.05) {
      this.statsTimer = 0;
      if (this.onStatsChange) {
        const boss = this.monsters.find((m) => m.isBoss);
        const distToBoss = boss ? Math.hypot(this.player.x - boss.x, this.player.z - boss.z) : 999;

        this.onStatsChange({
          hp: this.player.hp,
          maxHp: this.player.maxHp,
          mana: Math.round(this.player.mana),
          maxMana: this.player.maxMana,
          exp: this.player.exp,
          maxExp: this.player.maxExp,
          level: this.player.level,
          gold: this.player.gold,
          boss: distToBoss < 55 && !boss.isDead ? { name: boss.name, hp: boss.hp, maxHp: boss.maxHp } : null,
        });
      }
    }

    // Mini-map Radar Broadcast
    this.miniMapTimer += delta;
    if (this.miniMapTimer >= 0.08) {
      this.miniMapTimer = 0;
      if (this.onRadarUpdate) {
        this.onRadarUpdate({
          player: { x: this.player.x, z: this.player.z, rotY: this.player.rotY, hp: this.player.hp },
          monsters: this.monsters.map((m) => ({
            id: m.id,
            name: m.name,
            x: m.x,
            z: m.z,
            hp: m.hp,
            maxHp: m.maxHp,
            isDead: m.isDead,
            type: m.type,
            isGuardian: m.isGuardian,
            isBoss: m.isBoss,
          })),
        });
      }
    }
  }

  loop() {
    if (!this.isRunning) return;
    const delta = Math.min(this.clock.getDelta(), 0.1);
    this.update(delta);
    this.renderer.render(this.scene, this.camera);
    this.animId = requestAnimationFrame(this.loop);
  }
}
