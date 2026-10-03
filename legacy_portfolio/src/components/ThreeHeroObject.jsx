import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const HOUSE_PALETTES = {
  stark: {
    core: 0x38bdf8,
    wireframe: 0x7dd3fc,
    ring1: 0x0284c7,
    ring2: 0xbae6fd,
    light: 0x67e8f9,
    label: "Frost Sigil Core",
  },
  targaryen: {
    core: 0xef4444,
    wireframe: 0xf97316,
    ring1: 0xb91c1c,
    ring2: 0xfde047,
    light: 0xf97316,
    label: "Dragon Core",
  },
  lannister: {
    core: 0xf59e0b,
    wireframe: 0xfbbf24,
    ring1: 0xd97706,
    ring2: 0xfef08a,
    light: 0xfbbf24,
    label: "Golden Lion Astrolabe",
  },
};

function ThreeHeroObject({ houseTheme = "stark" }) {
  const mountRef = useRef(null);
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 6.2;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = false;
    container.appendChild(renderer.domElement);

    const palette = HOUSE_PALETTES[houseTheme] || HOUSE_PALETTES.stark;

    // 3. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(palette.light, 2.5, 20);
    pointLight.position.set(4, 5, 4);
    scene.add(pointLight);

    const backLight = new THREE.PointLight(0xffffff, 1.2, 20);
    backLight.position.set(-4, -3, -3);
    scene.add(backLight);

    // 4. Center Group for rotation
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 4a. Inner faceted crystal (Icosahedron)
    const innerGeo = new THREE.IcosahedronGeometry(1.3, 0);
    const innerMat = new THREE.MeshStandardMaterial({
      color: palette.core,
      metalness: 0.85,
      roughness: 0.2,
      flatShading: true,
      emissive: palette.core,
      emissiveIntensity: 0.25,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    mainGroup.add(innerMesh);

    // 4b. Outer protective cage (Dodecahedron wireframe)
    const outerGeo = new THREE.DodecahedronGeometry(1.8, 0);
    const outerWireMat = new THREE.MeshBasicMaterial({
      color: palette.wireframe,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerWireMat);
    mainGroup.add(outerMesh);

    // 4c. Astrolabe Ring 1
    const ring1Geo = new THREE.TorusGeometry(2.2, 0.04, 16, 80);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: palette.ring1,
      metalness: 0.9,
      roughness: 0.1,
    });
    const ring1Mesh = new THREE.Mesh(ring1Geo, ring1Mat);
    mainGroup.add(ring1Mesh);

    // 4d. Astrolabe Ring 2
    const ring2Geo = new THREE.TorusGeometry(2.5, 0.035, 16, 80);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: palette.ring2,
      metalness: 0.9,
      roughness: 0.1,
    });
    const ring2Mesh = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2Mesh.rotation.x = Math.PI / 2;
    mainGroup.add(ring2Mesh);

    // 4e. Floating satellite node points
    const particleCount = 40;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * 0.8 + 2.4;
      const sinPhi = Math.sin(phi);
      pPos[i * 3] = r * sinPhi * Math.cos(theta);
      pPos[i * 3 + 1] = r * sinPhi * Math.sin(theta);
      pPos[i * 3 + 2] = r * Math.cos(phi);
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: palette.wireframe,
      size: 0.08,
      transparent: true,
      opacity: 0.85,
    });
    const pMesh = new THREE.Points(pGeo, pMat);
    mainGroup.add(pMesh);

    // 5. Interactive Drag & Mouse Controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotSpeedX = 0;
    let rotSpeedY = 0;

    const onPointerDown = (e) => {
      isDragging = true;
      setIsInteracting(true);
      prevMouseX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      prevMouseY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      const deltaX = clientX - prevMouseX;
      const deltaY = clientY - prevMouseY;

      rotSpeedY = deltaX * 0.008;
      rotSpeedX = deltaY * 0.008;

      mainGroup.rotation.y += rotSpeedY;
      mainGroup.rotation.x += rotSpeedX;

      prevMouseX = clientX;
      prevMouseY = clientY;
    };

    const onPointerUp = () => {
      isDragging = false;
      setIsInteracting(false);
    };

    const domElement = renderer.domElement;
    domElement.addEventListener("mousedown", onPointerDown);
    domElement.addEventListener("touchstart", onPointerDown, { passive: true });
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("touchmove", onPointerMove, { passive: true });
    window.addEventListener("mouseup", onPointerUp);
    window.addEventListener("touchend", onPointerUp);

    // 6. Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 320;
      const h = container.clientHeight || 320;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // 7. Animation loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!isDragging) {
        // Natural idle rotation
        mainGroup.rotation.y += 0.007;
        mainGroup.rotation.x += 0.003;
        rotSpeedX *= 0.95;
        rotSpeedY *= 0.95;
        mainGroup.rotation.x += rotSpeedX;
        mainGroup.rotation.y += rotSpeedY;
      }

      // Counter-rotations for mechanical astrolabe feel
      ring1Mesh.rotation.z += 0.012;
      ring2Mesh.rotation.y += 0.015;
      outerMesh.rotation.y -= 0.005;
      innerMesh.rotation.x += 0.005;

      renderer.render(scene, camera);
    };

    animate();

    // 8. Cleanup
    return () => {
      cancelAnimationFrame(animId);
      domElement.removeEventListener("mousedown", onPointerDown);
      domElement.removeEventListener("touchstart", onPointerDown);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUp);
      window.removeEventListener("touchend", onPointerUp);
      window.removeEventListener("resize", handleResize);
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
      innerGeo.dispose();
      innerMat.dispose();
      outerGeo.dispose();
      outerWireMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      pGeo.dispose();
      pMat.dispose();
      renderer.dispose();
    };
  }, [houseTheme]);

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div
        ref={mountRef}
        className={`h-72 w-72 sm:h-80 sm:w-80 cursor-grab active:cursor-grabbing transition-transform duration-300 ${
          isInteracting ? "scale-105" : "hover:scale-102"
        }`}
        title="Interactive 3D Core - Drag to rotate in 3D"
      />
      <span className="mt-1 flex items-center gap-1.5 rounded-full border border-gold-500/30 bg-slate-950/70 px-3 py-1 text-[11px] font-medium tracking-wider text-gold-300 backdrop-blur-md">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-gold-400" />
        Interactive 3D Astrolabe • Drag to Rotate
      </span>
    </div>
  );
}

export default ThreeHeroObject;
