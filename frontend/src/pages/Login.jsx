import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Hash, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { Link } from 'react-router-dom';
import { authService } from '../services/api';

const Login = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const role = searchParams.get('role') || 'student';
  const isStudent = role === 'student';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);

  // 🔥 Auto redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const response = await authService.login({
      email: formData.email,
      password: formData.password,
    });

    console.log("LOGIN RESPONSE:", response.data);

    const data = response.data;

// store token
localStorage.setItem("token", data.token);

// store user info
localStorage.setItem(
  "user",
  JSON.stringify({
    _id: data._id,
    name: data.name,
    email: data.email,
    role: data.role,
    branch: data.branch,
    year: data.year
  })
);

navigate("/dashboard");
  } catch (error) {
    console.error("Login failed:", error.response?.data || error.message);
    alert(error.response?.data?.message || "Invalid credentials");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 transition-colors duration-300">

      {/* LEFT PANEL */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden lg:flex w-1/2 bg-primary text-white p-12 flex-col justify-between relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-white blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <div className="mb-10">
            <Logo />
          </div>

          <h1 className="text-5xl font-bold mb-6">
            {isStudent ? 'Student Portal' : 'Faculty Portal'}
          </h1>
          <p className="text-blue-100 text-lg mb-8 max-w-md">
            {isStudent
              ? 'Join your academic community. Connect with peers, access resources, and stay updated with your courses.'
              : 'Empower your teaching. Create channels, manage students, and foster collaborative learning.'}
          </p>

          <div className="space-y-4">
            {[
              'Real-time messaging and collaboration',
              'Organized channels by subject and year',
              'Secure file sharing and resources',
              'Announcements and notifications'
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-blue-50">
                <CheckCircle2 className="w-5 h-5 text-blue-300" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-blue-200 text-sm">
          © 2026 CampusSync. Secure • Professional • Collaborative
        </div>
      </motion.div>

      {/* RIGHT PANEL */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-8 dark:bg-slate-900"
      >
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Welcome back!
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Sign in to your {role} account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  placeholder={`${role}@campus.edu`}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <Button className="w-full h-11 text-lg" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </form>

          <p className="text-center text-slate-600 dark:text-slate-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;