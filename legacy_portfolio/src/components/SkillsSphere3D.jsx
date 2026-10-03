import { useEffect, useRef, useState } from "react";
import { skills } from "../data";

function SkillsSphere3D({ radius = 170 }) {
  const containerRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [activeSkill, setActiveSkill] = useState(null);

  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0.003, y: 0.004 });
  const animFrameRef = useRef(null);
  const rotRef = useRef({ x: 0, y: 0 });

  // Calculate spherical coordinates for items using Fibonacci sphere algorithm
  const tags = skills.map((skill, index) => {
    const phi = Math.acos(-1 + (2 * index + 1) / skills.length);
    const theta = Math.sqrt(skills.length * Math.PI) * phi;
    return {
      text: skill,
      x: radius * Math.cos(theta) * Math.sin(phi),
      y: radius * Math.sin(theta) * Math.sin(phi),
      z: radius * Math.cos(phi),
    };
  });

  useEffect(() => {
    const handlePointerDown = (e) => {
      isDraggingRef.current = true;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      lastMouseRef.current = { x: clientX, y: clientY };
    };

    const handlePointerMove = (e) => {
      if (!isDraggingRef.current) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      const deltaX = clientX - lastMouseRef.current.x;
      const deltaY = clientY - lastMouseRef.current.y;

      velocityRef.current = {
        x: -deltaY * 0.0007,
        y: deltaX * 0.0007,
      };

      rotRef.current.x += velocityRef.current.x;
      rotRef.current.y += velocityRef.current.y;

      lastMouseRef.current = { x: clientX, y: clientY };
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousedown", handlePointerDown);
      container.addEventListener("touchstart", handlePointerDown, { passive: true });
      window.addEventListener("mousemove", handlePointerMove);
      window.addEventListener("touchmove", handlePointerMove, { passive: true });
      window.addEventListener("mouseup", handlePointerUp);
      window.addEventListener("touchend", handlePointerUp);
    }

    // Animation Loop
    const animate = () => {
      if (!isDraggingRef.current) {
        // Apply friction and continuous subtle rotation
        velocityRef.current.x = velocityRef.current.x * 0.96 + 0.0008;
        velocityRef.current.y = velocityRef.current.y * 0.96 + 0.0012;
        rotRef.current.x += velocityRef.current.x;
        rotRef.current.y += velocityRef.current.y;
      }
      setRotation({ x: rotRef.current.x, y: rotRef.current.y });
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (container) {
        container.removeEventListener("mousedown", handlePointerDown);
        container.removeEventListener("touchstart", handlePointerDown);
      }
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, [radius]);

  // Project 3D coordinates based on rotation
  const cosX = Math.cos(rotation.x);
  const sinX = Math.sin(rotation.x);
  const cosY = Math.cos(rotation.y);
  const sinY = Math.sin(rotation.y);

  const projectedTags = tags.map((tag) => {
    // Rotate around Y axis
    const x1 = tag.x * cosY - tag.z * sinY;
    const z1 = tag.z * cosY + tag.x * sinY;

    // Rotate around X axis
    const y2 = tag.y * cosX - z1 * sinX;
    const z2 = z1 * cosX + tag.y * sinX;

    // Perspective scale calculation
    const perspective = 350;
    const scale = (perspective + z2) / perspective;
    const alpha = Math.max(0.2, (z2 + radius) / (2 * radius));

    return {
      text: tag.text,
      x: x1,
      y: y2,
      z: z2,
      scale: Math.max(0.65, scale),
      opacity: alpha,
      zIndex: Math.round(z2 + radius),
    };
  });

  return (
    <div className="flex flex-col items-center">
      <div
        ref={containerRef}
        className="relative flex h-[380px] w-full max-w-[420px] cursor-grab select-none items-center justify-center active:cursor-grabbing"
        title="Interactive 3D Skills Sphere - Drag to Spin"
      >
        {projectedTags.map((tag, i) => {
          const isSelected = activeSkill === tag.text;
          return (
            <div
              key={i}
              onClick={() => setActiveSkill(tag.text === activeSkill ? null : tag.text)}
              style={{
                position: "absolute",
                transform: `translate3d(${tag.x}px, ${tag.y}px, 0px) scale(${tag.scale})`,
                opacity: isSelected ? 1 : tag.opacity,
                zIndex: isSelected ? 999 : tag.zIndex,
                pointerEvents: tag.z > -40 ? "auto" : "none",
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold backdrop-blur-md transition-colors duration-200 ${
                isSelected
                  ? "bg-brand-500 text-white shadow-lg shadow-brand-500/50 ring-2 ring-gold-400"
                  : "border border-amber-900/30 bg-amber-100/90 text-amber-950 hover:bg-gold-500 hover:text-slate-950 dark:border-gold-500/40 dark:bg-slate-900/80 dark:text-gold-200 dark:hover:bg-gold-400 dark:hover:text-slate-950"
              }`}
            >
              {tag.text}
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-xs font-medium tracking-wide text-slate-500 dark:text-slate-400">
        🖱️ Click & Drag to spin the 3D Sphere • Click tag to highlight
      </p>
    </div>
  );
}

export default SkillsSphere3D;
