import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please provide your admin email and password');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      // Simulate successful administrative authentication
      localStorage.setItem('admin_token', 'demo-adm-token-' + Date.now());
      localStorage.setItem(
        'admin_user',
        JSON.stringify({
          name: 'Kyaw Swar Hein',
          email: email || 'admin@recirculate.mm',
          role: 'Super Administrator',
          department: 'Platform Trust & Safety Team'
        })
      );
      setLoading(false);
      navigate('/admin/dashboard');
    }, 400);
  };

  const handleQuickDemoFill = () => {
    setEmail('admin@recirculate.mm');
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#F9F6F0] flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-[#EBE2D8] p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#2C1D15] text-[#DDD1BF] mx-auto flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#2C1D15]">ReCirculate Admin Console</h2>
          <p className="text-xs text-[#5C4033]">
            Community-Based Item Exchange Operations & Moderation
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#2C1D15] mb-1">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@recirculate.mm"
                className="w-full pl-10 pr-4 py-2.5 text-xs border border-[#EBE2D8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C4033] bg-[#F9F6F0] text-[#2C1D15]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2C1D15] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 text-xs border border-[#EBE2D8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C4033] bg-[#F9F6F0] text-[#2C1D15]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C7A6B] hover:text-[#2C1D15]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-[#5C4033] text-white hover:bg-[#2C1D15] transition-colors shadow-xs flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Admin Portal'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Demo Login Auto-fill Hint */}
        <div className="pt-4 border-t border-[#EBE2D8] bg-[#F9F6F0] -mx-8 -mb-8 p-6 rounded-b-2xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8C7A6B] font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Demo Review Access:
            </span>
            <button
              onClick={handleQuickDemoFill}
              type="button"
              className="text-[11px] font-bold text-[#5C4033] hover:underline"
            >
              Auto-fill credentials
            </button>
          </div>
          <div className="text-[11px] font-mono text-[#8C7A6B] bg-white p-2.5 rounded-lg border border-[#EBE2D8]">
            email: admin@recirculate.mm | pass: admin123
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link
          to="/"
          className="text-xs text-[#5C4033] hover:text-[#2C1D15] hover:underline font-medium"
        >
          ← Return to Community Portal
        </Link>
      </div>
    </div>
  );
}
