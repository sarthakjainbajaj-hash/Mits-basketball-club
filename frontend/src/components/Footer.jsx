import React from 'react';
import { Flame, ShieldCheck, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-hoop-court/60 border-t border-slate-800/80 mt-auto py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white font-digital tracking-wide">
                HOOPSCORE 3X3
              </p>
              <p className="text-xs text-slate-400">
                Official Standard FIBA 3x3 Scoring, 12s Shot Clock & Tournament Engine
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
              <ShieldCheck className="w-4 h-4" /> FIBA 3x3 Compliant
            </span>
            <span className="text-slate-500">•</span>
            <span>10:00 Duration / 12s Shot Clock</span>
            <span className="text-slate-500">•</span>
            <span>21 PTS Sudden Victory</span>
            <span className="text-slate-500">•</span>
            <Link to="/settings" className="hover:text-orange-400 transition-colors">
              System Settings
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
