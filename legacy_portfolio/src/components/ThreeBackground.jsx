import { useEffect, useRef } from "react";
import * as THREE from "three";

const THEME_CONFIGS = {
  stark: {
    primaryColor: 0x38bdf8, // Ice blue
    secondaryColor: 0xe0f2fe, // Frost white
    accentColor: 0x93c5fd,
    particleCount: 700,
    speedY: -0.35, // Falling frost
    speedX: 0.15,
  },
  targaryen: {
    primaryColor: 0xef4444, // Dragon fire red
    secondaryColor: 0xf97316, // Fire orange
    accentColor: 0xfbbf24, // Gold flame
    particleCount: 750,
    speedY: 0.55, // Rising embers
    speedX: 0.1,
  },
  lannister: {
    primaryColor: 0xf59e0b, // Lion gold
    secondaryColor: 0xfde68a, // Shimmering light gold
    accentColor: 0xd97706, // Deep amber
    particleCount: 650,
    speedY: 0.2, // Drifting golden dust
    speedX: 0.25,
  },
};

function ThreeBackground({ houseTheme = "stark", isDark = true }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
    camera.position.z = 400;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.position = "fixed";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.pointerEvents = "none";
    renderer.domElement.style.zIndex = "0";
    container.appendChild(renderer.domElement);

    // 3. Particles
    const cfg = THEME_CONFIGS[houseTheme] || THEME_CONFIGS.stark;
    const particleCount = cfg.particleCount;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);
    const speeds = new Float32Array(particleCount);

    const c1 = new THREE.Color(cfg.primaryColor);
    const c2 = new THREE.Color(cfg.secondaryColor);
    const c3 = new THREE.Color(cfg.accentColor);
    const colorPalette = [c1, c2, c3];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1200;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 1000;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 800;

      const chosenColor =
        colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;

      scales[i] = Math.random() * 3 + 1.2;
      speeds[i] = (Math.random() * 0.5 + 0.8);
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // Custom circular soft glow texture for particles
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.3, "rgba(255, 255, 255, 0.7)");
    gradient.addColorStop(0.7, "rgba(255, 255, 255, 0.15)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);

    const particleTexture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: isDark ? 6.5 : 5.0,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: isDark ? 0.65 : 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    // 4. Subtle 3D Geometric Ring in Background
    const ringGeo = new THREE.TorusGeometry(260, 1.2, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: cfg.primaryColor,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.12 : 0.07,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.set(200, 50, -100);
    ringMesh.rotation.x = 1.1;
    scene.add(ringMesh);

    // 5. Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.12;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.12;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // 6. Resize Handler
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // 7. Animation Loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Smooth camera interpolation
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;
      camera.position.x = targetX;
      camera.position.y = -targetY;
      camera.lookAt(scene.position);

      // Rotate decorative ring
      ringMesh.rotation.z += 0.002;
      ringMesh.rotation.y += 0.001;

      // Drift particles
      const posAttr = geometry.attributes.position;
      const posArr = posAttr.array;

      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        posArr[idx + 1] += cfg.speedY * speeds[i];
        posArr[idx] += Math.sin(i + posArr[idx + 1] * 0.01) * cfg.speedX;

        // Wrap around boundaries
        if (cfg.speedY < 0 && posArr[idx + 1] < -500) {
          posArr[idx + 1] = 500;
        } else if (cfg.speedY > 0 && posArr[idx + 1] > 500) {
          posArr[idx + 1] = -500;
        }
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // 8. Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      particleTexture.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      renderer.dispose();
    };
  }, [houseTheme, isDark]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
}

export default ThreeBackground;
