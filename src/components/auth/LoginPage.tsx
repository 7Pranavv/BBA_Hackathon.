import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, ArrowRight, Lock, Eye, EyeOff } from 'lucide-react';

type AuthMode = 'signin' | 'signup';

export function LoginPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signInWithPassword, signUpWithPassword } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signInWithPassword(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  const handlePasswordSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { error } = await signUpWithPassword(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };


  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome to Engineering Learning
          </h1>
          <p className="text-gray-400">
            Free, practical tech education for everyone
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setAuthMode('signin')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                authMode === 'signin'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('signup')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                authMode === 'signup'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={authMode === 'signup' ? handlePasswordSignUp : handlePasswordSignIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-12 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {authMode === 'signup' && (
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 6 characters
                </p>
              )}
            </div>

            {authMode === 'signup' && (
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-12 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (authMode === 'signup' ? 'Creating Account...' : 'Signing In...') : (authMode === 'signup' ? 'Create Account' : 'Sign In')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          All learning content is free forever. No hidden charges.
        </p>
      </div>
    </div>
  );
}
