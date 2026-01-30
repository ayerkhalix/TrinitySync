// app/register/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Lock, Eye, EyeOff, User, BookOpen, 
  Building, Calendar, GraduationCap, ArrowLeft,
  CheckCircle, AlertCircle, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

// Generate particles data
const generateParticles = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100 + 'vw',
    y: Math.random() * 100 + 'vh',
    dx: Math.random() * 100 + 'vw',
    dy: Math.random() * 100 + 'vh',
    duration: Math.random() * 10 + 10,
  }));
};

const particles = generateParticles(20);

// Year levels for selection
const YEAR_LEVELS = [
  { value: 'first_year', label: 'First Year' },
  { value: 'second_year', label: 'Second Year' },
  { value: 'third_year', label: 'Third Year' },
  { value: 'fourth_year', label: 'Fourth Year' },
  { value: 'fifth_year', label: 'Fifth Year' },
];

interface College {
  id: string;
  code: string;
  name: string;
}

interface Program {
  id: string;
  name: string;
  college: string;
  code: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [colleges, setColleges] = useState<College[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    student_id: '',
    admission_year: new Date().getFullYear(),
    year_level: 'first_year',
    section: '',
    college_id: '',
    program_id: '',
    role: 'STUDENT' as const,
  });

  // Fetch colleges (RUNS ONCE)
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setLoadingData(true);
        const res = await fetch('http://localhost:8000/api/colleges/colleges/');
        
        if (!res.ok) {
          throw new Error(`Failed to fetch colleges: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('Colleges API response:', data);

        // DRF paginated response safety
        const collegeList = Array.isArray(data)
          ? data
          : Array.isArray(data.results)
          ? data.results
          : [];

        // Ensure we have valid data - FIXED: Added parentheses for typed parameter
        const validColleges = collegeList.filter((college: any) => 
          college && typeof college.id === 'string' && college.name
        );

        console.log('Valid colleges:', validColleges);
        setColleges(validColleges);
      } catch (err) {
        console.error('Failed to fetch colleges:', err);
        toast.error('Failed to load colleges');
        setColleges([]);
      } finally {
        setLoadingData(false);
      }
    };

    fetchColleges();
  }, []);

  // Fetch programs when college is selected
  useEffect(() => {
    if (!formData.college_id) {
      setPrograms([]);
      setFilteredPrograms([]);
      return;
    }

    const fetchPrograms = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/api/colleges/colleges/${formData.college_id}/programs/`
        );
        
        if (!res.ok) {
          throw new Error(`Failed to fetch programs: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('Programs API response:', data);

        // DRF paginated response safety
        const programList = Array.isArray(data)
          ? data
          : Array.isArray(data.results)
          ? data.results
          : [];

        // Ensure we have valid data - FIXED: Added parentheses for typed parameter
        const validPrograms = programList.filter((program: any) => 
          program && typeof program.id === 'string' && program.name
        );

        console.log('Valid programs:', validPrograms);
        setPrograms(validPrograms);
        setFilteredPrograms(validPrograms);
        
        // Reset program selection when college changes
        setFormData(prev => ({
          ...prev,
          program_id: ''
        }));
      } catch (err) {
        console.error('Failed to fetch programs:', err);
        toast.error('Failed to load programs');
        setPrograms([]);
        setFilteredPrograms([]);
      }
    };

    fetchPrograms();
  }, [formData.college_id]);

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    
    if (formData.phone_number && !formData.phone_number.match(/^[0-9+\-\s()]{10,}$/)) {
      newErrors.phone_number = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.student_id.trim()) {
      newErrors.student_id = 'Student ID is required';
    }
    
    if (!formData.college_id) {
      newErrors.college_id = 'Please select a college';
    }
    
    if (!formData.program_id) {
      newErrors.program_id = 'Please select a program';
    }
    
    if (!formData.admission_year || formData.admission_year < 2000 || formData.admission_year > new Date().getFullYear()) {
      newErrors.admission_year = 'Please enter a valid admission year';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep3()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const registrationData = {
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirm_password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number || '',
        student_id: formData.student_id,
        admission_year: formData.admission_year,
        year_level: formData.year_level,
        section: formData.section || '',
        college_id: formData.college_id,
        program_id: formData.program_id,
        role: formData.role,
      };

      console.log('Sending registration data:', registrationData);

      const response = await fetch('http://localhost:8000/api/accounts/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();
      console.log('Registration response:', data);

      if (response.ok) {
        toast.success('Registration successful! Please login to continue.');
        router.push('/login');
      } else {
        if (typeof data === 'object' && data !== null) {
          const fieldErrors: Record<string, string> = {};
          Object.keys(data).forEach(key => {
            if (Array.isArray(data[key])) {
              fieldErrors[key] = data[key].join(' ');
            } else if (typeof data[key] === 'string') {
              fieldErrors[key] = data[key];
            }
          });
          
          if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
          } else if (data.detail) {
            toast.error(data.detail);
          }
        } else if (typeof data === 'string') {
          toast.error(data);
        } else {
          toast.error('Registration failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const steps = [
    { number: 1, title: 'Account', description: 'Create your login credentials' },
    { number: 2, title: 'Personal', description: 'Tell us about yourself' },
    { number: 3, title: 'Academic', description: 'Enter your student information' },
  ];

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading registration form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute h-1 w-1 rounded-full bg-indigo-200/50"
            initial={{ x: p.x, y: p.y }}
            animate={{ x: p.dx, y: p.dy }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="inline-flex items-center justify-center mb-4"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur-xl opacity-30" />
                <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
              </div>
            </motion.div>
            <motion.h1
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold text-gray-900 mb-2"
            >
              Student Registration
            </motion.h1>
            <motion.p
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-600"
            >
              Create your account to access ScheduleFlow
            </motion.p>
          </div>

          <div className="mb-8">
            <div className="flex justify-between relative">
              <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10" />
              <div 
                className="absolute top-5 left-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 -z-10 transition-all duration-500"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              />
              
              {steps.map((step) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: step.number * 0.1 }}
                  className="flex flex-col items-center"
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center mb-2
                    ${currentStep >= step.number 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
                      : 'bg-white border-2 border-gray-300 text-gray-400'
                    }
                    transition-all duration-300
                  `}>
                    {currentStep > step.number ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span className="font-semibold">{step.number}</span>
                    )}
                  </div>
                  <div className="text-center">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-lg border border-gray-200/50 rounded-2xl p-8 shadow-2xl"
          >
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Account Information
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Create your login credentials
                  </p>

                  <div className="space-y-4">
                    <Input
                      label="Email Address"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      error={errors.email}
                      icon={<Mail className="h-4 w-4" />}
                      placeholder="student@htu.edu"
                    />
                    
                    <div className="relative">
                      <Input
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        error={errors.password}
                        icon={<Lock className="h-4 w-4" />}
                        placeholder="Minimum 8 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-10 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    <div className="relative">
                      <Input
                        label="Confirm Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirm_password"
                        value={formData.confirm_password}
                        onChange={handleChange}
                        required
                        error={errors.confirm_password}
                        icon={<Lock className="h-4 w-4" />}
                        placeholder="Re-enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-10 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Personal Information
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Tell us about yourself
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                      error={errors.first_name}
                      icon={<User className="h-4 w-4" />}
                      placeholder="John"
                    />
                    
                    <Input
                      label="Last Name"
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      error={errors.last_name}
                      icon={<User className="h-4 w-4" />}
                      placeholder="Doe"
                    />
                  </div>

                  <Input
                    label="Phone Number (Optional)"
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    error={errors.phone_number}
                    icon={<Mail className="h-4 w-4" />}
                    placeholder="+63 912 345 6789"
                  />
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.form
                  key="step3"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Academic Information
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Enter your student details
                  </p>

                  <div className="space-y-4">
                    <Input
                      label="Student ID"
                      type="text"
                      name="student_id"
                      value={formData.student_id}
                      onChange={handleChange}
                      required
                      error={errors.student_id}
                      icon={<BookOpen className="h-4 w-4" />}
                      placeholder="2023-00123"
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          College
                        </label>
                        <div className="relative">
                          <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <select
                            name="college_id"
                            value={formData.college_id}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                          >
                            <option value="">Select College</option>
                            {/* FIXED: Added parentheses for typed parameter */}
                            {colleges.map((college: College) => (
                              <option key={college.id} value={college.id}>
                                {college.name} ({college.code})
                              </option>
                            ))}
                          </select>
                        </div>
                        {errors.college_id && (
                          <p className="mt-1 text-sm text-red-600">{errors.college_id}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Program
                        </label>
                        <div className="relative">
                          <BookOpen className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <select
                            name="program_id"
                            value={formData.program_id}
                            onChange={handleChange}
                            disabled={!formData.college_id || filteredPrograms.length === 0}
                            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                          >
                            <option value="">Select Program</option>
                            {/* FIXED: Added parentheses for typed parameter */}
                            {filteredPrograms.map((program: Program) => (
                              <option key={program.id} value={program.id}>
                                {program.name} ({program.code})
                              </option>
                            ))}
                          </select>
                        </div>
                        {errors.program_id && (
                          <p className="mt-1 text-sm text-red-600">{errors.program_id}</p>
                        )}
                        {!loadingData && formData.college_id && filteredPrograms.length === 0 && (
                          <p className="mt-1 text-sm text-amber-600">
                            No programs available for this college
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Year Level
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <select
                            name="year_level"
                            value={formData.year_level}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                          >
                            {YEAR_LEVELS.map((level) => (
                              <option key={level.value} value={level.value}>
                                {level.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <Input
                        label="Admission Year"
                        type="number"
                        name="admission_year"
                        value={formData.admission_year}
                        onChange={handleChange}
                        required
                        error={errors.admission_year}
                        icon={<Calendar className="h-4 w-4" />}
                        placeholder="2023"
                        min="2000"
                        max={new Date().getFullYear()}
                      />

                      <Input
                        label="Section (Optional)"
                        type="text"
                        name="section"
                        value={formData.section}
                        onChange={handleChange}
                        icon={<User className="h-4 w-4" />}
                        placeholder="A"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Important Information</p>
                        <p>By registering, you agree to our Terms of Service and acknowledge that your information will be used in accordance with our Privacy Policy.</p>
                      </div>
                    </div>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="mt-8 flex justify-between">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </Button>
              ) : (
                <Link href="/login">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Login</span>
                  </Button>
                </Link>
              )}

              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                >
                  Continue to Next Step
                </Button>
              ) : (
                <Button
                  type="submit"
                  loading={loading}
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  Complete Registration
                </Button>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-indigo-600 hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-center text-sm text-gray-500"
          >
            <p>© {new Date().getFullYear()} Holy Trinity University. All rights reserved.</p>
            <p className="mt-1">Student Registration Portal v1.0</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}