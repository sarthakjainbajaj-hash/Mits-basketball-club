import * as THREE from "three";
import { ROADMAP_STEPS } from "./roadmapData";
import { roadmapAudio } from "./roadmapAudio";

export class Roadmap3DEngine {
  constructor(container, options = {}) {
    this.container = container;
    this.options = options;
    this.onStepChange = options.onStepChange || (() => {});
    this.onStepReached = options.onStepReached || (() => {});
    this.onWalkingStateChange = options.onWalkingStateChange || (() => {});

    this.width = container.clientWidth || window.innerWidth;
    this.height = container.clientHeight || window.innerHeight;

    // Core Three.js Setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x93c5fd); // Pleasant open sky
    this.scene.fog = new THREE.FogExp2(0x93c5fd, 0.007);

    this.camera = new THREE.PerspectiveCamera(54, this.width / this.height, 0.2, 800);
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      alpha: false,
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Roadmap Spline & Milestones State
    this.steps = ROADMAP_STEPS;
    this.stepTValues = [0.04, 0.16, 0.29, 0.42, 0.55, 0.68, 0.81, 0.94];
    this.currentStepIndex = 0;
    this.currentT = this.stepTValues[0];
    this.targetT = this.stepTValues[0];
    this.walkSpeed = 0.052; // T per second
    this.isWalking = false;
    this.cameraMode = "follow"; // 'follow' or 'free'

    // Animations & Clocks
    this.clock = new THREE.Clock();
    this.walkCycle = 0;
    this.footstepTimer = 0;
    this.idleAnimTime = 0;
    this.beaconRings = [];
    this.clouds = [];
    this.monolithMeshes = [];

    // Free look mouse interaction
    this.isMouseDown = false;
    this.prevMouseX = 0;
    this.prevMouseY = 0;
    this.camOrbitYaw = 0;
    this.camOrbitPitch = 0;

    // Bindings
    this.handleResize = this.handleResize.bind(this);
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.loop = this.loop.bind(this);

    this.initScene();
    this.initEvents();

    this.isRunning = true;
    this.animId = requestAnimationFrame(this.loop);
  }

  initEvents() {
    window.addEventListener("resize", this.handleResize);
    this.container.addEventListener("pointerdown", this.handlePointerDown);
    window.addEventListener("pointermove", this.handlePointerMove);
    window.addEventListener("pointerup", this.handlePointerUp);
  }

  destroy() {
    this.isRunning = false;
    if (this.animId) cancelAnimationFrame(this.animId);
    window.removeEventListener("resize", this.handleResize);
    this.container.removeEventListener("pointerdown", this.handlePointerDown);
    window.removeEventListener("pointermove", this.handlePointerMove);
    window.removeEventListener("pointerup", this.handlePointerUp);
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

  handlePointerDown(e) {
    if (e.button === 0) {
      this.isMouseDown = true;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
    }
  }

  handlePointerMove(e) {
    if (this.isMouseDown) {
      const dx = e.clientX - this.prevMouseX;
      const dy = e.clientY - this.prevMouseY;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;

      this.camOrbitYaw -= dx * 0.005;
      this.camOrbitPitch = Math.max(-0.4, Math.min(0.5, this.camOrbitPitch + dy * 0.004));
    }
  }

  handlePointerUp() {
    this.isMouseDown = false;
  }

  setCameraMode(mode) {
    this.cameraMode = mode;
    this.camOrbitYaw = 0;
    this.camOrbitPitch = 0;
  }

  // 1. BUILD THE 3D ROADMAP WORLD
  initScene() {
    // Lighting
    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 0.7);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfffbeb, 1.4);
    dirLight.position.set(40, 70, 30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 450;
    const d = 160;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0005;
    this.scene.add(dirLight);

    // Ground Terrain
    const groundGeo = new THREE.PlaneGeometry(600, 600, 48, 48);
    // Subtle undulation
    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const zVal = Math.sin(x * 0.02) * Math.cos(y * 0.02) * 1.5;
      pos.setZ(i, zVal);
    }
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x3b663b, // Lush green grass
      roughness: 0.9,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.3;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Build Road Spline
    this.buildSplineRoad();
    this.buildEntranceArch();
    this.buildMilestones();
    this.buildStreetLamps();
    this.buildSkyClouds();
    this.buildCharacter();

    // Place character and camera at Step 01
    this.updateCharacterTransform(this.currentT);
    this.updateCamera(1.0);
  }

  buildSplineRoad() {
    // 3D Road Curve Points winding through landscape
    const curvePoints = [
      new THREE.Vector3(0, 0, 15),       // Before start arch
      new THREE.Vector3(0, 0, 0),        // Step 1
      new THREE.Vector3(6, 0.2, -28),    // Step 2
      new THREE.Vector3(-8, 0.4, -60),   // Step 3
      new THREE.Vector3(10, 0.6, -95),   // Step 4
      new THREE.Vector3(-7, 0.8, -135),  // Step 5
      new THREE.Vector3(9, 1.0, -178),   // Step 6
      new THREE.Vector3(-6, 1.2, -220),  // Step 7
      new THREE.Vector3(0, 1.4, -265),   // Step 8
      new THREE.Vector3(0, 1.4, -285),   // Beyond end
    ];

    this.roadCurve = new THREE.CatmullRomCurve3(curvePoints, false, "catmullrom", 0.35);

    // Extrude a smooth asphalt ribbon mesh along the road curve
    const segments = 240;
    const roadWidth = 6.2;
    const roadGeo = new THREE.BufferGeometry();
    const vertices = [];
    const uvs = [];
    const indices = [];

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const point = this.roadCurve.getPointAt(t);
      const tangent = this.roadCurve.getTangentAt(t);
      const up = new THREE.Vector3(0, 1, 0);
      const normal = new THREE.Vector3().crossVectors(tangent, up).normalize();

      // Left edge & Right edge
      const pLeft = new THREE.Vector3().copy(point).addScaledVector(normal, -roadWidth / 2);
      const pRight = new THREE.Vector3().copy(point).addScaledVector(normal, roadWidth / 2);

      vertices.push(pLeft.x, pLeft.y + 0.05, pLeft.z);
      vertices.push(pRight.x, pRight.y + 0.05, pRight.z);

      uvs.push(0, t * 45);
      uvs.push(1, t * 45);

      if (i < segments) {
        const row1 = i * 2;
        const row2 = (i + 1) * 2;
        indices.push(row1, row1 + 1, row2);
        indices.push(row1 + 1, row2 + 1, row2);
      }
    }

    roadGeo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    roadGeo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    roadGeo.setIndex(indices);
    roadGeo.computeVertexNormals();

    // Procedural Asphalt Texture Canvas
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");

    // Dark grey asphalt base
    ctx.fillStyle = "#1e2430";
    ctx.fillRect(0, 0, 512, 1024);

    // Subtle grain noise
    for (let n = 0; n < 4000; n++) {
      ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.08)";
      ctx.fillRect(Math.random() * 512, Math.random() * 1024, 2, 2);
    }

    // White outer curb lines
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(18, 0, 16, 1024);
    ctx.fillRect(512 - 34, 0, 16, 1024);

    // Dashed Center Divider Line
    ctx.fillStyle = "#facc15"; // High-visibility road yellow
    for (let y = 0; y < 1024; y += 128) {
      ctx.fillRect(250, y + 20, 12, 88);
    }

    const roadTex = new THREE.CanvasTexture(canvas);
    roadTex.wrapS = THREE.ClampToEdgeWrapping;
    roadTex.wrapT = THREE.RepeatWrapping;
    roadTex.repeat.set(1, 8);

    const roadMat = new THREE.MeshStandardMaterial({
      map: roadTex,
      roughness: 0.8,
      metalness: 0.15,
    });

    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.receiveShadow = true;
    this.scene.add(roadMesh);
  }

  buildEntranceArch() {
    const archGroup = new THREE.Group();
    archGroup.position.set(0, 0, 10);

    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.8 });
    const pillarGeo = new THREE.BoxGeometry(0.7, 5.2, 0.7);

    // Left & Right Pillars
    const pillL = new THREE.Mesh(pillarGeo, pillarMat);
    pillL.position.set(-4.2, 2.6, 0);
    pillL.castShadow = true;
    archGroup.add(pillL);

    const pillR = new THREE.Mesh(pillarGeo, pillarMat);
    pillR.position.set(4.2, 2.6, 0);
    pillR.castShadow = true;
    archGroup.add(pillR);

    // Crossbeam
    const beamGeo = new THREE.BoxGeometry(9.2, 1.4, 0.8);
    const beam = new THREE.Mesh(beamGeo, pillarMat);
    beam.position.set(0, 5.2, 0);
    beam.castShadow = true;
    archGroup.add(beam);

    // Neon Entrance Signboard Canvas
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, 1024, 256);

    ctx.strokeStyle = "#06b6d4";
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, 1004, 236);

    ctx.font = "bold 52px 'Impact', 'Orbitron', sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.shadowColor = "#06b6d4";
    ctx.shadowBlur = 24;
    ctx.fillText("SARTHAK JAIN BAJAJ", 512, 110);

    ctx.font = "bold 28px sans-serif";
    ctx.fillStyle = "#38bdf8";
    ctx.shadowBlur = 12;
    ctx.fillText("INTERACTIVE 3D CAREER ROADMAP & AI JOURNEY", 512, 175);

    const signTex = new THREE.CanvasTexture(canvas);
    const signMat = new THREE.MeshStandardMaterial({
      map: signTex,
      emissive: new THREE.Color(0x06b6d4),
      emissiveIntensity: 0.35,
      roughness: 0.3,
    });
    const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(8.5, 1.25), signMat);
    signMesh.position.set(0, 5.2, 0.42);
    archGroup.add(signMesh);

    this.scene.add(archGroup);
  }

  buildMilestones() {
    this.beaconRings = [];
    this.monolithMeshes = [];

    this.steps.forEach((step, idx) => {
      const t = this.stepTValues[idx];
      const point = this.roadCurve.getPointAt(t);
      const tangent = this.roadCurve.getTangentAt(t);
      const up = new THREE.Vector3(0, 1, 0);
      const normal = new THREE.Vector3().crossVectors(tangent, up).normalize();

      // Checkpoint Glowing Ring on Asphalt
      const ringGeo = new THREE.RingGeometry(1.6, 2.2, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(step.color),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.set(point.x, point.y + 0.08, point.z);
      this.scene.add(ringMesh);

      // Inner Pulse Ring
      const innerGeo = new THREE.RingGeometry(0.7, 1.0, 24);
      const innerMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(step.color),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
      });
      const innerMesh = new THREE.Mesh(innerGeo, innerMat);
      innerMesh.rotation.x = -Math.PI / 2;
      innerMesh.position.set(point.x, point.y + 0.09, point.z);
      this.scene.add(innerMesh);

      this.beaconRings.push({
        outer: ringMesh,
        inner: innerMesh,
        color: step.color,
        baseScale: 1.0,
      });

      // Milestone Monolith Signboard standing beside the road
      const sideOffset = (idx % 2 === 0 ? 4.2 : -4.2);
      const monolithPos = new THREE.Vector3().copy(point).addScaledVector(normal, sideOffset);

      const monolithGroup = new THREE.Group();
      monolithGroup.position.set(monolithPos.x, monolithPos.y, monolithPos.z);
      monolithGroup.rotation.y = Math.atan2(tangent.x, tangent.z) + (sideOffset > 0 ? -0.25 : 0.25);

      // Base Pillar
      const baseMesh = new THREE.Mesh(
        new THREE.BoxGeometry(2.8, 0.45, 0.8),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5, metalness: 0.7 })
      );
      baseMesh.position.y = 0.22;
      baseMesh.castShadow = true;
      monolithGroup.add(baseMesh);

      // Vertical Glass & Titanium Monolith Body
      const bodyMesh = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 4.2, 0.22),
        new THREE.MeshStandardMaterial({ color: 0x070a12, roughness: 0.35, metalness: 0.85 })
      );
      bodyMesh.position.y = 2.5;
      bodyMesh.castShadow = true;
      monolithGroup.add(bodyMesh);

      // Emissive Glowing Edge Frame
      const frameGeo = new THREE.BoxGeometry(2.56, 4.26, 0.24);
      const frameMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(step.color),
        wireframe: true,
      });
      const frameMesh = new THREE.Mesh(frameGeo, frameMat);
      frameMesh.position.y = 2.5;
      monolithGroup.add(frameMesh);

      // Milestone Canvas Poster
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 768;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#090d16";
      ctx.fillRect(0, 0, 512, 768);

      // Colored top banner
      ctx.fillStyle = step.color;
      ctx.fillRect(0, 0, 512, 14);

      // "STEP" label
      ctx.font = "bold 26px sans-serif";
      ctx.fillStyle = step.color;
      ctx.fillText("MILESTONE", 40, 75);

      // Big Step Number
      ctx.font = "bold 130px 'Impact', sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = step.color;
      ctx.shadowBlur = 20;
      ctx.fillText(step.stepNumber, 40, 205);

      // Step Title
      ctx.font = "bold 44px 'Impact', sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.shadowBlur = 10;
      this.wrapCanvasText(ctx, step.title.toUpperCase(), 40, 290, 430, 48);

      // Divider line
      ctx.strokeStyle = step.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(40, 460);
      ctx.lineTo(472, 460);
      ctx.stroke();

      // Subtitle / domain
      ctx.font = "24px sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.shadowBlur = 0;
      this.wrapCanvasText(ctx, step.subtitle, 40, 510, 430, 32);

      // Interactive prompt
      ctx.font = "bold 22px sans-serif";
      ctx.fillStyle = step.color;
      ctx.fillText("TAP OR WALK TO INSPECT ➜", 40, 710);

      const posterTex = new THREE.CanvasTexture(canvas);
      const posterMat = new THREE.MeshStandardMaterial({
        map: posterTex,
        roughness: 0.35,
        emissive: new THREE.Color(step.color),
        emissiveIntensity: 0.25,
      });

      // Front Poster
      const posterF = new THREE.Mesh(new THREE.PlaneGeometry(2.35, 3.95), posterMat);
      posterF.position.set(0, 2.5, 0.12);
      monolithGroup.add(posterF);

      // Back Poster
      const posterB = new THREE.Mesh(new THREE.PlaneGeometry(2.35, 3.95), posterMat);
      posterB.position.set(0, 2.5, -0.12);
      posterB.rotation.y = Math.PI;
      monolithGroup.add(posterB);

      this.scene.add(monolithGroup);
      this.monolithMeshes.push(monolithGroup);
    });
  }

  wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "";
    let curY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, curY);
        line = words[n] + " ";
        curY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, curY);
  }

  buildStreetLamps() {
    const lampPositions = [0.1, 0.23, 0.36, 0.49, 0.62, 0.75, 0.88];
    lampPositions.forEach((tVal, i) => {
      const pt = this.roadCurve.getPointAt(tVal);
      const tg = this.roadCurve.getTangentAt(tVal);
      const up = new THREE.Vector3(0, 1, 0);
      const norm = new THREE.Vector3().crossVectors(tg, up).normalize();
      const side = i % 2 === 0 ? 3.8 : -3.8;
      const pos = new THREE.Vector3().copy(pt).addScaledVector(norm, side);

      const lampGroup = new THREE.Group();
      lampGroup.position.set(pos.x, pos.y, pos.z);

      // Mast pole
      const mastMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.3 });
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 6.2, 12), mastMat);
      mast.position.y = 3.1;
      mast.castShadow = true;
      lampGroup.add(mast);

      // Curved arm
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.4), mastMat);
      arm.position.set(0, 6.1, side > 0 ? -0.6 : 0.6);
      lampGroup.add(arm);

      // Lamp Head
      const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 0.1, 0.4),
        new THREE.MeshStandardMaterial({ color: 0x0f172a })
      );
      head.position.set(0, 6.05, side > 0 ? -1.2 : 1.2);
      lampGroup.add(head);

      // Bulb
      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xffedd5 })
      );
      bulb.position.set(0, 5.95, side > 0 ? -1.2 : 1.2);
      lampGroup.add(bulb);

      // Downward Light
      const pLight = new THREE.PointLight(0xffedd5, 1.2, 14);
      pLight.position.set(0, 5.8, side > 0 ? -1.2 : 1.2);
      lampGroup.add(pLight);

      this.scene.add(lampGroup);
    });
  }

  buildSkyClouds() {
    this.clouds = [];
    const cloudMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.65,
    });

    for (let i = 0; i < 22; i++) {
      const cloudGroup = new THREE.Group();
      const puffCount = 3 + Math.floor(Math.random() * 4);

      for (let p = 0; p < puffCount; p++) {
        const puff = new THREE.Mesh(
          new THREE.SphereGeometry(6 + Math.random() * 6, 8, 8),
          cloudMat
        );
        puff.position.set(
          (p - puffCount / 2) * 8 + (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 4
        );
        cloudGroup.add(puff);
      }

      cloudGroup.position.set(
        (Math.random() - 0.5) * 350,
        55 + Math.random() * 25,
        -Math.random() * 320
      );
      this.scene.add(cloudGroup);
      this.clouds.push(cloudGroup);
    }
  }

  // 2. BUILD THE 3D GUIDE AVATAR (SARTHAK'S AI AVATAR)
  buildCharacter() {
    this.charGroup = new THREE.Group();

    // Torso (Navy Blue Polo Shirt)
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.7 });
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.85, 0.38), shirtMat);
    torso.position.y = 1.35;
    torso.castShadow = true;
    this.charGroup.add(torso);

    // Collar detail
    const collar = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.12, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x172554 })
    );
    collar.position.set(0, 1.76, 0.02);
    this.charGroup.add(collar);

    // Head (Stylized developer head & hair)
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xf5d0b5, roughness: 0.65 });
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.42, 0.38), skinMat);
    head.position.y = 2.05;
    head.castShadow = true;
    this.charGroup.add(head);
    this.charHead = head;

    // Hair (Neat black hair)
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 });
    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 0.42), hairMat);
    hair.position.set(0, 2.25, -0.02);
    this.charGroup.add(hair);

    // Cute developer glasses
    const glassesMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const glasses = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.08, 0.04), glassesMat);
    glasses.position.set(0, 2.06, 0.2);
    this.charGroup.add(glasses);

    // Left Arm
    this.armL = new THREE.Group();
    this.armL.position.set(-0.46, 1.7, 0);
    const armLMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.72, 0.2), skinMat);
    armLMesh.position.y = -0.32;
    armLMesh.castShadow = true;
    this.armL.add(armLMesh);
    this.charGroup.add(this.armL);

    // Right Arm
    this.armR = new THREE.Group();
    this.armR.position.set(0.46, 1.7, 0);
    const armRMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.72, 0.2), skinMat);
    armRMesh.position.y = -0.32;
    armRMesh.castShadow = true;
    this.armR.add(armRMesh);
    this.charGroup.add(this.armR);

    // Shorts / Trousers
    const shortsMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });
    const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.32, 0.36), shortsMat);
    pelvis.position.y = 0.82;
    pelvis.castShadow = true;
    this.charGroup.add(pelvis);

    // Left Leg
    this.legL = new THREE.Group();
    this.legL.position.set(-0.18, 0.7, 0);
    const legLMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.65, 0.24), skinMat);
    legLMesh.position.y = -0.3;
    legLMesh.castShadow = true;
    this.legL.add(legLMesh);

    // Left Sneaker
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });
    const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.16, 0.44), shoeMat);
    shoeL.position.set(0, -0.62, 0.08);
    shoeL.castShadow = true;
    this.legL.add(shoeL);
    this.charGroup.add(this.legL);

    // Right Leg
    this.legR = new THREE.Group();
    this.legR.position.set(0.18, 0.7, 0);
    const legRMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.65, 0.24), skinMat);
    legRMesh.position.y = -0.3;
    legRMesh.castShadow = true;
    this.legR.add(legRMesh);

    // Right Sneaker
    const shoeR = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.16, 0.44), shoeMat);
    shoeR.position.set(0, -0.62, 0.08);
    shoeR.castShadow = true;
    this.legR.add(shoeR);
    this.charGroup.add(this.legR);

    // Shadow blob
    const shadowGeo = new THREE.PlaneGeometry(1.2, 1.2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35,
    });
    this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowMesh.rotation.x = -Math.PI / 2;
    this.shadowMesh.position.y = 0.06;
    this.charGroup.add(this.shadowMesh);

    this.scene.add(this.charGroup);
  }

  // 3. NAVIGATION API
  goToStep(index) {
    if (index < 0 || index >= this.steps.length) return;
    this.currentStepIndex = index;
    this.targetT = this.stepTValues[index];
    this.isWalking = true;
    this.onWalkingStateChange(true, this.steps[index]);
    this.onStepChange(index, this.steps[index]);
  }

  nextStep() {
    if (this.currentStepIndex < this.steps.length - 1) {
      this.goToStep(this.currentStepIndex + 1);
    }
  }

  prevStep() {
    if (this.currentStepIndex > 0) {
      this.goToStep(this.currentStepIndex - 1);
    }
  }

  // 4. ANIMATION LOOP
  loop() {
    if (!this.isRunning) return;
    this.animId = requestAnimationFrame(this.loop);

    const delta = Math.min(this.clock.getDelta(), 0.1);
    this.update(delta);
    this.renderer.render(this.scene, this.camera);
  }

  update(delta) {
    // Drifting clouds
    this.clouds.forEach((cloud) => {
      cloud.position.x += delta * 2.2;
      if (cloud.position.x > 180) {
        cloud.position.x = -180;
      }
    });

    // Pulsating checkpoint rings
    const time = this.clock.getElapsedTime();
    this.beaconRings.forEach((b, idx) => {
      const isActive = idx === this.currentStepIndex;
      const pulse = 1.0 + Math.sin(time * 3 + idx) * (isActive ? 0.12 : 0.04);
      b.inner.scale.set(pulse, pulse, 1);
      b.inner.material.opacity = isActive ? 0.95 : 0.45;
      b.outer.material.opacity = isActive ? 0.8 : 0.25;
    });

    // Character movement along road curve
    const diff = this.targetT - this.currentT;
    const dist = Math.abs(diff);

    if (dist > 0.001) {
      this.isWalking = true;
      const stepDist = Math.min(dist, this.walkSpeed * delta);
      this.currentT += Math.sign(diff) * stepDist;

      // Play soft footstep clicks
      this.footstepTimer += delta;
      if (this.footstepTimer > 0.32) {
        roadmapAudio.playFootstep();
        this.footstepTimer = 0;
      }

      // Animate walking limbs
      this.walkCycle += delta * 11;
      const stride = Math.sin(this.walkCycle);
      this.legL.rotation.x = stride * 0.65;
      this.legR.rotation.x = -stride * 0.65;
      this.armL.rotation.x = -stride * 0.55;
      this.armR.rotation.x = stride * 0.55;

      // Vertical hip bounce & knee flexion
      this.charGroup.position.y = (this.roadCurve.getPointAt(this.currentT).y || 0) + Math.abs(Math.sin(this.walkCycle * 2)) * 0.06;
    } else {
      if (this.isWalking) {
        this.isWalking = false;
        this.currentT = this.targetT;
        this.onWalkingStateChange(false, this.steps[this.currentStepIndex]);
        this.onStepReached(this.currentStepIndex, this.steps[this.currentStepIndex]);
        roadmapAudio.playMilestoneChime();
      }

      // Idle breathing & gentle greeting
      this.idleAnimTime += delta;
      const breathe = Math.sin(this.idleAnimTime * 2.5);
      this.legL.rotation.x = THREE.MathUtils.lerp(this.legL.rotation.x, 0, 0.1);
      this.legR.rotation.x = THREE.MathUtils.lerp(this.legR.rotation.x, 0, 0.1);
      this.armL.rotation.x = THREE.MathUtils.lerp(this.armL.rotation.x, 0, 0.1);
      this.armR.rotation.x = THREE.MathUtils.lerp(this.armR.rotation.x, 0.2 + breathe * 0.1, 0.1);
      this.charHead.rotation.y = Math.sin(this.idleAnimTime * 1.5) * 0.15;
    }

    this.updateCharacterTransform(this.currentT);
    this.updateCamera(delta);
  }

  updateCharacterTransform(t) {
    const clampedT = Math.max(0, Math.min(1, t));
    const pt = this.roadCurve.getPointAt(clampedT);
    const tg = this.roadCurve.getTangentAt(clampedT);

    this.charGroup.position.x = pt.x;
    this.charGroup.position.z = pt.z;

    // Face forward along road tangent
    const targetAngle = Math.atan2(tg.x, tg.z);
    this.charGroup.rotation.y = targetAngle;
  }

  updateCamera(delta) {
    const pt = this.roadCurve.getPointAt(this.currentT);
    const tg = this.roadCurve.getTangentAt(this.currentT);

    if (this.cameraMode === "follow") {
      // Cinematic 3rd-person chase camera positioned behind and slightly above avatar
      const idealCamPos = new THREE.Vector3()
        .copy(pt)
        .addScaledVector(tg, -7.2)
        .add(new THREE.Vector3(0, 3.8, 0));

      // Apply orbit offsets if dragging
      if (this.camOrbitYaw !== 0 || this.camOrbitPitch !== 0) {
        const offset = idealCamPos.clone().sub(pt);
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.camOrbitYaw);
        offset.y += this.camOrbitPitch * 4;
        idealCamPos.copy(pt).add(offset);
      }

      this.camera.position.lerp(idealCamPos, delta === 1.0 ? 1.0 : Math.min(1.0, delta * 3.8));

      // Look slightly ahead of character
      const targetLookAt = new THREE.Vector3().copy(pt).add(new THREE.Vector3(0, 1.8, 0)).addScaledVector(tg, 4.5);
      this.camera.lookAt(targetLookAt);
    }
  }
}
