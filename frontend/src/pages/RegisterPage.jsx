import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Flame, UserPlus, Lock, Mail, User, Shield } from 'lucide-react';
import Toast from '../components/Common/Toast';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('scorer');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setToast({ message: 'All fields are required', type: 'warning' });
      return;
    }

    if (password.length < 6) {
      setToast({ message: 'Password must be at least 6 characters', type: 'warning' });
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, password, role });
      setToast({ message: 'Account created! Redirecting to Dashboard...', type: 'success' });
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (err) {
      setToast({ message: err.message || 'Registration failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 items-center justify-center shadow-xl shadow-orange-600/30 mb-3">
            <Flame className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h1 className="font-digital text-3xl font-black tracking-wider text-white">
            JOIN <span className="text-orange-500">HOOPSCORE</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Create an account to manage matches & tournaments</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Coach Carter"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-white text-sm outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="scorer@hoopscore.com"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-white text-sm outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-white text-sm outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Desired Account Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['scorer', 'viewer', 'admin'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold uppercase transition-all ${
                      role === r
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500/50 shadow-sm'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-sm shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" /> Register & Access
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-400 hover:text-orange-300 font-bold underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default RegisterPage;
