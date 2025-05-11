'use client';

import React from 'react';

const Textarea = ({
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
  rows = 4,
  maxLength,
  autoComplete = 'on',
  onBlur,
  onFocus,
  ...rest
}) => {
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
      
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        onBlur={onBlur}
        onFocus={onFocus}
        maxLength={maxLength}
        autoComplete={autoComplete}
        className={`
          block w-full rounded-lg border
          ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500'}
          px-3 py-2 text-sm
          ${disabled ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800'}
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50
          transition-colors duration-200 resize-y
        `}
        {...rest}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
      
      {maxLength && (
        <div className="flex justify-end mt-1">
          <span className={`text-xs ${value && value.length > maxLength * 0.8 ? 'text-red-500' : 'text-gray-500'}`}>
            {value ? value.length : 0}/{maxLength}
          </span>
        </div>
      )}
    </div>
  );
};

export default Textarea;