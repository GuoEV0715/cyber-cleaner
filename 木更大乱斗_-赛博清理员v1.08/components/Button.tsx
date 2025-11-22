import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '',
  ...props 
}) => {
  const baseStyle = "font-bold rounded shadow-md transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white border-b-4 border-indigo-800 hover:border-indigo-700",
    secondary: "bg-purple-600 hover:bg-purple-500 text-white border-b-4 border-purple-800 hover:border-purple-700",
    danger: "bg-red-500 hover:bg-red-400 text-white border-b-4 border-red-700 hover:border-red-600",
    outline: "bg-transparent border-2 border-slate-500 text-slate-300 hover:bg-slate-800 hover:text-white"
  };

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-xl"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};