import { useState } from "react";
import { skills } from "../data";
import SkillsSphere3D from "./SkillsSphere3D";
import TiltCard from "./TiltCard";

function Skills() {
  const [viewMode, setViewMode] = useState("3d");

  return (
    <section id="skills" className="section-wrap animate-fadeInUp">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="section-badge">Arsenal</p>
          <h3 className="section-title">Skills</h3>
        </div>

        {/* View Toggle */}
        <div className="flex rounded-full border border-gold-500/30 bg-slate-900/80 p-1 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setViewMode("3d")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              viewMode === "3d"
                ? "bg-gradient-to-r from-brand-600 to-gold-500 text-white shadow"
                : "text-slate-400 hover:text-gold-300"
            }`}
          >
            <span>🌐</span> 3D Sphere
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              viewMode === "grid"
                ? "bg-gradient-to-r from-brand-600 to-gold-500 text-white shadow"
                : "text-slate-400 hover:text-gold-300"
            }`}
          >
            <span>📑</span> Grid
          </button>
        </div>
      </div>

      <div className="mt-8">
        {viewMode === "3d" ? (
          <div className="flex justify-center py-6">
            <SkillsSphere3D radius={160} />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {skills.map((skill) => (
              <TiltCard key={skill} maxTilt={15} scale={1.04}>
                <div className="glass-card rounded-xl px-4 py-4 text-center text-sm font-semibold transition duration-300 hover:border-brand-500 hover:shadow-md">
                  {skill}
                </div>
              </TiltCard>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Skills;
