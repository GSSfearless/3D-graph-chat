interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingState({ message = '加载中...', size = 'md' }: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="animate-spin rounded-full border-t-2 border-b-2 border-blue-500" 
           style={{ width: size === 'sm' ? '1rem' : size === 'md' ? '2rem' : '3rem', 
                    height: size === 'sm' ? '1rem' : size === 'md' ? '2rem' : '3rem' }} />
      {message && (
        <p className="mt-2 text-sm text-gray-500">{message}</p>
      )}
    </div>
  );
} 