'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleAuthCallback } = useAuth();

  useEffect(() => {
    async function processCallback() {
      try {
        await handleAuthCallback(searchParams);
        router.push('/'); // 认证成功后重定向到首页
      } catch (error) {
        console.error('Auth callback error:', error);
        router.push('/auth/error'); // 认证失败时重定向到错误页面
      }
    }

    if (searchParams) {
      processCallback();
    }
  }, [searchParams, router, handleAuthCallback]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          处理认证...
        </h2>
      </div>
    </div>
  );
} 