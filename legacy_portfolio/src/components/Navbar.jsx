import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { navLinks } from "../data";
import ThemeToggle from "./ThemeToggle";

function Navbar({ isDark, onToggle, houseTheme, onHouseChange, onPlayGame }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-700/30 bg-slate-950/90 backdrop-blur-xl dark:border-gold-500/50 dark:bg-slate-950/90">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 md:px-8">
        <a href="#hero" className="text-lg font-bold tracking-tight text-gold-400 font-heading">
          House Bajaj
        </a>

        <div className="hidden items-center gap-4 lg:gap-5 md:flex">
          <button
            type="button"
            onClick={onPlayGame}
            className="flex items-center gap-1.5 rounded-full border border-gold-500/60 bg-gradient-to-r from-brand-700 to-gold-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md hover:scale-105 transition duration-200"
          >
            <span>🎮</span> Play Game
          </button>
          <a
            href="/resume.pdf"
            download="Sarthak_Jain_Resume.pdf"
            className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white transition duration-200"
          >
            <span>📄</span> Resume
          </a>
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="text-sm font-medium text-slate-300 transition-colors duration-300 hover:text-gold-400"
            >
              {link.label}
            </a>
          ))}
          <select
            value={houseTheme}
            onChange={(event) => onHouseChange(event.target.value)}
            aria-label="Select house theme"
            className="rounded-lg border border-brand-700/70 bg-slate-900 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gold-300"
          >
            <option value="stark">Stark</option>
            <option value="lannister">Lannister</option>
            <option value="targaryen">Targaryen</option>
          </select>
          <ThemeToggle isDark={isDark} onToggle={onToggle} />
        </div>

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          className="md:hidden rounded-full border border-brand-700/70 bg-slate-900 p-2 text-gold-300 shadow-sm transition duration-300 hover:scale-105 hover:border-gold-500 hover:text-gold-400"
        >
          {isOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
        </button>
      </nav>

      {isOpen && (
        <div id="mobile-menu" className="border-t border-brand-700/40 bg-slate-950/95 px-5 py-4 backdrop-blur-xl dark:border-gold-500/50 dark:bg-slate-950/95 md:hidden">
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onPlayGame();
              }}
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-gold-600 px-4 py-3 text-sm font-bold text-white shadow"
            >
              <span>🎮</span> Play Interactive Game
            </button>
            <a
              href="/resume.pdf"
              download="Sarthak_Jain_Resume.pdf"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-slate-800 border border-slate-700 px-4 py-3 text-sm font-bold text-slate-100 shadow"
            >
              <span>📄</span> Download Resume PDF
            </a>
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={() => setIsOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-200 transition duration-200 hover:bg-brand-900/60 hover:text-gold-300"
              >
                {link.label}
              </a>
            ))}
            <select
              value={houseTheme}
              onChange={(event) => onHouseChange(event.target.value)}
              aria-label="Select house theme"
              className="rounded-lg border border-brand-700/70 bg-slate-900 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gold-300"
            >
              <option value="stark">Stark</option>
              <option value="lannister">Lannister</option>
              <option value="targaryen">Targaryen</option>
            </select>
            <ThemeToggle isDark={isDark} onToggle={onToggle} />
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
