import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <button
      {...props}
      className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
    >
      {children}
    </button>
  );
};

export default Button;
