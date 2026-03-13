import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Button({ className, variant = 'primary', size = 'default', children, ...props }) {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-95";
  
  const variants = {
    primary: "bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/30",
    outline: "border-2 border-primary text-primary hover:bg-primary/10",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    glass: "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20"
  };

  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 text-sm",
    lg: "h-12 px-8 text-lg"
  };

  return (
    <button 
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      {...props}
    >
      {children}
    </button>
  );
}