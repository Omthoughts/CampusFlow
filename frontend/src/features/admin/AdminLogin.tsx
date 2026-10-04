import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../lib/auth';
import { 
  Shield, 
  Lock, 
  Mail, 
  KeyRound, 
  AlertCircle, 
  Loader2, 
  ArrowLeft,
  Building2,
  CheckCircle2,
  FileCheck
} from 'lucide-react';

const adminLoginSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid official email')
    .endsWith('@moderncoe.edu.in', 'Must use official college domain (@moderncoe.edu.in)'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

type AdminLoginForm = z.infer<typeof adminLoginSchema>;

export default function AdminLogin() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [roleError, setRoleError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AdminLoginForm>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: 'admin@moderncoe.edu.in',
      password: 'DemoPass123!',
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: AdminLoginForm) => {
      setRoleError(null);
      const res = await api.post('/auth/login', data);
      return res.data;
    },
    onSuccess: (data) => {
      const user = data.user;
      // Enforce Administrative Role
      if (user.role !== 'ADMIN' && user.role !== 'FACULTY') {
        setRoleError(
          `Access Denied: Your account role is "${user.role}". The Administrative Portal is strictly restricted to College Administrators and Department Coordinators.`
        );
        return;
      }

      // Store in auth store and navigate to Admin Dashboard
      login(user);
      navigate('/admin/dashboard', { replace: true });
    },
  });

  const onSubmit = (data: AdminLoginForm) => {
    mutation.mutate(data);
  };

  const handleQuickFill = (role: 'ADMIN' | 'FACULTY') => {
    if (role === 'ADMIN') {
      setValue('email', 'admin@moderncoe.edu.in');
      setValue('password', 'DemoPass123!');
    } else {
      setValue('email', 'faculty_mca@moderncoe.edu.in');
      setValue('password', 'DemoPass123!');
    }
    setRoleError(null);
  };

  const errorMessage =
    roleError ||
    (mutation.error as any)?.response?.data?.error?.message ||
    (mutation.isError ? 'Authentication failed. Please verify administrative credentials.' : null);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950 font-sans text-slate-100 overflow-hidden">
      {/* Left Column: Visual Administrative Branding */}
      <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 p-12 flex-col justify-between relative border-r border-slate-800/80">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Header */}
        <div className="relative z-10">
          <div className="flex items-center space-x-3 text-white">
            <div className="p-2.5 rounded-xl bg-primary text-white shadow-lg shadow-primary/30">
              <Shield className="h-7 w-7" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white block">CampusFlow</span>
              <span className="text-xs uppercase tracking-widest text-primary-light font-bold">Admin Portal</span>
            </div>
          </div>
        </div>

        {/* Middle Feature Highlights */}
        <div className="relative z-10 space-y-6 my-auto max-w-sm">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-slate-300">
            <Lock className="h-3.5 w-3.5 text-primary" />
            <span>Authorized Personnel Only</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight">
            Centralized Campus Control & Circular Publication
          </h1>

          <p className="text-sm text-slate-400 font-medium leading-relaxed">
            Manage the official pipeline: Document OCR, AI-assisted verification, academic audience targeting, and tamper-evident audit logging.
          </p>

          <div className="space-y-3 pt-2 text-xs text-slate-300">
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span>Multi-Role Access Control (Admin & Faculty)</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <FileCheck className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span>Human Verification Before Notice Publication</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <Building2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span>Cohort Audience Isolation (Dept, Year, Batch)</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 pt-6 border-t border-slate-800/80 text-xs text-slate-500 flex items-center justify-between">
          <span>PES Modern College of Engineering</span>
          <span className="font-mono">Security Level: High</span>
        </div>
      </div>

      {/* Right Column: Admin Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative bg-slate-950">
        <div className="w-full max-w-md space-y-8 relative z-10">
          {/* Back to Student Link */}
          <Link
            to="/login"
            className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Switch to Student Portal
          </Link>

          {/* Form Header */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-primary">
              <Lock className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Restricted Access</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Admin Sign In</h2>
            <p className="text-slate-400 text-sm">
              Enter your administrative credentials to manage notices, deadlines, and events.
            </p>
          </div>

          {/* Quick-fill Preset Chips for Demo Convenience */}
          <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Quick-Fill Test Credentials:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('ADMIN')}
                className="flex-1 text-xs font-bold py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors text-center"
              >
                System Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('FACULTY')}
                className="flex-1 text-xs font-bold py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors text-center"
              >
                MCA Faculty
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="bg-red-950/60 border border-red-800 text-red-200 p-4 rounded-xl text-xs font-medium flex items-start space-x-2.5 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300" htmlFor="admin-email">
                Administrative Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  {...register('email')}
                  id="admin-email"
                  type="email"
                  placeholder="admin@moderncoe.edu.in"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-800 bg-slate-900/90 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400 font-medium mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300" htmlFor="admin-password">
                  Security Password
                </label>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  {...register('password')}
                  id="admin-password"
                  type="password"
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-800 bg-slate-900/90 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm font-mono"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 font-medium mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-primary hover:bg-primary-dark text-white py-3 px-4 rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex justify-center items-center space-x-2 text-sm"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Access Admin Portal</span>
              )}
            </button>
          </form>

          {/* Security Disclaimer */}
          <div className="pt-4 border-t border-slate-900 text-center space-y-2">
            <p className="text-[11px] text-slate-500 leading-normal">
              Unauthorized access attempts are monitored and recorded in the audit logs.
            </p>
            <p className="text-xs text-slate-400">
              Need access? Contact the <span className="text-primary-light font-semibold">Campus IT Administrator</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
