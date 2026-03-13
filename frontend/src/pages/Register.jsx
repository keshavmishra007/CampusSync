import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Hash, ArrowRight, GraduationCap, ChevronDown, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { authService } from '../services/api';

const BRANCHES = [
  { id: 'CSE', name: 'Computer Science (CSE)' },
  { id: 'EC', name: 'Electronics (EC)' },
  { id: 'ME', name: 'Mechanical (ME)' },
  { id: 'CE', name: 'Civil (CE)' },
  { id: 'EE', name: 'Electrical (EE)' },
];

const YEARS = [
  { id: '1', name: '1st Year' },
  { id: '2', name: '2nd Year' },
  { id: '3', name: '3rd Year' },
  { id: '4', name: '4th Year' },
];

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('student');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    branch: '',
    year: '',
    enrollmentNumber: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role,
        ...(role === 'student' && {
          branch: formData.branch,
          year: Number(formData.year),
          enrollmentNumber: formData.enrollmentNumber
        }),
        ...(role === 'faculty' && {
          branch: formData.branch
        })
      };

      const res = await authService.register(payload);

      // Save token
      localStorage.setItem('token', res.data.token);

      navigate('/dashboard');

    } catch (error) {
      console.error(error.response?.data || error.message);
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900">

      {/* LEFT PANEL */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden lg:flex w-5/12 bg-sidebar text-white p-12 flex-col justify-between"
      >
        <div>
          <Logo forceWhite className="mb-8" />
          <h1 className="text-4xl font-bold mb-4">
            Join the <span className="text-primary">CampusSync</span> Community
          </h1>
          <p className="text-slate-400 text-lg mb-8">
            Connect with your batchmates, teachers, and seniors.
          </p>
          <div className="space-y-4">
            <FeatureItem text="Auto-join your Class Channel" />
            <FeatureItem text="Get Notes & Assignments directly" />
            <FeatureItem text="Never miss an Announcement" />
          </div>
        </div>
      </motion.div>

      {/* RIGHT PANEL */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full lg:w-7/12 flex items-center justify-center p-6"
      >
        <div className="w-full max-w-md space-y-6">

          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Create Account
          </h2>

          {/* Role Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {['student', 'faculty'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-2.5 rounded-lg capitalize ${
                  role === r
                    ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            <InputGroup icon={<User />} type="text" name="name" placeholder="Full Name" onChange={handleChange} required />
            <InputGroup icon={<Mail />} type="email" name="email" placeholder="College Email ID" onChange={handleChange} required />
            <InputGroup icon={<Lock />} type="password" name="password" placeholder="Create Password" onChange={handleChange} required />

            {/* BRANCH (For Both Student & Faculty) */}
            {(role === 'student' || role === 'faculty') && (
              <div className="relative">
                <GraduationCap className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 z-10" />
                <select
                  name="branch"
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="">Select Branch</option>
                  {BRANCHES.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* STUDENT ONLY */}
            {role === 'student' && (
              <>
                <div className="relative">
                  <select
                    name="year"
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="">Select Year</option>
                    {YEARS.map(y => (
                      <option key={y.id} value={y.id}>{y.name}</option>
                    ))}
                  </select>
                </div>

                <InputGroup
                  icon={<Hash />}
                  type="text"
                  name="enrollmentNumber"
                  placeholder="Enrollment No."
                  onChange={handleChange}
                  required
                />
              </>
            )}

            <Button className="w-full h-12 text-lg mt-4">
              Create Account <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

          </form>

          <p className="text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-primary">
              Login here
            </Link>
          </p>

        </div>
      </motion.div>
    </div>
  );
};

const InputGroup = ({ icon, ...props }) => (
  <div className="relative">
    <div className="absolute left-3 top-3.5 w-5 h-5 text-slate-400">{icon}</div>
    <input
      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white"
      {...props}
    />
  </div>
);

const FeatureItem = ({ text }) => (
  <div className="flex items-center gap-3 text-slate-300">
    <CheckCircle2 className="w-5 h-5 text-primary" />
    <span>{text}</span>
  </div>
);

export default Register;