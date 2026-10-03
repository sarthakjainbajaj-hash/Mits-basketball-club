import { FaCode, FaExternalLinkAlt } from "react-icons/fa";
import TiltCard from "./TiltCard";

function ProjectCard({ project }) {
  const hasLinks = project.liveUrl || project.githubUrl;

  return (
    <TiltCard maxTilt={8} scale={1.02} className="h-full">
      <article className="parchment-card group flex h-full flex-col justify-between rounded-3xl p-6 sm:p-7 transition-all duration-300 hover:shadow-premium">
        <div>
          {/* Header Tag & Category */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-amber-900/15">
            <span className="rounded-full border border-amber-700/30 bg-amber-500/15 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-950 dark:text-amber-900">
              {project.tag || "Production System"}
            </span>
            <span className="text-[11px] font-bold text-amber-900/70">
              {project.category}
            </span>
          </div>

          <h4 className="mt-4 text-xl font-black font-heading text-slate-900">
            {project.title}
          </h4>

          <p className="mt-3 text-sm leading-relaxed text-amber-950/85">
            {project.description}
          </p>

          {/* Metric Highlight */}
          {project.metrics && (
            <div className="mt-4 rounded-xl border border-amber-900/20 bg-amber-950/5 p-2.5 text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <span>📈</span>
              <span>{project.metrics}</span>
            </div>
          )}

          {/* Tech Stack Pills */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="rounded-lg bg-amber-100/90 border border-amber-900/10 px-2.5 py-1 text-[11px] font-bold text-amber-900 transition"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Action Links */}
        <div className="mt-6 flex flex-wrap items-center gap-3 pt-4 border-t border-amber-900/15">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow transition duration-200 hover:-translate-y-0.5 hover:bg-brand-500"
            >
              <FaExternalLinkAlt size={11} />
              <span>Explore Deployment</span>
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-amber-900/30 bg-amber-50/50 px-4 py-2 text-xs font-bold text-amber-900 transition duration-200 hover:-translate-y-0.5 hover:border-amber-700 hover:text-amber-700"
            >
              <FaCode size={12} />
              <span>GitHub Repo</span>
            </a>
          )}
        </div>
      </article>
    </TiltCard>
  );
}

export default ProjectCard;
