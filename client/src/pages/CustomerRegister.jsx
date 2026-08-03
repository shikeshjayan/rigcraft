import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { GoogleLogin } from '@react-oauth/google';
import { authService } from '../services/auth.service';
import { isGoogleOAuthEnabled } from '../utils/googleOAuth';
import { useAuth } from '../context/AuthContext';
import handleAuthSuccess from '../utils/authSuccess';
import FadeUp from '../components/FadeUp';
import DynamicLogo from '../components/DynamicLogo';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useToast } from '../components/toast/useToast';

const CustomerRegister = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    consent: false
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      if (data && data.success && data.data) {
         const { user } = data.data;
        toast('Account created successfully.');
        handleAuthSuccess(user, navigate, login);
      }
    }
  });

  const googleLoginMutation = useMutation({
    mutationFn: authService.googleLogin,
    onSuccess: (data) => {
      if (data && data.success && data.data) {
         const { user } = data.data;
        handleAuthSuccess(user, navigate, login);
      }
    },
    onError: (err) => {
      setErrors((prev) => ({
        ...prev,
        google: err?.response?.data?.message || 'Google sign-in failed. Please try again.',
      }));
    }
  });

  const handleChange = (e) => {
    if (e.target.name === 'phone') {
      const digits = e.target.value.replace(/[^0-9]/g, '').replace(/^91/, '');
      const formatted = digits ? `+91 ${digits}` : '';
      setFormData(prev => ({ ...prev, phone: formatted }));
      setErrors(prev => ({ ...prev, phone: '' }));
      registerMutation.reset();
      return;
    }
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    registerMutation.reset();
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required.';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required.';

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.phone) {
      newErrors.phone = 'Mobile number is required.';
    } else if (!/^\+91 \d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid mobile number.';
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

    if (!formData.consent) {
      newErrors.consent = 'Please agree to the Terms & Conditions and Privacy Policy.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone.replace(/\s/g, ''),
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
            <DynamicLogo />
          </div>
          
          <div>
            <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900">
              Create Account
            </h2>
          </div>

          <div className="relative mt-6">
            <div className={formData.consent ? '' : 'pointer-events-none'}>
              {isGoogleOAuthEnabled() ? (
                <GoogleLogin
                  onSuccess={({ credential }) => googleLoginMutation.mutate(credential)}
                  onError={() => setErrors((prev) => ({ ...prev, google: 'Google sign-in failed. Please try again.' }))}
                  width="100%"
                  shape="rectangular"
                  text="signup_with"
                  theme="outline"
                />
              ) : (
                <p className="text-center text-sm text-gray-500">
                  Google sign-up is unavailable right now. Please use the email form below instead.
                </p>
              )}
            </div>
            {!formData.consent && (
              <button
                type="button"
                aria-label="Agree to terms first"
                onClick={() => setErrors((prev) => ({ ...prev, google: 'Please agree to the Terms & Conditions and Privacy Policy before continuing.' }))}
                className="absolute inset-0 w-full cursor-pointer bg-transparent"
              />
            )}
            {errors.google && (
              <p className="mt-2 text-center text-sm text-red-600 font-medium">{errors.google}</p>
            )}
            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or sign up with email</span>
              </div>
            </div>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleRegisterSubmit}>
            <div className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    id="firstName"
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
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    id="lastName"
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
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input
                  id="email"
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
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className={`appearance-none relative block w-full px-4 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors`}
                  style={{ borderRadius: 'var(--radius-sm)' }}
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />
                {errors.phone && <p className="mt-1 text-xs text-red-600 font-medium">{errors.phone}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className={`appearance-none relative block w-full px-4 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors pr-10 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden`}
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
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`appearance-none relative block w-full px-4 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors pr-10 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden`}
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
                className={`group relative cursor-pointer w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold text-white bg-[var(--color-primary)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] transition-all shadow-md ${registerMutation.isPending || !formData.consent ? 'opacity-70 cursor-not-allowed' : ''}`}
                style={{ borderRadius: 'var(--radius-sm)' }}
              >
                {registerMutation.isPending ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
            <div>
              <div className="flex items-start gap-2">
                <input
                  id="consent"
                  name="consent"
                  type="checkbox"
                  checked={formData.consent}
                  onChange={handleChange}
                  className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="consent" className="text-xs text-gray-600 leading-relaxed cursor-pointer">
                  I agree to RigCraft's{' '}
                  <Link to="/terms-of-service" className="font-medium text-blue-600 hover:text-blue-500 whitespace-nowrap">Conditions of Use</Link>{' '}
                  and{' '}
                  <Link to="/privacy-policy" className="font-medium text-blue-600 hover:text-blue-500 whitespace-nowrap">Privacy Notice</Link>.
                </label>
              </div>
              {errors.consent && <p className="mt-1 text-xs text-red-600 font-medium">{errors.consent}</p>}
            </div>
            
            <div className="text-center mt-4">
              <span className="text-sm text-gray-600">Already have an account? </span>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm font-bold text-blue-600 hover:text-blue-500 cursor-pointer"
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
