import { useState } from "react";
import { certifications } from "../data";
import TiltCard from "./TiltCard";

function Certifications() {
  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'tech' | 'sports'

  const filteredCerts = certifications.filter((cert) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "sports") return cert.category === "Sports";
    if (activeFilter === "tech") return cert.category !== "Sports";
    return true;
  });

  return (
    <section id="certifications" className="section-wrap animate-fadeInUp">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="section-badge">Royal Archives</p>
          <h3 className="section-title">Certifications & Honors</h3>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300 text-sm">
            Verified learning credentials across software engineering, enterprise data analysis, and competitive athletics.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-1 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              activeFilter === "all"
                ? "bg-gradient-to-r from-brand-600 to-gold-600 text-white shadow"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            All ({certifications.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("tech")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              activeFilter === "tech"
                ? "bg-gradient-to-r from-brand-600 to-gold-600 text-white shadow"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            💻 Tech & Software
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("sports")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              activeFilter === "sports"
                ? "bg-gradient-to-r from-brand-600 to-gold-600 text-white shadow"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            🏆 Sports & Fitness
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {filteredCerts.map((cert) => (
          <TiltCard key={`${cert.issuer}-${cert.title}`} maxTilt={8} scale={1.02} className="h-full">
            <article
              className="platinum-card group h-full rounded-2xl p-6 transition-shadow duration-300 hover:shadow-premium"
            >
            <div className="flex items-start justify-between gap-3">
              <h4 className="text-lg font-semibold text-slate-900">{cert.title}</h4>
              <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                cert.category === "Sports"
                  ? "border-amber-500/50 bg-amber-100 text-amber-800"
                  : "border-slate-500/40 bg-slate-100/80 text-slate-700"
              }`}>
                {cert.category}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-700">{cert.issuer}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {cert.date}
            </p>

            <ul className="mt-4 flex flex-wrap gap-2">
              {cert.highlights.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-slate-500/35 bg-white/70 px-3 py-1 text-xs text-slate-700"
                >
                  {item}
                </li>
              ))}
            </ul>
          </article>
          </TiltCard>
        ))}
      </div>
    </section>
  );
}

export default Certifications;
