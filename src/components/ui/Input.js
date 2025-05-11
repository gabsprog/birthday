'use client';

import React from 'react';

const Input = ({
  type = 'text',
  id,
  name,
  value,
  onChange,
  placeholder = '',
  label,
  error = '',
  required = false,
  disabled = false,
  className = '',
  fullWidth = true,
  icon = null,
  min,
  max,
  autoComplete = 'on',
  onBlur,
  onFocus,
  maxLength,
  ...rest
}) => {
  // Type can be text, email, password, number, date, etc.
  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {icon}
          </div>
        )}
        
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          onBlur={onBlur}
          onFocus={onFocus}
          min={min}
          max={max}
          maxLength={maxLength}
          autoComplete={autoComplete}
          className={`
            block w-full rounded-lg border
            ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500'}
            px-3 py-2 text-sm
            ${icon ? 'pl-10' : ''}
            ${disabled ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800'}
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50
            transition-colors duration-200
          `}
          {...rest}
        />
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Input;