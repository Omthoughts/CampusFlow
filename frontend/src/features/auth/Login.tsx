import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../lib/auth';
import { GraduationCap, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address').endsWith('@moderncoe.edu.in', 'Must use college email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: LoginForm) => api.post('/auth/login', data).then(res => res.data),
    onSuccess: (data) => {
      login(data.user);
      navigate('/dashboard', { replace: true });
    },
  });

  const onSubmit = (data: LoginForm) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background font-sans overflow-hidden">
      {/* Left side - Visual/Branding */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#4F46E5] to-[#3730A3] text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white opacity-5 rounded-full blur-3xl mix-blend-overlay"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-white opacity-10 rounded-full blur-3xl mix-blend-overlay"></div>
        
        <div className="relative z-10 flex items-center space-x-3">
          <GraduationCap className="h-10 w-10 text-white" />
          <span className="text-2xl font-bold tracking-tight">CampusFlow</span>
        </div>
        
        <div className="relative z-10 space-y-6 max-w-md">
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight">
            Everything important on campus. <br/>
            <span className="text-[#A5B4FC]">One organized place.</span>
          </h1>
          <p className="text-lg text-indigo-100 font-medium">
            Stay on top of official notices, academic deadlines, and events without checking five different places.
          </p>
        </div>

        <div className="relative z-10 text-sm text-indigo-200">
          PES Modern College of Engineering
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="text-center md:text-left space-y-2">
            <h2 className="text-3xl font-bold text-text">Welcome back</h2>
            <p className="text-slate-500">Sign in to your student account</p>
          </div>

          {mutation.isError && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium border border-red-100 animate-in fade-in slide-in-from-top-2">
              {(mutation.error as any)?.response?.data?.error?.message || 'Failed to login. Please check your credentials.'}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="email">
                  College Email
                </label>
                <input
                  {...register('email')}
                  id="email"
                  type="email"
                  placeholder="student@moderncoe.edu.in"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 bg-white placeholder:text-slate-400 text-slate-800 shadow-sm"
                />
                {errors.email && (
                  <p className="mt-1.5 text-sm text-red-500 font-medium animate-in fade-in">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="password">
                  Password
                </label>
                <input
                  {...register('password')}
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 bg-white placeholder:text-slate-400 text-slate-800 shadow-sm"
                />
                {errors.password && (
                  <p className="mt-1.5 text-sm text-red-500 font-medium animate-in fade-in">{errors.password.message}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-primary hover:bg-[#4338CA] text-white py-3 px-4 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center space-x-2"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 font-medium mt-8">
            Having trouble logging in? <a href="#" className="text-primary hover:underline hover:text-[#4338CA] transition-colors">Contact administration</a>
          </p>
        </div>
      </div>
    </div>
  );
}
