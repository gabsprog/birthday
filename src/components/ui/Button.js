'use client';

import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  disabled = false, 
  type = 'button', 
  variant = 'primary',
  size = 'md',
  className = '',
  fullWidth = false,
  isLoading = false,
  icon = null
}) => {
  // Define base classes
  const baseClasses = "font-medium rounded-lg transition-colors duration-200 flex items-center justify-center";
  
  // Size classes
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };
  
  // Variant classes
  const variantClasses = {
    primary: "bg-primary-600 hover:bg-primary-700 text-white shadow-md disabled:bg-primary-300",
    secondary: "bg-secondary-600 hover:bg-secondary-700 text-white shadow-md disabled:bg-secondary-300",
    outline: "border-2 border-primary-600 text-primary-600 hover:bg-primary-50 disabled:border-primary-300 disabled:text-primary-300",
    ghost: "text-primary-600 hover:bg-primary-50 disabled:text-primary-300",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-md disabled:bg-red-300",
  };
  
  // Loading state
  const loadingSpinner = (
    <svg 
      className="animate-spin -ml-1 mr-2 h-4 w-4" 
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
      ></circle>
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {isLoading && loadingSpinner}
      {icon && !isLoading && <span className={`${children ? 'mr-2' : ''}`}>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;