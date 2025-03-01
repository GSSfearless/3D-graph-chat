import { XCircleIcon } from '@heroicons/react/24/solid';

interface ErrorMessageProps {
  title?: string;
  message: string;
  suggestion?: string;
  onRetry?: () => void;
}

export function ErrorMessage({ title = '出错了', message, suggestion, onRetry }: ErrorMessageProps) {
  return (
    <div className="rounded-md bg-red-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{message}</p>
            {suggestion && (
              <p className="mt-1 text-sm text-red-600">{suggestion}</p>
            )}
          </div>
          {onRetry && (
            <div className="mt-4">
              <button
                type="button"
                onClick={onRetry}
                className="rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
              >
                重试
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 