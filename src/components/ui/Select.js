'use client';

import React from 'react';

const Select = ({
  id,
  name,
  value,
  onChange,
  options = [],
  label,
  error = '',
  required = false,
  disabled = false,
  className = '',
  fullWidth = true,
  placeholder = 'Select an option',
  onBlur,
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
      
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        onBlur={onBlur}
        className={`
          block w-full rounded-lg border
          ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500'}
          px-3 py-2 text-sm
          ${disabled ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800'}
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50
          transition-colors duration-200
          appearance-none
          bg-no-repeat bg-right
          pr-8
        `}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: `right 0.5rem center`,
          backgroundSize: `1.5em 1.5em`,
        }}
        {...rest}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Select;