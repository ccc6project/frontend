import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="flex flex-col">
      {label && (
        <label className="block text-sm font-medium text-blue-800 mb-2">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`
          w-full p-3 rounded-lg border border-blue-200 
          bg-white text-blue-900 placeholder-blue-400
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-all duration-200
          ${className}
        `}
      />
    </div>
  );
};

export default Input;