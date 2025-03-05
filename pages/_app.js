import * as Sentry from '@sentry/nextjs';

// 添加全局错误处理
if (typeof window !== 'undefined') {
  // 为window对象添加错误处理
  window.onerror = function(message, source, lineno, colno, error) {
    console.error('Global error:', message, source, lineno, colno);
    Sentry.captureException(error || new Error(message));
    // 不阻止默认错误处理
    return false;
  };

  // 处理未捕获的promise错误
  window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled rejection:', event.reason);
    Sentry.captureException(event.reason || new Error('未处理的Promise错误'));
  });
} 