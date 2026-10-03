import {
  FaBriefcase,
  FaCertificate,
  FaCode,
  FaEnvelope,
  FaExternalLinkAlt,
  FaGithub,
  FaGraduationCap,
  FaGlobe,
  FaLinkedin,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaPrint,
  FaTrophy,
} from "react-icons/fa";

function Resume() {
  const handlePrint = () => {
    window.open("/resume.html", "_blank");
  };

  const skills = [
    { name: "Python", category: "Programming", level: 85 },
    { name: "JavaScript", category: "Programming", level: 80 },
    { name: "C / C++", category: "Programming", level: 80 },
    { name: "React.js", category: "Web Development", level: 85 },
    { name: "Node.js", category: "Web Development", level: 80 },
    { name: "Express.js", category: "Web Development", level: 75 },
    { name: "MongoDB", category: "Database", level: 75 },
    { name: "HTML / CSS", category: "Web Development", level: 90 },
    { name: "Git / GitHub", category: "Tools", level: 85 },
    { name: "VS Code", category: "Tools", level: 90 },
  ];

  return (
    <section id="resume" className="section-wrap animate-fadeInUp">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="section-badge">Grand Maester's Scroll</p>
          <h3 className="section-title">Curriculum Vitae</h3>
        </div>
        <button
          onClick={handlePrint}
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-gold-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition duration-300 hover:-translate-y-0.5 hover:shadow-gold-500/20"
        >
          <FaPrint size={15} />
          <span>Open & Print PDF</span>
        </button>
      </div>

      {/* Resume Card Container */}
      <div className="glass-card overflow-hidden rounded-3xl border border-brand-700/40 bg-slate-950/85 p-6 shadow-2xl backdrop-blur-xl sm:p-10 dark:border-gold-500/30">
        {/* Header Profile */}
        <div className="grid gap-8 border-b border-brand-800/40 pb-8 md:grid-cols-[auto_1fr] md:items-center">
          <div className="relative mx-auto md:mx-0">
            <div className="h-36 w-32 overflow-hidden rounded-2xl border-2 border-gold-500/70 shadow-xl sm:h-44 sm:w-36">
              <img
                src="/photo.jpeg"
                alt="Sarthak Jain Bajaj"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/sarthak-photo.png";
                }}
              />
            </div>
            <div className="absolute -bottom-2 -right-2 rounded-full border border-gold-500/80 bg-slate-900 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold-400 shadow">
              Active
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-extrabold text-slate-100 sm:text-4xl font-heading">
              Sarthak Jain Bajaj
            </h1>
            <p className="mt-1 text-base font-semibold text-gold-400 font-heading">
              B.Tech AI & Data Science • Web Developer • Embedded Systems
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Second-year B.Tech student in Artificial Intelligence and Data Science with hands-on experience in web development and embedded systems. Skilled in building scalable applications and real-time systems. Seeking an internship or entry-level role to apply technical and problem-solving skills in real-world environments.
            </p>

            {/* Contact Info Pills */}
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-brand-700/50 bg-slate-900/80 px-3 py-1.5 text-slate-300">
                <FaMapMarkerAlt className="text-gold-400" />
                Tikamgarh, Madhya Pradesh, India
              </span>
              <a
                href="tel:+919131255449"
                className="inline-flex items-center gap-1.5 rounded-lg border border-brand-700/50 bg-slate-900/80 px-3 py-1.5 text-slate-300 hover:border-gold-500 hover:text-gold-300"
              >
                <FaPhoneAlt className="text-gold-400" />
                +91-9131255449
              </a>
              <a
                href="mailto:sarthakjainbajaj@gmail.com"
                className="inline-flex items-center gap-1.5 rounded-lg border border-brand-700/50 bg-slate-900/80 px-3 py-1.5 text-slate-300 hover:border-gold-500 hover:text-gold-300"
              >
                <FaEnvelope className="text-gold-400" />
                sarthakjainbajaj@gmail.com
              </a>
              <a
                href="https://linkedin.com/in/sarthak-jain-bajaj-2550a63a2"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-brand-700/50 bg-slate-900/80 px-3 py-1.5 text-slate-300 hover:border-gold-500 hover:text-gold-300"
              >
                <FaLinkedin className="text-gold-400" />
                LinkedIn
              </a>
              <a
                href="https://portfolio-4vp2.vercel.app/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-brand-700/50 bg-slate-900/80 px-3 py-1.5 text-slate-300 hover:border-gold-500 hover:text-gold-300"
              >
                <FaGlobe className="text-gold-400" />
                portfolio-4vp2.vercel.app
              </a>
            </div>
          </div>
        </div>

        {/* 2-Column Section */}
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          {/* Main Column */}
          <div className="space-y-8">
            {/* Experience */}
            <div>
              <h4 className="flex items-center gap-2 border-b border-brand-800/40 pb-2 text-lg font-bold text-slate-100 font-heading">
                <FaBriefcase className="text-gold-400" />
                Work Experience
              </h4>
              <div className="mt-4 space-y-4">
                <div className="rounded-xl border border-brand-800/40 bg-slate-900/60 p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-1">
                    <h5 className="text-base font-semibold text-slate-100">Web Development Intern</h5>
                    <span className="rounded bg-brand-900/80 px-2 py-0.5 text-xs font-bold text-gold-400">2026</span>
                  </div>
                  <p className="text-xs font-semibold text-brand-400">Yuga Yatra</p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-300">
                    Worked on web development and application development tasks. Gained hands-on experience with modern web technologies.
                  </p>
                </div>
              </div>
            </div>

            {/* Projects */}
            <div>
              <h4 className="flex items-center gap-2 border-b border-brand-800/40 pb-2 text-lg font-bold text-slate-100 font-heading">
                <FaCode className="text-gold-400" />
                Projects
              </h4>
              <div className="mt-4 space-y-4">
                <div className="rounded-xl border border-brand-800/40 bg-slate-900/60 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-base font-semibold text-slate-100">SolveSphere</h5>
                      <p className="text-xs text-brand-400 font-medium">AI-Powered Collaborative Problem-Solving Platform</p>
                    </div>
                    <span className="rounded bg-emerald-950/80 border border-emerald-500/50 px-2 py-0.5 text-[11px] font-bold text-emerald-400">
                      Live
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-300">
                    Developed a digital platform to crowdsource societal challenges and connect universities, students, innovators, and industry partners. Proposed an AI-assisted approach to analyze challenges and facilitate team formation.
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-semibold">
                    <a
                      href="https://solvesphere-three.vercel.app/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-gold-400 hover:underline flex items-center gap-1"
                    >
                      Live Demo <FaExternalLinkAlt size={10} />
                    </a>
                    <a
                      href="https://github.com/sarthakjainbajaj-hash/portfolio"
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-300 hover:underline flex items-center gap-1"
                    >
                      <FaGithub size={12} /> GitHub Repository
                    </a>
                  </div>
                </div>

                <div className="rounded-xl border border-brand-800/40 bg-slate-900/60 p-4">
                  <h5 className="text-base font-semibold text-slate-100">Parking Lot Management System</h5>
                  <p className="text-xs text-brand-400 font-medium">React, Flask</p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-300">
                    Developed a system to automatically manage parking slots using React and Flask and deployed it on a cloud platform for accessibility and scalability.
                  </p>
                </div>

                <div className="rounded-xl border border-brand-800/40 bg-slate-900/60 p-4">
                  <h5 className="text-base font-semibold text-slate-100">Student Report Card Generator</h5>
                  <p className="text-xs text-brand-400 font-medium">React, Flask</p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-300">
                    Created a tool to automatically generate student report cards and store data for future use, utilizing React and Flask and deployed on a cloud platform.
                  </p>
                </div>
              </div>
            </div>

            {/* Certifications */}
            <div>
              <h4 className="flex items-center gap-2 border-b border-brand-800/40 pb-2 text-lg font-bold text-slate-100 font-heading">
                <FaCertificate className="text-gold-400" />
                Certifications
              </h4>
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2 text-xs">
                <div className="rounded-lg border border-brand-800/40 bg-slate-900/60 p-3">
                  <p className="font-semibold text-slate-100">Data Analysis and Forensic Technology</p>
                  <p className="text-gold-400 font-medium mt-0.5">Deloitte</p>
                </div>
                <div className="rounded-lg border border-brand-800/40 bg-slate-900/60 p-3">
                  <p className="font-semibold text-slate-100">Coding and Development</p>
                  <p className="text-gold-400 font-medium mt-0.5">Deloitte</p>
                </div>
                <div className="rounded-lg border border-brand-800/40 bg-slate-900/60 p-3">
                  <p className="font-semibold text-slate-100">Data Science and Artificial Intelligence</p>
                  <p className="text-gold-400 font-medium mt-0.5">IIT Roorkee</p>
                </div>
                <div className="rounded-lg border border-brand-800/40 bg-slate-900/60 p-3">
                  <p className="font-semibold text-slate-100">AI Tools and ChatGPT Workshop</p>
                  <p className="text-gold-400 font-medium mt-0.5">be10x</p>
                </div>
                <div className="rounded-lg border border-brand-800/40 bg-slate-900/60 p-3 sm:col-span-2">
                  <p className="font-semibold text-slate-100">Professional Certification</p>
                  <p className="text-gold-400 font-medium mt-0.5">JPMorgan Chase & Co.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            {/* Technical Skills */}
            <div>
              <h4 className="flex items-center gap-2 border-b border-brand-800/40 pb-2 text-lg font-bold text-slate-100 font-heading">
                <FaCode className="text-gold-400" />
                Technical Skills
              </h4>
              <div className="mt-4 space-y-3">
                {skills.map((s) => (
                  <div key={s.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-200">{s.name}</span>
                      <span className="text-slate-400 text-[11px]">{s.category} ({s.level}%)</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-gold-500"
                        style={{ width: `${s.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div>
              <h4 className="flex items-center gap-2 border-b border-brand-800/40 pb-2 text-lg font-bold text-slate-100 font-heading">
                <FaGraduationCap className="text-gold-400" />
                Education
              </h4>
              <div className="mt-4 space-y-3">
                <div className="rounded-xl border border-brand-800/40 bg-slate-900/60 p-3.5">
                  <span className="text-[11px] font-bold text-gold-400">2025 - 2029</span>
                  <h5 className="text-xs font-semibold text-slate-100 mt-0.5">
                    B.Tech in Artificial Intelligence and Data Science
                  </h5>
                  <p className="text-[11px] text-slate-400">Madhav Institute of Technology and Science</p>
                  <p className="text-[10px] text-slate-500 mt-1">Bachelor's Degree Program</p>
                </div>

                <div className="rounded-xl border border-brand-800/40 bg-slate-900/60 p-3.5">
                  <span className="text-[11px] font-bold text-gold-400">2026 - 2027</span>
                  <h5 className="text-xs font-semibold text-slate-100 mt-0.5">
                    Diploma in Data Science and AI
                  </h5>
                  <p className="text-[11px] text-slate-400">IIT Roorkee</p>
                  <p className="text-[10px] text-slate-500 mt-1">Diploma Program</p>
                </div>

                <div className="rounded-xl border border-brand-800/40 bg-slate-900/60 p-3.5">
                  <span className="text-[11px] font-bold text-gold-400">2025</span>
                  <h5 className="text-xs font-semibold text-slate-100 mt-0.5">
                    Higher Secondary (CBSE)
                  </h5>
                  <p className="text-[10px] text-slate-500 mt-1">Class XII</p>
                </div>
              </div>
            </div>

            {/* Languages */}
            <div>
              <h4 className="flex items-center gap-2 border-b border-brand-800/40 pb-2 text-lg font-bold text-slate-100 font-heading">
                <FaGlobe className="text-gold-400" />
                Languages
              </h4>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {["English", "Hindi", "Sanskrit"].map((lang) => (
                  <span
                    key={lang}
                    className="rounded-lg border border-brand-700/60 bg-slate-900 px-3 py-1 text-slate-200 font-medium"
                  >
                    ▸ {lang}
                  </span>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div>
              <h4 className="flex items-center gap-2 border-b border-brand-800/40 pb-2 text-lg font-bold text-slate-100 font-heading">
                <FaTrophy className="text-gold-400" />
                Achievements
              </h4>
              <ul className="mt-3 space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-gold-400">🏆</span>
                  <span><strong>1st Place</strong> — University Deadlift Tournament</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-400">🏆</span>
                  <span><strong>1st Place</strong> — University Basketball Tournament</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Resume;
