// app/login/login-form.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

interface LoginFormProps {
  role: 'student' | 'admin';
}

export function LoginForm({ role }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
      });

      if (result.success && result.user) {
        toast.success('Login successful!');
        
        // Redirect based on user role
        setTimeout(() => {
          redirectUser(result.user!);
        }, 500);
      } else {
        setError(result.error || 'Login failed');
        toast.error(result.error || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'Network error. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const redirectUser = (user: any) => {
    let redirectPath = '/dashboard';
    
    switch (user.role) {
      case 'STUDENT':
        redirectPath = '/student';
        break;
      case 'COLLEGE_ADMIN':
      case 'SUPER_ADMIN':
        redirectPath = '/admin';
        break;
      default:
        redirectPath = '/admin';
    }
    
    router.push(redirectPath);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {role === 'student' ? 'Student Login' : 'Admin Login'}
        </h2>
        <p className="text-gray-600">
          {role === 'student' 
            ? 'Sign in to access your student portal' 
            : 'Sign in to access admin dashboard'}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <Input
          label="Email or Username"
          type="text"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={loading}
          icon={<Mail className="h-4 w-4" />}
          placeholder={role === 'student' ? "student@example.com or student_id" : "admin@example.com"}
          autoComplete="username"
        />
        
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
            icon={<Lock className="h-4 w-4" />}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-10 text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <p className="text-red-600 text-sm font-medium">{error}</p>
          <p className="text-red-500 text-xs mt-1">
            Backend running? Try: localhost:8000
          </p>
        </motion.div>
      )}

      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2">
          <input 
            type="checkbox" 
            className="rounded border-gray-300" 
            defaultChecked 
            disabled={loading}
          />
          <span className="text-sm text-gray-600">Remember me</span>
        </label>
        <a 
          href="#" 
          className="text-sm text-blue-600 hover:underline disabled:text-gray-400"
          onClick={(e) => {
            e.preventDefault();
            toast.info('Password reset feature coming soon');
          }}
        >
          Forgot password?
        </a>
      </div>

      <Button
        type="submit"
        loading={loading}
        disabled={loading}
        className="w-full !py-3 text-lg group"
      >
        <span className="flex items-center justify-center space-x-2">
          <span>Sign In</span>
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </span>
      </Button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">
            {role === 'student' ? "Don't have an account?" : "Need student access?"}
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() => router.push(role === 'student' ? '/register' : '/login?role=student')}
        className="w-full !py-3"
        disabled={loading}
      >
        {role === 'student' ? 'Create Student Account' : 'Switch to Student Login'}
      </Button>
    </form>
  );
}