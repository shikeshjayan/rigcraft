import { useState, useRef, Fragment } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMutation } from '@tanstack/react-query';
import { GoogleLogin } from '@react-oauth/google';
import { authService } from '../services/auth.service';
import { isGoogleOAuthEnabled } from '../utils/googleOAuth';
import handleAuthSuccess from '../utils/authSuccess';
import FadeUp from '../components/FadeUp';
import DynamicLogo from '../components/DynamicLogo';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useToast } from '../components/toast/useToast';

const Customerlogin = () => {
  const [step, setStep] = useState('login'); // 'login' or 'otp' or 'password'
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [consent, setConsent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const { login } = useAuth();
  const navigate = useNavigate();
  const inputRefs = useRef([]);
  const { toast } = useToast();

  const checkMutation = useMutation({
    mutationFn: authService.checkAccount,
    onSuccess: () => setStep('password'),
    onError: (err) => setError(err?.response?.data?.message || 'No account found with this email.')
  });

  const sendOtpMutation = useMutation({
    mutationFn: (data) => authService.login(data),
    onSuccess: () => setStep('otp'),
    onError: (err) => setError(err?.response?.data?.message || 'No account found with this phone number.')
  });

const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      if (data && data.success && data.data) {
         const { user } = data.data;
        toast(`Welcome back${user.firstName ? `, ${user.firstName}` : ''}!`);
        handleAuthSuccess(user, navigate, login);
      }
    },
    onError: (err) => {
      setError(err?.response?.data?.message || 'Invalid credentials. Please try again.');
    }
  });

  const googleLoginMutation = useMutation({
    mutationFn: authService.googleLogin,
    onSuccess: (data) => {
      if (data && data.success && data.data) {
         const { user } = data.data;
        toast(`Welcome back${user.firstName ? `, ${user.firstName}` : ''}!`);
        handleAuthSuccess(user, navigate, login);
      }
    },
    onError: (err) => {
      setError(err?.response?.data?.message || 'Google sign-in failed. Please try again.');
    }
  });

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!consent) {
      setError('Please agree to the Terms & Conditions and Privacy Policy to continue.');
      return;
    }
    const val = identifier.trim();
    if (val === '') {
      setError('Please enter a mobile number or email id.');
      return;
    }

    // Check if it's a mobile number (only digits)
    const isMobile = /^\+91 \d+$/.test(val);

    if (isMobile) {
      const phoneDigits = val.replace(/^\+91 /, '');
      if (!/^\d{10}$/.test(phoneDigits)) {
        setError('Please enter a valid 10-digit mobile number.');
        return;
      }
      sendOtpMutation.mutate({ phone: `+91${phoneDigits}` });
    } else {
      if (!val.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }
      checkMutation.mutate(val);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!consent) {
      setError('Please agree to the Terms & Conditions and Privacy Policy to continue.');
      return;
    }
    if (password.trim() !== '') {
      loginMutation.mutate({ email: identifier, password, rememberMe });
    }
  };

  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Move to previous input on backspace if current is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!consent) {
      setError('Please agree to the Terms & Conditions and Privacy Policy to continue.');
      return;
    }
    const otpString = otp.join('');
    if (otpString.length === 6) {
      const phoneDigits = identifier.replace(/\D/g, '').replace(/^91/, '');
      loginMutation.mutate({ phone: `+91${phoneDigits}`, otp: otpString, rememberMe });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <FadeUp className="w-full">
        <div className="max-w-md w-full mx-auto min-h-[680px] flex flex-col space-y-8 bg-white p-10 shadow-[0_10px_40px_rgba(0,0,0,0.08)]" style={{ borderRadius: 'var(--radius-sm)' }}>
          {/* Logo */}
          <div className="flex justify-center">
            <DynamicLogo />
          </div>

          <div className="flex-1 flex flex-col justify-center">
          {step === 'login' && (
            <>
              <div>
                <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900">
                  Sign in to your account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                  To continue checking out or saving items
                </p>
              </div>

              <form className="mt-8 space-y-6" onSubmit={handleLoginSubmit}>
                <div className="shadow-sm -space-y-px" style={{ borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <label htmlFor="identifier" className="sr-only">
                      Mobile number or email id
                    </label>
                    <input
                      id="identifier"
                      name="identifier"
                      type="text"
                      required
                      className={`appearance-none relative block w-full px-4 py-3 border ${error ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors`}
                      style={{ borderRadius: 'var(--radius-sm)' }}
                      placeholder="Mobile number or email id"
                      value={identifier}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const stripped = raw.replace(/^\+91\s*/, '');
                        if (/^\d*$/.test(stripped)) {
                          setIdentifier(stripped ? `+91 ${stripped}` : '');
                        } else {
                          setIdentifier(stripped);
                        }
                        setError('');
                      }}
                    />
                  </div>
                </div>
                {error && <p className="mt-2 text-center text-sm text-red-600 font-medium">{error}</p>}

                <div className="flex items-start gap-2">
                  <input
                    id="consent"
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => {
                      setConsent(e.target.checked);
                      if (e.target.checked) setError('');
                    }}
                    className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="consent" className="text-xs text-gray-600 leading-relaxed cursor-pointer">
                    I agree to RigCraft's{' '}
                    <Link to="/terms-of-service" className="font-medium text-blue-600 hover:text-blue-500 whitespace-nowrap">Conditions of Use</Link>{' '}
                    and{' '}
                    <Link to="/privacy-policy" className="font-medium text-blue-600 hover:text-blue-500 whitespace-nowrap">Privacy Notice</Link>.
                  </label>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={checkMutation.isPending || sendOtpMutation.isPending}
                    className={`group relative cursor-pointer w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold text-white bg-[var(--color-primary)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] transition-all shadow-md ${(checkMutation.isPending || sendOtpMutation.isPending) ? 'opacity-70 cursor-not-allowed' : ''}`}
                    style={{ borderRadius: 'var(--radius-sm)' }}
                  >
                    {(checkMutation.isPending || sendOtpMutation.isPending) ? 'Checking...' : 'Continue'}
                  </button>
                </div>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or continue with</span>
                  </div>
                </div>

                <div className="relative mt-4">
                  <div className={`flex justify-center ${consent ? '' : 'pointer-events-none'}`}>
                    {isGoogleOAuthEnabled() ? (
                      <GoogleLogin
                        onSuccess={({ credential }) => googleLoginMutation.mutate(credential)}
                        onError={() => setError('Google sign-in failed. Please try again.')}
                        width="100%"
                        shape="rectangular"
                        text="continue_with"
                        theme="outline"
                      />
                    ) : (
                      <p className="text-center text-sm text-gray-500">
                        Google sign-in is unavailable right now. Please use your mobile number or email instead.
                      </p>
                    )}
                  </div>
                  {!consent && (
                    <button
                      type="button"
                      aria-label="Agree to terms first"
                      onClick={() => setError('Please agree to the Terms & Conditions and Privacy Policy before signing in with Google.')}
                      className="absolute inset-0 w-full cursor-pointer bg-transparent"
                    />
                  )}
                </div>
              </div>

              <div className="mt-6 text-center">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">New to RigCraft?</span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={(e) => { e.preventDefault(); navigate('/register'); }}
                    className="w-full flex justify-center cursor-pointer py-3 px-4 border border-gray-300 shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    style={{ borderRadius: 'var(--radius-sm)' }}
                  >
                    Create your RigCraft account
                  </button>
                </div>
              </div>
            </>
          )}

          {step === 'otp' && (
            <>
              <div>
                <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900">
                  Verify Mobile Number
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                  We've sent a 6-digit code to <span className="font-bold text-black">{identifier}</span>
                </p>
              </div>

              <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
                <div className="flex justify-center items-center gap-2">
                  {otp.map((digit, index) => (
                    <Fragment key={index}>
                      <input
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        inputMode="numeric"
                        className="w-11 h-12 text-center text-xl font-bold border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-colors"
                        style={{ borderRadius: 'var(--radius-sm)' }}
                      />
                      {index === 2 && <span className="text-gray-400 font-bold mx-1">-</span>}
                    </Fragment>
                  ))}
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className={`group relative cursor-pointer w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold text-white bg-[var(--color-primary)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] transition-all shadow-md ${loginMutation.isPending ? 'opacity-70 cursor-not-allowed' : ''}`}
                    style={{ borderRadius: 'var(--radius-sm)' }}
                  >
                    {loginMutation.isPending ? 'Verifying...' : 'Verify'}
                  </button>
                  {error && step === 'otp' && <p className="mt-2 text-center text-sm text-red-600 font-medium">{error}</p>}
                </div>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => setStep('login')}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 cursor-pointer"
                  >
                    Change mobile number
                  </button>
                </div>
              </form>
            </>
          )}

          {step === 'password' && (
            <>
              <div>
                <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900">
                  Sign in
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                  <span className="font-bold text-black">{identifier}</span>
                    <button
                    type="button"
                    onClick={() => setStep('login')}
                    className="ml-2 text-blue-600 hover:text-blue-500 font-medium cursor-pointer"
                  >
                    Change
                  </button>
                </p>
              </div>

              <form className="mt-8 space-y-6" onSubmit={handlePasswordSubmit}>
                <div className="shadow-sm -space-y-px" style={{ borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <label htmlFor="password" className="sr-only">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                         className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors pr-10 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                        style={{ borderRadius: 'var(--radius-sm)' }}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600 z-20"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    Remember me
                  </label>
                  <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    Forgot password?
                  </Link>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className={`group relative cursor-pointer w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold text-white bg-[var(--color-primary)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] transition-all shadow-md ${loginMutation.isPending ? 'opacity-70 cursor-not-allowed' : ''}`}
                    style={{ borderRadius: 'var(--radius-sm)' }}
                  >
                    {loginMutation.isPending ? 'Logging in...' : 'Login'}
                  </button>
                  {error && step === 'password' && <p className="mt-2 text-center text-sm text-red-600 font-medium">{error}</p>}
                </div>
              </form>
            </>
          )}
          </div>
        </div>
      </FadeUp>
    </div>
  );
};

export default Customerlogin;
