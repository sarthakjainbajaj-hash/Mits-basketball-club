function Experience() {
  const experiences = [
    {
      title: "Software Engineer Intern",
      company: "Yuga Yatra",
      period: "2026 • Internship",
      icon: "💼",
      bullets: [
        "Architected and developed modular, responsive web interface components in React.js and Tailwind CSS.",
        "Integrated RESTful API endpoints and optimized frontend rendering for smooth, accessible user experiences.",
        "Collaborated with the engineering team adhering to Git version control, agile workflows, and code reviews.",
      ],
      skills: ["React.js", "JavaScript", "Tailwind CSS", "REST APIs", "Git", "Web Development"],
    },
  ];

  return (
    <section id="experience" className="section-wrap animate-fadeInUp">
      <p className="section-badge">War Council</p>
      <h3 className="section-title">Professional Experience</h3>
      <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
        Industry internships and engineering apprenticeships applying full-stack architecture, machine learning, and data analytics.
      </p>

      <div className="mt-10 space-y-6">
        {experiences.map((exp, index) => (
          <div
            key={index}
            className="glass-card rounded-2xl p-6 sm:p-8 shadow-sm transition hover:border-gold-500/40"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{exp.icon}</span>
                <div>
                  <h4 className="text-xl font-black font-heading text-slate-900 dark:text-slate-100">
                    {exp.title}
                  </h4>
                  <p className="text-sm font-bold text-brand-600 dark:text-brand-400">
                    {exp.company}
                  </p>
                </div>
              </div>
              <span className="self-start sm:self-center rounded-full border border-gold-500/40 bg-gold-500/10 px-3 py-1 text-xs font-bold text-gold-600 dark:text-gold-400">
                {exp.period}
              </span>
            </div>

            <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300 list-disc list-inside">
              {exp.bullets.map((b, bIdx) => (
                <li key={bIdx} className="leading-relaxed">
                  {b}
                </li>
              ))}
            </ul>

            <div className="mt-5 flex flex-wrap gap-2 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
              {exp.skills.map((s, sIdx) => (
                <span
                  key={sIdx}
                  className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-300"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Experience;