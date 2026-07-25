import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { registerUser } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import FadeUp from '../components/FadeUp';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const CustomerRegister = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      if (data && data.success) {
        login(data.data.user);
        navigate('/');
      }
    }
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    registerMutation.reset();
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required.';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required.';

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!formData.email.endsWith('@gmail.com')) {
      newErrors.email = 'Please enter a valid @gmail.com email address.';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required.';
    } else if (!/^\d{10}$/.test(formData.mobile.trim())) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number.';
    }

    // Strict password regex based on backend requirements
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase, one lowercase, one number, and one special character (min 8 chars).';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.mobile, // map mobile to phone for backend
      password: formData.password,
      confirmPassword: formData.confirmPassword
    };
    
    registerMutation.mutate(payload);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <FadeUp>
        <div className="max-w-md w-full space-y-8 bg-white p-10 shadow-[0_10px_40px_rgba(0,0,0,0.08)]" style={{ borderRadius: 'var(--radius-sm)' }}>
          {/* Logo */}
          <div className="flex justify-center">
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tighter cursor-pointer" onClick={() => navigate('/')}>
              RIGCRAFT
            </h1>
          </div>
          
          <div>
            <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900">
              Create Account
            </h2>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleRegisterSubmit}>
            <div className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    name="firstName"
                    type="text"
                    className={`appearance-none relative block w-full px-4 py-2 border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors`}
                    style={{ borderRadius: 'var(--radius-sm)' }}
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                  {errors.firstName && <p className="mt-1 text-xs text-red-600 font-medium">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    name="lastName"
                    type="text"
                    className={`appearance-none relative block w-full px-4 py-2 border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors`}
                    style={{ borderRadius: 'var(--radius-sm)' }}
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                  {errors.lastName && <p className="mt-1 text-xs text-red-600 font-medium">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input
                  name="email"
                  type="email"
                  className={`appearance-none relative block w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors`}
                  style={{ borderRadius: 'var(--radius-sm)' }}
                  placeholder="name@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <p className="mt-1 text-xs text-red-600 font-medium">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <input
                  name="mobile"
                  type="text"
                  className={`appearance-none relative block w-full px-4 py-2 border ${errors.mobile ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors`}
                  style={{ borderRadius: 'var(--radius-sm)' }}
                  placeholder="10-digit mobile number"
                  value={formData.mobile}
                  onChange={handleChange}
                />
                {errors.mobile && <p className="mt-1 text-xs text-red-600 font-medium">{errors.mobile}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className={`appearance-none relative block w-full px-4 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors pr-10`}
                    style={{ borderRadius: 'var(--radius-sm)' }}
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-600 font-medium">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`appearance-none relative block w-full px-4 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors pr-10`}
                    style={{ borderRadius: 'var(--radius-sm)' }}
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-600 font-medium">{errors.confirmPassword}</p>}
              </div>
            </div>

            {registerMutation.isError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm font-medium text-center shadow-sm">
                {registerMutation.error?.response?.data?.message || 'An unexpected error occurred. Please try again.'}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={registerMutation.isPending}
                className={`group relative cursor-pointer w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold text-white bg-[var(--color-primary)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] transition-all shadow-md ${registerMutation.isPending ? 'opacity-70 cursor-not-allowed' : ''}`}
                style={{ borderRadius: 'var(--radius-sm)' }}
              >
                {registerMutation.isPending ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
            
            <div className="text-center mt-4">
              <span className="text-sm text-gray-600">Already have an account? </span>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm font-bold text-blue-600 hover:text-blue-500"
              >
                Sign In
              </button>
            </div>

          </form>
        </div>
      </FadeUp>
    </div>
  );
};

export default CustomerRegister;
