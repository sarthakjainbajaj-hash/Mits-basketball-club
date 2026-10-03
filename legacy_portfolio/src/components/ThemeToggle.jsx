import { FaMoon, FaSun } from "react-icons/fa";

function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="rounded-full border border-slate-300 bg-white p-2 text-slate-700 shadow-sm transition duration-300 hover:scale-105 hover:border-gold-500 hover:text-gold-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      aria-label="Toggle theme"
    >
      {isDark ? <FaSun size={16} /> : <FaMoon size={16} />}
    </button>
  );
}

export default ThemeToggle;
