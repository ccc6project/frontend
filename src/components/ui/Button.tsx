import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'action';
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', icon, className = '', ...props }) => {
  const baseStyles = "px-4 py-1 rounded-xl transition-all duration-300 font-semibold shadow-2xl flex items-center gap-3 group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantStyles = {
    primary: "bg-gradient-to-br from-blue-950 via-slate-900 to-black text-white hover:from-blue-900 hover:via-slate-800 hover:to-gray-900 hover:shadow-blue-900/50 border border-blue-900/50 hover:border-blue-700/50",
    secondary: "bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-gray-600 hover:to-gray-700 border border-gray-600 hover:shadow-xl",
    action: "bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-gray-600 hover:border-gray-500"
  };

  return (
    <button {...props} className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      {icon && <span className="text-xl font-bold relative z-8">{icon}</span>}
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default Button;