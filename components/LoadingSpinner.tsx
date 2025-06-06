import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'red' | 'white' | 'gray';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'red' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const colorClasses = {
    red: 'border-[#A41E22]',
    white: 'border-white',
    gray: 'border-gray-400'
  };

  return (
    <div className="flex items-center justify-center">
      <div 
        className={`${sizeClasses[size]} border-2 ${colorClasses[color]} border-t-transparent rounded-full animate-spin`}
      />
    </div>
  );
};

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center space-x-1">
      <span className="text-sm text-gray-500">Nova is typing</span>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-[#A41E22] rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-[#A41E22] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-[#A41E22] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
};
