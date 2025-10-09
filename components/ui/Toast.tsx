import React, { useEffect } from 'react';
import { CheckIcon, CloseIcon } from '../icons';

const ErrorIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export interface ToastProps {
  id: number;
  message: string;
  type: 'success' | 'error';
  onDismiss: (id: number) => void;
}

const Toast: React.FC<ToastProps> = ({ id, message, type, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  const baseClasses = "flex items-center w-full max-w-xs p-4 text-gray-600 bg-white rounded-lg shadow-lg border toast-animate-in";
  const typeClasses = {
    success: 'border-green-200',
    error: 'border-red-200',
  };
  const iconClasses = {
    success: 'bg-green-100 text-green-500',
    error: 'bg-red-100 text-red-500',
  }

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`} role="alert">
        <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg ${iconClasses[type]}`}>
            {type === 'success' ? <CheckIcon className="w-5 h-5" /> : <ErrorIcon className="w-5 h-5" />}
        </div>
        <div className="ml-3 text-sm font-medium">{message}</div>
        <button type="button" onClick={() => onDismiss(id)} className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8" aria-label="Close">
            <span className="sr-only">Close</span>
            <CloseIcon className="w-5 h-5" />
        </button>
    </div>
  );
};

export const ToastContainer: React.FC<{ toasts: Omit<ToastProps, 'onDismiss'>[]; onDismiss: (id: number) => void; }> = ({ toasts, onDismiss }) => {
    return (
        <div className="fixed top-5 right-5 z-[100] space-y-3">
            {toasts.map((toast) => (
                <Toast key={toast.id} {...toast} onDismiss={onDismiss} />
            ))}
        </div>
    );
}