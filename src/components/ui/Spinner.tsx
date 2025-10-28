import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'circle' | 'dots' | 'pulse';
  color?: string;
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'circle',
  color = 'text-blue-600',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  if (variant === 'circle') {
    return (
      <svg
        className={`animate-spin ${sizeStyles[size]} ${color} ${className}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );
  }

  if (variant === 'dots') {
    const dotSize = size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4';

    return (
      <div className={`flex space-x-1 ${className}`}>
        <div
          className={`${dotSize} ${color.replace('text-', 'bg-')} rounded-full animate-bounce`}
          style={{ animationDelay: '0ms' }}
        />
        <div
          className={`${dotSize} ${color.replace('text-', 'bg-')} rounded-full animate-bounce`}
          style={{ animationDelay: '150ms' }}
        />
        <div
          className={`${dotSize} ${color.replace('text-', 'bg-')} rounded-full animate-bounce`}
          style={{ animationDelay: '300ms' }}
        />
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div
        className={`${sizeStyles[size]} ${color.replace('text-', 'bg-')} rounded-full animate-pulse ${className}`}
      />
    );
  }

  return null;
};

export default Spinner;
