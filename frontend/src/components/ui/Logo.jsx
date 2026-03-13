import React from 'react';
import { GraduationCap, Zap } from 'lucide-react';

// 'forceWhite' prop add kiya hai Sidebar ke liye
export const Logo = ({ className, forceWhite = false }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Animated Icon Container */}
      <div className="relative w-10 h-10 flex items-center justify-center bg-primary rounded-xl shadow-lg shadow-primary/40 overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-blue-400 opacity-100"></div>
        
        {/* Cap Icon */}
        <GraduationCap className="relative z-10 w-6 h-6 text-white transform group-hover:-translate-y-8 transition-transform duration-500" />
        
        {/* Hover Effect: Electric Zap */}
        <Zap className="absolute z-10 w-6 h-6 text-yellow-300 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500" />
      </div>
      
      {/* Text Branding */}
      <div className="flex flex-col">
        {/* Logic: Agar forceWhite hai to WHITE, nahi to Theme based (Black/White) */}
        <span className={`text-xl font-bold tracking-tight leading-none ${
          forceWhite ? 'text-white' : 'text-slate-900 dark:text-white'
        }`}>
          Campus<span className="text-primary-light">Sync</span>
        </span>
        <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Academic Hub</span>
      </div>
    </div>
  );
};