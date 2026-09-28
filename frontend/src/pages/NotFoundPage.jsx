import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center text-center p-4">
      <div className="space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-orange-600/20 text-orange-400 mx-auto flex items-center justify-center font-digital font-black text-2xl">
          404
        </div>
        <h1 className="text-3xl font-black text-white">Court Not Found</h1>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          The play you're looking for doesn't exist on this 3x3 court.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-lg shadow-orange-600/30 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
