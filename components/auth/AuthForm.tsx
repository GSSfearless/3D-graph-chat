import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface AuthFormProps {
  mode: 'login' | 'register' | 'reset';
}

export const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
  const { signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
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
        setError('两次输入的密码不一致');
        return;
      }

      if (mode === 'reset') {
        const { error } = await resetPassword(email);
        if (error) throw error;
        setMessage('重置密码链接已发送到您的邮箱');
      } else {
        const { error } = mode === 'login'
          ? await signInWithEmail(email, password)
          : await signUpWithEmail(email, password);
        
        if (error) throw error;
        
        if (mode === 'register') {
          setMessage('验证邮件已发送，请查收邮箱完成注册');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">
        {mode === 'login' ? '登录' : mode === 'register' ? '注册' : '重置密码'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            邮箱地址
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="请输入邮箱地址"
          />
        </div>

        {mode !== 'reset' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入密码"
            />
          </div>
        )}

        {mode === 'register' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              确认密码
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请再次输入密码"
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
              处理中...
            </div>
          ) : mode === 'login' ? '登录' : mode === 'register' ? '注册' : '发送重置链接'}
        </button>
      </form>
    </div>
  );
}; 