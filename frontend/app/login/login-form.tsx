// app/login/login-form.tsx (UPDATED)
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface LoginFormProps {
  role: 'student' | 'admin';
}

interface LoginResponse {
  access: string;
  refresh: string;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Try with email first (your Django might use username)
      let loginData = {
        email: formData.email,
        password: formData.password,
      };

      const response = await fetch('http://localhost:8000/api/accounts/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      // Check if response is HTML (error page)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        // Try with username instead of email
        loginData = {
          email: formData.email.split('@')[0], // Use username part
          password: formData.password,
        };
        
        const retryResponse = await fetch('http://localhost:8000/api/accounts/auth/login/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(loginData),
        });
        
        if (!retryResponse.ok) {
          throw new Error('Login failed. Please check your credentials.');
        }
        
        const data: LoginResponse = await retryResponse.json();
        handleSuccessfulLogin(data);
      } else if (response.ok) {
        const data: LoginResponse = await response.json();
        handleSuccessfulLogin(data);
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.detail || 'Invalid email or password';
        setError(errorMessage);
        toast.error(errorMessage);
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

  const handleSuccessfulLogin = async (data: LoginResponse) => {
    // Store tokens
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    
    // Fetch user data using the token
    try {
      const userResponse = await fetch('http://localhost:8000/api/accounts/me/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${data.access}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        localStorage.setItem('user', JSON.stringify(userData));
        
        toast.success('Login successful!');
        
        // Redirect based on user role
        let redirectPath = '/';
        if (userData.role === 'STUDENT') {
          redirectPath = '/student';
        } else if (userData.role === 'SUPER_ADMIN' || userData.role === 'COLLEGE_ADMIN') {
          redirectPath = '/admin';
        } else if (userData.role === 'INSTRUCTOR') {
          redirectPath = '/instructor';
        }
        
        router.push(redirectPath);
      } else {
        toast.error('Failed to load user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Login successful but failed to load user data');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome Back
        </h2>
        <p className="text-gray-600">
          Sign in to access your portal
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
          icon={<Mail className="h-4 w-4" />}
          placeholder="student@htu.edu or student_id"
        />
        
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            icon={<Lock className="h-4 w-4" />}
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-10 text-gray-400 hover:text-gray-600"
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
          <p className="text-red-600 text-sm">{error}</p>
        </motion.div>
      )}

      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2">
          <input type="checkbox" className="rounded border-gray-300" />
          <span className="text-sm text-gray-600">Remember me</span>
        </label>
        <a href="#" className="text-sm text-blue-600 hover:underline">
          Forgot password?
        </a>
      </div>

      <Button
        type="submit"
        loading={loading}
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
          <span className="px-4 bg-white text-gray-500">Don't have an account?</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() => router.push('/register')}
        className="w-full !py-3"
      >
        Create Student Account
      </Button>
    </form>
  );
}