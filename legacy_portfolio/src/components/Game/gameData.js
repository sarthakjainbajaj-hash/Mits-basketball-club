// Game world configuration, zones, NPCs, project shrines, and lore for Sarthak Jain Bajaj's portfolio
export const MAP_CONFIG = {
  width: 1800,
  height: 1400,
  spawnPoint: { x: 900, y: 720 },
};

export const ZONES = [
  {
    id: "citadel",
    name: "Courtyard of the Citadel",
    description: "The nexus of House Bajaj. Learn about the master architect.",
    x: 900,
    y: 720,
    radius: 120,
    color: "#38bdf8",
  },
  {
    id: "experience",
    name: "The War Council",
    description: "Chambers where battle-tested industry quests were conquered.",
    x: 400,
    y: 500,
    radius: 140,
    color: "#f59e0b",
  },
  {
    id: "projects",
    name: "The Arcane Forge",
    description: "Where software artifacts, AI platforms, and systems are forged.",
    x: 900,
    y: 300,
    radius: 160,
    color: "#ef4444",
  },
  {
    id: "skills",
    name: "The Spire of Elements",
    description: "Elemental crystals of programming languages, frameworks, and hardware.",
    x: 1400,
    y: 500,
    radius: 140,
    color: "#10b981",
  },
  {
    id: "education",
    name: "The Grand Archive",
    description: "Ancient tomes of degrees, certifications, and academic triumphs.",
    x: 450,
    y: 1000,
    radius: 130,
    color: "#8b5cf6",
  },
  {
    id: "contact",
    name: "The Raven Eyrie",
    description: "Send direct ravens to forge alliances or recruit Sarthak.",
    x: 1350,
    y: 1000,
    radius: 130,
    color: "#ec4899",
  },
];

export const INTERACTABLES = [
  // Courtyard - About
  {
    id: "sarthak_avatar",
    name: "Sarthak Jain Bajaj",
    title: "AI Architect & Full-Stack Crafter",
    type: "npc",
    x: 900,
    y: 660,
    avatar: "/photo.jpeg",
    badge: "Champion",
    icon: "🧙‍♂️",
    category: "about",
    dialogue: {
      headline: "Welcome, Traveler, to my Interactive Realm!",
      subtitle: "B.Tech in Artificial Intelligence & Data Science",
      body: [
        "I am Sarthak Jain Bajaj, a second-year B.Tech student in Artificial Intelligence and Data Science at Madhav Institute of Technology and Science, currently also pursuing a Diploma in Data Science and AI at IIT Roorkee.",
        "I bridge the realms of intelligent machine algorithms, high-performance web applications, and embedded microcontrollers.",
        "Explore my citadel! Visit the Arcane Forge for my projects, the War Council for my industry experience, and the Spire of Elements for my skills.",
      ],
      stats: [
        { label: "Class", value: "AI & Full-Stack Architect" },
        { label: "Level", value: "20 (Undergrad Explorer)" },
        { label: "Base", value: "Tikamgarh, MP, India" },
        { label: "Focus", value: "Scalable Systems & AI" },
      ],
    },
  },

  // War Council - Experience
  {
    id: "yuga_yatra_master",
    name: "Guildmaster of Yuga Yatra",
    title: "Software Engineering Guild",
    type: "npc",
    x: 450,
    y: 470,
    avatar: "⚔️",
    badge: "Internship 2026",
    icon: "💻",
    category: "experience",
    dialogue: {
      headline: "Web Development Intern — Yuga Yatra",
      subtitle: "Duration: 2026 • Production Web Engineering",
      body: [
        "Architected modular, accessible React user interfaces with modern component hierarchies.",
        "Adhered to rigorous code review standards, agile sprint cycles, and responsive design systems.",
        "Optimized client-side rendering bottlenecks to deliver sub-second interactive page experiences.",
      ],
      skillsUsed: ["React.js", "JavaScript", "Tailwind CSS", "Agile Engineering"],
    },
  },

  // Arcane Forge - Projects
  {
    id: "proj_solvesphere",
    name: "Pedestal: SolveSphere",
    title: "AI-Powered Problem Solving Platform",
    type: "shrine",
    x: 820,
    y: 240,
    avatar: "🌐",
    badge: "Smart India Hackathon",
    icon: "🔮",
    category: "project",
    dialogue: {
      headline: "SolveSphere (SIH-26043)",
      subtitle: "Tech Stack: React.js • Tailwind CSS • Vite • AI Integration",
      body: [
        "A crowdsourcing platform designed for the Smart India Hackathon to connect universities, student researchers, and industry leaders around real-world societal dilemmas.",
        "Built an intelligent algorithmic recommendation engine to pair challenge briefs with relevant engineering skills for autonomous team synthesis.",
        "Deployed live on high-availability Vercel edge infrastructure.",
      ],
      liveUrl: "https://solvesphere-three.vercel.app/",
      githubUrl: "https://github.com/sarthakjainbajaj-hash/SolveSphere-SIH26043",
    },
  },
  {
    id: "proj_parking",
    name: "Pedestal: Parking Lot System",
    title: "Automated Space Allocation Engine",
    type: "shrine",
    x: 980,
    y: 240,
    avatar: "🚗",
    badge: "IoT & Cloud",
    icon: "🅿️",
    category: "project",
    dialogue: {
      headline: "Automated Parking Lot Management System",
      subtitle: "Tech Stack: React • Flask • Python • Cloud Ready",
      body: [
        "Constructed an automated parking slot reservation and real-time occupancy monitor.",
        "Engineered lightweight RESTful Flask endpoints paired with an intuitive React dashboard.",
        "Engineered for hardware sensor telemetry and seamless cloud scaling.",
      ],
    },
  },
  {
    id: "proj_reportcard",
    name: "Pedestal: Report Card Generator",
    title: "Academic Records Vault",
    type: "shrine",
    x: 760,
    y: 330,
    avatar: "📑",
    badge: "Full Stack",
    icon: "📝",
    category: "project",
    dialogue: {
      headline: "Student Report Card Generator",
      subtitle: "Tech Stack: React • Node.js • Express • MongoDB",
      body: [
        "Architected an academic evaluation platform allowing instructors to dynamically compute grade curves and format official transcripts.",
        "Designed flexible MongoDB document schemas for historical report card archiving and instant querying.",
      ],
    },
  },
  {
    id: "proj_portfolio",
    name: "Pedestal: 3D Astrolabe Realm",
    title: "Interactive Citadel Portfolio",
    type: "shrine",
    x: 1040,
    y: 330,
    avatar: "🌌",
    badge: "Three.js & React",
    icon: "🪐",
    category: "project",
    dialogue: {
      headline: "Interactive 3D Portfolio & Game Realm",
      subtitle: "Tech Stack: Three.js • React 18 • Tailwind CSS • Vite",
      body: [
        "Features Game of Thrones house themes, real-time 3D astrolabe graphics, audio synthesis, and this playable RPG adventure engine!",
        "Dual-mode design ensuring seamless transition between gamified exploration and formal ATS-friendly resume review.",
      ],
      githubUrl: "https://github.com/sarthakjainbajaj-hash/portfolio",
    },
  },

  // Spire of Elements - Skills (Guarded by 2 Monsters)
  {
    id: "skill_altar",
    name: "Altar of Skills",
    title: "Guarded by 2 Monsters",
    type: "altar",
    x: 1400,
    y: 470,
    avatar: "⚡",
    badge: "Monster Arena",
    icon: "💎",
    category: "skills",
    requiresDefeat: true,
    dialogue: {
      headline: "Sarthak's Arsenal of Skills",
      subtitle: "Elemental proficiencies honed across software and embedded domains",
      skillsGrouped: [
        {
          group: "Languages",
          items: [
            { name: "Python", level: "85%" },
            { name: "JavaScript (ES6+)", level: "80%" },
            { name: "C / C++", level: "80%" },
            { name: "HTML5 / CSS3", level: "90%" },
            { name: "MATLAB", level: "70%" },
          ],
        },
        {
          group: "Web & Frameworks",
          items: [
            { name: "React.js", level: "85%" },
            { name: "Node.js", level: "80%" },
            { name: "Express.js", level: "75%" },
            { name: "Flask", level: "75%" },
            { name: "Tailwind CSS", level: "90%" },
            { name: "Three.js", level: "75%" },
          ],
        },
        {
          group: "Databases & Hardware",
          items: [
            { name: "MongoDB", level: "75%" },
            { name: "MySQL", level: "70%" },
            { name: "Arduino & Microcontrollers", level: "80%" },
            { name: "Sensor Interfacing", level: "80%" },
            { name: "Git / GitHub", level: "85%" },
            { name: "VS Code", level: "90%" },
          ],
        },
      ],
    },
  },

  // Grand Archive - Education & Certifications
  {
    id: "archive_tome",
    name: "The Grand Library Tome",
    title: "Chronicles of Education & Honors",
    type: "tome",
    x: 450,
    y: 980,
    avatar: "📚",
    badge: "Academia",
    icon: "📜",
    category: "education",
    dialogue: {
      headline: "Education & Certifications",
      subtitle: "Degrees, Diplomas, and Global Simulation Credentials",
      education: [
        {
          degree: "B.Tech in Artificial Intelligence and Data Science",
          school: "Madhav Institute of Technology and Science (MITS)",
          year: "2025 - 2029",
          desc: "Undergraduate Program in Advanced AI, Machine Learning, and Computer Systems.",
        },
        {
          degree: "Diploma in Data Science and AI",
          school: "IIT Roorkee",
          year: "2026 - 2027",
          desc: "Rigorous specialized diploma program in AI algorithms, neural nets, and statistical methods.",
        },
        {
          degree: "Higher Secondary (CBSE - Class XII)",
          school: "CBSE Board",
          year: "2025",
          desc: "Completed secondary education with strong foundations in Mathematics and Sciences.",
        },
      ],
      certifications: [
        { name: "Software Engineering Simulation", org: "JPMorgan Chase & Co. (Forage)" },
        { name: "Coding and Development", org: "Deloitte" },
        { name: "Data Analysis and Forensic Technology", org: "Deloitte" },
        { name: "AI Tools and ChatGPT Workshop", org: "be10x" },
      ],
      achievements: [
        "🏆 1st Place — University Deadlift Tournament (Strength & Discipline)",
        "🏆 1st Place — University Basketball Tournament (Leadership & Teamwork)",
      ],
    },
  },

  // Raven Eyrie - Contact
  {
    id: "raven_eyrie",
    name: "Citadel Raven Post",
    title: "Fast Dispatch Network",
    type: "post",
    x: 1350,
    y: 980,
    avatar: "🦅",
    badge: "Comms",
    icon: "✉️",
    category: "contact",
    dialogue: {
      headline: "Send a Raven to Sarthak",
      subtitle: "Direct channels for recruitment, partnerships, and collaborations",
      contacts: [
        { type: "email", label: "sarthakjainbajaj@gmail.com", url: "mailto:sarthakjainbajaj@gmail.com", icon: "✉️" },
        { type: "phone", label: "+91-9131255449", url: "tel:+919131255449", icon: "📞" },
        { type: "linkedin", label: "LinkedIn Profile", url: "https://linkedin.com/in/sarthak-jain-bajaj-2550a63a2", icon: "💼" },
        { type: "github", label: "GitHub Profile", url: "https://github.com/sarthakjainbajaj-hash", icon: "🐙" },
        { type: "youtube", label: "YouTube (AI Video Channel)", url: "https://youtube.com/shorts/jX8gRQwBRoM?si=p8qPG7VvSyc3jYxx", icon: "🎬" },
        { type: "portfolio", label: "portfolio-4vp2.vercel.app", url: "https://portfolio-4vp2.vercel.app/", icon: "🌐" },
      ],
      resumeUrl: "/resume.html",
    },
  },
];

// 5 Hidden Dragon Runes scattered across the map
export const COLLECTIBLES = [
  { id: "rune_winter", name: "Frost Rune of the North", x: 830, y: 830, color: "#38bdf8", hint: "Found near the Citadel fountain" },
  { id: "rune_fire", name: "Dragonfire Rune", x: 300, y: 560, color: "#ef4444", hint: "Hidden behind the War Council shields" },
  { id: "rune_forge", name: "Relic of the Forge", x: 900, y: 180, color: "#f59e0b", hint: "Resting above the Arcane Forge anvil" },
  { id: "rune_element", name: "Crystal of Wisdom", x: 1470, y: 440, color: "#10b981", hint: "Floating beside the Skill Spire" },
  { id: "rune_scroll", name: "Maester's Golden Quill", x: 380, y: 1080, color: "#8b5cf6", hint: "Tucked inside the Grand Archive library" },
];

// 2 Monsters Guarding the Skills Arena
export const MONSTERS = [
  {
    id: "monster_bug",
    name: "Bug Fiend",
    title: "Shadow Beast",
    x: 1330,
    y: 450,
    maxHp: 60,
    hp: 60,
    speed: 1.8,
    attackPower: 8,
    color: "#ef4444",
    icon: "👾",
    size: 20,
    zone: "skills",
  },
  {
    id: "monster_drake",
    name: "Glitch Drake",
    title: "Cyber Dragon",
    x: 1470,
    y: 480,
    maxHp: 80,
    hp: 80,
    speed: 2.1,
    attackPower: 12,
    color: "#a855f7",
    icon: "🐉",
    size: 24,
    zone: "skills",
  },
];

