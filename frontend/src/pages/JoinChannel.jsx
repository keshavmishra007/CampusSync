import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, CheckCircle2, ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';

const BRANCHES = [
  { id: 'CSE', name: 'Computer Science & Engineering (CSE)' },
  { id: 'EC', name: 'Electronics & Communication (EC)' },
  { id: 'ME', name: 'Mechanical Engineering (ME)' },
  { id: 'CE', name: 'Civil Engineering (CE)' },
  { id: 'EE', name: 'Electrical Engineering (EE)' },
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

const JoinChannel = () => {
  const navigate = useNavigate();
  const [selectedBranch, setSelectedBranch] = useState(BRANCHES[0]);
  const [selectedYear, setSelectedYear] = useState(YEARS[2]); // Default 3rd Year

  const handleJoin = () => {
    // Save to LocalStorage so Dashboard knows what to show
    localStorage.setItem('userBranch', selectedBranch.id);
    localStorage.setItem('userYear', selectedYear);
    localStorage.setItem('userBranchName', selectedBranch.name);
    
    // Simulate loading
    setTimeout(() => {
      navigate('/dashboard');
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-300 p-4">
      
      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-blob"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 relative z-10"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="scale-125 mb-4">
            <Logo />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-4">Welcome to CampusSync!</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Select your branch and year to join your channel</p>
        </div>

        <div className="space-y-6">
          
          {/* Branch Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Select Branch</label>
            <div className="relative">
              <select 
                value={selectedBranch.id}
                onChange={(e) => setSelectedBranch(BRANCHES.find(b => b.id === e.target.value))}
                className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
              >
                {BRANCHES.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Year Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Select Year</label>
            <div className="relative">
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
              >
                {YEARS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-600 dark:text-slate-300">
              <p className="font-semibold text-slate-900 dark:text-white mb-1">You will automatically join your branch-year channel</p>
              You'll also get access to subject channels, project groups, and announcements relevant to your branch and year.
            </div>
          </div>

          <Button 
            onClick={handleJoin}
            className="w-full h-12 text-lg font-semibold shadow-lg shadow-primary/25"
          >
            Join Channel
          </Button>

          <div className="text-center">
             <span className="text-xs text-slate-400">You will join:</span>
             <div className="text-sm font-bold text-primary mt-1">
               {selectedBranch.id} - {selectedYear}
             </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default JoinChannel;