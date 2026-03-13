import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Users, ArrowRight, Sparkles } from 'lucide-react';
import { Logo } from '../components/ui/Logo';

const Landing = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    navigate(`/login?role=${role}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-white p-6 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Blobs (Soft Glow) */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-400/30 dark:bg-blue-900/20 rounded-full blur-[100px] pointer-events-none" 
      />
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-400/30 dark:bg-purple-900/20 rounded-full blur-[100px] pointer-events-none" 
      />

      {/* Main Content */}
      <div className="max-w-5xl w-full flex flex-col items-center z-10">
        
        {/* 1. LOGO SECTION (Original Wapas Aa Gaya) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center text-center mb-12"
        >
          {/* Animated Logo - Scaled Up */}
          <div className="scale-150 mb-8 cursor-pointer hover:scale-[1.6] transition-transform duration-300">
            <Logo />
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white drop-shadow-sm">
            Campus<span className="text-primary">Sync</span>
          </h1>
          
          <p className="text-lg md:text-xl font-medium text-slate-500 dark:text-slate-400 mb-2">
            Centralized Academic Communication Platform
          </p>

          <p className="text-sm md:text-base text-slate-400 dark:text-slate-500 max-w-xl leading-relaxed">
             A structured platform for students and faculty to communicate, share resources, and collaborate efficiently.
          </p>
        </motion.div>

        {/* 2. CARDS SECTION (Centered Content like Screenshot) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
          
          {/* STUDENT CARD */}
          <RoleCard 
            role="student"
            title="I am a Student"
            desc="Access your courses, connect with peers, and stay updated."
            icon={<GraduationCap className="w-10 h-10 text-primary" />} // Icon Blue
            bgColor="bg-blue-50 dark:bg-blue-900/20" // Box Color
            borderColor="hover:border-blue-500/50"
            shadowColor="rgba(37, 99, 235, 0.4)" // Blue Glow
            onClick={() => handleRoleSelect('student')}
            delay={0.2}
          />

          {/* FACULTY CARD */}
          <RoleCard 
            role="faculty"
            title="I am Faculty"
            desc="Manage classes, create channels, and engage with students."
            icon={<Users className="w-10 h-10 text-emerald-600" />} // Icon Green
            bgColor="bg-emerald-50 dark:bg-emerald-900/20" // Box Color
            borderColor="hover:border-emerald-500/50"
            shadowColor="rgba(16, 185, 129, 0.4)" // Green Glow
            onClick={() => handleRoleSelect('faculty')}
            delay={0.4}
          />

        </div>

        {/* FOOTER */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-600 font-medium"
        >
          <Sparkles className="w-3 h-3 text-yellow-500 animate-pulse" />
          <span>Secure • Professional • Collaborative</span>
        </motion.div>

      </div>
    </div>
  );
};

// ----------------------------------------------------
// 🔥 CENTERED CARD COMPONENT (Screenshot Style)
// ----------------------------------------------------
const RoleCard = ({ title, desc, icon, bgColor, borderColor, shadowColor, onClick, delay, role }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, type: "spring", stiffness: 100 }}
      
      // HOVER ANIMATIONS
      whileHover={{ 
        y: -10, // Lift Up
        scale: 1.02, 
        boxShadow: `0 20px 40px -10px ${shadowColor}` // Colored Glow
      }}
      whileTap={{ scale: 0.95 }}
      
      onClick={onClick}
      // CSS: Flex Column + Items Center (To center everything)
      className={`relative group bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 ${borderColor} cursor-pointer transition-colors duration-300 flex flex-col items-center text-center`}
    >
      
      {/* ICON BOX (Centered) */}
      <motion.div 
        className={`w-20 h-20 rounded-3xl ${bgColor} flex items-center justify-center mb-6 shadow-sm`}
        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }} 
        transition={{ duration: 0.5 }}
      >
        {icon}
      </motion.div>

      {/* TEXT CONTENT (Centered) */}
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
        {title}
      </h3>
      <p className="text-slate-500 dark:text-slate-400 text-base mb-8 leading-relaxed max-w-sm">
        {desc}
      </p>

      {/* LINK BUTTON (Centered) */}
      <div className={`mt-auto flex items-center font-bold text-sm ${role === 'faculty' ? 'text-emerald-600' : 'text-primary'} group-hover:underline`}>
        Continue as {role === 'student' ? 'Student' : 'Faculty'} 
        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
      </div>

    </motion.div>
  );
};

export default Landing;