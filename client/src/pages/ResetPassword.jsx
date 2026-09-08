import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import FadeUp from '../components/FadeUp';
import DynamicLogo from '../components/DynamicLogo';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const resetMutation = useMutation({
    mutationFn: (resetData) => authService.resetPassword(resetData),
    onSuccess: () => {
      sessionStorage.setItem(
        'rigcraft_pending_toast',
        JSON.stringify({ message: 'Password reset successful. Please sign in with your new password.', type: 'success' })
      );
      navigate('/login');
    },
    onError: (err) => {
      setErrors({ general: err?.response?.data?.message || 'Invalid or expired reset token.' });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
    if (!password) {
      setErrors({ password: 'Password is required.' });
      return;
    }
    if (!passwordRegex.test(password)) {
      setErrors({ password: 'Password must contain at least one uppercase, one lowercase, one number, and one special character (min 8 chars).' });
      return;
    }
    if (!confirmPassword) {
      setErrors({ confirmPassword: 'Please confirm your password.' });
      return;
    }
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match.' });
      return;
    }

    resetMutation.mutate({ token, password });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <FadeUp className="w-full">
        <div className="max-w-md w-full mx-auto min-h-[680px] flex flex-col space-y-8 bg-white p-10 shadow-[0_10px_40px_rgba(0,0,0,0.08)]" style={{ borderRadius: 'var(--radius-sm)' }}>
          <div className="flex justify-center">
            <DynamicLogo />
          </div>

          <div className="flex-1 flex flex-col justify-center">
          <div>
            <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900">
              Reset Password
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter your new password below.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className={`appearance-none relative block w-full px-4 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors pr-10 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden`}
                    style={{ borderRadius: 'var(--radius-sm)' }}
                    placeholder="New password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: '' })); }}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600 z-20"
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
                    className={`appearance-none relative block w-full px-4 py-3 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors pr-10 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden`}
                    style={{ borderRadius: 'var(--radius-sm)' }}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setErrors(prev => ({ ...prev, confirmPassword: '' })); }}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600 z-20"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-600 font-medium">{errors.confirmPassword}</p>}
              </div>
            </div>

            {errors.general && (
              <p className="text-sm text-red-600 font-medium text-center">
                {errors.general}
              </p>
            )}

            <div>
              <button
                type="submit"
                disabled={resetMutation.isPending}
                className={`group relative cursor-pointer w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold text-white bg-[var(--color-primary)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] transition-all shadow-md ${resetMutation.isPending ? 'opacity-70 cursor-not-allowed' : ''}`}
                style={{ borderRadius: 'var(--radius-sm)' }}
              >
                {resetMutation.isPending ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>

            <div className="text-center mt-4">
              <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                Back to Sign In
              </Link>
            </div>
          </form>
          </div>
        </div>
      </FadeUp>
    </div>
  );
};

export default ResetPassword;