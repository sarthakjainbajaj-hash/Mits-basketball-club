import { projects } from "../data";
import ProjectCard from "./ProjectCard";
import SolveSphereLiveShowcase from "./SolveSphereLiveShowcase";

function Projects() {
  return (
    <section id="projects" className="section-wrap animate-fadeInUp">
      <p className="section-badge">Campaign Ledger</p>
      <h3 className="section-title">Battles Won & Live Deployments</h3>
      <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
        Engineered web platforms, machine learning solutions, and
        embedded systems. Test the live flagship deployment below or explore the repository archives.
      </p>

      {/* Flagship Live Interactive Showcase */}
      <div className="mt-10">
        <SolveSphereLiveShowcase />
      </div>

      <div className="mb-6 flex items-center gap-3">
        <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-heading">
          All Project Archives
        </h4>
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
      </div>

      <div className="grid gap-7 md:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>
    </section>
  );
}

export default Projects;
