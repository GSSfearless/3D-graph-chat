import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface AuthFormProps {
  mode: 'login' | 'register' | 'reset';
}

export const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
  const { signInWithEmail, signUpWithEmail, resetPasswordForEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === 'register' && password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (mode === 'reset') {
        const { error } = await resetPasswordForEmail(email);
        if (error) throw error;
        setMessage('Password reset link has been sent to your email');
      } else {
        const { error } = mode === 'login'
          ? await signInWithEmail(email, password)
          : await signUpWithEmail(email, password);
        
        if (error) throw error;
        
        if (mode === 'register') {
          setMessage('Verification email sent, please check your inbox to complete registration');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">
        {mode === 'login' ? 'Login' : mode === 'register' ? 'Register' : 'Reset Password'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email address"
          />
        </div>

        {mode !== 'reset' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
          </div>
        )}

        {mode === 'register' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password again"
            />
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        {message && (
          <div className="text-green-500 text-sm">{message}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Processing...
            </div>
          ) : mode === 'login' ? 'Login' : mode === 'register' ? 'Register' : 'Send Reset Link'}
        </button>
      </form>
    </div>
  );
}; 