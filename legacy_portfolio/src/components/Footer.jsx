import { FaGithub, FaLinkedin, FaYoutube } from "react-icons/fa";

function Footer() {
  return (
    <footer className="border-t border-brand-800/40 bg-slate-950/95 py-10 dark:border-gold-500/30">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-5 text-sm text-slate-300 md:flex-row md:px-8 dark:text-slate-300">
        <p>© {new Date().getFullYear()} House Bajaj - Valar Morghulis, Code Endures</p>
        <div className="flex items-center gap-4">
          <a
            href="https://youtube.com/shorts/jX8gRQwBRoM?si=p8qPG7VvSyc3jYxx"
            target="_blank"
            rel="noreferrer"
            aria-label="YouTube Channel"
            className="rounded-full border border-brand-700/70 p-2 transition duration-300 hover:-translate-y-0.5 hover:border-red-500 hover:text-red-400 dark:border-brand-700/70"
          >
            <FaYoutube size={18} />
          </a>
          <a
            href="https://www.linkedin.com/in/sarthak-jain-bajaj-2550a63a2"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn Profile"
            className="rounded-full border border-brand-700/70 p-2 transition duration-300 hover:-translate-y-0.5 hover:border-gold-500 hover:text-gold-400 dark:border-brand-700/70"
          >
            <FaLinkedin size={18} />
          </a>
          <a
            href="https://github.com/sarthakjainbajaj-hash"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub Profile"
            className="rounded-full border border-brand-700/70 p-2 transition duration-300 hover:-translate-y-0.5 hover:border-gold-500 hover:text-gold-400 dark:border-brand-700/70"
          >
            <FaGithub size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
